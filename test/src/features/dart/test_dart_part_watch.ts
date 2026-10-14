import { EvidenceChecker, EvidenceWatcher } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Recovers a missing generated Dart part and observes its public changes
 * through the library alias.
 *
 * The defining library owns its parts, so watch must invalidate and recover the
 * exported surface as a generated part appears and changes.
 *
 * 1. Start a watcher with a library that references an absent generated part.
 * 2. Add the part and require the library alias to expose its selected
 *    declaration.
 * 3. Change the generated declaration and require the following watch result to
 *    reflect it.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs a watcher while a missing generated Dart part appears and changes, asserting published reports through the library alias.
 * @evidence contracts/testing.md#independent-expectations Every completed check cycle's report is compared with a fresh one-shot EvidenceChecker run; per-cycle expectations follow the part's authored declarations.
 * @evidence contracts/testing.md#distinguishing-cases Covers the absent part, its creation and a change to its declaration.
 * @evidence contracts/testing.md#execution-ownership The exported test_dart_part_watch is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_dart_part_watch(): Promise<void> {
  await EvidenceTestFileSystem.experiment(
    "dart-part-watch",
    {
      "evidence.config.ts": dedent`
      export default { claims: [{ type: "typescript", files: ["claim.ts"], reference: { type: "dart", files: ["contracts/*.dart"], symbol: "property" } }] };
    `,
      "claim.ts": dedent`
      /** @evidence ./contracts/api.dart#Model.value Verifies the public value. */
      export function claim() {}
    `,
      "contracts/api.dart": "part 'model.g.dart';",
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
            `fresh part cycle ${cycle.cycle}`,
            cycle.report,
            await EvidenceChecker.check(config),
          );
          if (cycle.cycle === 1) {
            TestValidator.equals(
              "missing part incomplete",
              cycle.status,
              "incomplete",
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/model.g.dart":
                "part of 'api.dart'; class Model { int value = 1; }",
            });
          } else if (cycle.cycle === 2) {
            TestValidator.equals(
              "new generated source recovers",
              cycle.success,
              true,
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/model.g.dart":
                "part of 'api.dart'; class Model { int value = 1; int extra = 2; }",
            });
          } else if (cycle.cycle === 3) {
            TestValidator.equals(
              "part surface edit invalidates coverage",
              cycle.success,
              false,
            );
            await EvidenceTestFileSystem.save(directory, {
              "contracts/model.g.dart":
                "part of 'api.dart'; class Model { int value = 1; int _extra = 2; }",
            });
          } else {
            TestValidator.equals(
              "library-private edit recovers",
              cycle.success,
              true,
            );
            TestValidator.equals("exact recovery cycle", cycle.cycle, 4);
            await watcher.close();
          }
        });
      } finally {
        await watcher.close();
      }
    },
  );
}
