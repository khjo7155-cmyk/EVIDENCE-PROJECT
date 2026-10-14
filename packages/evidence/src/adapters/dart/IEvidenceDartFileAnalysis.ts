import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceDartDirective } from "./IEvidenceDartDirective";
import type { IEvidenceDartDeclaration } from "./IEvidenceDartDeclaration";
import type { IEvidenceDartDocumentation } from "./IEvidenceDartDocumentation";

/**
 * Holds the node-free Dart extraction retained after a parse session closes.
 *
 * Library resolution consumes this intermediate record across every selected
 * file, so parser nodes cannot be retained and physical source remains
 * explicit.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps declarations, directives, carriers and diagnostics for library resolution.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; library resolution and the adapter consume it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDartFileAnalysis {
  /**
   * Gives the selected physical path of the defining library.
   *
   * Part files adopt this owner during topology resolution instead of becoming
   * independent public files.
   */
  library: string;

  /**
   * Gives the optional named library declaration or `part of` name.
   *
   * Omission denotes an unnamed library; named values let topology resolution
   * match named part owners.
   */
  libraryName?: string;

  /**
   * Lists library topology directives retained for snapshot-wide resolution.
   *
   * `EvidenceDartLibraries` consumes parts and exports to establish ownership
   * and projected public addresses.
   */
  directives: IEvidenceDartDirective[];

  /**
   * Retains the selected source file that produced this analysis.
   *
   * Its physical identity and configured addresses are used when units and
   * documentation hosts are materialized.
   */
  source: IEvidenceSourceFile;

  /**
   * Lists extracted declarations, including non-public ownership boundaries.
   *
   * Topology resolution consumes these physical records before selecting public
   * units.
   */
  declarations: IEvidenceDartDeclaration[];

  /**
   * Lists classified DartDoc and unsupported annotation carriers in this file.
   *
   * The adapter keeps tagged unsupported carriers so they can produce
   * diagnostics rather than disappear.
   */
  documentation: IEvidenceDartDocumentation[];

  /**
   * Lists failures encountered while establishing this file's public surface.
   *
   * The adapter forwards them into the inventory alongside the `complete`
   * boundary.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * States whether scanning classified every surface-affecting form.
   *
   * A false value survives topology resolution and prevents missing syntax from
   * reducing the population used to evaluate coverage.
   */
  complete: boolean;
}
