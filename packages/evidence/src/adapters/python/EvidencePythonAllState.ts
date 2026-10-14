/**
 * Classifies how completely the scanner can determine a module's `__all__`
 * value.
 *
 * EvidencePythonExportResolver uses this state to select explicit exports or
 * underscore visibility, while a dynamic value preserves an incomplete analysis
 * diagnostic.
 *
 * @evidence contracts/common.md#principled-implementation Three states record whether __all__ is absent, statically known, or dynamic.
 * @evidence contracts/common.md#clear-and-simple-design The scanner sets the state; the resolver chooses explicit or conventional exports from it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language form outside the documented set is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidencePythonAllState = "absent" | "static" | "dynamic";
