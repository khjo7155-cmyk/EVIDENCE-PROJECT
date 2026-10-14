import type { tags } from "typia";

/**
 * Admission limits for a parser runtime's native resources.
 *
 * A slot remains occupied throughout grammar acquisition, parsing, and the
 * asynchronous extraction callback. Bounding callbacks therefore also bounds
 * live parser/tree ownership, rather than only the synchronous parse
 * operation.
 *
 * @evidence contracts/common.md#principled-implementation A single concurrency bound limits simultaneous native parser sessions.
 * @evidence contracts/common.md#clear-and-simple-design Only admission is configurable; grammar acquisition options live elsewhere.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Typia tags enforce a positive integer instead of a hand-written check.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the bound; the field documents its default.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceParserOptions {
  /**
   * Maximum number of admitted parse sessions at once.
   *
   * Additional requests wait in FIFO order. Omission permits four sessions;
   * zero and non-integer values are rejected during runtime construction.
   *
   * @default 4
   */
  concurrency?: number & tags.Type<"uint32"> & tags.Minimum<1>;
}
