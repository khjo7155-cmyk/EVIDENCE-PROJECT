import {
  EvidenceFingerprint,
  EvidenceGraph,
  EvidenceMarkdownAdapter,
  EvidenceTypeScriptAdapter,
} from "@wrtnlabs/evidence";
import type {
  IEvidenceDeclaration,
  IEvidenceDiagnostic,
  IEvidenceGraphResult,
  IEvidenceInventory,
  IEvidenceUnit,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestGraph } from "../../internal/EvidenceTestGraph";
import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Resolves reviewed heading evidence and exclusions from Markdown and code.
 *
 * The heading spelling must preserve graph policy and fingerprint behavior,
 * including failure when evidence is removed or the reviewed contract changes.
 *
 * 1. Analyze two Markdown requirements and compute their current fingerprints.
 * 2. Cite and review both from Markdown headings and attached TypeScript JSDoc;
 *    require positive coverage and a permitted exclusion in each claim.
 * 3. Remove Markdown evidence and require the uncovered target; prohibit
 *    exclusions and require a policy failure.
 * 4. Change the referenced requirement and require stale-review findings.
 * 5. Change only a JSDoc reason, then the function body, and verify stable then
 *    changed implementation fingerprints.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes Markdown and TypeScript with heading-form evidence and reviews, evaluates the graph across edits, and asserts coverage, policy failures and fingerprints.
 * @evidence contracts/testing.md#independent-expectations Review fingerprints are computed independently with EvidenceFingerprint before evaluation; other expectations follow the heading and policy contracts. Fingerprint expectations are relational (stable versus changed across controlled edits) and follow the documented fingerprint contract, not recorded hash values.
 * @evidence contracts/testing.md#distinguishing-cases Covers Markdown and JSDoc headings, removed evidence, prohibited exclusions, changed requirements, and reason-only versus body edits.
 * @evidence contracts/testing.md#execution-ownership The exported test_graph_heading_annotations is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_graph_heading_annotations(): Promise<void> {
  const markdown: EvidenceMarkdownAdapter = new EvidenceMarkdownAdapter();
  const typescript: EvidenceTypeScriptAdapter = new EvidenceTypeScriptAdapter();
  const requirementText: string =
    "## Authentication {#authentication}\nValidate the token.\n## Billing {#billing}\nCharge the account.\n";
  const reference: IEvidenceInventory = await markdown.analyze(
    EvidenceTestSourceSnapshot.create("docs/spec.md", requirementText),
  );
  const authentication: string = EvidenceFingerprint.inspect(
    reference,
    requireUnit(reference, "authentication").id,
  ).fingerprint;
  const billing: string = EvidenceFingerprint.inspect(
    reference,
    requireUnit(reference, "billing").id,
  ).fingerprint;
  const guideText: string = dedent`
    ## @evidence docs/spec.md#authentication {#authentication}

    <!-- @evidenceReview docs/spec.md#authentication #${authentication} Checked the required validation. -->

    Documents token validation.

    ### Validation steps

    Follow the signature and expiry checks.

    ### @evidenceExclude docs/spec.md#billing {#billing}

    <!-- @evidenceExcludeReview docs/spec.md#billing #${billing} Confirmed external ownership. -->

    Billing belongs to an external service.
  `;
  const codeText: string = dedent`
    /**
     * ## @evidence docs/spec.md#authentication
     *
     * Validates signatures and expiry.
     *
     * ### Validation steps
     * - Verifies the token before accepting it.
     *
     * ### @evidenceExclude docs/spec.md#billing
     *
     * Billing belongs to an external service.
     *
     * #### @evidenceReview docs/spec.md#authentication #${authentication}
     *
     * Checked signature and expiry validation.
     *
     * #### @evidenceExcludeReview docs/spec.md#billing #${billing}
     *
     * Confirmed external billing ownership.
     */
    export function authenticate(): boolean { return true; }
  `;
  const guide: IEvidenceInventory = await markdown.analyze(
    EvidenceTestSourceSnapshot.create("docs/guide.md", guideText),
  );
  const code: IEvidenceInventory = await typescript.analyze(
    EvidenceTestSourceSnapshot.create(
      "src/authenticate.ts",
      codeText.replaceAll("\n", "\r\n"),
    ),
  );

  for (const claim of [guide, code]) {
    TestValidator.equals(
      `${claim.units[0]?.type ?? "unknown"} extraction diagnostics`,
      claim.diagnostics,
      [],
    );
    const result: IEvidenceGraphResult = await evaluate(claim, reference);
    TestValidator.equals(
      "reviewed heading graph diagnostics",
      result.diagnostics,
      [],
    );
    TestValidator.equals("reviewed heading graph passes", result.success, true);
    const prohibited: IEvidenceGraphResult = await evaluate(
      claim,
      reference,
      true,
    );
    TestValidator.equals(
      "exclusions remain policy-controlled",
      prohibited.success,
      false,
    );
    TestValidator.predicate(
      "prohibited exclusion diagnosed",
      prohibited.diagnostics.some(
        (entry: IEvidenceDiagnostic): boolean =>
          entry.code === "graph-forbidden-exclusion",
      ),
    );
  }

  const removed: IEvidenceInventory = structuredClone(guide);
  removed.declarations = removed.declarations.filter(
    (entry: IEvidenceDeclaration): boolean => entry.kind !== "evidence",
  );
  const missing: IEvidenceGraphResult = await evaluate(removed, reference);
  TestValidator.equals(
    "removed heading evidence fails coverage",
    EvidenceTestGraph.obligation(missing, 0, 0).missingUnitIds,
    [requireUnit(reference, "authentication").id],
  );
  const changed: IEvidenceInventory = await markdown.analyze(
    EvidenceTestSourceSnapshot.create(
      "docs/spec.md",
      requirementText.replace(
        "Validate the token.",
        "Validate the token and its issuer.",
      ),
    ),
  );
  const stale: IEvidenceGraphResult = await evaluate(code, changed);
  TestValidator.equals(
    "changed requirement expires heading review",
    stale.success,
    false,
  );
  TestValidator.predicate(
    "stale review diagnosed",
    stale.diagnostics.some(
      (entry: IEvidenceDiagnostic): boolean =>
        entry.code === "graph-stale-review",
    ),
  );

  const reasonEdit: IEvidenceInventory = await typescript.analyze(
    EvidenceTestSourceSnapshot.create(
      "src/authenticate.ts",
      codeText.replace(
        "Validates signatures and expiry.",
        "Checks signatures and rejects expired credentials.",
      ),
    ),
  );
  const implementationEdit: IEvidenceInventory = await typescript.analyze(
    EvidenceTestSourceSnapshot.create(
      "src/authenticate.ts",
      codeText.replace("return true", "return false"),
    ),
  );
  const original: string = EvidenceFingerprint.inspect(
    code,
    requireUnit(code, "authenticate").id,
  ).fingerprint;
  TestValidator.equals(
    "heading prose preserves implementation fingerprint",
    EvidenceFingerprint.inspect(
      reasonEdit,
      requireUnit(reasonEdit, "authenticate").id,
    ).fingerprint,
    original,
  );
  TestValidator.predicate(
    "body change expires implementation fingerprint",
    EvidenceFingerprint.inspect(
      implementationEdit,
      requireUnit(implementationEdit, "authenticate").id,
    ).fingerprint !== original,
  );
}

/**
 * Resolves annotations through the normal graph input boundary.
 *
 * Every Markdown H2 reference stays selected even when its only acknowledgement
 * is removed or its exclusion is prohibited.
 */
async function evaluate(
  claim: IEvidenceInventory,
  reference: IEvidenceInventory,
  noEvidenceExclude: boolean = false,
): Promise<IEvidenceGraphResult> {
  const selected: string[] = reference.units
    .filter((unit: IEvidenceUnit): boolean => unit.symbol === "h2")
    .map((unit: IEvidenceUnit): string => unit.id);
  return EvidenceGraph.evaluate({
    claims: [
      {
        severity: "error",
        inventory: claim,
        unitIds: claim.units.map((unit: IEvidenceUnit): string => unit.id),
        references: [
          {
            severity: "error",
            inventory: reference,
            unitIds: selected,
            resolutions: await EvidenceTestGraph.resolveDeclarations(
              claim,
              reference,
              selected,
            ),
            reviewResolutions: await EvidenceTestGraph.resolveReviews(
              claim,
              reference,
              selected,
            ),
            requireReview: true,
            noEvidenceExclude,
          },
        ],
      },
    ],
  });
}

/**
 * Finds a selected declaration by its artifact identity.
 *
 * Missing extraction is a failed scenario rather than an empty test population.
 */
function requireUnit(
  inventory: IEvidenceInventory,
  identity: string,
): IEvidenceUnit {
  const unit: IEvidenceUnit | undefined = inventory.units.find(
    (entry: IEvidenceUnit): boolean => entry.identity.at(-1) === identity,
  );
  if (unit === undefined)
    throw new Error(`Missing heading graph unit ${identity}.`);
  return unit;
}
