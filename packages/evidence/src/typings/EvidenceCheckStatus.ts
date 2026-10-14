/**
 * Whether a check had complete enough input to make a coverage decision.
 *
 * `incomplete` protects callers from treating an interrupted scan, failed
 * dependency, or unavailable parser result as a successful empty population.
 * `complete` says evaluation reached a final result; it does not itself mean
 * that every obligation passed.
 *
 * @evidence contracts/common.md#principled-implementation A separate completeness flag keeps an interrupted or failed analysis distinguishable from a complete empty population, which a pass/fail result alone cannot express.
 * @evidence contracts/common.md#clear-and-simple-design Completeness is kept apart from success so reporters and callers combine the two decisions explicitly.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The incomplete state exists so failed discovery is never reported as passing; nothing is compensated or hidden.
 * @evidence contracts/common.md#meaningful-documentation The comment states what incomplete protects against and that complete does not imply passing.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCheckStatus = "complete" | "incomplete";
