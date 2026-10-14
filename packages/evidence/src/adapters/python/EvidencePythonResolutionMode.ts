/**
 * Selects whether a Python lookup is constrained by a module's public surface.
 *
 * Star imports require public lookup, whereas named imports may resolve a
 * declared module attribute even when that name is not publicly re-exported.
 *
 * @evidence contracts/common.md#principled-implementation Public mode follows a module's public surface for star imports, while declared mode lets named imports reach any declared attribute.
 * @evidence contracts/common.md#clear-and-simple-design The resolver selects the mode per import form.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language form outside the documented set is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidencePythonResolutionMode = "public" | "declared";
