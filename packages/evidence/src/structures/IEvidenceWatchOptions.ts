import type { tags } from "typia";

/**
 * Configuration anchor and timing controls for dependency observation.
 *
 * The watcher compares dependency snapshots and waits for a quiet period before
 * reevaluation. Parser acquisition has a separate retry clock because network
 * or cache recovery may happen without any watched filesystem change.
 *
 * @evidence contracts/common.md#principled-implementation Optional cwd, focus targets and three timing controls configure observation without changing check semantics.
 * @evidence contracts/common.md#clear-and-simple-design Options configure the watcher only; check behavior comes from configuration.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Typia tags bound intervals instead of hand-written validation.
 * @evidence contracts/common.md#meaningful-documentation The comment explains anchoring and timing; each option documents its default.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceWatchOptions {
  /**
   * Directory anchoring configuration discovery and relative explicit paths.
   *
   * Omission captures process cwd during construction. Subsequent cwd changes
   * cannot redirect the watcher. Implicit selection is repeated on each cycle.
   */
  cwd?: string;

  /**
   * Targets whose check outcomes are published on each stable cycle.
   *
   * Uses inspect's addressing rules with paths anchored at cwd. Omission
   * publishes the full check; dependency observation always retains full
   * inputs.
   */
  only?: string[] & tags.MinItems<1>;

  /**
   * Omits descendants from the only-target selection.
   *
   * Requires only targets. Omission includes configured descendants.
   */
  shallow?: true;

  /**
   * Positive delay between dependency snapshots, in milliseconds.
   *
   * Shorter intervals detect changes sooner while performing filesystem
   * inspection more often. Omission uses 250 milliseconds.
   *
   * @default 250
   */
  pollIntervalMilliseconds?: number & tags.Type<"uint32"> & tags.Minimum<1>;

  /**
   * Quiet period required before checking a changed snapshot, in milliseconds.
   *
   * Further changes restart settling. Zero skips the quiet wait; omission uses
   * 100 milliseconds to coalesce a burst of related edits.
   *
   * @default 100
   */
  debounceMilliseconds?: number & tags.Type<"uint32">;

  /**
   * Positive delay before retrying failed parser acquisition, in milliseconds.
   *
   * The retry can trigger without a source edit, allowing download, cache, or
   * integrity failures to recover. Omission waits five seconds.
   *
   * @default 5000
   */
  parserRetryMilliseconds?: number & tags.Type<"uint32"> & tags.Minimum<1>;
}
