/**
 * Comment-normalization rules supplied by an artifact adapter.
 *
 * The adapter must first establish that a source span is a documentation
 * comment and determine its host. EvidenceDocumentation uses these rules to
 * remove known syntax while preserving source mappings; it does not discover
 * comments itself.
 *
 * @evidence contracts/common.md#principled-implementation Explicit delimiters, optional line prefix and two policy flags let one normalizer handle every adapter's comment form while keeping source mappings.
 * @evidence contracts/common.md#clear-and-simple-design Discovery and host attachment stay in adapters; this record only parameterizes normalization.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Delimiter mismatches reject the span instead of stripping unrelated characters.
 * @evidence contracts/common.md#meaningful-documentation The comment explains that adapters establish the span first; each field documents its effect.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCommentSyntax {
  /**
   * Exact opening delimiter expected at the supplied source span's start.
   *
   * A mismatch rejects the span instead of stripping unrelated source
   * characters.
   */
  opening: string;

  /**
   * Exact closing delimiter expected at the source span's end.
   *
   * An empty delimiter supports forms whose adapter already bounded the comment
   * without a closing token.
   */
  closing: string;

  /**
   * Optional decoration removed after horizontal whitespace at each line start.
   *
   * Lines lacking the prefix keep their original leading text. Omission
   * disables this removal while retaining delimiter normalization.
   */
  linePrefix?: string;

  /**
   * Whether unrelated line-start tags end the current annotation's reason.
   *
   * Enable this for JSDoc-like carriers where other tools' tags share the
   * comment.
   */
  tagBoundaries: boolean;

  /**
   * Whether withdrawal annotations have a supported declaration owner here.
   *
   * The adapter determines eligibility from attachment; normalization must not
   * infer public API ownership from the presence of tag text alone.
   */
  allowWithdrawal: boolean;
}
