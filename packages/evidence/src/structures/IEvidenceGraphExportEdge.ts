import type { EvidenceAcknowledgementKind } from "../typings/EvidenceAcknowledgementKind";
import type { IEvidenceDeclaration } from "./IEvidenceDeclaration";

/**
 * Accepted acknowledgement exported with boundary-qualified graph endpoints.
 *
 * The relationship preserves the original declaration, exact target, and
 * selected identities covered by its scope. Endpoint node IDs are distinct from
 * semantic unit IDs because the same units can occur in several independent
 * obligations.
 *
 * @evidence contracts/common.md#principled-implementation Boundary-qualified endpoint node IDs separate export endpoints from semantic unit IDs, because one unit can appear in several independent obligations.
 * @evidence contracts/common.md#clear-and-simple-design The edge carries the original declaration and identities only; node records are exported separately.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Edge IDs derive from boundary, declaration and target, never from consumer-specific ordering.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why endpoints differ from unit IDs; each field documents its role.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphExportEdge {
  /**
   * Edge identity qualified by boundary, declaration, and exact target.
   *
   * Deterministic ordering uses this identity when serializing the graph.
   */
  id: string;

  /**
   * Obligation whose policy accepted this acknowledgement.
   *
   * Coverage is restricted to this boundary even if another reference shares
   * the target.
   */
  boundaryId: string;

  /**
   * Accepted acknowledgement form determining the cited scope.
   *
   * Evidence and exclusion variants retain their authored distinction in
   * export.
   */
  kind: EvidenceAcknowledgementKind;

  /**
   * Original acknowledgement with its reason and source coordinates.
   *
   * Consumers can explain the accepted edge without reverse-engineering its ID.
   */
  declaration: IEvidenceDeclaration;

  /**
   * Boundary-qualified claim nodes or standalone carrier node supplying the
   * statement.
   *
   * A shared carrier can represent several semantic claim subjects.
   */
  sourceNodeIds: string[];

  /**
   * Selected semantic claim identities represented by the carrier.
   *
   * This list can be empty for an eligible exclusion carrier outside selected
   * claim units.
   */
  hostUnitIds: string[];

  /**
   * Boundary-qualified reference node for the exact resolved target.
   *
   * It can identify an ancestor whose selected descendants receive coverage.
   */
  targetNodeId: string;

  /**
   * Semantic identity underlying the exact target endpoint.
   *
   * This remains comparable across exported boundaries without conflating their
   * node IDs.
   */
  targetUnitId: string;

  /**
   * Selected reference identities covered by the accepted acknowledgement
   * scope.
   *
   * Aggregate targets may cover several descendants rather than only the named
   * unit.
   */
  unitIds: string[];

  /**
   * Current fingerprint of the exact cited scope.
   *
   * Review validation uses that scope's content rather than the exported
   * selected subset.
   */
  fingerprint: string;
}
