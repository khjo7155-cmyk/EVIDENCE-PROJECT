import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidencePhpDeclaration } from "./IEvidencePhpDeclaration";
import type { IEvidencePhpDocumentation } from "./IEvidencePhpDocumentation";

/**
 * Preserves one PHP file's serializable extraction after parsing.
 *
 * EvidencePhpAdapter materializes its units only after all selected files have
 * yielded declarations, diagnostics, documentation carriers, and context for
 * digests.
 *
 * @evidence contracts/common.md#principled-implementation A per-file analysis keeps declarations, carriers, diagnostics and the file context used for digests.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the adapter consumes it after all files are scanned.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePhpFileAnalysis {
  /**
   * Selected source snapshot represented by this analysis.
   *
   * Its path anchors declaration identities and diagnostic locations.
   */
  source: IEvidenceSourceFile;

  /**
   * Lexical declarations awaiting visibility and duplicate reconciliation.
   *
   * Only public, conflict-free entries become inventory units and addresses.
   */
  declarations: IEvidencePhpDeclaration[];

  /**
   * PHPDoc carriers with their immediate declaration attachments.
   *
   * Tagged unsupported carriers remain available for diagnostic host creation.
   */
  documentation: IEvidencePhpDocumentation[];

  /**
   * Source or classification failures discovered for this file.
   *
   * These prevent a partial public surface from being considered complete.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * File-local imports and directives that affect declaration meaning.
   *
   * Complete inventories fold normalized entries into review content digests.
   */
  context: string[];

  /**
   * Whether every surface-changing construct in this file was classified.
   *
   * The adapter propagates false to reject coverage based on an incomplete
   * population.
   */
  complete: boolean;
}
