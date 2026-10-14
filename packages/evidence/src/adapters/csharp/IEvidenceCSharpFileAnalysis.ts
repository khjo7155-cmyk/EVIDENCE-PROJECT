import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceCSharpDeclaration } from "./IEvidenceCSharpDeclaration";
import type { IEvidenceCSharpDocumentation } from "./IEvidenceCSharpDocumentation";

/**
 * Carries one source file's C# extraction after its Tree-sitter session can
 * close.
 *
 * EvidenceCSharpFileScanner produces this node-free boundary between syntax
 * traversal and EvidenceCSharpAdapter materialization. The adapter reconciles
 * declarations across files, maps documentation to hosts, and propagates
 * incomplete extraction to the final inventory without retaining parser nodes.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps declarations, carriers and extraction problems.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the adapter reconciles across files.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCSharpFileAnalysis {
  /**
   * Identifies the source snapshot from which this extraction was produced.
   *
   * EvidenceCSharpAdapter uses its physical path for diagnostics and hosts and
   * its configured addresses when publishing declaration accessors.
   */
  source: IEvidenceSourceFile;

  /**
   * Collects C# declarations that still require partial-family reconciliation.
   *
   * Each record retains its physical site and documentation attachment identity
   * after parsing closes. Materialization merges compatible declarations and
   * decides which ones expose public units.
   */
  declarations: IEvidenceCSharpDeclaration[];

  /**
   * Collects XML documentation carriers with scanner-established attachments.
   *
   * Attached carriers supply evidence tags for published units. Unattached or
   * unsupported annotation carriers remain available so the adapter can report
   * their diagnostics instead of silently discarding them.
   */
  documentation: IEvidenceCSharpDocumentation[];

  /**
   * Reports extraction problems that prevent this analysis from representing
   * its full source surface.
   *
   * The adapter copies these diagnostics to the final inventory and treats the
   * file as incomplete, preventing missing declarations from reducing
   * coverage.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * States whether the scanner extracted every relevant supported construct.
   *
   * A false value propagates from unsupported or invalid source surfaces and
   * prevents coverage from passing with a partial file population.
   */
  complete: boolean;
}
