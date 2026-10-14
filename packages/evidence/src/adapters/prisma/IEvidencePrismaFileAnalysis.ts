import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidencePrismaCommentRun } from "./IEvidencePrismaCommentRun";
import type { IEvidencePrismaLocation } from "./IEvidencePrismaLocation";

/**
 * Position-only scan of one Prisma schema source.
 *
 * This pass owns original ranges and comments; semantic declarations remain
 * owned by the whole-schema parser result.
 *
 * @evidence contracts/common.md#principled-implementation A position-only scan holds block and member locations and comment runs for one file.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the adapter joins it with parser output.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaFileAnalysis {
  /**
   * Immutable source snapshot whose coordinates the scan records.
   *
   * Every location and comment run in this analysis is valid only for this
   * exact content and supplies its physical identity to later materialization.
   */
  source: IEvidenceSourceFile;

  /**
   * Parser-matchable declaration spans in this physical file.
   *
   * These locations join parser-established model and field identities to their
   * source sites without giving the position scanner semantic ownership.
   */
  locations: IEvidencePrismaLocation[];

  /**
   * Consecutive comment runs available for documentation attachment.
   *
   * Attachment logic uses these physical comment ranges to find eligible
   * carriers after the parser result has identified the declaration they can
   * document.
   */
  comments: IEvidencePrismaCommentRun[];
}
