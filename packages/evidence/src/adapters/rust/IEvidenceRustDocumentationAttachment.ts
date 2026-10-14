/**
 * Links a Rust documentation carrier to one declaration site.
 *
 * Its scanner-local identifiers allow the adapter to group shared sites after
 * aliases resolve without confusing documentation identity with public
 * address.
 *
 * @evidence contracts/common.md#principled-implementation An attachment uses scanner-local IDs so shared sites group after aliases resolve.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustDocumentationAttachment {
  /**
   * Scanner identity of the declaration receiving this documentation.
   *
   * The adapter resolves it to a published unit before tags can alter
   * withdrawals.
   */
  declarationId: string;

  /**
   * Shared physical-site identity for co-located units.
   *
   * It makes their documentation produce one host instead of duplicates.
   */
  siteId: string;
}
