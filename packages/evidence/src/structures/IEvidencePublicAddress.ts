import type { IEvidenceAddress } from "./IEvidenceAddress";

/**
 * A public citation address associated with one semantic declaration.
 *
 * Adapters publish direct paths and supported aliases or re-exports in this
 * shape. Keeping the unit ID separate from the inherited file and accessor lets
 * resolution preserve every public spelling without duplicating coverage
 * units.
 *
 * An address exposes a declaration but does not establish its structural owner.
 * Parent relationships remain on the unit, even when an alias changes the
 * apparent nesting of the public path.
 *
 * @evidence contracts/common.md#principled-implementation Extending an address with a unit ID lets several public spellings expose one semantic identity.
 * @evidence contracts/common.md#clear-and-simple-design Address structure stays in IEvidenceAddress; this adds only the association.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Aliases add addresses, never units.
 * @evidence contracts/common.md#meaningful-documentation The comment explains alias multiplicity; the field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePublicAddress extends IEvidenceAddress {
  /**
   * Semantic identity exposed through the inherited address.
   *
   * The ID must exist in the inventory. Multiple addresses may share it; an
   * exact address associated with different IDs remains an ambiguous target.
   */
  unitId: string;
}
