import type { IEvidenceUnitSite } from "../../structures/IEvidenceUnitSite";
import type { EvidenceProgrammingSymbol } from "../../typings/EvidenceProgrammingSymbol";
import type { EvidenceCDeclarationForm } from "./EvidenceCDeclarationForm";
import type { IEvidenceCDeclarationAddress } from "./IEvidenceCDeclarationAddress";

/**
 * Captures one supported C declaration before file-local identity
 * reconciliation.
 *
 * `EvidenceCFileScanner` creates this record without retaining a Tree-sitter
 * node. The adapter later groups compatible records by `identity`, expands
 * their public addresses, and uses `site` to retain the physical source
 * location that may host a Doxygen annotation.
 *
 * @evidence contracts/common.md#principled-implementation A declaration keeps form, identity, addresses and site without a Tree-sitter node.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records declarations; the adapter groups them by identity.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCDeclaration {
  /**
   * Stable scanner-local key used by documentation attachments and grouping.
   *
   * Materialization replaces this physical-record key with the group's semantic
   * unit ID.
   */
  id: string;

  /**
   * Source spelling of this declared entity, without its enclosing path.
   *
   * The adapter uses `identity` and `addresses` for the enclosing semantic and
   * public paths.
   */
  name: string;

  /**
   * Graph symbol category published when the declaration becomes a unit.
   *
   * It preserves Evidence's language-independent target selection vocabulary.
   */
  symbol: EvidenceProgrammingSymbol;

  /**
   * C source form that determines conflict and alias reconciliation rules.
   *
   * Only compatible forms may contribute to one materialized declaration
   * family.
   */
  form: EvidenceCDeclarationForm;

  /**
   * Canonical semantic path used to group compatible declarations in one file.
   *
   * It is distinct from alias spellings that may appear in `addresses`.
   */
  identity: string[];

  /**
   * Public spelling candidates, including supported tag and typedef aliases.
   *
   * Materialization publishes only unambiguous candidates under its
   * canonical-prefix rules.
   */
  addresses: IEvidenceCDeclarationAddress[];

  /**
   * Source position and content span preserved for fingerprinting and hosts.
   *
   * Compatible declarations may contribute distinct physical sites to one unit.
   */
  site: IEvidenceUnitSite;

  /**
   * Whether this occurrence supplies a body rather than only a declaration.
   *
   * Repeated bodies in an otherwise incompatible family make the inventory
   * incomplete.
   */
  definition: boolean;

  /**
   * Owning aggregate declaration when this record is a field or enumerator.
   *
   * Omission identifies a declaration that owns a top-level unit.
   */
  ownerDeclarationId?: string;

  /**
   * Struct, union, or enum tag when that namespace names this declaration.
   *
   * The tag can provide a public address separate from the ordinary identifier.
   */
  tagName?: string;
}
