import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceDependency } from "../../structures/IEvidenceSourceDependency";
import type { EvidenceEcmaScriptModuleMode } from "./EvidenceEcmaScriptModuleMode";

/**
 * Module-mode selection and its evidence for an ECMAScript source snapshot.
 *
 * The adapter consumes this result before parsing files so scanner behavior
 * uses the selected ESM or CommonJS semantics and inventory completeness
 * preserves any package-metadata failure.
 *
 * @evidence contracts/common.md#principled-implementation Per-file module modes, consulted manifest dependencies and diagnostics are what the adapter needs before scanning JavaScript.
 * @evidence contracts/common.md#clear-and-simple-design The module resolver produces the result; the adapter consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEcmaScriptModuleResolution {
  /**
   * Module semantics selected for each captured source ID.
   *
   * Each source must select one mode across all of its logical addresses before
   * the scanner interprets its import and export syntax.
   */
  modes: Map<string, EvidenceEcmaScriptModuleMode>;

  /**
   * Package metadata paths whose changes can alter mode selection.
   *
   * The watcher retains these exact dependencies, including missing manifests,
   * so creating or repairing package metadata triggers reevaluation.
   */
  dependencies: IEvidenceSourceDependency[];

  /**
   * Failures encountered while reading or interpreting package metadata.
   *
   * The adapter adds these findings to the inventory instead of continuing with
   * an apparently successful result built from incomplete mode information.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * Whether mode selection completed without diagnostics.
   *
   * False prevents the final inventory from proving coverage while still
   * retaining the fallback modes and actionable failures.
   */
  complete: boolean;
}
