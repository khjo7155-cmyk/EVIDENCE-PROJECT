/**
 * Distinguishes public declarations from implementation and extension sites.
 *
 * Reconciliation uses the form to determine which physical records can
 * establish an identity and which can only contribute compatible implementation
 * content.
 *
 * @evidence contracts/common.md#principled-implementation The literals distinguish declarations that can establish an identity (interface, protocol, category) from implementation and extension sites that only contribute content.
 * @evidence contracts/common.md#clear-and-simple-design Reconciliation in the adapter interprets the form.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No form lets an implementation create a public identity on its own.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how reconciliation uses the form.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceObjcDeclarationForm =
  | "interface"
  | "protocol"
  | "category"
  | "extension"
  | "implementation"
  | "method"
  | "property"
  | "ivar"
  | "function";
