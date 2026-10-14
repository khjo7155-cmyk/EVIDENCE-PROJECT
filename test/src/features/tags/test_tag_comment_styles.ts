import { EvidenceTagParser } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestDocumentation } from "../../internal/EvidenceTestDocumentation";

/**
 * Parses supported comment styles with exact CRLF source locations.
 *
 * HTML prose and Prisma-style carriers have distinct tag boundaries that must
 * preserve original coordinates.
 *
 * 1. Parse HTML comments where foreign tags remain evidence prose and cannot
 *    create withdrawals, while an evidence review ends the acknowledgement.
 * 2. Parse CRLF Prisma-style line comments where a foreign tag ends the reason and
 *    an `@internal` line withdraws the declaration.
 * 3. Verify the extracted annotation span excludes the CR and comment prefix and
 *    retains its original line and column.
 *
 * @evidence contracts/testing.md#behavioral-verification Parses HTML-comment and CRLF Prisma-style documentation with EvidenceTagParser and asserts statements, withdrawals and exact annotation ranges.
 * @evidence contracts/testing.md#independent-expectations Expected boundaries and coordinates are derived by hand from the fixture text and the documented tag-boundary rules for each carrier style.
 * @evidence contracts/testing.md#distinguishing-cases Distinguishes the HTML style, where foreign tags stay prose and withdrawals are not allowed, from the line style, where foreign tags end reasons and @internal withdraws, and checks that CR and prefixes are excluded from spans. Attachment decisions belong to adapter tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_tag_comment_styles is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_tag_comment_styles(): Promise<void> {
  const html = EvidenceTestDocumentation.create(
    dedent`
    <!--
      @evidence docs/spec.md#rule Implements the rule.
      @architecture approved this wording.
      @internal is prose in this host grammar.
      @evidenceReview docs/spec.md#rule Reviewed the claim.
    -->
  `,
    {
      opening: "<!--",
      closing: "-->",
      tagBoundaries: false,
      allowWithdrawal: false,
    },
  );
  const htmlResult = EvidenceTagParser.parse(
    html.content,
    html.host,
    html.documentation,
  );
  TestValidator.equals(
    "HTML has no foreign-tag field syntax",
    htmlResult.declarations.map((entry) => entry.reason),
    [
      "Implements the rule.\n@architecture approved this wording.\n@internal is prose in this host grammar.",
    ],
  );
  TestValidator.equals(
    "HTML prose cannot withdraw a declaration",
    htmlResult.withdrawals,
    [],
  );
  TestValidator.equals(
    "review still ends HTML acknowledgement",
    htmlResult.reviews.length,
    1,
  );

  const prisma = EvidenceTestDocumentation.create(
    dedent`
    /// @evidence prisma:Sale.price Implements the column.
    /// @namespace Shop
    /// @internal Implementation detail.
  `.replaceAll("\n", "\r\n"),
    {
      opening: "",
      closing: "",
      linePrefix: "///",
      tagBoundaries: true,
      allowWithdrawal: true,
    },
  );
  const prismaResult = EvidenceTagParser.parse(
    prisma.content,
    prisma.host,
    prisma.documentation,
  );
  TestValidator.equals(
    "Prisma foreign tag closes reason",
    prismaResult.declarations.map((entry) => entry.reason),
    ["Implements the column."],
  );
  TestValidator.equals(
    "line-start withdrawal",
    prismaResult.withdrawals.map((withdrawal) => withdrawal.tag),
    ["internal"],
  );

  const entry = prismaResult.declarations[0];
  if (entry === undefined || entry.location.range === undefined)
    throw new Error("Missing annotation range.");
  const range = entry.location.range;
  const expected = "@evidence prisma:Sale.price Implements the column.";
  TestValidator.equals(
    "exact source span excludes CR and comment prefix",
    prisma.content.slice(range.start.offset, range.end.offset),
    expected,
  );
  TestValidator.equals("original one-based source line", range.start.line, 2);
  TestValidator.equals("original column after prefix", range.start.column, 5);
}
