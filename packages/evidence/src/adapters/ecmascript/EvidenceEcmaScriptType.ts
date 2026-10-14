/**
 * Programming languages that share the ECMAScript declaration and module model.
 *
 * The discriminator selects grammar-specific diagnostics while one scanner and
 * export resolver handle the common JavaScript and TypeScript surface.
 *
 * @evidence contracts/common.md#principled-implementation Two literals select grammar-specific diagnostics while one scanner and resolver serve both languages.
 * @evidence contracts/common.md#clear-and-simple-design The alias only discriminates the variant.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language-specific branch is hidden behind the shared pipeline beyond this discriminator.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the shared pipeline.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceEcmaScriptType = "typescript" | "javascript";
