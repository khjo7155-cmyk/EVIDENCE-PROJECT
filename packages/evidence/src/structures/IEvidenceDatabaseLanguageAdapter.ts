import type { EvidenceDatabaseSymbol } from "../typings/EvidenceDatabaseSymbol";

/**
 * Certified schema and documentation boundaries of a database adapter.
 *
 * This contract describes the units an adapter can extract and how citations
 * name them. Capability reports keep these semantic guarantees separate from
 * the grammar's ability to recognize a broader range of database syntax.
 *
 * @evidence contracts/common.md#principled-implementation Certified symbols, surface, addressing, comments and limitations describe semantic guarantees separately from grammar coverage.
 * @evidence contracts/common.md#clear-and-simple-design The record is descriptive metadata for capability reports; extraction lives in the adapter class it names.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Known unsupported capabilities are listed rather than hidden.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the separation from grammar support; each field documents what readers use it for.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDatabaseLanguageAdapter {
  /**
   * Public constructor exposing this schema adapter.
   *
   * Programmatic consumers can connect the catalog entry to its extraction API.
   */
  entry: string;

  /**
   * Database symbol selectors supported by the adapter.
   *
   * These determine which extracted models, columns, or relations can be
   * selected.
   */
  symbols: EvidenceDatabaseSymbol[];

  /**
   * Schema declarations included in the certified extraction surface.
   *
   * This qualifies grammar support with the semantic boundaries needed for a
   * complete Evidence inventory.
   */
  publicSurface: string;

  /**
   * Canonical qualification used to address extracted schema units.
   *
   * Authors follow this policy when spelling model, column, or relation
   * targets.
   */
  addressing: string;

  /**
   * Documentation forms accepted at supported schema declaration positions.
   *
   * Attachment rules determine which comments can carry evidence or withdrawal
   * tags.
   */
  comments: string[];

  /**
   * Known schema capabilities outside certified extraction.
   *
   * Capability readers use these limitations when judging whether their input
   * falls within the adapter's documented surface.
   */
  unsupported: string[];
}
