import type { IEvidencePrismaModel } from "./IEvidencePrismaModel";

/**
 * Remembered Prisma parse outcome for one parser and schema digest.
 *
 * Parser version and complete schema content form the external cache key so
 * stale parser behavior cannot be reused for a changed schema set.
 *
 * @evidence contracts/common.md#principled-implementation A cache entry holds either detached models or a remembered failure for one parser and digest.
 * @evidence contracts/common.md#clear-and-simple-design The model loader owns the cache.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaCacheEntry {
  /**
   * Parser-normalized models after a successful parse.
   *
   * A cache entry stores this branch for a parser-version and schema-set
   * digest, allowing callers to receive a cloned semantic model without
   * reparsing.
   */
  models?: IEvidencePrismaModel[];

  /**
   * Stable parser failure for the cached input when parsing failed.
   *
   * `EvidencePrismaModelLoader` rethrows this remembered diagnostic for the
   * same cache key so repeated scans do not hide or reformat a deterministic
   * parse error.
   */
  problem?: string;
}
