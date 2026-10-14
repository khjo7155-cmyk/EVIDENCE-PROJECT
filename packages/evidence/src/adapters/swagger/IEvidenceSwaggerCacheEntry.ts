import type { IEvidenceSwaggerLoadResult } from "./IEvidenceSwaggerLoadResult";

/**
 * Remembered normalization outcome for one exact document digest.
 *
 * The cache records failures as well as results so a malformed unchanged source
 * has deterministic behavior without repeating conversion work.
 *
 * @evidence contracts/common.md#principled-implementation A cache entry holds either a normalized result or a failure message for one document digest.
 * @evidence contracts/common.md#clear-and-simple-design The loader owns the cache.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields come from the parsed document or response; no API-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how loader and adapter use the record; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSwaggerCacheEntry {
  /**
   * Successful operation inventory, when normalization completed.
   *
   * Omission means this entry represents the failure below.
   */
  result?: IEvidenceSwaggerLoadResult;

  /**
   * Stable failure message for the cached input.
   *
   * Omission means the result is safe to clone for a caller.
   */
  problem?: string;
}
