import type { IEvidenceUnitSite } from "../../structures/IEvidenceUnitSite";
import type { EvidenceProgrammingSymbol } from "../../typings/EvidenceProgrammingSymbol";

/**
 * Captures one PHP declaration before public inventory materialization.
 *
 * EvidencePhpAdapter groups these lexical records into semantic units,
 * retaining exact source spelling for public addresses while separately
 * normalizing identity.
 *
 * @evidence contracts/common.md#principled-implementation A declaration keeps exact source spelling, lexical visibility, owner and site so identity can be normalized separately from the public address.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records declarations; the adapter groups them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePhpDeclaration {
  /**
   * Stable scanner identity for this declaration occurrence.
   *
   * Documentation attachments and owner links use it before public units exist.
   */
  id: string;

  /**
   * Declaration name exactly as PHP source spells it.
   *
   * Property names retain `$`, which is meaningful to public target
   * construction.
   */
  name: string;

  /**
   * Evidence selector family assigned to this declaration.
   *
   * Consumers use it to distinguish nominal types, functions, and properties.
   */
  symbol: EvidenceProgrammingSymbol;

  /**
   * Tree-sitter declaration form that established this record.
   *
   * It lets later validation distinguish source constructs sharing one selector
   * category.
   */
  form: string;

  /**
   * Namespace and lexical-owner segments forming semantic identity.
   *
   * EvidencePhpAdapter applies PHP case rules to this path without changing
   * public spelling.
   */
  identity: string[];

  /**
   * Exact accessor segments published beneath this declaration's source file.
   *
   * Address aliases remain independent of semantic identity and preserve
   * case-sensitive properties.
   */
  address: string[];

  /**
   * Source site and content ranges used for fingerprints and documentation
   * hosts.
   *
   * The scanner can include declaration carriers and separated property
   * elements precisely.
   */
  site: IEvidenceUnitSite;

  /**
   * Whether lexical PHP visibility exposes this declaration on the supported
   * surface.
   *
   * A hidden owner also prevents all of its members from being published.
   */
  public: boolean;

  /**
   * Scanner identity of the enclosing nominal declaration when this is a
   * member.
   *
   * Omission denotes a namespace-level declaration with no inherited visibility
   * boundary.
   */
  ownerDeclarationId?: string;
}
