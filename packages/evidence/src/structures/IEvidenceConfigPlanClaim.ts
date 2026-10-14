import type { EvidenceActiveSeverity } from "../typings/EvidenceActiveSeverity";
import type { EvidenceSymbol } from "../typings/EvidenceSymbol";
import type { IEvidenceClaim } from "./IEvidenceClaim";
import type { IEvidenceConfigPlanReference } from "./IEvidenceConfigPlanReference";

/**
 * One enabled claim with resolved host selectors and reference policies.
 *
 * Planning preserves the authored population for paths and artifact-specific
 * settings while recording effective severity and symbol choices separately.
 * Materialization can therefore select hosts without repeating configuration
 * inheritance or losing the original declaration used in diagnostics.
 *
 * @evidence contracts/common.md#principled-implementation Keeping the authored population beside effective severity and symbols records inheritance once without rewriting user intent.
 * @evidence contracts/common.md#clear-and-simple-design Effective settings and the authored declaration are separate fields, and references carry their own plans.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Defaults are not written back into the authored claim.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why both forms are kept; each field documents its meaning.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceConfigPlanClaim {
  /**
   * Zero-based position in the authored claim array.
   *
   * This survives inactive-claim filtering so a finding still identifies the
   * declaration the user wrote rather than its position in the filtered plan.
   */
  index: number;

  /**
   * Validated claim retaining authored paths and optional settings.
   *
   * Effective severity and selector defaults are stored separately. Keeping
   * this declaration intact avoids replacing user intent with normalized
   * defaults.
   */
  population: IEvidenceClaim;

  /**
   * Effective diagnostic severity after claim inheritance.
   *
   * This is always active because off claims have already been filtered. It
   * becomes the inherited default for this claim's reference plans.
   */
  severity: EvidenceActiveSeverity;

  /**
   * Explicit or default symbol kinds eligible to host this claim's evidence.
   *
   * These are host selectors. Each reference has its own selector list for the
   * target units that those hosts must acknowledge.
   */
  symbols: EvidenceSymbol[];

  /**
   * Enabled references that independently require evidence from this claim.
   *
   * Each retains its authored index and effective settings. Identical
   * selections remain separate obligations and may apply different exclusion or
   * review rules.
   */
  references: IEvidenceConfigPlanReference[];
}
