import type { Node as EvidenceNode } from "web-tree-sitter";

/**
 * Decodes PostgreSQL identifiers without relying on the session search path.
 *
 * The PostgreSQL scanner requires explicit schema paths so snapshot extraction
 * stays deterministic.
 *
 * @evidence contracts/common.md#principled-implementation PostgreSQL identifiers fold unquoted ASCII and keep quoted spelling and dots, and object paths must be explicitly schema-qualified instead of relying on search_path.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only decodes names and paths.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Session search_path is never consulted, keeping extraction deterministic.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the search-path rule; both functions are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidencePostgresqlIdentity {
  /**
   * Preserves quoted case and literal dots while folding unquoted ASCII case.
   *
   * The result is a semantic segment, so a quoted dot never creates another
   * path segment.
   *
   * @evidence contracts/common.md#principled-implementation Unquoted ASCII letters fold to lower case while quoted identifiers keep case and dots, as PostgreSQL does.
   * @evidence contracts/common.md#clear-and-simple-design Decoding is limited to one segment.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts A quoted dot never creates another segment.
   * @evidence contracts/common.md#meaningful-documentation The comment explains folding and segments.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the identifier or literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each spelling is decoded once where it occurs.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function identifier(raw: string): string | undefined {
    if (/^"(?:[^"]|"")+"$/u.test(raw)) {
      const decoded = raw.slice(1, -1).replaceAll('""', '"');
      return Buffer.byteLength(decoded, "utf8") <= 63 ? decoded : undefined;
    }
    if (Buffer.byteLength(raw, "utf8") > 63) return undefined;
    return /^[A-Za-z_\u00c0-\u017f][A-Za-z_0-9\u00c0-\u017f]*$/u.test(raw)
      ? raw.replace(/[A-Z]/gu, (letter) => letter.toLowerCase())
      : undefined;
  }

  /**
   * Reads segmented identifiers from a grammar-owned object reference.
   *
   * Invalid or missing identifier segments leave the path unresolved for the
   * caller to diagnose.
   *
   * @evidence contracts/common.md#principled-implementation Each identifier child of an object reference is decoded into its own segment.
   * @evidence contracts/common.md#clear-and-simple-design It composes identifier per segment.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid segments leave the path unresolved for the caller to diagnose.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the unresolved result.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the inspected statement's syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each statement is validated once during its file scan.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function reads borrowed nodes during the parse callback and keeps no reference to them.
   */
  export function path(node: EvidenceNode): string[] | undefined {
    const identifiers = node.descendantsOfType("identifier");
    const names = (node.type === "identifier" ? [node] : identifiers).map(
      (identifierNode) => identifier(identifierNode.text),
    );
    return names.length !== 0 && names.every((name) => name !== undefined)
      ? names
      : undefined;
  }
}
