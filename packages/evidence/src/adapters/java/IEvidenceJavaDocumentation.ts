import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceJavaDocumentationAttachment } from "./IEvidenceJavaDocumentationAttachment";

/**
 * Retains a Javadoc carrier and its scanner-established declaration
 * attachments.
 *
 * EvidenceJavaAdapter consumes these physical records after scanning to create
 * evidence hosts and diagnose unsupported annotations without reparsing
 * comments.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps Javadoc and its declaration attachments for host creation without reparsing.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter consumes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceJavaDocumentation {
  /**
   * Stable physical-comment ID used by attachments and tag parsing.
   *
   * It does not identify a semantic Java declaration.
   */
  id: string;

  /**
   * Exact comment range retained for diagnostics and fingerprint exclusion.
   *
   * Only this span is decoded as a Javadoc annotation carrier.
   */
  range: IEvidenceSourceRange;

  /**
   * Delimiter details needed to read the Javadoc text accurately.
   *
   * Evidence parsing consumes this syntax instead of inferring comments again.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Declaration sites established by source adjacency during scanning.
   *
   * Later family reconciliation never widens this attachment relationship.
   */
  attachments: IEvidenceJavaDocumentationAttachment[];
}
