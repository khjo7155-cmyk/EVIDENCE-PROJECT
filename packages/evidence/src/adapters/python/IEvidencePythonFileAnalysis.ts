import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidencePythonAll } from "./IEvidencePythonAll";
import type { IEvidencePythonBinding } from "./IEvidencePythonBinding";
import type { IEvidencePythonDocumentation } from "./IEvidencePythonDocumentation";
import type { IEvidencePythonHostPosition } from "./IEvidencePythonHostPosition";
import type { IEvidencePythonOwnedUnit } from "./IEvidencePythonOwnedUnit";

/**
 * Preserves one Python file's serializable extraction after parsing.
 *
 * EvidencePythonAdapter combines these records before resolving imports and
 * exports, so parser-owned nodes never escape their session and failures remain
 * visible.
 *
 * @evidence contracts/common.md#principled-implementation A per-file analysis keeps units, bindings, __all__ state, carriers and diagnostics without parser nodes.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces it; the resolver and adapter consume it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePythonFileAnalysis {
  /**
   * Selected source whose declarations and diagnostics this analysis owns.
   *
   * Its physical path anchors units, annotation ranges, and diagnostic
   * locations.
   */
  source: IEvidenceSourceFile;

  /**
   * Static knowledge of the module's explicit export list.
   *
   * The resolver falls back to underscore-based visibility only when this state
   * permits it.
   */
  all: IEvidencePythonAll;

  /**
   * Source-ordered namespace bindings available to export resolution.
   *
   * Later entries may replace earlier names under Python binding semantics.
   */
  bindings: IEvidencePythonBinding[];

  /**
   * Lexically scanned declarations awaiting public-path publication.
   *
   * Entries can be removed when no supported export reaches their root.
   */
  units: IEvidencePythonOwnedUnit[];

  /**
   * Declaration sites that may receive a documentation host.
   *
   * Positions keep shared accessors from producing duplicate hosts.
   */
  positions: IEvidencePythonHostPosition[];

  /**
   * Parsed docstrings and adjacent comment runs from this file.
   *
   * Attachment is deferred until the exported population is known.
   */
  documentation: IEvidencePythonDocumentation[];

  /**
   * Source failures encountered while classifying this file.
   *
   * They are carried into the inventory so incomplete extraction cannot certify
   * coverage.
   */
  diagnostics: IEvidenceDiagnostic[];

  /**
   * Whether scanning classified every surface-changing construct in this file.
   *
   * A false value propagates to the completed inventory even if other files
   * succeed.
   */
  complete: boolean;
}
