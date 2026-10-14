import path from "node:path";
import { Singleton } from "tstl";
import typia from "typia";

import { EvidenceParserError } from "../parsers/EvidenceParserError";
import type { IEvidenceGrammar } from "../structures/IEvidenceGrammar";
import type { IEvidenceTreeSitterAssetOptions } from "./IEvidenceTreeSitterAssetOptions";
import { EvidenceTreeSitterAssetCache } from "./EvidenceTreeSitterAssetCache";
import { EvidenceTreeSitterAssetScope } from "./EvidenceTreeSitterAssetScope";
import grammars from "./parser-grammars.json";

/**
 * Reads compiled grammar provenance and lazily acquires verified pinned bytes.
 *
 * Metadata validation occurs before memory-cache-key or URL use so a corrupted
 * package catalog cannot redirect downloads outside the asset boundary. Runtime
 * acquisition never reads or writes a disk cache.
 *
 * @evidence contracts/common.md#principled-implementation Pinned metadata is validated with typia and lexical path and URL checks before it can select a memory cache key or download URL; bytes come from a verified in-memory cache.
 * @evidence contracts/common.md#clear-and-simple-design The class owns catalog validation and delegates acquisition to EvidenceTreeSitterAssetCache; scope controls are merged once in the constructor.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsafe records (absolute or traversing paths, non-HTTPS or credentialed URLs, duplicate IDs) are rejected rather than tolerated.
 * @evidence contracts/common.md#meaningful-documentation The class comment states the validation order and the no-disk rule; every public and private member is documented.
 * @evidence contracts/performance.md#efficient-algorithms Catalog validation is linear in the roughly thirty pinned records and runs once per process.
 * @evidence contracts/performance.md#reuse-equivalent-work The pinned catalog is validated once through a module Singleton and every call receives a clone of that result; byte acquisition reuses the process-wide cache keyed by digest.
 * @evidence contracts/performance.md#bound-retention-and-release-resources Instances hold only their cache facade. The module retains one validated copy of the small pinned catalog for the process; grammar bytes are retained by the shared asset cache, which owns their lifetime.
 */
export class EvidenceTreeSitterAssets {
  /**
   * Caches grammar bytes under the inherited and constructor-provided
   * acquisition controls.
   *
   * The constructor creates this instance after merging scope controls with
   * local overrides, so every bytes request follows the same policy.
   */
  private readonly cache: EvidenceTreeSitterAssetCache;

  /**
   * Captures optional acquisition overrides without accessing grammar assets.
   *
   * Scope controls supply defaults, and explicit constructor options take
   * precedence before a later bytes call resolves a cache entry or download.
   */
  public constructor(options: IEvidenceTreeSitterAssetOptions = {}) {
    this.cache = new EvidenceTreeSitterAssetCache({
      ...EvidenceTreeSitterAssetScope.current(),
      ...options,
    });
  }

  /**
   * Returns validated grammar metadata without initializing WASM or acquiring
   * bytes.
   *
   * Consumers can inspect the compiled catalog safely because it is validated
   * before any record is returned, and each call receives its own copy.
   *
   * @evidence contracts/common.md#principled-implementation Returning a clone of the validated catalog exposes metadata without initializing WASM or acquiring bytes.
   * @evidence contracts/common.md#clear-and-simple-design Listing delegates validation to the module catalog Singleton.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid catalogs fail with asset-manifest instead of returning partial lists.
   * @evidence contracts/common.md#meaningful-documentation The comment states that listing performs no acquisition.
   * @evidence contracts/performance.md#efficient-algorithms Linear in catalog size for the clone; validation is paid once per process.
   * @evidence contracts/performance.md#reuse-equivalent-work Every call reuses the once-validated catalog and clones it so callers cannot mutate the shared result.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The method keeps no state after returning; its result is owned by the caller.
   */
  public async list(): Promise<IEvidenceGrammar[]> {
    return structuredClone(CATALOG.get());
  }

  /**
   * Resolves one validated pinned grammar by its catalog ID.
   *
   * This lookup does not prepare or load the WASM bytes; unknown IDs become an
   * asset-manifest error with repair guidance.
   *
   * @evidence contracts/common.md#principled-implementation A lookup by ID over the validated catalog returns one grammar record or a typed asset-manifest error.
   * @evidence contracts/common.md#clear-and-simple-design The method only looks up; it does not acquire bytes.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unknown IDs fail with repair guidance instead of falling back to another grammar.
   * @evidence contracts/common.md#meaningful-documentation The comment states that lookup does not load WASM.
   * @evidence contracts/performance.md#efficient-algorithms Linear in catalog size.
   * @evidence contracts/performance.md#reuse-equivalent-work It looks up the once-validated catalog and clones only the matching record.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The method keeps no state after returning; its result is owned by the caller.
   */
  public async grammar(id: string): Promise<IEvidenceGrammar> {
    const grammar: IEvidenceGrammar | undefined = CATALOG.get().find(
      (entry: IEvidenceGrammar): boolean => entry.id === id,
    );
    if (grammar === undefined)
      throw new EvidenceParserError(
        "asset-manifest",
        id,
        `The parser catalog has no ${id} grammar. Restore the package's pinned catalog.`,
      );
    return structuredClone(grammar);
  }

  /**
   * Obtains a caller-owned copy of verified grammar bytes from the immutable
   * cache.
   *
   * Input is cloned and validated before cache acquisition, preventing unsafe
   * metadata from selecting a memory cache key or network destination.
   *
   * @evidence contracts/common.md#principled-implementation The input is cloned and asserted with typia, then validated, before the cache selects a key or URL from it.
   * @evidence contracts/common.md#clear-and-simple-design Validation stays here; transfer, verification and caching stay in the cache.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Caller metadata is never trusted before validation.
   * @evidence contracts/common.md#meaningful-documentation The comment explains why validation precedes cache acquisition.
   * @evidence contracts/performance.md#efficient-algorithms Validation is constant per record; transfer cost is bounded by the pinned size and paid only on a cache miss.
   * @evidence contracts/performance.md#reuse-equivalent-work The cache shares completed and in-flight bytes per digest across all callers.
   * @evidence contracts/performance.md#bound-retention-and-release-resources Each call returns a caller-owned copy; the cache owns the retained bytes.
   */
  public async bytes(input: IEvidenceGrammar): Promise<Uint8Array> {
    const grammar = structuredClone(typia.assert(input));
    validate(grammar);
    return this.cache.bytes(grammar);
  }
}

/**
 * Validated pinned catalog shared by every asset provider in the process.
 *
 * The imported JSON is immutable, so validating it once is sufficient. A
 * failing validation is not memoized and throws again on the next request.
 */
const CATALOG: Singleton<IEvidenceGrammar[]> = new Singleton(readCatalog);

/**
 * Validates the packaged grammar pins and rejects duplicate identifiers.
 *
 * The catalog Singleton calls this before metadata is exposed, ensuring each
 * grammar has safe provenance paths and credential-free HTTPS asset URLs. The
 * pins are imported from parser-grammars.json as a plain module; no payload
 * bytes are read here.
 */
function readCatalog(): IEvidenceGrammar[] {
  try {
    const entries: IEvidenceGrammar[] = typia.assert<IEvidenceGrammar[]>(
      structuredClone(grammars),
    );
    const ids: Set<string> = new Set<string>();
    for (const entry of entries) {
      if (ids.has(entry.id))
        throw new Error(`Duplicate grammar ID: ${entry.id}`);
      ids.add(entry.id);
      validate(entry);
    }
    return entries;
  } catch (cause) {
    throw new EvidenceParserError(
      "asset-manifest",
      "grammar-catalog",
      "The compiled grammar catalog is invalid. Restore this package's parser metadata.",
      undefined,
      { cause },
    );
  }
}

/**
 * Rejects unsafe asset metadata before it chooses a filesystem key or network
 * destination.
 *
 * Both grammar WASM and license records require relative provenance paths and
 * credential-free HTTPS URLs to remain within the asset trust boundary.
 */
function validate(grammar: IEvidenceGrammar): void {
  for (const asset of [grammar.wasm, grammar.license]) {
    location(asset.file);
    const url: URL = new URL(asset.url);
    if (url.protocol !== "https:" || url.username !== "" || url.password !== "")
      throw new EvidenceParserError(
        "asset-manifest",
        grammar.id,
        "Parser assets require an HTTPS URL without credentials.",
      );
  }
}

/**
 * Requires a provenance path to remain relative on every supported platform.
 *
 * This lexical validation rejects empty, absolute, and parent-traversing paths
 * without requiring the referenced asset file to exist locally.
 */
function location(file: string): void {
  if (
    file === "" ||
    file.replaceAll("\\", "/").split("/").includes("..") ||
    path.posix.isAbsolute(file) ||
    path.win32.isAbsolute(file)
  )
    throw new EvidenceParserError(
      "asset-manifest",
      file,
      "A grammar provenance path must be relative and cannot traverse parent directories.",
    );
}
