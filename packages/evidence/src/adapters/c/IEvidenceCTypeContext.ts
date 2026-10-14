/**
 * Carries the enclosing aggregate or enum while its nested C members are
 * scanned.
 *
 * Fields and enumerators derive their ownership and semantic path from this
 * context. Keeping the declaration key as well as the path allows later
 * materialization to attach the member to the exact selected parent unit.
 *
 * @evidence contracts/common.md#principled-implementation The enclosing aggregate or enum's key and path give fields and enumerators their owner.
 * @evidence contracts/common.md#clear-and-simple-design The scanner threads the context through member lists.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCTypeContext {
  /**
   * Scanner-local declaration key for the enclosing aggregate or enum.
   *
   * Nested declarations retain it until the adapter resolves their selected
   * parent unit.
   */
  declarationId: string;

  /**
   * Canonical enclosing path prepended to each nested member identity.
   *
   * It keeps member identity separate from any tag or typedef public address.
   */
  identity: string[];
}
