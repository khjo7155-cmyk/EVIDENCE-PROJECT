import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceSqlDocumentationAttachment } from "./IEvidenceSqlDocumentationAttachment";

/**
 * Represents one SQL comment carrier considered for documentation attachment.
 *
 * The scanner keeps every relevant carrier, including one that cannot attach,
 * so the documentation parser can diagnose annotations without silently
 * dropping their source range.
 *
 * @evidence contracts/common.md#principled-implementation A comment carrier with its range, syntax and attachments is kept even when it cannot attach, so its annotations can be diagnosed.
 * @evidence contracts/common.md#clear-and-simple-design Scanners produce carriers; the materializer parses them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed syntax; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSqlDocumentation {
  /**
   * Identifies this documentation record within the source snapshot.
   *
   * Attachment records refer to declarations rather than this value, which
   * keeps comment ownership directional.
   */
  id: string;

  /**
   * Locates the complete carrier in original half-open UTF-16 coordinates.
   *
   * Adjacent line comments can share one range when the scanner forms a run.
   */
  range: IEvidenceSourceRange;

  /**
   * Describes delimiters and tag rules when the carrier has usable syntax.
   *
   * Omission leaves the carrier available for unsupported-annotation handling
   * without pretending that it has a parseable documentation form.
   */
  syntax?: IEvidenceCommentSyntax;

  /**
   * Maps dialect-provided documentation text back to original coordinates.
   *
   * Omission means this carrier is represented only by its raw source range.
   */
  mapped?: IEvidenceDocumentation;

  /**
   * Lists every physical declaration site documented by this carrier.
   *
   * An empty list preserves detached or trailing annotation carriers for later
   * diagnostics.
   */
  attachments: IEvidenceSqlDocumentationAttachment[];
}
