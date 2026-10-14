/**
 * Records a file-backed Rust module awaiting selected-source resolution.
 *
 * EvidenceRustModuleResolver maps the declaration to an included file or
 * reports an incomplete crate graph instead of guessing filesystem or
 * build-script behavior.
 *
 * @evidence contracts/common.md#principled-implementation A file-backed module declaration waits to be mapped to a selected name.rs or name/mod.rs file.
 * @evidence contracts/common.md#clear-and-simple-design The resolver maps it or reports an incomplete crate graph.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustExternalModule {
  /**
   * Scanner identity of the `mod` declaration introducing this module.
   *
   * Diagnostics refer to this source site when no selected file satisfies it.
   */
  declarationId: string;

  /**
   * Parent module path in which the child name resolves.
   *
   * It distinguishes equal module names declared under separate parents.
   */
  modulePath: string[];

  /**
   * Child module name from the declaration.
   *
   * The resolver combines it with `modulePath` to find the selected source.
   */
  name: string;

  /**
   * Whether a `#[path]` attribute supplies an explicit file spelling.
   *
   * This changes the selected-source lookup and prevents conventional-path
   * guessing.
   */
  pathOverride: boolean;
}
