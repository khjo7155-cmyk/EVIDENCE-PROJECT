import type { Node as EvidenceNode } from "web-tree-sitter";

/**
 * Decodes SQLite source identifiers without interpreting strings as executable
 * SQL.
 *
 * The SQLite scanner uses these helpers only for grammar-established name
 * nodes.
 *
 * @evidence contracts/common.md#principled-implementation SQLite identifiers are decoded from grammar-established name nodes, including its single-quote fallback, with ASCII-only case folding for comparison.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only decodes names.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts String expressions never become schema names.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the boundary; every function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceSqliteSyntax {
  /**
   * Returns a literal name, including SQLite's context-specific single-quote
   * spelling.
   *
   * Callers pass identifier tokens, so string expressions cannot become schema
   * names.
   *
   * @evidence contracts/common.md#principled-implementation Bracket, backtick, double- and context-specific single-quoted names are unquoted as SQLite accepts them.
   * @evidence contracts/common.md#clear-and-simple-design Callers pass identifier tokens only.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Expressions are not treated as names.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the single-quote case.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the inspected statement's syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each statement is validated once during its file scan.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function reads borrowed nodes during the parse callback and keeps no reference to them.
   */
  export function identifier(node: EvidenceNode): string | undefined {
    if (node.type !== "identifier" && node.type !== "string_literal")
      return undefined;
    const raw = node.text;
    const first = raw[0];
    if (first === "[") return raw.slice(1, -1);
    if (first === '"' || first === "'" || first === "`")
      return raw.slice(1, -1).replaceAll(first + first, first);
    return raw;
  }

  /**
   * Folds SQLite identifier ASCII letters while preserving other code points.
   *
   * This matches the adapter's comparison boundary without changing Unicode
   * spelling.
   *
   * @evidence contracts/common.md#principled-implementation Only ASCII letters are lowercased, matching SQLite's comparison while keeping other code points.
   * @evidence contracts/common.md#clear-and-simple-design Folding is the single comparison rule.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unicode spelling is never changed.
   * @evidence contracts/common.md#meaningful-documentation The comment states the ASCII-only rule.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the identifier or literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each spelling is decoded once where it occurs.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function fold(value: string): string {
    return value.replace(/[A-Z]/gu, (character) => character.toLowerCase());
  }

  /**
   * Reads direct grammar-established names, excluding names inside expressions.
   *
   * The returned segments remain separate so quoted dots are not treated as
   * path delimiters.
   *
   * @evidence contracts/common.md#principled-implementation Direct name children are decoded into separate segments.
   * @evidence contracts/common.md#clear-and-simple-design It composes identifier per child.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Names inside expressions are skipped and quoted dots stay inside segments.
   * @evidence contracts/common.md#meaningful-documentation The comment explains segment separation.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the inspected statement's syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each statement is validated once during its file scan.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function reads borrowed nodes during the parse callback and keeps no reference to them.
   */
  export function names(node: EvidenceNode): string[] {
    return node.namedChildren.flatMap((child) => {
      const value = identifier(child);
      return value === undefined ? [] : [value];
    });
  }
}
