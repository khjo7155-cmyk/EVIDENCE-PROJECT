import type { IEvidenceGraphObligation } from "./IEvidenceGraphObligation";

/**
 * Graph evaluation result for a claim and its independent references.
 *
 * This retains activation and extraction state without carrying display labels
 * from configuration. `EvidenceCheckProgrammer` later joins it to the plan to
 * produce a report. A complete claim population does not imply complete or
 * covered reference obligations.
 *
 * @evidence contracts/common.md#principled-implementation Activation, completeness and obligations per claim are what the check programmer needs to join with the plan.
 * @evidence contracts/common.md#clear-and-simple-design The result omits configuration labels, which the check programmer adds later.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Claim completeness does not imply reference completeness; both are reported.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the join and both completeness levels; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphClaimResult {
  /**
   * Authored claim index identifying this result.
   *
   * It remains stable when planning filters disabled configuration entries.
   */
  claim: number;

  /**
   * Whether the claim participates in graph evaluation.
   *
   * Inactive claims do not impose active reference coverage requirements.
   */
  active: boolean;

  /**
   * Whether the active claim population was materialized completely.
   *
   * Reference extraction and target resolution have their own completeness
   * state on each obligation, so callers must inspect both levels.
   */
  complete: boolean;

  /**
   * Results for the claim's planned reference boundaries.
   *
   * Each entry keeps its own coverage ledger even when references share units.
   */
  obligations: IEvidenceGraphObligation[];
}
