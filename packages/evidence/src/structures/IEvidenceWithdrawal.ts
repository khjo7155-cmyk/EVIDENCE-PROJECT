import type { IEvidenceSourceLocation } from "./IEvidenceSourceLocation";

/**
 * Source annotation withdrawing a declaration from the public population.
 *
 * Inventory selection propagates withdrawal through structural descendants
 * while retaining the original location. A citation can then explain why a
 * declaration is hidden instead of presenting an excluded API as an unknown
 * name.
 *
 * @evidence contracts/common.md#principled-implementation The withdrawal tag and its location record why a declaration left the public population.
 * @evidence contracts/common.md#clear-and-simple-design Withdrawals are retained on units and resolutions for explanations.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only the three documented tags are recognized.
 * @evidence contracts/common.md#meaningful-documentation The comment explains withdrawal; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceWithdrawal {
  /**
   * Authored withdrawal directive accepted at a declaration documentation host.
   *
   * The three spellings share exclusion behavior but remain distinguishable in
   * the retained annotation record.
   */
  tag: "internal" | "hidden" | "ignore";

  /**
   * Source location of the directive causing withdrawal.
   *
   * Descendant exclusions keep this origin so diagnostics point to the
   * authoring decision rather than an arbitrary child declaration.
   */
  location: IEvidenceSourceLocation;
}
