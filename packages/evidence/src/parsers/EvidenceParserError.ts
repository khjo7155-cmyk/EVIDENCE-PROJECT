import type { IEvidenceSourceRange } from "../structures/IEvidenceSourceRange";
import type { EvidenceParserErrorCode } from "../typings/EvidenceParserErrorCode";

/**
 * Parser failure preserving its category, affected source, and underlying
 * cause.
 *
 * Adapters translate these fields into incomplete-inventory diagnostics, and
 * watch uses acquisition categories to decide whether timed recovery is
 * appropriate. A range is available for syntax failures but may be absent
 * before source parsing begins, such as when grammar acquisition cannot
 * complete.
 *
 * @evidence contracts/common.md#principled-implementation An Error subclass with a stable code, file, optional range and cause lets adapters build incomplete-inventory diagnostics and watch classify retryable failures.
 * @evidence contracts/common.md#clear-and-simple-design The class only carries structured failure data.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Callers classify by code rather than parsing the message; ranges are omitted rather than invented when no tree exists.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains how adapters and watch use it; every constructor parameter is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms An error class chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Constructing an error computes nothing worth sharing.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The error holds only its message and cause and no external resource.
 */
export class EvidenceParserError extends Error {
  /**
   * Creates a source-qualified error without discarding the original failure
   * cause.
   *
   * The message includes the file for ordinary Error consumers; structured
   * callers can inspect the category and optional span without parsing that
   * message.
   */
  public constructor(
    /**
     * Stable parser or acquisition failure category.
     *
     * Adapters use it in diagnostic codes and watch uses it to classify
     * retryable preparation failures.
     */
    public readonly code: EvidenceParserErrorCode,

    /**
     * Source or asset identifier affected by the failed operation.
     *
     * This remains useful even when no syntax tree exists to provide a source
     * span.
     */
    public readonly file: string,

    /**
     * Human-readable explanation of the failed parser operation.
     *
     * The constructor prefixes this text with `file` for ordinary Error
     * consumers; structured consumers should use `code`, `file`, and `range`
     * for classification.
     */
    message: string,

    /**
     * Precise source span when the failure can be attributed to parsed syntax.
     *
     * Omission denotes a file- or acquisition-level failure without invented
     * coordinates.
     */
    public readonly range?: IEvidenceSourceRange,

    /**
     * Native error metadata retained as this Error's optional cause.
     *
     * Omission means the parser has no lower-level exception to preserve, such
     * as a detected incomplete syntax tree.
     */
    options?: ErrorOptions,
  ) {
    super(`${file}: ${message}`, options);
    this.name = "EvidenceParserError";
  }
}
