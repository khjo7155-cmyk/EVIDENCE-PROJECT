import { EvidenceCommand } from "@wrtnlabs/evidence";
import type {
  IEvidenceCheckReport,
  IEvidenceCommandResult,
  IEvidenceConfig,
  IEvidenceDiagnostic,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import typia from "typia";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Checks outgoing annotations and host policy on selected claim declarations.
 *
 * A source target can be a claim rather than a required reference. Its focused
 * outcome must retain bad citations and zero-evidence cardinality without
 * assigning unrelated missing reference coverage to that host.
 *
 * 1. Focus a correctly citing function through two aliases and require success
 *    despite an unrelated malformed target and an untagged function.
 * 2. Focus the bad and untagged functions and require their own citation and
 *    single-evidence findings.
 * 3. Select the namespace ancestor and require its host failures, then hide one
 *    function and require explicit failure when naming it.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs focused checks on claim declarations and asserts outgoing citation and cardinality findings and alias handling.
 * @evidence contracts/testing.md#independent-expectations Expected findings come from the fixture's authored citations: a correct one passes, a malformed one fails, an untagged one violates single evidence.
 * @evidence contracts/testing.md#distinguishing-cases Covers alias targets, bad and untagged functions, a namespace ancestor, and a hidden function named explicitly. Reference-side focusing is owned by test_command_only_selection.
 * @evidence contracts/testing.md#execution-ownership The exported test_command_only_claims is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_command_only_claims(): Promise<void> {
  const config: IEvidenceConfig = {
    claims: [
      {
        type: "typescript",
        files: ["src/*.ts"],
        symbol: "function",
        reference: {
          type: "markdown",
          root: "docs",
          files: ["*.md"],
          symbol: "h2",
          singleEvidencePerSymbol: true,
        },
      },
    ],
  };
  const source: string = dedent`
    /** @evidence requirements.md#pricing Implements pricing. */
    export function good(): void {}
    export { good as alias };
    export namespace Group {
      /** @evidence requirements.md#missing Names a missing requirement. */
      export function bad(): void {}
      export function untagged(): void {}
    }
  `;
  await EvidenceTestFileSystem.experiment(
    "only claims",
    {
      "evidence.config.json": JSON.stringify(config),
      "docs/requirements.md": dedent`
      ## Pricing {#pricing}
      Pricing requirements.
      ## Refund {#refund}
      Refund requirements.
    `,
      "src/main.ts": source,
    },
    async (directory: string): Promise<void> => {
      async function run(...targets: string[]): Promise<IEvidenceCheckReport> {
        const result: IEvidenceCommandResult = await EvidenceCommand.run(
          ["--only", ...targets, "--format", "json"],
          directory,
        );
        if (result.exitCode === 2)
          throw new Error(`${targets.join(", ")}: ${result.stdout}`);
        return typia.json.assertParse<IEvidenceCheckReport>(result.stdout);
      }
      const good: IEvidenceCheckReport = await run(
        "src/main.ts#good",
        "src/main.ts#alias",
      );
      TestValidator.equals("good host passes", good.exitCode, 0);
      TestValidator.equals(
        "claim target has no incoming denominator",
        good.counts.units,
        0,
      );
      const bad: IEvidenceCheckReport = await run("src/main.ts#Group.bad");
      TestValidator.equals("bad host fails", bad.exitCode, 1);
      TestValidator.predicate(
        "bad citation retained",
        bad.diagnostics.some(
          (diagnostic: IEvidenceDiagnostic): boolean =>
            diagnostic.target === "requirements.md#missing",
        ),
      );
      const untagged: IEvidenceCheckReport = await run(
        "src/main.ts#Group.untagged",
      );
      TestValidator.equals("zero citations fail", untagged.exitCode, 1);
      TestValidator.predicate(
        "zero citation policy",
        untagged.diagnostics.some(
          (diagnostic: IEvidenceDiagnostic): boolean =>
            diagnostic.code === "graph-single-evidence-per-symbol",
        ),
      );
      const all: IEvidenceCheckReport = await run("src/main.ts#Group");
      TestValidator.equals(
        "namespace subtree failures",
        all.diagnostics.length,
        bad.diagnostics.length + untagged.diagnostics.length,
      );
      TestValidator.equals(
        "unaddressable file target fails cleanly",
        (await run("src/main.ts")).exitCode,
        1,
      );
      await EvidenceTestFileSystem.save(directory, {
        "src/main.ts": source.replace(
          "/** @evidence requirements.md#pricing Implements pricing. */",
          "/** @internal */",
        ),
      });
      TestValidator.equals(
        "hidden host fails",
        (await run("src/main.ts#good")).exitCode,
        1,
      );
    },
  );
}
