/**
 * Associates parsed Scaladoc with one Scala declaration site.
 *
 * Scala scanning stores attachments separately from documentation mappings so
 * extraction can retain each comment's source range and every consuming site.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs parsed Scaladoc with one declaration site.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceScalaDocumentationAttachment {
  /**
   * Identifies the declaration that owns the attached documentation.
   *
   * Consumers use this extraction identity to connect the mapping before
   * semantic units are materialized.
   */
  declarationId: string;

  /**
   * Identifies the physical declaration site that received the comment.
   *
   * A declaration can have several sites, so this prevents attachment from
   * being inferred from semantic identity alone.
   */
  siteId: string;
}
