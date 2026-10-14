import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceSwiftDeclaration } from "./IEvidenceSwiftDeclaration";
import type { IEvidenceSwiftDocumentation } from "./IEvidenceSwiftDocumentation";

/**
 * Holds the node-free Swift extraction retained after a parse session closes.
 *
 * Module-wide nominal and alias resolution consumes these records after
 * parsing, so they retain source sites and boundaries without borrowing tree
 * nodes.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps declarations, carriers and diagnostics for module-wide resolution.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; ownership resolution and the adapter consume it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSwiftFileAnalysis {
  /**
   * Original selected source snapshot.
   *
   * Materialization uses its physical path and configured addresses for units
   * and hosts.
   */
  source: IEvidenceSourceFile;

  /**
   * Extracted declarations, including non-public boundaries.
   *
   * Ownership reconciliation needs inaccessible records to determine the public
   * surface.
   */
  declarations: IEvidenceSwiftDeclaration[];

  /**
   * Classified documentation and unsupported annotation carriers.
   *
   * Unattached tag-bearing carriers remain available for diagnostic hosts.
   */
  documentation: IEvidenceSwiftDocumentation[];

  /**
   * Failures encountered while establishing the public surface.
   *
   * The adapter propagates them instead of treating omitted declarations as
   * absent.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * States whether all surface-affecting Swift forms were classified.
   *
   * This failure signal is preserved through extension reconciliation so absent
   * declarations cannot disappear from the coverage denominator.
   */
  complete: boolean;
}
