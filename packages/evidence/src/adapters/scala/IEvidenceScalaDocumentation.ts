import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceScalaDocumentationAttachment } from "./IEvidenceScalaDocumentationAttachment";

/**
 * Represents a Scala documentation carrier or tag-bearing unsupported carrier.
 *
 * Scaladoc remains tied to its physical declaration site while later export
 * resolution may add addresses for the same semantic declaration.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps Scaladoc or tag-bearing unsupported comments tied to their physical site.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter parses them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceScalaDocumentation {
  /**
   * Identifies this physical documentation carrier within its source analysis.
   *
   * Attachments use this key before the adapter materializes semantic units.
   */
  id: string;

  /**
   * Locates the half-open UTF-16 span occupied by the documentation carrier.
   *
   * Review fingerprints exclude this range from its attached declaration
   * content.
   */
  range: IEvidenceSourceRange;

  /**
   * Describes delimiters and annotation rules for parsing this carrier.
   *
   * Documentation mapping preserves these rules while masking ineligible
   * examples.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Lists physical declaration sites directly attached to this carrier.
   *
   * Unsupported tagged carriers remain unattached for diagnostic host creation.
   */
  attachments: IEvidenceScalaDocumentationAttachment[];
}
