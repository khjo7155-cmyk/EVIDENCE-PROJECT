import type { EvidenceDatabaseType } from "../typings/EvidenceDatabaseType";
import type { IEvidenceDatabaseLanguageAdapter } from "./IEvidenceDatabaseLanguageAdapter";
import type { IEvidenceLanguageGrammar } from "./IEvidenceLanguageGrammar";

/**
 * Database capability entry guaranteed to have a certified schema adapter.
 *
 * Supported-database queries use this narrower shape after excluding
 * grammar-only entries. The required adapter contract lets callers inspect
 * extraction and target-address boundaries without another availability check.
 *
 * @evidence contracts/common.md#principled-implementation A database entry with a required adapter field guarantees certified extraction at the type level.
 * @evidence contracts/common.md#clear-and-simple-design It narrows IEvidenceDatabaseLanguage for capability reports.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Uncertified entries cannot satisfy this type.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the guarantee; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSupportedDatabaseLanguage {
  /**
   * Configuration discriminator selecting this database family.
   *
   * Claims and references use this value to choose schema extraction.
   */
  type: EvidenceDatabaseType;

  /**
   * Display label for the supported schema language.
   *
   * Reports retain the separate type discriminator for configuration use.
   */
  name: string;

  /**
   * Grammar variants and logical filename rules associated with the adapter.
   *
   * These describe syntax selection without implying that metadata inspection
   * loads WASM.
   */
  grammars: IEvidenceLanguageGrammar[];

  /**
   * Guaranteed schema extraction and documentation-host contract.
   *
   * This includes selectors, address policy, and explicit unsupported
   * capabilities.
   */
  adapter: IEvidenceDatabaseLanguageAdapter;
}
