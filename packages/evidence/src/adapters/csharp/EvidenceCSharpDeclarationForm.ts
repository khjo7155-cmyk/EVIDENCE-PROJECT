/**
 * Enumerates C# source forms that establish supported semantic declarations.
 *
 * EvidenceCSharpFileScanner uses the form to select identity and ownership
 * rules before public accessibility filtering determines the published graph
 * population.
 *
 * @evidence contracts/common.md#principled-implementation The literals name each supported C# declaration form so identity and ownership rules apply per form.
 * @evidence contracts/common.md#clear-and-simple-design The scanner assigns forms; the adapter reconciles by them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No form outside the documented C# surface is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCSharpDeclarationForm =
  | "class"
  | "struct"
  | "interface"
  | "record"
  | "record-struct"
  | "enum"
  | "delegate"
  | "method"
  | "field"
  | "property"
  | "event"
  | "enum-member"
  | "indexer"
  | "operator"
  | "conversion-operator";
