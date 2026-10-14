/**
 * Describes one ordered endpoint of a DBML relation awaiting resolution.
 *
 * The scanner preserves literal schema, table, and column segments so the
 * resolver can match them against selected declarations across files.
 *
 * @evidence contracts/common.md#principled-implementation An endpoint keeps literal schema, table and ordered column segments so composite relations resolve exactly across files.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records endpoints; the adapter resolves them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDbmlEndpoint {
  /**
   * Names the endpoint table with explicit schema and table segments.
   *
   * Omission of a DBML schema becomes the `public` schema before this value is
   * stored.
   */
  table: string[];

  /**
   * Lists endpoint columns in composite-key order.
   *
   * Position pairs each local column with the column at the same position on
   * the peer endpoint.
   */
  columns: string[];
}
