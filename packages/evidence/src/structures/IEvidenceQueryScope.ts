import type { EvidenceArtifactType } from "../typings/EvidenceArtifactType";
import type { EvidencePopulationRole } from "../typings/EvidencePopulationRole";

/**
 * Configuration boundary identifying a population in query output.
 *
 * One semantic unit can appear in several claims or references with different
 * selections and policies. Role and authored indices distinguish those
 * appearances while the optional name remains a display label rather than graph
 * identity.
 *
 * @evidence contracts/common.md#principled-implementation Role, claim and optional reference indices with type identify a configured population in query output.
 * @evidence contracts/common.md#clear-and-simple-design The scope is an identifier only; population data lives elsewhere.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Authored indices are used, never filtered positions.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the scope; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceQueryScope {
  /**
   * Whether the population supplies claim hosts or required reference units.
   *
   * Reference scopes also carry an index within the owning claim.
   */
  role: EvidencePopulationRole;

  /**
   * Zero-based authored claim index containing the population.
   *
   * Planning preserves this index even when disabled entries are removed.
   */
  claim: number;

  /**
   * Authored reference index when the population belongs to a reference.
   *
   * Claim scopes omit it because they do not identify a particular requirement.
   */
  reference?: number;

  /**
   * Optional configured label for the population.
   *
   * Omission leaves role and indices sufficient to identify its boundary.
   */
  name?: string;

  /**
   * Artifact family whose extraction and target grammar apply to this
   * population.
   *
   * Queries use it to filter list rows and choose compatible target resolution.
   */
  type: EvidenceArtifactType;
}
