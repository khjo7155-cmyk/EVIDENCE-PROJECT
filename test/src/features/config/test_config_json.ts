import { TestValidator } from "@nestia/e2e";
import {
  EvidenceConfigDependencyScanner,
  EvidenceConfigLoader,
  EvidenceCommand,
} from "@wrtnlabs/evidence";
import type { IEvidenceConfig } from "@wrtnlabs/evidence";
import assert from "node:assert/strict";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Preserves JSON configuration semantics through loading, dependency scanning,
 * and initialization.
 *
 * JSON strings must remain data even when they resemble module-loading code.
 * The loader should produce the same claim plan as equivalent TypeScript while
 * rejecting malformed or unsupported formats and refusing destructive
 * initialization.
 *
 * 1. Load matching JSON and TypeScript configurations and require equal active
 *    claims, with the JSON plan anchored to its own absolute configuration
 *    path.
 * 2. Scan JSON containing a require-like claim label and require no dependency on
 *    the module name embedded in that string.
 * 3. Reject YAML extensions and malformed JSON during planning.
 * 4. Initialize a new JSON configuration and successfully plan it; reject a second
 *    initialization at the same destination and reject new YAML destinations.
 *
 * @evidence contracts/testing.md#behavioral-verification Loads, scans and initializes JSON configurations and asserts plan equality, dependencies and rejections.
 * @evidence contracts/testing.md#independent-expectations The equivalent TypeScript configuration's plan is the oracle for the JSON plan.
 * @evidence contracts/testing.md#distinguishing-cases Covers JSON versus TypeScript, a require-like string label, YAML and malformed JSON, and repeated or YAML initialization.
 * @evidence contracts/testing.md#execution-ownership The exported test_config_json is discovered by DynamicExecutor and calls maintained source in-process; the only child process is the product's own read-only configuration evaluator started by the code under test. It installs nothing and spawns no CLI.
 */
export async function test_config_json(): Promise<void> {
  const config: IEvidenceConfig = {
    claims: [
      {
        name: "require('./missing-module')",
        type: "markdown",
        files: ["source.md"],
        reference: { type: "markdown", files: ["target.md"] },
      },
    ],
  };
  await EvidenceTestFileSystem.experiment(
    "json-config",
    {
      "evidence.json": JSON.stringify(config),
      "evidence.config.ts": `export default ${JSON.stringify(config)};`,
      "evidence.yaml": JSON.stringify(config),
      "evidence.yml": JSON.stringify(config),
      "broken.json": "{",
    },
    async (directory) => {
      const json = join(directory, "evidence.json");
      const fromJson = await EvidenceConfigLoader.plan(json);
      const fromTs = await EvidenceConfigLoader.plan(
        join(directory, "evidence.config.ts"),
      );
      TestValidator.equals(
        "equivalent active claims",
        fromJson.claims,
        fromTs.claims,
      );
      TestValidator.equals("JSON config anchoring", fromJson.configFile, json);

      const dependencies = await new EvidenceConfigDependencyScanner(
        json,
      ).scan();
      TestValidator.predicate(
        "JSON strings are not imports",
        dependencies.every((entry) => !entry.path.includes("missing-module")),
      );
      for (const name of ["evidence.yaml", "evidence.yml", "broken.json"])
        await assert.rejects(() =>
          EvidenceConfigLoader.plan(join(directory, name)),
        );

      // Initialization creates usable JSON and refuses extensions and existing destinations.
      const created = join(directory, "created.json");
      await EvidenceCommand.initialize(created);
      await EvidenceConfigLoader.plan(created);
      await assert.rejects(() => EvidenceCommand.initialize(created));
      await assert.rejects(() =>
        EvidenceCommand.initialize(join(directory, "new.yaml")),
      );
      await assert.rejects(() =>
        EvidenceCommand.initialize(join(directory, "new.yml")),
      );
    },
  );
}
