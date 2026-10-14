/**
 * Broad research category for a non-certified language candidate.
 *
 * `embedded-format` marks syntax normally nested inside another source
 * artifact; `programming-language` marks a potential top-level adapter. This
 * classification guides certification work and does not change an active
 * configuration.
 *
 * @evidence contracts/common.md#principled-implementation Two literals separate formats embedded in another artifact from potential top-level languages, which need different certification work.
 * @evidence contracts/common.md#clear-and-simple-design The alias only classifies research records and has no effect on active configuration.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No candidate is special-cased by the classification.
 * @evidence contracts/common.md#meaningful-documentation The comment defines both kinds and states that the classification does not change configuration.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceLanguageCandidateKind =
  "programming-language" | "embedded-format";
