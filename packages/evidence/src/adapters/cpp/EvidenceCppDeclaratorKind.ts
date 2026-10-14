/**
 * Classifies the entity introduced by the innermost effective C++ declarator.
 *
 * Declarator unwrapping uses this distinction to separate callable declarations
 * from objects without attempting to model the complete C++ type expression.
 *
 * @evidence contracts/common.md#principled-implementation Direct, function and object distinguish the entity the innermost effective declarator introduces.
 * @evidence contracts/common.md#clear-and-simple-design Declarator classification assigns the kind.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported forms are diagnosed by the scanner rather than represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCppDeclaratorKind = "direct" | "function" | "object";
