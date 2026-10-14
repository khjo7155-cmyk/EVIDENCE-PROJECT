import type { IEvidenceSourcePosition } from "./IEvidenceSourcePosition";

/**
 * A half-open span in the original captured source string.
 *
 * The inclusive start and exclusive end match JavaScript slicing. Both
 * positions retain diagnostic coordinates in the same unnormalized UTF-16 text,
 * so adapters can expose serializable locations without retaining their parser
 * nodes.
 *
 * @example
 *   const fragment: string = content.slice(
 *     range.start.offset,
 *     range.end.offset,
 *   );
 *   // Equal offsets describe an empty span, such as an inserted missing token.
 *
 * @evidence contracts/common.md#principled-implementation A half-open start/end pair over the original source string represents spans without off-by-one ambiguity.
 * @evidence contracts/common.md#clear-and-simple-design Ranges are composed of positions only.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No normalization is applied to ranges.
 * @evidence contracts/common.md#meaningful-documentation The comment states the half-open convention; both fields are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSourceRange {
  /**
   * Inclusive first position belonging to the span.
   *
   * Use its offset as the first argument to `String.slice`; line and column
   * provide the corresponding original-source diagnostic location.
   */
  start: IEvidenceSourcePosition;

  /**
   * Exclusive position immediately after the span.
   *
   * Use its offset directly as the slicing end. Adding one would include an
   * unrelated character and mishandle zero-width ranges.
   */
  end: IEvidenceSourcePosition;
}
