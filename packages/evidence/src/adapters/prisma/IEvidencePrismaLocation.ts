import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";

/**
 * Source position found for one parser-established Prisma identity.
 *
 * Keys connect semantic parser output to physical content without making source
 * scanning guess which declarations the Prisma parser accepts.
 *
 * @evidence contracts/common.md#principled-implementation A location records the key and span found for one parser-established identity.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces locations; the adapter looks them up by key.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaLocation {
  /**
   * Adapter identity key for the model or model member at this location.
   *
   * Materialization uses this key to join a lexical declaration span with the
   * semantic parser result without reinterpreting Prisma schema syntax.
   */
  key: string;

  /**
   * Exact physical source range used for the materialized site.
   *
   * The resulting Evidence site owns this range for diagnostics, fingerprints,
   * and documentation attachment in the immutable source snapshot.
   */
  range: IEvidenceSourceRange;
}
