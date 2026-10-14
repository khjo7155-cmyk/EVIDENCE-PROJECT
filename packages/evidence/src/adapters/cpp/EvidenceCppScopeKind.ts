/**
 * Identifies a C++ declaration owner that establishes structural graph scope.
 *
 * Nested scanning carries this kind with the scope path to determine member
 * ownership and the public address shape of declarations it contains.
 *
 * @evidence contracts/common.md#principled-implementation Namespace and record kinds decide member ownership and address shape.
 * @evidence contracts/common.md#clear-and-simple-design The scanner carries the kind with the scope path.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported forms are diagnosed by the scanner rather than represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCppScopeKind =
  "namespace" | "class" | "struct" | "union" | "enum";
