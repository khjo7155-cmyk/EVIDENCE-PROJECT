import { createHash } from "node:crypto";
import type { BigIntStats, Dirent } from "node:fs";
import {
  lstat,
  readFile,
  readdir,
  readlink,
  realpath,
  stat,
} from "node:fs/promises";

import type { IEvidenceSourceDependency } from "../structures/IEvidenceSourceDependency";
import type { IEvidenceWatchContentDigest } from "./IEvidenceWatchContentDigest";

/**
 * Number of dependencies versioned concurrently during one capture.
 *
 * Bounded so a large watch set cannot exhaust file descriptors.
 */
const CAPTURE_CONCURRENCY: number = 16;

/**
 * Minimum age, in nanoseconds, a file's modification time must have before its
 * remembered digest is trusted.
 *
 * Three seconds exceeds the two-second timestamp granularity of the coarsest
 * supported filesystems, so an edit after the digest was taken always changes
 * the recorded modification time.
 */
const RACY_MARGIN_NANOSECONDS: bigint = 3_000_000_000n;

/**
 * Immutable filesystem versions used to validate a watch attempt before
 * publication.
 *
 * Versions include symlink and directory-entry state because either can change
 * which source is read; a content-only check would miss resolution changes.
 *
 * @evidence contracts/common.md#principled-implementation Each dependency's version combines lstat metadata, link target and real path, content hash or sorted directory entries, and encoded failures, so any change in what would be read alters the snapshot.
 * @evidence contracts/common.md#clear-and-simple-design Only capture and select construct snapshots; private helpers compute and encode versions.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Read failures become comparable state instead of being ignored, so repairs invalidate earlier snapshots.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains why link and directory state are included; every member and helper is documented.
 * @evidence contracts/performance.md#efficient-algorithms Capture versions dependencies with bounded parallelism, stats each path, lists recursive directories, and rereads a file only when its metadata changed or its modification is too recent to trust a remembered digest.
 * @evidence contracts/performance.md#reuse-equivalent-work Snapshots always observe current metadata, while a caller-owned digest map lets successive captures reuse content hashes of files whose metadata proves them unchanged under the racy-clean rule.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A snapshot retains only a map of version strings, owned by the watch attempt that captured it.
 */
export class EvidenceWatchDependencySnapshot {
  /**
   * Creates a snapshot from already captured dependency version strings.
   *
   * Capture and select are the only constructors because callers must not
   * invent values that would falsely validate a watch attempt.
   */
  private constructor(private readonly versions: ReadonlyMap<string, string>) {}

  /**
   * Captures every dependency asynchronously, encoding inaccessible paths as
   * observable failures.
   *
   * Watch publication compares this baseline with a later capture so deletion,
   * permission failure, and repair all count as distinct filesystem states. An
   * optional digest map owned by the caller lets later captures skip rereading
   * files whose metadata proves them unchanged.
   *
   * @evidence contracts/common.md#principled-implementation Each dependency is versioned under a key that includes its recursion, so a file watch cannot stand in for a directory observation.
   * @evidence contracts/common.md#clear-and-simple-design Capture composes version and key; snapshot comparison is equals.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Inaccessible paths are encoded as error states instead of throwing or being skipped.
   * @evidence contracts/common.md#meaningful-documentation The comment explains how deletion, permission failure and repair stay distinct.
   * @evidence contracts/performance.md#efficient-algorithms At most sixteen dependencies are versioned at once; with a digest map, unchanged files cost one stat instead of a full read and hash.
   * @evidence contracts/performance.md#reuse-equivalent-work A supplied digest map is consulted and updated, so content hashes carry over between captures of the same watcher.
   * @evidence contracts/performance.md#bound-retention-and-release-resources File contents are hashed and released immediately; the snapshot keeps version strings and the caller's digest map keeps one entry per watched file path, replaced on each reread.
   */
  public static async capture(
    dependencies: IEvidenceSourceDependency[],
    digests?: Map<string, IEvidenceWatchContentDigest>,
  ): Promise<EvidenceWatchDependencySnapshot> {
    const values: string[] = new Array<string>(dependencies.length);
    let next: number = 0;
    // Each worker claims the next unversioned dependency until none remain.
    async function worker(): Promise<void> {
      while (next < dependencies.length) {
        const index: number = next++;
        const dependency: IEvidenceSourceDependency | undefined =
          dependencies[index];
        if (dependency !== undefined)
          values[index] = await version(dependency, digests);
      }
    }
    await Promise.all(
      Array.from(
        { length: Math.min(CAPTURE_CONCURRENCY, dependencies.length) },
        worker,
      ),
    );
    // Insert in dependency order so equal inputs build identical maps.
    const versions: Map<string, string> = new Map<string, string>();
    dependencies.forEach(
      (dependency: IEvidenceSourceDependency, index: number): void => {
        versions.set(key(dependency), values[index] ?? "");
      },
    );
    return new EvidenceWatchDependencySnapshot(versions);
  }

  /**
   * States whether two snapshots cover the same dependencies at the same
   * versions.
   *
   * Watch attempts publish only when this equality holds, preventing output
   * from describing a source state that changed during analysis.
   *
   * @evidence contracts/common.md#principled-implementation Equal size and per-key equal values define equality between two captured maps.
   * @evidence contracts/common.md#clear-and-simple-design The method only compares.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No version component is ignored to make snapshots match.
   * @evidence contracts/common.md#meaningful-documentation The comment explains that publication depends on equality.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the number of dependencies.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each comparison is between two specific snapshots.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The comparison keeps no state after returning; its result is owned by the caller.
   */
  public equals(other: EvidenceWatchDependencySnapshot): boolean {
    if (this.versions.size !== other.versions.size) return false;
    for (const [location, value] of this.versions)
      if (other.versions.get(location) !== value) return false;
    return true;
  }

  /**
   * Returns a dependency subset captured by this stable baseline.
   *
   * Every requested key must exist in the baseline; omission throws rather than
   * allowing a narrower snapshot to validate unrelated watch work.
   *
   * @evidence contracts/common.md#principled-implementation Selecting a subset copies each requested key from the baseline and throws when one was never captured.
   * @evidence contracts/common.md#clear-and-simple-design Selection creates a new snapshot through the private constructor.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts A missing key throws rather than producing a narrower snapshot that could validate unrelated work.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the throw.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the requested dependencies with constant-time lookups.
   * @evidence contracts/performance.md#reuse-equivalent-work It reuses already captured versions instead of reading the filesystem again.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The new snapshot holds only copied version strings.
   */
  public select(
    dependencies: IEvidenceSourceDependency[],
  ): EvidenceWatchDependencySnapshot {
    const selected = new Map<string, string>();
    for (const dependency of dependencies) {
      const location = key(dependency);
      const value = this.versions.get(location);
      if (value === undefined)
        throw new Error(
          `Watch dependency '${dependency.path}' was not captured.`,
        );
      selected.set(location, value);
    }
    return new EvidenceWatchDependencySnapshot(selected);
  }
}

/**
 * Reads a stable watch version without throwing on ordinary filesystem
 * disappearance.
 *
 * Capture uses this value for each dependency so failures become comparable
 * state and a repaired path invalidates the prior failed snapshot.
 */
async function version(
  dependency: IEvidenceSourceDependency,
  digests: Map<string, IEvidenceWatchContentDigest> | undefined,
): Promise<string> {
  let link: BigIntStats;
  try {
    link = await lstat(dependency.path, { bigint: true });
  } catch (cause) {
    return failure(cause);
  }

  const values = [metadata(link)];
  let followed = link;
  if (link.isSymbolicLink()) {
    try {
      values.push(`link:${await readlink(dependency.path)}`);
      values.push(`real:${await realpath(dependency.path)}`);
      followed = await stat(dependency.path, { bigint: true });
      values.push(metadata(followed));
    } catch (cause) {
      values.push(failure(cause));
      return values.join("\u0001");
    }
  }
  try {
    if (followed.isFile())
      values.push(
        `content:${await contentDigest(dependency.path, followed, digests)}`,
      );
    else if (followed.isDirectory() && dependency.recursive)
      values.push(
        `entries:${(await readdir(dependency.path, { withFileTypes: true }))
          .sort(compareEntries)
          .map(entryVersion)
          .join("\u0000")}`,
      );
  } catch (cause) {
    values.push(failure(cause));
  }
  return values.join("\u0001");
}

/**
 * Returns a file's content digest, reusing a remembered one when it is safe.
 *
 * Reuse requires identical metadata and a modification time older than the read
 * time by more than the racy margin, the rule git applies to its index.
 * Otherwise the file is read and the remembered entry replaced. The read time
 * is taken before reading so an edit during the read is never trusted.
 */
async function contentDigest(
  file: string,
  info: BigIntStats,
  digests: Map<string, IEvidenceWatchContentDigest> | undefined,
): Promise<string> {
  const current: string = metadata(info);
  const remembered: IEvidenceWatchContentDigest | undefined =
    digests?.get(file);
  if (
    remembered !== undefined &&
    remembered.metadata === current &&
    remembered.readAt - remembered.modifiedAt > RACY_MARGIN_NANOSECONDS
  )
    return remembered.digest;
  const readAt: bigint = BigInt(Date.now()) * 1_000_000n;
  const digest: string = createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
  digests?.set(file, {
    metadata: current,
    modifiedAt: info.mtimeNs,
    readAt,
    digest,
  });
  return digest;
}

/**
 * Serializes metadata fields whose changes can affect filesystem resolution or
 * reads.
 *
 * File and link versions include this component before content or directory
 * entries so metadata-only replacement is observable to the watch baseline.
 */
function metadata(info: BigIntStats): string {
  return [
    info.mode,
    info.size,
    info.mtimeNs,
    info.ctimeNs,
    info.dev,
    info.ino,
  ].join(":");
}

/**
 * Encodes a directory entry's name and coarse type for recursive invalidation.
 *
 * Recursive directory versions use this value after sorting, so additions,
 * removals, and entry-type changes invalidate the dependency snapshot.
 */
function entryVersion(entry: Dirent): string {
  const kind = entry.isDirectory()
    ? "directory"
    : entry.isFile()
      ? "file"
      : entry.isSymbolicLink()
        ? "link"
        : "other";
  return `${kind}:${entry.name}`;
}

/**
 * Sorts directory entries before deterministic concatenation.
 *
 * Filesystem enumeration order is not stable, so version derives the same
 * string for an unchanged recursive directory across captures.
 */
function compareEntries(left: Dirent, right: Dirent): number {
  return left.name < right.name ? -1 : left.name > right.name ? 1 : 0;
}

/**
 * Distinguishes exact and recursive observations of the same filesystem path.
 *
 * Snapshot maps use this key so a file watch cannot be substituted for the
 * broader directory observation required by a recursive dependency.
 */
function key(dependency: IEvidenceSourceDependency): string {
  return `${dependency.recursive ? "recursive" : "exact"}:${dependency.path}`;
}

/**
 * Turns a failed filesystem read into versioned state.
 *
 * The encoded error lets later repair produce a different snapshot instead of
 * making disappearance invisible to the watch publication check.
 */
function failure(cause: unknown): string {
  return `error:${errorCode(cause)}:${errorMessage(cause)}`;
}

/**
 * Extracts a platform error code without assuming every thrown value is an
 * Error.
 *
 * Failure uses UNKNOWN for non-Error values and errors without string codes so
 * opaque exceptions still become stable observable watch state.
 */
function errorCode(cause: unknown): string {
  if (!(cause instanceof Error) || !("code" in cause)) return "UNKNOWN";
  const code: unknown = cause.code;
  return typeof code === "string" ? code : "UNKNOWN";
}

/**
 * Preserves a human-readable component for otherwise opaque watch failures.
 *
 * Together with errorCode, this distinguishes read failures in snapshot values
 * while retaining useful context for diagnostics and change detection.
 */
function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
