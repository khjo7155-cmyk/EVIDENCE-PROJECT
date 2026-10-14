/**
 * Connects a DartDoc carrier to one extracted declaration site.
 *
 * EvidenceDartFileScanner records source-adjacent attachments here, allowing
 * the documentation pass to evaluate one carrier against each declaration site
 * it governs without making the comment itself own a semantic unit.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs a DartDoc carrier with one declaration site it governs.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records adjacency; the documentation pass consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDartDocumentationAttachment {
  /**
   * Identifies the declaration extraction record that receives the DartDoc.
   *
   * Consumers use this stable scanner-local ID to find the declaration before
   * evaluating its annotation against the declaration's semantic unit.
   */
  declarationId: string;

  /**
   * Identifies the physical declaration site covered by the DartDoc.
   *
   * A semantic unit can have multiple sites, so this keeps attachment scoped to
   * the adjacent source occurrence instead of every site with the same unit
   * ID.
   */
  siteId: string;
}
