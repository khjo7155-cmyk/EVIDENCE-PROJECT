import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceMatlabDocumentationAttachment } from "./IEvidenceMatlabDocumentationAttachment";

/**
 * Represents a MATLAB documentation carrier or tag-bearing unsupported carrier.
 *
 * MATLAB help placement has language-specific attachment rules, so this record
 * preserves both accepted help and tagged text that needs an actionable
 * failure.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps accepted help and tagged ineligible text with its comment syntax.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter parses them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceMatlabDocumentation {
  /**
   * Identifies this physical documentation carrier within one source analysis.
   *
   * Attachments use the key before ownership maps declarations to public units.
   */
  id: string;

  /**
   * Locates the half-open UTF-16 source span occupied by the help text.
   *
   * Inventory fingerprints exclude this range when reviewing documented
   * declarations.
   */
  range: IEvidenceSourceRange;

  /**
   * Describes comment delimiters and annotation rules used to parse this
   * carrier.
   *
   * EvidenceMatlabDocumentation relies on the syntax to preserve source offsets
   * while masking examples.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Lists physical declaration sites that directly own this help text.
   *
   * Unsupported tagged carriers remain unattached so the adapter can report
   * their placement.
   */
  attachments: IEvidenceMatlabDocumentationAttachment[];
}
