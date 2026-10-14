import type { IEvidenceRustFileAnalysis } from "./IEvidenceRustFileAnalysis";

/**
 * Assigns a selected Rust file to one crate root and module prefix.
 *
 * EvidenceRustModuleResolver creates placements before building module records,
 * so the same scan result can be addressed in the crate namespace and source
 * files.
 *
 * @evidence contracts/common.md#principled-implementation A placement assigns a selected file to a crate root and module prefix.
 * @evidence contracts/common.md#clear-and-simple-design The resolver creates placements before module records.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustFilePlacement {
  /**
   * EvidenceNode-free scan result for the selected file.
   *
   * This record owns declarations and diagnostics associated with the
   * placement.
   */
  analysis: IEvidenceRustFileAnalysis;

  /**
   * Stable key for the crate root that contains the file.
   *
   * Module and unit keys include it to keep identical paths in separate crates
   * distinct.
   */
  rootKey: string;

  /**
   * Module segments prepended to declarations scanned from the file.
   *
   * An empty prefix identifies a crate root file.
   */
  prefix: string[];

  /**
   * Declaration ID of the external module that selected this file, when any.
   *
   * Omission marks a root file or an inline-module context without an external
   * declaration to attach.
   */
  moduleDeclarationId?: string;
}
