import type { IEvidenceCommentSyntax } from "../../structures/IEvidenceCommentSyntax";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";

/**
 * Represents one DBML comment or note after its declaration owners are known.
 *
 * The scanner retains this carrier so later graph assembly can parse annotation
 * tags without rediscovering DBML attachment rules.
 *
 * @evidence contracts/common.md#principled-implementation A carrier keeps mapped text and its established owners, including unsupported attachments for diagnosis.
 * @evidence contracts/common.md#clear-and-simple-design The scanner attaches; the adapter parses tags.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDbmlDocumentation {
  /**
   * Identifies declarations documented by this carrier.
   *
   * Each nested path preserves the literal DBML identity found by the scanner.
   */
  owners: string[][];

  /**
   * Locates the original comment or note string in the source file.
   *
   * Consumers use this range when reporting annotation syntax and diagnostics.
   */
  range: IEvidenceSourceRange;

  /**
   * Covers complete annotation syntax excluded from semantic fingerprints.
   *
   * It can include delimiters outside the readable documentation range.
   */
  annotationRange: IEvidenceSourceRange;

  /**
   * Describes delimiters used to decode this documentation carrier.
   *
   * EvidenceDocumentation uses it to map decoded characters to source offsets.
   */
  syntax: IEvidenceCommentSyntax;
}
