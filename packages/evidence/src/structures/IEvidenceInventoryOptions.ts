/**
 * Options for constructing an `EvidenceInventory` index.
 *
 * Adapters publish declaration-only inventories: a unit is one declaration.
 * Resolving and evaluating citations additionally needs each source file as an
 * addressable scope, so a file-level `@evidenceExclude src/a.ts` retires every
 * declaration of that file through the ordinary descendant rule. Target
 * resolution, graph evaluation and fingerprint inspection request those scopes;
 * an adapter finalizing its own output does not.
 *
 * @evidence contracts/common.md#principled-implementation One switch separates the published declaration surface from the derived file scopes citation needs, so both views come from the same reconciliation.
 * @evidence contracts/common.md#clear-and-simple-design The option only enables derivation; the derivation itself lives in EvidenceInventory.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Scopes are derived from declaration sites, never from file names or configuration, and are off unless requested.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why the option exists and who sets it; the field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceInventoryOptions {
  /**
   * Derives a structural `file` unit for each file-addressed source.
   *
   * The unit has an empty identity, one empty-accessor address per selected
   * spelling and no content of its own, and owns every top-level declaration
   * sited only in that file. Markdown already publishes its file units, and
   * Prisma and Swagger address schema-wide identities, so neither receives one.
   * A declaration merged from several files stays unowned.
   *
   * @default false
   */
  fileScopes?: boolean;
}
