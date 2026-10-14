/**
 * Optional diagnostic routing for isolated TypeScript configuration evaluation.
 *
 * `evaluateTypeScriptConfig` passes this sink to its child evaluator so callers
 * can collect or redirect compiler and runtime output without changing the
 * evaluated configuration result.
 *
 * @evidence contracts/common.md#principled-implementation An optional diagnostic writer routes compiler output without the evaluator owning a stream.
 * @evidence contracts/common.md#clear-and-simple-design The option holds only routing; evaluation is in evaluateTypeScriptConfig.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No global stream is replaced to capture diagnostics.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the routing; the field documents omission.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEvaluateTypeScriptConfigOptions {
  /**
   * Receives each stdout or stderr chunk emitted by the evaluator process.
   *
   * When omitted, evaluation writes diagnostics to the parent process's stderr
   * and preserves the child process's original formatting.
   */
  writeDiagnostic?: ((content: string) => void) | undefined;
}
