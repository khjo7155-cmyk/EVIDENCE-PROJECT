import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceGoDocumentationAttachment } from "./IEvidenceGoDocumentationAttachment";

/**
 * Retains a Go documentation carrier and its scanner-established attachments.
 *
 * EvidenceGoAdapter reads these records after parsing closes to create
 * documentation hosts and report unsupported annotations without reinterpreting
 * the source.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps a comment and its attachments so hosts and unsupported annotations are created without reparsing.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter materializes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGoDocumentation {
  /**
   * Stable comment-run identifier referenced by scanner attachments.
   *
   * It identifies source text rather than a semantic package member.
   */
  id: string;

  /**
   * Exact source range decoded as documentation and excluded from fingerprints.
   *
   * The range also anchors diagnostics for unsupported annotations.
   */
  range: IEvidenceSourceRange;

  /**
   * Line-comment syntax used to recover normalized documentation text.
   *
   * Evidence parsing relies on this captured syntax after parsing closes.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Declaration sites accepted as the comment run's direct owners.
   *
   * Package reconciliation does not attach it to same-named declarations
   * elsewhere.
   */
  attachments: IEvidenceGoDocumentationAttachment[];
}
