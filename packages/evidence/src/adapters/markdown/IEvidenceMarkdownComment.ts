/**
 * One closed HTML comment accepted as Markdown documentation.
 *
 * Offsets and lines let attachment rules distinguish adjacent documentation
 * from comments that belong to fenced content or another structural region.
 *
 * @evidence contracts/common.md#principled-implementation Offsets and opening and closing lines of a closed HTML comment are what attachment rules need to tell adjacent documentation from comments in other regions.
 * @evidence contracts/common.md#clear-and-simple-design The record is scanner-internal data; comment attachment rules use it without owning logic.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No document-specific values are encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains its purpose; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceMarkdownComment {
  /**
   * Marks the UTF-16 start offset of the complete HTML comment.
   *
   * The scanner uses this offset to preserve the carrier's original source
   * range.
   */
  start: number;

  /**
   * Marks the exclusive UTF-16 end offset of the complete HTML comment.
   *
   * Together with `start`, this bounds the full delimiter-inclusive carrier.
   */
  end: number;

  /**
   * Identifies the zero-based line containing the opening delimiter.
   *
   * Attachment classification begins at this physical source line.
   */
  startLine: number;

  /**
   * Identifies the zero-based line containing the closing delimiter.
   *
   * Multi-line comments remain one carrier through this line.
   */
  endLine: number;
}
