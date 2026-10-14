/**
 * Filesystem selection shared by claim and reference discovery.
 *
 * The source loader resolves the root from the configuration directory and
 * applies ordered patterns within that logical root. Artifact-specific symbol
 * selection happens later, after these files have been read and extracted.
 *
 * @evidence contracts/common.md#principled-implementation An optional root plus ordered globs is the shared filesystem selection for claims and references.
 * @evidence contracts/common.md#clear-and-simple-design Selection is separate from artifact type and policy.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Glob order is preserved because later patterns can reinclude.
 * @evidence contracts/common.md#meaningful-documentation The comment explains sharing; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSourceSelection {
  /**
   * Population directory resolved from the configuration file's directory.
   *
   * Omission uses the configuration directory itself, independently of the
   * process working directory at extraction time.
   */
  root?: string;

  /**
   * Ordered root-relative inclusion and exclusion patterns.
   *
   * These follow the shared claim files contract; their order controls which
   * logical addresses remain selected before artifact extraction.
   */
  files: string[];
}
