/**
 * Java type context that determines implicit member visibility.
 *
 * Member extraction carries this context because interfaces, annotations, and
 * other nominal forms supply different defaults when modifiers are omitted.
 *
 * @evidence contracts/common.md#principled-implementation The five nominal kinds carry the context that decides implicit member visibility when modifiers are omitted.
 * @evidence contracts/common.md#clear-and-simple-design The scanner passes the kind to member extraction.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Implicit visibility follows the Java language rules per kind.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why the kind is carried.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceJavaTypeKind =
  "class" | "interface" | "enum" | "annotation" | "record";
