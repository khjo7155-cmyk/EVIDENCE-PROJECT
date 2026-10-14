import type { IEvidenceUnitSite } from "../../structures/IEvidenceUnitSite";
import type { EvidenceProgrammingSymbol } from "../../typings/EvidenceProgrammingSymbol";

/**
 * Represents a Scala source declaration before snapshot-wide overload
 * reconciliation.
 *
 * The record preserves lexical identity separately from exported addresses so
 * singleton exports and overloads can be published without collapsing sites.
 *
 * @evidence contracts/common.md#principled-implementation A declaration keeps lexical identity, site and content separately from exported addresses so overloads and exports keep every site.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records declarations; export resolution and the adapter consume them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceScalaDeclaration {
  /**
   * Identifies this declaration record within one Scala source analysis.
   *
   * Scanner attachments and export records use this ID before semantic units
   * are materialized.
   */
  id: string;

  /**
   * Stores the declaration name as written in Scala source.
   *
   * Backtick delimiters are removed, while characters inside the literal name
   * remain unchanged.
   */
  name: string;

  /**
   * Classifies the declaration as a public programming symbol.
   *
   * Unit materialization includes this kind in the semantic identity so types,
   * functions, and properties cannot merge.
   */
  symbol: EvidenceProgrammingSymbol;

  /**
   * Names the package and lexical owners that define semantic identity.
   *
   * Export aliases reuse this path from their source declaration instead of
   * introducing a second unit.
   */
  identity: string[];

  /**
   * Names this declaration through its physical file address.
   *
   * Forwarded exports retain their forwarding address even when their identity
   * belongs to another source owner.
   */
  address: string[];

  /**
   * Supplies source names that a bounded export may use during lookup.
   *
   * These names are not automatically public addresses; limiting lookup to them
   * prevents arbitrary textual paths from becoming aliases.
   */
  lookup: string[];

  /**
   * Locates the original declaration and the source ranges included in its
   * fingerprint.
   *
   * Extension and enum context may prepend header ranges to the declaration's
   * physical site.
   */
  site: IEvidenceUnitSite;

  /**
   * States whether this declaration and every lexical owner are unrestricted.
   *
   * Restricted declarations remain available for boundary analysis but do not
   * become public units.
   */
  public: boolean;

  /**
   * Identifies a singleton object eligible to supply an exported member.
   *
   * Scala's export syntax is resolved only through these static object owners,
   * avoiding an unsupported inference through arbitrary expressions.
   */
  object: boolean;

  /**
   * Records the Tree-sitter node spelling that produced this declaration.
   *
   * Materialization uses it to distinguish source declarations from forwarding
   * export sites.
   */
  syntax: string;

  /**
   * Identifies the directly enclosing lexical declaration when one exists.
   *
   * Withdrawal and public visibility propagate through this extraction-level
   * ownership chain.
   */
  ownerDeclarationId?: string;
}
