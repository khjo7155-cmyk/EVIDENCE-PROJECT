import type { Node as EvidenceNode } from "web-tree-sitter";

import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { EvidenceCSharpAccessibility } from "./EvidenceCSharpAccessibility";

/**
 * Provides C# grammar helpers for names, modifiers, documentation, and special
 * members.
 *
 * EvidenceCSharpFileScanner uses these helpers to classify source constructs
 * and preserve C# accessibility and member spelling before it builds
 * declaration records.
 *
 * @evidence contracts/common.md#principled-implementation Grammar helpers decode C# identifiers (verbatim '@' and Unicode escapes), qualified paths, arity, modifiers, XML comment syntax and operator spellings.
 * @evidence contracts/common.md#clear-and-simple-design The namespace holds syntax queries; accessibility and families are decided elsewhere.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Names come from grammar nodes only, never from compiler symbols.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains its consumers; every function now has its own comment.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceCSharpSyntax {
  /**
   * Returns the decoded name of a C# identifier node.
   *
   * A verbatim `@` prefix is removed and `\u`/`\U` escapes are decoded, as C#
   * does when comparing identifiers. Other nodes yield undefined.
   *
   * @evidence contracts/common.md#principled-implementation Identifier text drops a verbatim '@' prefix and decodes \u and \U escapes, matching how C# identifiers compare.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function name(node: EvidenceNode | null): string | undefined {
    if (node === null || node.type !== "identifier") return undefined;
    const value = node.text.startsWith("@") ? node.text.slice(1) : node.text;
    return value
      .replace(/\\u([0-9A-Fa-f]{4})/gu, (_match, hex: string) =>
        String.fromCodePoint(Number.parseInt(hex, 16)),
      )
      .replace(/\\U([0-9A-Fa-f]{8})/gu, (match, hex: string) => {
        const codePoint = Number.parseInt(hex, 16);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
      });
  }

  /**
   * Returns the segments of an identifier or qualified name.
   *
   * Unsupported nodes, or qualifiers containing them, yield undefined.
   *
   * @evidence contracts/common.md#principled-implementation A qualified name is flattened recursively into decoded segments.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function path(node: EvidenceNode | null): string[] | undefined {
    if (node === null) return undefined;
    const direct = name(node);
    if (direct !== undefined) return [direct];
    if (node.type !== "qualified_name") return undefined;
    const qualifier = path(node.childForFieldName("qualifier"));
    const suffix = name(node.childForFieldName("name"));
    return qualifier === undefined || suffix === undefined
      ? undefined
      : [...qualifier, suffix];
  }

  /**
   * Returns how many type parameters a declaration introduces, or zero.
   *
   * @evidence contracts/common.md#principled-implementation Arity is the number of type parameters in the declaration's type parameter list.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function typeParameterArity(node: EvidenceNode): number {
    const parameters = node.namedChildren.find(
      (child) => child.type === "type_parameter_list",
    );
    return parameters === undefined
      ? 0
      : parameters.namedChildren.filter(
          (child) => child.type === "type_parameter",
        ).length;
  }

  /**
   * Reports whether a declaration lists the given modifier keyword.
   *
   * @evidence contracts/common.md#principled-implementation A modifier is present when a modifier child has that text.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function hasModifier(node: EvidenceNode, modifier: string): boolean {
    return node.namedChildren.some(
      (child) => child.type === "modifier" && child.text === modifier,
    );
  }

  /**
   * Reports whether a node has a child token of the given type.
   *
   * @evidence contracts/common.md#principled-implementation A token is present when any child has that node type.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function hasToken(node: EvidenceNode, token: string): boolean {
    return node.children.some((child) => child.type === token);
  }

  /**
   * Returns the accessibility written on a declaration.
   *
   * Combined `private protected` and `protected internal` are recognized; no
   * accessibility modifier yields `default` for later C# default rules.
   *
   * @evidence contracts/common.md#principled-implementation Modifiers map to one accessibility, recognizing the combined private protected and protected internal forms and the implicit default.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function accessibility(
    node: EvidenceNode,
  ): EvidenceCSharpAccessibility {
    const modifiers = new Set(
      node.namedChildren
        .filter((child) => child.type === "modifier")
        .map((child) => child.text),
    );
    if (modifiers.has("public")) return "public";
    if (modifiers.has("private") && modifiers.has("protected"))
      return "private-protected";
    if (modifiers.has("protected") && modifiers.has("internal"))
      return "protected-internal";
    if (modifiers.has("private")) return "private";
    if (modifiers.has("protected")) return "protected";
    if (modifiers.has("internal")) return "internal";
    if (modifiers.has("file")) return "file";
    return "default";
  }

  /**
   * Reports whether a comment is C# XML documentation (`///` or `/**`).
   *
   * @evidence contracts/common.md#principled-implementation Comments starting with /// or /** are XML documentation.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function isXmlDocumentation(node: EvidenceNode): boolean {
    return (
      node.type === "comment" &&
      (node.text.startsWith("///") || node.text.startsWith("/**"))
    );
  }

  /**
   * Returns the normalization rules for a C# comment node.
   *
   * XML documentation (`///`, `/**`) may carry withdrawal tags; ordinary
   * comments are normalized so their tags can be reported as unsupported.
   *
   * @evidence contracts/common.md#principled-implementation /// and /** documentation strip their markers and allow withdrawal, while ordinary line and block comments are normalized without withdrawal.
   * @evidence contracts/common.md#clear-and-simple-design It returns normalization rules only.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Only XML documentation can carry withdrawal tags.
   * @evidence contracts/common.md#meaningful-documentation The new comment states the comment forms.
   * @evidence contracts/performance.md#efficient-algorithms Constant work.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work A constant mapping has nothing to share.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function comment(node: EvidenceNode): IEvidenceCommentSyntax {
    if (node.text.startsWith("///"))
      return {
        opening: "///",
        closing: "",
        linePrefix: "///",
        tagBoundaries: true,
        allowWithdrawal: true,
      };
    if (node.text.startsWith("//"))
      return {
        opening: "//",
        closing: "",
        linePrefix: "//",
        tagBoundaries: true,
        allowWithdrawal: false,
      };
    const documentation = node.text.startsWith("/**");
    return {
      opening: documentation ? "/**" : "/*",
      closing: "*/",
      linePrefix: "*",
      tagBoundaries: true,
      allowWithdrawal: documentation,
    };
  }

  /**
   * Reports whether a member explicitly implements an interface member.
   *
   * @evidence contracts/common.md#principled-implementation A member with an explicit interface specifier is an explicit implementation.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function explicitInterface(node: EvidenceNode): boolean {
    return node.namedChildren.some(
      (child) => child.type === "explicit_interface_specifier",
    );
  }

  /**
   * Returns the literal segment for an operator declaration, such as `operator
   * +`.
   *
   * Checked operators include `checked`; a missing operator token yields
   * undefined.
   *
   * @evidence contracts/common.md#principled-implementation An operator declaration becomes the literal segment 'operator <token>', including checked operators.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function operatorName(node: EvidenceNode): string | undefined {
    const operator = node.childForFieldName("operator");
    if (operator === null) return undefined;
    const checked = node.children.some((child) => child.type === "checked");
    return `operator ${checked ? "checked " : ""}${operator.text}`;
  }

  /**
   * Returns the literal segment for an implicit or explicit conversion
   * operator.
   *
   * The destination type keeps its source spelling with normalized whitespace,
   * because no type resolution is performed.
   *
   * @evidence contracts/common.md#principled-implementation A conversion operator becomes 'implicit operator T' or 'explicit operator T' with whitespace-normalized source type text.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; accessibility evaluation and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only and never resolves compiler symbols or types.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function conversionOperatorName(
    node: EvidenceNode,
  ): string | undefined {
    const type = node.childForFieldName("type");
    if (type === null) return undefined;
    const conversion = node.children.some((child) => child.type === "implicit")
      ? "implicit"
      : node.children.some((child) => child.type === "explicit")
        ? "explicit"
        : undefined;
    const checked = node.children.some((child) => child.type === "checked");
    return conversion === undefined
      ? undefined
      : `${conversion} operator ${checked ? "checked " : ""}${normalize(type.text)}`;
  }

  /**
   * Collapses whitespace runs in source type text to single spaces.
   *
   * Conversion operator segments use this so formatting differences cannot
   * create distinct addresses for the same written type.
   */
  function normalize(value: string): string {
    return value.replace(/\s+/gu, " ").trim();
  }
}
