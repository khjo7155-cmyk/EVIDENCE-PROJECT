/**
 * Supported source form that establishes one Go semantic declaration.
 *
 * The Go scanner assigns this classification before materialization so type
 * aliases, members, and standalone declarations retain their distinct
 * semantics.
 *
 * @evidence contracts/common.md#principled-implementation The literals name each Go source form (defined type, alias, function, method, property, field, interface method) with distinct semantics.
 * @evidence contracts/common.md#clear-and-simple-design The scanner assigns forms; materialization interprets them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported forms have no literal and are reported instead.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why forms are kept distinct.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceGoDeclarationForm =
  | "defined-type"
  | "type-alias"
  | "function"
  | "method"
  | "property"
  | "field"
  | "interface-method";
