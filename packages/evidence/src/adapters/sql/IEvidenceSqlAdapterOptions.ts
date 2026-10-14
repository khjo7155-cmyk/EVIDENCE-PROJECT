import type { EvidenceParseSession } from "../../parsers/EvidenceParseSession";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { EvidenceDatabaseType } from "../../typings/EvidenceDatabaseType";
import type { IEvidenceSqlFileAnalysis } from "./IEvidenceSqlFileAnalysis";

/**
 * Dialect-specific hooks consumed by the shared SQL inventory materializer.
 *
 * Scanning owns syntax and declaration interpretation; an optional resolver can
 * connect ownership across files. The materializer runs these phases before
 * materializing units and documentation under a single parser lifecycle.
 *
 * @evidence contracts/common.md#principled-implementation A dialect type, a scan callback and an optional cross-file resolver are the hooks the shared materializer needs.
 * @evidence contracts/common.md#clear-and-simple-design The options separate dialect parsing from shared publication.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed syntax; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSqlAdapterOptions {
  /**
   * Explicit database family used for grammar selection and inventory type.
   *
   * Shared .sql extensions do not permit falling back to another dialect on
   * failure.
   */
  type: EvidenceDatabaseType;

  /**
   * Copies one borrowed syntax tree into serializable declaration and host
   * records.
   *
   * Returned analysis must not retain native nodes after the parse callback
   * ends; unsupported extraction should preserve diagnostics and incomplete
   * state.
   *
   * @evidence contracts/common.md#principled-implementation The callback copies one borrowed tree into serializable declarations and carriers.
   * @evidence contracts/common.md#clear-and-simple-design Each dialect supplies its own scanner through this hook.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Implementations must not retain nodes and must report unsupported syntax.
   * @evidence contracts/common.md#meaningful-documentation The comment states the no-node-retention and failure obligations.
   * @evidenceExclude contracts/performance.md#efficient-algorithms A callback signature chooses no algorithm; dialect scanners own their traversal.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work The signature computes nothing.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources It requires implementations to return node-free data before the session closes.
   */
  scan: (
    session: EvidenceParseSession,
    source: IEvidenceSourceFile,
  ) => IEvidenceSqlFileAnalysis;

  /**
   * Reconciles cross-file declaration and documentation ownership before
   * publication.
   *
   * The hook mutates copied file analyses after every scan has completed.
   * Omission means the dialect scanner already established the ownership needed
   * for materialization.
   *
   * @evidence contracts/common.md#principled-implementation The optional hook mutates all copied analyses after scanning to settle ownership across files.
   * @evidence contracts/common.md#clear-and-simple-design Only dialects with cross-file statements supply it.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Omission means scanning already established ownership; no ownership is guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states timing and omission.
   * @evidenceExclude contracts/performance.md#efficient-algorithms A callback signature chooses no algorithm; implementations own resolution.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work The signature computes nothing.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources It operates on caller-owned analyses and holds no resource.
   */
  resolve?: (analyses: IEvidenceSqlFileAnalysis[]) => void;
}
