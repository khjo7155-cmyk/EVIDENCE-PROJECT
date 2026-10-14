/**
 * Markdown fence recognized relative to mapped documentation indentation.
 *
 * Tag parsing and HTML precedence share this record so an indented delimiter
 * cannot establish different lexical state in the two passes.
 *
 * @evidence contracts/common.md#principled-implementation Marker character, run length and remainder are exactly what CommonMark needs to match a closing fence.
 * @evidence contracts/common.md#clear-and-simple-design The record is produced by EvidenceDocumentationExamples.fence and consumed by fence tracking.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only the two CommonMark fence markers are representable.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the baseline-relative recognition; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDocumentationFence {
  /**
   * Backtick or tilde character that owns the fenced region.
   *
   * A closing line must repeat this exact character.
   */
  marker: "`" | "~";

  /**
   * Number of repeated marker characters on this boundary.
   *
   * A closing boundary may be longer but cannot be shorter.
   */
  length: number;

  /**
   * Text following the marker run.
   *
   * Opening boundaries may carry info text, while closing boundaries require
   * this value to contain only whitespace.
   */
  remainder: string;
}
