import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceRubyDeclaration } from "./IEvidenceRubyDeclaration";
import type { IEvidenceRubyDocumentation } from "./IEvidenceRubyDocumentation";

/**
 * Preserves one Ruby file's serializable extraction after parsing.
 *
 * EvidenceRubyAdapter merges all analyses to reconcile reopened declarations,
 * visibility, documentation attachment, and failures without retaining
 * Tree-sitter nodes.
 *
 * @evidence contracts/common.md#principled-implementation A per-file analysis keeps declarations, carriers and diagnostics without Tree-sitter nodes.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the adapter merges analyses.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRubyFileAnalysis {
  /**
   * Selected source snapshot represented by this analysis.
   *
   * Its addresses define the files through which materialized units are
   * published.
   */
  source: IEvidenceSourceFile;

  /**
   * Lexical declarations awaiting reopening and public-owner reconciliation.
   *
   * Multiple entries may collapse into one semantic Ruby identity.
   */
  declarations: IEvidenceRubyDeclaration[];

  /**
   * Comment carriers and their immediate declaration attachments.
   *
   * Attachment is deferred until the destination declaration group is public.
   */
  documentation: IEvidenceRubyDocumentation[];

  /**
   * Classification failures that make this source population incomplete.
   *
   * The final inventory retains them instead of silently omitting uncertain
   * APIs.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * Whether scanning fully classified this file's declared surface.
   *
   * False propagates through the merged inventory even when other files parse.
   */
  complete: boolean;
}
