/**
 * Carries the structural ownership needed while scanning one Python class body.
 *
 * Nested functions and properties inherit these segments to keep their unit IDs
 * stable, while exported addresses can still distinguish a class member from an
 * instance member through the suffix selected by the scanner.
 *
 * @evidence contracts/common.md#principled-implementation Class ownership segments and the address suffix let nested members keep stable IDs while distinguishing class and instance members.
 * @evidence contracts/common.md#clear-and-simple-design The scanner threads the context through class bodies.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePythonClassContext {
  /**
   * Full semantic path used to construct child unit identities.
   *
   * Every element names one enclosing declaration, in source nesting order.
   */
  identity: string[];

  /**
   * Public-address segments preceding a member declared in this class.
   *
   * The scanner appends a member's own segments without using this path as its
   * semantic identity, because aliases may publish that identity elsewhere.
   */
  suffix: string[];

  /**
   * Module-level root binding under which this class is declared.
   *
   * Export resolution associates the root with a local binding before it emits
   * public file-qualified addresses.
   */
  root: string;

  /**
   * Unit ID of the enclosing class declaration.
   *
   * Members use this parent so ancestor withdrawal directives hide the complete
   * class surface during documentation materialization.
   */
  parentId: string;
}
