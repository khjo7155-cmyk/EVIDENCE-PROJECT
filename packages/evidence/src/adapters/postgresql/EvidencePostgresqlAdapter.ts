import { EvidenceSqlInventoryMaterializer } from "../sql/EvidenceSqlInventoryMaterializer";
import { EvidencePostgresqlFileScanner } from "./EvidencePostgresqlFileScanner";
import { EvidencePostgresqlOwnership } from "./EvidencePostgresqlOwnership";
import { EvidencePostgresqlFingerprint } from "./EvidencePostgresqlFingerprint";
import type { IEvidenceAdapter } from "../../structures/IEvidenceAdapter";
import type { IEvidenceInventory } from "../../structures/IEvidenceInventory";
import type { IEvidenceSourceSnapshot } from "../../structures/IEvidenceSourceSnapshot";

const EVID_POSTGRESQL_TYPE = "postgresql" as const;

/**
 * Extracts PostgreSQL table schemas with cross-file DDL and COMMENT ownership.
 *
 * PostgreSQL scanning and ownership resolution feed the shared SQL inventory
 * materializer. A final fingerprint pass preserves review content semantics
 * when annotation-only COMMENT statements add eligible documentation
 * positions.
 *
 * @evidence contracts/common.md#principled-implementation The adapter configures the shared SQL materializer with the PostgreSQL grammar, scanner and policy, cross-file ALTER and COMMENT ownership, and a fingerprint pass that excludes COMMENT metadata.
 * @evidence contracts/common.md#clear-and-simple-design Dialect rules live in the scanner and policy; parser lifetime, grouping, addresses and documentation live in EvidenceSqlInventoryMaterializer.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Selected .sql files are always read as PostgreSQL; no dialect probing can change the population, and no database is contacted or SQL executed.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains the division of work; both members are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The adapter adds no algorithm beyond its materializer configuration.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Reuse is handled by the shared materializer's single parser per analysis.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The adapter holds only its configured materializer.
 */
export class EvidencePostgresqlAdapter implements IEvidenceAdapter<"postgresql"> {
  /**
   * PostgreSQL grammar selected for this adapter.
   *
   * The explicit dialect keeps PostgreSQL DDL and COMMENT semantics stable for
   * source files that share the `.sql` extension with other databases.
   */
  public get type(): "postgresql" {
    return "postgresql";
  }

  /**
   * Materializes PostgreSQL scanner records before fingerprint adjustment.
   *
   * PostgreSQL scanning and ownership stay owned by this adapter's policy;
   * shared parser lifetime and syntax-independent publication stay separate.
   */
  private readonly materializer: EvidenceSqlInventoryMaterializer =
    new EvidenceSqlInventoryMaterializer({
      type: EVID_POSTGRESQL_TYPE,
      scan: (session, source) =>
        new EvidencePostgresqlFileScanner(session, source).scan(),
      resolve: EvidencePostgresqlOwnership.resolve,
    });

  /**
   * Extracts PostgreSQL declarations and applies COMMENT fingerprint policy.
   *
   * Annotation-only COMMENT additions remain eligible hosts while the
   * fingerprint layer avoids making review metadata invalidate the declaration
   * it reviews.
   *
   * @evidence contracts/common.md#principled-implementation Analyze passes the snapshot to the PostgreSQL-configured materializer and recomputes content digests without COMMENT sites.
   * @evidence contracts/common.md#clear-and-simple-design Analyze only delegates.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Discovery and syntax failures stay in the returned inventory as incompleteness.
   * @evidence contracts/common.md#meaningful-documentation The comment states the delegation and failure retention.
   * @evidence contracts/performance.md#efficient-algorithms Linear in selected schema size plus one fingerprint pass.
   * @evidence contracts/performance.md#reuse-equivalent-work One parser pool serves every file in the call.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The materializer closes its parser; the inventory is owned by the caller.
   */
  public async analyze(
    snapshot: IEvidenceSourceSnapshot,
  ): Promise<IEvidenceInventory> {
    const inventory: IEvidenceInventory =
      await this.materializer.analyze(snapshot);
    EvidencePostgresqlFingerprint.apply(inventory);
    return inventory;
  }
}
