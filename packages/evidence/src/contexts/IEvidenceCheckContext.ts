import type { IEvidenceMaterializedClaim } from "../internal/IEvidenceMaterializedClaim";
import type { IEvidenceConfigPlan } from "../structures/IEvidenceConfigPlan";

/**
 * Captures configuration and adapter output for one checker execution.
 *
 * The checker builds this context after configuration resolution and source
 * materialization. Downstream graph preparation uses both fields together so
 * plan coordinates, selected roots, and parsed declarations refer to one stable
 * run rather than to a mix of later configuration or filesystem state.
 *
 * @evidence contracts/common.md#principled-implementation The plan and materialized claims are the immutable inputs of one checker execution.
 * @evidence contracts/common.md#clear-and-simple-design Readonly fields keep execution state separate from the programmers that consume it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No global state is consulted outside the context.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the execution scope; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCheckContext {
  /**
   * Resolved configuration plan used throughout this checker execution.
   *
   * It retains effective activation and original configuration coordinates,
   * which graph diagnostics use to identify the declaration that created an
   * obligation.
   */
  readonly plan: IEvidenceConfigPlan;

  /**
   * Claim adapter results materialized from the same configuration snapshot.
   *
   * Each entry retains claim and reference inventories before graph evaluation
   * so incomplete scans remain visible instead of being removed during
   * preparation.
   */
  readonly claims: IEvidenceMaterializedClaim[];
}
