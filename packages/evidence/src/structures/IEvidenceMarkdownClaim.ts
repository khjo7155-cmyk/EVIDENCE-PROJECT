import type { EvidenceMarkdownSymbol } from "../typings/EvidenceMarkdownSymbol";
import type { IEvidenceClaimBase } from "./IEvidenceClaimBase";

/**
 * Markdown documents that host evidence tags in HTML comments.
 *
 * Heading structure supplies semantic claim hosts, and comment placement
 * assigns each annotation to a file or section. Selecting an exact heading
 * level controls which subjects owe evidence without flattening nested sections
 * into their parent's identity.
 *
 * - Every matching regular file is parsed as Markdown regardless of extension.
 * - File hosts precede the first ATX heading. Section hosts belong to the nearest
 *   preceding ATX heading, whose exact level must be selected.
 * - Evidence and exclusions require a target and nonempty reason.
 * - Ordinary exclusions belong to the claim's target scope, not their particular
 *   eligible host position. Markdown checklists apply per-host rules instead.
 *
 * @evidence contracts/common.md#principled-implementation Specializing the claim base with the Markdown discriminator and outline symbols reuses shared selection.
 * @evidence contracts/common.md#clear-and-simple-design The interface adds no fields; Markdown host rules are documented on it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No document is special-cased; tags are read only from HTML comments and annotation headings.
 * @evidence contracts/common.md#meaningful-documentation The comment documents which Markdown carriers host tags.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceMarkdownClaim extends IEvidenceClaimBase<
  "markdown",
  EvidenceMarkdownSymbol
> {}
