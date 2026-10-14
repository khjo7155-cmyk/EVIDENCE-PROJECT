import type { IEvidenceUnit } from "../../structures/IEvidenceUnit";

/**
 * Associates one scanned Python declaration with module binding information.
 *
 * Export resolution matches `roots` before it publishes the unit, then prefixes
 * `suffix` with each reachable public path. This prevents an internal alias
 * from changing the declaration's semantic ID.
 *
 * @evidence contracts/common.md#principled-implementation A unit records its binding roots and suffix so publication prefixes the suffix with each reachable public path.
 * @evidence contracts/common.md#clear-and-simple-design The scanner creates it; the resolver publishes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePythonOwnedUnit {
  /**
   * Evidence unit with semantic identity, source position, and parent relation.
   *
   * The adapter publishes only units reachable from a supported module export.
   */
  unit: IEvidenceUnit;

  /**
   * Module-level binding names that can resolve to this declaration.
   *
   * A declaration can have more than one root when Python syntax establishes
   * aliases without creating a separate semantic unit.
   */
  roots: string[];

  /**
   * Address segments beneath the matching module root.
   *
   * Instance members include the adapter's prototype marker while class members
   * remain direct children of their class address.
   */
  suffix: string[];
}
