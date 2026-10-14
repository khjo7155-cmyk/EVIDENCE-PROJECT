/**
 * Filesystem discovery failure retained in a source snapshot.
 *
 * A failed read, unstable source, or unresolved path boundary prevents the
 * loader from certifying a complete population. Adapters can preserve this
 * failure when producing graph diagnostics instead of silently omitting the
 * affected file.
 *
 * @evidence contracts/common.md#principled-implementation A coded discovery failure with path and message is retained in the snapshot so loading problems mark analysis incomplete.
 * @evidence contracts/common.md#clear-and-simple-design Source diagnostics are converted to graph diagnostics later.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Failures are retained rather than skipped.
 * @evidence contracts/common.md#meaningful-documentation The comment explains retention; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSourceDiagnostic {
  /**
   * Stable category of the failed discovery operation.
   *
   * Callers can distinguish access, spelling, encoding, and
   * snapshot-consistency failures without interpreting platform-specific
   * message text.
   */
  code:
    | "root-unreadable"
    | "path-unreadable"
    | "case-mismatch"
    | "symlink-cycle"
    | "not-file"
    | "invalid-encoding"
    | "source-changed";

  /**
   * Absolute logical path involved in the failure.
   *
   * This retains the author-visible address even when its physical target could
   * not be read or resolved.
   */
  path: string;

  /**
   * Explanation of the cause and affected discovery operation.
   *
   * Concrete filesystem details complement the stable category when diagnosing
   * permission failures, changing files, or invalid source contents.
   */
  message: string;
}
