import {
  EvidenceChecker,
  EvidenceCommand,
  EvidenceConfigLoader,
} from "@wrtnlabs/evidence";
import type {
  IEvidenceCommandResult,
  IEvidenceConfig,
  IEvidenceConfigPlan,
  IEvidenceCheckReport,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import assert from "node:assert/strict";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Discovers conventional configuration without masking explicit-path failures.
 *
 * All finite commands must preserve omission until effective cwd is known, and
 * a selected invalid TS configuration must not pass through a valid JSON file.
 *
 * 1. Run implicit check, check, list, inspect and graph in a JSON-only child cwd.
 * 2. Add valid TS beside JSON and require TS priority; explicit JSON still wins.
 * 3. Make TS invalid and require every command to fail; delete TS and recover.
 * 4. Reject explicit missing paths despite available defaults, malformed selected
 *    JSON and missing defaults, naming both conventional candidates.
 * 5. Run omitted-path loader and checker instance/static APIs from the fixture
 *    cwd, requiring the same JSON roots and explicit-path failure behavior.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs commands and loader and checker APIs across JSON-only, TS-plus-JSON, invalid TS and explicit-path layouts, asserting results.
 * @evidence contracts/testing.md#independent-expectations Expectations follow the discovery contract: TS priority, absence-only fallback, explicit paths never fall back.
 * @evidence contracts/testing.md#distinguishing-cases Covers every finite command, TS priority, explicit JSON, invalid TS, missing explicit paths, malformed JSON and missing defaults, and instance and static APIs.
 * @evidence contracts/testing.md#execution-ownership The exported test_config_discovery is discovered by DynamicExecutor and calls maintained source in-process; the only child process is the product's own read-only configuration evaluator started by the code under test. It installs nothing and spawns no CLI.
 */
export async function test_config_discovery(): Promise<void> {
  const json: string = JSON.stringify({
    claims: [
      {
        type: "markdown",
        files: ["source.md"],
        symbol: "h1",
        reference: { type: "markdown", files: ["target.md"], symbol: "h1" },
      },
    ],
  });
  const operations: string[][] = [
    [],
    ["check"],
    ["list"],
    ["inspect", "source.md#source"],
    ["graph"],
  ];
  await EvidenceTestFileSystem.experiment(
    "discovery",
    {
      "project/evidence.config.json": json,
      "project/source.md":
        "# Source\n<!-- @evidence target.md#target Implements the target. -->\n",
      "project/target.md": "# Target\n",
      "evidence.config.ts": "throw new Error('Wrong launch directory');",
    },
    async (directory: string): Promise<void> => {
      const project: string = join(directory, "project");
      for (const operation of operations) {
        const result: IEvidenceCommandResult = await EvidenceCommand.run(
          [...operation, "--cwd", "project", "--format", "json"],
          directory,
        );
        TestValidator.equals(
          `JSON-only ${operation.join(" ")} ${result.stdout}`,
          result.exitCode,
          0,
        );
      }
      await EvidenceTestFileSystem.save(project, {
        "evidence.config.ts": `export default { ...${json}, severity: "off" };`,
      });
      const selected: IEvidenceCommandResult = await EvidenceCommand.run(
        ["list", "--cwd", "project", "--format", "json"],
        directory,
      );
      TestValidator.equals("TS priority exit", selected.exitCode, 0);
      TestValidator.predicate(
        "TS selected empty population",
        !selected.stdout.includes('"Source"'),
      );
      const explicit: IEvidenceCommandResult = await EvidenceCommand.run(
        [
          "list",
          "--cwd",
          "project",
          "--config",
          "evidence.config.json",
          "--format",
          "json",
        ],
        directory,
      );
      TestValidator.predicate(
        "explicit JSON keeps population",
        explicit.stdout.includes('"Source"'),
      );
      TestValidator.equals("explicit JSON success", explicit.exitCode, 0);
      await EvidenceTestFileSystem.erase(join(project, "evidence.config.json"));
      TestValidator.equals(
        "TS-only discovery",
        (await EvidenceCommand.run(["list", "--format", "json"], project))
          .exitCode,
        0,
      );
      await EvidenceTestFileSystem.save(project, {
        "evidence.config.json": "{",
      });
      TestValidator.equals(
        "explicit malformed JSON cannot use valid TS",
        (
          await EvidenceCommand.run(
            ["--config", "evidence.config.json", "--format", "json"],
            project,
          )
        ).exitCode,
        2,
      );
      await EvidenceTestFileSystem.save(project, {
        "evidence.config.json": json,
      });
      await EvidenceTestFileSystem.save(project, {
        "evidence.config.ts":
          "export default (() => { throw new Error('Selected TS failure'); })();",
      });
      for (const operation of operations) {
        const result: IEvidenceCommandResult = await EvidenceCommand.run(
          [...operation, "--cwd", "project", "--format", "json"],
          directory,
        );
        TestValidator.equals("invalid TS cannot fall back", result.exitCode, 2);
        TestValidator.predicate(
          "selected TS failure retained",
          result.stdout.includes(
            JSON.stringify(join(project, "evidence.config.ts")),
          ),
        );
      }
      await EvidenceTestFileSystem.erase(join(project, "evidence.config.ts"));
      const missingPaths: string[] = ["evidence.config.ts", "missing.json"];
      for (const path of missingPaths)
        TestValidator.equals(
          "explicit missing path",
          (
            await EvidenceCommand.run(
              ["--cwd", "project", "--config", path, "--format", "json"],
              directory,
            )
          ).exitCode,
          2,
        );
      const previous: string = process.cwd();
      process.chdir(project);
      try {
        const plan: IEvidenceConfigPlan = await EvidenceConfigLoader.plan();
        TestValidator.equals(
          "JSON selected by loader",
          plan.configFile,
          join(project, "evidence.config.json"),
        );
        TestValidator.equals(
          "loader authored configuration",
          (await EvidenceConfigLoader.load()).claims.length,
          1,
        );
        const reports: IEvidenceCheckReport[] = [
          await EvidenceChecker.check(),
          await new EvidenceChecker().check(),
          (await EvidenceChecker.analyze()).report,
          (await new EvidenceChecker().analyze()).report,
        ];
        for (const report of reports)
          TestValidator.equals("omitted checker success", report.exitCode, 0);
        const reused: EvidenceChecker = new EvidenceChecker();
        TestValidator.equals(
          "instance initially uses JSON",
          (await reused.check()).counts.units,
          1,
        );
        await EvidenceTestFileSystem.save(project, {
          "evidence.config.ts": `export default { ...${json}, severity: "off" };`,
        });
        TestValidator.equals(
          "instance rediscovers newly preferred TS",
          (await reused.check()).counts.units,
          0,
        );
        await EvidenceTestFileSystem.erase(join(project, "evidence.config.ts"));
        TestValidator.equals(
          "instance rediscovers JSON after TS deletion",
          (await reused.check()).counts.units,
          1,
        );
        await assert.rejects((): Promise<IEvidenceConfig> =>
          EvidenceConfigLoader.load("evidence.config.ts"),
        );
        await assert.rejects((): Promise<IEvidenceCheckReport> =>
          EvidenceChecker.check("evidence.config.ts"),
        );
        await EvidenceTestFileSystem.save(project, {
          "evidence.config.json": "{",
        });
        await assert.rejects(
          (): Promise<IEvidenceConfigPlan> => EvidenceConfigLoader.plan(),
          SyntaxError,
        );
        await EvidenceTestFileSystem.erase(
          join(project, "evidence.config.json"),
        );
        await assert.rejects(
          (): Promise<IEvidenceConfigPlan> => EvidenceConfigLoader.plan(),
          /evidence\.config\.ts.*evidence\.config\.json/u,
        );
      } finally {
        process.chdir(previous);
      }
    },
  );
}
