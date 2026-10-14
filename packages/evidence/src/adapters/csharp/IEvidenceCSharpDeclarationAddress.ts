/**
 * Describes one public-address candidate for a C# declaration.
 *
 * The scanner derives candidates from namespace, type, and member containment,
 * including aliases introduced by C# syntax. `EvidenceCSharpAdapter` uses their
 * canonical and alias-prefix provenance when publishing public addresses,
 * preserving the declaration's semantic identity independently from its
 * accessible spellings.
 *
 * @evidence contracts/common.md#principled-implementation An address candidate keeps its segments with canonical or alias-prefix provenance so publication can choose accessible spellings.
 * @evidence contracts/common.md#clear-and-simple-design The scanner derives candidates; the adapter publishes them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCSharpDeclarationAddress {
  /**
   * Segmented public accessor for this declaration spelling.
   *
   * Segments avoid treating literal dots in names as containment.
   */
  segments: string[];

  /**
   * Whether this spelling is the declaration family's ordinary address.
   *
   * Alias candidates are suppressed when a canonical owner is present.
   */
  canonical: boolean;

  /**
   * Alias paths that must remain unoccupied before this address is published.
   *
   * This protects ownership when source aliases shadow an ordinary declaration.
   */
  aliasPrefixes: string[][];
}
