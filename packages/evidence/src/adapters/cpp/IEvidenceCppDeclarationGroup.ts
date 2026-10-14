import type { IEvidenceCppDeclaration } from "./IEvidenceCppDeclaration";

/**
 * Collects C++ declaration occurrences that materialize one semantic unit.
 *
 * EvidenceCppAdapter builds these groups from scanner records using `id`, then
 * uses their declarations to determine public ownership, validate compatible
 * declaration and definition families, and construct the unit's sites. It
 * bridges physical IEvidenceCppDeclaration records and the final Evidence
 * inventory.
 *
 * @evidence contracts/common.md#principled-implementation A group collects occurrences of one identity to validate declaration and definition families and build sites.
 * @evidence contracts/common.md#clear-and-simple-design The adapter builds and checks groups.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCppDeclarationGroup {
  /**
   * Semantic unit ID shared by every declaration in this group.
   *
   * EvidenceCppAdapter derives it from the declarations' symbol and qualified
   * identity before using it as the unit ID and as the key for public-group
   * selection.
   */
  id: string;

  /**
   * Physical declaration occurrences assigned to the semantic unit.
   *
   * The adapter compares their forms, visibility, and definitions before it
   * copies selected sites and public addresses into the materialized unit.
   */
  declarations: IEvidenceCppDeclaration[];
}
