import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";

/**
 * Identifies one Python declaration site eligible to own documentation.
 *
 * The scanner retains positions separately from units because one source site
 * can expose several accessors while producing only one evidence host.
 *
 * @evidence contracts/common.md#principled-implementation A host position marks one declaration site eligible for documentation, separate from the accessors it exposes.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records positions; the adapter creates hosts.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePythonHostPosition {
  /**
   * Scanner-local key for this attachable declaration position.
   *
   * Documentation attachments use it to suppress a fallback undocumented host.
   */
  id: string;

  /**
   * Stable declaration-site identity shared by all units at this position.
   *
   * It becomes the host site when a published attachment survives withdrawal
   * filtering.
   */
  siteId: string;

  /**
   * Source extent that contributes this site's review content.
   *
   * Coordinates remain available after Tree-sitter resources close.
   */
  range: IEvidenceSourceRange;

  /**
   * Candidate semantic units declared at this source position.
   *
   * Export reachability decides which members are actually represented by the
   * host.
   */
  unitIds: string[];
}
