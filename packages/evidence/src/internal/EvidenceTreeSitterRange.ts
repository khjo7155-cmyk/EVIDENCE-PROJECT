import type { Node } from "web-tree-sitter";

import type { IEvidenceSourceRange } from "../structures/IEvidenceSourceRange";

/**
 * Converts web-tree-sitter UTF-16, zero-based coordinates into Evidence source
 * ranges.
 *
 * Adapters use this boundary to preserve parser offsets while exposing
 * Evidence's one-based line and column positions for diagnostics, hosts, and
 * unit sites.
 *
 * @evidence contracts/common.md#principled-implementation Tree-sitter reports zero-based rows and columns with UTF-16 offsets; one converter keeps every adapter on Evidence's one-based convention.
 * @evidence contracts/common.md#clear-and-simple-design A single namespace owns the coordinate conversion used by all adapters.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No adapter adjusts coordinates on its own.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment states both conventions.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceTreeSitterRange {
  /**
   * Returns the node's half-open range in Evidence coordinate conventions.
   *
   * Offsets remain the parser's UTF-16 string indices, while rows and columns
   * are incremented to the one-based positions expected by Evidence consumers.
   *
   * @evidence contracts/common.md#principled-implementation Offsets are copied unchanged and rows and columns are incremented by one, matching the half-open IEvidenceSourceRange contract.
   * @evidence contracts/common.md#clear-and-simple-design The function only converts; it copies values so no node reference escapes the parse session.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No position is clamped or adjusted to hide parser output.
   * @evidence contracts/common.md#meaningful-documentation The comment explains which values change and which stay as parser indices.
   * @evidence contracts/performance.md#efficient-algorithms Constant work: six field reads and one small object.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work A constant-time conversion has no work worth sharing.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The returned range copies primitive values, so it retains no Tree-sitter node after the session releases it.
   */
  export function from(node: Node): IEvidenceSourceRange {
    return {
      start: {
        offset: node.startIndex,
        line: node.startPosition.row + 1,
        column: node.startPosition.column + 1,
      },
      end: {
        offset: node.endIndex,
        line: node.endPosition.row + 1,
        column: node.endPosition.column + 1,
      },
    };
  }
}
