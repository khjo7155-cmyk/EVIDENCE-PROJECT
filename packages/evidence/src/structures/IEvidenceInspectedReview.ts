import type { EvidenceTargetResolutionStatus } from "../typings/EvidenceTargetResolutionStatus";
import type { IEvidenceHost } from "./IEvidenceHost";
import type { IEvidenceReview } from "./IEvidenceReview";

/**
 * Incoming review whose target scope contains an inspected reference candidate.
 *
 * This presents the review's source and resolution outcome separately from
 * accepted acknowledgements. A resolved review still requires valid pairing and
 * a current fingerprint; its presence here does not itself prove freshness or
 * create coverage.
 *
 * @evidence contracts/common.md#principled-implementation A review whose target scope contains the inspected candidate is reported with its host, status and candidates.
 * @evidence contracts/common.md#clear-and-simple-design Reviews stay separate from acknowledgements in inspection output.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Status is retained so unresolved reviews remain visible.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the relevance rule; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceInspectedReview {
  /**
   * Authored claim index containing the review statement.
   *
   * Review lookup remains within this claim's reference boundaries.
   */
  claim: number;

  /**
   * Authored reference index against which the review target was resolved.
   *
   * The same review can have different outcomes in independently configured
   * references.
   */
  reference: number;

  /**
   * Extracted review annotation with its expected fingerprint and description.
   *
   * The original location permits repair of a stale or incorrectly paired
   * review.
   */
  review: IEvidenceReview;

  /**
   * Documentation carrier owning the review.
   *
   * Pairing uses carrier context so an unrelated host's review cannot validate
   * a citation.
   */
  host: IEvidenceHost;

  /**
   * Target-resolution outcome prepared for this review.
   *
   * It describes target identity, independently of freshness or acknowledgement
   * acceptance.
   */
  status: EvidenceTargetResolutionStatus;

  /**
   * Semantic candidates returned for the review's exact target.
   *
   * These can be ancestors of inspected units and do not represent accepted
   * coverage.
   */
  unitIds: string[];
}
