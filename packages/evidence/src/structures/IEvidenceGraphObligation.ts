import type { IEvidenceGraphEdge } from "./IEvidenceGraphEdge";
import type { IEvidenceGraphHostCoverage } from "./IEvidenceGraphHostCoverage";

/**
 * Coverage ledger for one independently evaluated claim/reference pair.
 *
 * The selected, covered, and missing ID lists preserve the denominator and its
 * outcome. Accepted edges explain how statements contributed coverage.
 * Checklist mode additionally records each host's answers instead of pooling
 * them across the claim.
 *
 * Activation and completeness are separate: an inactive obligation is skipped,
 * while an incomplete active obligation cannot establish a coverage pass. A
 * complete obligation can still fail because selected units remain missing.
 *
 * @evidence contracts/common.md#principled-implementation One ledger per claim/reference pair holds the denominator, covered and missing identities, accepted edges and checklist ledgers.
 * @evidence contracts/common.md#clear-and-simple-design Only identities and edges are stored; unit records stay in inventories.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Inactive and incomplete obligations keep their flags so empty lists are never read as passing.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the independent ledger; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphObligation {
  /**
   * Zero-based authored index of the owning claim.
   *
   * This attributes the result after inactive entries have been filtered and
   * distinguishes claims that happen to share files or labels.
   */
  claim: number;

  /**
   * Zero-based authored reference index within the claim.
   *
   * Repeated reference entries keep separate indices, policies, and coverage
   * even when they require the same semantic target population.
   */
  reference: number;

  /**
   * Whether this obligation participates in coverage evaluation.
   *
   * Skipped obligations retain their boundary but contribute no active coverage
   * requirement. This does not by itself describe extraction completeness.
   */
  active: boolean;

  /**
   * Whether analysis was sufficient to evaluate this obligation.
   *
   * Incomplete inventories or resolution data cannot establish a successful
   * denominator. Missing evidence in a fully analyzed population is a separate
   * state.
   */
  complete: boolean;

  /**
   * Selected semantic identities forming this obligation's denominator.
   *
   * Public aliases and unselected structural ancestors do not add entries.
   * Other references select and evaluate their own ID lists independently.
   */
  unitIds: string[];

  /**
   * Selected identities acknowledged under this reference's policy.
   *
   * Coverage belongs to this boundary. The same identity may remain missing in
   * a stricter reference or under a different claim.
   */
  coveredUnitIds: string[];

  /**
   * Selected identities still lacking required acknowledgement.
   *
   * These are uncovered requirements, not unresolved source declarations.
   * Inspect completeness before interpreting a partial evaluation's coverage
   * lists.
   */
  missingUnitIds: string[];

  /**
   * Accepted acknowledgement relationships contributing to this obligation.
   *
   * Each edge retains its source host, named target, and covered selected
   * units. Review records do not appear here as substitute coverage.
   */
  edges: IEvidenceGraphEdge[];

  /**
   * Per-host answer coverage when this obligation uses checklist mode.
   *
   * Ordinary obligations leave the list empty. Checklist entries preserve
   * missing answers for each host even when another host covers the same target
   * item.
   */
  hostCoverage: IEvidenceGraphHostCoverage[];
}
