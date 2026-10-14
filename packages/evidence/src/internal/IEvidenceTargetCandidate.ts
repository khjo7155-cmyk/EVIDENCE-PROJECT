import type { IEvidenceAddress } from "../structures/IEvidenceAddress";
import type { IEvidenceResolution } from "../structures/IEvidenceResolution";

/**
 * Public address paired with its exact inventory lookup result.
 *
 * Target resolution can derive several addresses from a host's retained
 * origins. Keeping each address beside its lookup outcome permits candidate
 * aggregation without losing which spelling produced a visible, hidden, or
 * missing match.
 *
 * @evidence contracts/common.md#principled-implementation A public address paired with its exact lookup result lets the resolver compare candidates across origins.
 * @evidence contracts/common.md#clear-and-simple-design The record joins address and resolution only.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No fuzzy candidate is added beyond exact lookups.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the pairing; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceTargetCandidate {
  /**
   * Concrete public file key and accessor segments submitted to inventory
   * lookup.
   *
   * This is already parsed under the applicable artifact target grammar.
   */
  address: IEvidenceAddress;

  /**
   * Lookup outcome within the selected reference's structural scope.
   *
   * The resolver combines candidates by semantic identity before deciding
   * uniqueness.
   */
  resolution: IEvidenceResolution;
}
