import type { EvidenceProgrammingSymbol } from "../typings/EvidenceProgrammingSymbol";
import type { EvidenceProgrammingType } from "../typings/EvidenceProgrammingType";
import type { IEvidenceReferenceBase } from "./IEvidenceReferenceBase";

/**
 * Public programming declarations required by an independent reference
 * obligation.
 *
 * The configured language selects the adapter, and symbol selection determines
 * which extracted identities enter the denominator. Structural ancestors remain
 * resolvable for aggregate citations without becoming extra selected units.
 *
 * @evidence contracts/common.md#principled-implementation Programming files specialize the reference base for code targets.
 * @evidence contracts/common.md#clear-and-simple-design Only files is added; policy comes from the base.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language is special-cased by this declaration.
 * @evidence contracts/common.md#meaningful-documentation The comment explains selection; the field documents glob rules.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceProgrammingReference extends IEvidenceReferenceBase<
  EvidenceProgrammingType,
  EvidenceProgrammingSymbol
> {
  /**
   * Source-file globs relative to the reference root.
   *
   * These use claim glob rules. Files are read from disk without requiring
   * TypeScript Program membership or package-entry resolution. The type selects
   * the language; file names identify variants such as TSX.
   */
  files: string[];
}
