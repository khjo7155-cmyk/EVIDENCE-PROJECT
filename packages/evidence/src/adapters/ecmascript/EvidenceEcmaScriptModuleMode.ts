/**
 * Static module surface selected for one ECMAScript-family source file.
 *
 * Explicit file extensions or the nearest package metadata select this mode
 * before scanning, which determines the supported import and export forms.
 *
 * @evidence contracts/common.md#principled-implementation Two literals select ESM or CommonJS semantics, following file extensions and the nearest package type as Node does.
 * @evidence contracts/common.md#clear-and-simple-design Mode selection is the module resolver's; the scanner only consumes the mode.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The mode comes from extensions and package metadata, never from content guessing.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the mode is chosen.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceEcmaScriptModuleMode = "esm" | "commonjs";
