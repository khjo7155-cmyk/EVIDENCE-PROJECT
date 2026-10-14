import type { IEvidenceWatchCheckCycle } from "../structures/IEvidenceWatchCheckCycle";
import type { IEvidenceWatchFailureCycle } from "../structures/IEvidenceWatchFailureCycle";

/**
 * Published outcome of one debounced, stable watch attempt.
 *
 * A successful cycle contains a completed check report. A failed cycle retains
 * the operational failure separately so subscribers do not mistake a transient
 * scan/configuration error for a completed check with zero violations.
 *
 * @evidence contracts/common.md#principled-implementation A union of a completed check cycle and an operational failure cycle keeps transient failures distinct from a check with zero violations.
 * @evidence contracts/common.md#clear-and-simple-design Each cycle interface owns its payload; the alias only lets publishers handle both.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Failures are not converted into empty passing reports.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why failures stay separate from completed checks.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceWatchCycle =
  IEvidenceWatchCheckCycle | IEvidenceWatchFailureCycle;
