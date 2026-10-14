import type { IEvidenceConfigPlanClaim } from "./IEvidenceConfigPlanClaim";
import type { IEvidenceConfigReport } from "./IEvidenceConfigReport";

/**
 * Validated configuration prepared for source materialization.
 *
 * `EvidenceConfigLoader.plan` resolves inherited severity and default symbol
 * selectors and retains enabled claims and references. The checker consumes
 * this plan to load sources; it has not yet extracted declarations or evaluated
 * coverage. Authored indices survive filtering for accurate diagnostics.
 *
 * A plan may contain no enabled claims even though the original configuration
 * required a nonempty claim array. Disabled or off declarations are validated
 * before that filtering takes place.
 *
 * @evidence contracts/common.md#principled-implementation A validated plan with resolved severities and selectors separates configuration semantics from source materialization.
 * @evidence contracts/common.md#clear-and-simple-design Planning output holds only enabled claims and report bounds; extraction and evaluation happen later.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Authored indices survive filtering so diagnostics never point at renumbered entries.
 * @evidence contracts/common.md#meaningful-documentation The comment explains what planning resolves and that an empty plan is possible; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceConfigPlan {
  /**
   * Canonical configuration path anchoring relative population roots.
   *
   * Materialization uses its directory instead of the current working
   * directory, keeping programmatic evaluation consistent with configuration
   * loading.
   */
  configFile: string;

  /**
   * Enabled claims with effective policy and selectors.
   *
   * Entries retain their original configuration indices. Filtering inactive
   * claims does not renumber later diagnostics or merge overlapping
   * populations.
   */
  claims: IEvidenceConfigPlanClaim[];

  /**
   * Report bounds authored in the configuration.
   *
   * Omission means the configuration requested no narrowing.
   */
  report?: IEvidenceConfigReport;
}
