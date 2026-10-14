/**
 * Connects a Javadoc carrier to one physical Java declaration site.
 *
 * EvidenceJavaFileScanner records this source adjacency, and
 * EvidenceJavaAdapter maps the local declaration to a reconciled unit without
 * sharing the comment across overloads.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs a Javadoc carrier with one declaration site, so a comment is not shared across overloads.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter maps it to a unit.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceJavaDocumentationAttachment {
  /**
   * Scanner-local declaration receiving this Javadoc carrier.
   *
   * Materialization maps it to a reconciled semantic unit.
   */
  declarationId: string;

  /**
   * Physical site that owns an evidence host for the declaration.
   *
   * This avoids treating comments as transferable among overloads.
   */
  siteId: string;
}
