/**
 * Identifies a C++ declaration that projects another unit into a local address.
 *
 * The scanner distinguishes namespace aliases from using declarations because
 * each resolves its target and contributes public address segments
 * differently.
 *
 * @evidence contracts/common.md#principled-implementation Namespace aliases and using declarations resolve targets and contribute segments differently.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records the kind; the adapter resolves by it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported forms are diagnosed by the scanner rather than represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCppAliasKind = "namespace" | "using";
