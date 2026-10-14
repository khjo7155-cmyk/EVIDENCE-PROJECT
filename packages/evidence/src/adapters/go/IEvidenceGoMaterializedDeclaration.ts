import type { IEvidenceGoDeclaration } from "./IEvidenceGoDeclaration";
import type { IEvidenceGoFileAnalysis } from "./IEvidenceGoFileAnalysis";

/**
 * Associates one physical Go declaration with its package-wide semantic unit.
 *
 * EvidenceGoPackageResolver uses this transient record to collect declaration
 * sites, resolve receiver ownership, and emit public addresses for the unit.
 *
 * @evidence contracts/common.md#principled-implementation A transient record pairs a physical declaration with its package-wide unit ID.
 * @evidence contracts/common.md#clear-and-simple-design The package resolver uses it to collect sites and addresses.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGoMaterializedDeclaration {
  /**
   * File analysis owning the declaration's physical source and package context.
   *
   * It supplies file paths and documentation during final materialization.
   */
  analysis: IEvidenceGoFileAnalysis;

  /**
   * Original scanner record contributing one site to the semantic unit.
   *
   * Receiver ownership may cause several records to share `unitId`.
   */
  declaration: IEvidenceGoDeclaration;

  /**
   * Package-wide semantic identity assigned after receiver resolution.
   *
   * This ID, rather than the scanner key, drives graph coverage counting.
   */
  unitId: string;
}
