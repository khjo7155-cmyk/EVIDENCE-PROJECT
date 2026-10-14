import {
  EvidenceSqliteAdapter,
  EvidenceTreeSitterAssetScope,
  EvidenceTreeSitterAssets,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";
import { EvidenceTestParserAssets } from "../../internal/EvidenceTestParserAssets";
import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Acquires SQLite's configured WASM parser and reuses it offline.
 *
 * Cold analysis must load one required dialect asset, while a warm cache
 * reproduces the complete inventory without network access.
 *
 * 1. Analyze SQLite input cold while recording requests.
 * 2. Verify the selected transfer and complete inventory.
 * 3. Repeat offline and require equivalent analysis.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes SQLite with a cold grammar cache while recording requests, then offline, asserting the requested asset and equal inventories.
 * @evidence contracts/testing.md#independent-expectations Only the configured SQLite asset may be requested; the offline inventory must equal the cold one.
 * @evidence contracts/testing.md#distinguishing-cases Covers cold acquisition and warm offline reuse.
 * @evidence contracts/testing.md#execution-ownership The exported test_sqlite_acquisition is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_sqlite_acquisition(): Promise<void> {
  const grammar = await new EvidenceTreeSitterAssets().grammar("sqlite");
  const bytes = Uint8Array.from(await EvidenceTestParserAssets.bytes(grammar));
  const source = EvidenceTestSourceSnapshot.create(
    "schema.sql",
    'CREATE TABLE "Cold.Cache" ([id] INTEGER PRIMARY KEY) STRICT;',
  );

  await EvidenceTestFileSystem.experiment(
    "sqlite-acquisition",
    {},
    async (cacheDirectory) => {
      const requests: string[] = [];
      const cold = await EvidenceTreeSitterAssetScope.run(
        {
          cacheDirectory,
          fetch: async (input) => {
            requests.push(String(input));
            return new Response(bytes);
          },
        },
        async () => new EvidenceSqliteAdapter().analyze(source),
      );
      const warm = await EvidenceTreeSitterAssetScope.run(
        {
          cacheDirectory,
          attempts: 1,
          fetch: async () => {
            throw new Error(
              "Offline SQLite cache must not perform a transfer.",
            );
          },
        },
        async () => new EvidenceSqliteAdapter().analyze(source),
      );

      TestValidator.equals("one necessary pinned dialect transfer", requests, [
        grammar.wasm.url,
      ]);
      TestValidator.equals(
        "cold SQLite extraction complete",
        cold.complete,
        true,
      );
      TestValidator.equals(
        "offline SQLite inventory matches cold result",
        warm,
        cold,
      );
    },
  );
}
