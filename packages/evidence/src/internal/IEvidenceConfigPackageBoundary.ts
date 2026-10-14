import type { IEvidenceConfigResolutionManifest } from "./IEvidenceConfigResolutionManifest";

/**
 * Nearest package scope governing one configuration module request.
 *
 * Package imports and self-references both need the manifest together with its
 * directory so relative map targets cannot escape the scope that declared
 * them.
 *
 * @evidence contracts/common.md#principled-implementation A directory and its manifest identify the nearest package scope that can redirect a configuration import.
 * @evidence contracts/common.md#clear-and-simple-design The boundary pairs location with metadata; resolution rules are applied elsewhere.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only the nearest scope is recorded, matching Node package resolution.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the scope; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceConfigPackageBoundary {
  /**
   * Directory containing the governing package manifest.
   *
   * Relative map targets must remain descendants of this boundary.
   */
  directory: string;

  /**
   * Freshly validated package fields used by configuration resolution.
   *
   * Keeping the parsed value with its directory prevents a later cached lookup
   * from pairing metadata with the wrong watch cycle or symlink target.
   */
  manifest: IEvidenceConfigResolutionManifest;
}
