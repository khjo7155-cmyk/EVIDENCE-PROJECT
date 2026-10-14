import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { EvidencePrismaCommentForm } from "./EvidencePrismaCommentForm";

/**
 * Represents consecutive Prisma comments considered as one documentation run.
 *
 * The position scanner groups fragments before semantic parsing so downstream
 * attachment can retain both the mapped text and the exact source comments.
 *
 * @evidence contracts/common.md#principled-implementation A run groups consecutive comment fragments with mapped text and their exact source comments.
 * @evidence contracts/common.md#clear-and-simple-design The scanner groups runs; the adapter attaches them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaCommentRun {
  /**
   * Identifies the syntax form shared by comments in this run.
   *
   * The form determines whether the run can document a declaration or is kept
   * as an unsupported or detached annotation carrier.
   */
  form: EvidencePrismaCommentForm;

  /**
   * Names the declaration location to which this run is attached.
   *
   * An empty key means no declaration received the run.
   */
  key: string;

  /**
   * Marks a documentation run attached to the schema file itself.
   *
   * This is true only for top-level `///` runs with no declaration key.
   */
  fileLevel: boolean;

  /**
   * Stores normalized run text in source-line order.
   *
   * Inserted newlines retain coordinate entries in `offsets` and `ends`.
   */
  text: string;

  /**
   * Maps each text character to its original UTF-16 start offset.
   *
   * The final sentinel maps the end of the run for mapped documentation.
   */
  offsets: number[];

  /**
   * Maps each text character to its original UTF-16 end offset.
   *
   * Its positions correspond to `offsets` and preserve source discontinuities.
   */
  ends: number[];

  /**
   * Covers the complete comment run in original source coordinates.
   *
   * This includes delimiters and line gaps between retained fragments.
   */
  range: IEvidenceSourceRange;

  /**
   * Lists the physical range of each original comment fragment.
   *
   * Consumers use these ranges when a grouped run must report individual source
   * carriers.
   */
  commentRanges: IEvidenceSourceRange[];
}
