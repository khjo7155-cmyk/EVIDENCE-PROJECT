/**
 * Classifies the effective entity introduced by a supported C declarator.
 *
 * The scanner unwraps syntax that only changes type spelling and uses this
 * discriminator to distinguish callable declarations from object declarations.
 * It does not model the declaration's full C type.
 *
 * @evidence contracts/common.md#principled-implementation Direct, function and object distinguish the effective entity a declarator introduces without modeling full C types.
 * @evidence contracts/common.md#clear-and-simple-design Declarator classification assigns the kind.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported syntax is diagnosed rather than coerced into a value.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCDeclaratorKind = "direct" | "function" | "object";
