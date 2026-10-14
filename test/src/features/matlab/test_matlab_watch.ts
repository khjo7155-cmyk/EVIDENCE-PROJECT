import { EvidenceChecker, EvidenceWatcher } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Rebuilds MATLAB coverage after source and configuration changes.
 *
 * Watch cycles must replace stale inventories when a selected file appears,
 * becomes malformed, is repaired, or the selector changes.
 *
 * 1. Start with a covered MATLAB property and compare every watch report to a
 *    fresh check.
 * 2. Add an undocumented class, then make it malformed, and require failure
 *    followed by incomplete status.
 * 3. Repair the source and require coverage recovery.
 * 4. Change the selector to types and require a fresh passing population.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs EvidenceWatcher over a MATLAB project through the authored file changes and asserts each published cycle.
 * @evidence contracts/testing.md#independent-expectations Every completed check cycle's report is compared with a fresh one-shot EvidenceChecker run on the same files; per-cycle status expectations follow the authored edits.
 * @evidence contracts/testing.md#distinguishing-cases Covers an added undocumented class, a malformed source, repair, and a selector change to types.
 * @evidence contracts/testing.md#execution-ownership The exported test_matlab_watch is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_matlab_watch(): Promise<void> {
  await EvidenceTestFileSystem.experiment(
    "matlab-watch",
    {
      "evidence.config.ts": dedent`
      export default { claims: [{ type: "typescript", files: ["claims.ts"], reference: { type: "matlab", files: ["contracts/*.m"], symbol: "property" } }] };
    `.concat("\n"),
      "claims.ts": dedent`
      /** @evidence ./contracts/Contract.m#Contract Implements the contract. */
      export function claim() {}
    `.concat("\n"),
      "contracts/Contract.m":
        "classdef Contract\nproperties\nvalue = 1\nend\nend\n",
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
            `fresh MATLAB cycle ${cycle.cycle}`,
            cycle.report,
            await EvidenceChecker.check(file),
          );
          if (cycle.cycle === 1) {
            TestValidator.equals(
              "initial MATLAB coverage",
              cycle.success,
              true,
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/Extra.m":
                "classdef Extra\nproperties\nextra = 2\nend\nend\n",
            });
          } else if (cycle.cycle === 2) {
            TestValidator.equals(
              "new undocumented declaration invalidates coverage",
              cycle.success,
              false,
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/Extra.m": "classdef Extra\n",
            });
          } else if (cycle.cycle === 3) {
            TestValidator.equals(
              "syntax failure replaces prior inventory",
              cycle.status,
              "incomplete",
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/Extra.m": "% Empty repaired source.\n",
            });
          } else if (cycle.cycle === 4) {
            TestValidator.equals(
              "repaired source recovers",
              cycle.success,
              true,
            );
            await EvidenceTestFileSystem.save(directory, {
              "evidence.config.ts": dedent`
            export default { claims: [{ type: "typescript", files: ["claims.ts"], reference: { type: "matlab", files: ["contracts/*.m"], symbol: "type" } }] };
          `.concat("\n"),
            });
          } else {
            TestValidator.equals(
              "configuration reselects MATLAB types",
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
