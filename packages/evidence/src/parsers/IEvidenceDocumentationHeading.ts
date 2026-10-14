/**
 * An ATX heading normalized for annotation and Markdown outline parsing.
 *
 * Source coordinates remain with the caller. The title excludes closing hash
 * markers and an optional explicit anchor so neither can supply a tag reason.
 *
 * @evidence contracts/common.md#principled-implementation Level, normalized title and optional explicit anchor are the parts of an ATX heading both annotation and outline parsing need.
 * @evidence contracts/common.md#clear-and-simple-design One shape serves documentation tags and Markdown units.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Explicit anchors are kept apart from the title so they never leak into explanations.
 * @evidence contracts/common.md#meaningful-documentation The comment explains normalization; each field documents omission.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDocumentationHeading {
  /**
   * Heading depth from one through six.
   *
   * Annotation parsing accepts depths two through four; other depths still
   * terminate a surrounding section according to their hierarchy.
   */
  level: number;

  /**
   * Heading text without structural markers.
   *
   * Consumers recognize annotation tags or derive a public Markdown name here.
   */
  title: string;

  /**
   * Authored public anchor when a valid `{#anchor}` suffix is present.
   *
   * Omission leaves Markdown address generation to the adapter.
   */
  anchor?: string;
}
