/**
 * Enumerates Ruby source forms retained until public units are materialized.
 *
 * EvidenceRubyFileScanner assigns the form to each lexical record.
 * EvidenceRubyAdapter uses it with runtime names and ownership to apply
 * form-specific reopening and replacement rules.
 *
 * @evidence contracts/common.md#principled-implementation The literals name each supported Ruby source form so reopening and replacement rules apply per form.
 * @evidence contracts/common.md#clear-and-simple-design The scanner assigns forms; the adapter interprets them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language form outside the documented set is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceRubyDeclarationForm =
  | "alias"
  | "attribute"
  | "class"
  | "constant"
  | "method"
  | "module"
  | "module-function"
  | "singleton-method";
