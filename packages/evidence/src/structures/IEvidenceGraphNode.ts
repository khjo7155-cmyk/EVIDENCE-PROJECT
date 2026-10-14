import type { EvidenceSymbol } from "../typings/EvidenceSymbol";
import type { EvidencePopulationRole } from "../typings/EvidencePopulationRole";
import type { EvidenceUnitSelection } from "../typings/EvidenceUnitSelection";
import type { IEvidenceSourceLocation } from "./IEvidenceSourceLocation";

/**
 * Semantic-unit node within one obligation and population role.
 *
 * The export ID distinguishes the same unit appearing on several boundaries or
 * on both sides of one pair. Selection marks denominator participation;
 * structural ancestors can remain addressable nodes whose coverage summarizes
 * descendants.
 *
 * @evidence contracts/common.md#principled-implementation A node per boundary, role and unit carries selection and coverage state for display without merging obligations.
 * @evidence contracts/common.md#clear-and-simple-design Node identity is boundary-qualified; semantic identity is kept in unitId.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Coverage flags are derived from the boundary ledger rather than set independently.
 * @evidence contracts/common.md#meaningful-documentation The comment explains per-obligation qualification; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphNode {
  /**
   * EvidenceNode identity qualified by boundary, role, and semantic unit.
   *
   * Edge endpoints use this value rather than the unqualified semantic
   * identity.
   */
  id: string;

  /**
   * Independent obligation owning this node's displayed state.
   *
   * This joins the node to its effective policy and coverage ledger.
   */
  boundaryId: string;

  /**
   * Claim or reference side represented by the node.
   *
   * A unit serving both roles receives separate nodes with different coverage
   * meaning.
   */
  role: EvidencePopulationRole;

  /**
   * Underlying semantic declaration identity.
   *
   * Multiple boundary-qualified nodes can share this ID without merging
   * obligations.
   */
  unitId: string;

  /**
   * Artifact-specific symbol kind of the declaration.
   *
   * This explains the selection vocabulary used for the node's population.
   */
  symbol: EvidenceSymbol;

  /**
   * Human-readable declaration name retained by extraction.
   *
   * The separately formatted target supplies the complete citation spelling.
   */
  name: string;

  /**
   * Deterministically chosen public target spelling for display and citation.
   *
   * Formatting follows the artifact grammar and query base directory where
   * applicable.
   */
  target: string;

  /**
   * Selection relationship of this identity to its configured population.
   *
   * Ancestors provide structural context; unselected nodes may be retained as
   * relationship endpoints without increasing the coverage denominator.
   */
  selection: EvidenceUnitSelection;

  /**
   * Coverage participation displayed for this node within its boundary.
   *
   * Selected claim nodes indicate an accepted edge; reference nodes report
   * direct coverage or complete coverage of an ancestor's selected
   * descendants.
   */
  covered: boolean;

  /**
   * Whether a reference identity or one of its selected descendants lacks
   * evidence.
   *
   * Claim nodes do not use this as a per-host checklist ledger; that state
   * belongs to the boundary's hostCoverage collection.
   */
  missing: boolean;

  /**
   * Physical declaration sites represented by this semantic node.
   *
   * Merged declarations retain every contributing location within one identity.
   */
  locations: IEvidenceSourceLocation[];
}
