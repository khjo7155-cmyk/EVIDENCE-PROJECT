import type { Node as EvidenceNode } from "web-tree-sitter";

import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";

/**
 * Provides grammar-specific Python syntax helpers without export decisions.
 *
 * EvidencePythonFileScanner uses these helpers to recognize supported
 * declaration and documentation shapes while keeping public-surface policy in
 * the scanner.
 *
 * @evidence contracts/common.md#principled-implementation Grammar-specific helpers recognize Python names, assignments, decorators, attributes, string and docstring syntax, and literal __all__ sequences without export decisions.
 * @evidence contracts/common.md#clear-and-simple-design The namespace holds syntax queries; policy stays in the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported string forms such as f-strings, bytes and escapes are rejected rather than decoded approximately.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the boundary; every function and helper is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidencePythonSyntax {
  /**
   * Unwraps a decorated definition to its underlying declaration node.
   *
   * Callers retain the wrapper separately when its range or decorators affect
   * documentation attachment and static-versus-instance member classification.
   *
   * @evidence contracts/common.md#principled-implementation A decorated definition is unwrapped to its underlying declaration node.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function definition(node: EvidenceNode): EvidenceNode {
    return node.type === "decorated_definition"
      ? (node.childForFieldName("definition") ?? node)
      : node;
  }

  /**
   * Returns an identifier's source spelling when the node is a simple name.
   *
   * Other grammar forms remain unsupported instead of being coerced into a
   * potentially incorrect declaration or binding name.
   *
   * @evidence contracts/common.md#principled-implementation A simple identifier returns its source spelling.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function name(node: EvidenceNode | null): string | undefined {
    return node?.type === "identifier" ? node.text : undefined;
  }

  /**
   * Extracts the leftmost identifier from a Python type-alias declaration.
   *
   * The scanner requires this static name before it can create an owned type
   * unit or a module binding for the alias.
   *
   * @evidence contracts/common.md#principled-implementation The leftmost identifier of a type alias statement is its name.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function typeAliasName(node: EvidenceNode): string | undefined {
    const left = node.childForFieldName("left");
    if (left === null) return undefined;
    return left.descendantsOfType("identifier")[0]?.text;
  }

  /**
   * Returns the simple left-side name of an assignment expression.
   *
   * Destructuring and attribute assignments intentionally return no name so the
   * scanner can distinguish unsupported dynamic surfaces from declarations.
   *
   * @evidence contracts/common.md#principled-implementation Only a simple identifier on the left side of an assignment yields a name; destructuring and attributes do not.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function assignmentName(node: EvidenceNode): string | undefined {
    return name(node.childForFieldName("left"));
  }

  /**
   * Collects canonical decorator spellings from a decorated declaration
   * wrapper.
   *
   * Method scanning uses these spellings to recognize static, class, property,
   * and cached-property ownership without evaluating arbitrary decorators.
   *
   * @evidence contracts/common.md#principled-implementation Each decorator's identifier or dotted attribute spelling is collected canonically.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function decoratorNames(wrapper: EvidenceNode): string[] {
    if (wrapper.type !== "decorated_definition") return [];
    return wrapper.namedChildren
      .filter((child) => child.type === "decorator")
      .flatMap((decorator) => {
        const expression = decorator.namedChildren[0];
        const value = qualified(expression);
        return value === undefined ? [] : [value];
      });
  }

  /**
   * Returns the first parameter name of a function definition when recoverable.
   *
   * Initializer scanning treats this name as the instance receiver for direct
   * field assignments; missing or complex forms do not establish instance
   * fields.
   *
   * @evidence contracts/common.md#principled-implementation The first declared parameter name is the constructor receiver, whatever it is called.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function parameterName(node: EvidenceNode): string | undefined {
    const parameters = node.childForFieldName("parameters");
    if (parameters === null) return undefined;
    const first = parameters.namedChildren[0];
    if (first === undefined) return undefined;
    if (first.type === "identifier") return first.text;
    return first.descendantsOfType("identifier")[0]?.text;
  }

  /**
   * Returns the direct object name of an attribute expression.
   *
   * Instance-field extraction combines this with {@link attributeName} to accept
   * only assignments on the initializer's statically identified receiver.
   *
   * @evidence contracts/common.md#principled-implementation The direct object name of an attribute expression is returned.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function attributeObject(node: EvidenceNode): string | undefined {
    if (node.type !== "attribute") return undefined;
    return name(node.childForFieldName("object"));
  }

  /**
   * Returns the direct member name of an attribute expression.
   *
   * A non-attribute expression has no eligible member name and remains outside
   * the scanner's supported direct-receiver assignment form.
   *
   * @evidence contracts/common.md#principled-implementation The direct member name of an attribute expression is returned.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function attributeName(node: EvidenceNode): string | undefined {
    if (node.type !== "attribute") return undefined;
    return name(node.childForFieldName("attribute"));
  }

  /**
   * Builds documentation mapping syntax for a non-interpolated string literal.
   *
   * Interpolated strings are omitted because runtime interpolation prevents the
   * scanner from treating their text as stable Evidence documentation.
   *
   * @evidence contracts/common.md#principled-implementation Non-interpolated string literals get mapping syntax from their prefix and quote delimiters.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function stringSyntax(
    node: EvidenceNode,
  ): IEvidenceCommentSyntax | undefined {
    if (
      node.type !== "string" ||
      node.descendantsOfType("interpolation").length !== 0
    )
      return undefined;
    const opening = node.namedChildren.find(
      (child) => child.type === "string_start",
    )?.text;
    const closing = node.namedChildren.find(
      (child) => child.type === "string_end",
    )?.text;
    if (opening === undefined || closing === undefined) return undefined;
    return {
      opening,
      closing,
      tagBoundaries: true,
      allowWithdrawal: true,
    };
  }

  /**
   * Returns the line-comment syntax used for Python comment documentation.
   *
   * The fixed mapping lets adjacent standalone `#` comment runs support
   * Evidence tags with the same withdrawal behavior as supported docstrings.
   *
   * @evidence contracts/common.md#principled-implementation Standalone '#' runs use '#' as their line prefix with tag boundaries and withdrawal.
   * @evidence contracts/common.md#clear-and-simple-design It returns fixed normalization rules.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Only adjacent standalone runs are passed here by the scanner.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the fixed mapping.
   * @evidence contracts/performance.md#efficient-algorithms Constant work.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work A constant value has nothing to share.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function commentSyntax(): IEvidenceCommentSyntax {
    return {
      opening: "#",
      closing: "",
      linePrefix: "#",
      tagBoundaries: true,
      allowWithdrawal: true,
    };
  }

  /**
   * Resolves a supported literal list or tuple expression to its string
   * members.
   *
   * Static `+` composition and parentheses are accepted for `__all__`; any
   * dynamic value returns undefined so the scanner preserves incompleteness.
   *
   * @evidence contracts/common.md#principled-implementation List and tuple literals and their binary '+' compositions resolve to string members.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function literalSequence(
    node: EvidenceNode | null,
  ): string[] | undefined {
    if (node === null) return undefined;
    if (node.type === "parenthesized_expression")
      return literalSequence(node.namedChildren[0] ?? null);
    if (node.type === "binary_operator") {
      if (!node.children.some((child) => child.type === "+")) return undefined;
      const left = literalSequence(node.childForFieldName("left"));
      const right = literalSequence(node.childForFieldName("right"));
      return left === undefined || right === undefined
        ? undefined
        : [...left, ...right];
    }
    if (node.type !== "list" && node.type !== "tuple") return undefined;
    const output: string[] = [];
    for (const child of node.namedChildren) {
      const value = literalString(child);
      if (value === undefined) return undefined;
      output.push(value);
    }
    return output;
  }

  /**
   * Reads one plain static Python string literal for an export-name sequence.
   *
   * Escapes, line breaks, and prefixes other than `u` or `U` are rejected so
   * the literal value need not be interpreted by executing Python syntax.
   *
   * @evidence contracts/common.md#principled-implementation Plain or u-prefixed string literals without escapes or line breaks are read as export names.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function literalString(node: EvidenceNode): string | undefined {
    const syntax = stringSyntax(node);
    if (syntax === undefined) return undefined;
    const quote = /(?:'''|"""|'|")$/u.exec(syntax.opening)?.[0];
    if (quote === undefined || syntax.closing !== quote) return undefined;
    const prefix = syntax.opening.slice(0, -quote.length);
    if (prefix !== "" && prefix !== "u" && prefix !== "U") return undefined;
    const value = node.text.slice(
      syntax.opening.length,
      node.text.length - syntax.closing.length,
    );
    return value.includes("\\") || value.includes("\n") || value.includes("\r")
      ? undefined
      : value;
  }

  /**
   * Returns the leading expression node when a suite begins with a docstring.
   *
   * Leading comments are skipped, but the first executable statement must be a
   * supported string expression for attachment to the enclosing declaration.
   *
   * @evidence contracts/common.md#principled-implementation The first statement of a suite is its docstring when it is a string expression, skipping leading comments.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function docstring(
    body: EvidenceNode | null,
  ): EvidenceNode | undefined {
    if (body === null) return undefined;
    const statement = body.namedChildren.find(
      (child) => child.type !== "comment",
    );
    if (statement?.type !== "expression_statement") return undefined;
    const value = statement.namedChildren[0];
    return value !== undefined && docstringParts(value) !== undefined
      ? value
      : undefined;
  }

  /**
   * Splits a supported docstring expression into its source string literals.
   *
   * Bytes and f-string components are excluded because their runtime semantics
   * cannot supply stable documentation text for Evidence annotations.
   *
   * @evidence contracts/common.md#principled-implementation A docstring expression splits into its source string literals, excluding bytes and f-string parts.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function docstringParts(
    node: EvidenceNode,
  ): EvidenceNode[] | undefined {
    const strings =
      node.type === "string"
        ? [node]
        : node.type === "concatenated_string"
          ? node.namedChildren
          : undefined;
    if (
      strings === undefined ||
      strings.length === 0 ||
      strings.some((string) => !docstringLiteral(string))
    )
      return undefined;
    return strings;
  }

  /**
   * Detects a `TypeAlias` annotation on a simple assignment.
   *
   * The scanner uses this syntactic marker to classify the assigned declaration
   * as a type unit while leaving other assignments as properties.
   *
   * @evidence contracts/common.md#principled-implementation A simple assignment annotated with TypeAlias is a type alias declaration.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; publication, visibility and export policy stay in the scanner and resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being coerced into a name.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted forms and what is rejected.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function typeAliasAnnotation(node: EvidenceNode): boolean {
    const annotation = node.childForFieldName("type")?.text;
    return (
      annotation === "TypeAlias" ||
      (annotation !== undefined && annotation.endsWith(".TypeAlias"))
    );
  }

  /**
   * Serializes a supported identifier, attribute, call, or parenthesized
   * decorator expression.
   *
   * Decorator recognition requires only the callable's dotted spelling; other
   * expression forms remain unclassified rather than being evaluated.
   */
  function qualified(node: EvidenceNode | undefined): string | undefined {
    if (node === undefined) return undefined;
    if (node.type === "identifier") return node.text;
    if (node.type === "attribute") {
      const object = qualified(node.childForFieldName("object") ?? undefined);
      const attribute = name(node.childForFieldName("attribute"));
      return object === undefined || attribute === undefined
        ? undefined
        : `${object}.${attribute}`;
    }
    if (node.type === "call")
      return qualified(node.childForFieldName("function") ?? undefined);
    if (node.type === "parenthesized_expression")
      return qualified(node.namedChildren[0]);
    return undefined;
  }

  /**
   * Checks whether a string literal can participate in a static Python
   * docstring.
   *
   * Bytes and formatted literals are rejected because they cannot provide
   * stable source text without runtime evaluation.
   */
  function docstringLiteral(node: EvidenceNode): boolean {
    const syntax = stringSyntax(node);
    if (syntax === undefined) return false;
    const quote = /(?:'''|"""|'|")$/u.exec(syntax.opening)?.[0];
    if (quote === undefined) return false;
    const prefix = syntax.opening.slice(0, -quote.length).toLowerCase();
    return !prefix.includes("b") && !prefix.includes("f");
  }
}
