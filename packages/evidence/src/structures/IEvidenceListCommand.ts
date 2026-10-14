import type { EvidenceArtifactType } from "../typings/EvidenceArtifactType";
import type { EvidenceReportFormat } from "../typings/EvidenceReportFormat";
import type { EvidenceSymbol } from "../typings/EvidenceSymbol";

/**
 * Parsed request to enumerate addressable units from a configured analysis.
 *
 * Language and kind filter displayed rows after the complete check is analyzed.
 * They do not narrow evaluation or erase diagnostics from populations omitted
 * by the list filters.
 *
 * @evidence contracts/common.md#principled-implementation Listing takes the shared analysis options plus optional language and kind filters.
 * @evidence contracts/common.md#clear-and-simple-design The record holds options only; filtering happens after the full check.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Filters narrow rows only and never the analyzed populations.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the request; each field documents its effect.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceListCommand {
  /**
   * Discriminator selecting target discovery.
   *
   * The result includes public spellings and structural selection state for
   * each row.
   */
  operation: "list";

  /**
   * Command working directory resolved against the invocation base.
   *
   * It anchors configuration, output, and file-qualified target display without
   * mutating the process working directory.
   */
  cwd: string;

  /**
   * Configuration path relative to the resolved command directory.
   *
   * Omission discovers evidence.config.ts before evidence.config.json. A
   * selected invalid file or an explicit path never falls back.
   */
  config?: string;

  /**
   * Text or JSON representation of the discovery report.
   *
   * The parser defaults to text while both formats retain the analysis outcome.
   */
  format: EvidenceReportFormat;

  /**
   * Optional destination file relative to the command directory.
   *
   * Omission returns report content through the command's standard output
   * channel.
   */
  output?: string;

  /**
   * Optional artifact-family filter for returned rows.
   *
   * Omission retains every family; supplied values must have a shipped adapter.
   */
  language?: EvidenceArtifactType;

  /**
   * Optional symbol-kind filter applied to discovered units.
   *
   * Omission retains all kinds; filtering does not recompute the coverage
   * denominator.
   */
  kind?: EvidenceSymbol;
}
