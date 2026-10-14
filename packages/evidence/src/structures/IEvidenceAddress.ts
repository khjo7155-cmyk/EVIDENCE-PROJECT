/**
 * A public file path and segmented accessor used for exact target lookup.
 *
 * Target parsing produces this structured address before resolving a semantic
 * unit. `IEvidencePublicAddress` adds the unit association when an adapter
 * publishes a path. Equal accessor names in different files can name unrelated
 * declarations, and several addresses can expose one unit through aliases.
 *
 * @example
 *   // api.ts#Client.prototype["send.request"] decomposes into:
 *   // file: "api.ts"
 *   // segments: ["Client", "prototype", "send.request"]
 *
 * @evidence contracts/common.md#principled-implementation A file plus literal accessor segments represents a target exactly, so dots inside one segment never split a name.
 * @evidence contracts/common.md#clear-and-simple-design Address structure is separate from unit association, which IEvidencePublicAddress adds.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No rendered dotted string is reparsed as a path; quoting is preserved by the accessor parser and serializer.
 * @evidence contracts/common.md#meaningful-documentation The comment explains lookup scope, alias multiplicity and gives a decomposition example; both members are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceAddress {
  /**
   * Public file component of the address.
   *
   * Accessor matching occurs within this file. Resolution normalizes the target
   * path before inventory lookup; the accessor alone does not identify a unit.
   */
  file: string;

  /**
   * Literal accessor components within the public file.
   *
   * Dots inside one component belong to its name. Use the accessor parser and
   * serializer to preserve quoting instead of splitting a rendered dotted
   * string.
   */
  segments: string[];
}
