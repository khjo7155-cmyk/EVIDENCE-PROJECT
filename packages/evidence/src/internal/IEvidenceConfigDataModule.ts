/**
 * Decoded dependency-bearing content of one Node data URL module.
 *
 * JavaScript modules expose source for recursive static scanning. JSON and Wasm
 * modules are immutable leaves and therefore omit content.
 *
 * @evidence contracts/common.md#principled-implementation Optional decoded content represents a data: URL module whose body may reference further dependencies.
 * @evidence contracts/common.md#clear-and-simple-design The record carries decoded content only; scanning lives in EvidenceConfigDependencyScanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Undecodable modules leave content absent rather than inventing text.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the data URL source; the field documents omission.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceConfigDataModule {
  /**
   * JavaScript source text that can contain further module requests.
   *
   * JSON and Wasm data modules omit this value because they cannot add static
   * filesystem dependencies to the configuration watch set.
   */
  content?: string;
}
