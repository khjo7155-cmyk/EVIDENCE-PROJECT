import type { IEvidenceSourceRange } from "./IEvidenceSourceRange";

/**
 * A physical declaration occurrence and its contribution to a unit's content.
 *
 * A merged unit can own several sites, while a statement declaring several
 * variables can share one site ID across units. The site identifies the
 * physical occurrence without deciding whether its declarations share semantic
 * identity.
 *
 * The declaration range establishes ownership and diagnostic location. Content
 * ranges identify the portions belonging to this unit's own fingerprint and may
 * exclude sibling declarators. Inventory validation requires those portions to
 * remain inside the declaration and checks hosts against the owned site IDs.
 *
 * @evidence contracts/common.md#principled-implementation A site records one declaration occurrence's range and its own content ranges, so merged declarations keep every site.
 * @evidence contracts/common.md#clear-and-simple-design Content ranges are separate from the declaration range so siblings sharing a statement do not share fingerprints.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No content outside the listed ranges contributes to the unit.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the contribution; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceUnitSite {
  /**
   * Adapter identity of the physical declaration occurrence.
   *
   * Multi-variable statements may share this ID. Its source location must
   * remain consistent across those records even when their content
   * contributions differ.
   */
  id: string;

  /**
   * Captured source path containing the declaration.
   *
   * Fingerprinting resolves this path against inventory sources. Re-exporting
   * the unit changes its public addresses without moving this physical site.
   */
  file: string;

  /**
   * Complete source span of this declaration occurrence.
   *
   * The half-open range establishes the bounds for owned content and host
   * validation. Narrower fingerprint contributions are recorded in `content`.
   */
  range: IEvidenceSourceRange;

  /**
   * Source portions contributing to this unit's own content digest.
   *
   * Sibling declarators need not contribute to one another's fingerprints.
   * Accepted annotation spans are removed before the remaining text is
   * normalized and hashed; structural descendants are combined separately
   * afterward.
   */
  content: IEvidenceSourceRange[];
}
