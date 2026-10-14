import type { IEvidenceGraphClaim } from "./IEvidenceGraphClaim";

/**
 * Materialized populations and resolutions ready for graph policy evaluation.
 *
 * The checker has already loaded sources, extracted inventories, and resolved
 * targets. `EvidenceGraph` consumes this record without source IO. Direct
 * callers must provide consistent identity and ownership records; a resolved
 * status alone cannot grant coverage to a unit absent from its reference
 * inventory.
 *
 * @example
 *   // There are no obligations to evaluate until a materialized claim is supplied.
 *   const input: IEvidenceGraphInput = { claims: [] };
 *   const result: IEvidenceGraphResult = EvidenceGraph.evaluate(input);
 *   // result.success is true and result.claims is empty.
 *
 * @evidence contracts/common.md#principled-implementation The evaluator's input is the list of materialized claims, each owning its independent references.
 * @evidence contracts/common.md#clear-and-simple-design Materialization is complete before evaluation, so the input holds data only and evaluation reads no files.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No precomputed coverage or consumer flag is accepted as input.
 * @evidence contracts/common.md#meaningful-documentation The comment explains that inputs are fully materialized; the field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGraphInput {
  /**
   * Claim populations with independently configured reference obligations.
   *
   * Preserve repeated claims and references rather than merging equal file
   * sets. An empty direct graph input has no obligations and evaluates
   * successfully.
   */
  claims: IEvidenceGraphClaim[];
}
