import type { Node as EvidenceNode } from "web-tree-sitter";

import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";

/**
 * Grammar-specific Java names, packages, modifiers, literals, and Javadoc.
 *
 * Java extraction uses these helpers to interpret parser nodes without
 * resolving compiler symbols, preserving source-spelled ownership and
 * documentation boundaries.
 *
 * @evidence contracts/common.md#principled-implementation Narrow node queries read Java identifiers, scoped paths, package names, parameter names, modifiers, the preceding Javadoc and comment syntax.
 * @evidence contracts/common.md#clear-and-simple-design The namespace holds syntax queries; scanning applies declaration rules.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Names come from grammar nodes only, never from compiler symbol resolution.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains its consumers; every function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceJavaSyntax {
  /**
   * Returns the text of a Java identifier node, or undefined for other nodes.
   *
   * @evidence contracts/common.md#principled-implementation An identifier node returns its text.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function name(node: EvidenceNode | null): string | undefined {
    return node !== null && node.type === "identifier" ? node.text : undefined;
  }

  /**
   * Returns the segments of an identifier or scoped identifier.
   *
   * Unsupported nodes, or scopes containing them, yield undefined.
   *
   * @evidence contracts/common.md#principled-implementation A scoped identifier is flattened recursively into its dotted segments.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function path(node: EvidenceNode | null): string[] | undefined {
    if (node === null) return undefined;
    const direct = name(node);
    if (direct !== undefined) return [direct];
    if (node.type !== "scoped_identifier") return undefined;
    const scope = path(node.childForFieldName("scope"));
    const suffix = name(node.childForFieldName("name"));
    return scope === undefined || suffix === undefined
      ? undefined
      : [...scope, suffix];
  }

  /**
   * Returns the package segments declared by a package declaration.
   *
   * A missing declaration yields the default (empty) package.
   *
   * @evidence contracts/common.md#principled-implementation The first child of a package declaration that forms a path supplies the package segments.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function packagePath(node: EvidenceNode | undefined): string[] {
    if (node === undefined) return [];
    for (const child of node.namedChildren) {
      const candidate = path(child);
      if (candidate !== undefined) return candidate;
    }
    return [];
  }

  /**
   * Returns the declared name of a formal or varargs parameter.
   *
   * @evidence contracts/common.md#principled-implementation Formal parameters use their name field and varargs parameters use their declarator's name.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function parameterName(node: EvidenceNode): string | undefined {
    if (node.type === "formal_parameter")
      return name(node.childForFieldName("name"));
    if (node.type !== "spread_parameter") return undefined;
    const declarator = node.namedChildren.find(
      (child) => child.type === "variable_declarator",
    );
    return declarator === undefined
      ? undefined
      : name(declarator.childForFieldName("name"));
  }

  /**
   * Reports whether a declaration lists the given modifier keyword.
   *
   * @evidence contracts/common.md#principled-implementation A modifier is present when the declaration's modifiers node has a child of that keyword type.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function hasModifier(node: EvidenceNode, modifier: string): boolean {
    const modifiers = node.namedChildren.find(
      (child) => child.type === "modifiers",
    );
    return modifiers === undefined
      ? false
      : modifiers.children.some((child) => child.type === modifier);
  }

  /**
   * Returns the Javadoc block immediately preceding a declaration, if any.
   *
   * Only a `/**` block comment that is the previous named sibling qualifies.
   *
   * @evidence contracts/common.md#principled-implementation The immediately preceding named sibling is the Javadoc when it is a block comment starting with '/**'.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; declaration rules are applied elsewhere.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads Tree-sitter node structure only and never resolves compiler symbols.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied strings or values and keeps no reference to the borrowed node.
   */
  export function javadoc(node: EvidenceNode): EvidenceNode | null {
    const previous = node.previousNamedSibling;
    return previous !== null &&
      previous.type === "block_comment" &&
      previous.text.startsWith("/**")
      ? previous
      : null;
  }

  /**
   * Returns the normalization rules for a Java comment node.
   *
   * Only `/**` Javadoc allows withdrawal tags; line and ordinary block comments
   * are normalized so their tags can be reported as unsupported.
   *
   * @evidence contracts/common.md#principled-implementation Line comments strip '//', Javadoc strips its delimiters and '*' prefixes with withdrawal allowed, and ordinary block comments are normalized without withdrawal.
   * @evidence contracts/common.md#clear-and-simple-design It returns normalization rules only.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Only Javadoc can carry withdrawal tags.
   * @evidence contracts/common.md#meaningful-documentation The new comment states the three forms.
   * @evidence contracts/performance.md#efficient-algorithms Constant work.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work A constant mapping has nothing to share.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function comment(node: EvidenceNode): IEvidenceCommentSyntax {
    if (node.type === "line_comment")
      return {
        opening: "//",
        closing: "",
        linePrefix: "//",
        tagBoundaries: true,
        allowWithdrawal: false,
      };
    const javadoc = node.text.startsWith("/**");
    return {
      opening: javadoc ? "/**" : "/*",
      closing: "*/",
      tagBoundaries: true,
      allowWithdrawal: javadoc,
      ...(javadoc ? { linePrefix: "*" } : {}),
    };
  }
}
