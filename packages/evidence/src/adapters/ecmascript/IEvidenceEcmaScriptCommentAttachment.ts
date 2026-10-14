/**
 * Connects a parsed JSDoc comment to one semantic declaration carrier.
 *
 * Comment materialization filters these records by public reachability and then
 * uses their physical and semantic identities to create claims or withdrawals.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs one JSDoc comment with the physical site and semantic unit it documents.
 * @evidence contracts/common.md#clear-and-simple-design Attachment is decided by the scanner and filtered by reachability in the adapter.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEcmaScriptCommentAttachment {
  /**
   * Eligible host-position key when this carrier can make evidence claims.
   *
   * Omission marks a withdrawal-only attachment such as a constructor comment.
   */
  positionId?: string;

  /**
   * Physical declaration site receiving the documentation.
   *
   * It remains separate from the unit so merged declarations retain attachment
   * truth.
   */
  siteId: string;

  /**
   * Semantic unit affected by this JSDoc carrier.
   *
   * Several units can share one physical host only when the scanner establishes
   * it.
   */
  unitId: string;

  /**
   * Limits the carrier to visibility withdrawal processing.
   *
   * Constructor documentation can hide parameter properties but cannot claim
   * evidence.
   */
  withdrawalOnly?: boolean;
}
