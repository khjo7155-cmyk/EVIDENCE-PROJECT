import type { IEvidencePythonResolvedBinding } from "./IEvidencePythonResolvedBinding";

/**
 * Represents the bounded static result of one Python name lookup.
 *
 * The resolver distinguishes reachable bindings from a cyclic path so callers
 * can retain an incomplete diagnostic instead of treating recursion as
 * absence.
 *
 * @evidence contracts/common.md#principled-implementation A lookup result distinguishes reachable bindings, cycles and foreign forwarding.
 * @evidence contracts/common.md#clear-and-simple-design The export resolver produces and caches it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePythonResolution {
  /**
   * Declaration roots or namespaces reached by the requested name.
   *
   * Multiple entries preserve aliases and star-import alternatives until
   * publication deduplicates units.
   */
  bindings: IEvidencePythonResolvedBinding[];

  /**
   * Whether resolving this lookup encountered an active import cycle.
   *
   * A cycle prevents the resolver from certifying that omitted exports are
   * private.
   */
  cyclic: boolean;

  /**
   * Whether the requested name forwards a dependency outside the local
   * snapshot.
   *
   * Omission means no foreign binding was found. Foreign names introduce no
   * local declaration obligation, including through a selected local barrel.
   */
  foreign?: boolean;
}
