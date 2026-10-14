import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceEcmaScriptCommentAttachment } from "./IEvidenceEcmaScriptCommentAttachment";

/**
 * Retains one parsed source comment and its scanner-established JSDoc
 * attachments.
 *
 * The adapter later materializes only attachments whose units become public, so
 * a comment resembling JSDoc cannot create evidence without an eligible
 * declaration.
 *
 * @evidence contracts/common.md#principled-implementation A parsed comment keeps its node-free range and every scanner-established attachment, so only comments on declarations that later become public can host evidence.
 * @evidence contracts/common.md#clear-and-simple-design The record links scanning to adapter materialization without holding Tree-sitter nodes.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEcmaScriptComment {
  /**
   * Stable identifier for this parsed comment within its source snapshot.
   *
   * Attachment processing uses the identifier to distinguish this comment from
   * other comments that may have the same text or nearby physical location.
   */
  id: string;

  /**
   * Physical source range occupied by the complete comment.
   *
   * Materialized documentation uses this range when the comment supplies a
   * claim, while the declaration host retains its own range when no comment
   * does.
   */
  range: IEvidenceSourceRange;

  /**
   * Parsed comment syntax used to interpret its Evidence annotations.
   *
   * The annotation parser receives this classification so it can apply the
   * language-appropriate JSDoc and line-comment rules.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Declaration carriers that the scanner determined this comment may document.
   *
   * Each entry preserves the semantic unit and physical site separately because
   * one declaration position may affect more than one unit.
   */
  attachments: IEvidenceEcmaScriptCommentAttachment[];
}
