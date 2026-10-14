import type { IEvidenceRustExportRecord } from "./IEvidenceRustExportRecord";
import type { IEvidenceRustFilePlacement } from "./IEvidenceRustFilePlacement";
import type { IEvidenceRustLocatedDeclaration } from "./IEvidenceRustLocatedDeclaration";

/**
 * Records one public path through which a selected Rust declaration is
 * reachable.
 *
 * Materialization turns each occurrence into addresses while keeping the
 * declaration's semantic identity independent of aliases and reexports.
 *
 * @evidence contracts/common.md#principled-implementation A public occurrence records one path through which a declaration is reachable, independent of its identity.
 * @evidence contracts/common.md#clear-and-simple-design Materialization turns occurrences into addresses.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustPublicOccurrence {
  /**
   * Resolved declaration reached through the public path.
   *
   * This supplies the unit identity and source site for materialization.
   */
  located: IEvidenceRustLocatedDeclaration;

  /**
   * Export edge that introduced the final path segment.
   *
   * Its carrier identifies the source context that can address the alias.
   */
  exported: IEvidenceRustExportRecord;

  /**
   * File placement carrying the namespace used to traverse the path.
   *
   * This can differ from the declaration's source file after a reexport.
   */
  namespaceCarrier: IEvidenceRustFilePlacement;

  /**
   * Crate-relative public accessor segments for this occurrence.
   *
   * Each alias contributes a separate path without duplicating the Evidence
   * unit.
   */
  publicPath: string[];
}
