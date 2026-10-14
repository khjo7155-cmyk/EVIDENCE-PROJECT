import type { EvidenceEcmaScriptExportKind } from "./EvidenceEcmaScriptExportKind";

/**
 * Describes one static export edge discovered in an ECMAScript-family module.
 *
 * The export resolver follows these edges through the source snapshot to expose
 * local units under their public module names and diagnose unsupported
 * targets.
 *
 * @evidence contracts/common.md#principled-implementation An export edge records kind, exported name, local name and optional module specifier for one static export statement.
 * @evidence contracts/common.md#clear-and-simple-design The scanner produces edges; the export resolver interprets them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are filled from parsed syntax; no project, package or fixture value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceEcmaScriptExport {
  /**
   * Export form that determines how the resolver follows this edge.
   *
   * The kind distinguishes local declarations from named, namespace, and star
   * re-exports, whose optional names and specifier have different meanings.
   */
  kind: EvidenceEcmaScriptExportKind;

  /**
   * Name introduced by this module's public export surface.
   *
   * Omission is valid for star exports, which contribute each eligible public
   * name from the referenced module except its default export.
   */
  publicName?: string;

  /**
   * Local binding name exported directly from this module.
   *
   * It is present for local export edges and lets the resolver distinguish a
   * declared root from an imported binding that must be followed further.
   */
  localName?: string;

  /**
   * Name requested from the referenced module by a named re-export.
   *
   * Omission means this edge does not select one imported member, as with
   * local, namespace, and star export forms.
   */
  importedName?: string;

  /**
   * Raw module specifier naming the re-export target.
   *
   * Omission means the exported binding is local; when present, resolution is
   * limited to supported files inside the declared source snapshot.
   */
  specifier?: string;

  /**
   * Whether this edge exports only TypeScript type-space declarations.
   *
   * The resolver combines this flag with every edge it traverses so value-only
   * units cannot appear through a type-only public address.
   */
  typeOnly: boolean;
}
