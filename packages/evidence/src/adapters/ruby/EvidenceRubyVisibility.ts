/**
 * Represents Ruby method or constant visibility that the scanner can establish
 * statically.
 *
 * EvidenceRubyFileScanner updates it in source order, and EvidenceRubyAdapter
 * publishes only public records while retaining unsupported visibility changes
 * as diagnostics.
 *
 * @evidence contracts/common.md#principled-implementation The three Ruby visibilities are updated in source order and only public records are published.
 * @evidence contracts/common.md#clear-and-simple-design The scanner sets visibility; the adapter filters by it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language form outside the documented set is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceRubyVisibility = "private" | "protected" | "public";
