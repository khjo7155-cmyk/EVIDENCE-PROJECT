import type {
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  OpenApiV3_2,
  SwaggerV2,
} from "@typia/interface";

/**
 * Swagger and OpenAPI document versions accepted by the shared converter.
 *
 * The Swagger adapter narrows supported parser output to this union before it
 * extracts operations, keeping version-specific source models behind one
 * input.
 *
 * @evidence contracts/common.md#principled-implementation The union of accepted Swagger 2.0 and OpenAPI 3.x document models narrows parser output before conversion.
 * @evidence contracts/common.md#clear-and-simple-design Version-specific models stay behind this one input type.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported versions are rejected before extraction.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the narrowing.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceSwaggerDocumentInput =
  | SwaggerV2.IDocument
  | OpenApiV3.IDocument
  | OpenApiV3_1.IDocument
  | OpenApiV3_2.IDocument
  | OpenApi.IDocument;
