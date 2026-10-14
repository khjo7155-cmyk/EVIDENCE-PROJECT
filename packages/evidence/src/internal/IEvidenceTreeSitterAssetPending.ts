/**
 * One process-wide transfer shared by callers targeting the same immutable
 * memory cache entry.
 *
 * Consumer accounting lets an individual cancellation return promptly while
 * transfer work continues for peers, then aborts only after the final waiter
 * leaves.
 *
 * @evidence contracts/common.md#principled-implementation A shared promise, its abort controller and a consumer count let concurrent callers share one transfer and cancel it only when every consumer leaves.
 * @evidence contracts/common.md#clear-and-simple-design The record holds transfer state; acquisition logic is in EvidenceTreeSitterAssetCache.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Cancellation follows the consumer count instead of any single caller's signal.
 * @evidence contracts/common.md#meaningful-documentation The comment explains sharing; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The record chooses no algorithm; the cache owns transfer and verification.
 * @evidence contracts/performance.md#reuse-equivalent-work One pending record per immutable asset key lets concurrent callers await the same in-flight transfer instead of downloading again.
 * @evidence contracts/performance.md#bound-retention-and-release-resources The consumer count bounds the transfer's lifetime: the cache aborts it and deletes the record when the last consumer leaves.
 */
export interface IEvidenceTreeSitterAssetPending {
  /**
   * Promise for verified bytes after successful acquisition into memory.
   *
   * Each joining caller awaits this shared result, so checksum verification and
   * retention run once for the immutable cache entry.
   */
  promise: Promise<Uint8Array>;

  /**
   * Controller that cancels transfer work after every waiting consumer leaves.
   *
   * A single caller's cancellation removes only its own wait and leaves the
   * shared transfer available to remaining consumers.
   */
  controller: AbortController;

  /**
   * Number of callers still awaiting this transfer's result.
   *
   * Asset-cache cancellation decrements this count and aborts the controller
   * only when it reaches zero.
   */
  consumers: number;
}
