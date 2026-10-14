import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceDartDocumentationAttachment } from "./IEvidenceDartDocumentationAttachment";

/**
 * Represents a Dart documentation carrier or tag-bearing unsupported carrier.
 *
 * The scanner preserves unsupported tagged text as well as attached DartDoc so
 * the adapter can report a misplaced annotation instead of silently ignoring
 * it.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps DartDoc or tag-bearing unsupported comments with the declaration sites that accept it.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter parses them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDartDocumentation {
  /**
   * Identifies this physical documentation carrier within the scanned source.
   *
   * Attachments and generated hosts use this scanner-local identity; it does
   * not name a semantic declaration.
   */
  id: string;

  /**
   * Locates the carrier's original half-open UTF-16 source span.
   *
   * The adapter preserves this position for diagnostics and annotation-range
   * exclusion.
   */
  range: IEvidenceSourceRange;

  /**
   * Defines the delimiters and annotation-reading rules for this carrier.
   *
   * Documentation parsing uses this syntax instead of reinterpreting raw Dart
   * source text.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Lists supported declaration sites that accept this carrier as
   * documentation.
   *
   * Attachments are established by source adjacency before library and unit
   * reconciliation.
   */
  attachments: IEvidenceDartDocumentationAttachment[];
}
