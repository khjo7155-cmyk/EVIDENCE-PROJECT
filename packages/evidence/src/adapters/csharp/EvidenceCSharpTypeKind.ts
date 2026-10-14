/**
 * Identifies the C# type context that governs nested ownership and visibility.
 *
 * The scanner carries this context into member extraction to apply
 * type-specific accessibility defaults and construct public address segments
 * consistently.
 *
 * @evidence contracts/common.md#principled-implementation The type kind decides member accessibility defaults, such as implicit public interface members.
 * @evidence contracts/common.md#clear-and-simple-design The scanner carries it into member extraction.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No form outside the documented C# surface is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCSharpTypeKind =
  "class" | "struct" | "interface" | "record" | "enum" | "delegate";
