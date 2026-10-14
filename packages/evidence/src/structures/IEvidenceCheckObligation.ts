import type { EvidenceActiveSeverity } from "../typings/EvidenceActiveSeverity";
import type { EvidenceArtifactType } from "../typings/EvidenceArtifactType";

/**
 * Compact coverage result for one claim/reference boundary.
 *
 * This projects a graph obligation into counts for command output. It retains
 * activation and completeness because a zero-sized result is not proof that
 * extraction succeeded, and severity determines whether findings fail the
 * check.
 *
 * @evidence contracts/common.md#principled-implementation A compact per-boundary record keeps activation and completeness because a zero count alone does not prove extraction succeeded.
 * @evidence contracts/common.md#clear-and-simple-design It projects a graph obligation into counts for output; edges and nodes stay in the graph result.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Completeness is reported beside counts rather than inferred from them.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the projection and why completeness and severity are retained; every field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCheckObligation {
  /**
   * Authored index of the claim that owes this evidence.
   *
   * Combined with the reference index, it identifies the diagnostic boundary.
   */
  claim: number;

  /**
   * Authored reference index within the claim.
   *
   * Identical populations at different indices impose separate obligations.
   */
  reference: number;

  /**
   * Artifact family on the required reference side.
   *
   * This can differ from the claim family, such as code cited from Markdown.
   */
  type: EvidenceArtifactType;

  /**
   * Effective severity after configuration inheritance.
   *
   * Off references are removed during planning; remaining findings are warnings
   * or errors according to this policy.
   */
  severity: EvidenceActiveSeverity;

  /**
   * Whether this obligation participates in aggregate coverage.
   *
   * Inactive entries retain their result shape but are excluded from totals.
   */
  active: boolean;

  /**
   * Whether analysis could establish the obligation's full population.
   *
   * An incomplete active obligation causes exit code two regardless of its
   * counts.
   */
  complete: boolean;

  /**
   * Number of selected semantic reference units.
   *
   * Aliases do not enlarge this denominator; another reference counts its own
   * selection independently.
   */
  units: number;

  /**
   * Number of selected units acknowledged under this reference's policy.
   *
   * Repeated citations to one identity do not add another covered unit.
   */
  coveredUnits: number;

  /**
   * Number of selected units still lacking required evidence.
   *
   * Read this together with completeness before treating the result as
   * exhaustive.
   */
  missingUnits: number;
}
