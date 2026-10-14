/**
 * Filesystem location needed to observe source changes or recovery.
 *
 * A dependency can name a read file, a directory whose topology affects globs,
 * or a currently missing path. Watch retains these records after failures so a
 * newly created or repaired input can trigger evaluation without editing a file
 * that was already present in the successful snapshot.
 *
 * @evidence contracts/common.md#principled-implementation A path with a recursive flag is what a watcher needs to observe edits, creation and deletion.
 * @evidence contracts/common.md#clear-and-simple-design Dependencies are data; observation belongs to the watcher.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Missing paths are retained so repairs can be observed.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the purpose; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSourceDependency {
  /**
   * Absolute logical or physical path that can invalidate the result.
   *
   * The path need not exist. Dropping missing dependencies would prevent watch
   * from observing their later creation or restoration.
   */
  path: string;

  /**
   * Whether observation includes descendants of the recorded path.
   *
   * False denotes an exact dependency. Recursive directory observation detects
   * topology changes that can add selected files beyond the known source list.
   */
  recursive: boolean;
}
