import { EvidenceBigQueryFileScanner } from "./EvidenceBigQueryFileScanner";
import { EvidenceSqlInventoryMaterializer } from "../sql/EvidenceSqlInventoryMaterializer";
import type { IEvidenceAdapter } from "../../structures/IEvidenceAdapter";
import type { IEvidenceInventory } from "../../structures/IEvidenceInventory";
import type { IEvidenceSourceSnapshot } from "../../structures/IEvidenceSourceSnapshot";

const EVID_BIGQUERY_TYPE = "bigquery" as const;

/**
 * Extracts declared GoogleSQL tables, fields, and key relations for BigQuery
 * populations.
 *
 * The BigQuery scanner applies GoogleSQL qualification and declaration rules
 * before shared SQL materialization creates public units and annotation hosts.
 * Analysis operates on source snapshots without querying a service or executing
 * SQL.
 *
 * @evidence contracts/common.md#principled-implementation The adapter configures the shared SQL materializer with the GoogleSQL (BigQuery) grammar, scanner and policy, STRUCT field nesting and OPTIONS descriptions.
 * @evidence contracts/common.md#clear-and-simple-design Dialect rules live in the scanner and policy; parser lifetime, grouping, addresses and documentation live in EvidenceSqlInventoryMaterializer.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Selected .sql files are always read as GoogleSQL (BigQuery); no dialect probing can change the population, and no database is contacted or SQL executed.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains the division of work; both members are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The adapter adds no algorithm beyond its materializer configuration.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Reuse is handled by the shared materializer's single parser per analysis.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The adapter holds only its configured materializer.
 */
export class EvidenceBigQueryAdapter implements IEvidenceAdapter<"bigquery"> {
  /**
   * GoogleSQL grammar selected for this adapter.
   *
   * The explicit discriminator preserves BigQuery's declaration semantics for
   * files that otherwise share the `.sql` extension with other dialects.
   */
  public get type(): "bigquery" {
    return EVID_BIGQUERY_TYPE;
  }

  /**
   * Materializes BigQuery scanner records into graph-facing inventory records.
   *
   * BigQuery-specific parsing remains in its scanner; this collaborator owns
   * only parser lifetime and syntax-independent SQL publication.
   */
  private readonly materializer: EvidenceSqlInventoryMaterializer =
    new EvidenceSqlInventoryMaterializer({
      type: EVID_BIGQUERY_TYPE,
      scan: (session, source) =>
        new EvidenceBigQueryFileScanner(session, source).scan(),
    });

  /**
   * Extracts BigQuery declarations from one captured source snapshot.
   *
   * The configured grammar controls interpretation even when input shares the
   * `.sql` suffix with other database families.
   *
   * @evidence contracts/common.md#principled-implementation Analyze passes the snapshot to the BigQuery-configured materializer.
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
