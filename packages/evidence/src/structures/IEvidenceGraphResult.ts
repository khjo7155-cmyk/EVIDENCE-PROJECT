import type { IEvidenceDiagnostic } from "./IEvidenceDiagnostic";
import type { IEvidenceGraphClaimResult } from "./IEvidenceGraphClaimResult";

/**
 * Serializable outcome of one materialized graph evaluation.
 *
 * Claims retain their independent reference ledgers, while diagnostics collect
 * the findings needed to explain failures across the graph. The result contains
 * policy evaluation data; command status, severity aggregation, and rendering
 * are supplied by later reporting layers.
 *
 * A result succeeds only when every active boundary is complete and no findings
 * remain. Merely obtaining an empty missing-unit list from partial input does
 * not establish success.
 *
 * @evidence contracts/common.md#principled-implementation Success, per-claim results and deduplicated diagnostics are the complete serializable outcome of evaluation.
 * @evidence contracts/common.md#clear-and-simple-design Report shaping is left to the check programmer.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Success requires completeness and no findings; it is not derived from counts alone.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the outcome; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphResult {
  /**
   * Whether all active evaluation boundaries are complete and finding-free.
   *
   * Inactive claims do not make the graph incomplete. Any retained diagnostic
   * or active incomplete obligation prevents this flag from becoming true.
   */
  success: boolean;

  /**
   * Per-claim outcomes with their independent reference obligations.
   *
   * The original claim indices remain in each record for attribution. Repeated
   * references are preserved rather than merged into one aggregate coverage
   * set.
   */
  claims: IEvidenceGraphClaimResult[];

  /**
   * Deduplicated findings from extraction integrity and policy evaluation.
   *
   * Finalization includes findings that depend on cross-reference
   * participation. Consumers can render them without rerunning the graph
   * traversal.
   */
  diagnostics: IEvidenceDiagnostic[];
}
