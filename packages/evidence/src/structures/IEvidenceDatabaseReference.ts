import type { EvidenceDatabaseSymbol } from "../typings/EvidenceDatabaseSymbol";
import type { EvidenceDatabaseType } from "../typings/EvidenceDatabaseType";
import type { IEvidenceReferenceBase } from "./IEvidenceReferenceBase";

/**
 * Database schema units required by the owning claim's reference policy.
 *
 * Model, column, and relation selectors choose the coverage denominator after
 * schema extraction. Parent scopes remain available to resolve aggregate
 * targets, while each reference entry evaluates its selected schema
 * independently.
 *
 * @evidence contracts/common.md#principled-implementation Specializing the reference base with database types and adding schema files lets each reference select its denominator after extraction.
 * @evidence contracts/common.md#clear-and-simple-design Only the files field is added; policy fields come from the base.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Parsing failures must not yield empty populations.
 * @evidence contracts/common.md#meaningful-documentation The comment explains selection and aggregate scopes; the files field documents Prisma schema grouping.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDatabaseReference extends IEvidenceReferenceBase<
  EvidenceDatabaseType,
  EvidenceDatabaseSymbol
> {
  /**
   * Schema-file globs relative to the reference root.
   *
   * These use claim glob rules. Prisma files form one schema regardless of
   * extension; repeated physical files are parsed once. Parsing failures must
   * not produce empty populations.
   */
  files: string[];
}
