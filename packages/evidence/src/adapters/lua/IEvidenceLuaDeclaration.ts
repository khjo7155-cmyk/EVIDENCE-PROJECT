import type { IEvidenceUnitSite } from "../../structures/IEvidenceUnitSite";
import type { EvidenceProgrammingSymbol } from "../../typings/EvidenceProgrammingSymbol";

/**
 * Represents one static Lua declaration or public alias before inventory
 * reconciliation.
 *
 * Lua exports emerge from initialization values rather than declarations, so
 * identity and reachable address remain separate until table ownership is
 * known.
 *
 * @evidence contracts/common.md#principled-implementation A declaration keeps kind, file-local path, site and public reachability because Lua exports arise from initialization values.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces declarations; the adapter materializes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLuaDeclaration {
  /**
   * Identifies the extracted value shared by aliases of that static value.
   *
   * This prevents several assignments or returned table paths from becoming
   * several coverage units for one semantic declaration.
   */
  id: string;

  /**
   * Gives the canonical name selected for this public declaration.
   *
   * The adapter retains this source-derived spelling for unit naming and
   * diagnostics while `address` carries its complete path.
   */
  name: string;

  /**
   * Classifies callable values as functions and tables or scalar fields as
   * properties.
   *
   * This Evidence selector is assigned from static value shape without
   * executing the Lua module.
   */
  symbol: EvidenceProgrammingSymbol;

  /**
   * Lists the file-local path that establishes this declaration's semantic
   * identity.
   *
   * Alias projections share the identity of their original static value even
   * when they publish another address.
   */
  identity: string[];

  /**
   * Lists the public path through which this occurrence projects the value.
   *
   * This can differ from `identity` when a local alias or returned table field
   * exposes the same value.
   */
  address: string[];

  /**
   * Retains the physical source site and content used for Evidence hosts and
   * fingerprints.
   *
   * Multiple alias projections can retain separate sites while materializing
   * one semantic unit.
   */
  site: IEvidenceUnitSite;

  /**
   * States whether static initialization makes the value reachable through the
   * public surface.
   *
   * The adapter keeps unreachable values for ownership analysis but excludes
   * them from published units and addresses.
   */
  public: boolean;

  /**
   * Identifies the containing table declaration for a nested field.
   *
   * Parent withdrawal and visibility propagation follow this value instead of
   * reconstructing ownership from a mutable Lua table path.
   */
  ownerDeclarationId?: string;
}
