/**
 * Static export spellings understood by the ECMAScript module resolver.
 *
 * The scanner assigns one of these forms to every supported export edge so the
 * resolver can distinguish local bindings, named re-exports, namespaces, and
 * stars.
 *
 * @evidence contracts/common.md#principled-implementation The literals name each supported static export spelling, so the resolver can treat local bindings, named re-exports, namespaces and stars differently.
 * @evidence contracts/common.md#clear-and-simple-design The scanner assigns a kind; the resolver interprets it.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported export forms have no kind and are reported instead.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how kinds guide resolution.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceEcmaScriptExportKind =
  "local" | "named" | "namespace" | "star";
