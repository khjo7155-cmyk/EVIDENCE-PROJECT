/**
 * Describes a Rust impl block before its local nominal owner is resolved.
 *
 * The scanner records source-level paths; EvidenceRustModuleResolver resolves
 * them in the containing module and assigns member identities to the selected
 * owner.
 *
 * @evidence contracts/common.md#principled-implementation An impl block keeps its source-level owner and trait paths until they resolve in the containing module.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records impls; the resolver assigns members.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustImplementation {
  /**
   * Stable scanner ID shared by declarations emitted from this impl block.
   *
   * The resolver uses it to select exactly this block's associated members.
   */
  id: string;

  /**
   * Module path relative to the scanned file where the impl appears.
   *
   * Placement prepends the file prefix before path resolution.
   */
  modulePath: string[];

  /**
   * Source path naming the implemented nominal type.
   *
   * It must resolve to one selected local struct or enum before members
   * publish.
   */
  ownerPath: string[];

  /**
   * Source path naming the implemented trait, when this is a trait impl.
   *
   * Omission represents an inherent impl and produces no trait qualifier.
   */
  traitPath?: string[];

  /**
   * Type parameter names declared by the impl block.
   *
   * The resolver uses them to reject blanket impls without one nominal owner.
   */
  typeParameters: string[];
}
