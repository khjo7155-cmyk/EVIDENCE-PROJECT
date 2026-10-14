/**
 * Records whether C++ declaration visibility is known or deferred to
 * qualification.
 *
 * A qualified member requires later owner resolution, whereas public and
 * non-public declarations can be filtered directly from their lexical context.
 *
 * @evidence contracts/common.md#principled-implementation Public, non-public and qualified record whether visibility is known now or deferred to owner resolution for qualified definitions.
 * @evidence contracts/common.md#clear-and-simple-design The scanner sets it; the adapter resolves qualified cases.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported forms are diagnosed by the scanner rather than represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCppVisibility = "public" | "non-public" | "qualified";
