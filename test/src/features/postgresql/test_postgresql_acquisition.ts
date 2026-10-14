import {
  EvidencePostgresqlAdapter,
  EvidenceTreeSitterAssetScope,
  EvidenceTreeSitterAssets,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";
import { EvidenceTestParserAssets } from "../../internal/EvidenceTestParserAssets";
import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Acquires PostgreSQL's pinned parser variant and reuses it offline.
 *
 * The adapter must request only the configured grammar and preserve a complete
 * schema inventory from the warmed cache.
 *
 * 1. Analyze PostgreSQL input cold while recording grammar requests.
 * 2. Verify the requested variant and complete inventory.
 * 3. Repeat offline and require equivalent analysis.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes PostgreSQL with a cold grammar cache while recording requests, then offline, asserting the requested variant and equal inventories.
 * @evidence contracts/testing.md#independent-expectations Only the configured PostgreSQL variant may be requested; the offline inventory must equal the cold one.
 * @evidence contracts/testing.md#distinguishing-cases Covers cold acquisition and warm offline reuse.
 * @evidence contracts/testing.md#execution-ownership The exported test_postgresql_acquisition is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_postgresql_acquisition(): Promise<void> {
  const grammar = await new EvidenceTreeSitterAssets().grammar("sql");
  const bytes = await EvidenceTestParserAssets.bytes(grammar);
  const source = EvidenceTestSourceSnapshot.create(
    "schema.sql",
    "CREATE TABLE app.Item (id integer);",
  );
  await EvidenceTestFileSystem.experiment(
    "postgresql-acquisition",
    {},
    async (cacheDirectory) => {
      const requests: string[] = [];
      const cold = await EvidenceTreeSitterAssetScope.run(
        {
          cacheDirectory,
          fetch: async (input) => {
            requests.push(String(input));
            return new Response(Uint8Array.from(bytes));
          },
        },
        async () => new EvidencePostgresqlAdapter().analyze(source),
      );
      TestValidator.equals("cold complete schema", cold.diagnostics, []);
      TestValidator.equals("only selected pinned grammar requested", requests, [
        grammar.wasm.url,
      ]);
      const warm = await EvidenceTreeSitterAssetScope.run(
        {
          cacheDirectory,
          attempts: 1,
          fetch: async () => {
            throw new Error("Offline PostgreSQL cache must not fetch.");
          },
        },
        async () => new EvidencePostgresqlAdapter().analyze(source),
      );
      TestValidator.equals("offline equivalent inventory", warm, cold);
    },
  );
}
