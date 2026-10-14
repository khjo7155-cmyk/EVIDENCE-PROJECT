/**
 * Connects a LuaDoc carrier to one extracted Lua declaration site.
 *
 * EvidenceLuaFileScanner records this source-adjacent pair before static value
 * handling, so the documentation pass can evaluate annotations without giving
 * comments ownership of the declaration's semantic unit.
 *
 * @evidence contracts/common.md#principled-implementation An attachment pairs a LuaDoc carrier with one declaration site.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records adjacency; the documentation pass consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLuaDocumentationAttachment {
  /**
   * Identifies the declaration extraction record that receives the LuaDoc.
   *
   * Consumers use this stable scanner-local ID to locate the declaration whose
   * annotation needs evaluation.
   */
  declarationId: string;

  /**
   * Identifies the physical declaration site covered by the LuaDoc.
   *
   * This keeps an attachment at its adjacent source occurrence when aliases or
   * table members cause one semantic unit to have several sites.
   */
  siteId: string;
}
