import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { EvidenceChecker } from "@wrtnlabs/evidence";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Checks complete projects without creating runtime files on success or
 * failure.
 *
 * Configuration evaluation, parser acquisition, and graph checking must compose
 * without adding temporary projects, emitted files, or grammar cache
 * directories.
 *
 * 1. Check a TS configuration and a documented function citing its Markdown
 *    requirement; require success and only the three authored project files.
 * 2. Remove the citation and require failing coverage with the same file tree.
 * 3. Restore the citation and require success without new filesystem artifacts.
 */
export async function test_checker_memory(): Promise<void> {
  const implementation: string = dedent`
    /** @evidence requirements.md#run Implements the required operation. */
    export function run(): void {}
  `;
  await EvidenceTestFileSystem.experiment(
    "checker-memory",
    {
      "evidence.config.ts": dedent`
      export default {
        claims: [{
          type: "typescript", files: ["api.ts"], symbol: "function",
          reference: { type: "markdown", files: ["requirements.md"], symbol: "h2" },
        }],
      };
    `,
      "api.ts": implementation,
      "requirements.md": "## Run\nExecute the operation.\n",
    },
    async (directory: string): Promise<void> => {
      const file: string = join(directory, "evidence.config.ts");
      const scenarios: boolean[] = [true, false, true];
      for (const valid of scenarios) {
        await EvidenceTestFileSystem.save(directory, {
          "api.ts": valid ? implementation : "export function run(): void {}",
        });
        TestValidator.equals(
          "fresh graph outcome",
          (await EvidenceChecker.check(file)).exitCode,
          valid ? 0 : 1,
        );
        TestValidator.equals(
          "checking creates no files",
          (await readdir(directory)).sort(
            (left: string, right: string): number => left.localeCompare(right),
          ),
          ["api.ts", "evidence.config.ts", "requirements.md"],
        );
      }
    },
  );
}
