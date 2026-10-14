import type { EvidenceReportFormat } from "../typings/EvidenceReportFormat";

/**
 * Parsed request for certified programming and database capability metadata.
 *
 * This command does not load configuration or analyze project files. Its
 * working directory exists only to resolve an optional report destination.
 *
 * @evidence contracts/common.md#principled-implementation The languages command needs only cwd, format and output because it loads no configuration.
 * @evidence contracts/common.md#clear-and-simple-design The record holds options only.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No configuration is read, so no grammar is acquired by this command.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the request; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLanguagesCommand {
  /**
   * Discriminator selecting the certified capability catalog.
   *
   * Grammar-only candidates are excluded from this supported-language report.
   */
  operation: "languages";

  /**
   * Working directory used to resolve the output destination.
   *
   * It does not select project populations because the catalog is
   * configuration-independent.
   */
  cwd: string;

  /**
   * Text or JSON presentation of adapter capabilities.
   *
   * Parsing defaults to text and rejects formats outside the report vocabulary.
   */
  format: EvidenceReportFormat;

  /**
   * Optional destination file for capability output.
   *
   * Omission sends the formatted catalog to standard output without source
   * analysis.
   */
  output?: string;
}
