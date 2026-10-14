/**
 * Logical spelling through which a physical source participates in analysis.
 *
 * A physical file can have several symlink or hard-link addresses. Keeping each
 * spelling preserves population selection and relative citation origins without
 * reading or counting the physical source repeatedly. Dependency-only addresses
 * support extraction but do not automatically join the selected population.
 *
 * @evidence contracts/common.md#principled-implementation Absolute, relative and display spellings plus an optional selection flag describe how one physical file participates in analysis.
 * @evidence contracts/common.md#clear-and-simple-design Logical spellings are kept per address so one physical file can have several.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Support-only files are marked unselected instead of being cited directly.
 * @evidence contracts/common.md#meaningful-documentation The comment explains logical spelling; each field documents its use.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSourceAddress {
  /**
   * Absolute logical path retaining the selected link spelling.
   *
   * This can differ from the physical path used to deduplicate source reads.
   */
  absolute: string;

  /**
   * Case-sensitive, slash-separated path relative to the population root.
   *
   * Population globs and root-relative artifact targets use this spelling
   * rather than the file's physical path.
   */
  relative: string;

  /**
   * Display path expressed from the configuration directory.
   *
   * Across volumes it remains absolute because a relative filesystem path
   * cannot represent that relationship.
   */
  display: string;

  /**
   * Whether the address belongs to the selected source population.
   *
   * False marks support files loaded to analyze a selected dependency. Omission
   * means selected, preserving the ordinary discovery record's default.
   *
   * @default true
   */
  selected?: boolean;
}
