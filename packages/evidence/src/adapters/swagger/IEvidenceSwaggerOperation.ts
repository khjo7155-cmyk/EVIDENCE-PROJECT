import type { IEvidenceSwaggerOperationLocation } from "./IEvidenceSwaggerOperationLocation";

/**
 * One normalized Swagger operation and its semantic fingerprint input.
 *
 * This separates the public operation address from content used to detect a
 * schema change, while retaining optional source coordinates for diagnostics.
 *
 * @evidence contracts/common.md#principled-implementation An operation keeps its public target, semantic digest input and optional source locations separately.
 * @evidence contracts/common.md#clear-and-simple-design The loader produces operations; the adapter makes units and hosts.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields come from the parsed document or response; no API-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how loader and adapter use the record; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSwaggerOperation {
  /**
   * Stores the uppercase HTTP method forming the public target prefix.
   *
   * Normalization keeps OpenAPI method spelling independent from target
   * matching.
   */
  method: string;

  /**
   * Stores the absolute OpenAPI path forming the public target suffix.
   *
   * Its literal path spelling remains distinct from the HTTP method identity.
   */
  path: string;

  /**
   * Provides the stable public address in `METHOD:/path` form.
   *
   * Evidence tags resolve operations through this combined method-and-path
   * identity.
   */
  target: string;

  /**
   * Digest of canonical operation semantics.
   *
   * Description metadata and reference indirection are normalized before this
   * value is computed, keeping review state tied to API meaning.
   */
  digest: string;

  /**
   * Original description text, when the operation supplies one.
   *
   * Omission distinguishes no description from an explicitly empty string.
   */
  description?: string;

  /**
   * Source coordinates for the operation and mapped description, when known.
   *
   * Converted or aliased YAML may not have a direct scalar location.
   */
  location?: IEvidenceSwaggerOperationLocation;
}
