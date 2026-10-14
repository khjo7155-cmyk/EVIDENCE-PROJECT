/**
 * JSON envelope for a command that could not produce its normal report.
 *
 * Configuration loading, dependency, and execution failures use this shape so
 * machine consumers still receive structured output. It is distinct from a
 * completed check whose ordinary report contains coverage errors.
 *
 * @evidence contracts/common.md#principled-implementation A versioned failure envelope with fixed status, success and exit code keeps operational failures structured and distinct from completed checks.
 * @evidence contracts/common.md#clear-and-simple-design The envelope holds only identity, message and repair; the caught error is translated once by the command layer.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts success is the literal false and exitCode the literal 2, so no failure can be read as a pass.
 * @evidence contracts/common.md#meaningful-documentation The comment explains when the envelope is used; each field documents its role.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCommandFailure {
  /**
   * Version of the failure envelope's serialization contract.
   *
   * Consumers should inspect it before interpreting the remaining fields.
   */
  schemaVersion: 1;

  /**
   * Requested analysis operation that failed.
   *
   * This retains the command identity even though its normal report is
   * unavailable.
   */
  command: "check" | "graph" | "inspect" | "list";

  /**
   * Discriminator identifying an operational failure.
   *
   * The normal check report instead describes analysis as complete or
   * incomplete.
   */
  status: "failed";

  /**
   * Failed outcome exposed to consumers that inspect a common success field.
   *
   * No operational failure can certify coverage or a successful query.
   */
  success: false;

  /**
   * Process status reserved for unavailable or incomplete analysis.
   *
   * Exit code one is reserved for a completed check containing error findings.
   */
  exitCode: 2;

  /**
   * Resolved configuration path associated with the attempted command.
   *
   * It remains available when loading that file was itself the failing
   * operation.
   */
  configFile: string;

  /**
   * Explanation derived from the caught operational error.
   *
   * This describes why the command could not produce its requested report.
   */
  message: string;

  /**
   * Guidance for correcting the failure and rerunning the command.
   *
   * Recovery requires a complete new analysis rather than treating partial work
   * from the failed command as a successful result.
   */
  repair: string;
}
