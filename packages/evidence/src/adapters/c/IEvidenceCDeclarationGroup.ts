import type { IEvidenceCDeclaration } from "./IEvidenceCDeclaration";

/**
 * Collects C declarations that claim one file-local semantic identity.
 *
 * The C adapter deliberately limits this group to one physical source file:
 * equal names in separate translation units do not prove C linkage equivalence.
 * Materialization uses the members to detect incompatible forms and duplicate
 * definitions before it publishes a single Evidence unit.
 *
 * @evidence contracts/common.md#principled-implementation A group collects declarations claiming one identity inside one physical file.
 * @evidence contracts/common.md#clear-and-simple-design The adapter checks forms and definitions within the group.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCDeclarationGroup {
  /**
   * File-qualified identifier shared by every member of the group.
   *
   * The adapter uses it as the materialized unit ID within this physical source
   * boundary.
   */
  id: string;

  /**
   * Declarations whose forms and definitions must be mutually compatible.
   *
   * Their sites and addresses become the selected unit only after validation
   * succeeds.
   */
  declarations: IEvidenceCDeclaration[];
}
