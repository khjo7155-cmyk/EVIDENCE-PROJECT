/**
 * Invalid CLI syntax detected before configuration or source loading.
 *
 * The command parser uses this error for unknown, repeated, missing, or
 * incompatible arguments. Buffered execution turns it into actionable failure
 * output so malformed commands cannot trigger an unrelated project analysis.
 *
 * @evidence contracts/common.md#principled-implementation A dedicated error class marks invalid CLI syntax detected before configuration or source loading.
 * @evidence contracts/common.md#clear-and-simple-design The class carries only the message; rendering adds help guidance.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Malformed commands fail before any analysis can run.
 * @evidence contracts/common.md#meaningful-documentation The class and constructor comments explain when it is thrown and how it is rendered.
 * @evidenceExclude contracts/performance.md#efficient-algorithms An error class chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Constructing an error computes nothing worth sharing.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The error holds only its message and cause and no external resource.
 */
export class EvidenceCommandError extends Error {
  /**
   * Records the concrete argument failure for command-level repair guidance.
   *
   * The caller supplies the offending option or operation context; the command
   * boundary adds the general help instruction when rendering the failure.
   */
  public constructor(message: string) {
    super(message);
    this.name = "EvidenceCommandError";
  }
}
