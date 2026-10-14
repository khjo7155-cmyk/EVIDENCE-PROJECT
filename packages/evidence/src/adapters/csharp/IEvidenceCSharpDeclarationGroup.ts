import type { IEvidenceCSharpDeclaration } from "./IEvidenceCSharpDeclaration";

/**
 * Collects physical declarations that resolve to one C# semantic unit.
 *
 * `EvidenceCSharpAdapter` builds these groups while materializing a source
 * snapshot and checks the contained declarations for compatible partial or
 * overload forms. The group bridges scanner-local declaration records and the
 * single published Evidence unit, retaining every contributing site and address
 * candidate.
 *
 * @evidence contracts/common.md#principled-implementation A group collects the physical declarations of one semantic unit with their sites and addresses.
 * @evidence contracts/common.md#clear-and-simple-design The adapter builds and validates groups.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCSharpDeclarationGroup {
  /**
   * Semantic family key shared by compatible partial and overload declarations.
   *
   * It is used internally before the final unit is emitted.
   */
  id: string;

  /**
   * Physical declarations contributing sites and public address candidates.
   *
   * The adapter rejects incompatible families instead of guessing an owner.
   */
  declarations: IEvidenceCSharpDeclaration[];
}
