import type { IEvidenceTargetResolution } from "./IEvidenceTargetResolution";

/**
 * Prepared target resolution for an acknowledgement in one reference inventory.
 *
 * Resolution is retained separately from accepted edges because an invalid,
 * missing, or ambiguous target must still produce a diagnostic. The same source
 * declaration can resolve differently across independent reference boundaries.
 *
 * @evidence contracts/common.md#principled-implementation Pairing a declaration ID with its target resolution lets resolution run once per reference before evaluation.
 * @evidence contracts/common.md#clear-and-simple-design The record only joins two identities; resolution logic stays in the resolver.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Failed resolutions are retained with their status rather than omitted.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the preparation step; both fields are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphResolution {
  /**
   * Identity of the acknowledgement whose target was resolved.
   *
   * The evaluator uses it to find the prepared result for that source
   * statement.
   */
  declarationId: string;

  /**
   * Successful or failed resolution within the current reference boundary.
   *
   * Failure details remain available even when no accepted edge can be created.
   */
  resolution: IEvidenceTargetResolution;
}
