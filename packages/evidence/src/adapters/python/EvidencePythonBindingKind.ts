/**
 * Identifies the static form by which a name enters a Python module namespace.
 *
 * EvidencePythonExportResolver uses the form to decide whether it can publish a
 * local root or must follow a named, namespace, or star import within the
 * snapshot.
 *
 * @evidence contracts/common.md#principled-implementation Four literals name how a name enters a module: local definition, named import, namespace import, or star import.
 * @evidence contracts/common.md#clear-and-simple-design The resolver decides from the kind whether to publish a local root or follow an import.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language form outside the documented set is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidencePythonBindingKind =
  "local" | "named" | "namespace" | "star";
