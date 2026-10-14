import { EvidenceTagParser } from "@wrtnlabs/evidence";
import type {
  IEvidenceDeclaration,
  IEvidenceReview,
  IEvidenceTagParseResult,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestDocumentation } from "../../internal/EvidenceTestDocumentation";
import type { IEvidenceTestDocumentation } from "../../internal/IEvidenceTestDocumentation";

/**
 * Parses independent heading annotations with structured multiline
 * explanations.
 *
 * Heading depth controls ordinary section boundaries, while a tagged deeper
 * heading always starts a new annotation on the same documented declaration.
 *
 * 1. Parse CRLF JSDoc with H2-H4 evidence, nested explanations, and exclusions.
 * 2. Keep prose across fenced examples without accepting example tags.
 * 3. Require ordinary peer headings and foreign tags to end their reasons.
 * 4. Verify links, review kinds, fingerprints, legacy tags, and original ranges.
 *
 * @evidence contracts/testing.md#behavioral-verification Parses CRLF JSDoc with H2-H4 tagged sections and asserts each annotation's kind, target, multiline explanation, boundaries and original ranges.
 * @evidence contracts/testing.md#independent-expectations Expected explanations and section ends are written from the heading rules (ordinary same-or-higher headings and foreign tags end reasons; tagged deeper headings start new annotations).
 * @evidence contracts/testing.md#distinguishing-cases Covers nested tagged headings, fenced examples inside explanations, peer-heading and foreign-tag termination, links, review kinds, fingerprints and legacy line tags. Failures are owned by test_tag_heading_failures.
 * @evidence contracts/testing.md#execution-ownership The exported test_tag_heading_sections is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_tag_heading_sections(): Promise<void> {
  const fixture: IEvidenceTestDocumentation = EvidenceTestDocumentation.create(
    dedent`
    /**
     * ## @evidence docs/spec.md#authentication ##
     *
     * Validates the token.
     *
     * ### Validation steps
     * - Checks the signature.
     * ~~~markdown
     * #### @evidence docs/fake.md#example Example only.
     * ~~~
     * Rejects expired tokens.
     * ### @evidence docs/spec.md#errors
     * Returns the common error response.
     * ### Unrelated section
     * This prose belongs to neither reason.
     * #### @evidenceExclude docs/spec.md#billing {#billing}
     * An external service handles billing.
     * @param request The incoming request.
     * This parameter text is outside the exclusion.
     * ## @evidenceReview docs/spec.md#authentication #abcdef0
     * Checked signature and expiry handling.
     * ### @evidenceExcludeReview docs/spec.md#billing #1234567
     * Verified external ownership.
     * #### @link ../source.ts#run
     * Calls the public entry point.
     * @evidence docs/spec.md#legacy Preserves compact tags.
     */
  `.replaceAll("\n", "\r\n"),
  );
  const result: IEvidenceTagParseResult = EvidenceTagParser.parse(
    fixture.content,
    fixture.host,
    fixture.documentation,
  );

  TestValidator.equals("heading diagnostics", result.diagnostics, []);
  TestValidator.equals(
    "targets and exclusions",
    result.declarations.map((entry: IEvidenceDeclaration): string[] => [
      entry.kind,
      entry.target,
    ]),
    [
      ["evidence", "docs/spec.md#authentication"],
      ["evidence", "docs/spec.md#errors"],
      ["evidenceExclude", "docs/spec.md#billing"],
      ["evidence", "../source.ts#run"],
      ["evidence", "docs/spec.md#legacy"],
    ],
  );
  TestValidator.equals(
    "structured reasons respect boundaries",
    result.declarations.map(
      (entry: IEvidenceDeclaration): string => entry.reason,
    ),
    [
      "Validates the token.\n\n### Validation steps\n- Checks the signature.\nRejects expired tokens.",
      "Returns the common error response.",
      "An external service handles billing.",
      "Calls the public entry point.",
      "Preserves compact tags.",
    ],
  );
  TestValidator.equals(
    "reviews remain independent",
    result.reviews.map((entry: IEvidenceReview): string[] => [
      entry.reviews,
      entry.fingerprint ?? "",
      entry.description,
    ]),
    [
      ["evidence", "abcdef0", "Checked signature and expiry handling."],
      ["evidenceExclude", "1234567", "Verified external ownership."],
    ],
  );
  const first: IEvidenceDeclaration | undefined = result.declarations[0];
  if (first === undefined || first.location.range === undefined)
    throw new Error("Missing heading range.");
  TestValidator.equals(
    "original heading line",
    first.location.range.start.line,
    3,
  );
  TestValidator.equals(
    "original heading column",
    first.location.range.start.column,
    4,
  );
  TestValidator.predicate(
    "range begins at authored heading",
    fixture.content
      .slice(first.location.range.start.offset)
      .startsWith("## @evidence docs/spec.md#authentication ##\r\n"),
  );
  TestValidator.predicate(
    "range ends before next tagged heading",
    fixture.content
      .slice(first.location.range.start.offset, first.location.range.end.offset)
      .trimEnd()
      .endsWith("Rejects expired tokens."),
  );
}
