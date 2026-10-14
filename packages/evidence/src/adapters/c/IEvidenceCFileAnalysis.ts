import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceCDeclaration } from "./IEvidenceCDeclaration";
import type { IEvidenceCDocumentation } from "./IEvidenceCDocumentation";

/**
 * Preserves all C extraction facts that survive one parser session.
 *
 * `EvidenceCFileScanner` returns this node-free record so the shared parser can
 * close before cross-record reconciliation begins. The adapter combines
 * declarations and documentation with the captured source, while `diagnostics`
 * and `complete` ensure a partial scan cannot masquerade as a complete
 * inventory.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps declarations, carriers, diagnostics and completeness.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the adapter reconciles it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCFileAnalysis {
  /**
   * Captured physical source and the configured addresses that expose it.
   *
   * Materialization uses the source to place units, hosts, and diagnostics in
   * the snapshot.
   */
  source: IEvidenceSourceFile;

  /**
   * Supported declarations discovered in this file before grouping.
   *
   * The adapter reconciles them only with compatible records from the same
   * source.
   */
  declarations: IEvidenceCDeclaration[];

  /**
   * Doxygen or tag-bearing carriers recorded independently of attachment
   * success.
   *
   * This preserves unsupported annotations for diagnostics instead of silently
   * dropping them.
   */
  documentation: IEvidenceCDocumentation[];

  /**
   * Parsing and extraction findings attributed to this source file.
   *
   * The adapter copies them into the final inventory rather than shrinking its
   * population.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * Whether scanning found every construct needed for a trustworthy result.
   *
   * A false value prevents a partial source surface from passing coverage
   * checks.
   */
  complete: boolean;
}
