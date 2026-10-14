import type { Node as EvidenceNode } from "web-tree-sitter";
import type { IEvidenceLuaDeclaration } from "./IEvidenceLuaDeclaration";

/**
 * Represents a statically understood Lua value during file scanning.
 *
 * EvidenceLuaFileScanner keeps these records for bindings, table fields,
 * aliases, and final module returns so it can construct public declarations
 * without evaluating Lua; they are internal scanner state rather than
 * serialized output.
 *
 * @evidence contracts/common.md#principled-implementation A statically understood value tracks bindings, table fields, aliases and the module return during scanning.
 * @evidence contracts/common.md#clear-and-simple-design It is scanner-internal state and never serialized.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLuaValue {
  /**
   * Classifies the statically supported value without executing Lua.
   *
   * The scanner traverses `table` fields, emits `function` and `literal` values
   * as declarations, and omits `nil` values from the public surface.
   */
  kind: "table" | "function" | "literal" | "nil";

  /**
   * Points to the source node that establishes this value's declaration site.
   *
   * EvidenceLuaFileScanner derives a stable declaration ID and diagnostic
   * location from this node, including a copied site for scalar alias
   * assignments.
   */
  node: EvidenceNode;

  /**
   * Maps statically named table fields to their understood values.
   *
   * Only `table` values populate this map; scalar, callable, and nil values use
   * an empty map so table traversal has one uniform representation.
   */
  fields: Map<string, IEvidenceLuaValue>;

  /**
   * Stores the declaration first published for this value's public path.
   *
   * Omission means the value is not yet public. Once set, aliases reuse this
   * declaration to preserve one semantic identity across multiple addresses.
   */
  declaration?: IEvidenceLuaDeclaration;
}
