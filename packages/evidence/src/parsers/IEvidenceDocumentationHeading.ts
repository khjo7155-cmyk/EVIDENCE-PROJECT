/**
 * An ATX heading normalized for annotation and Markdown outline parsing.
 *
 * Source coordinates remain with the caller. The title excludes closing hash
 * markers and an optional explicit anchor so neither can supply a tag reason.
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
