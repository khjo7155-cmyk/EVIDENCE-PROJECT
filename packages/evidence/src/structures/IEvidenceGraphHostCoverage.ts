/**
 * Per-host answer ledger for a Markdown checklist obligation.
 *
 * Checklist mode requires each semantic claim host to answer the selected
 * reference items. Keeping these ledgers separate prevents one host's answer
 * from hiding another host's omissions. Explained IDs suppress redundant
 * missing messages when a more direct aggregate diagnostic already describes
 * the failure.
 *
 * @evidence contracts/common.md#principled-implementation Covered, missing and explained identity lists per host model checklist mode, where every host answers every selected item.
 * @evidence contracts/common.md#clear-and-simple-design The ledger holds only identities; diagnostics for explained items live with their aggregate finding.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Explained identities prevent duplicate derivative findings without dropping the underlying miss.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the per-host ledger; each list documents its meaning.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphHostCoverage {
  /**
   * Semantic claim unit that owes the checklist answers.
   *
   * This identifies the subject being checked, rather than a physical comment
   * position that may carry statements for several units.
   */
  hostUnitId: string;

  /**
   * Selected reference identities answered by this host.
   *
   * An answer contributes here only under this obligation's acknowledgement
   * policy.
   */
  coveredUnitIds: string[];

  /**
   * Selected reference identities still unanswered by this host.
   *
   * Another host's coverage does not remove an identity from this list.
   */
  missingUnitIds: string[];

  /**
   * Missing identities already attributed to a direct aggregate diagnostic.
   *
   * These remain missing coverage; the marker prevents duplicate explanations
   * during checklist finalization.
   */
  explainedUnitIds: string[];
}
