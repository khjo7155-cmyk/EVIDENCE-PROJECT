import type { Node as EvidenceNode } from "web-tree-sitter";

/**
 * Recognizes complete TypeScript export forms missing from the pinned grammar.
 *
 * The parser and ECMAScript scanner share these checks so accepting a known
 * grammar recovery also preserves its type-only projection. This does not
 * classify arbitrary recovered source as a complete declaration population.
 *
 * @evidence contracts/common.md#principled-implementation Known gaps in the pinned TypeScript grammar are recognized structurally so a complete type-only star export is not reported as incomplete.
 * @evidence contracts/common.md#clear-and-simple-design The namespace is shared by the parser and the ECMAScript scanner so both accept the same recovery.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only the exact recovery shape is accepted; arbitrary recovered source is never treated as complete.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the narrow scope.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceTypeScriptSyntax {
  /**
   * Accepts the isolated `type` recovery in a complete type-only star export.
   *
   * Every surrounding token must form an ordinary star or namespace export, and
   * all other children must be free of grammar recovery. Original source ranges
   * remain intact because the source and tree are never rewritten.
   *
   * @evidence contracts/common.md#principled-implementation An ERROR node with text 'type' is accepted only when its parent is a five- or six-token export of '*' or a namespace export from a string and every sibling is error-free.
   * @evidence contracts/common.md#clear-and-simple-design The predicate inspects the tree without rewriting source or tree.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Any other recovery or an error in a sibling still fails extraction.
   * @evidence contracts/common.md#meaningful-documentation The comment states every structural condition and that ranges stay intact.
   * @evidence contracts/performance.md#efficient-algorithms Constant work over at most six children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each recovery node is checked once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The predicate keeps no state after returning; its result is owned by the caller.
   */
  export function typeOnlyStar(node: EvidenceNode): boolean {
    if (!node.isError || node.isMissing || node.text !== "type") return false;
    const parent: EvidenceNode | null = node.parent;
    if (parent?.type !== "export_statement") return false;
    const children: EvidenceNode[] = parent.children.filter(
      (child: EvidenceNode): boolean => child.type !== "comment",
    );
    if (children.length !== 5 && children.length !== 6) return false;
    const marker: EvidenceNode | undefined = children[1];
    return (
      children[0]?.type === "export" &&
      marker !== undefined &&
      marker.equals(node) &&
      ["*", "namespace_export"].includes(children[2]?.type ?? "") &&
      children[3]?.type === "from" &&
      children[4]?.type === "string" &&
      (children.length === 5 || children[5]?.type === ";") &&
      children.every(
        (child: EvidenceNode): boolean =>
          child.equals(node) || (!child.hasError && !child.isMissing),
      )
    );
  }
}
