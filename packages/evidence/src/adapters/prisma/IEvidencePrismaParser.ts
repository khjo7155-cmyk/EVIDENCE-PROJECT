/**
 * Resolved Prisma WASM parser and its diagnostic identity.
 *
 * The adapter records the parser implementation identity in cache keys because
 * parser upgrades can change semantic output for unchanged schema text.
 *
 * @evidence contracts/common.md#principled-implementation The parser bridge exposes getDatamodel with its origin and version for cache keys.
 * @evidence contracts/common.md#clear-and-simple-design The loader resolves and calls it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaParser {
  /**
   * Parses the complete schema parameter payload into serialized JSON.
   *
   * `EvidencePrismaModelLoader` supplies every selected file in the parser's
   * expected payload shape, then validates the returned JSON as
   * `IEvidencePrismaDatamodel`.
   *
   * @evidence contracts/common.md#principled-implementation The bridge method parses the serialized schema payload into serialized datamodel JSON.
   * @evidence contracts/common.md#clear-and-simple-design The loader supplies the payload and validates the result.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts The signature carries strings only, so no WASM object escapes.
   * @evidence contracts/common.md#meaningful-documentation The comment states the payload contract.
   * @evidenceExclude contracts/performance.md#efficient-algorithms An interface method chooses no algorithm; the WASM parser owns parsing.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work The signature computes nothing; caching is the loader's.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The signature holds no resource; it exchanges strings.
   */
  getDatamodel(parameters: string): string;

  /**
   * Parser version contributing to the whole-schema cache identity.
   *
   * A version change invalidates cached semantic output even when selected
   * source content has not changed, because parser behavior can alter the
   * datamodel.
   */
  version: string;

  /**
   * Human-readable implementation origin for diagnostics.
   *
   * The loader reports whether resolution selected the consumer project or the
   * Evidence package copy when parser loading or parsing fails.
   */
  origin: string;
}
