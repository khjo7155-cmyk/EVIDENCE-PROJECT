/**
 * Resolves one public ECMAScript export to a local declaration or module
 * namespace.
 *
 * The export resolver carries this intermediate record across local exports and
 * re-export paths before it publishes public addresses for owned units.
 *
 * @evidence contracts/common.md#principled-implementation A binding records whether an export reaches a local declaration or a module namespace, so re-export chains can be followed before any address is published.
 * @evidence contracts/common.md#clear-and-simple-design The record carries resolution state only; following edges is the export resolver's job.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEcmaScriptBinding {
  /**
   * Identifier of the source file that owns the resolved binding.
   *
   * A namespace binding names this module even when it has no individual local
   * declaration name, allowing the resolver to traverse its public exports.
   */
  sourceId: string;

  /**
   * Local root name of the declaration within {@link sourceId}.
   *
   * Omission represents a namespace binding, whose reachable exports must be
   * expanded before an owned unit can be published.
   */
  localName?: string;

  /**
   * Whether the export path is restricted to TypeScript's type space.
   *
   * The resolver retains this restriction through re-exports and excludes
   * value-only units when it publishes the final public addresses.
   */
  typeOnly: boolean;
}
