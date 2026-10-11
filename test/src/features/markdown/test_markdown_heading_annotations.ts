import {
  EvidenceFingerprint,
  EvidenceMarkdownAdapter,
} from "@wrtnlabs/evidence";
import type {
  IEvidenceDeclaration,
  IEvidenceDiagnostic,
  IEvidenceHost,
  IEvidenceReview,
  IEvidenceInventory,
  IEvidenceUnit,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Attaches visible heading annotations without losing the Markdown outline.
 *
 * Long explanations may contain ordinary child sections and examples. Tagged
 * child headings start independent carriers while HTML annotations keep their
 * established ownership and source coordinates.
 *
 * 1. Analyze CRLF Markdown with H2/H3 evidence, an H4 exclusion, and a review
 *    comment.
 * 2. Verify targets, explanations, structural parents, and exact host ownership.
 * 3. Keep examples and comment-hidden headings inert; report unsupported visible
 *    tags.
 * 4. Edit annotation prose and require stable fingerprints, then edit ordinary
 *    semantic text and require the file fingerprint to change.
 */
export async function test_markdown_heading_annotations(): Promise<void> {
  const content: string = dedent`
    # Guide
    Ordinary semantic text.
    ## @evidence docs/spec.md#authentication {#authentication} ##

    Validates tokens.
    ### Validation steps
    - Checks the signature.
    ~~~markdown
    ### @evidence docs/fake.md#fenced Example only.
    ~~~
        #### @evidence docs/fake.md#indented Example only.
    <pre>
    ### @evidence docs/fake.md#pre Example only.
    </pre>
    <!--
    ### Example mentioning @evidence docs/fake.md#hidden
    -->
    <!-- @evidenceReview docs/spec.md#authentication #abcdef0 Checked token handling. -->
    Rejects expired tokens.
    ##<!-- hidden --> @evidence docs/fake.md#fabricated Not an authored heading.
    ### @evidence docs/spec.md#errors {#errors}
    Returns a common error response.
    #### @evidenceExclude docs/spec.md#billing {#billing}
    Billing belongs to an external service.
    #### Ordinary peer
    This prose is outside the exclusion.
    ## Unrelated section
    @evidence docs/fake.md#plain Unsupported prose.
    # @evidence docs/fake.md#h1 Unsupported annotation depth.
    ##### @evidence docs/fake.md#h5 Unsupported annotation depth.
    ###### @evidence docs/fake.md#h6 Unsupported annotation depth.
  `.replaceAll("\n", "\r\n");
  const adapter: EvidenceMarkdownAdapter = new EvidenceMarkdownAdapter();
  const inventory: IEvidenceInventory = await adapter.analyze(
    EvidenceTestSourceSnapshot.create("guide.md", content),
  );

  TestValidator.equals(
    "visible targets",
    inventory.declarations.map(
      (entry: IEvidenceDeclaration): string => entry.target,
    ),
    [
      "docs/spec.md#authentication",
      "docs/spec.md#errors",
      "docs/spec.md#billing",
    ],
  );
  TestValidator.equals(
    "visible reasons",
    inventory.declarations.map((entry: IEvidenceDeclaration): string =>
      entry.reason.replace(/\n{2,}/gu, "\n"),
    ),
    [
      "Validates tokens.\n### Validation steps\n- Checks the signature.\nRejects expired tokens.",
      "Returns a common error response.",
      "Billing belongs to an external service.",
    ],
  );
  TestValidator.equals(
    "unsupported visible spellings",
    inventory.diagnostics.map(
      (entry: IEvidenceDiagnostic): string => entry.code,
    ),
    new Array<string>(5).fill("unsupported-annotation-host"),
  );
  const authentication: IEvidenceUnit = requireUnit(
    inventory,
    "authentication",
  );
  const errors: IEvidenceUnit = requireUnit(inventory, "errors");
  const billing: IEvidenceUnit = requireUnit(inventory, "billing");
  TestValidator.equals(
    "tagged child retains structural parent",
    errors.parentId,
    authentication.id,
  );
  TestValidator.equals(
    "exclusion child retains structural parent",
    billing.parentId,
    errors.id,
  );
  for (const declaration of inventory.declarations) {
    const host: IEvidenceHost | undefined = inventory.hosts.find(
      (entry: IEvidenceHost): boolean => entry.id === declaration.hostId,
    );
    const anchor: string = declaration.target.split("#")[1] ?? "";
    TestValidator.equals(`host owns ${anchor}`, host?.unitIds, [
      requireUnit(inventory, anchor).id,
    ]);
  }
  const review: IEvidenceReview | undefined = inventory.reviews[0];
  const reviewHost: IEvidenceHost | undefined = inventory.hosts.find(
    (entry: IEvidenceHost): boolean => entry.id === review?.hostId,
  );
  // HTML comments follow the nearest outline section, even inside a visible reason.
  TestValidator.equals(
    "review comment keeps nearest section ownership",
    reviewHost?.unitIds,
    [requireUnit(inventory, "validation-steps").id],
  );
  const first: IEvidenceDeclaration | undefined = inventory.declarations[0];
  if (first === undefined || first.location.range === undefined)
    throw new Error("Missing visible annotation range.");
  TestValidator.equals(
    "original CRLF heading line",
    first.location.range.start.line,
    3,
  );
  TestValidator.predicate(
    "original heading prefix",
    content.slice(first.location.range.start.offset).startsWith("## @evidence"),
  );

  const proseEdit: IEvidenceInventory = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "guide.md",
      content.replace(
        "Validates tokens.",
        "Validates signatures and expiration with the configured key.",
      ),
    ),
  );
  const semanticEdit: IEvidenceInventory = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "guide.md",
      content.replace(
        "Ordinary semantic text.",
        "Changed requirement content.",
      ),
    ),
  );
  TestValidator.equals(
    "annotation prose does not change fingerprint",
    EvidenceFingerprint.inspect(proseEdit, proseEdit.units[0]?.id ?? "")
      .fingerprint,
    EvidenceFingerprint.inspect(inventory, inventory.units[0]?.id ?? "")
      .fingerprint,
  );
  TestValidator.predicate(
    "ordinary prose changes fingerprint",
    EvidenceFingerprint.inspect(semanticEdit, semanticEdit.units[0]?.id ?? "")
      .fingerprint !==
      EvidenceFingerprint.inspect(inventory, inventory.units[0]?.id ?? "")
        .fingerprint,
  );
}

/**
 * Finds an outline identity used by annotation ownership assertions.
 *
 * A missing unit fails the scenario instead of silently shrinking its
 * population.
 */
function requireUnit(
  inventory: IEvidenceInventory,
  anchor: string,
): IEvidenceUnit {
  const unit: IEvidenceUnit | undefined = inventory.units.find(
    (entry: IEvidenceUnit): boolean => entry.identity[0] === anchor,
  );
  if (unit === undefined)
    throw new Error(`Missing Markdown heading ${anchor}.`);
  return unit;
}
