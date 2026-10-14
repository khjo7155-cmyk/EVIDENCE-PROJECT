import type { EvidenceCommandExitCode } from "../typings/EvidenceCommandExitCode";

/**
 * Buffered output and process status returned by command execution.
 *
 * The CLI boundary writes these strings to their respective streams. Keeping
 * execution separate from process I/O also lets callers inspect command
 * behavior without replacing global streams or spawning another process.
 *
 * @evidence contracts/common.md#principled-implementation Buffered stdout, stderr and exit code separate command execution from process I/O, so callers inspect behavior without replacing global streams.
 * @evidence contracts/common.md#clear-and-simple-design Only the CLI boundary writes these strings; execution returns them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No global stream or process state is patched to observe output.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the separation; each field documents its channel and content.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCommandResult {
  /**
   * Outcome to propagate to the invoking process.
   *
   * Zero succeeds, one reports completed check errors, and two reports an
   * operational failure or incomplete analysis.
   */
  exitCode: EvidenceCommandExitCode;

  /**
   * Content prepared for the standard output stream.
   *
   * The string already includes its intended formatting and line endings; it
   * may be empty when output was written to a requested file.
   */
  stdout: string;

  /**
   * Content prepared for the standard error stream.
   *
   * Human-readable operational failures use this channel, while requested JSON
   * failures remain structured command output.
   */
  stderr: string;
}
