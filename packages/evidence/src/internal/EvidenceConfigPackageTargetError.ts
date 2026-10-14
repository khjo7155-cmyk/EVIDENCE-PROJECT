/**
 * Marks one invalid package-map target that an array alternative may skip.
 *
 * Node permits array fallbacks after target-validation failures but still
 * rejects malformed condition objects. EvidenceConfigDependencyScanner uses
 * this error boundary to preserve that distinction without matching diagnostic
 * text.
 *
 * @evidence contracts/common.md#principled-implementation A dedicated error class marks a skippable invalid package-map target, matching Node's array fallback after target-validation failures.
 * @evidence contracts/common.md#clear-and-simple-design The class carries only message and cause; the scanner decides when to skip.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The scanner distinguishes this boundary by type instead of matching diagnostic text.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains Node's fallback rule and the constructor documents cause retention.
 * @evidenceExclude contracts/performance.md#efficient-algorithms An error class chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Constructing an error computes nothing worth sharing.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The error holds only its message and cause and no external resource.
 */
export class EvidenceConfigPackageTargetError extends Error {
  /**
   * Creates a skippable target failure while retaining its validation cause.
   *
   * The original cause remains available when no later array alternative can be
   * selected and the scanner must expose the package-resolution failure.
   */
  public constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "EvidenceConfigPackageTargetError";
  }
}
