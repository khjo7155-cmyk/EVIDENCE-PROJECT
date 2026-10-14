/**
 * Package metadata consulted when JavaScript files lack an explicit mode
 * extension.
 *
 * `EvidenceEcmaScriptModuleResolver` parses the nearest `package.json` and uses
 * this narrow contract to select CommonJS or ESM semantics for ordinary
 * JavaScript source files.
 *
 * @evidence contracts/common.md#principled-implementation Only the package type field decides whether .js and .jsx files use ESM or CommonJS.
 * @evidence contracts/common.md#clear-and-simple-design The module resolver parses manifests into this narrow shape.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceJavaScriptPackageJson {
  /**
   * Package-wide JavaScript module interpretation requested by the author.
   *
   * Omission and `"commonjs"` select CommonJS, `"module"` selects ESM, and any
   * other value produces a diagnostic before the resolver falls back to
   * CommonJS.
   */
  type?: string;
}
