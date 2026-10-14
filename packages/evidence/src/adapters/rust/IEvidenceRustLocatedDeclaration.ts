import type { IEvidenceRustDeclaration } from "./IEvidenceRustDeclaration";
import type { IEvidenceRustFilePlacement } from "./IEvidenceRustFilePlacement";
import type { IEvidenceRustModuleRecord } from "./IEvidenceRustModuleRecord";

/**
 * Locates one Rust declaration in the resolved selected crate graph.
 *
 * Resolver phases enrich scanner output with module placement and a semantic
 * identity before materializing units and public addresses.
 *
 * @evidence contracts/common.md#principled-implementation A located declaration enriches scanner output with module placement and semantic identity.
 * @evidence contracts/common.md#clear-and-simple-design Resolver phases produce and consume it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceRustLocatedDeclaration {
  /**
   * Scanner record describing the declaration's syntax and local ownership.
   *
   * Its source site remains the provenance for the resulting Evidence unit.
   */
  declaration: IEvidenceRustDeclaration;

  /**
   * Selected file and crate prefix containing the declaration.
   *
   * Address publication uses this placement to preserve file-qualified targets.
   */
  placement: IEvidenceRustFilePlacement;

  /**
   * Resolved module that owns the declaration.
   *
   * Binding and export resolution start from this record.
   */
  module: IEvidenceRustModuleRecord;

  /**
   * Canonical crate-relative segments naming the declaration semantically.
   *
   * Reexports may add public paths without changing this identity.
   */
  identity: string[];
}
