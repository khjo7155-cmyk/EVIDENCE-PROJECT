import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";

/**
 * Represents one physical declaration position eligible to host JSDoc evidence.
 *
 * The adapter emits the position as an undocumented host unless an attached,
 * public comment replaces its range with a documented claim.
 *
 * @evidence contracts/common.md#principled-implementation A host position records a declaration site that can carry JSDoc, so undocumented public declarations still become hosts.
 * @evidence contracts/common.md#clear-and-simple-design The adapter replaces the position with a documented host when an attached public comment exists.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEcmaScriptHostPosition {
  /**
   * Stable physical-position key used to deduplicate documented and empty
   * hosts.
   *
   * It does not substitute for a semantic unit identity.
   */
  id: string;

  /**
   * Declaration site associated with this host position.
   *
   * The site connects annotations to fingerprinted source ownership.
   */
  siteId: string;

  /**
   * Exact range emitted for an undocumented eligible host.
   *
   * A documented comment replaces this position as the host's range.
   */
  range: IEvidenceSourceRange;

  /**
   * Selected local units that legitimately share this declaration position.
   *
   * The adapter filters it by export reachability before publication.
   */
  unitIds: string[];
}
