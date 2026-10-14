/**
 * Associates one Doxygen carrier with one eligible C declaration position.
 *
 * A declaration can expose several sites through grouped declarators, so the
 * declaration key alone is insufficient. The site key identifies the exact host
 * retained by inventory materialization.
 *
 * @evidence contracts/common.md#principled-implementation An attachment names the exact declaration site, since grouped declarators expose several sites per declaration.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCDocumentationAttachment {
  /**
   * Scanner-local declaration key for the semantic owner candidate.
   *
   * Materialization maps it to a selected unit only after declaration grouping.
   */
  declarationId: string;

  /**
   * Physical declaration site that accepts the preceding documentation.
   *
   * It prevents a shared declaration family from borrowing a different
   * occurrence's comment.
   */
  siteId: string;
}
