import type { IEvidenceTargetResolution } from "./IEvidenceTargetResolution";

/**
 * Prepared reference-target resolution for a review statement.
 *
 * Reviews resolve through the same target grammar as acknowledgements but
 * remain separate records: matching a review validates a paired citation and
 * never creates coverage by itself. Failed resolution is retained for
 * diagnostics.
 *
 * @evidence contracts/common.md#principled-implementation Pairing a review ID with its target resolution lets review targets be prepared once per reference.
 * @evidence contracts/common.md#clear-and-simple-design The record mirrors IEvidenceGraphResolution for reviews, keeping review data separate from acknowledgements.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unresolved reviews keep their status for diagnostics.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the preparation step; both fields are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphReviewResolution {
  /**
   * Identity of the review whose target was resolved.
   *
   * This keeps reviews distinguishable when several statements name one target.
   */
  reviewId: string;

  /**
   * Resolution outcome in the relevant reference inventory.
   *
   * A successful target still requires acknowledgement pairing and fingerprint
   * validation before the review can satisfy review policy.
   */
  resolution: IEvidenceTargetResolution;
}
