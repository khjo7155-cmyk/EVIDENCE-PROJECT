/**
 * Configured, logical, and physical locations of a source population's root.
 *
 * Relative roots resolve from the configuration directory, while directory
 * symlinks and Windows junctions can redirect the physical scan. These
 * spellings remain separate so discovery can enforce boundaries and diagnostics
 * can still explain the path the user configured, including roots that cannot
 * be read.
 *
 * @evidence contracts/common.md#principled-implementation Declared, absolute, optional physical and display forms of a root keep authored and resolved paths apart.
 * @evidence contracts/common.md#clear-and-simple-design Root resolution lives in the source loader; this records its result.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The physical form is omitted when unresolved rather than guessed.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the forms; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSourceRoot {
  /**
   * Root spelling authored in configuration, defaulting to a dot.
   *
   * Preserve this value for explanations rather than replacing it with the
   * resolved absolute or physical path.
   */
  declared: string;

  /**
   * Absolute logical directory before following filesystem links.
   *
   * Relative configuration roots are anchored here. This may differ from the
   * physical scan directory when a symlink or junction redirects the root.
   */
  absolute: string;

  /**
   * Canonical directory used for scanning when discovery resolves the root.
   *
   * Omission records that no directory could be resolved. The logical path
   * remains available for diagnostics and watch recovery of a missing or
   * repaired root.
   */
  physical?: string;

  /**
   * User-facing root path relative to the configuration directory where
   * possible.
   *
   * Cross-volume paths remain absolute. This presentation choice does not
   * replace logical or physical identity during source discovery.
   */
  display: string;
}
