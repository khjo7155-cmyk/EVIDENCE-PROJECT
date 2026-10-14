import type { IEvidenceUnit } from "../../structures/IEvidenceUnit";
import type { IEvidenceCppAlias } from "./IEvidenceCppAlias";
import type { IEvidenceCppFileAnalysis } from "./IEvidenceCppFileAnalysis";

/**
 * Binds one public C++ alias to the selected semantic unit it uniquely resolves
 * to.
 *
 * `EvidenceCppAdapter.resolveAliases` creates this intermediate result after
 * declaration families are materialized. The adapter then publishes addresses
 * for `target` and its nested units while retaining `analysis` to report
 * address conflicts against the originating source file.
 *
 * @evidence contracts/common.md#principled-implementation A resolved alias binds a public alias to its unique selected target with the originating analysis for conflict reports.
 * @evidence contracts/common.md#clear-and-simple-design The adapter produces it during alias resolution.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCppResolvedAlias {
  /**
   * Public namespace alias or using declaration whose target resolved
   * unambiguously.
   *
   * Its scope and spelling provide the address that the adapter publishes for
   * `target`.
   */
  alias: IEvidenceCppAlias;

  /**
   * File analysis that supplied `alias`.
   *
   * The adapter uses it as the source-context owner when alias publication
   * detects an address conflict.
   */
  analysis: IEvidenceCppFileAnalysis;

  /**
   * Selected semantic unit named by `alias`.
   *
   * Resolution emits this result only when the alias has exactly one candidate,
   * allowing the alias address to share the target unit's identity.
   */
  target: IEvidenceUnit;
}
