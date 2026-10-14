import type { EvidenceProgrammingSymbol } from "../typings/EvidenceProgrammingSymbol";

/**
 * Requires documentation comments on selected public programming declarations.
 *
 * This policy checks whether declarations have documentation capable of hosting
 * evidence. It does not judge prose quality or replace the repository's source
 * documentation rules. A narrower selector can require documentation on
 * functions without imposing the same presence check on every public property.
 *
 * @evidence contracts/common.md#principled-implementation A symbol selector is the only option a presence check needs, letting authors require documentation on chosen kinds.
 * @evidence contracts/common.md#clear-and-simple-design The policy checks presence only; prose quality stays with documentation rules and review.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No declaration is exempted except by the author's selector.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the policy's scope; the field documents its default.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDocumentedConfig {
  /**
   * Symbol kinds requiring documentation; accepts one kind or a nonempty array.
   *
   * Omission checks types, functions, and properties. The selector applies to
   * public programming declarations within the configured population.
   *
   * @default ["type", "function", "property"]
   */
  symbol?: EvidenceProgrammingSymbol | EvidenceProgrammingSymbol[];
}
