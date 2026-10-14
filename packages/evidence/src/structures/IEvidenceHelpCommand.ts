/**
 * Parsed request to display command syntax and options.
 *
 * Help is resolved before configuration or project analysis. The parser refuses
 * combining the help flag with other options instead of silently ignoring
 * them.
 *
 * @evidence contracts/common.md#principled-implementation Help needs no options, so the command is only its discriminator.
 * @evidence contracts/common.md#clear-and-simple-design The record joins the command union; help text lives in the command module.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No hidden options are accepted.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the request; the discriminator is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceHelpCommand {
  /**
   * Discriminator selecting the built-in help text.
   *
   * No filesystem or configuration context is needed to render this request.
   */
  operation: "help";
}
