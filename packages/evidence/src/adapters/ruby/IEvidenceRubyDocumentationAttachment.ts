/**
 * Links one Ruby documentation carrier to a declaration site.
 *
 * Attachment remains keyed to scanner records until compatible reopenings merge
 * into one public unit, which can have several physical documentation sites.
 *
 * @evidence contracts/common.md#principled-implementation An attachment links a carrier to a declaration site, so merged reopenings can keep several documentation sites.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRubyDocumentationAttachment {
  /**
   * Scanner identity of the declaration receiving this comment.
   *
   * EvidenceRubyAdapter converts it to a published semantic unit before parsing
   * tags.
   */
  declarationId: string;

  /**
   * Physical declaration-site identity shared by co-located accessors.
   *
   * Hosts group this site once even when it contributes to multiple units.
   */
  siteId: string;
}
