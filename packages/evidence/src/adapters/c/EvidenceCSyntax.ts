import type { Node as EvidenceNode } from "web-tree-sitter";

import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { EvidenceCDeclarationForm } from "./EvidenceCDeclarationForm";
import type { EvidenceCDeclaratorKind } from "./EvidenceCDeclaratorKind";
import type { IEvidenceCDeclaratorShape } from "./IEvidenceCDeclaratorShape";

/**
 * Provides C grammar helpers for names, declarators, comments, and modifiers.
 *
 * EvidenceCFileScanner uses these syntactic facts to construct declarations and
 * documentation records without assigning public-surface policy to this
 * namespace.
 *
 * @evidence contracts/common.md#principled-implementation Grammar helpers read C identifiers (with universal character names), declarator shapes, tag forms, storage classes, include guards, inert directives and Doxygen comment forms.
 * @evidence contracts/common.md#clear-and-simple-design The namespace holds syntax facts; public-surface policy is the scanner's.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No preprocessing or macro expansion is performed.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains its consumers; every function now has its own comment, as do the private declarator helpers.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceCSyntax {
  /**
   * Returns the decoded name of a C identifier-like node.
   *
   * Universal character names (`\u`, `\U`) are decoded; other nodes yield
   * undefined.
   *
   * @evidence contracts/common.md#principled-implementation Identifier, field and type identifier text is returned with \u and \U universal character names decoded.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function name(node: EvidenceNode | null): string | undefined {
    if (
      node === null ||
      !["identifier", "field_identifier", "type_identifier"].includes(node.type)
    )
      return undefined;
    return node.text
      .replace(/\\u([0-9A-Fa-f]{4})/gu, (_match, hex: string) =>
        String.fromCodePoint(Number.parseInt(hex, 16)),
      )
      .replace(/\\U([0-9A-Fa-f]{8})/gu, (match, hex: string) => {
        const codePoint = Number.parseInt(hex, 16);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
      });
  }

  /**
   * Returns every declarator of a declaration, in source order.
   *
   * @evidence contracts/common.md#principled-implementation A declaration's declarator fields are returned in source order.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function declarators(node: EvidenceNode): EvidenceNode[] {
    return node.childrenForFieldName("declarator");
  }

  /**
   * Reads the name and effective entity kind of one C declarator.
   *
   * The wrapper closest to the name decides the kind, so `int f(int)` is a
   * function and `int (*f)(int)` is an object. Unnamed declarators yield
   * undefined.
   *
   * @evidence contracts/common.md#principled-implementation Walking from the outer declarator inward, the wrapper closest to the name decides the kind: a function declarator makes a function, a pointer or array makes an object.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function declarator(
    node: EvidenceNode,
  ): IEvidenceCDeclaratorShape | undefined {
    let current: EvidenceNode | null = node;
    let nearest: EvidenceCDeclaratorKind = "direct";
    while (current !== null) {
      const value = name(current);
      if (value !== undefined) return { name: value, kind: nearest, node };
      switch (current.type) {
        case "init_declarator":
        case "attributed_declarator":
          current = childDeclarator(current);
          break;
        case "parenthesized_declarator":
          current = declaratorChild(current);
          break;
        case "function_declarator":
          nearest = "function";
          current = childDeclarator(current);
          break;
        case "pointer_declarator":
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
   * Returns the tag form of a struct, union, or enum specifier, or null.
   *
   * @evidence contracts/common.md#principled-implementation Struct, union and enum specifiers map to their tag form.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function tagForm(
    node: EvidenceNode | null,
  ): Extract<EvidenceCDeclarationForm, "struct" | "union" | "enum"> | null {
    if (node?.type === "struct_specifier") return "struct";
    if (node?.type === "union_specifier") return "union";
    if (node?.type === "enum_specifier") return "enum";
    return null;
  }

  /**
   * Reports whether a declaration has the given storage class, such as
   * `static`.
   *
   * @evidence contracts/common.md#principled-implementation A storage class is present when a storage class specifier child has that text.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
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
   * Reports whether a node is a C static assertion.
   *
   * @evidence contracts/common.md#principled-implementation Text beginning with _Static_assert or static_assert followed by '(' is a static assertion.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
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
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function guardedDeclarations(
    node: EvidenceNode,
  ): EvidenceNode[] | undefined {
    if (node.type !== "preproc_ifdef" || !/^#\s*ifndef\b/u.test(node.text))
      return undefined;
    if (node.childForFieldName("alternative") !== null) return undefined;
    const nameNode = node.childForFieldName("name");
    const guard = name(nameNode);
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
   * @evidence contracts/common.md#principled-implementation #undef, #line and #pragma once do not choose declarations in the physical-file model.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
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
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
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
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; declaration policy and reconciliation happen in the scanner and adapter.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It reads grammar structure only; no preprocessor, compiler or include is consulted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states what the helper returns and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected declarator or node children.
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
   * Returns the normalization rules for a C comment node.
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
   * Finds the first child that is a name or another declarator.
   *
   * Parenthesized and attributed declarators have no `declarator` field, so
   * this fallback keeps the walk moving inward.
   */
  function declaratorChild(node: EvidenceNode): EvidenceNode | null {
    return (
      node.namedChildren.find(
        (child) =>
          name(child) !== undefined ||
          child.type.endsWith("_declarator") ||
          child.type === "parenthesized_declarator",
      ) ?? null
    );
  }
}
