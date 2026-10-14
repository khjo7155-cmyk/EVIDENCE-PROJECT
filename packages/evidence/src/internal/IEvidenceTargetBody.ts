/**
 * The target token and remaining authored explanation from one annotation body.
 *
 * Splitting happens before artifact-specific parsing so whitespace in prose
 * cannot alter a target's grammar or its diagnostic location.
 *
 * @evidence contracts/common.md#principled-implementation The target token and remaining text split an annotation body into its two authored parts.
 * @evidence contracts/common.md#clear-and-simple-design Splitting is done by EvidenceTargetBody; this is its result.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The remainder is preserved as written.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the split; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceTargetBody {
  /**
   * Non-whitespace target token as authored, before target resolution.
   *
   * Artifact-specific target parsing consumes this spelling while its original
   * boundary remains available for precise diagnostics.
   */
  target: string;

  /**
   * Trimmed explanatory prose after the target.
   *
   * It may be empty and never participates in target grammar, selection, or
   * resolution.
   */
  remainder: string;
}
