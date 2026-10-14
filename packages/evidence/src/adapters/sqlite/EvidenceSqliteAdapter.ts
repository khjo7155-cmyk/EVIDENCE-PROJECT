import { EvidenceSqlInventoryMaterializer } from "../sql/EvidenceSqlInventoryMaterializer";
import { EvidenceSqliteFileScanner } from "./EvidenceSqliteFileScanner";
import type { IEvidenceAdapter } from "../../structures/IEvidenceAdapter";
import type { IEvidenceInventory } from "../../structures/IEvidenceInventory";
import type { IEvidenceSourceSnapshot } from "../../structures/IEvidenceSourceSnapshot";

const EVID_SQLITE_TYPE = "sqlite" as const;

/**
 * Extracts SQLite's explicitly declared tables, columns, and foreign keys.
 *
 * SQLiteFileScanner supplies dialect-specific ownership and identifier rules to
 * the shared SQL materializer. Analysis uses captured DDL source and does not
 * open a database or infer schema by executing statements.
 *
 * @evidence contracts/common.md#principled-implementation The adapter configures the shared SQL materializer with the SQLite grammar, scanner and policy.
 * @evidence contracts/common.md#clear-and-simple-design Dialect rules live in the scanner and policy; parser lifetime, grouping, addresses and documentation live in EvidenceSqlInventoryMaterializer.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Selected .sql files are always read as SQLite; no dialect probing can change the population, and no database is contacted or SQL executed.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains the division of work; both members are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The adapter adds no algorithm beyond its materializer configuration.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Reuse is handled by the shared materializer's single parser per analysis.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The adapter holds only its configured materializer.
 */
export class EvidenceSqliteAdapter implements IEvidenceAdapter<"sqlite"> {
  /**
   * SQLite grammar selected for this adapter.
   *
   * The explicit dialect keeps SQLite's ownership and identifier rules stable
   * for source files with a shared `.sql` extension.
   */
  public get type(): "sqlite" {
    return "sqlite";
  }

  /**
   * Materializes SQLite scanner records into graph-facing inventory records.
   *
   * SQLite syntax stays with the scanner; this collaborator owns only parser
   * lifetime and syntax-independent SQL record publication.
   */
  private readonly materializer: EvidenceSqlInventoryMaterializer =
    new EvidenceSqlInventoryMaterializer({
      type: EVID_SQLITE_TYPE,
      scan: (session, source) =>
        new EvidenceSqliteFileScanner(session, source).scan(),
    });

  /**
   * Extracts SQLite declarations from one captured source snapshot.
   *
   * Parser allocation and source analysis wait until this method receives the
   * snapshot.
   *
   * @evidence contracts/common.md#principled-implementation Analyze passes the snapshot to the SQLite-configured materializer.
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
