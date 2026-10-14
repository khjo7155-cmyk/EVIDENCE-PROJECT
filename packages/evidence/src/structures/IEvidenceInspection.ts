import type { EvidenceTargetResolutionStatus } from "../typings/EvidenceTargetResolutionStatus";
import type { IEvidenceDiagnostic } from "./IEvidenceDiagnostic";
import type { IEvidenceInspectedAcknowledgement } from "./IEvidenceInspectedAcknowledgement";
import type { IEvidenceInspectedObligation } from "./IEvidenceInspectedObligation";
import type { IEvidenceInspectedReview } from "./IEvidenceInspectedReview";
import type { IEvidenceInspectedUnit } from "./IEvidenceInspectedUnit";
import type { IEvidenceQueryScope } from "./IEvidenceQueryScope";
import type { IEvidenceWithdrawal } from "./IEvidenceWithdrawal";

/**
 * Resolution and evidence context for a target within one configured
 * population.
 *
 * Candidate units retain structural and fingerprint details even when
 * resolution is ambiguous or hidden. Incoming acknowledgements, reviews, and
 * obligation state are gathered within the same reference boundary rather than
 * pooled across unrelated claims.
 *
 * @evidence contracts/common.md#principled-implementation Per-population inspection gathers status, addresses, candidates, withdrawals, obligations, acknowledgements, reviews and diagnostics for one target.
 * @evidence contracts/common.md#clear-and-simple-design Each concern is a separate collection, so renderers present them independently.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Withdrawals explain hidden candidates instead of silently omitting them.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the per-population scope; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceInspection {
  /**
   * Claim or reference population against which the target was resolved.
   *
   * This boundary determines selection, target grammar, and related
   * obligations.
   */
  scope: IEvidenceQueryScope;

  /**
   * Parsing, visibility, and uniqueness result for this population.
   *
   * Candidate details do not imply successful resolution when the status is
   * ambiguous or hidden.
   */
  status: EvidenceTargetResolutionStatus;

  /**
   * Deduplicated, sorted target spellings derived from attempted public
   * addresses.
   *
   * Formatting follows the artifact grammar and the query's base directory
   * where applicable.
   */
  addresses: string[];

  /**
   * Candidate identities with declaration, child, host, and fingerprint
   * context.
   *
   * Resolution failures with no semantic candidate leave this collection empty.
   */
  units: IEvidenceInspectedUnit[];

  /**
   * Withdrawal annotations explaining hidden target candidates.
   *
   * Original locations remain available when exclusion was inherited from a
   * parent.
   */
  withdrawals: IEvidenceWithdrawal[];

  /**
   * Reference obligation states associated with inspected selected units or
   * ancestors.
   *
   * Claim populations and identities outside the reference selection contribute
   * no entries.
   */
  obligations: IEvidenceInspectedObligation[];

  /**
   * Accepted incoming acknowledgements that name or cover the inspected
   * identities.
   *
   * These are scoped to this reference; refused or unresolved statements are
   * not accepted edges.
   */
  acknowledgements: IEvidenceInspectedAcknowledgement[];

  /**
   * Incoming reviews whose resolved candidate scopes contain inspected
   * identities.
   *
   * Resolution status is retained; appearing here does not prove freshness or
   * acknowledgement pairing.
   */
  reviews: IEvidenceInspectedReview[];

  /**
   * Target-resolution findings attributed to this configuration scope.
   *
   * The enclosing report combines these with diagnostics from the original
   * check.
   */
  diagnostics: IEvidenceDiagnostic[];
}
