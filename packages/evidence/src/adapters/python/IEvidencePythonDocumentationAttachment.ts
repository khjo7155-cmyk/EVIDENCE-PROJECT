/**
 * Connects one parsed Python documentation region to a declaration position.
 *
 * Scanning retains this compact relationship after its Tree-sitter session
 * closes. EvidencePythonAdapter later filters it by public reachability before
 * creating evidence hosts, so a private declaration's docstring cannot document
 * an exported unit by accident.
 *
 * @evidence contracts/common.md#principled-implementation An attachment links one documentation region to a declaration position, filtered later by reachability.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records it; the adapter filters it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePythonDocumentationAttachment {
  /**
   * Scanner-local identity of the declaration position that owns this text.
   *
   * Hosts use the same identity to avoid publishing a second undocumented host
   * for a declaration that already has an attached docstring or comment run.
   */
  positionId: string;

  /**
   * Stable declaration-site identity shared by every unit at this position.
   *
   * A property getter and setter may have distinct units but one source site;
   * the host records that common site once.
   */
  siteId: string;

  /**
   * Candidate unit receiving directives parsed from this documentation.
   *
   * The adapter discards this attachment unless export resolution publishes the
   * unit, preserving Python's public-surface boundary.
   */
  unitId: string;
}
