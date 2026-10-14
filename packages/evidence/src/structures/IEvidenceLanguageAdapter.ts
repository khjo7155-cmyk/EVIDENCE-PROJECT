import type { EvidenceProgrammingSymbol } from "../typings/EvidenceProgrammingSymbol";

/**
 * Certified declaration and documentation boundaries of a programming adapter.
 *
 * Capability inspection publishes this contract alongside grammar metadata so
 * authors can see which public surfaces and citation spellings extraction
 * supports. Unsupported cases remain explicit instead of being implied by
 * grammar coverage.
 *
 * @evidence contracts/common.md#principled-implementation Certified symbols, surface, addressing, comments and limitations describe a programming adapter's semantic guarantees.
 * @evidence contracts/common.md#clear-and-simple-design The record is descriptive metadata for capability reports.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported capabilities are listed rather than hidden.
 * @evidence contracts/common.md#meaningful-documentation The comment explains its role; each field documents what readers use it for.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLanguageAdapter {
  /**
   * Public constructor name exposing the certified adapter.
   *
   * This connects catalog inspection to the programmatic extraction entry
   * point.
   */
  entry: string;

  /**
   * Programming symbol selectors supported by extraction.
   *
   * These classify semantic units for population selection after parsing.
   */
  symbols: EvidenceProgrammingSymbol[];

  /**
   * Description of the public declaration surface established by the adapter.
   *
   * Language-specific export and visibility rules determine which declarations
   * can become public Evidence units.
   */
  publicSurface: string;

  /**
   * Canonical public-address and ownership policy for extracted declarations.
   *
   * This explains how authors name targets, including language-specific member
   * or module qualification.
   */
  addressing: string;

  /**
   * Documentation forms accepted as annotation carriers.
   *
   * Ordinary comments or strings outside these supported forms cannot establish
   * evidence merely by containing tag-like text.
   */
  comments: string[];

  /**
   * Known source capabilities outside the adapter's certified extraction
   * boundary.
   *
   * These limitations qualify the public-surface description for capability
   * readers.
   */
  unsupported: string[];
}
