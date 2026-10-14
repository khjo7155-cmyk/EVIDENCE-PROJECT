/**
 * Bounded UTF-8 response read from one configured Swagger URL.
 *
 * Remote loading owns the bytes and their digest together so later parsing and
 * caching describe the exact response that passed the size limit.
 *
 * @evidence contracts/common.md#principled-implementation The accepted bytes' decoded text and digest are kept together so caching describes the exact response that passed the size limit.
 * @evidence contracts/common.md#clear-and-simple-design The remote reader produces it; the adapter wraps it in a snapshot.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields come from the parsed document or response; no API-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how loader and adapter use the record; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRemoteSwaggerSource {
  /**
   * Decoded response content.
   *
   * The reader accepts only valid UTF-8, so loaders may parse this text without
   * applying a replacement-character normalization.
   */
  content: string;

  /**
   * SHA-256 identity of the received bytes.
   *
   * This remains byte-based because semantically equal decoded strings can have
   * arrived from different invalid or normalized encodings.
   */
  digest: string;
}
