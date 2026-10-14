import type { EvidenceSymbol } from "../typings/EvidenceSymbol";
import type { EvidenceUnitSelection } from "../typings/EvidenceUnitSelection";
import type { IEvidenceQueryScope } from "./IEvidenceQueryScope";
import type { IEvidenceSourceLocation } from "./IEvidenceSourceLocation";

/**
 * Discoverable semantic unit within one configured population.
 *
 * A row groups public aliases and physical declaration locations under one unit
 * identity. Its population-qualified ID distinguishes appearances across claims
 * and references, while selection state separates required units from
 * addressable structural ancestors.
 *
 * @evidence contracts/common.md#principled-implementation One row per unit and population carries canonical target, aliases, selection and locations for authors choosing a target.
 * @evidence contracts/common.md#clear-and-simple-design Rows reference scope and unit IDs without embedding inventory records.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Ancestor rows are labeled by selection rather than counted as required units.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the row; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceListItem {
  /**
   * Query-row identity combining configuration scope and semantic unit
   * identity.
   *
   * The same unit in another configured population receives a different row ID.
   */
  id: string;

  /**
   * Configured claim or reference boundary containing this row.
   *
   * Coverage and selection must be interpreted within this boundary.
   */
  scope: IEvidenceQueryScope;

  /**
   * Semantic identity assigned by extraction and inventory normalization.
   *
   * Aliases and merged declaration sites retain this identity without adding
   * units.
   */
  unitId: string;

  /**
   * Artifact-specific declaration kind used by symbol selection.
   *
   * List filtering compares this value without changing the underlying
   * analysis.
   */
  symbol: EvidenceSymbol;

  /**
   * Declaration name retained for human-readable output.
   *
   * Use target or aliases for citations because a local name alone may be
   * ambiguous.
   */
  name: string;

  /**
   * Relationship of the identity to the configured symbol selection.
   *
   * Ancestors support aggregate addressing without entering the selected
   * denominator; inspection can also expose an unselected child or hidden
   * candidate.
   */
  selection: EvidenceUnitSelection;

  /**
   * First deterministically ordered public target spelling for this row.
   *
   * It follows the artifact grammar and query base directory where applicable.
   */
  target: string;

  /**
   * All accepted public spellings, deduplicated and sorted.
   *
   * This includes target itself; choosing another alias does not change
   * semantic identity.
   */
  aliases: string[];

  /**
   * Physical declaration locations contributing to the identity.
   *
   * Merged declarations retain multiple sites even when list output contains
   * one row.
   */
  locations: IEvidenceSourceLocation[];
}
