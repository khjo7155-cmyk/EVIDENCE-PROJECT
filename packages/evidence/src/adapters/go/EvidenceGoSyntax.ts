import type { Node as EvidenceNode } from "web-tree-sitter";

import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";

/**
 * Grammar-specific Go spelling and ownership helpers.
 *
 * Go extraction uses these helpers to recognize exported identifiers,
 * receivers, embedded fields, comments, and literal carriers directly from
 * Tree-sitter nodes.
 *
 * @evidence contracts/common.md#principled-implementation Narrow node queries recognize Go identifiers, the uppercase export rule, receivers through pointers and generics, embedded field types and comment syntax.
 * @evidence contracts/common.md#clear-and-simple-design The namespace holds syntax queries; scanning applies declaration rules.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Names come from grammar node types only, never from compiler resolution.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains its consumers; every function and the private type helpers are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceGoSyntax {
  /**
   * Returns the text of a Go identifier-like node.
   *
   * Other node types yield undefined.
   *
   * @evidence contracts/common.md#principled-implementation Identifier, field, type and package identifier nodes return their text.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function name(node: EvidenceNode | null): string | undefined {
    return node !== null &&
      (node.type === "identifier" ||
        node.type === "field_identifier" ||
        node.type === "type_identifier" ||
        node.type === "package_identifier")
      ? node.text
      : undefined;
  }

  /**
   * Returns the text of every direct named child of the given node type.
   *
   * @evidence contracts/common.md#principled-implementation Direct named children of one node type are returned as text, preserving order.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function names(node: EvidenceNode, type: string): string[] {
    return node.namedChildren
      .filter((child) => child.type === type)
      .map((child) => child.text);
  }

  /**
   * Reports whether a Go name is exported.
   *
   * Go exports a name when its first rune is an uppercase Unicode letter.
   *
   * @evidence contracts/common.md#principled-implementation A name is exported when its first rune is an uppercase Unicode letter, Go's export rule.
   * @evidence contracts/common.md#clear-and-simple-design The rule is the single export check used by the scanner.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No naming convention beyond the language rule is applied.
   * @evidence contracts/common.md#meaningful-documentation The new comment states the rule.
   * @evidence contracts/performance.md#efficient-algorithms Constant work on the first rune.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work A constant check has nothing to share.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function exported(name: string): boolean {
    const first = Array.from(name)[0];
    return first !== undefined && /^\p{Lu}$/u.test(first);
  }

  /**
   * Returns the base type name of a method's receiver.
   *
   * Pointer, parenthesized, and generic receivers are unwrapped; a missing or
   * unsupported receiver yields undefined.
   *
   * @evidence contracts/common.md#principled-implementation The receiver parameter's type is unwrapped through pointers, parentheses and type arguments to its base type name.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function receiver(node: EvidenceNode): string | undefined {
    const parameters = node.childForFieldName("receiver");
    if (parameters === null) return undefined;
    const declaration = parameters.namedChildren.find(
      (child) => child.type === "parameter_declaration",
    );
    return receiverName(
      declaration === undefined ? null : declaration.childForFieldName("type"),
    );
  }

  /**
   * Returns the field name an embedded type introduces.
   *
   * Qualified, generic, pointer, and parenthesized types use their final type
   * name; unsupported types yield undefined.
   *
   * @evidence contracts/common.md#principled-implementation An embedded field's type is unwrapped through qualification, generics, pointers and parentheses to its field name.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function embeddedField(node: EvidenceNode | null): string | undefined {
    return typeName(node);
  }

  /**
   * Returns the normalization rules for a Go comment node.
   *
   * Line comments use `//` as the per-line prefix; block comments strip their
   * delimiters and `*` prefixes.
   *
   * @evidence contracts/common.md#principled-implementation Line comments strip '//' per line and block comments strip their delimiters and '*' prefixes, both allowing withdrawal on attached documentation.
   * @evidence contracts/common.md#clear-and-simple-design It returns normalization rules only.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Both forms keep tag boundaries so other tools' tags end reasons.
   * @evidence contracts/common.md#meaningful-documentation The new comment states both forms.
   * @evidence contracts/performance.md#efficient-algorithms Constant work.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work A constant mapping has nothing to share.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function comment(node: EvidenceNode): IEvidenceCommentSyntax {
    if (node.text.startsWith("//"))
      return {
        opening: "//",
        closing: "",
        linePrefix: "//",
        tagBoundaries: true,
        allowWithdrawal: true,
      };
    return {
      opening: "/*",
      closing: "*/",
      linePrefix: "*",
      tagBoundaries: true,
      allowWithdrawal: true,
    };
  }

  /**
   * Returns the final type name of a possibly qualified or wrapped type.
   *
   * Qualified types use their name, and generic, pointer, and parenthesized
   * types are unwrapped; other nodes yield undefined.
   */
  function typeName(node: EvidenceNode | null): string | undefined {
    if (node === null) return undefined;
    const direct = name(node);
    if (direct !== undefined) return direct;
    if (node.type === "qualified_type")
      return name(node.childForFieldName("name"));
    if (node.type === "generic_type")
      return typeName(node.childForFieldName("type"));
    if (node.type === "pointer_type" || node.type === "parenthesized_type")
      return typeName(node.namedChildren[0] ?? null);
    return undefined;
  }

  /**
   * Returns a receiver's base type name through generic and pointer wrappers.
   *
   * Unlike typeName, qualified types are not accepted because Go methods must
   * be declared on a type of the same package.
   */
  function receiverName(node: EvidenceNode | null): string | undefined {
    if (node === null) return undefined;
    const direct = name(node);
    if (direct !== undefined) return direct;
    if (node.type === "generic_type")
      return receiverName(node.childForFieldName("type"));
    if (node.type === "pointer_type" || node.type === "parenthesized_type")
      return receiverName(node.namedChildren[0] ?? null);
    return undefined;
  }
}
