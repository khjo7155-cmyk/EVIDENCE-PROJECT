/**
 * Logical filename rules selecting one pinned grammar variant.
 *
 * Selection first respects the configured artifact family, then matches exact
 * filename or extension spellings within that family. This supports variants
 * such as TSX and named Ruby files without treating ambiguous extensions as
 * languages.
 *
 * @evidence contracts/common.md#principled-implementation Extension and exact filename lists select one grammar variant from a logical filename.
 * @evidence contracts/common.md#clear-and-simple-design Selection rules only; the registry performs the match.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No content sniffing or heuristic selection is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains selection; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLanguageGrammar {
  /**
   * Key of the pinned grammar provenance entry.
   *
   * Parser acquisition uses this key after filename selection chooses the
   * variant.
   */
  id: string;

  /**
   * Accepted case-sensitive suffixes, including their leading dots.
   *
   * The logical selected filename determines the match even when a link points
   * to a physical file with another spelling.
   */
  extensions: string[];

  /**
   * Accepted exact basenames that need no conventional extension.
   *
   * Named files such as Gemfile retain case-sensitive matching; an empty list
   * means this variant relies on its extension rules.
   */
  filenames: string[];
}
