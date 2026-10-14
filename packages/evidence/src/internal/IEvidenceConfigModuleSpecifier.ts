import type { EvidenceConfigModuleMode } from "./EvidenceConfigModuleMode";

/**
 * Statically discoverable configuration dependency before filesystem
 * resolution.
 *
 * EvidenceConfigDependencyScanner retains the loading mechanism beside the
 * authored specifier because conditional package exports can map the same text
 * to different physical files.
 *
 * @evidence contracts/common.md#principled-implementation A specifier with its import mode records a statically discovered dependency before filesystem resolution.
 * @evidence contracts/common.md#clear-and-simple-design Discovery and resolution are separate steps; this is the handoff.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only statically visible specifiers are recorded; dynamic forms are not guessed.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the pre-resolution stage; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceConfigModuleSpecifier {
  /**
   * Authored module specifier without its string-literal delimiters.
   *
   * Relative, file URL, package, and built-in forms remain intact until the
   * resolver applies the same category boundary used during evaluation.
   */
  specifier: string;

  /**
   * Loading mechanism that selects package export conditions.
   *
   * Static imports inherit the evaluator's module kind. Literal `import()` and
   * `require()` calls retain their own mechanism independently.
   */
  mode: EvidenceConfigModuleMode;
}
