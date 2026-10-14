import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceKotlinDeclaration } from "./IEvidenceKotlinDeclaration";
import type { IEvidenceKotlinDocumentation } from "./IEvidenceKotlinDocumentation";

/**
 * Holds the node-free Kotlin extraction retained after a parse session closes.
 *
 * Receiver and alias resolution consumes all selected files after scanning, so
 * this boundary owns source-context facts without retaining parser objects.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps package, imports, declarations, carriers and diagnostics for snapshot-wide resolution.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; receiver resolution and the adapter consume it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceKotlinFileAnalysis {
  /**
   * Retains the selected Kotlin source file that produced this analysis.
   *
   * Receiver resolution uses its physical identity for file-private lookup, and
   * materialization uses its addresses for public citations.
   */
  source: IEvidenceSourceFile;

  /**
   * Lists extracted declarations, including non-public lookup boundaries.
   *
   * `EvidenceKotlinReceivers` consumes the records across the snapshot before
   * `EvidenceKotlinAdapter` selects public units.
   */
  declarations: IEvidenceKotlinDeclaration[];

  /**
   * Lists classified KDoc and unsupported annotation carriers from this file.
   *
   * The adapter preserves tagged unsupported carriers so they can produce
   * host-level diagnostics.
   */
  documentation: IEvidenceKotlinDocumentation[];

  /**
   * Lists failures encountered while establishing this file's public surface.
   *
   * The adapter forwards them into the inventory together with the `complete`
   * status.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * States whether the scanner understood every surface-affecting form.
   *
   * Incomplete scans are propagated into the inventory so unsupported Kotlin
   * syntax cannot make a coverage check pass with fewer units.
   */
  complete: boolean;
}
