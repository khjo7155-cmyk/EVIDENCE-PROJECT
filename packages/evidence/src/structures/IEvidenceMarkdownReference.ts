import type { EvidenceMarkdownSymbol } from "../typings/EvidenceMarkdownSymbol";
import type { IEvidenceReferenceBase } from "./IEvidenceReferenceBase";

/**
 * Markdown documents or outline items required by the owning claim.
 *
 * Ordinary coverage lets a citation acknowledge a selected section and its
 * selected descendants. `checklist` adds a host dimension: every selected claim
 * host must independently answer every selected Markdown item, and positive
 * evidence answers only the named item.
 *
 * Use checklist mode for a review form each declaration must complete, rather
 * than a requirement that any one implementation may satisfy. Configuration
 * validation rejects cardinality and carrier combinations that conflict with
 * this per-host interpretation.
 *
 * @example
 *   // With two selected test functions and three checklist headings, each
 *   // function owes three answers. Six required answers cannot be pooled into
 *   // three citations supplied by only one of the functions.
 *
 * @evidence contracts/common.md#principled-implementation Markdown files plus an optional checklist flag specialize the reference base for outline evidence.
 * @evidence contracts/common.md#clear-and-simple-design Only files and checklist are added; shared policy comes from the base.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Checklist incompatibilities are validated at configuration loading rather than ignored.
 * @evidence contracts/common.md#meaningful-documentation The comment explains selection; each field documents rooted addresses and checklist semantics.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceMarkdownReference extends IEvidenceReferenceBase<
  "markdown",
  EvidenceMarkdownSymbol
> {
  /**
   * Markdown source globs relative to the reference root.
   *
   * Selection uses the claim glob rules. Every matching regular file is parsed
   * regardless of extension, so explicitly exclude non-Markdown assets.
   */
  files: string[];

  /**
   * Require every selected claim host to answer every selected Markdown item.
   *
   * - Hosts without tags still owe every item.
   * - Positive evidence answers only the named item, with no descendant coverage.
   *   Aggregate targets naming no selected item are rejected.
   * - Exclusions retain descendant coverage unless noEvidenceExclude refuses
   *   them.
   * - Duplicates and conflicts are evaluated per host. Different hosts may give
   *   different answers to the same item.
   * - Tags without a selected host answer nothing here. Report them only if no
   *   other obligation consumes them.
   * - Reject uniqueEvidence and singleEvidencePerSymbol at configuration time.
   * - Exclusion-carrier globs require noEvidenceExclude alongside this option.
   * - With requireReview, each answer is reviewed against that item's
   *   fingerprint; changing an item expires the answers to it.
   *
   * @default false
   */
  checklist?: boolean;
}
