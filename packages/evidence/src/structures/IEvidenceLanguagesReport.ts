import type { IEvidenceSupportedDatabaseLanguage } from "./IEvidenceSupportedDatabaseLanguage";
import type { IEvidenceSupportedLanguage } from "./IEvidenceSupportedLanguage";

/**
 * Versioned catalog of certified programming and database adapter capabilities.
 *
 * This report requires no project analysis or grammar initialization. It
 * excludes grammar-only candidates and exposes each shipped adapter's
 * selectors, public surface, documentation forms, and unsupported boundaries.
 *
 * @evidence contracts/common.md#principled-implementation A versioned catalog lists programming and database entries with certified adapters and their total.
 * @evidence contracts/common.md#clear-and-simple-design Entries reuse the supported-language interfaces instead of a separate report shape.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only certified entries appear; candidates are excluded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the catalog; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLanguagesReport {
  /**
   * Serialization version used by capability consumers.
   *
   * Readers check it before interpreting language and adapter metadata.
   */
  schemaVersion: 1;

  /**
   * Discriminator identifying capability-catalog output.
   *
   * The operation is independent of any configured source populations.
   */
  command: "languages";

  /**
   * Number of certified entries included in the report.
   *
   * Grammar variants within a language do not each add another language entry.
   */
  total: number;

  /**
   * Supported programming and database families with required adapter
   * contracts.
   *
   * Each entry distinguishes filename-based grammar selection from semantic
   * extraction capabilities.
   */
  languages: (
    IEvidenceSupportedLanguage | IEvidenceSupportedDatabaseLanguage
  )[];
}
