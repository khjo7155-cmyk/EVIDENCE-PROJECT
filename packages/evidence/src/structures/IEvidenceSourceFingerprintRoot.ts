/**
 * Physical and checkout-stable identities of one source population root.
 *
 * Adapters can retain the physical root in process-local unit IDs while review
 * fingerprints replace it with the configured logical path carried here.
 *
 * @evidence contracts/common.md#principled-implementation A physical path and a checkout-stable path let fingerprints ignore absolute checkout locations.
 * @evidence contracts/common.md#clear-and-simple-design The record holds only the two identities.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Absolute paths never enter fingerprints through this record.
 * @evidence contracts/common.md#meaningful-documentation The comment explains both identities; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSourceFingerprintRoot {
  /**
   * Canonical filesystem directory used by the adapter during this analysis.
   *
   * Symlink and junction resolution may make this differ from the configured
   * logical root even though both identify the same selected population.
   */
  physicalPath: string;

  /**
   * Configuration-relative logical path that identifies the population root.
   *
   * This path moves with a checkout and still distinguishes separately declared
   * roots within the same Evidence configuration.
   */
  fingerprintPath: string;
}
