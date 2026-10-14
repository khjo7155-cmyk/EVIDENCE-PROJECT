/**
 * Supported Java source form that establishes one semantic declaration.
 *
 * The Java scanner records this form to apply the correct visibility,
 * ownership, and materialization rules to nominal types and their members.
 *
 * @evidence contracts/common.md#principled-implementation The literals name each Java source form that establishes a declaration, so visibility and ownership rules apply per form.
 * @evidence contracts/common.md#clear-and-simple-design The scanner assigns forms; materialization interprets them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported forms have no literal.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why forms are recorded.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceJavaDeclarationForm =
  | "class"
  | "interface"
  | "enum"
  | "annotation"
  | "record"
  | "method"
  | "field"
  | "interface-constant"
  | "record-component"
  | "enum-constant"
  | "annotation-element";
