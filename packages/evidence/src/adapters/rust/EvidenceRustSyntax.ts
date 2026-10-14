import type { Node as EvidenceNode } from "web-tree-sitter";

import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { EvidenceRustVisibility } from "./EvidenceRustVisibility";

/**
 * Provides grammar-level Rust extraction helpers for names, paths, attributes,
 * and documentation.
 *
 * EvidenceRustFileScanner uses these functions to retain syntax facts.
 * EvidenceRustModuleResolver later decides crate reachability and public
 * ownership from the scanner records.
 *
 * @evidence contracts/common.md#principled-implementation Grammar helpers read Rust names, visibility, paths, type parameters, outer attributes and documentation forms, and comment and string delimiters.
 * @evidence contracts/common.md#clear-and-simple-design The namespace holds syntax facts; reachability and ownership are the resolver's.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only static attribute strings and supported paths are read.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the boundary; every function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceRustSyntax {
  /**
   * Reads a supported Rust identifier spelling from a grammar node.
   *
   * Scanners use it for declaration and member names; unsupported syntax
   * returns undefined so extraction can preserve uncertainty instead of
   * inventing a name.
   *
   * @evidence contracts/common.md#principled-implementation Supported identifier nodes return their spelling.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function name(node: EvidenceNode | null): string | undefined {
    return node !== null &&
      (node.type === "identifier" ||
        node.type === "field_identifier" ||
        node.type === "type_identifier")
      ? node.text
      : undefined;
  }

  /**
   * Classifies the visibility modifier written on a Rust declaration.
   *
   * Bare `pub` is externally public, scoped forms are restricted, and omitted
   * modifiers are private. Module resolution evaluates the resulting boundary.
   *
   * @evidence contracts/common.md#principled-implementation A visibility modifier is classified as unrestricted pub, a restricted pub(...), or private when absent.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function visibility(node: EvidenceNode): EvidenceRustVisibility {
    const modifier = node.namedChildren.find(
      (child) => child.type === "visibility_modifier",
    );
    if (modifier === undefined) return "private";
    return modifier.text.trim() === "pub" ? "public" : "restricted";
  }

  /**
   * Reads a statically supported Rust path as ordered segments.
   *
   * Generic wrappers are unwrapped while `crate`, `self`, and `super` remain
   * literal segments for EvidenceRustModuleResolver to interpret in its current
   * module.
   *
   * @evidence contracts/common.md#principled-implementation Scoped paths are flattened into ordered segments when every segment is static.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function path(node: EvidenceNode | null): string[] | undefined {
    if (node === null) return undefined;
    const direct = name(node);
    if (direct !== undefined) return [direct];
    if (node.type === "crate" || node.type === "self" || node.type === "super")
      return [node.text];
    if (
      node.type === "scoped_identifier" ||
      node.type === "scoped_type_identifier"
    ) {
      const prefix = path(node.childForFieldName("path"));
      const suffix = name(node.childForFieldName("name"));
      return prefix === undefined || suffix === undefined
        ? undefined
        : [...prefix, suffix];
    }
    if (node.type === "generic_type")
      return path(node.childForFieldName("type"));
    return undefined;
  }

  /**
   * Collects declared type-parameter names from a Rust item.
   *
   * Impl ownership resolution uses these names to distinguish local generic
   * parameters from paths that must resolve to selected nominal declarations.
   *
   * @evidence contracts/common.md#principled-implementation Declared type parameter names are collected from an item's parameter list.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function typeParameters(node: EvidenceNode): string[] {
    const parameters = node.childForFieldName("type_parameters");
    if (parameters === null) return [];
    return parameters
      .descendantsOfType("type_parameter")
      .flatMap((parameter) => {
        const declared = name(parameter.childForFieldName("name"));
        return declared === undefined ? [] : [declared];
      });
  }

  /**
   * Collects outer attributes and outer documentation immediately preceding an
   * item.
   *
   * Ordinary comments are skipped because Rust treats them as whitespace. The
   * returned source order lets scanners attach documentation and inspect
   * attributes.
   *
   * @evidence contracts/common.md#principled-implementation Outer attributes and outer documentation directly preceding an item are collected, skipping ordinary comments.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function attributes(node: EvidenceNode): EvidenceNode[] {
    const output: EvidenceNode[] = [];
    let previous = node.previousNamedSibling;
    while (
      previous !== null &&
      (previous.type === "attribute_item" ||
        isOuterDocumentation(previous) ||
        ordinaryComment(previous))
    ) {
      if (!ordinaryComment(previous)) output.push(previous);
      previous = previous.previousNamedSibling;
    }
    return output.reverse();
  }

  /**
   * States whether a comment is ordinary Rust whitespace rather than
   * documentation.
   *
   * Attribute collection skips these comments without treating them as evidence
   * carriers or allowing them to interrupt a valid outer-attribute sequence.
   *
   * @evidence contracts/common.md#principled-implementation A comment that is neither outer nor inner documentation is ordinary whitespace.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function ordinaryComment(node: EvidenceNode): boolean {
    return (
      (node.type === "line_comment" || node.type === "block_comment") &&
      node.childForFieldName("outer") === null &&
      node.childForFieldName("inner") === null
    );
  }

  /**
   * Reads the qualified name from a Rust attribute or its wrapper item.
   *
   * Scanner attribute policy uses the name to recognize documentation and
   * report expansion risks; unsupported attribute shapes return undefined.
   *
   * @evidence contracts/common.md#principled-implementation An attribute's qualified name is read from it or its wrapper item.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function attributeName(node: EvidenceNode): string | undefined {
    const attribute =
      node.type === "attribute_item" || node.type === "inner_attribute_item"
        ? (node.namedChildren.find((child) => child.type === "attribute") ??
          null)
        : node.type === "attribute"
          ? node
          : null;
    if (attribute === null) return undefined;
    const head = attribute.namedChildren[0] ?? null;
    const segments = path(head);
    return segments === undefined ? undefined : segments.join("::");
  }

  /**
   * Returns the value expression of a Rust attribute or its wrapper item.
   *
   * Documentation-attribute handling validates this node as a supported static
   * string before it creates a carrier; absent values return null.
   *
   * @evidence contracts/common.md#principled-implementation An attribute's value expression is returned from it or its wrapper item.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function attributeValue(node: EvidenceNode): EvidenceNode | null {
    const attribute =
      node.type === "attribute_item" || node.type === "inner_attribute_item"
        ? (node.namedChildren.find((child) => child.type === "attribute") ??
          null)
        : node.type === "attribute"
          ? node
          : null;
    return attribute === null
      ? null
      : (attribute.childForFieldName("value") ?? null);
  }

  /**
   * States whether a Rust comment uses the outer documentation form.
   *
   * The scanner may attach only these comment carriers to following item sites.
   *
   * @evidence contracts/common.md#principled-implementation A line or block comment is outer documentation when the grammar exposes its outer doc marker (/// or a /** block).
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function outerDocumentation(node: EvidenceNode): boolean {
    return isOuterDocumentation(node);
  }

  /**
   * States whether a Rust comment uses the inner documentation form.
   *
   * Inner carriers document their containing module instead of the following
   * item.
   *
   * @evidence contracts/common.md#principled-implementation A line or block comment is inner documentation when the grammar exposes its inner doc marker (//! or a /*! block).
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function innerDocumentation(node: EvidenceNode): boolean {
    return (
      (node.type === "line_comment" || node.type === "block_comment") &&
      node.childForFieldName("inner") !== null
    );
  }

  /**
   * Supplies delimiter rules for a Rust comment carrier.
   *
   * EvidenceRustFileScanner uses the returned syntax to map text and preserve
   * tag coordinates for line, block, ordinary, and documentation comment
   * forms.
   *
   * @evidence contracts/common.md#principled-implementation Each documentation comment form gets its delimiters and line prefix for normalization.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function comment(node: EvidenceNode): IEvidenceCommentSyntax {
    const outer = isOuterDocumentation(node);
    const inner = innerDocumentation(node);
    const opening =
      node.type === "line_comment"
        ? outer
          ? "///"
          : inner
            ? "//!"
            : "//"
        : outer
          ? "/**"
          : inner
            ? "/*!"
            : "/*";
    return opening.startsWith("//")
      ? {
          opening,
          closing: "",
          linePrefix: opening,
          tagBoundaries: true,
          allowWithdrawal: true,
        }
      : {
          opening,
          closing: "*/",
          linePrefix: "*",
          tagBoundaries: true,
          allowWithdrawal: true,
        };
  }

  /**
   * Supplies delimiter rules for a supported Rust string literal.
   *
   * Annotation scanning uses this result for ordinary and raw strings, whose
   * contents can report unsupported tags but cannot authorize withdrawals.
   *
   * @evidence contracts/common.md#principled-implementation Supported string and raw string literals get delimiter rules for #[doc] mapping.
   * @evidence contracts/common.md#clear-and-simple-design The helper is a pure syntax query; crate reachability and ownership are decided by the module resolver.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported grammar forms return nothing rather than being guessed.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the helper reads and when it returns nothing.
   * @evidence contracts/performance.md#efficient-algorithms Constant or proportional to the inspected syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each node is inspected once by the scanner.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function returns copied values and keeps no reference to the borrowed node.
   */
  export function string(
    node: EvidenceNode,
  ): IEvidenceCommentSyntax | undefined {
    if (node.type === "string_literal")
      return {
        opening: '"',
        closing: '"',
        tagBoundaries: true,
        allowWithdrawal: false,
      };
    if (node.type === "raw_string_literal") {
      const match = /^(?:br|r)(#*)"/u.exec(node.text);
      if (match === null) return undefined;
      const hashes = match[1] ?? "";
      return {
        opening: node.text.slice(0, match[0].length),
        closing: `"${hashes}`,
        tagBoundaries: true,
        allowWithdrawal: false,
      };
    }
    return undefined;
  }

  function isOuterDocumentation(node: EvidenceNode): boolean {
    return (
      (node.type === "line_comment" || node.type === "block_comment") &&
      node.childForFieldName("outer") !== null
    );
  }
}
