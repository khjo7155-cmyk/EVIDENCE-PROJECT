import type { EvidenceWatchCycle } from "./EvidenceWatchCycle";

/**
 * Subscriber invoked for each stable watch cycle in publication order.
 *
 * Watch waits for a returned promise before publishing the next cycle. That
 * backpressure lets a consumer persist, display, or forward a report without
 * reordering results, while a synchronous subscriber may return `undefined`.
 *
 * @evidence contracts/common.md#principled-implementation A callback type whose returned promise is awaited gives the watcher ordered, backpressured publication.
 * @evidence contracts/common.md#clear-and-simple-design The publisher only receives cycles; scheduling and stability decisions stay in the watcher.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Returning unknown accepts synchronous subscribers without special-casing them.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the backpressure contract and the synchronous case.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A callback type chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A callback type computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A callback type acquires and holds no runtime resource; the watcher owns subscriber lifetimes.
 */
export type EvidenceWatchPublisher = (cycle: EvidenceWatchCycle) => unknown;
