import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidencePhpDocumentationAttachment } from "./IEvidencePhpDocumentationAttachment";

/**
 * Retains one PHPDoc carrier, including a carrier whose placement is
 * unsupported.
 *
 * The adapter preserves unsupported tagged text as a diagnostic host so
 * directives cannot disappear merely because no eligible declaration receives
 * the comment.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps PHPDoc, including unsupported placements, so directives never disappear silently.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter parses them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePhpDocumentation {
  /**
   * Stable scanner identity for this documentation region.
   *
   * It distinguishes host records even when nearby declarations share a site.
   */
  id: string;

  /**
   * Original UTF-16 range occupied by the PHPDoc comment.
   *
   * Annotation ranges exclude it from declaration review fingerprints.
   */
  range: IEvidenceSourceRange;

  /**
   * Delimiter and tag-boundary rules used to map the carrier's text.
   *
   * EvidencePhpDocumentation also uses this classification to mask examples
   * without moving offsets.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Declaration sites to which this carrier is immediately attached.
   *
   * A comment can serve multiple units at one site before withdrawal hides
   * descendants.
   */
  attachments: IEvidencePhpDocumentationAttachment[];
}
