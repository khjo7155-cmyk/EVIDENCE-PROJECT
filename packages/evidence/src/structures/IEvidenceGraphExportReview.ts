import type { EvidenceAcknowledgementKind } from "../typings/EvidenceAcknowledgementKind";
import type { EvidenceTargetResolutionStatus } from "../typings/EvidenceTargetResolutionStatus";
import type { IEvidenceReview } from "./IEvidenceReview";

/**
 * Review relation exported separately from accepted acknowledgement edges.
 *
 * Target-resolution candidates become endpoints even when the result is
 * ambiguous. The status describes identity lookup, not review freshness or
 * successful pairing; no review relation creates coverage by itself.
 *
 * @evidence contracts/common.md#principled-implementation Reviews are exported as their own relation with resolution status, so validation never appears as a coverage edge.
 * @evidence contracts/common.md#clear-and-simple-design The relation references boundary and nodes by ID instead of embedding them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unresolved reviews keep their status rather than being dropped from export.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why reviews are separate from acknowledgement edges; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphExportReview {
  /**
   * Review identity qualified by its independent obligation boundary.
   *
   * One source review can appear in several references with distinct resolution
   * outcomes.
   */
  id: string;

  /**
   * Claim/reference obligation against which the review was resolved.
   *
   * Its policy determines how pairing and freshness affect evaluation.
   */
  boundaryId: string;

  /**
   * Acknowledgement form this review intends to validate.
   *
   * Matching also requires the relevant host, target scope, and fingerprint
   * conditions.
   */
  reviews: EvidenceAcknowledgementKind;

  /**
   * Original review statement and its authored validation metadata.
   *
   * Source coordinates and description remain available for stale-review
   * repair.
   */
  review: IEvidenceReview;

  /**
   * Resolution outcome for the review's authored target.
   *
   * Resolved status establishes target identity without claiming freshness or
   * coverage.
   */
  status: EvidenceTargetResolutionStatus;

  /**
   * Boundary-qualified claim or standalone-carrier endpoints owning the review.
   *
   * Physical host ownership remains represented even without a selected
   * semantic subject.
   */
  sourceNodeIds: string[];

  /**
   * Boundary-qualified reference nodes returned as target candidates.
   *
   * Ambiguous resolution can retain several endpoints; failures without
   * candidates leave the collection empty.
   */
  targetNodeIds: string[];
}
