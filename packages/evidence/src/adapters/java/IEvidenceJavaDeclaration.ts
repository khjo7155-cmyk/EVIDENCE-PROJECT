import type { IEvidenceUnitSite } from "../../structures/IEvidenceUnitSite";
import type { EvidenceProgrammingSymbol } from "../../typings/EvidenceProgrammingSymbol";
import type { EvidenceJavaDeclarationForm } from "./EvidenceJavaDeclarationForm";

/**
 * Records one Java declaration before its public unit and overload family are
 * materialized.
 *
 * EvidenceJavaFileScanner creates these physical records, and
 * EvidenceJavaAdapter reconciles compatible records into the
 * language-independent Evidence inventory.
 *
 * @evidence contracts/common.md#principled-implementation A declaration keeps form, package, owners, visibility and site before overload families are materialized.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records declarations; the adapter reconciles them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceJavaDeclaration {
  /**
   * Scanner-local declaration key for Javadoc attachments and reconciliation.
   *
   * It is replaced by a stable semantic unit ID during materialization.
   */
  id: string;

  /**
   * Unqualified source name used for unit display and member addressing.
   *
   * Package and enclosing type segments live in `identity`.
   */
  name: string;

  /**
   * Shared graph selector category for this Java declaration.
   *
   * It keeps Java syntax within the common programming-unit model.
   */
  symbol: EvidenceProgrammingSymbol;

  /**
   * Java declaration form that controls overload and type-family compatibility.
   *
   * Incompatible forms must remain visible as extraction failures.
   */
  form: EvidenceJavaDeclarationForm;

  /**
   * Canonical package-qualified semantic path for family reconciliation.
   *
   * This identity remains independent of source file public addresses.
   */
  identity: string[];

  /**
   * Public accessor path emitted when the declaration is reachable.
   *
   * Segment boundaries preserve real structural containment.
   */
  address: string[];

  /**
   * Physical declaration site used for hosts and content fingerprints.
   *
   * Compatible records can contribute multiple sites to one unit.
   */
  site: IEvidenceUnitSite;

  /**
   * Whether Java visibility and ancestor context permit publication.
   *
   * The adapter does not expose private declarations merely because they parse.
   */
  public: boolean;

  /**
   * Scanner-local enclosing declaration for a member or nested type.
   *
   * Omission denotes a package-level declaration.
   */
  ownerDeclarationId?: string;
}
