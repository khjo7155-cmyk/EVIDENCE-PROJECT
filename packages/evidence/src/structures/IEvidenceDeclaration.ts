import type { EvidenceAcknowledgementKind } from "../typings/EvidenceAcknowledgementKind";
import type { IEvidenceTargetStatement } from "./IEvidenceTargetStatement";

/**
 * A parsed positive or exclusion acknowledgement awaiting reference-specific
 * resolution.
 *
 * The tag parser records the target, reason, host, and source location.
 * Resolution identifies the cited scope, then each reference judges host
 * eligibility, exclusion permission, and coverage of its selected descendants.
 * Merely parsing a statement does not create a valid coverage edge.
 *
 * Reviews use a separate shape because they validate acknowledgements rather
 * than substitute for them. Multiple statements may still belong to one
 * semantic host for cardinality purposes.
 *
 * @evidence contracts/common.md#principled-implementation Extending the target statement with id, kind and reason records a parsed acknowledgement before reference-specific resolution decides coverage.
 * @evidence contracts/common.md#clear-and-simple-design Reviews use a separate shape so validation never substitutes for acknowledgement.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Parsing alone creates no coverage edge; every reference judges eligibility independently.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the resolution sequence and the review separation; each field documents its role.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDeclaration extends IEvidenceTargetStatement {
  /**
   * Identity of this physical acknowledgement statement.
   *
   * Target resolutions and accepted graph edges join through this ID. Repeated
   * statements do not necessarily represent different semantic hosts.
   */
  id: string;

  /**
   * Whether the annotation supplies positive evidence or an exclusion.
   *
   * Both can cover ordinary obligations, but exclusions have independent
   * carrier, refusal, and overlap rules. A review cannot be represented as
   * either kind.
   */
  kind: EvidenceAcknowledgementKind;

  /**
   * Nonempty explanation accompanying the target.
   *
   * The parser requires prose so the citation records its purpose. Coverage
   * checks establish structural acknowledgement, not the truth of this
   * explanation.
   */
  reason: string;
}
