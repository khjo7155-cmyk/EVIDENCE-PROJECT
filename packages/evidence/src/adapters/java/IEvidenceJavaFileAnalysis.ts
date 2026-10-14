import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceJavaDeclaration } from "./IEvidenceJavaDeclaration";
import type { IEvidenceJavaDocumentation } from "./IEvidenceJavaDocumentation";

/**
 * Stores a node-free extraction of one Java source file after parsing closes.
 *
 * EvidenceJavaAdapter aggregates these records to reconcile overload families,
 * attach Javadoc hosts, and preserve extraction failures in the final
 * inventory.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps package, declarations, carriers and diagnostics.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the adapter aggregates analyses.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceJavaFileAnalysis {
  /**
   * Source snapshot owning all extracted Java records.
   *
   * Its configured paths later receive the published accessor addresses.
   */
  source: IEvidenceSourceFile;

  /**
   * Declarations awaiting family reconciliation and public filtering.
   *
   * Records retain sites after the parser session has closed.
   */
  declarations: IEvidenceJavaDeclaration[];

  /**
   * Javadoc carriers with scanner-proven declaration attachments.
   *
   * Annotation-bearing but unsupported carriers remain diagnosable.
   */
  documentation: IEvidenceJavaDocumentation[];

  /**
   * Extraction errors that must survive into the inventory.
   *
   * They prevent partial parsing from becoming passing smaller coverage.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * Whether the scanner represented every relevant supported construct.
   *
   * The adapter carries this status through final inventory validation.
   */
  complete: boolean;
}
