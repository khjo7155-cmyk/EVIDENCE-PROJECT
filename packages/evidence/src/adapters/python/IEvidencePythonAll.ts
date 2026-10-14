import type { EvidencePythonAllState } from "./EvidencePythonAllState";

/**
 * Records the statically known portion of a module's `__all__` declaration.
 *
 * EvidencePythonExportResolver uses this state to choose between explicit
 * exports and Python's underscore convention. Dynamic mutation stays incomplete
 * because executing module code would make coverage depend on runtime state.
 *
 * @evidence contracts/common.md#principled-implementation The static portion of __all__ and its state decide between explicit exports and the underscore convention.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the export resolver consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePythonAll {
  /**
   * Whether `__all__` is absent, fully static, or changed dynamically.
   *
   * A dynamic state suppresses inference from arbitrary runtime mutations while
   * allowing the scanner to retain the failure diagnostic.
   */
  state: EvidencePythonAllState;

  /**
   * Export names recovered from supported literal assignment and concatenation.
   *
   * The array preserves declaration order; the resolver later converts it to a
   * set when it combines explicit exports with imported bindings.
   */
  names: string[];
}
