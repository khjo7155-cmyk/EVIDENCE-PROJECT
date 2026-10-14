import type { IEvidenceSourceDiagnostic } from "../structures/IEvidenceSourceDiagnostic";

/**
 * Discovery failure carrying the source diagnostic category that callers
 * report.
 *
 * The collector converts these failures at filesystem boundaries, separating
 * expected source conditions from unexpected operational errors.
 *
 * @evidence contracts/common.md#principled-implementation An error carrying a source diagnostic code separates expected discovery conditions from unexpected operational errors.
 * @evidence contracts/common.md#clear-and-simple-design The collector converts it at filesystem boundaries; the class only carries the code.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The category is preserved instead of collapsing into a generic read error.
 * @evidence contracts/common.md#meaningful-documentation The class and constructor comments explain where it is caught and why the code is kept.
 * @evidenceExclude contracts/performance.md#efficient-algorithms An error class chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Constructing an error computes nothing worth sharing.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The error holds only its message and cause and no external resource.
 */
export class EvidenceSourceFailure extends Error {
  /**
   * Creates a source-discovery failure with a reportable diagnostic code.
   *
   * `EvidenceSourceCollector` catches this expected failure at filesystem
   * boundaries and preserves its category instead of collapsing it into a
   * generic read error.
   */
  public constructor(
    public readonly code: IEvidenceSourceDiagnostic["code"],
    message: string,
  ) {
    super(message);
  }
}
