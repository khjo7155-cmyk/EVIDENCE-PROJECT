import type { IEvidenceRustDeclaration } from "./IEvidenceRustDeclaration";
import type { IEvidenceRustFilePlacement } from "./IEvidenceRustFilePlacement";

/**
 * Describes one public Rust module binding and the file that exposes its alias.
 *
 * Resolver traversal carries the declaration and its module placement together
 * so visibility is evaluated at the binding boundary instead of the use site
 * alone.
 *
 * @evidence contracts/common.md#principled-implementation An export record keeps a public binding with the file exposing its alias, so visibility is checked at the binding boundary.
 * @evidence contracts/common.md#clear-and-simple-design The resolver carries it during traversal.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustExportRecord {
  /**
   * Name introduced into the exporting module's public namespace.
   *
   * It forms the next segment when the resolver publishes an alias path.
   */
  name: string;

  /**
   * Lexical declaration reached by this binding before alias publication.
   *
   * Its semantic identity is retained even when several paths expose it.
   */
  declaration: IEvidenceRustDeclaration;

  /**
   * Selected file and crate placement owning the exposing module.
   *
   * Visibility checks need this module boundary as well as the declaration.
   */
  carrier: IEvidenceRustFilePlacement;
}
