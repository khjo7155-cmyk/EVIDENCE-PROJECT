import type { Node as EvidenceNode } from "web-tree-sitter";

import type { EvidenceCDeclaratorKind } from "./EvidenceCDeclaratorKind";

/**
 * Represents the static information recoverable from one C declarator subtree.
 *
 * C declarations can wrap names in pointer, array, parenthesized, and function
 * declarators. The scanner separates the readable identifier and effective
 * entity kind from the original node so callers can classify it without trying
 * to evaluate C types or macros.
 *
 * @evidence contracts/common.md#principled-implementation A declarator shape keeps the readable name and effective kind (direct, function, object) separate from the original node.
 * @evidence contracts/common.md#clear-and-simple-design Declarator classification produces it for the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCDeclaratorShape {
  /**
   * Declared identifier read from the effective direct declarator.
   *
   * The scanner combines it with its enclosing context to create a declaration
   * identity.
   */
  name: string;

  /**
   * Whether the effective declarator denotes a direct, function, or object
   * entity.
   *
   * The scanner routes the shape to callable or object extraction with this
   * classification.
   */
  kind: EvidenceCDeclaratorKind;

  /**
   * Original declarator subtree used to derive source sites and diagnostics.
   *
   * Retaining the node keeps physical locations tied to the declarator that
   * supplied the name.
   */
  node: EvidenceNode;
}
