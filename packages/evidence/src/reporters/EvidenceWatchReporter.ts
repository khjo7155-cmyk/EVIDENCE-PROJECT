import { EvidenceReporter } from "./EvidenceReporter";
import type { IEvidenceConfigReport } from "../structures/IEvidenceConfigReport";
import type { EvidenceReportFormat } from "../typings/EvidenceReportFormat";
import type { EvidenceWatchCycle } from "../typings/EvidenceWatchCycle";

/**
 * Serializes published watch cycles for terminal streams and append-only files.
 *
 * Watch output is framed per cycle so a long-lived process can report failures
 * and later recovery without mixing the fields of adjacent evaluations.
 *
 * @evidence contracts/common.md#principled-implementation Watch cycles are framed individually, as text blocks or one NDJSON record each, so failures and recoveries never mix fields.
 * @evidence contracts/common.md#clear-and-simple-design Normal cycles reuse check formatting; the namespace adds cycle framing.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Failure cycles keep configuration context and repair advice instead of an empty report.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains framing; every function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceWatchReporter {
  /**
   * Selects text blocks or NDJSON framing for a published cycle.
   *
   * Both formats end in a newline, allowing the CLI to append each completed
   * publication without buffering the unbounded watch session.
   *
   * @evidence contracts/common.md#principled-implementation The format selects text or NDJSON, each ending in a newline for append-only output.
   * @evidence contracts/common.md#clear-and-simple-design Render only dispatches.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No session-wide buffering occurs.
   * @evidence contracts/common.md#meaningful-documentation The comment explains appending without buffering.
   * @evidence contracts/performance.md#efficient-algorithms Rendering is linear in the report's size.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each report is rendered once per output.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Rendering returns a string and keeps nothing; the caller owns the output.
   */
  export function render(
    cycle: EvidenceWatchCycle,
    format: EvidenceReportFormat,
    window: IEvidenceConfigReport = {},
  ): string {
    const bounded: EvidenceWatchCycle =
      cycle.status === "failed"
        ? cycle
        : { ...cycle, report: EvidenceReporter.narrow(cycle.report, window) };
    return format === "json" ? json(bounded) : text(bounded);
  }

  /**
   * Emits one complete cycle as a single NDJSON record.
   *
   * Compact JSON prevents line-oriented consumers from mistaking indentation in
   * a report for a record boundary while preserving the cycle envelope.
   *
   * @evidence contracts/common.md#principled-implementation Compact JSON makes each cycle one NDJSON line.
   * @evidence contracts/common.md#clear-and-simple-design JSON output is the plain compact serialization.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Indentation is avoided so line consumers never split a record.
   * @evidence contracts/common.md#meaningful-documentation The comment explains why output is compact.
   * @evidence contracts/performance.md#efficient-algorithms Rendering is linear in the report's size.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each report is rendered once per output.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Rendering returns a string and keeps nothing; the caller owns the output.
   */
  export function json(cycle: EvidenceWatchCycle): string {
    return JSON.stringify(cycle) + "\n";
  }

  /**
   * Renders a readable cycle heading followed by its report or failure
   * guidance.
   *
   * Normal cycles reuse check formatting. A preparation failure has no check
   * report, so it instead preserves configuration context and repair advice.
   *
   * @evidence contracts/common.md#principled-implementation A cycle heading is followed by the check text or the failure's configuration context and repair.
   * @evidence contracts/common.md#clear-and-simple-design Check cycles reuse EvidenceReporter.text.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Failures are shown as failures, not as empty reports.
   * @evidence contracts/common.md#meaningful-documentation The comment explains both cycle kinds.
   * @evidence contracts/performance.md#efficient-algorithms Rendering is linear in the report's size.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each report is rendered once per output.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Rendering returns a string and keeps nothing; the caller owns the output.
   */
  export function text(cycle: EvidenceWatchCycle): string {
    const heading = `Evidence Graph watch cycle ${cycle.cycle} (${cycle.status}).\n`;
    if (cycle.status !== "failed")
      return heading + EvidenceReporter.text(cycle.report);
    return `${heading}Config: ${cycle.configFile}\n${cycle.message}\nRepair: ${cycle.repair}\n`;
  }
}
