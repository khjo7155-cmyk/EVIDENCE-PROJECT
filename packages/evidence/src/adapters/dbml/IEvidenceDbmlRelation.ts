import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceDbmlEndpoint } from "./IEvidenceDbmlEndpoint";

/**
 * A pending relation whose owning table is resolved across selected files.
 *
 * DBML relation syntax can name aliases outside its physical file, so this
 * record defers ownership and public-address materialization until all selected
 * declarations are available.
 *
 * @evidence contracts/common.md#principled-implementation A pending relation keeps endpoints and site until its owning table is known across files.
 * @evidence contracts/common.md#clear-and-simple-design The scanner defers; the adapter resolves ownership and addresses.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDbmlRelation {
  /**
   * Declared optional relation name.
   *
   * Omission leaves endpoint and cardinality data to establish identity.
   */
  name?: string;

  /**
   * Names the left endpoint, including the inline declaring column.
   *
   * The adapter resolves its table alias and selected column ownership.
   */
  from: IEvidenceDbmlEndpoint;

  /**
   * Names the right endpoint paired with `from` in declared relation order.
   *
   * Composite columns remain ordered to preserve endpoint correspondence.
   */
  to: IEvidenceDbmlEndpoint;

  /**
   * Stores declared cardinality for semantic identity and fingerprints.
   *
   * Direction and ownership selection depend on this DBML relation marker.
   */
  cardinality: string;

  /**
   * Indicates whether DBML inline one-to-one ownership rules apply.
   *
   * Omission means the relation uses an ordinary standalone declaration.
   */
  inline: boolean;

  /**
   * Semantic relation syntax excluding documentation.
   *
   * This excludes annotation carriers so review metadata cannot change relation
   * fingerprint content.
   */
  content: string;

  /**
   * Stores the full declaration site; inline relations share their column site.
   *
   * Shared sites allow a single documentation carrier to attach to both units.
   */
  range: IEvidenceSourceRange;

  /**
   * Temporary syntax identity replaced after endpoint resolution.
   *
   * It exists only until cross-file aliases identify the relation's owner.
   */
  identity: string[];
}
