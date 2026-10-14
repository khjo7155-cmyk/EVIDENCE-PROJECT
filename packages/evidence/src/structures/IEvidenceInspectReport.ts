import type { EvidenceCheckStatus } from "../typings/EvidenceCheckStatus";
import type { EvidenceCommandExitCode } from "../typings/EvidenceCommandExitCode";
import type { IEvidenceDiagnostic } from "./IEvidenceDiagnostic";
import type { IEvidenceInspection } from "./IEvidenceInspection";

/**
 * Versioned target-resolution report across applicable configured populations.
 *
 * Each inspection retains its own scope because identical target spellings can
 * occur in independent references. Success requires every inspected boundary to
 * resolve and the underlying analysis to pass; unavailable analysis takes
 * precedence over ordinary target-resolution failures.
 *
 * @evidence contracts/common.md#principled-implementation A versioned report combines check status with target-resolution outcomes across populations.
 * @evidence contracts/common.md#clear-and-simple-design Inspections are per population; the report adds status and the authored target.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Incomplete analysis takes priority over unresolved targets in the exit code.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the report; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceInspectReport {
  /**
   * Serialization version of the inspection report.
   *
   * Consumers inspect this before interpreting population-specific detail
   * records.
   */
  schemaVersion: 1;

  /**
   * Discriminator identifying target-inspection output.
   *
   * The report expands one requested target rather than listing all
   * discoverable units.
   */
  command: "inspect";

  /**
   * Configuration path anchoring the analyzed populations.
   *
   * Scope indices and inherited diagnostics refer to this check configuration.
   */
  configFile: string;

  /**
   * Combined completeness of the original check and target resolutions.
   *
   * Any incomplete inspection makes the report incomplete even if other
   * boundaries resolve.
   */
  status: EvidenceCheckStatus;

  /**
   * Whether all inspected targets resolve and the combined outcome passes.
   *
   * An empty inspection set cannot establish success, nor can successful
   * resolution hide an error from the underlying check.
   */
  success: boolean;

  /**
   * Outcome prioritizing incomplete analysis over unresolved targets.
   *
   * Incomplete analysis returns two, unresolved complete inspection returns
   * one, and fully resolved inspection inherits the check's outcome.
   */
  exitCode: EvidenceCommandExitCode;

  /**
   * Exact authored target supplied to the query.
   *
   * Population entries retain their normalized address candidates separately.
   */
  target: string;

  /**
   * Resolution and graph context for each applicable population boundary.
   *
   * Entries are ordered by scope identity so asynchronous resolution stays
   * deterministic.
   */
  inspections: IEvidenceInspection[];

  /**
   * Deduplicated findings from the check and the individual target inspections.
   *
   * These explain both global analysis failures and target-specific resolution
   * problems.
   */
  diagnostics: IEvidenceDiagnostic[];
}
