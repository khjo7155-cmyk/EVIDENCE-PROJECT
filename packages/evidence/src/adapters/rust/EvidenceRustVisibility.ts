/**
 * Represents source visibility relevant to Rust's externally reachable public
 * surface.
 *
 * EvidenceRustSyntax classifies modifiers into this reduced vocabulary.
 * EvidenceRustModuleResolver evaluates the value at module boundaries before it
 * publishes a declaration.
 *
 * @evidence contracts/common.md#principled-implementation Public, restricted (pub(crate) and similar), private and implicit visibility are the distinctions crate reachability needs.
 * @evidence contracts/common.md#clear-and-simple-design EvidenceRustSyntax classifies modifiers; the resolver evaluates them at module boundaries.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No form outside the documented Rust surface is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and resolver use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceRustVisibility =
  "public" | "restricted" | "private" | "implicit";
