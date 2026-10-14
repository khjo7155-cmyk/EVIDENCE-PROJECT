import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceMatlabDeclaration } from "./IEvidenceMatlabDeclaration";
import type { IEvidenceMatlabDocumentation } from "./IEvidenceMatlabDocumentation";

/**
 * Holds the node-free MATLAB extraction retained after a parse session closes.
 *
 * Class-folder ownership is resolved from selected files after scanning, so the
 * intermediate record retains physical declarations and diagnostics together.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps declarations, carriers and diagnostics for class-folder resolution.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; ownership resolution and the adapter consume it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceMatlabFileAnalysis {
  /**
   * Retains the selected source snapshot represented by this extraction.
   *
   * Its physical path participates in class-folder ownership and diagnostic
   * locations.
   */
  source: IEvidenceSourceFile;

  /**
   * Lists extracted declarations, including non-public ownership boundaries.
   *
   * The resolver needs hidden records to determine whether descendants can be
   * published.
   */
  declarations: IEvidenceMatlabDeclaration[];

  /**
   * Lists classified help text and unsupported annotation carriers.
   *
   * EvidenceMatlabAdapter creates hosts only after ownership reconciliation
   * establishes eligible units.
   */
  documentation: IEvidenceMatlabDocumentation[];

  /**
   * Collects failures found while establishing the static public surface.
   *
   * These diagnostics propagate to the inventory rather than removing ambiguous
   * declarations.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * States whether the scanner classified every relevant MATLAB form.
   *
   * A false value remains a failed analysis through ownership reconciliation,
   * preventing unsupported class layout from shrinking the selected surface.
   */
  complete: boolean;
}
