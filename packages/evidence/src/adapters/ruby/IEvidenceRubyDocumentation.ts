import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceRubyDocumentationAttachment } from "./IEvidenceRubyDocumentationAttachment";

/**
 * Retains one Ruby comment run and its declaration attachment candidates.
 *
 * EvidenceRubyAdapter attaches it after reopened declaration groups become
 * public, keeping tags on invalid positions available for diagnostics rather
 * than discarding them.
 *
 * @evidence contracts/common.md#principled-implementation A comment run keeps either its syntax or a precomputed mapping plus attachment candidates.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter attaches them after grouping.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRubyDocumentation {
  /**
   * Stable identity for the source documentation region.
   *
   * It becomes the evidence-host ID after attachment or unsupported-host
   * creation.
   */
  id: string;

  /**
   * Original text range occupied by the comment run.
   *
   * Annotation ranges exclude this text from associated site fingerprints.
   */
  range: IEvidenceSourceRange;

  /**
   * Delimiter rules used to map raw text when scanning did not precompute a
   * mapping.
   *
   * Omission means `mapping` supplies normalized content for tag parsing.
   */
  syntax?: IEvidenceCommentSyntax;

  /**
   * Precomputed documentation mapping when the carrier needs custom
   * normalization.
   *
   * The adapter uses this instead of syntax to retain original tag coordinates.
   */
  mapping?: IEvidenceDocumentation;

  /**
   * Declaration sites immediately documented by this carrier.
   *
   * Public-group and withdrawal filtering determine the final host membership.
   */
  attachments: IEvidenceRubyDocumentationAttachment[];
}
