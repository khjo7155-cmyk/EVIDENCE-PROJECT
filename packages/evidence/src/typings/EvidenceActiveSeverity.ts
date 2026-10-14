/**
 * Diagnostic severities that leave an obligation enabled in a resolved plan.
 *
 * Configuration planning drops `off` entries before graph evaluation. The two
 * remaining values differ in report severity, but both retain their population
 * in the denominator and can make a check fail according to policy.
 *
 * @evidence contracts/common.md#principled-implementation Excluding off from the union encodes at the type level that planning has already removed disabled entries before evaluation.
 * @evidence contracts/common.md#clear-and-simple-design It narrows EvidenceSeverity for post-planning code instead of adding runtime checks for a state that cannot occur there.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The union restates no configuration; it only removes the value planning drops.
 * @evidence contracts/common.md#meaningful-documentation The comment explains where off is removed and that both remaining levels keep their population in the denominator.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceActiveSeverity = "warning" | "error";
