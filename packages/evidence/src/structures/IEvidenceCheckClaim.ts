import type { EvidenceArtifactType } from "../typings/EvidenceArtifactType";
import type { IEvidenceCheckObligation } from "./IEvidenceCheckObligation";

/**
 * Report entry connecting a configured claim to its evaluated obligations.
 *
 * Labels and artifact types come from the configuration plan; activation,
 * completeness, and coverage come from graph evaluation. Keeping both lets
 * renderers explain a failure without exposing the full extracted inventory.
 *
 * @evidence contracts/common.md#principled-implementation Joining configuration labels with evaluation state lets renderers explain a claim's failure without the full inventory.
 * @evidence contracts/common.md#clear-and-simple-design The entry carries only identity, activation, completeness and its obligations; detailed records stay in the graph result.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Authored claim indices are kept instead of renumbering after filtering.
 * @evidence contracts/common.md#meaningful-documentation The comment explains which fields come from the plan and which from evaluation; every member is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCheckClaim {
  /**
   * Zero-based claim index in the authored configuration.
   *
   * Filtering inactive configuration entries does not renumber this identity.
   */
  claim: number;

  /**
   * Optional author-supplied label for display.
   *
   * Omission leaves the numeric claim index as the report's identifying
   * context.
   */
  name?: string;

  /**
   * Artifact family used to extract the claim population.
   *
   * Renderers include it alongside the label to identify the citing side.
   */
  type: EvidenceArtifactType;

  /**
   * Whether graph evaluation activated this claim.
   *
   * Only active claims contribute to the report's active-claim count.
   */
  active: boolean;

  /**
   * Whether the claim population was materialized completely.
   *
   * Reference completeness is recorded separately on each obligation; this flag
   * alone does not establish that the claim passed all coverage requirements.
   */
  complete: boolean;

  /**
   * Coverage results for this claim's planned references.
   *
   * Repeated references remain separate entries with their own indices and
   * policy.
   */
  obligations: IEvidenceCheckObligation[];
}
