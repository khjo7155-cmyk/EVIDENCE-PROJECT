/**
 * A recognized documentation annotation before semantic attachment.
 *
 * Parser offsets remain relative to normalized documentation so the mapper can
 * recover the original source range after multiline bodies are assembled.
 *
 * @evidence contracts/common.md#principled-implementation Kind, optional heading level, body and source offsets hold a recognized annotation until its body is complete.
 * @evidence contracts/common.md#clear-and-simple-design Recognition and attachment are separate; this is the intermediate record.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Offsets refer to normalized documentation and are mapped back later rather than approximated.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the pending stage; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePendingEvidenceTag {
  /**
   * Annotation spelling, including link and review variants with distinct later
   * rules.
   *
   * Attachment dispatch uses this value to choose target parsing and graph
   * handling without re-reading the normalized documentation text.
   */
  kind:
    | "evidence"
    | "link"
    | "evidenceExclude"
    | "evidenceReview"
    | "evidenceExcludeReview";

  /**
   * Depth of the heading that opened a section-style annotation.
   *
   * Omission preserves legacy line-tag continuation. A same-level or higher
   * heading ends a section, while any new supported tag starts another one.
   */
  headingLevel?: number;

  /**
   * Continued body text without the tag marker.
   *
   * The mapper joins continuation lines before target parsing while retaining
   * offsets into the normalized documentation carrier.
   */
  body: string;

  /**
   * Inclusive UTF-16 offset of the annotation in normalized documentation.
   *
   * Source mapping combines this boundary with the carrier's normalized text to
   * recover the authored location for diagnostics.
   */
  start: number;

  /**
   * Exclusive UTF-16 offset immediately after the tag's continued body.
   *
   * Together with {@link start}, this forms the half-open annotation range used
   * when translating normalized offsets back to source positions.
   */
  end: number;
}
