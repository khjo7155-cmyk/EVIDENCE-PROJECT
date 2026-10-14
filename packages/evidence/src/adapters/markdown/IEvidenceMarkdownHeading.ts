/**
 * One ATX heading and its public anchor candidate.
 *
 * The scanner keeps normalized heading data separate from source positions so
 * hierarchy and duplicate-anchor handling can decide public unit ownership.
 *
 * @evidence contracts/common.md#principled-implementation Level, title and candidate anchor separate normalized heading data from positions so hierarchy and duplicate anchors can be decided later.
 * @evidence contracts/common.md#clear-and-simple-design The record is scanner-internal data; unit materialization uses it without owning logic.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No document-specific values are encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains its purpose; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceMarkdownHeading {
  /**
   * Stores the ATX depth used to establish structural containment.
   *
   * Only supported depths can create nested public Markdown units.
   */
  level: number;

  /**
   * Stores visible heading text after marker normalization.
   *
   * The adapter exposes this text as the human-readable unit name.
   */
  title: string;

  /**
   * Stores the candidate anchor before duplicate disambiguation.
   *
   * Later materialization uses it to form a stable public address.
   */
  anchor: string;
}
