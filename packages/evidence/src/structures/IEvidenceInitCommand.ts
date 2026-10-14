/**
 * Parsed request to create a starter Evidence configuration.
 *
 * Execution resolves the destination from command cwd and creates it
 * exclusively. Existing files are refused so initialization cannot overwrite an
 * authored policy.
 *
 * @evidence contracts/common.md#principled-implementation Init needs a working directory and a destination path, defaulted during parsing.
 * @evidence contracts/common.md#clear-and-simple-design The record holds options only; file creation is in the command module.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The destination is never overwritten implicitly; the command refuses existing files.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the request; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceInitCommand {
  /**
   * Discriminator selecting configuration creation.
   *
   * Initialization writes a starter contract without running an Evidence Graph
   * check.
   */
  operation: "init";

  /**
   * Working directory anchoring the configuration destination.
   *
   * The command resolves this against its invocation base without changing
   * process cwd.
   */
  cwd: string;

  /**
   * New configuration path, defaulting to evidence.config.ts during parsing.
   *
   * Execution validates the supported file format and rejects an existing
   * destination.
   */
  config: string;
}
