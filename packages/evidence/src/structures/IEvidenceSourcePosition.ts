/**
 * A position measured in the original UTF-16 source string.
 *
 * Offsets follow JavaScript string indexing, while line and column numbers are
 * one-based for diagnostics. No newline normalization occurs: CRLF retains both
 * code units, and a supplementary Unicode character occupies two code units.
 * Adapters and decoded-documentation mappers must return this coordinate system
 * rather than byte offsets or visual editor columns.
 *
 * @example
 *   // In "A😀\r\nB", B begins at offset 5, line 2, column 1.
 *   // The emoji contributes two code units and the CRLF contributes two more.
 *
 * @evidence contracts/common.md#principled-implementation UTF-16 offset with one-based line and column matches JavaScript string indexing and editor coordinates.
 * @evidence contracts/common.md#clear-and-simple-design Positions carry no file; locations add it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Coordinates refer to the original captured string, not normalized text.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the coordinate system; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSourcePosition {
  /**
   * Zero-based UTF-16 offset into the captured source string.
   *
   * This is suitable for `String.slice` without byte conversion. Surrogate
   * pairs occupy two positions, so a code-point count cannot substitute for the
   * offset.
   */
  offset: number;

  /**
   * One-based line number in the original source.
   *
   * LF advances the line, including the LF in CRLF. Preserving original line
   * endings keeps the offset and diagnostic coordinates on the same text.
   */
  line: number;

  /**
   * One-based UTF-16 column within the line.
   *
   * CR and each surrogate code unit occupy one column. This records string
   * position, not rendered width or a Unicode code-point column.
   */
  column: number;
}
