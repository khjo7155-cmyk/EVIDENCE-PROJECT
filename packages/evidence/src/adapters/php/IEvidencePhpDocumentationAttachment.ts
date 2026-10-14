/**
 * Links a PHPDoc carrier to one declaration at an adjacent source site.
 *
 * EvidencePhpAdapter resolves this scanner-local relationship only after it has
 * created public units, allowing unsupported or private attachment to remain
 * visible.
 *
 * @evidence contracts/common.md#principled-implementation An attachment links a PHPDoc carrier to an adjacent declaration site.
 * @evidence contracts/common.md#clear-and-simple-design The adapter resolves it after units exist.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePhpDocumentationAttachment {
  /**
   * Scanner identity of the declaration receiving this documentation.
   *
   * The adapter maps it to a materialized unit before tags can affect
   * withdrawals.
   */
  declarationId: string;

  /**
   * Shared source-site identity for the attached declaration.
   *
   * It groups accessors that must produce one documentation host.
   */
  siteId: string;
}
