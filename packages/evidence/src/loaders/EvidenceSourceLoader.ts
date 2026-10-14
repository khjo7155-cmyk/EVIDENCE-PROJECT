import { EvidenceFileGlob } from "../internal/EvidenceFileGlob";
import { EvidenceSourceCollector } from "../internal/EvidenceSourceCollector";
import type { IEvidenceSourceSelection } from "../structures/IEvidenceSourceSelection";
import type { IEvidenceSourceSnapshot } from "../structures/IEvidenceSourceSnapshot";

/**
 * Loads source snapshots that adapter analysis can classify and parse.
 *
 * Configuration planning supplies a selection, then the checker uses this
 * boundary to preserve both discovered files and recoverable filesystem
 * failures. The loader does not decide language support: selected unsupported
 * files remain in the snapshot so the applicable adapter can produce its own
 * diagnostic.
 *
 * @example
 *   const snapshot: IEvidenceSourceSnapshot =
 *     await EvidenceSourceLoader.glob("evidence.config.ts", {
 *       files: ["src/*.ts"],
 *     });
 *
 * @evidence contracts/common.md#principled-implementation Population discovery is a thin boundary over the source collector, keeping recoverable filesystem failures in the snapshot for watch.
 * @evidence contracts/common.md#clear-and-simple-design Language support is decided by adapters; the loader only captures sources.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported selected files stay in the snapshot so their adapter reports them.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the boundary with an example.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceSourceLoader {
  /**
   * Discovers every path selected by one enabled population.
   *
   * Relative patterns and the optional root are anchored to `configFile`.
   * Invalid selector syntax rejects before scanning, while read, traversal, and
   * snapshot failures are collected in an incomplete result. This distinction
   * lets graph evaluation fail safely without losing paths needed for watch
   * recovery.
   *
   * @evidence contracts/common.md#principled-implementation Globs are compiled first (rejecting invalid syntax), then a collector scans the configured root and returns its snapshot.
   * @evidence contracts/common.md#clear-and-simple-design Compilation and scanning are delegated to EvidenceFileGlob and EvidenceSourceCollector.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Read and traversal failures become an incomplete snapshot instead of throwing.
   * @evidence contracts/common.md#meaningful-documentation The comment explains anchoring and the two failure classes.
   * @evidence contracts/performance.md#efficient-algorithms Linear in visited entries, with directory pruning.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each call captures the filesystem afresh.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The collector closes every file it opens; the snapshot is owned by the caller.
   */
  export async function glob(
    configFile: string,
    selection: IEvidenceSourceSelection,
  ): Promise<IEvidenceSourceSnapshot> {
    const globs = new EvidenceFileGlob(selection.files);
    const collector = new EvidenceSourceCollector(
      configFile,
      selection.root ?? ".",
    );
    await collector.scan(globs);
    return collector.snapshot();
  }

  /**
   * Captures one exact local file for an operation that names a path directly.
   *
   * The file may be outside `root`, unlike a glob population. Its resolved root
   * still supplies configuration-relative identity and location context, and
   * any filesystem failure is retained in the returned incomplete snapshot.
   *
   * @evidence contracts/common.md#principled-implementation One exact path is captured through the collector's exact mode, which may lie outside the root while keeping configuration-relative identity.
   * @evidence contracts/common.md#clear-and-simple-design Exact capture is delegated to the collector.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Filesystem failures are retained in an incomplete snapshot.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the out-of-root case and failure retention.
   * @evidence contracts/performance.md#efficient-algorithms Constant filesystem calls plus one read.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each call captures the file afresh.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The collector closes the file; the snapshot is owned by the caller.
   */
  export async function file(
    configFile: string,
    file: string,
    root: string = ".",
  ): Promise<IEvidenceSourceSnapshot> {
    const collector = new EvidenceSourceCollector(configFile, root);
    await collector.exact(file);
    return collector.snapshot();
  }
}
