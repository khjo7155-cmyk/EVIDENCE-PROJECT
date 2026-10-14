/**
 * Classifies the accessor capability declared by a supported Ruby attribute
 * macro.
 *
 * EvidenceRubyFileScanner emits one declaration for each generated reader or
 * writer. EvidenceRubyAdapter uses this distinction to detect redefinitions
 * without executing the macro.
 *
 * @evidence contracts/common.md#principled-implementation Reader and writer modes give each generated accessor capability its own declaration.
 * @evidence contracts/common.md#clear-and-simple-design The adapter uses the mode to detect redefinitions without executing macros.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language form outside the documented set is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceRubyAttributeMode = "read" | "write";
