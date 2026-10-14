import type { EvidenceReportFormat } from "../typings/EvidenceReportFormat";

/**
 * Parsed request to resolve one target and explain its graph context.
 *
 * Inspection analyzes the configured populations before collecting candidates,
 * related obligations, acknowledgements, and reviews. Target spelling follows
 * the applicable artifact grammar, with file-qualified paths based on the
 * command cwd.
 *
 * @evidence contracts/common.md#principled-implementation Inspection takes one authored target plus the shared cwd, config, format and output options.
 * @evidence contracts/common.md#clear-and-simple-design The record holds options only; resolution and rendering live elsewhere.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The target is kept as authored text and resolved per population.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the request; each field documents resolution and default.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceInspectCommand {
  /**
   * Discriminator selecting detailed target inspection.
   *
   * Parsing requires exactly one positional target for this operation.
   */
  operation: "inspect";

  /**
   * Authored target token to resolve in applicable populations.
   *
   * Resolution preserves this spelling in the report alongside normalized
   * addresses.
   */
  target: string;

  /**
   * Working directory resolved from the invocation base.
   *
   * File-qualified query targets use this anchor rather than a source comment's
   * origin.
   */
  cwd: string;

  /**
   * Configuration path interpreted within the command directory.
   *
   * Omission discovers evidence.config.ts before evidence.config.json with
   * absence-only fallback. An explicit path selects only that file.
   */
  config?: string;

  /**
   * Text or JSON representation requested for inspection details.
   *
   * Both formats preserve the combined check and resolution outcome.
   */
  format: EvidenceReportFormat;

  /**
   * Optional report destination resolved from the command directory.
   *
   * Omission leaves the formatted report in standard output.
   */
  output?: string;
}
