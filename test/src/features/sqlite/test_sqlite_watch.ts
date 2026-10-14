import { EvidenceChecker, EvidenceWatcher } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Recomputes SQLite populations as selected files appear and recover.
 *
 * Watch cycles must discard stale coverage after a file is added or fails
 * parsing, then restore it when repaired.
 *
 * 1. Start with a covered SQLite schema and compare cycles to a fresh check.
 * 2. Add an undocumented selected file and require failed coverage.
 * 3. Make it malformed, repair it, and require incomplete status followed by
 *    recovery.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs EvidenceWatcher over a SQLite project through the authored file changes and asserts each published cycle.
 * @evidence contracts/testing.md#independent-expectations Every completed check cycle's report is compared with a fresh one-shot EvidenceChecker run on the same files; per-cycle status expectations follow the authored edits.
 * @evidence contracts/testing.md#distinguishing-cases Covers an added undocumented file (failing coverage), a malformed source (incomplete) and repair.
 * @evidence contracts/testing.md#execution-ownership The exported test_sqlite_watch is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_sqlite_watch(): Promise<void> {
  await EvidenceTestFileSystem.experiment(
    "sqlite-watch",
    {
      "evidence.config.ts": dedent`
      export default { claims: [{ type: "typescript", files: ["claim.ts"], reference: { type: "sqlite", files: ["schema/*.sql"], symbol: "column" } }] };
    `,
      "claim.ts": dedent`
      /** @evidence ./schema/account.sql#Account Implements the account. */
      export function verify() {}
    `,
      "schema/account.sql": "CREATE TABLE Account (id INTEGER);\n",
    },
    async (directory) => {
      const config = join(directory, "evidence.config.ts");
      const watcher = new EvidenceWatcher(config, {
        pollIntervalMilliseconds: 10,
        debounceMilliseconds: 10,
      });
      try {
        await watcher.watch(async (cycle) => {
          if (cycle.status === "failed") throw new Error(cycle.message);
          TestValidator.equals(
            `SQLite watch agrees with fresh check ${cycle.cycle}`,
            cycle.report,
            await EvidenceChecker.check(config),
          );
          if (cycle.cycle === 1) {
            TestValidator.equals("initial schema covered", cycle.success, true);
            await EvidenceTestFileSystem.save(directory, {
              "schema/new.sql": "CREATE TABLE New (uncovered TEXT);\n",
            });
          } else if (cycle.cycle === 2) {
            TestValidator.equals(
              "new column creates obligation",
              cycle.success,
              false,
            );
            await EvidenceTestFileSystem.save(directory, {
              "schema/new.sql": "CREATE TABLE New (\n",
            });
          } else if (cycle.cycle === 3) {
            TestValidator.equals(
              "syntax failure stays incomplete",
              cycle.status,
              "incomplete",
            );
            await EvidenceTestFileSystem.save(directory, {
              "schema/new.sql":
                "-- @internal Withdraws this table.\nCREATE TABLE New (uncovered TEXT);\n",
            });
          } else {
            TestValidator.equals("one recovery cycle", cycle.cycle, 4);
            TestValidator.equals(
              "repaired withdrawn table recovers",
              cycle.success,
              true,
            );
            await watcher.close();
          }
        });
      } finally {
        await watcher.close();
      }
    },
  );
}
