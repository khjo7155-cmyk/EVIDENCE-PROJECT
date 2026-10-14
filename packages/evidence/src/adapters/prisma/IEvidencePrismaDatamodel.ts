import type { IEvidencePrismaDatamodelModel } from "./IEvidencePrismaDatamodelModel";

/**
 * Prisma parser payload needed by the Evidence adapter.
 *
 * Evidence deliberately consumes the parser's semantic model rather than
 * inferring model structure from source text.
 *
 * @evidence contracts/common.md#principled-implementation The reduced parser payload is the list of models Evidence needs.
 * @evidence contracts/common.md#clear-and-simple-design The loader validates it with typia.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaDatamodel {
  /**
   * Parsed models and views in parser-provided order.
   *
   * `EvidencePrismaModelLoader` converts these semantic roots into detached
   * Evidence models before later source scanning associates them with physical
   * sites.
   */
  models: IEvidencePrismaDatamodelModel[];
}
