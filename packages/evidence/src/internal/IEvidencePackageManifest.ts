/**
 * Installed evidence package manifest fields required by the version command.
 *
 * `EvidenceCommand` validates this narrow projection before reporting its own
 * package version, keeping malformed installed metadata an actionable command
 * failure instead of loading project configuration.
 *
 * @evidence contracts/common.md#principled-implementation The version command needs only the manifest's version string.
 * @evidence contracts/common.md#clear-and-simple-design Only the consumed field is modeled.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The version comes from the installed manifest, not a hardcoded constant.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the use; the field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePackageManifest {
  /**
   * Published package version presented by the command.
   *
   * This value comes from the installed package manifest and is returned as the
   * version command's output rather than being derived from the running
   * project.
   */
  version: string;
}
