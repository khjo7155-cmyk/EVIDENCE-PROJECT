/**
 * Marks an explicit CommonJS package main that exhausted its runtime fallbacks.
 *
 * A missing default index permits CommonJS lookup to try the next
 * `node_modules` root. Once a manifest explicitly selects `main`, Node instead
 * reports that package as broken after its own index fallback also fails.
 *
 * @evidence contracts/common.md#principled-implementation A dedicated error marks an explicit main target that exhausted its fallbacks, which Node treats as a broken package rather than a reason to search ancestors.
 * @evidence contracts/common.md#clear-and-simple-design The class carries the message and cause; resolution decides when to throw it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts It stops ancestor node_modules fallback from hiding the broken package instead of compensating for it.
 * @evidence contracts/common.md#meaningful-documentation The comments explain Node's explicit-main rule and the retained cause.
 * @evidenceExclude contracts/performance.md#efficient-algorithms An error class chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Constructing an error computes nothing worth sharing.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The error holds only its message and cause and no external resource.
 */
export class EvidenceConfigPackageMainError extends Error {
  /**
   * Creates an authoritative failure for one explicit legacy `main` target.
   *
   * The original resolution cause remains available to diagnostics while this
   * error type prevents ancestor `node_modules` fallback from hiding the broken
   * package selected at the current search root.
   */
  public constructor(directory: string, target: string, cause: unknown) {
    super(
      `Package '${directory}' declares an unusable main target '${target}'.`,
      { cause },
    );
    this.name = "EvidenceConfigPackageMainError";
  }
}
