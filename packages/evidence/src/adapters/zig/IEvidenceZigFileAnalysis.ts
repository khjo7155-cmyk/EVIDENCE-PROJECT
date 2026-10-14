import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceZigDeclaration } from "./IEvidenceZigDeclaration";
import type { IEvidenceZigDocumentation } from "./IEvidenceZigDocumentation";

/**
 * Holds the node-free Zig extraction retained after a parse session closes.
 *
 * Alias reconciliation works from this serializable record after the parser is
 * closed, retaining the physical sites that support each exported address.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps declarations (including non-public ones), carriers and diagnostics.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the adapter reconciles it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceZigFileAnalysis {
  /**
   * Retains the selected source snapshot that produced this extraction.
   *
   * Its physical path and public addresses anchor all later diagnostics, sites,
   * and public-address materialization for this file.
   */
  source: IEvidenceSourceFile;

  /**
   * Lists declarations extracted from the file, including non-public
   * boundaries.
   *
   * Alias reconciliation filters public records for publication while retaining
   * source-level ownership information needed to interpret their
   * relationships.
   */
  declarations: IEvidenceZigDeclaration[];

  /**
   * Holds classified documentation and unsupported annotation carriers.
   *
   * The adapter parses these records after public units are known so tags
   * cannot attach to a declaration that never reaches the selected public
   * surface.
   */
  documentation: IEvidenceZigDocumentation[];

  /**
   * Records failures encountered while establishing the public surface.
   *
   * These diagnostics reach the final inventory to prevent unsupported source
   * forms from reducing the coverage population without a reported failure.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * States whether scanning classified every surface-affecting Zig form.
   *
   * The inventory treats false as a failed boundary, preserving uncertainty
   * rather than allowing an unclassified alias to reduce the public
   * population.
   */
  complete: boolean;
}
