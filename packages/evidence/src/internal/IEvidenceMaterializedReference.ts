import type { IEvidenceConfigPlanReference } from "../structures/IEvidenceConfigPlanReference";
import type { IEvidenceInventory } from "../structures/IEvidenceInventory";

/**
 * One enabled reference population after source extraction.
 *
 * References preserve their own inventory because identical semantic IDs may be
 * addressed under different roots, symbols, and severity policies.
 *
 * @evidence contracts/common.md#principled-implementation A plan, extracted inventory and selected unit IDs define one reference after extraction.
 * @evidence contracts/common.md#clear-and-simple-design The record mirrors the claim form for references.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Selection is recorded explicitly rather than recomputed.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the stage; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceMaterializedReference {
  /**
   * Validated configuration and effective severity for this reference
   * occurrence.
   *
   * The graph preserves this plan entry separately when repeated references
   * share an inventory but have distinct authored positions or inherited
   * policy.
   */
  plan: IEvidenceConfigPlanReference;

  /**
   * Extracted reference inventory used for target lookup and ancestor closure.
   *
   * It remains attached to this occurrence because the same unit identity can
   * have a different public address under another configured population.
   */
  inventory: IEvidenceInventory;

  /**
   * Identities selected as referenceable units by this population.
   *
   * Their order follows the configured selection and defines the denominator
   * before structural ancestors are added for context.
   */
  unitIds: string[];
}
