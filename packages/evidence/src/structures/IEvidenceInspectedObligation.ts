import type { EvidenceUnitSelection } from "../typings/EvidenceUnitSelection";
import type { IEvidenceGraphPolicy } from "./IEvidenceGraphPolicy";

/**
 * Coverage state of an inspected identity within one reference obligation.
 *
 * A selected unit reports its direct ledger state. An addressable ancestor can
 * summarize its selected descendants without itself increasing the denominator.
 * Activation and completeness remain explicit so a partial analysis is not
 * mistaken for a trustworthy coverage result.
 *
 * @evidence contracts/common.md#principled-implementation Policy, activation, completeness, selection and coverage flags describe the inspected identity's state within one obligation.
 * @evidence contracts/common.md#clear-and-simple-design The record projects one boundary's ledger for one identity.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Completeness is reported beside coverage so a missing scan is not read as uncovered or covered.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the projection; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceInspectedObligation {
  /**
   * Authored claim index owing the inspected requirement.
   *
   * Other claims evaluate the same reference identity independently.
   */
  claim: number;

  /**
   * Authored reference index defining the requirement population.
   *
   * This identifies the ledger and effective policy used for the displayed
   * state.
   */
  reference: number;

  /**
   * Effective acknowledgement and review rules for this obligation.
   *
   * These explain why an edge accepted elsewhere may not cover the same
   * identity here.
   */
  policy: IEvidenceGraphPolicy;

  /**
   * Whether the obligation participates in the evaluated graph.
   *
   * Inactive entries do not contribute to active coverage totals.
   */
  active: boolean;

  /**
   * Whether this obligation's analysis established a complete population.
   *
   * Coverage flags on an incomplete result cannot certify a full pass.
   */
  complete: boolean;

  /**
   * Whether the inspected identity is selected or supplies structural context.
   *
   * Ancestors summarize descendant requirements without adding another selected
   * unit.
   */
  selection: EvidenceUnitSelection;

  /**
   * Whether the identity is directly covered or all selected descendants of an
   * ancestor are covered.
   *
   * Ancestor coverage requires at least one selected descendant, avoiding a
   * vacuous pass.
   */
  covered: boolean;

  /**
   * Whether the identity or any selected descendant remains missing.
   *
   * This exposes an aggregate scope's remaining requirement even when some of
   * its descendants already have accepted evidence.
   */
  missing: boolean;
}
