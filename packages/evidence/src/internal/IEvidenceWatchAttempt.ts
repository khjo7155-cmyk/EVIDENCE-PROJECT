import type { IEvidenceSourceDependency } from "../structures/IEvidenceSourceDependency";
import type { EvidenceWatchCycle } from "../typings/EvidenceWatchCycle";

import type { EvidenceWatchDependencySnapshot } from "./EvidenceWatchDependencySnapshot";

/**
 * Stable unpublished result and dependency baseline for one watch attempt.
 *
 * Publication compares this snapshot after evaluation, preventing source edits
 * during an asynchronous check from being reported as a coherent cycle.
 *
 * @evidence contracts/common.md#principled-implementation A cycle, its dependencies, a dependency snapshot and a parser-retry flag let watch publish only results whose inputs stayed stable.
 * @evidence contracts/common.md#clear-and-simple-design The attempt holds data; stability comparison is in the watcher.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unstable attempts are discarded rather than published as coherent cycles.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the stability check; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceWatchAttempt {
  /**
   * Completed check or operational failure produced by the attempt.
   *
   * Watch publication exposes this result only after verifying that its
   * captured dependencies still match the associated snapshot.
   */
  cycle: EvidenceWatchCycle;

  /**
   * Full dependency set whose changes invalidate the unpublished result.
   *
   * This includes source and recoverable-missing dependencies needed to observe
   * repairs as well as ordinary content edits.
   */
  dependencies: IEvidenceSourceDependency[];

  /**
   * Captured versions proving those dependencies stayed stable during
   * evaluation.
   *
   * Comparing this snapshot before publication prevents an asynchronous check
   * from reporting a result for an already changed source graph.
   */
  snapshot: EvidenceWatchDependencySnapshot;

  /**
   * Whether parser preparation failed and should be retried independently of
   * source edits.
   *
   * A true value schedules recovery for transient parser setup failures even
   * when no watched source dependency changes.
   */
  retryParser: boolean;
}
