import type { EvidenceCSharpTypeKind } from "./EvidenceCSharpTypeKind";
import type { IEvidenceCSharpDeclarationAddress } from "./IEvidenceCSharpDeclarationAddress";

/**
 * Carries the enclosing C# type state while the scanner traverses nested
 * declarations.
 *
 * EvidenceCSharpFileScanner creates this context for each type and passes it to
 * member and nested-type scans. It keeps structural ownership, semantic
 * identity, and public address candidates aligned without repeatedly deriving
 * them from syntax.
 *
 * @evidence contracts/common.md#principled-implementation An enclosing type's identity, address candidates, kind and accessibility pass to nested members.
 * @evidence contracts/common.md#clear-and-simple-design The scanner threads the context through type bodies.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCSharpTypeContext {
  /**
   * Identifies the scanner-local declaration record for the enclosing type.
   *
   * Nested declarations store this value as their ownerDeclarationId so later
   * materialization can preserve parent units and resolve public visibility.
   */
  declarationId: string;

  /**
   * Supplies the semantic path that nested declarations extend.
   *
   * The scanner appends each nested declaration name to this canonical
   * identity. It remains separate from public addresses because aliases may
   * expose other valid access paths.
   */
  identity: string[];

  /**
   * Supplies the public address candidates that nested declarations extend.
   *
   * Member scanning appends its name to every candidate while preserving
   * canonical and alias-prefix provenance. Partial types can therefore
   * contribute more than one valid public prefix.
   */
  addresses: IEvidenceCSharpDeclarationAddress[];

  /**
   * Classifies the enclosing type form for nested-member scanning.
   *
   * The scanner uses this value to apply interface-specific implicit-public
   * semantics without reinterpreting the enclosing type's syntax for each
   * member.
   */
  kind: EvidenceCSharpTypeKind;
}
