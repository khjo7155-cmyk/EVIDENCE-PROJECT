import { EvidenceMarkdownAdapter } from "@wrtnlabs/evidence";
import type {
  IEvidenceDeclaration,
  IEvidenceDiagnostic,
  IEvidenceUnit,
  IEvidenceInventory,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Keeps malformed Markdown headings from acquiring targets or reasons by
 * proximity.
 *
 * A targetless heading and a reasonless section must fail independently while a
 * later valid section remains available to the graph.
 *
 * 1. Analyze missing targets, peer/parent boundaries, and an example-only reason.
 * 2. Require precise parser findings and no fabricated acknowledgement.
 * 3. Verify that unsupported plain tags inside a reason stay findings and do not
 *    become additional declarations.
 * 4. Recover at a valid H4 section while retaining all real heading units.
 */
export async function test_markdown_heading_failures(): Promise<void> {
  const inventory: IEvidenceInventory =
    await new EvidenceMarkdownAdapter().analyze(
      EvidenceTestSourceSnapshot.create(
        "guide.md",
        dedent`
    ## @evidence {#missing-target}
    Explanation cannot supply the target.
    ## @evidence docs/spec.md#peer {#missing-reason}
    ## Ordinary peer
    This is outside the preceding reason.
    ### @evidenceExclude docs/spec.md#parent
    # Ordinary parent
    This is outside the exclusion.
    ## @evidence docs/spec.md#example
    ~~~text
    Example content cannot supply a reason.
    ~~~
    ## @evidence docs/spec.md#real {#real}
    Supplies the real behavior.
    @evidence docs/fake.md#plain Unsupported visible prose.
    #### @evidence docs/spec.md#recovered {#recovered}
    Supplies the later behavior.
  `,
      ),
    );

  TestValidator.equals(
    "valid sections recover",
    inventory.declarations.map(
      (entry: IEvidenceDeclaration): string => entry.target,
    ),
    ["docs/spec.md#real", "docs/spec.md#recovered"],
  );
  TestValidator.equals(
    "failures and unsupported prose",
    inventory.diagnostics
      .map((entry: IEvidenceDiagnostic): string => entry.code)
      .sort((left: string, right: string): number => left.localeCompare(right)),
    [
      "malformed-target",
      "missing-evidence-reason",
      "missing-evidence-reason",
      "missing-evidence-reason",
      "unsupported-annotation-host",
    ],
  );
  TestValidator.equals(
    "invalid headings remain in the population",
    inventory.units.filter(
      (entry: IEvidenceUnit): boolean =>
        entry.identity[0] === "missing-target" ||
        entry.identity[0] === "missing-reason",
    ).length,
    2,
  );
}
