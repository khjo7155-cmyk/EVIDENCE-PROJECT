/**
 * Connects one Doxygen carrier to a physical Objective-C declaration site.
 *
 * Interface and implementation records may later share a semantic unit, but
 * this attachment retains the exact source site that owns the annotation.
 *
 * @evidence contracts/common.md#principled-implementation An attachment keeps the exact site owning a Doxygen carrier even when sites later share a unit.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceObjcDocumentationAttachment {
  /**
   * Physical declaration receiving the documentation.
   *
   * The adapter resolves this extraction ID to its published unit when
   * possible.
   */
  declarationId: string;

  /**
   * Eligible declaration site containing the carrier.
   *
   * This retains the exact source host when declarations later merge.
   */
  siteId: string;
}
