/**
 * Configured severity for one claim or reference obligation.
 *
 * `off` removes the entry during plan construction. `warning` and `error` keep
 * it active and control the diagnostic level emitted when evaluation finds an
 * unmet obligation; they are represented separately by
 * `EvidenceActiveSeverity`.
 *
 * @evidence contracts/common.md#principled-implementation Three levels follow the lint severity convention, where off removes an entry and warning or error keep it active.
 * @evidence contracts/common.md#clear-and-simple-design Post-planning code uses the narrower EvidenceActiveSeverity, so this alias only describes configuration input.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No level is reinterpreted for a particular consumer.
 * @evidence contracts/common.md#meaningful-documentation The comment explains what each level does during planning and evaluation and names the active subset type.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceSeverity = "off" | "warning" | "error";
