import type { IEvidenceRustLocatedDeclaration } from "./IEvidenceRustLocatedDeclaration";

/**
 * Assigns one associated Rust item to its selected local nominal owner.
 *
 * Resolver materialization uses the relationship to publish public impl members
 * beneath the owner type rather than as standalone declarations.
 *
 * @evidence contracts/common.md#principled-implementation A resolved member assigns an associated item to its local owner, with a trait-qualified segment for trait impls.
 * @evidence contracts/common.md#clear-and-simple-design The resolver publishes members beneath their owner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustResolvedMember {
  /**
   * Located associated declaration emitted from the impl block.
   *
   * Its identity is updated after the owner and optional trait are resolved.
   */
  declaration: IEvidenceRustLocatedDeclaration;

  /**
   * Selected local struct or enum that semantically owns the member.
   *
   * Only one unambiguous nominal owner is supported for publication.
   */
  owner: IEvidenceRustLocatedDeclaration;

  /**
   * Trait-derived segment that distinguishes a trait impl from an inherent
   * impl.
   *
   * Omission means the member belongs to an inherent impl.
   */
  qualifier?: string;

  /**
   * Declaration ID of the selected local trait, when the trait resolved
   * locally.
   *
   * Materialization requires that trait to be publicly reachable before
   * exposing its impl members.
   */
  localTraitId?: string;
}
