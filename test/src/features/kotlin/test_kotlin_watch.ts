import { EvidenceChecker, EvidenceWatcher } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Rebuilds Kotlin populations after source, discovery, syntax, and
 * configuration changes.
 *
 * Watch must publish each checked state instead of retaining stale Kotlin
 * analysis.
 *
 * 1. Mutate selected source and add a file. 2. Introduce malformed source. 3.
 *    Repair it and verify recovery after configuration change.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs EvidenceWatcher over a Kotlin project through a source edit, a new selected file, malformed source, repair and a configuration change, asserting each cycle.
 * @evidence contracts/testing.md#independent-expectations Every completed check cycle's report is compared with a fresh one-shot EvidenceChecker run; per-cycle expectations follow the authored edits (new units, an incomplete cycle, recovered populations).
 * @evidence contracts/testing.md#distinguishing-cases Covers source, discovery, syntax and configuration transitions, including the incomplete malformed-source cycle.
 * @evidence contracts/testing.md#execution-ownership The exported test_kotlin_watch is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_kotlin_watch(): Promise<void> {
  await EvidenceTestFileSystem.experiment(
    "kotlin-watch",
    {
      "evidence.config.ts": dedent`
      export default { claims: [{ type: "typescript", files: ["claims.ts"], reference: { type: "kotlin", files: ["contracts/*.kt"], symbol: "property" } }] };
    `,
      "claims.ts": dedent`
      /** @evidence ./contracts/Contract.kt#Contract Implements the contract. */
      export function claim() {}
    `,
      "contracts/Contract.kt": "class Contract { val value = 1; }\n",
    },
    async (directory) => {
      const file = join(directory, "evidence.config.ts");
      const watcher = new EvidenceWatcher(file, {
        pollIntervalMilliseconds: 10,
        debounceMilliseconds: 10,
      });
      try {
        await watcher.watch(async (cycle) => {
          if (cycle.status === "failed") throw new Error(cycle.message);
          TestValidator.equals(
            `fresh Kotlin cycle ${cycle.cycle}`,
            cycle.report,
            await EvidenceChecker.check(file),
          );
          if (cycle.cycle === 1) {
            TestValidator.equals(
              "initial Kotlin coverage",
              cycle.success,
              true,
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/Extra.kt": "val extra = 2\n",
            });
          } else if (cycle.cycle === 2) {
            TestValidator.equals(
              "new undocumented declaration invalidates coverage",
              cycle.success,
              false,
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/Extra.kt": "class Broken {\n",
            });
          } else if (cycle.cycle === 3) {
            TestValidator.equals(
              "syntax failure replaces prior inventory",
              cycle.status,
              "incomplete",
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/Extra.kt": "private val extra = 2\n",
            });
          } else if (cycle.cycle === 4) {
            TestValidator.equals(
              "repaired source recovers",
              cycle.success,
              true,
            );
            await EvidenceTestFileSystem.save(directory, {
              "evidence.config.ts": dedent`
            export default { claims: [{ type: "typescript", files: ["claims.ts"], reference: { type: "kotlin", files: ["contracts/*.kt"], symbol: "type" } }] };
          `,
            });
          } else {
            TestValidator.equals(
              "configuration reselects Kotlin types",
              cycle.cycle,
              5,
            );
            TestValidator.equals("fresh type coverage", cycle.success, true);
            await watcher.close();
          }
        });
      } finally {
        await watcher.close();
      }
    },
  );
}
