import { EvidenceTagParser } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestDocumentation } from "../../internal/EvidenceTestDocumentation";

/**
 * Reports common annotation failures without applying reference-specific syntax
 * rules.
 *
 * Tag parsing validates its own required form and preserves invalid inputs as
 * findings.
 *
 * 1. Parse targetless evidence, reasonless evidence, inline links, and malformed
 *    review fingerprints or descriptions.
 * 2. Verify their diagnostic codes while preserving artifact-specific target text
 *    for later resolver validation.
 * 3. Require malformed reviews to create no review records.
 * 4. Parse unattached and unsupported hosts, then require a host diagnostic and no
 *    guessed declaration attachment.
 *
 * @evidence contracts/testing.md#behavioral-verification Parses invalid annotations and unsupported hosts and asserts the diagnostic codes, preserved target text and absence of review or declaration records.
 * @evidence contracts/testing.md#independent-expectations Expected diagnostic codes come from the documented tag contract for missing targets, missing reasons, inline links and malformed reviews.
 * @evidence contracts/testing.md#distinguishing-cases Covers targetless and reasonless evidence, inline {@link}, malformed review fingerprints and descriptions, and unattached and unsupported hosts, while leaving artifact-specific target syntax to resolver tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_tag_diagnostics is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_tag_diagnostics(): Promise<void> {
  const fixture = EvidenceTestDocumentation.create(dedent`
    /**
     * @evidence
     * @evidence ../source.ts#value
     * @evidence ../source.ts#A.[0] Invalid accessor.
     * @evidence ../bad%ZZ.ts#value Invalid percent encoding.
     * @evidence ../bad%00.ts#value Invalid NUL path.
     * @evidence ../bad%0D.ts#value Invalid carriage return.
     * @evidence ../bad%0A.ts#value Invalid line feed.
     * @evidence {@link Symbol} Compiler-only lookup.
     * @evidence {@linkplain Symbol} Compiler-only lookup.
     * @evidenceReview docs/spec.md#rule #A3F9C1D
     * @evidenceReview docs/spec.md#rule #a3f9c1d
     */
  `);
  const result = EvidenceTagParser.parse(
    fixture.content,
    fixture.host,
    fixture.documentation,
  );

  TestValidator.equals(
    "diagnostic categories",
    result.diagnostics.map((diagnostic) => diagnostic.code),
    [
      "malformed-target",
      "missing-evidence-reason",
      "unsupported-inline-link",
      "unsupported-inline-link",
      "malformed-fingerprint",
      "missing-review-description",
    ],
  );
  TestValidator.equals(
    "artifact-specific targets survive for their resolver",
    result.declarations.map((declaration) => declaration.target),
    [
      "../source.ts#A.[0]",
      "../bad%ZZ.ts#value",
      "../bad%00.ts#value",
      "../bad%0D.ts#value",
      "../bad%0A.ts#value",
    ],
  );
  TestValidator.equals("invalid reviews add no reviews", result.reviews, []);

  for (const attachment of ["unattached", "unsupported"] as const) {
    const unowned = EvidenceTestDocumentation.create(
      "/** @evidence ../source.ts#value Supplies evidence. */",
      undefined,
      attachment,
    );
    const parsed = EvidenceTagParser.parse(
      unowned.content,
      unowned.host,
      unowned.documentation,
    );
    TestValidator.equals(
      "unsupported host remains a finding",
      parsed.diagnostics.map((diagnostic) => diagnostic.code),
      ["unsupported-annotation-host"],
    );
    TestValidator.equals(
      "no guessed next-declaration attachment",
      parsed.declarations,
      [],
    );
  }
}
