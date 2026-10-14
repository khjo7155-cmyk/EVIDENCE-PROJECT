/**
 * Describes one statically spelled target within a public Rust use declaration.
 *
 * Use-tree expansion preserves each leaf separately so aliases and wildcard
 * exports receive their Rust-specific resolution rules.
 *
 * @evidence contracts/common.md#principled-implementation One use-tree leaf keeps its path, alias or wildcard so each gets Rust's resolution rule.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records leaves; the resolver resolves them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustUseBinding {
  /**
   * Source path segments from the use declaration to the imported target.
   *
   * The resolver interprets crate, self, and super segments in the use module.
   */
  path: string[];

  /**
   * Public name assigned with `as`, when the binding renames its target.
   *
   * Omission publishes the target's final path segment.
   */
  alias?: string;

  /**
   * Whether this binding reexports all public names from its target module.
   *
   * A false value identifies one named import path.
   */
  wildcard: boolean;
}
