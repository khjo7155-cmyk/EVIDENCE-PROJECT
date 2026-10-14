/**
 * Enumerates C source forms that can establish an Evidence declaration.
 *
 * Materialization uses the form to determine compatible repeats, ownership, and
 * public address policy. Unsupported syntax is diagnosed by the scanner instead
 * of being coerced into one of these categories.
 *
 * @evidence contracts/common.md#principled-implementation The literals name each supported C form (tags, typedef, function, object, field, enumerator) that decides compatible repeats and address policy.
 * @evidence contracts/common.md#clear-and-simple-design The scanner assigns forms; materialization interprets them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported syntax is diagnosed rather than coerced into a value.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCDeclarationForm =
  | "struct"
  | "union"
  | "enum"
  | "typedef"
  | "function"
  | "object"
  | "field"
  | "enumerator";
