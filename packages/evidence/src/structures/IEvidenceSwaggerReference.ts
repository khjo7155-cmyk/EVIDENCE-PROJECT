import type { IEvidenceReferenceBase } from "./IEvidenceReferenceBase";

/**
 * Swagger/OpenAPI operations required by one reference obligation.
 *
 * Each operation is a separate unit addressed by a whitespace-free
 * `METHOD:/path` token. The document boundary belongs to the reference entry,
 * allowing identical operation tokens in different documents to impose
 * independent coverage requirements.
 *
 * @example
 *   GET:/users/{id}
 *
 * @evidence contracts/common.md#principled-implementation A single file or URL specializes the reference base for one OpenAPI document.
 * @evidence contracts/common.md#clear-and-simple-design Only file is added; policy comes from the base.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Remote documents are fetched on each load rather than cached on disk.
 * @evidence contracts/common.md#meaningful-documentation The comment explains selection; the field documents local and URL forms.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSwaggerReference extends IEvidenceReferenceBase<
  "swagger",
  "operation"
> {
  /**
   * Exact local JSON/YAML path or HTTP(S) URL, not a glob or directory.
   *
   * - Relative paths resolve from root. Absolute paths are accepted; Windows
   *   drive-relative paths are invalid.
   * - Remote loading and document normalization failures are reported.
   * - Use separate reference entries for independent coverage of multiple
   *   documents.
   */
  file: string;
}
