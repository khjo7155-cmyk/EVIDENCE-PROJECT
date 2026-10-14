/**
 * Describes one public C path emitted from a declaration.
 *
 * A declaration can be reached through its ordinary identifier and, where the
 * language permits it, a tag or typedef spelling. `canonical` distinguishes the
 * spelling that establishes identity from aliases that must yield to a
 * canonical declaration occupying one of their prefixes.
 *
 * @evidence contracts/common.md#principled-implementation An address marks whether its spelling is canonical or an alias that must yield to a canonical declaration occupying its prefix.
 * @evidence contracts/common.md#clear-and-simple-design The scanner derives addresses; the adapter publishes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCDeclarationAddress {
  /**
   * Ordered accessor segments used by Evidence target resolution.
   *
   * Segment boundaries preserve the exact public spelling of this C path.
   */
  segments: string[];

  /**
   * Whether this path is the declaration's language-namespace spelling.
   *
   * Canonical paths take precedence over aliases that would otherwise collide.
   */
  canonical: boolean;

  /**
   * Canonical prefixes that suppress this alias when they are already occupied.
   *
   * They prevent a typedef or tag alias from changing an existing semantic
   * owner's address.
   */
  aliasPrefixes: string[][];
}
