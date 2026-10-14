import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { EvidenceDatabaseSymbol } from "../../typings/EvidenceDatabaseSymbol";

/**
 * One declaration extracted from the DBML syntax tree.
 *
 * The scanner copies only stable declaration facts so later cross-file alias
 * resolution can materialize units after the parser session is closed.
 *
 * @evidence contracts/common.md#principled-implementation A declaration keeps symbol, literal schema path, site and content so units can be materialized after the parser closes.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces declarations; the adapter materializes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDbmlDeclaration {
  /**
   * File-independent schema identity.
   *
   * This names semantic ownership and is deliberately distinct from a source
   * range, which can appear in more than one selected file.
   */
  identity: string[];

  /**
   * Selects a model, scalar column, or separate relation declaration.
   *
   * The adapter maps this selector to the public database unit symbol.
   */
  symbol: EvidenceDatabaseSymbol;

  /**
   * Whitespace-independent syntax tokens excluding documentation.
   *
   * The adapter fingerprints this value so annotation edits do not invalidate
   * the schema declaration they describe.
   */
  content: string;

  /**
   * Stores the exact original declaration span used for its physical site.
   *
   * This range anchors documentation and diagnostics in the selected source
   * file.
   */
  range: IEvidenceSourceRange;

  /**
   * Explicit table alias, when declared.
   *
   * Omission means endpoint resolution uses the declaration's table identity.
   */
  alias?: string;
}
