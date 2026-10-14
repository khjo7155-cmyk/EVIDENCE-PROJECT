/**
 * Remembered content digest of one watched file and the metadata it was read
 * under.
 *
 * Watch polling reuses the digest only while the metadata is unchanged and the
 * file's modification time is safely older than the moment the digest was
 * taken, so a same-size edit hidden by coarse filesystem timestamps is still
 * read again.
 *
 * @evidence contracts/common.md#principled-implementation Metadata, digest and the read time together implement the racy-clean rule git uses for its index: a digest is trusted only when no edit could share the recorded metadata.
 * @evidence contracts/common.md#clear-and-simple-design The record only carries the three values reuse needs; the reuse decision lives in EvidenceWatchDependencySnapshot.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Metadata alone is never trusted; recently modified files are always rehashed.
 * @evidence contracts/common.md#meaningful-documentation The comment explains when a remembered digest may be reused; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceWatchContentDigest {
  /**
   * Serialized mode, size, modification and change times, device and inode.
   *
   * Any difference from the current metadata forces a fresh read.
   */
  metadata: string;

  /**
   * Modification time of the file when its content was hashed, in nanoseconds.
   *
   * Compared with `readAt` to decide whether the digest is racy.
   */
  modifiedAt: bigint;

  /**
   * Wall-clock time at which the content was read, in nanoseconds.
   *
   * A digest is reusable only when `modifiedAt` is older than this by more than
   * the coarsest supported timestamp granularity.
   */
  readAt: bigint;

  /** Lowercase hexadecimal SHA-256 of the file content. */
  digest: string;
}
