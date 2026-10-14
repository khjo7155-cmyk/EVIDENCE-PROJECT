/**
 * Identifies the supported Ruby container form backed by a constant path.
 *
 * EvidenceRubyAdapter compares this form when reconciling reopened
 * declarations. A class and module with the same identity cannot form one
 * semantic container.
 *
 * @evidence contracts/common.md#principled-implementation Class and module kinds are compared when reconciling reopenings.
 * @evidence contracts/common.md#clear-and-simple-design A class and module with the same identity are reported rather than merged.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language form outside the documented set is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceRubyContainerKind = "class" | "module";
