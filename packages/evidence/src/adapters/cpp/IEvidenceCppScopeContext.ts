import type { EvidenceCppScopeKind } from "./EvidenceCppScopeKind";

/**
 * Carries the enclosing C++ structural scope while `EvidenceCppFileScanner`
 * descends through declarations.
 *
 * The scanner derives child identities, public addresses, and visibility from
 * this context. It represents a source-level namespace, record, or enum owner
 * rather than a fully materialized Evidence unit.
 *
 * @evidence contracts/common.md#principled-implementation The enclosing namespace, record or enum supplies child identities, addresses and whether its contents can be public.
 * @evidence contracts/common.md#clear-and-simple-design The scanner threads the context through scopes.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceCppScopeContext {
  /**
   * Scanner-local declaration record for this scope when it materializes a
   * declaration.
   *
   * Omission denotes a namespace scope, which contributes paths and visibility
   * but has no declaration record of its own.
   */
  declarationId?: string;

  /**
   * Semantic path used to identify child declarations beneath this owner.
   *
   * The scanner prefixes unqualified child names with this path and uses it to
   * resolve qualified definitions relative to a record or namespace.
   */
  identity: string[];

  /**
   * Public accessor path available through this owner.
   *
   * Child declarations inherit this path when the scope is public; it remains
   * distinct from `identity` because aliases can change public spelling.
   */
  address: string[];

  /**
   * Source construct that establishes this scope.
   *
   * The scanner uses the kind to apply C++ ownership rules, including namespace
   * qualification and record member visibility.
   */
  kind: EvidenceCppScopeKind;

  /**
   * Unqualified source spelling of the scope owner.
   *
   * It supports diagnostics and declaration construction while `identity`
   * retains the complete enclosing path.
   */
  name: string;

  /**
   * Whether declarations directly contained by this scope can be publicly
   * published.
   *
   * The scanner combines this inherited boundary with member access before
   * emitting a declaration's visibility.
   */
  public: boolean;
}
