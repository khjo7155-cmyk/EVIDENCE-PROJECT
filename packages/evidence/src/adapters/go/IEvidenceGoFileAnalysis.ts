import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceGoDeclaration } from "./IEvidenceGoDeclaration";
import type { IEvidenceGoDocumentation } from "./IEvidenceGoDocumentation";

/**
 * Stores a node-free extraction of one Go source file after parsing closes.
 *
 * EvidenceGoAdapter collects these file fragments, while
 * EvidenceGoPackageResolver uses their directory and package context to publish
 * package-wide evidence units.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps directory, package, declarations, carriers and diagnostics.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the package resolver groups files by package.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceGoFileAnalysis {
  /**
   * Source snapshot from which this package fragment was extracted.
   *
   * Its addresses become public file paths after package reconciliation.
   */
  source: IEvidenceSourceFile;

  /**
   * Normalized directory used to group Go files into one package scope.
   *
   * Directory identity prevents same-named packages from being merged globally.
   */
  directory: string;

  /**
   * Package clause name when the source supplied a statically readable clause.
   *
   * Omission is an extraction failure, not an empty package.
   */
  packageName?: string;

  /**
   * Whether this file belongs to Go's test package surface.
   *
   * Package materialization uses it to preserve Go's separate test visibility.
   */
  testFile: boolean;

  /**
   * Exported declaration records awaiting package-wide receiver resolution.
   *
   * Records remain physical so their documentation sites stay distinct.
   */
  declarations: IEvidenceGoDeclaration[];

  /**
   * Comment runs and their scanner-established declaration attachments.
   *
   * Unattached annotation carriers are retained for actionable diagnostics.
   */
  documentation: IEvidenceGoDocumentation[];

  /**
   * Problems that make this package fragment incomplete.
   *
   * The adapter preserves them instead of silently dropping declarations.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * Whether relevant supported source constructs were fully extracted.
   *
   * False propagates through package materialization to coverage evaluation.
   */
  complete: boolean;
}
