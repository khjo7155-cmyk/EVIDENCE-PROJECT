import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { evaluateTypeScriptConfig } from "@wrtnlabs/evidence";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import typia from "typia";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Evaluates fresh configuration modules without permitting filesystem writes.
 *
 * Configuration compilation and result transport must work with read access
 * alone, preserve non-JSON values, and release module state between watch
 * cycles.
 *
 * 1. Import a typed helper with an enum and require its computed value.
 * 2. Edit only that helper and require a fresh value from the next evaluation.
 * 3. Return undefined and BigInt in an array and require their exact IPC values.
 * 4. Reject an invalid package module scope and recover after its repair.
 * 5. Attempt a runtime file write and require rejection without a new file.
 * 6. Exit before returning the export and require rejection. Check that all
 *    evaluations left only authored source and package files.
 */
export async function test_config_memory(): Promise<void> {
  await EvidenceTestFileSystem.experiment(
    "config-memory",
    {
      "helper.ts": "export enum Count { Value = 3 }",
      "evidence.config.ts": dedent`
      import { Count } from "./helper";
      export default Count.Value;
    `,
    },
    async (directory: string): Promise<void> => {
      const file: string = join(directory, "evidence.config.ts");
      TestValidator.equals(
        "compiled enum",
        await evaluateTypeScriptConfig(file),
        3,
      );

      await EvidenceTestFileSystem.save(directory, {
        "helper.ts": "export enum Count { Value = 7 }",
      });
      TestValidator.equals(
        "fresh imported helper",
        await evaluateTypeScriptConfig(file),
        7,
      );

      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": "export default [undefined, 123n];",
      });
      const values: [undefined, bigint] = typia.assert<[undefined, bigint]>(
        await evaluateTypeScriptConfig(file),
      );
      TestValidator.predicate(
        "non-JSON export preserved",
        values[0] === undefined && values[1] === 123n,
      );

      await EvidenceTestFileSystem.save(directory, {
        "package.json": JSON.stringify({ type: 123 }),
      });
      await TestValidator.error("invalid module scope", (): Promise<unknown> =>
        evaluateTypeScriptConfig(file, {
          writeDiagnostic: (_content: string): void => {},
        }),
      );
      await EvidenceTestFileSystem.save(directory, {
        "package.json": JSON.stringify({ type: "commonjs" }),
      });
      TestValidator.predicate(
        "repaired module scope",
        typia.is<[undefined, bigint]>(await evaluateTypeScriptConfig(file)),
      );

      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": dedent`
      import { writeFileSync } from "node:fs";
      writeFileSync("forbidden.tmp", "must not be written");
      export default {};
    `,
      });
      await TestValidator.error(
        "filesystem writes are refused",
        (): Promise<unknown> =>
          evaluateTypeScriptConfig(file, {
            writeDiagnostic: (_content: string): void => {},
          }),
      );

      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": "process.exit(0); export default {};",
      });
      await TestValidator.error(
        "missing export cannot pass",
        (): Promise<unknown> => evaluateTypeScriptConfig(file),
      );
      TestValidator.equals(
        "no files from any evaluation",
        (await readdir(directory)).sort((left: string, right: string): number =>
          left.localeCompare(right),
        ),
        ["evidence.config.ts", "helper.ts", "package.json"],
      );
    },
  );
}
