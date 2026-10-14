/**
 * Retains a Kotlin receiver reference for later static nominal lookup.
 *
 * EvidenceKotlinFileScanner records lookup candidates while file scope and
 * imports are available, and EvidenceKotlinReceivers resolves the reference
 * after declarations and supported aliases have been collected without invoking
 * the Kotlin compiler.
 *
 * @evidence contracts/common.md#principled-implementation A receiver reference keeps its lookup candidates from file scope and imports for later static resolution.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records references; receiver resolution consumes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceKotlinTypeReference {
  /**
   * Names the physical source that supplied this receiver reference.
   *
   * EvidenceKotlinReceivers permits file-private aliases only from this file,
   * preserving Kotlin visibility during deferred lookup.
   */
  file: string;

  /**
   * Lists nominal lookup candidates from lexical, imported, and package scope.
   *
   * EvidenceKotlinReceivers checks these paths in order and accepts exactly one
   * visible declaration, so their ordering represents
   * EvidenceKotlinFileScanner's precedence.
   */
  paths: string[][];

  /**
   * Provides a resolved external, qualified, or Kotlin-core type path.
   *
   * Omission means no such path is statically known, so lookup must find a
   * selected declaration through {@link paths} or report an unresolved
   * receiver.
   */
  external?: string[];

  /**
   * Records whether the parsed receiver reference has a nullable suffix.
   *
   * Alias resolution combines this value with nullability inherited from the
   * expanded alias target.
   */
  nullable: boolean;

  /**
   * Explains why this receiver cannot use nominal static resolution.
   *
   * Omission permits EvidenceKotlinReceivers lookup; when present, callers
   * preserve the unsupported-receiver diagnostic instead of guessing
   * substitutions or imports.
   */
  problem?: string;
}
