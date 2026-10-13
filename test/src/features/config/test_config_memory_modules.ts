import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { evaluateTypeScriptConfig } from "@wrtnlabs/evidence";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Resolves checked TypeScript and mixed module dependencies from memory.
 *
 * Keeping output off disk must preserve module formats, source coordinates, and
 * the typecheck boundary for dependencies first discovered at runtime.
 *
 * 1. Evaluate ts, cts, and mts entries importing ESM, CommonJS, and a TS helper
 *    through a JS spelling; require the TS value despite a stale neighboring
 *    JS.
 * 2. Require a computed TypeScript dependency containing an enum and require its
 *    compiled value, then introduce a type error and require rejection.
 * 3. Dynamically import that repaired helper from ESM and require its value.
 * 4. Schedule another import after returning the default export and require the
 *    evaluator to keep its memory loader until process exit.
 * 5. Resolve a consumer's ambient type package without a tsconfig, then require a
 *    value incompatible with that declaration to fail typechecking.
 */
export async function test_config_memory_modules(): Promise<void> {
  await EvidenceTestFileSystem.experiment(
    "config-memory-modules",
    {
      "esm.mjs": "export const value = 5;",
      "common.cjs": "module.exports = 11;",
      "typed.ts": "export enum Count { Value = 17 }",
      "typed.js": "export const Count = { Value: 999 };",
      "dynamic.ts": "export enum Count { Value = 23 }",
      "node_modules/@types/fixture-environment/index.d.ts":
        "declare const fixtureEnvironment: string;",
    },
    async (directory: string): Promise<void> => {
      const extensions: string[] = ["ts", "cts", "mts"];
      for (const extension of extensions) {
        const name: string = `evidence.config.${extension}`;
        await EvidenceTestFileSystem.save(directory, {
          [name]: dedent`
        import { value } from "./esm.mjs";
        import common from "./common.cjs";
        import { Count } from "./typed.js";
        export default [value, common, Count.Value];
      `,
        });
        TestValidator.equals(
          `${extension} mixed module values`,
          await evaluateTypeScriptConfig(join(directory, name)),
          [5, 11, 17],
        );
      }

      const file: string = join(directory, "evidence.config.ts");
      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": dedent`
      const specifier = "./dynamic";
      const helper = require(specifier);
      export default helper.Count.Value;
    `,
      });
      TestValidator.equals(
        "runtime TS dependency",
        await evaluateTypeScriptConfig(file),
        23,
      );

      await EvidenceTestFileSystem.save(directory, {
        "dynamic.ts": "export const invalid: number = 'invalid';",
      });
      await TestValidator.error(
        "runtime dependency remains checked",
        (): Promise<unknown> =>
          evaluateTypeScriptConfig(file, {
            writeDiagnostic: (_content: string): void => {},
          }),
      );

      await EvidenceTestFileSystem.save(directory, {
        "dynamic.ts": "export enum Count { Value = 29 }",
        "evidence.config.mts": dedent`
        const specifier = "./dynamic.ts";
        const helper = await import(specifier);
        export default helper.Count.Value;
      `,
      });
      TestValidator.equals(
        "dynamic ESM dependency",
        await evaluateTypeScriptConfig(join(directory, "evidence.config.mts")),
        29,
      );

      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.mts": dedent`
          const specifier = "./dynamic.ts";
          setTimeout(() => { void import(specifier); }, 50);
          export default 31;
        `,
      });
      TestValidator.equals(
        "late imports retain the memory loader",
        await evaluateTypeScriptConfig(join(directory, "evidence.config.mts")),
        31,
      );

      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts":
          "const value: typeof fixtureEnvironment = 'ambient'; export default value;",
      });
      TestValidator.equals(
        "consumer ambient types",
        await evaluateTypeScriptConfig(file),
        "ambient",
      );
      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts":
          "const value: typeof fixtureEnvironment = 123; export default value;",
      });
      await TestValidator.error(
        "ambient declarations remain checked",
        (): Promise<unknown> =>
          evaluateTypeScriptConfig(file, {
            writeDiagnostic: (_content: string): void => {},
          }),
      );
    },
  );
}
