/**
 * Enumerates supported Rust source forms that establish semantic declarations.
 *
 * EvidenceRustFileScanner assigns these forms to lexical records.
 * EvidenceRustModuleResolver uses them to apply module, associated-item, and
 * public-occurrence ownership rules.
 *
 * @evidence contracts/common.md#principled-implementation The literals name each supported Rust item form, including tuple fields, so module and associated-item rules apply per form.
 * @evidence contracts/common.md#clear-and-simple-design The scanner assigns forms; the resolver applies ownership rules.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No form outside the documented Rust surface is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and resolver use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceRustDeclarationForm =
  | "module"
  | "struct"
  | "enum"
  | "trait"
  | "type-alias"
  | "function"
  | "constant"
  | "static"
  | "field"
  | "tuple-field"
  | "enum-variant"
  | "trait-method"
  | "trait-constant"
  | "trait-type"
  | "impl-method"
  | "impl-constant"
  | "impl-type";
