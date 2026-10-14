import {
  EvidenceDocumentation,
  EvidenceParser,
  EvidenceTagParser,
} from "@wrtnlabs/evidence";
import type { IEvidenceHost } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

/**
 * Uses parser-owned comment spans to exclude tag-shaped code text.
 *
 * Strings and regular expressions can resemble annotations but only real
 * comment spans may enter documentation parsing.
 *
 * 1. Parse source containing a tag-shaped string, regular expression, and real
 *    documentation comment through the TypeScript syntax tree.
 * 2. Map only parser-captured comment spans into documentation and parse tags.
 * 3. Require the real comment's one target while excluding both code-text
 *    lookalikes.
 *
 * @evidence contracts/testing.md#behavioral-verification Parses TypeScript through EvidenceParser, maps only syntax-tree comment spans, and asserts exactly one target from the real comment.
 * @evidence contracts/testing.md#independent-expectations The expected single target is the authored comment's; the string and regular-expression lookalikes are known non-comments by construction.
 * @evidence contracts/testing.md#distinguishing-cases Contrasts a real documentation comment with tag-shaped string and regex literals; comment attachment rules belong to adapter tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_tag_parser_tree_comments is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_tag_parser_tree_comments(): Promise<void> {
  const content = dedent`
    const example = "/** @evidence ../fake.ts#name Not a comment. */";
    const expression = /@evidence/;
    /** @evidence ../real.ts#run Verifies the function. */
    export function test_run() {}
  `;
  const parser = new EvidenceParser();
  try {
    const targets = await parser.parse(
      { type: "typescript", file: "/project/test.ts", content },
      (session) => {
        return session
          .captures("(comment) @documentation")
          .flatMap((capture) => {
            const range = session.range(capture.node);
            const host: IEvidenceHost = {
              id: "test-doc",
              file: "/project/test.ts",
              range,
              siteId: "test-site",
              unitIds: ["test-run"],
              attachment: "attached",
            };
            const documentation = EvidenceDocumentation.read(
              content,
              host.id,
              range,
              {
                opening: "/**",
                closing: "*/",
                linePrefix: "*",
                tagBoundaries: true,
                allowWithdrawal: true,
              },
            );
            return EvidenceTagParser.parse(
              content,
              host,
              documentation,
            ).declarations.map((entry) => entry.target);
          });
      },
    );
    TestValidator.equals(
      "only the real documentation comment contributes",
      targets,
      ["../real.ts#run"],
    );
  } finally {
    await parser.close();
  }
}
