/**
 * Requests ownership resolution for a PostgreSQL declaration site.
 *
 * The adapter uses this record after scanning all files to merge ALTER and
 * COMMENT sites with the declaration identified by their SQL identity.
 *
 * @evidence contracts/common.md#principled-implementation A deferred reference pairs a declaration site with the SQL identity of the owner it extends.
 * @evidence contracts/common.md#clear-and-simple-design Ownership resolution consumes these after every file is scanned.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed syntax; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePostgresqlReference {
  /**
   * Identifies the local declaration that receives the resolved owner.
   *
   * This ID remains stable while resolution replaces its provisional identity.
   */
  declarationId: string;

  /**
   * Names the schema-qualified table or column to resolve.
   *
   * Table identities have two segments, while column identities have three.
   */
  identity: string[];

  /**
   * Distinguishes a COMMENT site from an ALTER TABLE extension.
   *
   * Comment sites retain a separate physical address after ownership
   * resolution.
   */
  comment: boolean;
}
