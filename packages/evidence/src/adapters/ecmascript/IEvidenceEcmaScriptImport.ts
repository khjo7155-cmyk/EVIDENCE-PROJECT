/**
 * A static local binding imported from another ECMAScript module.
 *
 * The file scanner records only imports that an export may forward. Export
 * resolution follows this record to the imported module instead of treating the
 * local alias as a declaration owned by the importing source.
 *
 * @evidence contracts/common.md#principled-implementation An import records a local alias and its module specifier and imported name, letting export resolution forward to the imported module instead of the importer.
 * @evidence contracts/common.md#clear-and-simple-design Only imports an export may forward are recorded by the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEcmaScriptImport {
  /**
   * Local identifier introduced by the import declaration.
   *
   * A local export uses this name to find the imported binding in its module's
   * import map.
   */
  localName: string;

  /**
   * Name requested from the imported module.
   *
   * Omission identifies a namespace import, whose local binding represents the
   * entire target module rather than one exported name.
   */
  importedName?: string;

  /**
   * Authored module specifier naming the import target.
   *
   * The export resolver follows local specifiers relative to the importing
   * source. Package imports forward foreign bindings without enrolling them as
   * local declaration owners.
   */
  specifier: string;

  /**
   * Whether the binding is available only in TypeScript's type space.
   *
   * This includes a type-only import declaration or specifier and propagates to
   * public addresses reached through a forwarded export.
   */
  typeOnly: boolean;

  /**
   * Whether the local name is a namespace binding.
   *
   * Namespace exports expand the target module's public names instead of
   * resolving `importedName`.
   */
  namespace: boolean;
}
