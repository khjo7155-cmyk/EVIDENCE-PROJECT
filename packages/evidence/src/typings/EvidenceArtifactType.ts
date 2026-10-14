import type { EvidenceDatabaseType } from "./EvidenceDatabaseType";
import type { EvidenceProgrammingType } from "./EvidenceProgrammingType";

/**
 * Artifact families that can provide graph units and annotation carriers.
 *
 * An adapter uses this discriminator to keep language-specific extraction and
 * target spelling separate while the graph can process their common inventory.
 * `markdown` and `swagger` are document artifacts; the other members identify
 * programming or database dialect groups.
 *
 * @evidence contracts/common.md#principled-implementation A union of the programming and database discriminators plus the two document families lets adapters and configuration narrow on one artifact field.
 * @evidence contracts/common.md#clear-and-simple-design It composes the owning language unions rather than repeating their members, so each family list keeps one owner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No artifact is special-cased; markdown and swagger are listed because they are distinct supported families.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the discriminator's role in adapter selection and which members are document artifacts.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceArtifactType =
  EvidenceProgrammingType | EvidenceDatabaseType | "markdown" | "swagger";
