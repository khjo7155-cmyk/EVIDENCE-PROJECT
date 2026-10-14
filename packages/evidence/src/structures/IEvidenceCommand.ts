import type { IEvidenceCheckCommand } from "./IEvidenceCheckCommand";
import type { IEvidenceGraphCommand } from "./IEvidenceGraphCommand";
import type { IEvidenceHelpCommand } from "./IEvidenceHelpCommand";
import type { IEvidenceInspectCommand } from "./IEvidenceInspectCommand";
import type { IEvidenceInitCommand } from "./IEvidenceInitCommand";
import type { IEvidenceLanguagesCommand } from "./IEvidenceLanguagesCommand";
import type { IEvidenceListCommand } from "./IEvidenceListCommand";
import type { IEvidenceVersionCommand } from "./IEvidenceVersionCommand";

/**
 * Validated operation selected from the complete CLI argument list.
 *
 * Parsing rejects unknown, repeated, or incompatible options before producing
 * this discriminated union. Execution dispatches on operation without
 * reinterpreting raw tokens or allowing trailing input to escape validation.
 *
 * @evidence contracts/common.md#principled-implementation A discriminated union of validated commands lets execution dispatch on operation without reinterpreting raw tokens.
 * @evidence contracts/common.md#clear-and-simple-design Each command interface owns its options; the union only enumerates operations.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unknown, repeated or incompatible options are rejected before a member is produced.
 * @evidence contracts/common.md#meaningful-documentation The comment explains validation before construction and dispatch after it.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type IEvidenceCommand =
  | IEvidenceCheckCommand
  | IEvidenceGraphCommand
  | IEvidenceHelpCommand
  | IEvidenceInspectCommand
  | IEvidenceInitCommand
  | IEvidenceLanguagesCommand
  | IEvidenceListCommand
  | IEvidenceVersionCommand;
