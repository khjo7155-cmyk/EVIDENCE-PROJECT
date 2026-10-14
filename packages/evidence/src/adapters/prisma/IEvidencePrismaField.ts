import type { EvidenceDatabaseSymbol } from "../../typings/EvidenceDatabaseSymbol";

/**
 * One parser-classified Prisma model member.
 *
 * These detached records make the cross-file materializer independent of the
 * WASM parser lifetime while preserving the member fingerprint boundary.
 *
 * @evidence contracts/common.md#principled-implementation A detached member records name, column or relation symbol, documentation and digest.
 * @evidence contracts/common.md#clear-and-simple-design Materialization uses it independent of the WASM lifetime.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaField {
  /**
   * Name relative to the owning model identity.
   *
   * The materializer joins it with its containing model name to create the
   * public address and semantic identity for this member.
   */
  name: string;

  /**
   * Evidence unit symbol selected from the parser field kind.
   *
   * Prisma scalar fields become columns and object fields become relations, so
   * this normalized symbol controls selector matching without retaining WASM
   * data.
   */
  symbol: Exclude<EvidenceDatabaseSymbol, "model">;

  /**
   * Documentation text used to recover directive and withdrawal state.
   *
   * The adapter parses this detached text after it establishes the field's
   * host, keeping comment metadata separate from the semantic fingerprint
   * payload.
   */
  documentation: string;

  /**
   * Semantic field digest excluding documentation metadata.
   *
   * Review fingerprints use this value to detect changes to the field itself
   * without treating explanatory or Evidence annotation edits as semantic
   * drift.
   */
  digest: string;
}
