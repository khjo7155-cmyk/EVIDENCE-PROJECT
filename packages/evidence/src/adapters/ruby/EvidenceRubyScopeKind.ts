/**
 * Classifies lexical Ruby scopes that can contain supported declarations.
 *
 * EvidenceRubyFileScanner uses the current scope to decide which directives are
 * valid and how declarations inherit container identity, receiver side, and
 * visibility.
 *
 * @evidence contracts/common.md#principled-implementation Class, module, singleton and top scopes decide which directives are valid and what declarations inherit.
 * @evidence contracts/common.md#clear-and-simple-design The scanner tracks the current scope kind.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language form outside the documented set is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceRubyScopeKind = "class" | "module" | "singleton" | "top";
