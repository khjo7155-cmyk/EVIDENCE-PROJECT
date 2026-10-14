import type { IEvidenceSourceRange } from "./IEvidenceSourceRange";

/**
 * Source coordinate suitable for both declarations and file-level failures.
 *
 * Extraction can identify a file even when reading or parsing it fails before a
 * span exists. The optional range preserves that distinction instead of
 * inventing a line number for diagnostics without a concrete source position.
 *
 * @evidence contracts/common.md#principled-implementation A file with an optional range covers both declarations and file-level failures.
 * @evidence contracts/common.md#clear-and-simple-design Range structure is in IEvidenceSourceRange.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No sentinel range is fabricated for file-level findings.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the optional range; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSourceLocation {
  /**
   * File associated with the declaration or diagnostic.
   *
   * Reporters can display this path even when no source range is available.
   */
  file: string;

  /**
   * Source span narrowing the location within the file.
   *
   * Omission denotes file-level context; when present, its start supplies the
   * line and column displayed by text reporters.
   */
  range?: IEvidenceSourceRange;
}
