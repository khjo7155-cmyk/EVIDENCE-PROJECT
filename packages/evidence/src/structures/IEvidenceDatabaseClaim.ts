import type { EvidenceDatabaseSymbol } from "../typings/EvidenceDatabaseSymbol";
import type { EvidenceDatabaseType } from "../typings/EvidenceDatabaseType";
import type { IEvidenceClaimBase } from "./IEvidenceClaimBase";

/**
 * Database schema declarations that cite evidence in documentation comments.
 *
 * The database adapter determines schema identity, structural relationships,
 * and eligible documentation carriers. Symbol selection then chooses which
 * models, columns, or relations owe evidence; parsing failures retain an
 * incomplete population instead of removing requirements from the check.
 *
 * Prisma host rules:
 *
 * - Matching files form one schema regardless of extension. A physical file
 *   reached by multiple populations is parsed once.
 * - Triple-slash and block documentation comments attach to the next declaration.
 *   Ordinary double-slash comments do not host tags.
 * - A blank line before a top-level block detaches the comment. Comments above
 *   block attributes or closing braces also have no declaration host.
 * - Evidence and exclusions require a target and nonempty reason. Invalid or
 *   detached declarations are reported.
 * - An unattached top-level triple-slash run may carry a file-level exclusion,
 *   independently of the symbol selector. It cannot carry ordinary evidence.
 *
 * @evidence contracts/common.md#principled-implementation Specializing the claim base with database types and symbols reuses shared selection while the adapter decides schema identity and carriers.
 * @evidence contracts/common.md#clear-and-simple-design The interface adds no fields; Prisma host rules are documented here because they govern this claim kind.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Parse failures keep an incomplete population instead of removing requirements.
 * @evidence contracts/common.md#meaningful-documentation The comment documents Prisma schema grouping, comment attachment, detachment and file-level exclusion carriers.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceDatabaseClaim extends IEvidenceClaimBase<
  EvidenceDatabaseType,
  EvidenceDatabaseSymbol
> {}
