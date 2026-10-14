import type { EvidenceTargetResolutionStatus } from "../typings/EvidenceTargetResolutionStatus";
import type { IEvidenceAddress } from "./IEvidenceAddress";
import type { IEvidenceDiagnostic } from "./IEvidenceDiagnostic";
import type { IEvidenceUnit } from "./IEvidenceUnit";
import type { IEvidenceWithdrawal } from "./IEvidenceWithdrawal";

/**
 * Resolution outcome for an authored target within one reference population.
 *
 * The resolver retains attempted addresses and candidate units even when it
 * cannot accept a unique visible target. Diagnostics distinguish malformed
 * spelling, unavailable files, selection boundaries, and incomplete extraction
 * so callers do not report every failure as a missing member.
 *
 * @evidence contracts/common.md#principled-implementation Status, attempted addresses, units, withdrawals and diagnostics explain a target's resolution within one reference.
 * @evidence contracts/common.md#clear-and-simple-design Resolution output is separate from evaluation.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Failed resolutions keep their reason and diagnostics.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the outcome; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceTargetResolution {
  /**
   * Classification of target parsing, population lookup, or access failure.
   *
   * Only a resolved outcome establishes a unique visible target; coverage and
   * review policy still need to be evaluated afterward.
   */
  status: EvidenceTargetResolutionStatus;

  /**
   * Candidate public addresses produced by the artifact's target grammar.
   *
   * File-qualified targets can produce several absolute paths when a merged
   * host retains multiple origins. Synthetic artifact grammars retain their own
   * file keys, and malformed targets may produce no addresses.
   */
  addresses: IEvidenceAddress[];

  /**
   * Semantic candidates retained by the resolution outcome.
   *
   * Resolved results identify one visible unit; ambiguity retains competitors.
   * Hidden results retain withdrawn candidates for an actionable explanation.
   */
  units: IEvidenceUnit[];

  /**
   * Withdrawal annotations explaining hidden candidate identities.
   *
   * Locations can belong to structural ancestors whose withdrawal propagates
   * into the cited declaration.
   */
  withdrawals: IEvidenceWithdrawal[];

  /**
   * Findings explaining why resolution could not establish an accepted target.
   *
   * Incomplete outcomes retain underlying inventory failures so lost extraction
   * cannot masquerade as an ordinary empty selection.
   */
  diagnostics: IEvidenceDiagnostic[];
}
