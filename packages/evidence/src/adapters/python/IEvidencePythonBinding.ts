import type { EvidencePythonBindingKind } from "./EvidencePythonBindingKind";

/**
 * Describes one source-ordered module binding used for static export
 * resolution.
 *
 * The resolver selects the latest compatible binding for a name and follows
 * imports without executing Python. Unsupported or ambiguous paths become
 * diagnostics rather than silently reducing the public population.
 *
 * @evidence contracts/common.md#principled-implementation A source-ordered binding records how a name entered the module (local, named import, namespace import, star) and its target.
 * @evidence contracts/common.md#clear-and-simple-design The scanner records bindings; the resolver follows them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePythonBinding {
  /**
   * Binding form that determines how the resolver follows this entry.
   *
   * Local bindings point at scanned declaration roots; import forms require a
   * source-snapshot module target.
   */
  kind: EvidencePythonBindingKind;

  /**
   * Source-order key for Python's later-binding-wins behavior.
   *
   * It is derived from the statement position with a local tie-breaker for
   * entries in the same import statement.
   */
  order: number;

  /**
   * Name introduced in the containing module namespace.
   *
   * Omission represents an unusable or incomplete binding and prevents it from
   * being selected as a public export.
   */
  localName?: string;

  /**
   * Declaration root selected by a local binding.
   *
   * Imports omit this field because their target must be resolved against
   * another module before a declaration can be materialized.
   */
  root?: string;

  /**
   * Name requested from an imported module by a named import.
   *
   * Namespace and star imports omit it: their member name comes from the
   * subsequent attribute lookup or the requesting public name.
   */
  importedName?: string;

  /**
   * Static absolute or relative module spelling from the import statement.
   *
   * Omission keeps an incomplete binding from resolving outside the scanned
   * source snapshot.
   */
  specifier?: string;
}
