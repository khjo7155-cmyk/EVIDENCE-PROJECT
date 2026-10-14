import type { Node as EvidenceNode } from "web-tree-sitter";

import type { EvidenceCppDeclaratorKind } from "./EvidenceCppDeclaratorKind";

/**
 * Describes the readable name and outer entity kind of one C++ declarator.
 *
 * EvidenceCppSyntax derives this transient tree-sitter-backed shape while
 * unwrapping a declarator. EvidenceCppFileScanner consumes it to classify
 * callable and object declarations, construct their identities, and reject
 * specializations that cannot use the adapter's common addressing model.
 *
 * @evidence contracts/common.md#principled-implementation A declarator shape keeps the qualified path, effective kind and specialization flag of one declarator.
 * @evidence contracts/common.md#clear-and-simple-design Declarator classification produces it for the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCppDeclaratorShape {
  /**
   * Qualified declarator segments as the grammar exposes them.
   *
   * EvidenceCppFileScanner combines this path with the enclosing scope when
   * needed, then uses the final segment for the declaration name and the
   * preceding segments to identify its semantic parent.
   */
  path: string[];

  /**
   * Outermost declaration category inferred while unwrapping the declarator.
   *
   * The scanner uses this category to route the shape to callable or object
   * extraction instead of inferring that distinction from the name alone.
   */
  kind: EvidenceCppDeclaratorKind;

  /**
   * Original declarator node retained for source-site extraction.
   *
   * EvidenceCppFileScanner passes this node to declaration creation so the
   * physical site follows the declarator even when an enclosing syntax node
   * supplied the readable path.
   */
  node: EvidenceNode;

  /**
   * Whether the readable path denotes a specialized template entity.
   *
   * Specialized declarations are reported as unsupported because they cannot
   * share the primary template's common public accessor.
   */
  specialized: boolean;
}
