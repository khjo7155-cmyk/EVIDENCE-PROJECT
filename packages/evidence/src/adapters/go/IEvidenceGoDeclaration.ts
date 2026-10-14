import type { IEvidenceUnitSite } from "../../structures/IEvidenceUnitSite";
import type { EvidenceProgrammingSymbol } from "../../typings/EvidenceProgrammingSymbol";
import type { EvidenceGoDeclarationForm } from "./EvidenceGoDeclarationForm";

/**
 * Records one exported Go declaration before package-wide ownership is
 * resolved.
 *
 * EvidenceGoFileScanner creates these physical records, and
 * EvidenceGoPackageResolver combines compatible records into the semantic units
 * that Evidence publishes.
 *
 * @evidence contracts/common.md#principled-implementation A declaration keeps form, name, receiver, site and a scanner-local ID so documentation can attach before package-wide ownership is known.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records declarations; the package resolver combines them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGoDeclaration {
  /**
   * Scanner-local identifier used to attach documentation before
   * reconciliation.
   *
   * The resolver replaces this physical key with a package-wide unit ID.
   */
  id: string;

  /**
   * Unqualified exported name displayed by the resulting evidence unit.
   *
   * A member's owner, when present, supplies the preceding identity segment.
   */
  name: string;

  /**
   * Common graph category assigned to the declaration's Go symbol.
   *
   * This lets downstream selection use the language-independent symbol model.
   */
  symbol: EvidenceProgrammingSymbol;

  /**
   * Go syntax form used to resolve receivers and compatible declarations.
   *
   * Package materialization accepts only local defined types as method
   * receivers.
   */
  form: EvidenceGoDeclarationForm;

  /**
   * Exported enclosing type name for a member or receiver method.
   *
   * Omission means that the declaration belongs directly to the package
   * surface.
   */
  owner?: string;

  /**
   * Physical declaration-site identifier used when attaching evidence hosts.
   *
   * It remains distinct even when several sites materialize one semantic unit.
   */
  positionSiteId: string;

  /**
   * Physical source spans that contribute this declaration's evidence content.
   *
   * The resolver preserves every compatible site in the published unit.
   */
  sites: IEvidenceUnitSite[];
}
