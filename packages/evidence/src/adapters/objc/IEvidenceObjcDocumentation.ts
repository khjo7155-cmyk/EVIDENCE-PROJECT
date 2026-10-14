import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceObjcDocumentationAttachment } from "./IEvidenceObjcDocumentationAttachment";

/**
 * Represents a Doxygen documentation carrier or unsupported annotation-bearing
 * comment.
 *
 * Attachment is determined before interface and implementation sites merge, so
 * tagged ordinary comments remain available for an accurate host diagnostic.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps Doxygen or tag-bearing ordinary comments decided before sites merge.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter parses them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceObjcDocumentation {
  /**
   * Stable physical carrier identifier.
   *
   * It keeps this comment distinct before its attachments are reconciled.
   */
  id: string;

  /**
   * Original UTF-16 range, including comment delimiters.
   *
   * Documentation mapping and host coordinates use this unmodified source span.
   */
  range: IEvidenceSourceRange;

  /**
   * Mapped comment delimiters and withdrawal eligibility.
   *
   * Tag parsing uses the syntax mapping to preserve carrier-specific
   * boundaries.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Declaration sites receiving this carrier.
   *
   * Each attachment retains its physical owner before semantic-unit merging.
   */
  attachments: IEvidenceObjcDocumentationAttachment[];
}
