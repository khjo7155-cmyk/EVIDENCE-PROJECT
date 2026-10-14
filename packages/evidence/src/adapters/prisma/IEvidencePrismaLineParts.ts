import type { IEvidencePrismaPendingComment } from "./IEvidencePrismaPendingComment";

/**
 * Splits one Prisma source line into structural code and comment state.
 *
 * `EvidencePrismaFileScanner` carries the block-comment state to the next line
 * while using `code` alone to locate declarations and braces.
 *
 * @evidence contracts/common.md#principled-implementation One line is split into code and comment state so braces are counted in code only.
 * @evidence contracts/common.md#clear-and-simple-design The scanner carries block-comment state between lines.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaLineParts {
  /**
   * Contains source characters that remain structural code on this line.
   *
   * Comment delimiters and comment content are excluded so quoted or commented
   * braces cannot change the scanner's nesting depth.
   */
  code: string;

  /**
   * Retains the comment fragment found on this line.
   *
   * Omission means the line contains no comment content, including continued
   * block-comment state with no retained text.
   */
  comment?: IEvidencePrismaPendingComment;

  /**
   * States whether a block comment remains open after this line.
   *
   * The next call uses this state to avoid treating comment text as Prisma
   * syntax.
   */
  commented: boolean;
}
