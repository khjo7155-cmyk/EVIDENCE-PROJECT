import type { EvidenceArtifactType } from "../typings/EvidenceArtifactType";
import type { IEvidenceInventory } from "./IEvidenceInventory";
import type { IEvidenceSourceSnapshot } from "./IEvidenceSourceSnapshot";

/**
 * Language-specific extraction boundary between source discovery and graph
 * evaluation.
 *
 * The checker supplies a captured source snapshot. The adapter owns declaration
 * classification, visibility, semantic ownership, public addresses, and comment
 * attachment for its artifact. Shared graph code consumes the resulting records
 * without interpreting that language's syntax.
 *
 * Grammar acceptance alone does not establish complete support. Constructs that
 * can alter the public population but cannot be analyzed must leave an
 * incomplete inventory with a repairable diagnostic. Source failures and watch
 * dependencies also cross this boundary; borrowed parser resources must not
 * escape in output.
 *
 * @example
 *   const adapter: IEvidenceAdapter<"typescript"> =
 *     new EvidenceTypeScriptAdapter();
 *   const inventory: IEvidenceInventory = await adapter.analyze(snapshot);
 *   // An incomplete inventory must not be accepted as a smaller full population.
 *
 * @evidence contracts/common.md#principled-implementation A generic interface over the artifact discriminator gives every language one extraction contract, snapshot in and serializable inventory out, so graph code never interprets syntax.
 * @evidence contracts/common.md#clear-and-simple-design The adapter owns classification, visibility, ownership and attachment; the interface exposes only its type and analyze, leaving reconciliation to EvidenceInventory.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The contract requires incomplete inventories for unanalyzable surface-changing constructs instead of letting an adapter shrink the population.
 * @evidence contracts/common.md#meaningful-documentation The comment explains ownership on each side of the boundary, the completeness requirement, resource confinement, and gives a usage example; both members are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceAdapter<
  Type extends EvidenceArtifactType = EvidenceArtifactType,
> {
  /**
   * Artifact language or format handled by this adapter.
   *
   * Configuration and the adapter factory use this discriminator to choose
   * extraction rules. The same adapter supports claim and reference
   * populations.
   */
  readonly type: Type;

  /**
   * Extracts serializable declaration and documentation records from a
   * snapshot.
   *
   * Preserve discovery failures and report unsupported surface-changing syntax
   * instead of silently omitting its declarations. Returned ranges and content
   * must refer to the supplied snapshots, with native resources released before
   * the result is consumed by inventory reconciliation.
   *
   * @evidence contracts/common.md#principled-implementation An asynchronous snapshot-to-inventory signature lets adapters acquire grammars and parse while returning plain data the shared graph can reconcile.
   * @evidence contracts/common.md#clear-and-simple-design The signature carries only the snapshot; registries, parser sessions and diagnostics are the implementation's concern.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts It requires preserving discovery failures and reporting unsupported syntax rather than omitting declarations.
   * @evidence contracts/common.md#meaningful-documentation The comment states the failure, range and resource-release obligations every implementation must meet.
   * @evidenceExclude contracts/performance.md#efficient-algorithms An interface method signature chooses no algorithm; each adapter implementation owns its extraction strategy.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work The signature computes nothing; snapshot and grammar reuse belong to implementations and the parser cache.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The signature holds no resource; it requires implementations to release native parser resources before returning.
   */
  analyze(snapshot: IEvidenceSourceSnapshot): Promise<IEvidenceInventory>;
}
