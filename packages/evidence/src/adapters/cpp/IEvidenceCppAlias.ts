import type { IEvidenceUnitSite } from "../../structures/IEvidenceUnitSite";
import type { EvidenceCppAliasKind } from "./EvidenceCppAliasKind";

/**
 * Records one statically readable C++ namespace alias or using declaration.
 *
 * EvidenceCppFileScanner emits this physical record alongside declarations, and
 * EvidenceCppAdapter resolves public aliases after it materializes semantic
 * units. Its scoped target and site let that later pass publish alias-derived
 * addresses without confusing the alias with the selected target unit.
 *
 * @evidence contracts/common.md#principled-implementation An alias keeps its kind, scoped target and site so alias addresses never replace the target's identity.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records aliases; the adapter resolves them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCppAlias {
  /**
   * Stable scanner-local key used to associate the alias with its source
   * analysis.
   *
   * It is not a public accessor or semantic unit identity.
   */
  id: string;

  /**
   * Alias syntax that determines how the resolver follows its target.
   *
   * Namespace aliases and using declarations publish through different scopes.
   */
  kind: EvidenceCppAliasKind;

  /**
   * Alias spelling introduced in `scopeAddress`.
   *
   * The resolver appends this name while projecting a target address.
   */
  name: string;

  /**
   * Semantic owner path in which the alias was declared.
   *
   * It prevents same-spelled aliases in separate scopes from colliding.
   */
  scopeIdentity: string[];

  /**
   * Public path of the containing scope.
   *
   * This path supplies the prefix for addresses published through the alias.
   */
  scopeAddress: string[];

  /**
   * Qualified target path as written by the supported static syntax.
   *
   * Resolution fails visibly when this path cannot name one selected unit.
   */
  target: string[];

  /**
   * Source site whose documentation may carry annotations for this alias.
   *
   * The site stays physical even when the target unit is shared.
   */
  site: IEvidenceUnitSite;

  /**
   * Whether the alias can publish a target into the configured population.
   *
   * Private aliases remain available for local resolution but expose no
   * address.
   */
  public: boolean;
}
