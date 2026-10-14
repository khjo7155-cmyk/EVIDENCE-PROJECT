/**
 * How a researched grammar can provide WASM compatible with the packaged
 * runtime.
 *
 * A release asset can be downloaded and pinned directly. A source build needs a
 * reproducible compilation route before the candidate can become a certified
 * adapter, so callers must not treat the two states as interchangeable.
 *
 * @evidence contracts/common.md#principled-implementation Two literals distinguish a downloadable release asset from a grammar that first needs a reproducible build, which changes the certification path.
 * @evidence contracts/common.md#clear-and-simple-design The alias records only availability; build recipes and manifest records own the procedures.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No grammar is special-cased by this classification.
 * @evidence contracts/common.md#meaningful-documentation The comment explains both states and why callers must not treat them as interchangeable.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceGrammarWasmAvailability = "release-asset" | "source-build";
