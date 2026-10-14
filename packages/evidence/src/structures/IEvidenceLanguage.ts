import type { EvidenceProgrammingType } from "../typings/EvidenceProgrammingType";
import type { IEvidenceLanguageAdapter } from "./IEvidenceLanguageAdapter";
import type { IEvidenceLanguageGrammar } from "./IEvidenceLanguageGrammar";

/**
 * Programming-language catalog entry separating parsing from Evidence
 * extraction.
 *
 * A grammar can recognize syntax before an adapter has established declaration
 * identity, visibility, and documentation ownership. Optional adapter metadata
 * prevents grammar availability from being advertised as certified graph
 * support.
 *
 * @evidence contracts/common.md#principled-implementation Grammar variants and optional certified adapter metadata separate parsing availability from Evidence extraction support.
 * @evidence contracts/common.md#clear-and-simple-design The entry is catalog data; acquisition and extraction are elsewhere.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Adapter metadata is present only when certified.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the separation; each field documents role and omission.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLanguage {
  /**
   * Programming artifact discriminator accepted by configuration and parser
   * selection.
   *
   * A single family can select several grammar variants by logical filename.
   */
  type: EvidenceProgrammingType;

  /**
   * Human-readable language name shown by capability inspection.
   *
   * Callers use the type discriminator, rather than this display label, in
   * configuration.
   */
  name: string;

  /**
   * Syntax variants and their accepted case-sensitive source spellings.
   *
   * These describe grammar selection without loading any WASM bytes.
   */
  grammars: IEvidenceLanguageGrammar[];

  /**
   * Certified Evidence extraction capabilities, when an adapter is available.
   *
   * Omission means grammar metadata alone must not be treated as supported
   * declaration, visibility, ownership, or documentation-host extraction.
   */
  adapter?: IEvidenceLanguageAdapter;
}
