import type { Node as EvidenceNode } from "web-tree-sitter";

import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";

/**
 * Tree-sitter spelling checks shared by TypeScript and JavaScript extraction.
 *
 * The scanner uses these narrow syntax helpers to preserve literal names,
 * bindings, comments, and supported static module forms without compiler
 * evaluation.
 *
 * @evidence contracts/common.md#principled-implementation Narrow Tree-sitter node queries recover literal names, modifiers, bindings, comment syntax and module specifiers without compiler evaluation.
 * @evidence contracts/common.md#clear-and-simple-design The namespace holds syntax queries only; the scanner applies declaration rules.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts String and numeric literal names are decoded exactly, not approximated.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains its role; every exported function now has a comment and the private decoders are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceEcmaScriptSyntax {
  /**
   * Reports whether a node has an anonymous child token of the given type.
   *
   * Keywords such as `default`, `async`, or `*` are anonymous children in the
   * grammar, so this checks spelling without matching named descendants.
   *
   * @evidence contracts/common.md#principled-implementation An anonymous child whose type equals the requested keyword or punctuation proves that token is present.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function token(node: EvidenceNode, value: string): boolean {
    return node.children.some(
      (child) => !child.isNamed && child.type === value,
    );
  }

  /**
   * Returns the literal name a declaration or property node spells.
   *
   * Identifiers keep their text, string literals are decoded, and numeric
   * literals use their canonical number spelling. Other nodes yield undefined.
   *
   * @evidence contracts/common.md#principled-implementation Identifiers return their text, numeric literals their canonical number, and string literals their decoded value, matching how JavaScript names properties.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function name(node: EvidenceNode | null): string | undefined {
    if (node === null) return undefined;
    switch (node.type) {
      case "identifier":
      case "property_identifier":
      case "shorthand_property_identifier_pattern":
      case "type_identifier":
        return node.text;
      case "number":
        return numeric(node.text);
      case "string":
        return string(node.text);
      default:
        return undefined;
    }
  }

  /**
   * Splits a possibly nested identifier into literal name segments.
   *
   * `A.B.C` yields three segments; unsupported nodes yield an empty array.
   *
   * @evidence contracts/common.md#principled-implementation A nested identifier is flattened into its name segments, so dotted namespace declarations keep each segment literal.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function qualifiedName(node: EvidenceNode | null): string[] {
    if (node === null) return [];
    const direct = name(node);
    if (direct !== undefined) return [direct];
    if (node.type !== "nested_identifier") return [];
    return node.namedChildren.flatMap(qualifiedName);
  }

  /**
   * Reports whether a declaration carries a modifier keyword.
   *
   * Accessibility modifiers are matched by text because the grammar wraps
   * `public`, `private`, and `protected` in one node type.
   *
   * @evidence contracts/common.md#principled-implementation A modifier is present when a child has that node type or an accessibility modifier with that text.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function modifier(node: EvidenceNode, value: string): boolean {
    return node.children.some(
      (child) =>
        child.type === value ||
        (child.type === "accessibility_modifier" && child.text === value),
    );
  }

  /**
   * Reports whether a class or object-type member belongs to the public
   * surface.
   *
   * Members need a literal name and no `private`, `protected`, or auto-accessor
   * modifier; computed names therefore stay outside the surface.
   *
   * @evidence contracts/common.md#principled-implementation A member is public when it has a literal name and no private, protected or accessor modifier.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function publicMember(node: EvidenceNode): boolean {
    const member = memberName(node);
    return (
      member !== undefined &&
      !modifier(node, "private") &&
      !modifier(node, "protected") &&
      !modifier(node, "accessor")
    );
  }

  /**
   * Returns the literal name of a class or type member.
   *
   * It reads the grammar's name, pattern, or property field and returns
   * undefined for computed or unsupported names.
   *
   * @evidence contracts/common.md#principled-implementation The member's name, pattern or property field is read as a literal name.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function memberName(node: EvidenceNode): string | undefined {
    return name(
      node.childForFieldName("name") ??
        node.childForFieldName("pattern") ??
        node.childForFieldName("property"),
    );
  }

  /**
   * Returns the source-side name an import or export specifier refers to.
   *
   * A bare `default` keyword yields `default`.
   *
   * @evidence contracts/common.md#principled-implementation An import or export specifier's name is its literal name, or default when only the default keyword appears.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function specifierName(node: EvidenceNode): string | undefined {
    const named = name(node.childForFieldName("name"));
    if (named !== undefined) return named;
    return token(node, "default") ? "default" : undefined;
  }

  /**
   * Returns the name a specifier binds or exports under.
   *
   * Without an `as` alias the source name is used, preserving `default`.
   *
   * @evidence contracts/common.md#principled-implementation The local or exported alias is the alias field when present, otherwise the source name, with default preserved.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function specifierAlias(node: EvidenceNode): string | undefined {
    const alias = name(node.childForFieldName("alias"));
    if (alias !== undefined) return alias;
    const source = name(node.childForFieldName("name"));
    return source !== undefined && token(node, "default") ? "default" : source;
  }

  /**
   * Reports whether an initializer is a function value through type-only
   * wrappers.
   *
   * Parentheses and `as`, `satisfies`, non-null, and angle-bracket assertions
   * are looked through; any other expression is not a function value.
   *
   * @evidence contracts/common.md#principled-implementation Arrow, function and generator expressions count as function values through parentheses and type-only wrappers such as as, satisfies, non-null and assertions.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function functionValue(node: EvidenceNode | null): boolean {
    let current = node;
    while (current !== null) {
      if (
        current.type === "arrow_function" ||
        current.type === "function_expression" ||
        current.type === "generator_function"
      )
        return true;
      if (
        current.type !== "parenthesized_expression" &&
        current.type !== "as_expression" &&
        current.type !== "satisfies_expression" &&
        current.type !== "non_null_expression" &&
        current.type !== "type_assertion"
      )
        return false;
      current =
        current.type === "type_assertion"
          ? (current.namedChildren.at(-1) ?? null)
          : (current.childForFieldName("expression") ??
            current.childForFieldName("value") ??
            current.namedChildren[0] ??
            null);
    }
    return false;
  }

  /**
   * Reports whether a type annotation is an inline function type.
   *
   * Parenthesized types are unwrapped; named aliases and unions do not count.
   *
   * @evidence contracts/common.md#principled-implementation A type annotation is a function type when, after removing parentheses, its node is function_type.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function functionType(node: EvidenceNode | null): boolean {
    let current = node;
    if (current?.type === "type_annotation")
      current = current.namedChildren[0] ?? null;
    while (current?.type === "parenthesized_type")
      current = current.namedChildren[0] ?? null;
    return current?.type === "function_type";
  }

  /**
   * Returns the normalization rules for an ECMAScript comment node.
   *
   * Only `/**` blocks may carry withdrawal tags; line and ordinary block
   * comments are normalized so their tags can be reported as unsupported.
   *
   * @evidence contracts/common.md#principled-implementation Comment delimiters decide the normalization rules: JSDoc blocks allow withdrawal, while line and ordinary block comments keep tag boundaries without withdrawal.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function comment(node: EvidenceNode): IEvidenceCommentSyntax {
    if (node.text.startsWith("//"))
      return {
        opening: "//",
        closing: "",
        tagBoundaries: true,
        allowWithdrawal: false,
      };
    if (node.text.startsWith("/**"))
      return {
        opening: "/**",
        closing: "*/",
        linePrefix: "*",
        tagBoundaries: true,
        allowWithdrawal: true,
      };
    return {
      opening: "/*",
      closing: "*/",
      linePrefix: "*",
      tagBoundaries: true,
      allowWithdrawal: false,
    };
  }

  /**
   * Reports whether a node is a JSDoc block comment.
   *
   * @evidence contracts/common.md#principled-implementation A comment node starting with '/**' is JSDoc.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function jsdoc(node: EvidenceNode): boolean {
    return node.type === "comment" && node.text.startsWith("/**");
  }

  /**
   * Returns the decoded module specifier of a string node.
   *
   * Non-string sources yield undefined so dynamic specifiers are not guessed.
   *
   * @evidence contracts/common.md#principled-implementation A string node holding a module specifier is decoded to its value; anything else yields nothing.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function module(source: EvidenceNode | null): string | undefined {
    if (source === null || source.type !== "string") return undefined;
    return string(source.text);
  }

  /**
   * Collects the identifier leaves bound by a declaration pattern.
   *
   * Defaults and rest elements are unwrapped, and object pairs contribute their
   * value side, so every locally bound name is returned once per occurrence.
   *
   * @evidence contracts/common.md#principled-implementation Identifier leaves are collected through assignment, rest, object and array patterns, following pair values rather than keys.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query used by the scanner; it does not decide visibility or publication.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads only Tree-sitter node structure and never evaluates code.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected node's direct children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function bindings(pattern: EvidenceNode | null): EvidenceNode[] {
    if (pattern === null) return [];
    switch (pattern.type) {
      case "identifier":
      case "shorthand_property_identifier_pattern":
        return [pattern];
      case "assignment_pattern":
      case "rest_pattern":
        return bindings(
          pattern.childForFieldName("left") ?? pattern.namedChildren[0] ?? null,
        );
      case "object_pattern":
      case "array_pattern":
        return pattern.namedChildren.flatMap((child) => {
          if (child.type === "pair_pattern")
            return bindings(
              child.childForFieldName("value") ??
                child.namedChildren.at(-1) ??
                null,
            );
          return bindings(child);
        });
      default:
        return [];
    }
  }

  /**
   * Decodes a quoted JavaScript string literal the way the language does.
   *
   * Simple, hexadecimal, Unicode and line-continuation escapes are applied;
   * malformed escapes or quotes yield undefined so the name is not guessed.
   */
  function string(text: string): string | undefined {
    if (text.length < 2) return undefined;
    const quote = text[0];
    if ((quote !== '"' && quote !== "'") || text.at(-1) !== quote)
      return undefined;
    let output = "";
    for (let index = 1; index < text.length - 1; ++index) {
      const character = text[index];
      if (character !== "\\") {
        output += character ?? "";
        continue;
      }
      const escaped = text[++index];
      if (escaped === undefined) return undefined;
      switch (escaped) {
        case "n":
          output += "\n";
          break;
        case "r":
          output += "\r";
          break;
        case "t":
          output += "\t";
          break;
        case "b":
          output += "\b";
          break;
        case "f":
          output += "\f";
          break;
        case "v":
          output += "\v";
          break;
        case "0":
          output += "\0";
          break;
        case "x": {
          const value = hexadecimal(text, index + 1, 2);
          if (value === undefined) return undefined;
          output += String.fromCharCode(value);
          index += 2;
          break;
        }
        case "u": {
          if (text[index + 1] === "{") {
            const closing = text.indexOf("}", index + 2);
            if (closing === -1) return undefined;
            const digits = text.slice(index + 2, closing);
            if (!/^[0-9a-fA-F]{1,6}$/u.test(digits)) return undefined;
            const value = Number.parseInt(digits, 16);
            if (value > 0x10ffff) return undefined;
            output += String.fromCodePoint(value);
            index = closing;
          } else {
            const value = hexadecimal(text, index + 1, 4);
            if (value === undefined) return undefined;
            output += String.fromCharCode(value);
            index += 4;
          }
          break;
        }
        case "\n":
          break;
        case "\r":
          if (text[index + 1] === "\n") ++index;
          break;
        default:
          output += escaped;
      }
    }
    return output;
  }

  /**
   * Returns the canonical name of a numeric literal property key.
   *
   * Numeric separators are removed and finite values use JavaScript's number
   * spelling, matching how `{ 1e3: x }` names the property `1000`.
   */
  function numeric(text: string): string {
    const compact = text.replaceAll("_", "");
    const value = Number(compact);
    return Number.isFinite(value) ? String(value) : compact;
  }

  /**
   * Parses a fixed-length hexadecimal escape payload.
   *
   * Returns undefined when the text is shorter than required or contains a
   * non-hexadecimal digit.
   */
  function hexadecimal(
    text: string,
    start: number,
    length: number,
  ): number | undefined {
    const digits = text.slice(start, start + length);
    return digits.length === length && /^[0-9a-fA-F]+$/u.test(digits)
      ? Number.parseInt(digits, 16)
      : undefined;
  }
}
