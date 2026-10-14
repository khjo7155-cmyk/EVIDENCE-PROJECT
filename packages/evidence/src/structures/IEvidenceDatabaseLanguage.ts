import type { EvidenceDatabaseType } from "../typings/EvidenceDatabaseType";
import type { IEvidenceDatabaseLanguageAdapter } from "./IEvidenceDatabaseLanguageAdapter";
import type { IEvidenceLanguageGrammar } from "./IEvidenceLanguageGrammar";

/**
 * Database-language catalog entry separating grammar availability from schema
 * extraction.
 *
 * A parser recognizing schema syntax does not establish model, column,
 * relation, or documentation ownership. Adapter metadata appears only when
 * those Evidence boundaries are certified, allowing catalog inspection without
 * overstating support.
 *
 * @evidence contracts/common.md#principled-implementation Separating grammar variants from optional certified adapter metadata keeps catalog listing from overstating extraction support.
 * @evidence contracts/common.md#clear-and-simple-design The entry holds catalog data only; grammar acquisition happens in the parser.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Adapter metadata is present only when certified, never inferred from grammar availability.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the grammar/adapter separation; each field documents its role and omission.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDatabaseLanguage {
  /**
   * Database family discriminator used in population configuration.
   *
   * Grammar and adapter selection remain scoped to this configured family.
   */
  type: EvidenceDatabaseType;

  /**
   * Human-readable schema-language name.
   *
   * Capability reports display this label alongside the configuration
   * discriminator.
   */
  name: string;

  /**
   * Pinned grammar variants and their accepted logical file spellings.
   *
   * Reading these selection rules does not acquire or initialize a grammar.
   */
  grammars: IEvidenceLanguageGrammar[];

  /**
   * Certified schema extraction capabilities, when available.
   *
   * Omission means grammar availability alone cannot certify Evidence units,
   * structural ownership, or annotation hosts for the language.
   */
  adapter?: IEvidenceDatabaseLanguageAdapter;
}
