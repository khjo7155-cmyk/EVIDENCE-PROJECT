/**
 * Report encodings supported by the check command.
 *
 * `text` is the diagnostic-oriented terminal presentation. `json` preserves the
 * report structure for automation, including fields a human formatter may omit
 * or rearrange.
 *
 * @evidence contracts/common.md#principled-implementation The check command's two encodings, terminal text and structured JSON, are the only formats its reporter renders.
 * @evidence contracts/common.md#clear-and-simple-design Rendering stays in EvidenceReporter; the alias only constrains the option.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No consumer-specific format is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the purpose of each encoding and that JSON keeps fields text may omit.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceReportFormat = "text" | "json";
