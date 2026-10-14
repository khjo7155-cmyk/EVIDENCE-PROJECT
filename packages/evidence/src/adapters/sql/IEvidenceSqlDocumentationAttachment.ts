/**
 * Connects one SQL documentation carrier to a physical declaration site.
 *
 * This separate record lets a single leading comment acknowledge declarations
 * that share a source location, such as an inline relation and its column.
 *
 * @evidence contracts/common.md#principled-implementation An attachment links one carrier to one declaration site, letting a single comment document declarations sharing a location.
 * @evidence contracts/common.md#clear-and-simple-design Attachment is decided by scanners and consumed by the materializer.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed syntax; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSqlDocumentationAttachment {
  /**
   * Names the extraction record for the documented declaration.
   *
   * The value resolves within the file analysis that owns this attachment.
   */
  declarationId: string;

  /**
   * Names the physical site through which the semantic unit is documented.
   *
   * This remains distinct from `declarationId` when identities merge across
   * more than one site.
   */
  siteId: string;
}
