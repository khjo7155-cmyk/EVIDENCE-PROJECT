import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceYamlScalarMapping } from "./IEvidenceYamlScalarMapping";

/**
 * Source spans for one normalized Swagger operation and its description.
 *
 * Locations are optional on operations because OpenAPI conversion can preserve
 * semantics for values that do not map to one source token.
 *
 * @evidence contracts/common.md#principled-implementation Optional spans for the operation and its description exist because conversion can keep semantics without one source token.
 * @evidence contracts/common.md#clear-and-simple-design The loader looks locations up in the YAML document.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields come from the parsed document or response; no API-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how loader and adapter use the record; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSwaggerOperationLocation {
  /**
   * Locates the full operation node used as the physical unit site.
   *
   * The range keeps diagnostics and fingerprints tied to the original document.
   */
  range: IEvidenceSourceRange;

  /**
   * Maps description characters when the scalar has a source-backed location.
   *
   * Omission means converted or aliased content has no direct scalar token.
   */
  description?: IEvidenceYamlScalarMapping;
}
