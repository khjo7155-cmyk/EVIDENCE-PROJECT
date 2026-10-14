import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceKotlinDocumentationAttachment } from "./IEvidenceKotlinDocumentationAttachment";

/**
 * Represents a Kotlin documentation carrier or tag-bearing unsupported carrier.
 *
 * KDoc attachment is established from source adjacency, while tagged text in an
 * ineligible carrier remains present for a host-level diagnostic.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps KDoc or tag-bearing unsupported comments so ineligible annotations still produce host diagnostics.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter parses them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceKotlinDocumentation {
  /**
   * Identifies this physical KDoc or unsupported carrier within the scanned
   * source.
   *
   * Attachments and host generation use this scanner-local value, which is
   * distinct from a declaration's semantic identity.
   */
  id: string;

  /**
   * Locates the carrier's original half-open UTF-16 source span.
   *
   * The adapter preserves this range for diagnostics and annotation-range
   * exclusion.
   */
  range: IEvidenceSourceRange;

  /**
   * Defines the carrier delimiters and annotation-reading rules.
   *
   * KDoc parsing uses this syntax rather than guessing from raw source text.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Lists declaration sites that accept this carrier as KDoc.
   *
   * The scanner establishes these source-adjacent attachments before receiver
   * and unit resolution.
   */
  attachments: IEvidenceKotlinDocumentationAttachment[];
}
