import type { IEvidenceRustUseBinding } from "./IEvidenceRustUseBinding";

/**
 * Captures one unrestricted public Rust use declaration and its bindings.
 *
 * The scanner expands nested use trees into statically readable targets so the
 * resolver can construct public aliases without retaining syntax nodes.
 *
 * @evidence contracts/common.md#principled-implementation A public use declaration keeps its expanded bindings for alias construction without syntax nodes.
 * @evidence contracts/common.md#clear-and-simple-design The scanner expands use trees; the resolver consumes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustUse {
  /**
   * Stable ID for this use declaration.
   *
   * Resolver diagnostics use it to report an unsupported or ambiguous export
   * once.
   */
  id: string;

  /**
   * Module path relative to the scanned file where the use appears.
   *
   * File placement supplies the crate-relative prefix during resolution.
   */
  modulePath: string[];

  /**
   * Statically expanded leaf bindings declared by the use tree.
   *
   * A binding may name, rename, or wildcard-export a target.
   */
  bindings: IEvidenceRustUseBinding[];

  /**
   * Source-site ID for attaching diagnostics to the declaration.
   *
   * It is distinct from the use ID so a scanner site can be shared
   * consistently.
   */
  siteId: string;
}
