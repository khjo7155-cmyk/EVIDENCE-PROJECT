import { EvidenceTagParser } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestDocumentation } from "../../internal/EvidenceTestDocumentation";

/**
 * Resets annotation continuations, fences, and diagnostics for every parse.
 *
 * Reusing a controller after mutating its original host and a previous result
 * preserves the captured documentation and its valid annotation.
 *
 * 1. Parse a host and retain its baseline annotation result.
 * 2. Mutate the original host and prior result, then parse again.
 * 3. Verify fresh controller state and an unaffected second controller.
 *
 * @evidence contracts/testing.md#behavioral-verification Parses a host, mutates the original host and prior result, parses again, and asserts the second result and a second controller are unaffected.
 * @evidence contracts/testing.md#independent-expectations The expected annotation is the fixture's single authored tag; isolation is checked by comparing against the baseline result rather than recorded output.
 * @evidence contracts/testing.md#distinguishing-cases Covers reuse of one controller after caller mutation and a fresh controller; tag grammar details are owned by the other tag tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_tag_context is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_tag_context(): Promise<void> {
  const fixture = EvidenceTestDocumentation.create(dedent`
    /**
     * @evidence ../real.ts#run Implements the behavior.
     * Continued reason.
     * ~~~typescript
     * @evidence ../example.ts#fake This remains fenced.
     */
  `);
  const parser = new EvidenceTagParser(
    fixture.content,
    fixture.host,
    fixture.documentation,
  );
  const first = parser.parse();
  const baseline = structuredClone(first);

  TestValidator.equals(
    "only real annotation",
    first.declarations.map((entry) => entry.target),
    ["../real.ts#run"],
  );
  TestValidator.equals("no parser findings", first.diagnostics, []);

  // Neither input mutation nor a consumed result may change subsequent parses.
  fixture.host.attachment = "unsupported";
  fixture.documentation.text = "";
  first.declarations.length = 0;
  TestValidator.equals("fresh parse state", parser.parse(), baseline);

  // A different controller retains its own malformed-annotation finding.
  const invalid = EvidenceTestDocumentation.create(
    "/** @evidence ../missing.ts#run */",
  );
  const rejected = new EvidenceTagParser(
    invalid.content,
    invalid.host,
    invalid.documentation,
  ).parse();
  TestValidator.equals(
    "missing reason",
    rejected.diagnostics.map((entry) => entry.code),
    ["missing-evidence-reason"],
  );
  TestValidator.equals("other controller unaffected", parser.parse(), baseline);
}
