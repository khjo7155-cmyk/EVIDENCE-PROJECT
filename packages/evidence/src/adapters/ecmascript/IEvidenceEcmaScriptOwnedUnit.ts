import type { IEvidenceUnit } from "../../structures/IEvidenceUnit";

/**
 * A local evidence unit together with the binding path that owns it.
 *
 * The scanner creates this record before export resolution. The resolver uses
 * the root to match a local binding and the suffix to extend its public address
 * for nested declarations such as class members or namespace contents.
 *
 * @evidence contracts/common.md#principled-implementation A unit is paired with its root binding and suffix path so a resolved export can extend its public address to nested members.
 * @evidence contracts/common.md#clear-and-simple-design The scanner creates the record; the resolver matches roots to bindings.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEcmaScriptOwnedUnit {
  /**
   * Semantic declaration extracted into the evidence inventory.
   *
   * This identity remains one unit even when several public export paths expose
   * it through aliases or re-exports.
   */
  unit: IEvidenceUnit;

  /**
   * Outermost local binding through which this unit is owned.
   *
   * Export resolution compares a resolved local name with this root before
   * publishing the unit and its nested suffix.
   */
  root: string;

  /**
   * Segments below `root` in a public address.
   *
   * A root declaration has no suffix; members and nested namespace declarations
   * append their literal segments after the export name.
   */
  suffix: string[];

  /**
   * Whether this declaration exists in the TypeScript type space.
   *
   * A type-only export may publish this unit, while value-only units remain
   * unavailable through that path.
   */
  typeSpace: boolean;

  /**
   * Whether this declaration exists in the JavaScript value space.
   *
   * Merged declarations can occupy both spaces, and ordinary value exports
   * publish units regardless of this flag's counterpart.
   */
  valueSpace: boolean;
}
