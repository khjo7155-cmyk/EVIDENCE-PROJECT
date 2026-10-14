/**
 * Markdown document and section kinds.
 *
 * - "file": the document root.
 * - "h1" through "h4": ATX sections at exactly that level. Setext and H5/H6
 *   headings are excluded.
 * - A section contains lower-level sections up to the next equal/higher heading.
 *   Ordinary evidence and permitted exclusions cover selected descendants;
 *   unselected ancestors remain addressable as aggregate targets.
 *
 * Target rules:
 *
 * - File paths are relative to the reference root. Both path separators are
 *   accepted, but paths cannot contain whitespace.
 * - Sections append "#<anchor>" to the file path.
 *
 *   - An explicit "{#anchor}" wins. It starts with an ASCII letter/digit, followed
 *       by ASCII letters/digits, ".", "_", ":", or "-".
 *   - Otherwise, lowercase the heading; retain letters, numbers, and "_"; collapse
 *       whitespace/hyphens to "-"; remove other punctuation.
 * - Duplicate selected heading targets are ambiguous and need explicit anchors.
 *
 * @evidence contracts/common.md#principled-implementation Selectors map to the document root and ATX levels one through four, the outline levels the Markdown adapter addresses.
 * @evidence contracts/common.md#clear-and-simple-design The alias names selectable kinds; outline extraction and anchor generation stay in the Markdown adapter.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Setext and H5/H6 are excluded by documented contract rather than by special-casing documents.
 * @evidence contracts/common.md#meaningful-documentation The comment documents section containment, aggregate coverage, path and anchor spelling, and duplicate-anchor ambiguity.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceMarkdownSymbol = "file" | "h1" | "h2" | "h3" | "h4";
