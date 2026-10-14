/**
 * Represents a grammar-derived C++ qualified name in the scanner's normalized
 * form.
 *
 * `EvidenceCppSyntax.qualifiedName` produces this value for declarations and
 * aliases. `EvidenceCppFileScanner` consumes its segments as semantic paths and
 * rejects specialized names that cannot safely share the primary template's
 * public accessor.
 *
 * @evidence contracts/common.md#principled-implementation A qualified name keeps normalized segments and whether the spelling is a specialization.
 * @evidence contracts/common.md#clear-and-simple-design Syntax helpers produce it; the scanner rejects specializations.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCppQualifiedName {
  /**
   * Ordered semantic name segments decoded from the supported grammar node.
   *
   * Consumers preserve these boundaries when building declaration identities
   * and alias targets. Template segments include their parameter arity with a
   * backtick suffix, such as `Vector\`1`.
   */
  segments: string[];

  /**
   * Whether the parsed spelling names a template specialization rather than a
   * reusable primary-template path.
   *
   * The scanner propagates this flag through declarators and aliases, then
   * reports the unsupported spelling instead of assigning it the primary
   * template's common accessor.
   */
  specialized: boolean;
}
