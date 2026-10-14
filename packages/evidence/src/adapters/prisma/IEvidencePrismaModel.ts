import type { IEvidencePrismaField } from "./IEvidencePrismaField";

/**
 * One parser-normalized Prisma model or view.
 *
 * The model is the ownership root for materialized members and exposes only
 * detached semantic data that can safely outlive the parser call.
 *
 * @evidence contracts/common.md#principled-implementation A detached model holds name, documentation, digest and members as the ownership root.
 * @evidence contracts/common.md#clear-and-simple-design The loader produces models; the adapter materializes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaModel {
  /**
   * Public Prisma model or view name.
   *
   * This parser-normalized name forms the root of each model and member
   * identity that the adapter later exposes through its Evidence inventory.
   */
  name: string;

  /**
   * Block documentation used for model-level review metadata.
   *
   * The empty string means the parser supplied no documentation; later
   * attachment still uses the physical scanner to decide whether a carrier is
   * eligible.
   */
  documentation: string;

  /**
   * Semantic block digest excluding documentation directives.
   *
   * This content contribution lets reviews detect a changed model declaration
   * while annotations and prose do not alter the semantic fingerprint.
   */
  digest: string;

  /**
   * Parser-classified members owned by this model.
   *
   * The model owns their identity hierarchy, while each field retains a
   * separate normalized symbol, documentation text, and semantic digest.
   */
  fields: IEvidencePrismaField[];
}
