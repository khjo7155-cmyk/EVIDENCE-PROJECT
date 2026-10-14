/**
 * Distinguishes an ordinary citation from an acknowledged exclusion.
 *
 * Both forms attach authored context to a graph obligation, but only `evidence`
 * supplies coverage. `evidenceExclude` records an intentional exception and
 * therefore follows the exclusion and review rules instead of crediting a
 * unit.
 *
 * @evidence contracts/common.md#principled-implementation A two-literal union mirrors the two acknowledgement tags, so coverage and exclusion handling narrow on the authored kind instead of inferring it from prose.
 * @evidence contracts/common.md#clear-and-simple-design The alias names only the acknowledgement intent; coverage crediting, exclusion overlap and review pairing stay with the graph code that consumes it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Its literals are the tag spellings themselves; no consumer, fixture or expected result is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states that only evidence supplies coverage and that exclusions follow separate exclusion and review rules.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceAcknowledgementKind = "evidence" | "evidenceExclude";
