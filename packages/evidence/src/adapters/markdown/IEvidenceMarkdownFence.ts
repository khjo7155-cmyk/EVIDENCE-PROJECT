/**
 * One valid Markdown fence delimiter after its allowed indentation.
 *
 * Fence records prevent heading and comment-like text inside examples from
 * becoming public Markdown structure or annotation hosts.
 *
 * @evidence contracts/common.md#principled-implementation Marker, length and remainder of a valid fence are exactly what matching a closing fence requires.
 * @evidence contracts/common.md#clear-and-simple-design The record is scanner-internal data; fence tracking uses it without owning logic.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No document-specific values are encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains its purpose; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceMarkdownFence {
  /**
   * Stores the fence character shared by a matching opener and closer.
   *
   * Markdown requires matching backtick or tilde fence families.
   */
  marker: "`" | "~";

  /**
   * Stores the number of consecutive marker characters in the delimiter.
   *
   * A closing fence must be at least this long to close the example region.
   */
  length: number;

  /**
   * Retains remaining delimiter text used to validate closing fences.
   *
   * Nonblank suffixes prevent a fence-like line from closing the region.
   */
  remainder: string;
}
