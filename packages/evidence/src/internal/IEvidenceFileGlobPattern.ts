/**
 * One normalized include or exclusion rule in the ordered Evidence glob
 * program.
 *
 * `EvidenceFileGlob` creates these records while compiling configured file
 * patterns, then applies them in order to determine a path's current inclusion
 * decision.
 *
 * @evidence contracts/common.md#principled-implementation Literal path segments with an exclusion flag represent one ordered glob rule for segment-wise matching.
 * @evidence contracts/common.md#clear-and-simple-design Parsing patterns is separate from matching them in EvidenceFileGlob.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No pattern is special-cased; order and exclusion follow the documented grammar.
 * @evidence contracts/common.md#meaningful-documentation The comment explains normalization; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceFileGlobPattern {
  /**
   * Portable relative path segments interpreted by the limited glob matcher.
   *
   * Compilation removes the exclusion marker and normalizes separators before
   * storing these tokens, so matching never depends on host path separators.
   */
  segments: string[];

  /**
   * Whether a matching rule clears the current inclusion decision.
   *
   * This is true for patterns authored with `!`; a later positive rule can
   * restore a path because `EvidenceFileGlob` evaluates every rule in
   * declaration order.
   */
  exclude: boolean;
}
