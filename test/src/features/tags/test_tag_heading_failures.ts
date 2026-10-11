import { EvidenceTagParser } from "@wrtnlabs/evidence";
import type {
  IEvidenceDeclaration,
  IEvidenceDiagnostic,
  IEvidenceTagParseResult,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestDocumentation } from "../../internal/EvidenceTestDocumentation";
import type { IEvidenceTestDocumentation } from "../../internal/IEvidenceTestDocumentation";

/**
 * Rejects incomplete heading tags without promoting prose or examples to
 * targets.
 *
 * Explicit heading markers do not relax target, explanation, or attachment
 * requirements. Unsupported depths and unannounced targets remain ordinary
 * text.
 *
 * 1. Parse missing targets and reasons separated by real section boundaries.
 * 2. Keep H1/H5/H6, malformed markers, indented/fenced examples, and comments
 *    inert.
 * 3. Recover at a valid H4 annotation after the malformed annotations.
 * 4. Reparse an otherwise valid heading on an unattached host and require a
 *    finding.
 */
export async function test_tag_heading_failures(): Promise<void> {
  const fixture: IEvidenceTestDocumentation =
    EvidenceTestDocumentation.create(dedent`
    /**
     * ## @evidence
     * This prose must not become the target.
     * ## @evidence docs/spec.md#missing {#missing} ##
     * ## Ordinary peer
     * This prose must not become the reason.
     * ### @evidenceReview docs/spec.md#review #abcdef0
     * ### Ordinary peer
     * # @evidence docs/fake.md#h1 Unsupported depth.
     * ##### @evidence docs/fake.md#h5 Unsupported depth.
     * ###### @evidence docs/fake.md#h6 Unsupported depth.
     * ##@evidence docs/fake.md#separation Missing separation.
     *     ## @evidence docs/fake.md#indented Indented example.
     * ~~~markdown
     * ## @evidence docs/fake.md#fenced Fenced example.
     * ~~~
     * <!--
     * ## @evidence docs/fake.md#comment Hidden example.
     * -->
     * ## docs/fake.md#unannounced
     * An untagged target is just a heading.
     * #### @evidence docs/spec.md#recovered
     * Supplies the actual requirement.
     */
  `);
  const result: IEvidenceTagParseResult = EvidenceTagParser.parse(
    fixture.content,
    fixture.host,
    fixture.documentation,
  );

  TestValidator.equals(
    "malformed sections fail visibly",
    result.diagnostics.map((entry: IEvidenceDiagnostic): string => entry.code),
    [
      "malformed-target",
      "missing-evidence-reason",
      "missing-review-description",
    ],
  );
  TestValidator.equals(
    "recovery and inert targets",
    result.declarations.map(
      (entry: IEvidenceDeclaration): string => entry.target,
    ),
    ["docs/spec.md#recovered"],
  );
  const detached: IEvidenceTestDocumentation = EvidenceTestDocumentation.create(
    "/**\n * ## @evidence docs/spec.md#detached\n * Requires a declaration owner.\n */",
    undefined,
    "unattached",
  );
  const rejected: IEvidenceTagParseResult = EvidenceTagParser.parse(
    detached.content,
    detached.host,
    detached.documentation,
  );
  TestValidator.equals(
    "unattached heading rejected",
    rejected.declarations,
    [],
  );
  TestValidator.equals(
    "attachment diagnostic",
    rejected.diagnostics.map(
      (entry: IEvidenceDiagnostic): string => entry.code,
    ),
    ["unsupported-annotation-host"],
  );
}
