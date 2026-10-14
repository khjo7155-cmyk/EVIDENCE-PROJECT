/**
 * Database schema languages and SQL dialects supported by database adapters.
 *
 * This value selects a parser and adapter contract rather than inferring a
 * dialect from a file extension. `sql` represents the generic SQL grammar;
 * dialect-specific values retain syntax and target rules that differ from it.
 *
 * @evidence contracts/common.md#principled-implementation Explicit dialect literals select parser and adapter contracts instead of guessing a dialect from a shared extension such as .sql.
 * @evidence contracts/common.md#clear-and-simple-design The alias only enumerates dialects; grammar mapping lives in EvidenceLanguageRegistry.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No extension heuristic or consumer-specific dialect is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why the value is declared rather than inferred and how generic sql relates to the dialects.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceDatabaseType =
  "prisma" | "sql" | "postgresql" | "mysql" | "sqlite" | "bigquery" | "dbml";
