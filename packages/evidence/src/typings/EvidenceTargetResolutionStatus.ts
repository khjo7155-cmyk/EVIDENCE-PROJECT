/**
 * Outcome category for resolving one authored file-qualified target.
 *
 * `resolved` identifies one visible unit. Every other value explains why the
 * target cannot satisfy a reference, including semantic ambiguity, a boundary
 * violation, or incomplete discovery. Callers preserve this distinction in
 * diagnostics instead of collapsing all failures into a missing member.
 *
 * @evidence contracts/common.md#principled-implementation Each literal names a distinct reason a target cannot resolve, so diagnostics can state the real cause instead of a generic missing member.
 * @evidence contracts/common.md#clear-and-simple-design The resolver decides the status; the alias only enumerates outcomes.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Incomplete is a separate outcome so failed discovery cannot masquerade as a missing target.
 * @evidence contracts/common.md#meaningful-documentation The comment explains that only resolved satisfies a reference and that callers must keep the distinctions.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceTargetResolutionStatus =
  | "resolved"
  | "ambiguous"
  | "hidden"
  | "malformed"
  | "missing-file"
  | "missing-member"
  | "out-of-population"
  | "unsupported-host"
  | "incomplete";
