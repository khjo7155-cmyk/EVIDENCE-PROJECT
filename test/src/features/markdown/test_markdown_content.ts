import { EvidenceMarkdownAdapter } from "@wrtnlabs/evidence";
import type { IEvidenceInventory, IEvidenceUnit } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Partitions Markdown content among file and heading units at real section
 * boundaries.
 *
 * Evidence needs each unit's owned ranges to exclude nested supported sections
 * while retaining deep headings, fenced text, and prose that belongs to the
 * current section.
 *
 * 1. Analyze file prelude, nested H1-H4 sections, an anchorless heading, a deep
 *    heading, and annotations.
 * 2. Verify owned content ranges:
 *
 *    - The file retains its prelude and the H1 retains its anchorless region.
 *    - The H2 contains only its direct section.
 *    - The H4 retains deep and fenced content but excludes a comment-only line.
 * 3. Verify the later H3 reconnects to the real H1 ancestor.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes nested Markdown sections and asserts each unit's owned content ranges and ancestry.
 * @evidence contracts/testing.md#independent-expectations Expected ranges are derived from the authored section boundaries.
 * @evidence contracts/testing.md#distinguishing-cases Covers the file prelude, an anchorless H1 region, a direct H2 section, deep and fenced content in an H4, an excluded comment-only line and reconnection to the real H1.
 * @evidence contracts/testing.md#execution-ownership The exported test_markdown_content is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_markdown_content(): Promise<void> {
  const content = dedent`
    File prelude.
    # Parent
    Parent body.
    ## Child
    Child body.
    #### Leaf
    Leaf body.
    ##### Detail
    Detail body.
    ~~~~text
    code change
    ~~~~
    <!-- @evidence docs/spec.md#leaf Supplies the leaf. -->
    Inline <!-- @evidence docs/spec.md#inline Supplies adjacent prose. --> prose.
    ##
    Unanchored body.
    ### Nested after missing
    Nested body.
  `;
  const inventory = await new EvidenceMarkdownAdapter().analyze(
    EvidenceTestSourceSnapshot.create("guide.md", content),
  );
  const file = requireUnit(inventory, "file", "guide.md");
  const parent = requireUnit(inventory, "h1", "Parent");
  const child = requireUnit(inventory, "h2", "Child");
  const leaf = requireUnit(inventory, "h4", "Leaf");
  const nested = requireUnit(inventory, "h3", "Nested after missing");

  TestValidator.equals("file owns its prelude", lines(content, file), [
    "File prelude.",
  ]);
  TestValidator.equals(
    "parent owns the anchorless H2 region",
    lines(content, parent),
    ["# Parent", "Parent body.", "##", "Unanchored body."],
  );
  TestValidator.equals(
    "child owns only its direct section",
    lines(content, child),
    ["## Child", "Child body."],
  );
  TestValidator.equals(
    "deep and fenced content stays with H4",
    lines(content, leaf),
    [
      "#### Leaf",
      "Leaf body.",
      "##### Detail",
      "Detail body.",
      "~~~~text",
      "code change",
      "~~~~",
      "Inline <!-- @evidence docs/spec.md#inline Supplies adjacent prose. --> prose.",
    ],
  );
  TestValidator.equals(
    "later H3 belongs to the real H1 ancestor",
    nested.parentId,
    parent.id,
  );
  TestValidator.equals(
    "comment-only lines leave owned content",
    lines(content, leaf).includes(
      "<!-- @evidence docs/spec.md#leaf Supplies the leaf. -->",
    ),
    false,
  );
}

function requireUnit(
  inventory: IEvidenceInventory,
  symbol: IEvidenceUnit["symbol"],
  name: string,
): IEvidenceUnit {
  const unit = inventory.units.find(
    (candidate) => candidate.symbol === symbol && candidate.name === name,
  );
  if (unit === undefined)
    throw new Error(`Missing Markdown unit: ${symbol} ${name}`);
  return unit;
}

function lines(content: string, unit: IEvidenceUnit): string[] {
  const site = unit.sites[0];
  if (site === undefined)
    throw new Error(`Markdown unit ${unit.id} has no site.`);
  return site.content.map((range) =>
    content.slice(range.start.offset, range.end.offset),
  );
}
