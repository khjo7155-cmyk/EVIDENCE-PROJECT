/**
 * Database declaration kinds shared by Prisma, SQL, and DBML.
 *
 * - "model": a named record structure, such as a Prisma model, table, or view.
 * - "column": a data field belonging to a model.
 *
 *   - Includes scalar fields and foreign-key values such as `authorId`.
 *   - Excludes the relation declaration that describes the connection.
 * - "relation": a declaration connecting models, including self-references.
 *
 *   - Includes Prisma relation fields, SQL foreign-key constraints, and DBML refs.
 *   - Includes both Prisma relation fields, even when one omits `@relation`.
 *   - Means a relationship, not the SQL use of "relation" for a table.
 *
 * Models contain their columns and relations. A model target covers its
 * selected descendants even when the model itself is not selected. Each adapter
 * retains its own declaration units; Prisma's two relation fields need not
 * correspond to two SQL foreign-key constraints.
 *
 * Prisma targets use `prisma:Model` and `prisma:Model.field`, without a file
 * path. Model names are unique across the schema; moving declarations between
 * its files preserves their targets. Models and views share the "model" kind.
 * Enums, composite types, indexes, and datasource/generator settings are
 * outside the Prisma selection contract.
 *
 * @evidence contracts/common.md#principled-implementation Three shared kinds abstract tables, models, fields and foreign keys across Prisma, SQL dialects and DBML so one selector works for every database adapter.
 * @evidence contracts/common.md#clear-and-simple-design Dialect differences stay in each adapter's extraction; this alias only names the common classification.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No dialect is special-cased; Prisma's paired relation fields are documented as adapter-owned rather than forced to match SQL constraints.
 * @evidence contracts/common.md#meaningful-documentation The comment lists what each kind includes and excludes, the containment rule, and the Prisma target and selection boundary.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceDatabaseSymbol = "model" | "column" | "relation";
