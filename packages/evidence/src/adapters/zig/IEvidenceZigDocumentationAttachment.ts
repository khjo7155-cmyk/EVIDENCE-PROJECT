/**
 * Associates parsed Zig documentation with one declaration site.
 *
 * The adapter stores this relation beside documentation mappings so semantic
 * assembly can preserve the original comment attachment.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs parsed documentation with one declaration site.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceZigDocumentationAttachment {
  /**
   * Identifies the declaration that owns the documentation mapping.
   *
   * Consumers use the extraction identity before assigning documentation to a
   * semantic unit.
   */
  declarationId: string;

  /**
   * Identifies the physical declaration site that receives the comment.
   *
   * This keeps attachment precise when one semantic unit has several sites.
   */
  siteId: string;
}
