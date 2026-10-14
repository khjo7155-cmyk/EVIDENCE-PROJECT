/**
 * Couples trimmed text with the coordinates of its retained characters.
 *
 * Prisma comment normalization uses this temporary value to remove surrounding
 * whitespace without severing the documentation text from its source offsets.
 *
 * @evidence contracts/common.md#principled-implementation Trimmed text keeps the coordinates of its retained characters.
 * @evidence contracts/common.md#clear-and-simple-design Comment normalization uses it temporarily.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceTrimmedMapping {
  /**
   * Contains the retained text after leading and trailing whitespace removal.
   *
   * An empty value has empty coordinate arrays.
   */
  text: string;

  /**
   * Maps each retained character to its original UTF-16 start offset.
   *
   * Entries align one-for-one with `text`.
   */
  offsets: number[];

  /**
   * Maps each retained character to its original UTF-16 end offset.
   *
   * Entries align with `offsets` and preserve the source span of every
   * character.
   */
  ends: number[];
}
