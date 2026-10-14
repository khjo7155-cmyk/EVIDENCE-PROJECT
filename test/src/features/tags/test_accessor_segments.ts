import { EvidenceAccessor } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";

/**
 * Parses literal accessor segments without normalizing their public spelling.
 *
 * Dots, spaces, Unicode, escapes, and unsigned numeric names remain distinct
 * target segments.
 *
 * 1. Round-trip identifier, quoted, numeric, Unicode, escaped, and empty literal
 *    segments through formatting and parsing.
 * 2. Verify numeric brackets and literal dots preserve their intended segment
 *    boundaries.
 * 3. Reject empty, malformed, unterminated, noncanonical numeric, quoted, and
 *    invalid-identifier accessor spellings.
 *
 * @evidence contracts/testing.md#behavioral-verification Round-trips literal segments through EvidenceAccessor.format and parse and parses malformed spellings; a parser that split dots inside brackets, dropped Unicode or escapes, or accepted noncanonical numbers would fail.
 * @evidence contracts/testing.md#independent-expectations Expected segment arrays and canonical spellings such as A["B.C"] are written from the accessor grammar (dotted identifiers, JSON-string and unsigned-integer brackets), not taken from parser output.
 * @evidence contracts/testing.md#distinguishing-cases Positive cases cover identifiers, quoted dots and spaces, Unicode, escapes, numeric and empty segments; negatives cover empty, leading or trailing dots, double dots, signed or zero-padded numbers, single quotes, unterminated brackets and digit-initial names. Target resolution is left to the resolver tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_accessor_segments is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_accessor_segments(): Promise<void> {
  const cases: string[][] = [
    ["SomeClass", "prototype", "member"],
    ["SomeNamespace", "a.b"],
    ["SomeClass", "space name"],
    ["한글", 'a"b\\c'],
    ["Tuple", "0"],
    ["$scope_2", "e\u0301"],
    ["", "😀"],
  ];
  for (const segments of cases)
    TestValidator.equals(
      "accessor round trip",
      EvidenceAccessor.parse(EvidenceAccessor.format(segments)),
      segments,
    );
  TestValidator.equals(
    "numeric bracket stays a literal segment",
    EvidenceAccessor.parse("Tuple[0]"),
    ["Tuple", "0"],
  );
  TestValidator.equals(
    "literal dot stays quoted",
    EvidenceAccessor.format(["A", "B.C"]),
    'A["B.C"]',
  );

  for (const text of [
    "",
    ".A",
    "A.",
    "A..B",
    "A.[0]",
    "A[-1]",
    "A[01]",
    "A['field']",
    'A["unterminated]',
    "A[true]",
    "A[0]B",
    "2startsWithDigit",
    "\u0301startsWithMark",
  ])
    await TestValidator.error("malformed accessor", async () =>
      EvidenceAccessor.parse(text),
    );
}
