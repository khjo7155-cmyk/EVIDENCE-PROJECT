import type { IEvidencePrismaModel } from "./IEvidencePrismaModel";

/**
 * Parsed schema units beside the whole-set cache identity.
 *
 * Prisma resolves relations across schema files, so the cache and parser result
 * belong to the selected file set rather than an individual source file.
 *
 * @evidence contracts/common.md#principled-implementation Detached models are returned with the whole-set digest used as cache identity.
 * @evidence contracts/common.md#clear-and-simple-design The loader produces it for the adapter.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaLoadResult {
  /**
   * Semantic models materialized from the entire selected schema set.
   *
   * Prisma resolves relations across files, so this collection belongs to the
   * complete parser input rather than to one selected physical source file.
   */
  models: IEvidencePrismaModel[];

  /**
   * Digest identifying the parser version and complete selected source set.
   *
   * The loader returns this cache identity with its models so callers can
   * retain a result only while every selected schema source and parser version
   * agree.
   */
  digest: string;
}
