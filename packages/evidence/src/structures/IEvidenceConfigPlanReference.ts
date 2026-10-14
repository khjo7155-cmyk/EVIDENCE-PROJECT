import type { EvidenceActiveSeverity } from "../typings/EvidenceActiveSeverity";
import type { EvidenceSymbol } from "../typings/EvidenceSymbol";
import type { IEvidenceReference } from "./IEvidenceReference";

/**
 * One enabled reference prepared to select its required evidence units.
 *
 * The plan keeps the authored reference alongside effective severity and symbol
 * defaults. Materialization uses these resolved settings to construct a target
 * population independently of the claim's host selection or neighboring
 * references.
 *
 * @evidence contracts/common.md#principled-implementation The authored reference plus effective severity and symbols lets materialization build each target population independently.
 * @evidence contracts/common.md#clear-and-simple-design The plan reference holds only its own settings, independent of the claim's host selection.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Resolved settings are stored separately rather than mutating the authored reference.
 * @evidence contracts/common.md#meaningful-documentation The comment explains independence from neighboring references; each field documents its meaning.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceConfigPlanReference {
  /**
   * Zero-based position in the claim's authored reference declaration.
   *
   * Filtering inactive references does not renumber this value. A single
   * reference has index zero after normalization to the execution sequence.
   */
  index: number;

  /**
   * Validated reference retaining its authored artifact settings.
   *
   * Paths and optional policy flags remain available for materialization.
   * Resolved severity and symbol choices are recorded separately rather than
   * written back.
   */
  population: IEvidenceReference;

  /**
   * Active severity after inheriting or overriding the claim's level.
   *
   * Off references do not enter the plan. This severity attributes findings
   * from discovery, extraction, resolution, and coverage to this obligation.
   */
  severity: EvidenceActiveSeverity;

  /**
   * Explicit or artifact-default kinds forming the reference denominator.
   *
   * Unselected real ancestors can still become aggregate resolution scopes
   * after inventory selection; they do not become additional required units.
   */
  symbols: EvidenceSymbol[];
}
