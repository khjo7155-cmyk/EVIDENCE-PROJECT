import type { IEvidenceDeclaration } from "./IEvidenceDeclaration";
import type { IEvidenceHost } from "./IEvidenceHost";

/**
 * Accepted incoming acknowledgement relevant to an inspected reference
 * identity.
 *
 * A statement is included when its exact target or covered selected units match
 * the inspected candidate. The record retains both authored source context and
 * evaluated scope, making aggregate citations explainable without flattening
 * independent reference obligations.
 *
 * @evidence contracts/common.md#principled-implementation An accepted incoming acknowledgement is reported with its declaration, host, target and covered units so inspection can explain coverage.
 * @evidence contracts/common.md#clear-and-simple-design Records are joined from existing graph data; nothing is re-evaluated.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only accepted acknowledgements appear, so refused statements are not presented as coverage.
 * @evidence contracts/common.md#meaningful-documentation The comment explains relevance to the inspected scope; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceInspectedAcknowledgement {
  /**
   * Authored index of the claim supplying the acknowledgement.
   *
   * Together with reference, this identifies the boundary that accepted the
   * edge.
   */
  claim: number;

  /**
   * Authored reference index under the owning claim.
   *
   * Acceptance here does not imply acceptance under another reference's policy.
   */
  reference: number;

  /**
   * Extracted acknowledgement statement with target, reason, and source
   * location.
   *
   * This preserves author intent alongside the evaluated target and coverage
   * IDs.
   */
  declaration: IEvidenceDeclaration;

  /**
   * Documentation carrier owning the accepted statement.
   *
   * Its physical location and origins explain where the target was authored and
   * resolved.
   */
  host: IEvidenceHost;

  /**
   * Selected semantic claim subjects represented by the carrier for this edge.
   *
   * Checklist answers are attributed to these subjects independently.
   */
  hostUnitIds: string[];

  /**
   * Exact semantic target named by the acknowledgement.
   *
   * An aggregate target can be an ancestor of the inspected selected identity.
   */
  targetUnitId: string;

  /**
   * Selected reference identities receiving coverage from the accepted scope.
   *
   * The collection can differ from the exact target when aggregate
   * acknowledgement applies.
   */
  unitIds: string[];

  /**
   * Current fingerprint of the exact cited scope.
   *
   * Review validation concerns that scope rather than only the inspected
   * descendant.
   */
  fingerprint: string;
}
