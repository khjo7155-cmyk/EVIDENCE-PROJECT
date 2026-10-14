import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceLuaDocumentationAttachment } from "./IEvidenceLuaDocumentationAttachment";

/**
 * Represents a Lua documentation carrier or tag-bearing unsupported carrier.
 *
 * LuaDoc is retained independently of static value resolution so annotations on
 * dynamic or detached source can be reported truthfully rather than discarded.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps LuaDoc or tag-bearing unsupported comments with their syntax, independent of value resolution.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter parses them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLuaDocumentation {
  /**
   * Identifies this physical Lua documentation carrier within the scanned file.
   *
   * Attachments and generated hosts use this scanner-local ID, which does not
   * name a semantic declaration.
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
   * Defines the delimiters and annotation-reading rules for this comment
   * carrier.
   *
   * Documentation parsing uses the syntax instead of guessing from raw Lua
   * source text.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Lists declaration sites that accept this carrier as attached LuaDoc.
   *
   * The scanner establishes attachment from source adjacency before static
   * value reconciliation.
   */
  attachments: IEvidenceLuaDocumentationAttachment[];
}
