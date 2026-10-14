import {
  EvidenceChecker,
  EvidenceFingerprint,
  EvidenceInventory,
} from "@wrtnlabs/evidence";
import type {
  IEvidenceCheckReport,
  IEvidenceInventory,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Propagates an exclusion on a source file or owner to every declaration
 * beneath it.
 *
 * Markdown publishes a file unit, so a document-level exclusion already retires
 * its sections. Code adapters publish no file owner, which made a file target
 * unresolvable and forced one exclusion per declaration. The inventory now
 * gives each single-file declaration a structural file unit, so one tag on a
 * file covers its types, functions and properties.
 *
 * 1. Exclude `lib/a.ts` against type, function and property selectors and require
 *    only the declaration of `lib/b.ts` to stay missing.
 * 2. Exclude a class and require only its properties to be covered.
 * 3. Exclude a barrel that only re-exports and require the re-exported class to
 *    stay missing, because the barrel declares nothing.
 * 4. Cite the file positively and require its declarations to be covered, as for
 *    any aggregate target.
 * 5. Review the file exclusion with the file unit's fingerprint, then edit one
 *    member and require the review to become stale.
 * 6. Forbid exclusions and require the file exclusion to be rejected.
 * 7. Merge one C# partial class from two files; excluding one of its files must
 *    leave the class an obligation, and excluding the class itself must cover
 *    it.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs EvidenceChecker on real configurations and asserts exit codes, the exact missing acknowledgements and review diagnostics for file, owner, barrel, positive, reviewed, forbidden and multi-file exclusions.
 * @evidence contracts/testing.md#independent-expectations Expected missing sets are written from the fixture's declarations and the documented rule that a file owns only declarations sited in it alone; the review expectation is relational, valid before a member edit and stale after it.
 * @evidence contracts/testing.md#distinguishing-cases Covers a file against three selectors beside an unexcluded sibling file, an owner versus its sibling, a re-export-only barrel, positive aggregate citation, review expiry, noEvidenceExclude, and a C# partial class split across files.
 * @evidence contracts/testing.md#execution-ownership The exported test_graph_file_exclusion is discovered by DynamicExecutor and calls maintained source in-process; the only child process is the product's own read-only configuration evaluator. It installs nothing and spawns no CLI.
 */
export async function test_graph_file_exclusion(): Promise<void> {
  const location = join(__dirname, `file exclusion ${randomUUID()}`);
  await EvidenceTestFileSystem.experiment(
    location,
    {
      "evidence.config.ts": config(
        `{ type: "typescript", files: ["lib/**/*.ts"], symbol: ["type", "function", "property"] }`,
      ),
      "lib/a.ts": LIBRARY,
      "lib/b.ts": "export function other(): void {}\n",
      "lib/index.ts": `export { Klass } from "./a";\n`,
      "src/impl.ts": claim(
        "@evidenceExclude ../lib/a.ts Not part of this feature.",
      ),
    },
    async (directory) => {
      const file: string = join(directory, "evidence.config.ts");

      // One file exclusion covers every declaration of that file only.
      TestValidator.equals(
        "file exclusion missing",
        missing(await EvidenceChecker.check(file)),
        ["lib/b.ts#other"],
      );

      // An owner exclusion covers its members, not its siblings.
      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": config(
          `{ type: "typescript", files: ["lib/a.ts"], symbol: ["property"] }`,
        ),
        "src/impl.ts": claim(
          "@evidenceExclude ../lib/a.ts#Klass Not part of this feature.",
        ),
      });
      TestValidator.equals(
        "owner exclusion missing",
        missing(await EvidenceChecker.check(file)),
        ["lib/a.ts#IShape.size"],
      );

      // A barrel that only re-exports owns no declaration of its own.
      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": config(
          `{ type: "typescript", files: ["lib/**/*.ts"], symbol: ["type"] }`,
        ),
        "src/impl.ts": claim(
          "@evidenceExclude ../lib/index.ts Not part of this feature.",
        ),
      });
      const barrel: IEvidenceCheckReport = await EvidenceChecker.check(file);
      TestValidator.equals("barrel exclusion missing", missing(barrel), [
        "lib/a.ts#IShape",
        "lib/a.ts#Klass",
      ]);

      // A positive file citation behaves like any aggregate target.
      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": config(
          `{ type: "typescript", files: ["lib/a.ts"], symbol: ["type", "function", "property"] }`,
        ),
        "src/impl.ts": claim(
          "@evidence ../lib/a.ts Implements the whole library.",
        ),
      });
      TestValidator.equals(
        "positive file citation",
        (await EvidenceChecker.check(file)).exitCode,
        0,
      );

      // The file unit's fingerprint expires when any covered declaration changes.
      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": config(
          `{ type: "typescript", files: ["lib/a.ts"], symbol: ["type", "function", "property"], requireReview: true }`,
        ),
        "src/impl.ts": claim(
          "@evidenceExclude ../lib/a.ts Not part of this feature.",
        ),
      });
      const fingerprint: string = await fileFingerprint(file, "a.ts");
      await EvidenceTestFileSystem.save(directory, {
        "src/impl.ts": claim(
          "@evidenceExclude ../lib/a.ts Not part of this feature.",
          `@evidenceExcludeReview ../lib/a.ts #${fingerprint} Read the library and confirmed it is out of scope.`,
        ),
      });
      TestValidator.equals(
        "reviewed file exclusion",
        (await EvidenceChecker.check(file)).diagnostics,
        [],
      );
      await EvidenceTestFileSystem.save(directory, {
        "lib/a.ts": LIBRARY.replace("return 2;", "return 3;"),
      });
      const stale: IEvidenceCheckReport = await EvidenceChecker.check(file);
      TestValidator.predicate(
        "member edit expires the file review",
        stale.exitCode === 1 &&
          stale.diagnostics.some((diagnostic) =>
            diagnostic.code.includes("stale"),
          ),
      );

      // Forbidding exclusions still rejects a file exclusion.
      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": config(
          `{ type: "typescript", files: ["lib/a.ts"], symbol: ["type"], noEvidenceExclude: true }`,
        ),
        "src/impl.ts": claim(
          "@evidenceExclude ../lib/a.ts Not part of this feature.",
        ),
      });
      TestValidator.predicate(
        "forbidden file exclusion",
        (await EvidenceChecker.check(file)).diagnostics.some(
          (diagnostic) => diagnostic.code === "graph-forbidden-exclusion",
        ),
      );

      // A declaration merged from two files is retired only by both files.
      await EvidenceTestFileSystem.save(directory, {
        "evidence.config.ts": config(
          `{ type: "csharp", files: ["cs/**/*.cs"], symbol: ["type"] }`,
        ),
        "cs/First.cs": "public partial class Sale { public int Id; }\n",
        "cs/Second.cs": "public partial class Sale { public int Price; }\n",
        "cs/Other.cs": "public class Other {}\n",
        "src/impl.ts": claim(
          "@evidenceExclude ../cs/First.cs Not part of this feature.",
          "@evidenceExclude ../cs/Other.cs Not part of this feature.",
        ),
      });
      TestValidator.equals(
        "one partial file keeps the class",
        missing(await EvidenceChecker.check(file)),
        ["cs/First.cs#Sale"],
      );
      await EvidenceTestFileSystem.save(directory, {
        "src/impl.ts": claim(
          "@evidenceExclude ../cs/First.cs#Sale Not part of this feature.",
          "@evidenceExclude ../cs/Other.cs Not part of this feature.",
        ),
      });
      TestValidator.equals(
        "owner exclusion retires the partial class",
        (await EvidenceChecker.check(file)).exitCode,
        0,
      );
    },
  );
}

const LIBRARY: string = dedent`
  export class Klass {
    public first: number = 1;
    public second(): number {
      return 2;
    }
  }
  export interface IShape {
    size: number;
  }
  export function helper(): void {}
`;

function config(reference: string): string {
  return `export default { claims: [{ type: "typescript", files: ["src/**/*.ts"], symbol: "function", reference: ${reference} }] };\n`;
}

function claim(...tags: string[]): string {
  return [
    "/**",
    " * Implementation.",
    " *",
    ...tags.map((tag) => ` * ${tag}`),
    " */",
    "export function impl(): void {}",
    "",
  ].join("\n");
}

/** Lists missing acknowledgements as file-relative targets, sorted. */
function missing(report: IEvidenceCheckReport): string[] {
  return report.diagnostics
    .filter((diagnostic) => diagnostic.code === "graph-missing-acknowledgement")
    .map(
      (diagnostic) =>
        /'.*\/((?:lib|cs)\/[^']+)'/.exec(diagnostic.message)?.[1] ??
        diagnostic.message,
    )
    .sort((x, y) => x.localeCompare(y, "en"));
}

/** Computes the current fingerprint of the file unit owning `name`. */
async function fileFingerprint(config: string, name: string): Promise<string> {
  const analysis = await EvidenceChecker.analyze(config);
  const reference: IEvidenceInventory | undefined =
    analysis.graphInput.claims[0]?.references[0]?.inventory;
  if (reference === undefined) throw new Error("Missing reference inventory.");
  const unit = new EvidenceInventory([reference], { fileScopes: true })
    .snapshot()
    .units.find(
      (candidate) =>
        candidate.symbol === "file" && candidate.name.endsWith(name),
    );
  if (unit === undefined) throw new Error(`Missing file unit for ${name}.`);
  return EvidenceFingerprint.inspect(reference, unit.id).fingerprint;
}
