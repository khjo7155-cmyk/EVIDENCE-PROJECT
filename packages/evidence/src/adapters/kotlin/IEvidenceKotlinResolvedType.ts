/**
 * Describes a statically resolved Kotlin nominal receiver.
 *
 * EvidenceKotlinReceivers produces this result after lexical lookup and
 * supported type alias expansion, then uses it to place extension declarations
 * beneath their effective receiver address.
 *
 * @evidence contracts/common.md#principled-implementation A resolved receiver records the nominal declaration an extension belongs to after alias expansion.
 * @evidence contracts/common.md#clear-and-simple-design Receiver resolution produces it to place extensions under their receiver address.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceKotlinResolvedType {
  /**
   * Gives canonical package and declared-owner segments for the receiver.
   *
   * These segments become the receiver spelling in an extension identity and
   * preserve declaration ownership rather than the import used to reach it.
   */
  segments: string[];

  /**
   * Indicates whether the effective receiver permits null.
   *
   * EvidenceKotlinReceivers preserves a nullable suffix from the source
   * reference or from any selected alias expansion when constructing the
   * extension address.
   */
  nullable: boolean;
}
