import type { IEvidenceCheckReport } from "./IEvidenceCheckReport";
import type { IEvidenceGraphInput } from "./IEvidenceGraphInput";
import type { IEvidenceGraphResult } from "./IEvidenceGraphResult";

/**
 * Captured inputs, graph evaluation, and report from one checker invocation.
 *
 * `EvidenceChecker.analyze` returns this when callers need queryable context in
 * addition to a check status. List, inspection, and graph queries can explain
 * the same source snapshots without reloading files that may have changed
 * afterward.
 *
 * Each projection has a distinct purpose: graph input retains inventories and
 * policy, graph result retains independent obligations and findings, and report
 * supplies command-facing counts and exit status.
 *
 * @evidence contracts/common.md#principled-implementation Retaining graph input, result and report from one invocation lets queries explain the same snapshots without rereading changed files.
 * @evidence contracts/common.md#clear-and-simple-design Each projection has one purpose: input for inventories and policy, result for obligations, report for command output.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The report is a projection of the same evaluation rather than a second evaluation.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why the analysis is retained and what each member contributes; all members are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCheckAnalysis {
  /**
   * Materialized populations and resolutions supplied to graph evaluation.
   *
   * Queries use the retained inventories to recover unit identities, source
   * locations, aliases, and the policy behind an evaluated obligation.
   */
  graphInput: IEvidenceGraphInput;

  /**
   * Coverage and review evaluation of the captured graph input.
   *
   * Independent claim/reference results remain available for inspection, even
   * when several obligations contribute to one command-level count.
   */
  graph: IEvidenceGraphResult;

  /**
   * Command-facing projection of the same analysis.
   *
   * This supplies counts, diagnostics, status, and exit code without a second
   * evaluation. Reporters render it rather than interpreting adapter records.
   */
  report: IEvidenceCheckReport;
}
