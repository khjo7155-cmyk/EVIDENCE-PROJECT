import type { IEvidenceUnit } from "../../structures/IEvidenceUnit";
import type { IEvidenceUnitSite } from "../../structures/IEvidenceUnitSite";

/**
 * Prisma unit beside the parser documentation used to recover withdrawal state.
 *
 * Ownership is kept explicitly because unit materialization needs both semantic
 * output and the comment text that established its review state.
 *
 * @evidence contracts/common.md#principled-implementation A unit is paired with the parser documentation that establishes its withdrawal state.
 * @evidence contracts/common.md#clear-and-simple-design Materialization consumes the pair.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaOwnedUnit {
  /**
   * Identity joining the unit to position and documentation records.
   *
   * This key connects parser-owned semantic output with the physical scan that
   * establishes the site and comment carrier for the materialized unit.
   */
  key: string;

  /**
   * Parser documentation associated with this semantic unit.
   *
   * Withdrawal and review handling reads this value after it establishes a
   * host, preserving the parser's documentation independently of source
   * coordinates.
   */
  documentation: string;

  /**
   * Materialized public or internal Evidence unit.
   *
   * This unit carries the semantic identity and selection state that graph
   * evaluation consumes after the Prisma adapter completes materialization.
   */
  unit: IEvidenceUnit;

  /**
   * Physical declaration site that owns the unit fingerprint.
   *
   * The site preserves position and content ranges from the scanner, which are
   * required to compare review fingerprints against authored source changes.
   */
  site: IEvidenceUnitSite;
}
