import { EvidenceObjcAdapter } from "@wrtnlabs/evidence";
import { assertEvidenceLiteralData } from "../../internal/assertEvidenceLiteralData";
import type { IEvidenceLiteralFixture } from "../../internal/IEvidenceLiteralFixture";

/**
 * Preserves Objc expression strings as implementation data.
 *
 * Tag-shaped literal content must retain the public denominator and participate
 * in review fingerprints while independently attached documentation still
 * works.
 *
 * 1. Exercise the language's selected literal carriers with every annotation
 *    category, escaped quotes, multiline prefixes and CRLF content.
 * 2. Require unchanged identities, hosts, addresses and withdrawals with no
 *    annotations, reviews, additional accepted ranges or diagnostics.
 * 3. Attach real documentation and require its acknowledgement alone; edit literal
 *    data independently and require a changed owner fingerprint.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes Objective-C sources whose string expressions hold tag-shaped text through assertEvidenceLiteralData and asserts unchanged identities, hosts and addresses, no annotations or diagnostics, real documentation still acknowledged, and a changed owner fingerprint when the literal changes.
 * @evidence contracts/testing.md#independent-expectations The expected inventory is the same source analyzed without tag-shaped content, an independent baseline built by the shared helper rather than a stored snapshot.
 * @evidence contracts/testing.md#distinguishing-cases Covers every annotation category inside string expressions, escaped quotes, multiline prefixes and CRLF, plus a real attached comment and a literal-only edit. Attachment rules are owned by test_objc_hosts.
 * @evidence contracts/testing.md#execution-ownership The exported test_objc_literal_data is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_objc_literal_data(): Promise<void> {
  const fixtures: IEvidenceLiteralFixture[] = [
    {
      adapter: new EvidenceObjcAdapter(),
      file: "data.m",
      source: (data: string, doc: string): string =>
        `${doc === "" ? "" : `/** ${doc} */\n`}const char *Value(void) { return ${JSON.stringify(data)}; }\n`,
    },
  ];
  await assertEvidenceLiteralData(fixtures);
}
