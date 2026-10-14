import { EvidenceChecker, EvidenceWatcher } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Rebuilds Zig coverage after watched source and selector changes.
 *
 * New files, syntax failure, repair, and a changed selector must replace the
 * current inventory.
 *
 * 1. Compare each watch cycle to a fresh check.
 * 2. Add and break selected input, then require failure and incompleteness.
 * 3. Repair and reselect coverage, requiring recovery.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs EvidenceWatcher over a Zig project through the authored file changes and asserts each published cycle.
 * @evidence contracts/testing.md#independent-expectations Every completed check cycle's report is compared with a fresh one-shot EvidenceChecker run on the same files; per-cycle status expectations follow the authored edits.
 * @evidence contracts/testing.md#distinguishing-cases Covers an added file (failing coverage), a syntax failure (incomplete), repair and a selector change.
 * @evidence contracts/testing.md#execution-ownership The exported test_zig_watch is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_zig_watch(): Promise<void> {
  await EvidenceTestFileSystem.experiment(
    "zig-watch",
    {
      "evidence.config.ts": dedent`
      export default { claims: [{ type: "typescript", files: ["claims.ts"], reference: { type: "zig", files: ["contracts/*.zig"], symbol: "property" } }] };
    `,
      "claims.ts": dedent`
      /** @evidence ./contracts/Contract.zig#Contract Implements the contract. */
      export function claim() {}
    `,
      "contracts/Contract.zig":
        "pub const Contract = struct { value: i32, };\n",
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
            `fresh Zig cycle ${cycle.cycle}`,
            cycle.report,
            await EvidenceChecker.check(file),
          );
          if (cycle.cycle === 1) {
            TestValidator.equals("initial Zig coverage", cycle.success, true);
            await EvidenceTestFileSystem.save(directory, {
              "contracts/Extra.zig": "pub const extra = 2;\n",
            });
          } else if (cycle.cycle === 2) {
            TestValidator.equals(
              "new undocumented declaration invalidates coverage",
              cycle.success,
              false,
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/Extra.zig": "pub const Broken = struct {\n",
            });
          } else if (cycle.cycle === 3) {
            TestValidator.equals(
              "syntax failure replaces prior inventory",
              cycle.status,
              "incomplete",
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/Extra.zig": "const extra = 2;\n",
            });
          } else if (cycle.cycle === 4) {
            TestValidator.equals(
              "repaired source recovers",
              cycle.success,
              true,
            );
            await EvidenceTestFileSystem.save(directory, {
              "evidence.config.ts": dedent`
            export default { claims: [{ type: "typescript", files: ["claims.ts"], reference: { type: "zig", files: ["contracts/*.zig"], symbol: "type" } }] };
          `,
            });
          } else {
            TestValidator.equals(
              "configuration reselects Zig types",
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
