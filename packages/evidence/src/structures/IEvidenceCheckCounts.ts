/**
 * Aggregate participation and coverage totals for a check report.
 *
 * Unit counts sum active obligations rather than deduplicating across the whole
 * graph. Two references to the same population therefore retain two
 * requirements. Diagnostic totals include every finding at the corresponding
 * severity, including findings a report window withheld from `diagnostics`.
 *
 * @evidence contracts/common.md#principled-implementation Counts sum active obligations instead of deduplicating units, matching the rule that references never pool coverage.
 * @evidence contracts/common.md#clear-and-simple-design Counts are a flat projection; per-obligation detail stays in claims.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Totals include diagnostics a report window withheld, so narrowing output cannot shrink the counts.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the summation rule and withheld findings; each count documents what it includes.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCheckCounts {
  /**
   * Number of claim results retained by the plan.
   *
   * Disabled authored entries removed before evaluation are not included.
   */
  claims: number;

  /**
   * Number of retained claims activated during evaluation.
   *
   * This is the numerator displayed beside the total claim count.
   */
  activeClaims: number;

  /**
   * Number of reference results across retained claims.
   *
   * Repeated reference entries count separately even when their populations
   * match.
   */
  obligations: number;

  /**
   * Number of obligations participating in coverage totals.
   *
   * Inactive obligations remain in the total count but do not contribute units.
   */
  activeObligations: number;

  /**
   * Number of active obligations whose analysis could not complete.
   *
   * This exposes incomplete extraction separately from ordinary missing
   * evidence.
   */
  incompleteObligations: number;

  /**
   * Sum of selected reference-unit counts in active obligations.
   *
   * The same semantic identity can contribute to several independent
   * requirements.
   */
  units: number;

  /**
   * Sum of covered-unit counts in active obligations.
   *
   * Coverage accepted in one obligation does not satisfy another automatically.
   */
  coveredUnits: number;

  /**
   * Sum of uncovered-unit counts in active obligations.
   *
   * This reports missing requirements within the materialized populations;
   * completeness still determines whether those populations are trustworthy.
   */
  missingUnits: number;

  /**
   * Number of error diagnostics in the report.
   *
   * Any error makes a complete check fail with exit code one.
   */
  errors: number;

  /**
   * Number of warning diagnostics in the report.
   *
   * Warnings remain visible without making an otherwise complete check fail.
   */
  warnings: number;
}
