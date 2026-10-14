import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceSqlDeclaration } from "./IEvidenceSqlDeclaration";
import type { IEvidenceSqlDocumentation } from "./IEvidenceSqlDocumentation";

/**
 * Retains a node-free SQL extraction after its parse session closes.
 *
 * SQL adapters transfer this serializable analysis to later inventory and
 * documentation phases without retaining Tree-sitter nodes or session state.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis holds the source, declarations, carriers, diagnostics and completeness.
 * @evidence contracts/common.md#clear-and-simple-design Scanners produce it; resolvers and the materializer consume it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed syntax; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSqlFileAnalysis {
  /**
   * Preserves the selected source snapshot whose coordinates records use.
   *
   * Consumers use this source to retain the physical file boundary of every
   * declaration, comment, and diagnostic.
   */
  source: IEvidenceSourceFile;

  /**
   * Contains declarations extracted from recognized schema syntax.
   *
   * The collection includes non-public structural boundaries needed to build a
   * faithful inventory before public selection is projected.
   */
  declarations: IEvidenceSqlDeclaration[];

  /**
   * Contains classified comments and unsupported annotation carriers.
   *
   * Detached carriers remain here so later phases can report their annotations
   * instead of treating absence of an attachment as absence of evidence.
   */
  documentation: IEvidenceSqlDocumentation[];

  /**
   * Records failures encountered while establishing the schema surface.
   *
   * These diagnostics explain why callers must not trust a partial extraction
   * as a complete selected population.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * States whether every relevant declaration form was understood.
   *
   * A false value prevents unsupported source from making coverage pass by
   * shrinking the discovered inventory.
   */
  complete: boolean;
}
