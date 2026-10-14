import type { IEvidenceClaimBase } from "./IEvidenceClaimBase";

/**
 * Swagger/OpenAPI operations that cite evidence from their descriptions.
 *
 * Each HTTP method and path identifies one semantic operation host. Description
 * text provides its annotation carrier, but host participation does not depend
 * on already having written documentation; otherwise undocumented operations
 * could disappear from policies that require every selected host to answer.
 *
 * - File globs select local JSON/YAML documents. Each operation is a host
 *   addressed as METHOD:/path.
 * - Parse evidence, exclusion, and review tags from the operation's description.
 *   Fenced examples and other JSON/YAML string fields do not host tags.
 * - Operations without a description remain selected hosts for coverage policies.
 *
 * @evidence contracts/common.md#principled-implementation Specializing the claim base with the swagger discriminator and operation symbol reuses shared selection for API operations.
 * @evidence contracts/common.md#clear-and-simple-design The interface adds no fields; operation descriptions host tags.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No operation is special-cased; operations without descriptions stay selected.
 * @evidence contracts/common.md#meaningful-documentation The comment explains which carriers host tags.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSwaggerClaim extends IEvidenceClaimBase<
  "swagger",
  "operation"
> {}
