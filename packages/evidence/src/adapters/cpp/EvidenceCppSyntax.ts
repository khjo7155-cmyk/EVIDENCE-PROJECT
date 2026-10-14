import type { Node as EvidenceNode } from "web-tree-sitter";

import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { EvidenceCppAccess } from "./EvidenceCppAccess";
import type { EvidenceCppDeclarationForm } from "./EvidenceCppDeclarationForm";
import type { EvidenceCppDeclaratorKind } from "./EvidenceCppDeclaratorKind";
import type { IEvidenceCppDeclaratorShape } from "./IEvidenceCppDeclaratorShape";
import type { IEvidenceCppQualifiedName } from "./IEvidenceCppQualifiedName";

/**
 * Provides C++ grammar helpers for names, declarators, comments, and modifiers.
 *
 * EvidenceCppFileScanner uses these helpers to preserve C++-specific spelling
 * and scope distinctions while it decides which supported declarations form
 * graph units.
 *
 * @evidence contracts/common.md#principled-implementation Grammar helpers read C++ names (including destructors, operators and conversions), qualified names with template arity and specialization, declarator shapes, record forms, template parts, storage, constness, access, include guards and Doxygen forms.
 * @evidence contracts/common.md#clear-and-simple-design The namespace holds syntax facts; ownership and publication are decided by the scanner and adapter.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No preprocessing, lookup or instantiation is performed.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains its consumers; every function now has its own comment, as do the private helpers.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceCppSyntax {
  /**
   * Returns the literal segment a C++ name node spells.
   *
   * Identifiers decode universal character names, destructors yield `~Name`,
   * and operators or conversions yield `operator ...` segments. Other nodes
   * yield undefined.
   *
   * @evidence contracts/common.md#principled-implementation Identifiers decode universal character names, destructor names become '~Name', and operator and conversion names become literal 'operator ...' segments.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function name(node: EvidenceNode | null): string | undefined {
    if (node === null) return undefined;
    if (
      [
        "identifier",
        "field_identifier",
        "type_identifier",
        "namespace_identifier",
      ].includes(node.type)
    )
      return decode(node.text);
    if (node.type === "destructor_name") {
      const value = name(node.namedChildren[0] ?? null);
      return value === undefined ? undefined : `~${value}`;
    }
    if (node.type === "operator_name") return operator(node.text);
    if (node.type === "operator_cast") {
      const type = node.childForFieldName("type");
      return type === null ? undefined : `operator ${normalize(type.text)}`;
    }
    return undefined;
  }

  /**
   * Returns the segments of a possibly qualified or templated C++ name.
   *
   * Template names carry their argument count (`Box`1`); arguments other than
   * plain template parameters mark the name as a specialization.
   *
   * @evidence contracts/common.md#principled-implementation Qualified and nested-namespace names flatten into segments, template names gain an arity suffix such as Box`1, and non-parameter template arguments mark a specialization.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function qualifiedName(
    node: EvidenceNode | null,
  ): IEvidenceCppQualifiedName | undefined {
    if (node === null) return undefined;
    if (node.type === "qualified_identifier") {
      const scope = qualifiedName(node.childForFieldName("scope"));
      const member = qualifiedName(node.childForFieldName("name"));
      if (member === undefined) return undefined;
      return {
        segments: [...(scope?.segments ?? []), ...member.segments],
        specialized: (scope?.specialized ?? false) || member.specialized,
      };
    }
    if (node.type === "nested_namespace_specifier") {
      const parts = node.namedChildren.flatMap((child) => {
        const value = qualifiedName(child);
        return value === undefined ? [] : [value];
      });
      return {
        segments: parts.flatMap((part) => part.segments),
        specialized: parts.some((part) => part.specialized),
      };
    }
    if (
      node.type === "template_type" ||
      node.type === "template_function" ||
      node.type === "template_method" ||
      node.type === "dependent_name"
    ) {
      const wrapped =
        node.type === "dependent_name" ? node.namedChildren[0] : node;
      if (wrapped === undefined) return undefined;
      if (wrapped.type === "dependent_name") return undefined;
      const value = name(wrapped.childForFieldName("name"));
      const argumentsNode = wrapped.childForFieldName("arguments");
      if (value === undefined || argumentsNode === null) return undefined;
      const argumentsList = argumentsNode.namedChildren.filter(
        (child) => child.type !== "comment",
      );
      return {
        segments: [`${value}\`${argumentsList.length}`],
        specialized:
          argumentsList.length === 0 ||
          argumentsList.some((argument) => !templateParameter(argument)),
      };
    }
    const value = name(node);
    return value === undefined
      ? undefined
      : { segments: [value], specialized: false };
  }

  /**
   * Returns every declarator of a declaration, in source order.
   *
   * @evidence contracts/common.md#principled-implementation A declaration's declarator fields are returned in source order.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function declarators(node: EvidenceNode): EvidenceNode[] {
    return node.childrenForFieldName("declarator");
  }

  /**
   * Reads the qualified path and effective entity kind of one C++ declarator.
   *
   * The wrapper closest to the name decides the kind, so `int f()` is a
   * function and `int (*f)()` is an object; conversion operators are
   * functions.
   *
   * @evidence contracts/common.md#principled-implementation Walking inward, the wrapper closest to the name decides the kind (function, or object for pointers, references and arrays), and conversion operators are always functions.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function declarator(
    node: EvidenceNode,
  ): IEvidenceCppDeclaratorShape | undefined {
    let current: EvidenceNode | null = node;
    let nearest: EvidenceCppDeclaratorKind = "direct";
    while (current !== null) {
      if (current.type === "operator_cast") {
        const path = qualifiedName(current);
        return path === undefined
          ? undefined
          : {
              path: path.segments,
              kind: "function",
              node,
              specialized: path.specialized,
            };
      }
      const path = qualifiedName(current);
      if (path !== undefined)
        return {
          path: path.segments,
          kind: nearest,
          node,
          specialized: path.specialized,
        };
      switch (current.type) {
        case "init_declarator":
        case "attributed_declarator":
          current = childDeclarator(current);
          break;
        case "parenthesized_declarator":
          current = declaratorChild(current);
          break;
        case "function_declarator":
        case "abstract_function_declarator":
          nearest = "function";
          current = childDeclarator(current);
          break;
        case "pointer_declarator":
        case "pointer_type_declarator":
        case "reference_declarator":
        case "reference_type_declarator":
        case "array_declarator":
          nearest = "object";
          current = childDeclarator(current);
          break;
        default:
          current = childDeclarator(current);
      }
    }
    return undefined;
  }

  /**
   * Returns the record form of a class, struct, union, or enum specifier, or
   * null.
   *
   * @evidence contracts/common.md#principled-implementation Class, struct, union and enum specifiers map to their record form.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function recordForm(
    node: EvidenceNode | null,
  ): Extract<
    EvidenceCppDeclarationForm,
    "class" | "struct" | "union" | "enum"
  > | null {
    if (node?.type === "class_specifier") return "class";
    if (node?.type === "struct_specifier") return "struct";
    if (node?.type === "union_specifier") return "union";
    if (node?.type === "enum_specifier") return "enum";
    return null;
  }

  /**
   * Returns how many template parameters a template declaration introduces.
   *
   * @evidence contracts/common.md#principled-implementation Arity is the number of non-comment template parameters.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function templateArity(node: EvidenceNode): number {
    const parameters = node.childForFieldName("parameters");
    return parameters === null
      ? 0
      : parameters.namedChildren.filter((child) => child.type !== "comment")
          .length;
  }

  /**
   * Returns the declaration a template wraps, skipping parameters and
   * constraints.
   *
   * @evidence contracts/common.md#principled-implementation The templated declaration is the first child that is not the parameter list, a requires clause or a comment.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function templateBody(node: EvidenceNode): EvidenceNode | undefined {
    return node.namedChildren.find(
      (child) =>
        child.type !== "template_parameter_list" &&
        child.type !== "requires_clause" &&
        child.type !== "comment",
    );
  }

  /**
   * Reports whether a declaration has the given storage class, such as
   * `static`.
   *
   * @evidence contracts/common.md#principled-implementation A storage class is present when a storage class specifier child has that text.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function storage(node: EvidenceNode, value: string): boolean {
    return node.namedChildren.some(
      (child) =>
        child.type === "storage_class_specifier" && child.text === value,
    );
  }

  /**
   * Reports whether a namespace-scope object has internal linkage through
   * const.
   *
   * `constexpr` or a top-level `const` without `extern` or `inline` qualifies;
   * for pointer declarators the pointer's own `const` decides.
   *
   * @evidence contracts/common.md#principled-implementation Following C++ internal linkage rules, constexpr or a const top-level object without extern or inline is const; pointers decide by their own qualifier.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function topLevelConstObject(
    node: EvidenceNode,
    declarator: EvidenceNode,
  ): boolean {
    const constantExpression = node.namedChildren.some(
      (child) => child.text === "constexpr",
    );
    const external = ["extern", "inline"].some((value) =>
      node.namedChildren.some((child) => child.text === value),
    );
    if (external) return false;
    if (constantExpression) return true;

    const baseConstant = node.namedChildren.some(
      (child) => child.type === "type_qualifier" && child.text === "const",
    );
    const wrappers: EvidenceNode[] = [];
    let current: EvidenceNode | null = declarator;
    while (current !== null) {
      if (
        [
          "pointer_declarator",
          "pointer_type_declarator",
          "reference_declarator",
          "reference_type_declarator",
          "array_declarator",
          "function_declarator",
          "abstract_function_declarator",
        ].includes(current.type)
      )
        wrappers.push(current);
      current = childDeclarator(current);
    }
    for (let index = wrappers.length - 1; index >= 0; --index) {
      const wrapper = wrappers[index];
      if (wrapper === undefined) continue;
      if (wrapper.type === "array_declarator") continue;
      if (
        wrapper.type === "pointer_declarator" ||
        wrapper.type === "pointer_type_declarator"
      )
        return wrapper.namedChildren.some(
          (child) => child.type === "type_qualifier" && child.text === "const",
        );
      return false;
    }
    return baseConstant;
  }

  /**
   * Returns the access a specifier such as `public:` introduces, if any.
   *
   * @evidence contracts/common.md#principled-implementation An access specifier node is read as public, protected or private.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function access(node: EvidenceNode): EvidenceCppAccess | undefined {
    const value = node.text.replace(/\s*:\s*$/u, "").trim();
    return value === "public" || value === "protected" || value === "private"
      ? value
      : undefined;
  }

  /**
   * Reports whether a node is a static assertion.
   *
   * @evidence contracts/common.md#principled-implementation Text beginning with _Static_assert or static_assert followed by '(' is a static assertion.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function isStaticAssertion(node: EvidenceNode): boolean {
    return /^(?:_Static_assert|static_assert)\s*\(/u.test(node.text);
  }

  /**
   * Returns the declarations inside a conventional include guard.
   *
   * Only `#ifndef NAME` immediately followed by `#define NAME` and no `#else`
   * qualifies; any other conditional yields undefined.
   *
   * @evidence contracts/common.md#principled-implementation An #ifndef NAME whose body begins with #define NAME and has no alternative is a conventional include guard, and its remaining body is returned.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function guardedDeclarations(
    node: EvidenceNode,
  ): EvidenceNode[] | undefined {
    if (node.type !== "preproc_ifdef" || !/^#\s*ifndef\b/u.test(node.text))
      return undefined;
    if (node.childForFieldName("alternative") !== null) return undefined;
    const guard = name(node.childForFieldName("name"));
    if (guard === undefined) return undefined;
    const body = node.namedChildren.slice(1);
    const definition = body[0];
    if (
      definition?.type !== "preproc_def" ||
      name(definition.childForFieldName("name")) !== guard
    )
      return undefined;
    return body.slice(1);
  }

  /**
   * Reports whether a directive cannot change the declared surface.
   *
   * Only `#undef`, `#line`, and `#pragma once` qualify.
   *
   * @evidence contracts/common.md#principled-implementation #undef, #line and #pragma once do not choose declarations.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function isInertDirective(node: EvidenceNode): boolean {
    if (node.type !== "preproc_call") return false;
    const directive = node.childForFieldName("directive")?.text;
    const argumentNode = node.childForFieldName("argument");
    const argument =
      argumentNode === null ? undefined : argumentNode.text.trim();
    return (
      directive === "#undef" ||
      directive === "#line" ||
      (directive === "#pragma" && argument === "once")
    );
  }

  /**
   * Reports whether a comment uses a leading Doxygen form.
   *
   * @evidence contracts/common.md#principled-implementation Comments starting with /**, /*!, /// or //! are leading Doxygen.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function isDoxygen(node: EvidenceNode): boolean {
    return (
      node.type === "comment" &&
      /^(?:\/\*\*|\/\*!|\/\/\/|\/\/!)/u.test(node.text)
    );
  }

  /**
   * Reports whether a comment uses a trailing Doxygen form such as `///<`.
   *
   * @evidence contracts/common.md#principled-implementation Comments starting with /**<, /*!<, ///< or //!< are trailing Doxygen.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; ownership, visibility and family reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessing, name lookup or template instantiation is performed.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function isTrailingDoxygen(node: EvidenceNode): boolean {
    return (
      node.type === "comment" &&
      /^(?:\/\*\*<|\/\*!<|\/\/\/<|\/\/!<)/u.test(node.text)
    );
  }

  /**
   * Returns the normalization rules for a C++ comment node.
   *
   * Doxygen forms (`///`, `//!`, `/**`, `/*!` and their trailing `<` variants)
   * may carry withdrawal tags; ordinary comments may not.
   *
   * @evidence contracts/common.md#principled-implementation The longest matching Doxygen or ordinary opening sets delimiters and prefix, with withdrawal allowed only for Doxygen forms.
   * @evidence contracts/common.md#clear-and-simple-design It returns normalization rules only.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Ordinary comments are normalized without withdrawal so their tags are reported.
   * @evidence contracts/common.md#meaningful-documentation The new comment states the forms.
   * @evidence contracts/performance.md#efficient-algorithms Constant work over a fixed list of openings.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work A constant mapping has nothing to share.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function comment(node: EvidenceNode): IEvidenceCommentSyntax {
    for (const opening of ["///<", "//!<", "///", "//!", "//"])
      if (node.text.startsWith(opening))
        return {
          opening,
          closing: "",
          linePrefix: opening,
          tagBoundaries: true,
          allowWithdrawal: opening !== "//",
        };
    for (const opening of ["/**<", "/*!<", "/**", "/*!", "/*"])
      if (node.text.startsWith(opening))
        return {
          opening,
          closing: "*/",
          linePrefix: "*",
          tagBoundaries: true,
          allowWithdrawal: opening !== "/*",
        };
    return {
      opening: "/*",
      closing: "*/",
      tagBoundaries: true,
      allowWithdrawal: false,
    };
  }

  /** Returns the next inner declarator through the field or a declarator child. */
  function childDeclarator(node: EvidenceNode): EvidenceNode | null {
    return node.childForFieldName("declarator") ?? declaratorChild(node);
  }

  /**
   * Finds the first child that is a name, another declarator, or a conversion.
   *
   * Parenthesized and attributed declarators have no `declarator` field, so
   * this fallback keeps the walk moving inward.
   */
  function declaratorChild(node: EvidenceNode): EvidenceNode | null {
    return (
      node.namedChildren.find(
        (child) =>
          qualifiedName(child) !== undefined ||
          child.type.endsWith("_declarator") ||
          child.type === "parenthesized_declarator" ||
          child.type === "operator_cast",
      ) ?? null
    );
  }

  /**
   * Reports whether a template argument is a plain template parameter.
   *
   * Identifiers, single-identifier type descriptors and their pack expansions
   * qualify; anything else makes the name a specialization.
   */
  function templateParameter(node: EvidenceNode): boolean {
    if (node.type === "parameter_pack_expansion") {
      const pattern = node.childForFieldName("pattern");
      return pattern !== null && templateParameter(pattern);
    }
    if (
      ["identifier", "field_identifier", "type_identifier"].includes(node.type)
    )
      return true;
    if (node.type !== "type_descriptor" || node.namedChildren.length !== 1)
      return false;
    const child = node.namedChildren[0];
    return (
      child !== undefined &&
      ["identifier", "type_identifier"].includes(child.type)
    );
  }

  /** Normalizes an operator spelling to the `operator <token>` segment. */
  function operator(input: string): string {
    return `operator ${input.replace(/^operator\s*/u, "").trim()}`;
  }

  /** Collapses whitespace runs so formatting cannot change a segment. */
  function normalize(input: string): string {
    return input.replace(/\s+/gu, " ").trim();
  }

  /** Decodes `\u` and `\U` universal character names in identifiers. */
  function decode(input: string): string {
    return input
      .replace(/\\u([0-9A-Fa-f]{4})/gu, (_match, hex: string) =>
        String.fromCodePoint(Number.parseInt(hex, 16)),
      )
      .replace(/\\U([0-9A-Fa-f]{8})/gu, (match, hex: string) => {
        const codePoint = Number.parseInt(hex, 16);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
      });
  }
}
