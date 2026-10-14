import type { IEvidenceGraphHostNode } from "../structures/IEvidenceGraphHostNode";
import type { IEvidenceGraphNode } from "../structures/IEvidenceGraphNode";

/**
 * A serialized graph node representing a unit or its annotation carrier.
 *
 * Unit nodes participate in coverage and dependency edges. Host nodes preserve
 * the physical source location where evidence, exclusions, or reviews were
 * written, allowing graph exports to show annotations without changing the
 * unit's semantic identity.
 *
 * @evidence contracts/common.md#principled-implementation A union of unit and host node shapes keeps semantic identities apart from the physical carriers where annotations were written.
 * @evidence contracts/common.md#clear-and-simple-design Each member interface owns its fields; the alias only lets exporters handle both node kinds uniformly.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No synthetic node kind is introduced for any particular graph.
 * @evidence contracts/common.md#meaningful-documentation The comment explains what each node kind represents and why hosts do not change unit identity.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceGraphNode = IEvidenceGraphHostNode | IEvidenceGraphNode;
