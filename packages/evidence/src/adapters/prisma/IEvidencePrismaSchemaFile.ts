import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";

/**
 * One deduplicated physical schema file and its parser-facing name.
 *
 * Parser-facing names provide stable schema-set references while the source
 * snapshot remains the owner of content, digest, and physical coordinates.
 *
 * @evidence contracts/common.md#principled-implementation A deduplicated physical file is paired with its parser-facing name.
 * @evidence contracts/common.md#clear-and-simple-design The adapter builds the list; the loader sends it to the parser.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaSchemaFile {
  /**
   * Unique normalized name supplied to the multi-file parser.
   *
   * The parser uses this stable schema-set key for cross-file resolution; it is
   * derived independently of the source snapshot's physical filesystem path.
   */
  name: string;

  /**
   * Selected source snapshot represented by that parser-facing name.
   *
   * Its content enters the parser payload, while its digest and physical
   * identity remain available for cache keys and later location
   * materialization.
   */
  source: IEvidenceSourceFile;
}
