/**
 * One recognized Prisma top-level block declaration.
 *
 * The position scanner records only the head needed to associate parser-owned
 * semantic models with their original source spans.
 *
 * @evidence contracts/common.md#principled-implementation A block head records the keyword and name of a top-level block so semantic models can be paired with source spans.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records heads; the adapter pairs them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaBlockHead {
  /**
   * Prisma block kind, such as `model` or `view`.
   *
   * The position scanner combines this keyword with `name` to recognize only
   * block forms that can be paired with parser-established semantic models.
   */
  keyword: string;

  /**
   * Declared block name following the recognized keyword.
   *
   * This authored spelling supplies the physical lookup key; semantic validity
   * still belongs to the whole-schema parser rather than this lexical scan.
   */
  name: string;
}
