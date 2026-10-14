/**
 * Associates parsed DocC with one Swift declaration site.
 *
 * The scanner keeps this relation separate from comment mappings so semantic
 * assembly can attach documentation without losing its source range.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs parsed DocC with one declaration site.
 * @evidence contracts/common.md#clear-and-simple-design The scanner establishes it; semantic assembly consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSwiftDocumentationAttachment {
  /**
   * Identifies the declaration that owns the attached DocC mapping.
   *
   * This extraction identity remains stable while the adapter constructs units
   * and their documentation references.
   */
  declarationId: string;

  /**
   * Identifies the declaration site at which the DocC comment appears.
   *
   * The site disambiguates extensions and other declarations contributing to
   * the same semantic unit.
   */
  siteId: string;
}
