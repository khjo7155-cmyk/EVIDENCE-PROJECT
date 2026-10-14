import type { IEvidenceSwaggerOperation } from "./IEvidenceSwaggerOperation";

/**
 * Normalized operations from one Swagger or OpenAPI document.
 *
 * The loader converts accepted source versions to this version-neutral shape
 * before the adapter materializes public operation units.
 *
 * @evidence contracts/common.md#principled-implementation A version-neutral list of operations is the loader's output for one document.
 * @evidence contracts/common.md#clear-and-simple-design The adapter materializes operations from it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields come from the parsed document or response; no API-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how loader and adapter use the record; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSwaggerLoadResult {
  /**
   * Operations ordered by their public targets.
   *
   * Each target occurs at most once; duplicates are rejected during loading.
   */
  operations: IEvidenceSwaggerOperation[];
}
