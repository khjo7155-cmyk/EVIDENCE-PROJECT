import {
  EvidenceTreeSitterAssetScope,
  EvidenceTreeSitterAssets,
  EvidenceWatcher,
  type EvidenceWatchCycle,
} from "@wrtnlabs/evidence";
import { EvidenceTestParserAssets } from "../../internal/EvidenceTestParserAssets";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Publishes an incomplete parser-download cycle and recovers without a source
 * edit.
 *
 * A transient grammar acquisition failure must replace the watch result with an
 * operational failure and retry from the retained inputs once the asset is
 * available.
 *
 * 1. Run a Python claim watcher with a pinned TypeScript configuration grammar and
 *    a Python grammar fetch that first fails as offline.
 * 2. Require the first published cycle to be incomplete with operational exit 2.
 * 3. Make the Python grammar fetch available without editing the config or
 *    sources.
 * 4. Require the next cycle to succeed and verify exactly one failed transfer and
 *    one successful retry occurred before the watcher closes.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs a watcher with a grammar fetch that first fails and then succeeds, asserting cycle statuses and transfer counts.
 * @evidence contracts/testing.md#independent-expectations Expected exit codes follow the contract (operational failure 2, then success); transfer counts come from the controlled fetch.
 * @evidence contracts/testing.md#distinguishing-cases Covers the offline failure and recovery without any source edit.
 * @evidence contracts/testing.md#execution-ownership The exported test_watch_parser_recovery is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_watch_parser_recovery(): Promise<void> {
  const grammar = await new EvidenceTreeSitterAssets().grammar("python");
  const configGrammar = await new EvidenceTreeSitterAssets().grammar(
    "typescript",
  );
  const pinned = Uint8Array.from(await EvidenceTestParserAssets.bytes(grammar));
  const configPinned = Uint8Array.from(
    await EvidenceTestParserAssets.bytes(configGrammar),
  );
  await EvidenceTestFileSystem.experiment(
    join(__dirname, `parser-recovery-${randomUUID()}`),
    {
      "project/evidence.config.ts": dedent`
        export default {
          claims: [{
            type: "python",
            files: ["api.py"],
            symbol: "function",
            reference: {
              type: "markdown",
              files: ["requirements.md"],
              symbol: "h2",
            },
          }],
        };
      `,
      "project/api.py": dedent`
      def run():
          """@evidence requirements.md#execute Execute the requirement."""
          return 1
    `,
      "project/requirements.md": "## Execute\nRun the operation.\n",
    },
    async (directory) => {
      const cycles: EvidenceWatchCycle[] = [];
      let available = false;
      let requests = 0;
      const watcher = new EvidenceWatcher(
        join(directory, "project", "evidence.config.ts"),
        {
          pollIntervalMilliseconds: 10,
          debounceMilliseconds: 0,
          parserRetryMilliseconds: 10,
        },
      );
      const timeout = setTimeout(() => {
        void watcher.close();
      }, 10_000);
      try {
        await EvidenceTreeSitterAssetScope.run(
          {
            cacheDirectory: join(directory, "cache"),
            attempts: 1,
            fetch: async (input) => {
              if (String(input) === configGrammar.wasm.url)
                return new Response(configPinned);
              ++requests;
              if (!available) throw new Error("offline");
              return new Response(pinned);
            },
          },
          async () =>
            watcher.watch(async (cycle) => {
              cycles.push(cycle);
              if (cycle.cycle === 1) available = true;
              else await watcher.close();
            }),
        );
      } finally {
        clearTimeout(timeout);
        await watcher.close();
      }

      TestValidator.equals(
        "failed preparation remains incomplete",
        cycles[0]?.status,
        "incomplete",
      );
      TestValidator.equals(
        "failed preparation exits operationally",
        cycles[0]?.exitCode,
        2,
      );
      TestValidator.equals(
        "unmodified source recovers",
        cycles[1]?.success,
        true,
      );
      TestValidator.equals(
        "one failed transfer and one successful retry",
        requests,
        2,
      );
    },
  );
}
