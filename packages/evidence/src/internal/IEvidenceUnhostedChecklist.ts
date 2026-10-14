import type { IEvidenceDeclaration } from "../structures/IEvidenceDeclaration";
import type { EvidenceSeverity } from "../typings/EvidenceSeverity";

/**
 * A checklist annotation awaiting host assignment.
 *
 * Checklists are held while other declarations establish structural ownership,
 * preventing a source-order coincidence from discarding a valid obligation.
 *
 * @evidence contracts/common.md#principled-implementation A checklist declaration with its severity and indices waits until host assignment is known.
 * @evidence contracts/common.md#clear-and-simple-design The record defers one finding; evaluation decides whether to emit it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Deferral avoids a derivative finding when a failed obligation could still own the declaration.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the deferral; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceUnhostedChecklist {
  /**
   * Authored checklist declaration retained for later attachment or
   * diagnostics.
   *
   * The graph holds this source record until structural ownership establishes
   * which selected claim units its host can affect.
   */
  declaration: IEvidenceDeclaration;

  /**
   * Effective severity after claim and reference policy inheritance.
   *
   * This resolved value lets later attachment report the applicable policy
   * without repeating policy inheritance.
   */
  severity: EvidenceSeverity;

  /**
   * Index of the owning claim in the resolved configuration plan.
   *
   * It preserves the claim occurrence that supplied this checklist when plans
   * contain repeated populations.
   */
  claim: number;

  /**
   * Index of the owning reference within that claim.
   *
   * Together with {@link claim}, this identifies the configured reference whose
   * severity and selection apply to the deferred checklist.
   */
  reference: number;
}
