import type { EvidenceJavaTypeKind } from "./EvidenceJavaTypeKind";

/**
 * Carries an enclosing Java type's state while its nested declarations are
 * scanned.
 *
 * EvidenceJavaFileScanner passes this context through type bodies so
 * descendants retain their structural identity, public address prefix, and
 * inherited visibility.
 *
 * @evidence contracts/common.md#principled-implementation An enclosing type's identity, address prefix, kind and inherited visibility are passed to nested declarations.
 * @evidence contracts/common.md#clear-and-simple-design The scanner threads the context through type bodies.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceJavaTypeContext {
  /**
   * Enclosing type's scanner-local declaration record.
   *
   * Nested members use it to retain their structural owner.
   */
  declarationId: string;

  /**
   * Semantic path inherited by nested declarations.
   *
   * It determines unit identity rather than public file qualification.
   */
  identity: string[];

  /**
   * Public accessor prefix inherited from the enclosing type.
   *
   * Java members extend it when publishing targetable addresses.
   */
  address: string[];

  /**
   * Type form that determines supported nested declaration treatment.
   *
   * The scanner preserves this classification while walking members.
   */
  kind: EvidenceJavaTypeKind;

  /**
   * Whether this owner exposes nested declarations through public API.
   *
   * Non-public ancestry suppresses child publication even if a child is public.
   */
  public: boolean;
}
