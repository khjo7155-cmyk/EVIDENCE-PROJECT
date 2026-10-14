/**
 * Represents a statically readable Ruby constant path and root qualification.
 *
 * EvidenceRubyFileScanner uses it to distinguish lexical nesting from top-level
 * constants before reopened declarations and visibility transitions are
 * reconciled.
 *
 * @evidence contracts/common.md#principled-implementation A constant path keeps root qualification so lexical nesting is distinguished from top-level constants.
 * @evidence contracts/common.md#clear-and-simple-design The scanner reads paths; reconciliation compares them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRubyConstantPath {
  /**
   * Whether the source spelling begins at Ruby's top-level constant namespace.
   *
   * An absolute path bypasses the current lexical container during resolution.
   */
  absolute: boolean;

  /**
   * Constant names in source order after any root qualifier.
   *
   * The scanner combines these with lexical context only for relative paths.
   */
  segments: string[];
}
