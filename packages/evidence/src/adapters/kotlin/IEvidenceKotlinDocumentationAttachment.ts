/**
 * Connects a KDoc carrier to one extracted Kotlin declaration site.
 *
 * EvidenceKotlinFileScanner establishes this adjacency from source, then the
 * documentation pass uses the pair to evaluate annotations for the relevant
 * site without assigning the comment semantic ownership.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs a KDoc carrier with the declaration site it is adjacent to.
 * @evidence contracts/common.md#clear-and-simple-design The scanner establishes adjacency; the documentation pass consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceKotlinDocumentationAttachment {
  /**
   * Identifies the declaration extraction record that receives the KDoc.
   *
   * Consumers use this stable scanner-local ID to recover the declaration whose
   * annotation is evaluated.
   */
  declarationId: string;

  /**
   * Identifies the physical declaration site covered by the KDoc.
   *
   * This distinguishes the adjacent source occurrence when one semantic unit
   * has more than one declaration site.
   */
  siteId: string;
}
