import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceCDocumentationAttachment } from "./IEvidenceCDocumentationAttachment";

/**
 * Stores a C comment or literal that may carry Evidence tags.
 *
 * The scanner retains carriers even when no supported declaration accepts them.
 * That distinction lets the adapter publish a diagnostic host for misplaced
 * annotations instead of silently discarding an annotation requested by
 * source.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps a Doxygen or tag-bearing comment even when no declaration accepts it.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter attaches or reports them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCDocumentation {
  /**
   * Stable source-range key used to deduplicate one documentation carrier.
   *
   * It identifies the physical carrier rather than a declaration or semantic
   * unit.
   */
  id: string;

  /**
   * Exact carrier range, later excluded from the source fingerprint as needed.
   *
   * The adapter also uses it as the host location for parsed or unsupported
   * annotations.
   */
  range: IEvidenceSourceRange;

  /**
   * Delimiters and tag-boundary rules required to parse the carrier's text.
   *
   * Documentation reading uses this syntax rather than guessing from raw
   * source.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Supported declaration sites to which this carrier attaches.
   *
   * Unattached tag-bearing carriers remain available for unsupported-host
   * diagnostics.
   */
  attachments: IEvidenceCDocumentationAttachment[];
}
