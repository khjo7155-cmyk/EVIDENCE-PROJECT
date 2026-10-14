import type { IEvidenceScalaExport } from "./IEvidenceScalaExport";
import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceScalaDeclaration } from "./IEvidenceScalaDeclaration";
import type { IEvidenceScalaDocumentation } from "./IEvidenceScalaDocumentation";

/**
 * Holds the node-free Scala extraction retained after a parse session closes.
 *
 * Export reconciliation needs declarations from the selected snapshot at once,
 * while parser state is intentionally released after each source scan.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps declarations (including non-public ones), exports, carriers and diagnostics.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; export resolution and the adapter consume it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceScalaFileAnalysis {
  /**
   * Retains the selected source snapshot that produced this analysis.
   *
   * Later export and documentation passes use its paths and content after the
   * parser session closes.
   */
  source: IEvidenceSourceFile;

  /**
   * Lists declarations extracted from this source, including non-public
   * boundaries.
   *
   * Visibility is resolved during publication, while retained private records
   * support export and withdrawal decisions.
   */
  declarations: IEvidenceScalaDeclaration[];

  /**
   * Lists classified Scaladoc and tag-bearing unsupported carriers.
   *
   * The adapter materializes them into attached or unsupported hosts after unit
   * publication.
   */
  documentation: IEvidenceScalaDocumentation[];

  /**
   * Lists failures encountered while establishing the Scala public surface.
   *
   * Each diagnostic keeps the source inventory incomplete instead of allowing a
   * smaller population to pass.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * Lists explicit forwarding exports awaiting selected-source resolution.
   *
   * Resolution runs after every selected file supplies declarations and lexical
   * lookup paths.
   */
  exports: IEvidenceScalaExport[];

  /**
   * States whether scanning classified every surface-affecting Scala form.
   *
   * The inventory carries a false value forward so incomplete export discovery
   * cannot silently turn a missing obligation into a passing result.
   */
  complete: boolean;
}
