/**
 * Execution-local controls for immutable grammar acquisition.
 *
 * These options influence one caller's memory cache and transfer lifetime; they
 * do not alter catalog provenance or the bytes accepted into the shared cache.
 *
 * @evidence contracts/common.md#principled-implementation Fetch, timeout, attempts, signal, progress and a memory namespace are the execution-local controls of grammar acquisition.
 * @evidence contracts/common.md#clear-and-simple-design Options configure acquisition only; caching and verification live in the cache.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts cacheDirectory is only a memory namespace selector and is never used as a filesystem path.
 * @evidence contracts/common.md#meaningful-documentation The comment explains execution-local scope; each option documents its default.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceTreeSitterAssetOptions {
  /**
   * Legacy namespace for isolating the process-local grammar cache.
   *
   * Omission uses `EVID_CACHE_DIR` when set, then the default memory namespace.
   * The value is never accessed as a filesystem path. Grammars live only in
   * memory, including when this option or the legacy environment variable is
   * set.
   *
   * @deprecated Retained for caller isolation; it no longer enables disk
   *   caching.
   */
  cacheDirectory?: string;

  /**
   * HTTP transport used to fetch a missing grammar asset.
   *
   * Omission uses the platform fetch implementation. Tests and embedding
   * callers can supply a transport without changing checksum verification or
   * cache keys.
   */
  fetch?: typeof globalThis.fetch;

  /**
   * Maximum duration of one transfer, including its response body, in
   * milliseconds.
   *
   * Omission defaults to 30 seconds. The limit applies to each attempt rather
   * than the caller's complete retry lifetime.
   */
  timeoutMilliseconds?: number;

  /**
   * Maximum transfer attempts allowed for transient acquisition failures.
   *
   * Omission defaults to three. Shared callers join one immutable transfer, so
   * this bound controls its retries instead of multiplying requests per
   * caller.
   */
  attempts?: number;

  /**
   * Signal that stops this caller's wait for a grammar acquisition.
   *
   * Aborting one waiter does not cancel other callers sharing the immutable
   * transfer; the cache cancels transfer work only after every waiter leaves.
   */
  signal?: AbortSignal | undefined;

  /**
   * Caller-owned sink for grammar acquisition progress messages.
   *
   * Omission keeps library acquisition silent. The cache reports progress
   * through this callback without writing to process output or changing
   * transfer results.
   */
  progress?: ((message: string) => void) | undefined;
}
