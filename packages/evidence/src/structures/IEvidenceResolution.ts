import type { IEvidenceUnit } from "./IEvidenceUnit";
import type { IEvidenceWithdrawal } from "./IEvidenceWithdrawal";

/**
 * Exact inventory lookup within a selected population's structural scope.
 *
 * This lower-level result assumes the public address has already been parsed.
 * It deduplicates aliases by semantic identity and preserves withdrawn matches.
 * Incomplete inventory takes precedence because partial extraction cannot prove
 * either uniqueness or absence.
 *
 * @evidence contracts/common.md#principled-implementation Exact lookup status with units and withdrawals is the inventory-level result of resolving an address within a scope.
 * @evidence contracts/common.md#clear-and-simple-design Inventory resolution is separate from file-target parsing and diagnostics.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No global name search is performed; only exact addresses resolve.
 * @evidence contracts/common.md#meaningful-documentation The comment explains exact lookup; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceResolution {
  /**
   * Visibility and uniqueness outcome of the address lookup.
   *
   * Missing means no matching scope was found in a complete inventory;
   * incomplete means the available candidates cannot establish a trustworthy
   * answer.
   */
  status: "resolved" | "ambiguous" | "hidden" | "missing" | "incomplete";

  /**
   * Visible matches, or withdrawn matches when no visible match exists.
   *
   * Multiple aliases of one identity produce one entry; distinct identities can
   * remain ambiguous at the same public address.
   */
  units: IEvidenceUnit[];

  /**
   * Deduplicated withdrawal records associated with hidden matches.
   *
   * These identify the source annotations responsible for inherited exclusion.
   */
  withdrawals: IEvidenceWithdrawal[];
}
