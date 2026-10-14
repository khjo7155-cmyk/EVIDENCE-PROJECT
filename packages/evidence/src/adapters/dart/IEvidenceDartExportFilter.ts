/**
 * Represents one Dart export combinator retained from source order.
 *
 * An {@link IEvidenceDartDirective} owns these filters, and
 * EvidenceDartLibraries applies them in sequence while deciding whether each
 * exported top-level name is public.
 *
 * @evidence contracts/common.md#principled-implementation A show or hide combinator keeps its names in source order so filters apply in sequence.
 * @evidence contracts/common.md#clear-and-simple-design Directives own filters; library resolution applies them.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields hold values derived from parsed syntax; no project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDartExportFilter {
  /**
   * Selects whether this combinator keeps or removes its listed names.
   *
   * A `show` filter admits only listed candidates at its position, while a
   * `hide` filter removes listed candidates that earlier filters permitted.
   */
  kind: "show" | "hide";

  /**
   * Lists literal top-level declaration names affected by this combinator.
   *
   * The names preserve source spelling and are compared with the candidate
   * export name; they are not paths or resolved declaration identities.
   */
  names: string[];
}
