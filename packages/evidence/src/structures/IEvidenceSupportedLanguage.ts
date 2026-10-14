import type { EvidenceProgrammingType } from "../typings/EvidenceProgrammingType";
import type { IEvidenceLanguageAdapter } from "./IEvidenceLanguageAdapter";
import type { IEvidenceLanguageGrammar } from "./IEvidenceLanguageGrammar";

/**
 * Programming capability entry with a certified adapter guaranteed present.
 *
 * Supported-language queries narrow the broader grammar catalog to entries that
 * can extract Evidence inventories. Consumers can inspect adapter boundaries
 * directly without mistaking a grammar-only entry for implemented graph
 * support.
 *
 * @evidence contracts/common.md#principled-implementation A programming entry with a required adapter field guarantees certified extraction at the type level.
 * @evidence contracts/common.md#clear-and-simple-design It narrows IEvidenceLanguage for capability reports.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Uncertified entries cannot satisfy this type.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the guarantee; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSupportedLanguage {
  /**
   * Configuration discriminator for the supported programming family.
   *
   * This is the value authors use to select the adapter in a population.
   */
  type: EvidenceProgrammingType;

  /**
   * Display name accompanying the family discriminator.
   *
   * It is intended for capability reports rather than target or identity
   * matching.
   */
  name: string;

  /**
   * Registered grammar variants and accepted logical filenames.
   *
   * Several syntax variants can share one certified declaration adapter.
   */
  grammars: IEvidenceLanguageGrammar[];

  /**
   * Certified extraction and documentation-host contract for this family.
   *
   * Unlike the broader catalog entry, this supported entry always provides it.
   */
  adapter: IEvidenceLanguageAdapter;
}
