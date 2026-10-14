/**
 * Parsed standalone request for the installed package version.
 *
 * The command reads package metadata without loading project configuration.
 * Version flags cannot be combined with another operation or its options.
 *
 * @evidence contracts/common.md#principled-implementation Version needs no options, so the command is its discriminator.
 * @evidence contracts/common.md#clear-and-simple-design The record joins the command union.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No hidden options are accepted.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the request; the discriminator is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceVersionCommand {
  /**
   * Discriminator selecting installed-version output.
   *
   * Execution reports a manifest failure if package metadata cannot be read.
   */
  operation: "version";
}
