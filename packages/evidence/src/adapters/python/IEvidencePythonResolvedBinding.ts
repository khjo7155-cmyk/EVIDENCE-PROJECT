/**
 * Identifies a declaration root or module namespace reached through imports.
 *
 * EvidencePythonExportResolver carries this lightweight result across files
 * before it converts a reachable root into public addresses and a published
 * unit.
 *
 * @evidence contracts/common.md#principled-implementation A resolved binding names the declaration root or module namespace reached through imports.
 * @evidence contracts/common.md#clear-and-simple-design The resolver converts it into addresses.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePythonResolvedBinding {
  /**
   * Selected source module containing this resolved target.
   *
   * It keys later root lookup and ensures traversal remains inside the
   * snapshot.
   */
  sourceId: string;

  /**
   * Local declaration root when the lookup resolves to a declaration.
   *
   * Omission represents a module namespace, whose next attribute lookup
   * supplies the root.
   */
  root?: string;
}
