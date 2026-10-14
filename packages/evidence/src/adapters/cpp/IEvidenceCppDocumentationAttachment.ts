/**
 * Records one scanner-established relationship between documentation and a C++
 * declaration site.
 *
 * `EvidenceCppFileScanner` creates these records while source adjacency is
 * available. `EvidenceCppAdapter` uses the declaration ID to find the selected
 * unit and the site ID to create the physical documentation host, preserving
 * distinct overload and alias locations.
 *
 * @evidence contracts/common.md#principled-implementation An attachment names the declaration and exact site so overload and alias locations stay distinct.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter creates hosts from it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCppDocumentationAttachment {
  /**
   * Scanner-local declaration or alias record that receives the documentation.
   *
   * `EvidenceCppAdapter` resolves this ID to a selected semantic unit only
   * after family and alias reconciliation, so it is not itself a public address
   * or unit identity.
   */
  declarationId: string;

  /**
   * Physical declaration site at which the documentation becomes an evidence
   * host.
   *
   * This remains separate from `declarationId` because one selected unit can
   * have multiple source sites; grouping by this ID prevents a comment from
   * being attached to unrelated overload or alias locations.
   */
  siteId: string;
}
