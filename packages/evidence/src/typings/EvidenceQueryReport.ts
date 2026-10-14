import type { IEvidenceInspectReport } from "../structures/IEvidenceInspectReport";
import type { IEvidenceLanguagesReport } from "../structures/IEvidenceLanguagesReport";
import type { IEvidenceListReport } from "../structures/IEvidenceListReport";

/**
 * Structured result returned by an inspection-oriented command.
 *
 * Query commands share output rendering but answer different questions: listing
 * discovered units, inspecting a target, or reporting available languages. This
 * union keeps the renderer generic while each command preserves its own
 * schema.
 *
 * @evidence contracts/common.md#principled-implementation A union of the three query report shapes lets one renderer accept every inspection command while each keeps its own schema.
 * @evidence contracts/common.md#clear-and-simple-design Each report interface owns its fields; the alias adds no shared base that would blur their schemas.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No report is special-cased for a consumer.
 * @evidence contracts/common.md#meaningful-documentation The comment names the three questions the union answers and why it stays a union.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceQueryReport =
  IEvidenceInspectReport | IEvidenceLanguagesReport | IEvidenceListReport;
