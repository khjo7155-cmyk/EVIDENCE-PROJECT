import type { IEvidenceEcmaScriptBinding } from "./IEvidenceEcmaScriptBinding";

/**
 * Result of following one exported name through the static module graph.
 *
 * The export resolver caches this result for each source and name, then uses
 * its bindings to publish units and its state flags to distinguish exclusions
 * and declaration-free cycles from missing supported declarations.
 *
 * @evidence contracts/common.md#principled-implementation A resolution lists reached bindings plus flags for excluded, cyclic and failed traversals, so declaration-free cycles and exclusions are not mistaken for missing declarations.
 * @evidence contracts/common.md#clear-and-simple-design The resolver memoizes these results per source and name.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEcmaScriptResolution {
  /**
   * Local declarations or namespace modules reached by the exported name.
   *
   * Multiple bindings can result from star exports; each carries the source and
   * type-space restriction needed during publication.
   */
  bindings: IEvidenceEcmaScriptBinding[];

  /**
   * Whether any resolution path reaches a deliberately excluded root.
   *
   * Exclusion suppresses a missing-declaration diagnostic and propagates
   * through local and re-export paths.
   */
  excluded: boolean;

  /**
   * Whether traversal encountered the same source-and-name pair recursively.
   *
   * A result with no bindings and this flag identifies a declaration-free
   * export cycle that must be reported instead of silently publishing nothing.
   */
  cyclic: boolean;

  /**
   * Whether a lookup reaches foreign forwarding without a local declaration.
   *
   * Omission means no dependency forwarding was encountered. Local barrels
   * propagate this state so an external star cannot fabricate a missing local
   * binding, while explicit Evidence citations still require an enrolled unit.
   */
  foreign?: boolean;
}
