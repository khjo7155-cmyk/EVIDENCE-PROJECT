/**
 * Connects one MATLAB help carrier to a physical declaration site.
 *
 * The pair distinguishes source attachment from a unit's semantic identity;
 * later ownership reconciliation may merge several sites into that one unit.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs a help carrier with the physical declaration site that will belong to a reconciled unit.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter consumes it after reconciliation.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceMatlabDocumentationAttachment {
  /**
   * Identifies the scanner-local declaration receiving this help carrier.
   *
   * Materialization resolves it to a semantic unit after class-folder ownership
   * is known.
   */
  declarationId: string;

  /**
   * Identifies the physical declaration site owned by the eventual semantic
   * unit.
   *
   * This keeps a shared class unit's source hosts distinct across selected
   * files.
   */
  siteId: string;
}
