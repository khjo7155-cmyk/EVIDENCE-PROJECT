/**
 * Enumerates C++ source forms that establish supported semantic declarations.
 *
 * EvidenceCppFileScanner uses the form to choose identity, ownership,
 * visibility, and address behavior while unsupported grammar forms remain
 * incomplete diagnostics.
 *
 * @evidence contracts/common.md#principled-implementation The literals name each supported C++ form, with constructors, destructors and operators kept separate from ordinary functions.
 * @evidence contracts/common.md#clear-and-simple-design The scanner assigns forms; the adapter validates families by them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported forms are diagnosed by the scanner rather than represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCppDeclarationForm =
  | "namespace"
  | "class"
  | "struct"
  | "union"
  | "enum"
  | "alias"
  | "typedef"
  | "concept"
  | "function"
  | "constructor"
  | "destructor"
  | "operator"
  | "conversion"
  | "variable"
  | "field"
  | "static-field"
  | "enumerator";
