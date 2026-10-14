/**
 * Point-in-time view of a parser runtime's admission and grammar state.
 *
 * This supports lifecycle inspection without allocating a parser or loading a
 * grammar. Closing prevents new admission before accepted work finishes, so a
 * closed runtime can temporarily retain active sessions and queued requests.
 *
 * @evidence contracts/common.md#principled-implementation Active, waiting, loaded languages and closed state give a point-in-time view without acquiring resources.
 * @evidence contracts/common.md#clear-and-simple-design The record is a snapshot; it does not expose internal queues.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Reading state does not wait for parses or acquire assets.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the snapshot; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceParserState {
  /**
   * Number of currently reserved parse slots.
   *
   * A reservation includes asynchronous extraction work until its callback
   * settles.
   */
  active: number;

  /**
   * Number of accepted requests waiting for an available slot.
   *
   * These requests remain eligible to run after close begins draining the
   * queue.
   */
  waiting: number;

  /**
   * Sorted grammar IDs successfully loaded by this runtime.
   *
   * Pending or failed acquisitions are absent, even if other runtimes have
   * loaded the same grammar into a process-wide cache.
   */
  languages: string[];

  /**
   * Whether the runtime has stopped accepting new requests.
   *
   * This flag does not by itself mean every previously accepted callback
   * finished.
   */
  closed: boolean;
}
