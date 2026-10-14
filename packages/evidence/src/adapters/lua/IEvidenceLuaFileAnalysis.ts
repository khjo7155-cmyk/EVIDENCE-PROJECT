import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceLuaDeclaration } from "./IEvidenceLuaDeclaration";
import type { IEvidenceLuaDocumentation } from "./IEvidenceLuaDocumentation";

/**
 * Holds the node-free Lua extraction retained after a parse session closes.
 *
 * Static initialization is interpreted only while scanning; this record carries
 * the resulting public-value candidates into inventory materialization.
 *
 * @evidence contracts/common.md#principled-implementation A node-free per-file analysis keeps the declarations and alias projections established by static initialization.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the adapter materializes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLuaFileAnalysis {
  /**
   * Retains the selected Lua source file that produced this analysis.
   *
   * Its physical identity and configured addresses are used when units and
   * comment hosts are materialized.
   */
  source: IEvidenceSourceFile;

  /**
   * Lists declarations and alias projections established by supported static
   * initialization.
   *
   * `EvidenceLuaAdapter` reconciles these node-free records into public units
   * after scanning ends.
   */
  declarations: IEvidenceLuaDeclaration[];

  /**
   * Lists classified LuaDoc and unsupported annotation carriers from this file.
   *
   * Tagged unsupported carriers remain available for diagnostics instead of
   * silently disappearing.
   */
  documentation: IEvidenceLuaDocumentation[];

  /**
   * Lists failures encountered while establishing the static public surface.
   *
   * The adapter forwards them into the inventory together with the `complete`
   * boundary.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * States whether static extraction understood every relevant source form.
   *
   * A false value keeps unsupported dynamic behavior visible to callers rather
   * than treating an incomplete table projection as an empty public surface.
   */
  complete: boolean;
}
