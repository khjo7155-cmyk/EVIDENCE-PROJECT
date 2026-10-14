import type { IEvidenceSqlFileAnalysis } from "../sql/IEvidenceSqlFileAnalysis";
import type { IEvidencePostgresqlReference } from "./IEvidencePostgresqlReference";

/**
 * Extends SQL analysis with PostgreSQL declarations that need an existing
 * owner.
 *
 * ALTER and COMMENT statements can contribute sites in a different file from
 * the declaration whose semantic identity they extend.
 *
 * @evidence contracts/common.md#principled-implementation The SQL analysis is extended with deferred references whose owner may be declared in another file.
 * @evidence contracts/common.md#clear-and-simple-design The scanner fills deferred references and the ownership resolver consumes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed syntax; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePostgresqlFileAnalysis extends IEvidenceSqlFileAnalysis {
  /**
   * Lists declarations whose owner must be resolved after all files are
   * scanned.
   *
   * Omission means this file has no ALTER or COMMENT sites needing cross-file
   * ownership.
   */
  references?: IEvidencePostgresqlReference[];
}
