/**
 * Node condition set used by one configuration module request.
 *
 * The dependency scanner carries this distinction from syntax into package
 * resolution so its watch set names the same entry that the config evaluator
 * executes. Losing it would turn an ESM import into a CommonJS observation.
 *
 * @evidence contracts/common.md#principled-implementation The two literals are Node's import and require condition sets, which select different package entries during resolution.
 * @evidence contracts/common.md#clear-and-simple-design The alias only carries the condition set from syntax to package resolution.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No module is special-cased; the mode comes from the authored syntax.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why losing the distinction would watch the wrong entry.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceConfigModuleMode = "import" | "require";
