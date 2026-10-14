/**
 * How far one claim's resolution of an annotation got, and at what severity.
 *
 * Statement ownership compares these records between claims that read the same
 * annotation. A record describes one claim only; it never merges the outcomes
 * of different references into a shared obligation.
 *
 * @evidence contracts/common.md#principled-implementation Resolution level, severity rank and a resolved flag compare how far each claim resolved a shared annotation.
 * @evidence contracts/common.md#clear-and-simple-design The record is a comparison key for statement ownership.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Ownership comparison uses these explicit ranks rather than claim order.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the comparison; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceStatementStanding {
  /**
   * Furthest resolution level reached across the claim's active references.
   *
   * 0 means no active reference selected the annotation, 1 a cited file outside
   * every selected reference, 2 a selected file or schema without the cited
   * address, and 3 any other outcome, `resolved` included.
   */
  level: number;

  /**
   * Severity rank of the findings the claim reports for this annotation.
   *
   * 2 is `error` and 1 is `warning`. A claim that selected no reference reports
   * participation findings at error severity; otherwise the rank follows the
   * reference that reached `level`, taking the higher rank on a tie.
   */
  severity: number;

  /**
   * Whether the reference that reached `level` resolved the target cleanly.
   *
   * A resolved citation raises no resolution finding, so its severity cannot
   * hide another claim's finding.
   */
  resolved: boolean;
}
