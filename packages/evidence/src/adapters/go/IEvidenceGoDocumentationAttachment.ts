/**
 * Connects a Go documentation carrier to one physical declaration site.
 *
 * EvidenceGoFileScanner establishes this adjacency, and EvidenceGoAdapter later
 * maps the local declaration to its package-wide unit without transferring the
 * comment.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs a comment carrier with one physical declaration site.
 * @evidence contracts/common.md#clear-and-simple-design The scanner establishes adjacency; the adapter maps it to package-wide units.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGoDocumentationAttachment {
  /**
   * Scanner-local declaration that owns the adjacent Go comment run.
   *
   * The adapter resolves it to a package-wide semantic unit later.
   */
  declarationId: string;

  /**
   * Physical declaration site that becomes the evidence host.
   *
   * A shared Go unit can still retain documentation at several source sites.
   */
  siteId: string;
}
