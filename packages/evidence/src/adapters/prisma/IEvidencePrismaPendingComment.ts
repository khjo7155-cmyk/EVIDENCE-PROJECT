import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { EvidencePrismaCommentForm } from "./EvidencePrismaCommentForm";

/**
 * Retains one Prisma comment fragment before it is grouped into a run.
 *
 * The line scanner records text and coordinate maps separately so grouping can
 * insert line breaks without losing the original source positions.
 *
 * @evidence contracts/common.md#principled-implementation A pending fragment keeps text and coordinate maps until grouping into a run.
 * @evidence contracts/common.md#clear-and-simple-design The line scanner records fragments.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaPendingComment {
  /**
   * Identifies the source syntax used for this comment fragment.
   *
   * Documentation runs distinguish `///` comments from ordinary lines and block
   * comments using this form.
   */
  form: EvidencePrismaCommentForm;

  /**
   * Gives the zero-based source line that contains this fragment.
   *
   * Runs use it to preserve blank lines between comments.
   */
  line: number;

  /**
   * Stores the trimmed comment content without delimiters.
   *
   * Its characters correspond positionally to `offsets` and `ends`.
   */
  text: string;

  /**
   * Maps content characters to original UTF-16 start offsets.
   *
   * Whitespace trimming removes matching entries from this map.
   */
  offsets: number[];

  /**
   * Maps content characters to original UTF-16 end offsets.
   *
   * Entries preserve the source boundaries of the retained text.
   */
  ends: number[];

  /**
   * Covers the original comment syntax, including its delimiters.
   *
   * This range remains available even when trimming leaves no content.
   */
  range: IEvidenceSourceRange;

  /**
   * Marks a comment that follows structural code on the same line.
   *
   * Trailing comments never attach as leading documentation for the next
   * declaration.
   */
  trailing: boolean;

  /**
   * Marks a comment discovered while scanner depth is zero.
   *
   * This distinguishes eligible file-level documentation from a detached run
   * nested inside a schema block.
   */
  topLevel: boolean;
}
