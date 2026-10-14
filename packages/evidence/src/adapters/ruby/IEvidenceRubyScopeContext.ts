import type { EvidenceRubyContainerKind } from "./EvidenceRubyContainerKind";
import type { EvidenceRubyMethodSide } from "./EvidenceRubyMethodSide";
import type { EvidenceRubyScopeKind } from "./EvidenceRubyScopeKind";
import type { EvidenceRubyVisibility } from "./EvidenceRubyVisibility";

/**
 * Carries mutable lexical state while scanning one Ruby scope.
 *
 * EvidenceRubyFileScanner updates this record as visibility and
 * `module_function` change, so members receive the state in effect at their own
 * source position.
 *
 * @evidence contracts/common.md#principled-implementation Mutable scope state (visibility, module_function mode, side) gives each member the state in effect at its position.
 * @evidence contracts/common.md#clear-and-simple-design The scanner updates the context in source order.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRubyScopeContext {
  /**
   * Kind of lexical body that owns declarations scanned through this context.
   *
   * It determines which Ruby constructs can introduce members or alter
   * visibility.
   */
  kind: EvidenceRubyScopeKind;

  /**
   * Semantic constant path for declarations nested in this scope.
   *
   * Reopened bodies with the same path later merge into one identity.
   */
  identity: string[];

  /**
   * Receiver side assigned to methods declared in the current body.
   *
   * It separates instance and singleton method addresses under the same owner.
   */
  side: EvidenceRubyMethodSide;

  /**
   * Visibility currently inherited by newly scanned declarations.
   *
   * Visibility modifiers mutate this value only for following members.
   */
  visibility: EvidenceRubyVisibility;

  /**
   * Whether module-function mode duplicates eligible instance methods as module
   * APIs.
   *
   * The scanner records both resulting surfaces so later publication can
   * reconcile them.
   */
  moduleFunction: boolean;

  /**
   * Nominal container form when this scope belongs to a class or module.
   *
   * Omission denotes top-level or singleton contexts that cannot be reopened as
   * a type.
   */
  containerKind?: EvidenceRubyContainerKind;
}
