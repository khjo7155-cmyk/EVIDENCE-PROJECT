import type { IEvidenceFingerprint } from "./IEvidenceFingerprint";
import type { IEvidenceHost } from "./IEvidenceHost";
import type { IEvidenceListItem } from "./IEvidenceListItem";

/**
 * Candidate identity expanded with its immediate structural and documentation
 * context.
 *
 * Inspection uses this for resolved, ambiguous, or hidden candidates. Children
 * follow explicit parent links, and fingerprints are omitted when incomplete
 * extraction cannot establish trustworthy content for the candidate.
 *
 * @evidence contracts/common.md#principled-implementation A candidate list item expanded with direct children, hosts and fingerprint gives inspection its local structural context.
 * @evidence contracts/common.md#clear-and-simple-design Children are only direct explicit children; deeper structure is reached by further inspection.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fingerprint is omitted when the inventory cannot provide one rather than fabricated.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the expansion; each field documents its source and omission.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceInspectedUnit {
  /**
   * Candidate's public addresses, declaration sites, and population selection
   * state.
   *
   * Its row ID retains the configuration boundary in which the candidate was
   * inspected.
   */
  item: IEvidenceListItem;

  /**
   * Addressable direct children according to explicit structural parent IDs.
   *
   * This is immediate context, not a recursive flattening or a name-prefix
   * search.
   */
  children: IEvidenceListItem[];

  /**
   * Documentation carriers whose semantic owners include this identity.
   *
   * Hosts are ordered by ID and can also belong to other units in a shared
   * statement.
   */
  hosts: IEvidenceHost[];

  /**
   * Current own-content and subtree fingerprint context when the inventory is
   * complete.
   *
   * Omission means extraction cannot certify a fingerprint; it is not an empty
   * hash.
   */
  fingerprint?: IEvidenceFingerprint;
}
