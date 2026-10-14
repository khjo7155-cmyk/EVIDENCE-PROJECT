import { EvidenceSqlInventoryMaterializer } from "./EvidenceSqlInventoryMaterializer";
import { EvidenceSqlFileScanner } from "./EvidenceSqlFileScanner";
import type { IEvidenceAdapter } from "../../structures/IEvidenceAdapter";
import type { IEvidenceInventory } from "../../structures/IEvidenceInventory";
import type { IEvidenceSourceSnapshot } from "../../structures/IEvidenceSourceSnapshot";

const EVID_SQL_TYPE = "sql" as const;

/**
 * Extracts the explicitly configured portable SQL CREATE TABLE surface.
 *
 * This entry fixes interpretation to the portable grammar; shared `.sql` files
 * never trigger dialect probing that could change the selected population.
 *
 * @evidence contracts/common.md#principled-implementation The adapter configures the shared SQL materializer with the portable SQL grammar, scanner and policy.
 * @evidence contracts/common.md#clear-and-simple-design Dialect rules live in the scanner and policy; parser lifetime, grouping, addresses and documentation live in EvidenceSqlInventoryMaterializer.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Selected .sql files are always read as portable SQL; no dialect probing can change the population, and no database is contacted or SQL executed.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains the division of work; both members are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The adapter adds no algorithm beyond its materializer configuration.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Reuse is handled by the shared materializer's single parser per analysis.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The adapter holds only its configured materializer.
 */
export class EvidenceSqlAdapter implements IEvidenceAdapter<"sql"> {
  /**
   * Portable SQL grammar selected for this adapter.
   *
   * This fixed identity prevents a shared `.sql` suffix from implicitly
   * selecting a dialect with a different declaration population.
   */
  public get type(): "sql" {
    return "sql";
  }

  /**
   * Materializes scanner records into the public SQL inventory.
   *
   * The adapter owns portable SQL policy; the materializer owns only the parser
   * lifetime and syntax-independent inventory publication.
   */
  private readonly materializer: EvidenceSqlInventoryMaterializer =
    new EvidenceSqlInventoryMaterializer({ type: EVID_SQL_TYPE, scan });

  /**
   * Extracts portable SQL declarations from one captured source snapshot.
   *
   * No dialect probing occurs: the fixed portable scanner remains responsible
   * for syntax interpretation while the shared materializer publishes records.
   *
   * @evidence contracts/common.md#principled-implementation Analyze passes the snapshot to the portable SQL-configured materializer.
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

/**
 * Copies portable declarations while the parser session is borrowed.
 *
 * The scanner returns node-free records so no native Tree-sitter value escapes
 * the callback that owns the parse session.
 */
function scan(
  ...args: ConstructorParameters<typeof EvidenceSqlFileScanner>
): ReturnType<EvidenceSqlFileScanner["scan"]> {
  return new EvidenceSqlFileScanner(...args).scan();
}
