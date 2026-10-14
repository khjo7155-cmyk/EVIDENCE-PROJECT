/**
 * Records one scanner-approved ownership link from XML documentation to a C#
 * declaration site.
 *
 * IEvidenceCSharpDocumentation stores these physical links while parsing is
 * still close to source syntax. EvidenceCSharpAdapter resolves the declaration
 * record to a published semantic unit and groups links by site when it creates
 * evidence hosts.
 *
 * @evidence contracts/common.md#principled-implementation An attachment links a carrier to a scanner-local declaration and its physical site.
 * @evidence contracts/common.md#clear-and-simple-design The adapter resolves the declaration to a unit.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCSharpDocumentationAttachment {
  /**
   * Identifies the scanner-local declaration that receives this XML
   * documentation.
   *
   * EvidenceCSharpAdapter looks up this key in its published-declaration map to
   * find the semantic unit. It is not a stable unit ID because partial
   * declarations can later merge into one family.
   */
  declarationId: string;

  /**
   * Identifies the physical declaration site that owns the resulting evidence
   * host.
   *
   * Grouping by this value keeps documentation attached to the source
   * occurrence that established adjacency, so separate partial declarations
   * cannot borrow each other's comments.
   */
  siteId: string;
}
