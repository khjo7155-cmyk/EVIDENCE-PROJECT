import { EvidenceMysqlFileScanner } from "./EvidenceMysqlFileScanner";
import { EvidenceSqlInventoryMaterializer } from "../sql/EvidenceSqlInventoryMaterializer";
import type { IEvidenceAdapter } from "../../structures/IEvidenceAdapter";
import type { IEvidenceInventory } from "../../structures/IEvidenceInventory";
import type { IEvidenceSourceSnapshot } from "../../structures/IEvidenceSourceSnapshot";

const EVID_MYSQL_TYPE = "mysql" as const;

/**
 * Extracts explicitly configured MySQL schema declarations with static
 * ownership.
 *
 * EvidenceMysqlFileScanner supplies MySQL identifier, table, and member records
 * to the common SQL materializer. Schema meaning comes from selected source
 * statements; the adapter neither connects to a server nor executes
 * migrations.
 *
 * @evidence contracts/common.md#principled-implementation The adapter configures the shared SQL materializer with the MySQL grammar, scanner and policy and COMMENT-string hosts.
 * @evidence contracts/common.md#clear-and-simple-design Dialect rules live in the scanner and policy; parser lifetime, grouping, addresses and documentation live in EvidenceSqlInventoryMaterializer.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Selected .sql files are always read as MySQL; no dialect probing can change the population, and no database is contacted or SQL executed.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains the division of work; both members are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The adapter adds no algorithm beyond its materializer configuration.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Reuse is handled by the shared materializer's single parser per analysis.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The adapter holds only its configured materializer.
 */
export class EvidenceMysqlAdapter implements IEvidenceAdapter<"mysql"> {
  /**
   * MySQL grammar selected for this adapter.
   *
   * This identity prevents a shared `.sql` extension from changing the
   * declaration surface through dialect probing.
   */
  public get type(): "mysql" {
    return "mysql";
  }

  /**
   * Materializes MySQL scanner records into graph-facing inventory records.
   *
   * The scanner owns MySQL syntax while this collaborator owns parser lifetime
   * and syntax-independent SQL publication.
   */
  private readonly materializer: EvidenceSqlInventoryMaterializer =
    new EvidenceSqlInventoryMaterializer({
      type: EVID_MYSQL_TYPE,
      scan: EvidenceMysqlFileScanner.scan,
    });

  /**
   * Extracts MySQL declarations from one captured source snapshot.
   *
   * The adapter fixes dialect policy before analysis; parser allocation waits
   * until this method receives a snapshot.
   *
   * @evidence contracts/common.md#principled-implementation Analyze passes the snapshot to the MySQL-configured materializer.
   * @evidence contracts/common.md#clear-and-simple-design Analyze only delegates.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Discovery and syntax failures stay in the returned inventory as incompleteness.
   * @evidence contracts/common.md#meaningful-documentation The comment states the delegation and failure retention.
   * @evidence contracts/performance.md#efficient-algorithms Linear in selected schema size: one parse per file.
   * @evidence contracts/performance.md#reuse-equivalent-work One parser pool serves every file in the call.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The materializer closes its parser before returning; the inventory is owned by the caller.
   */
  public analyze(
    snapshot: IEvidenceSourceSnapshot,
  ): Promise<IEvidenceInventory> {
    return this.materializer.analyze(snapshot);
  }
}
