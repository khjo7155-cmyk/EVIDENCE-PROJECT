import type { IEvidencePrismaFileAnalysis } from "./IEvidencePrismaFileAnalysis";
import type { IEvidencePrismaLocation } from "./IEvidencePrismaLocation";

/**
 * Couples a Prisma semantic declaration location with its source analysis.
 *
 * Consumers resolve parser-established identities through this pair without
 * asking the position scanner to decide which Prisma declarations are valid.
 *
 * @evidence contracts/common.md#principled-implementation A location is paired with its source analysis so parser identities resolve to physical content.
 * @evidence contracts/common.md#clear-and-simple-design The adapter consumes the pair.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaLocatedDeclaration {
  /**
   * Supplies source-wide locations and comment runs for the declaration.
   *
   * The analysis owns coordinate maps and remains the authority for its
   * physical source snapshot.
   */
  analysis: IEvidencePrismaFileAnalysis;

  /**
   * Identifies the parser-matched physical span within that analysis.
   *
   * Its key connects the semantic parser result to a concrete declaration site.
   */
  location: IEvidencePrismaLocation;
}
