import type { IEvidenceReview } from "../structures/IEvidenceReview";

/**
 * A review annotation paired with its resolved reference target and claim
 * hosts.
 *
 * Reviews retain the authored record so reporting can distinguish a missing
 * review from an invalid target without re-parsing source text.
 *
 * @evidence contracts/common.md#principled-implementation A review with host units and target unit is ready for pairing with acknowledgements.
 * @evidence contracts/common.md#clear-and-simple-design It mirrors the resolved acknowledgement for reviews, keeping the two types separate.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only resolved targets reach this shape.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the pairing input; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceResolvedReview {
  /**
   * Original review declaration and source position.
   *
   * Reporting retains the authored annotation so an invalid review target can
   * be distinguished from an absent review without reparsing its source file.
   */
  review: IEvidenceReview;

  /**
   * Claim units whose structural scope contains the review host.
   *
   * One review declaration can apply to multiple selected descendants that
   * share its structural host position.
   */
  hostUnitIds: string[];

  /**
   * Reference unit named by the review target.
   *
   * The resolver assigns this identity after proving the target is unique
   * within the configured reference population.
   */
  targetUnitId: string;
}
