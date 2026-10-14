import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";
import type { IEvidenceRustDocumentationAttachment } from "./IEvidenceRustDocumentationAttachment";

/**
 * Retains one Rust documentation carrier, including unsupported tagged text.
 *
 * The adapter delays attachment until public occurrences and inherited
 * withdrawals are known, while preserving unsupported annotations as
 * diagnosable hosts.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps outer, inner or attribute documentation and tagged ineligible text until occurrences and withdrawals are known.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records carriers; the adapter attaches them later.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustDocumentation {
  /**
   * Stable source-region identity for this documentation carrier.
   *
   * It becomes the evidence-host ID after attachment or unsupported-host
   * creation.
   */
  id: string;

  /**
   * Original documentation range excluded from its owner's review content.
   *
   * The range preserves tag coordinates after parser resources close.
   */
  range: IEvidenceSourceRange;

  /**
   * Delimiter and tag rules for Rust line, block, and attribute documentation.
   *
   * EvidenceDocumentation uses them to retain source-to-text mappings.
   */
  syntax: IEvidenceCommentSyntax;

  /**
   * Declaration sites directly associated with this carrier.
   *
   * Publication and withdrawal filtering decide which sites reach a visible
   * host.
   */
  attachments: IEvidenceRustDocumentationAttachment[];

  /**
   * Module path receiving an inner comment that documents the module.
   *
   * Omission means the carrier attaches to item declarations instead.
   */
  innerModulePath?: string[];
}
