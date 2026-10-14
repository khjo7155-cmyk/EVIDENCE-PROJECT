/**
 * Stable categories for failures that invalidate adapter extraction.
 *
 * Parser failures never quietly become an empty inventory: callers retain the
 * category in diagnostics so an unavailable asset, malformed query, incomplete
 * parse, or closed session cannot reduce the coverage denominator. The codes
 * separate remediation of cache/runtime problems from source and query issues.
 *
 * @evidence contracts/common.md#principled-implementation Stable codes classify each way extraction can fail so a failure is reported as incomplete rather than becoming an empty inventory.
 * @evidence contracts/common.md#clear-and-simple-design Codes group by remediation owner (asset, runtime, grammar, parse, query, session); EvidenceParserError carries the message and range.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No failure is mapped to success or silently skipped; every listed code invalidates extraction.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why the codes exist and how they separate cache and runtime remediation from source and query issues.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceParserErrorCode =
  | "unsupported-language"
  | "unsupported-extension"
  | "asset-manifest"
  | "asset-missing"
  | "asset-corrupt"
  | "asset-download"
  | "asset-cache"
  | "asset-cancelled"
  | "runtime-initialization"
  | "grammar-incompatible"
  | "parse-failed"
  | "parse-incomplete"
  | "query-invalid"
  | "query-incomplete"
  | "session-closed";
