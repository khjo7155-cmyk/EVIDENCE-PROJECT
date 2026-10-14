import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";

/**
 * Retains DBML enum semantics that affect dependent table fingerprints.
 *
 * Enums are not independently selectable Evidence units, so their semantic
 * content travels with declarations that refer to them.
 *
 * @evidence contracts/common.md#principled-implementation Enum values travel with dependent declarations because enums are not selectable units but affect table fingerprints.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records enums; the adapter folds them into digests.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDbmlEnum {
  /**
   * Names the enum using its qualified DBML identity.
   *
   * Identifier spelling is preserved for matching table-field references.
   */
  identity: string[];

  /**
   * Stores whitespace-independent enum tokens without documentation.
   *
   * This value contributes schema meaning while ignoring annotation-only
   * changes.
   */
  content: string;

  /**
   * Locates the enum declaration in the source file.
   *
   * Diagnostics use the range when an enum dependency cannot be applied.
   */
  range: IEvidenceSourceRange;
}
