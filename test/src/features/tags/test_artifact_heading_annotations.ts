import {
  EvidenceDbmlAdapter,
  EvidenceFingerprint,
  EvidencePrismaAdapter,
  EvidenceSwaggerAdapter,
} from "@wrtnlabs/evidence";
import type {
  IEvidenceDeclaration,
  IEvidenceInventory,
  IEvidenceUnit,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Reads heading tags from Prisma documentation, DBML notes, and Swagger
 * descriptions.
 *
 * Decoded scalar mappings and schema comment ownership must preserve multiline
 * heading explanations and keep review metadata outside semantic fingerprints.
 *
 * 1. Analyze multiline Prisma and escaped DBML documentation and verify targets.
 * 2. Analyze a Swagger description with inert example headings and real heading
 *    evidence, exclusion, and review records.
 * 3. Edit its evidence reason and require a stable operation fingerprint, then
 *    edit ordinary operation prose and require a changed fingerprint.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes Prisma, DBML and Swagger sources through their adapters and asserts the heading annotations, targets, reviews and fingerprint behavior they produce.
 * @evidence contracts/testing.md#independent-expectations Expected targets and reasons are the authored fixture text; fingerprint checks are relational (equal after an evidence-only edit, different after an operation prose edit) rather than pinned hashes.
 * @evidence contracts/testing.md#distinguishing-cases Covers multiline Prisma documentation, escaped DBML notes, inert example headings, evidence, exclusion and review headings, and both the stable and changing fingerprint directions. Markdown and code heading parsing is owned by the tag heading tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_artifact_heading_annotations is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_artifact_heading_annotations(): Promise<void> {
  const prisma: IEvidenceInventory = await new EvidencePrismaAdapter().analyze(
    EvidenceTestSourceSnapshot.create(
      "schema.prisma",
      dedent`
    /// ## @evidence docs/spec.md#records
    /// Stores the required records.
    model Record {
      /// #### @evidence docs/spec.md#identifier
      /// Identifies the record.
      id Int @id
    }
  `,
    ),
  );
  TestValidator.equals("Prisma heading diagnostics", prisma.diagnostics, []);
  TestValidator.equals(
    "Prisma heading targets",
    prisma.declarations.map(
      (entry: IEvidenceDeclaration): string => entry.target,
    ),
    ["docs/spec.md#records", "docs/spec.md#identifier"],
  );
  const dbmlText: string =
    "Table records {\n id int [pk, note: '#### @evidence docs/spec.md#identifier\\nIdentifies the record.']\n Note: '## @evidence docs/spec.md#records\\nStores the records.'\n}";
  const dbml: IEvidenceInventory = await new EvidenceDbmlAdapter().analyze(
    EvidenceTestSourceSnapshot.create("schema.dbml", dbmlText),
  );
  TestValidator.equals("DBML heading diagnostics", dbml.diagnostics, []);
  TestValidator.equals(
    "DBML heading targets",
    dbml.declarations
      .map((entry: IEvidenceDeclaration): string => entry.target)
      .sort((left: string, right: string): number => left.localeCompare(right)),
    ["docs/spec.md#identifier", "docs/spec.md#records"],
  );
  const identifier: IEvidenceDeclaration | undefined = dbml.declarations.find(
    (entry: IEvidenceDeclaration): boolean =>
      entry.target.endsWith("#identifier"),
  );
  if (identifier === undefined || identifier.location.range === undefined)
    throw new Error("Missing decoded DBML heading range.");
  TestValidator.equals(
    "decoded note reason",
    identifier.reason,
    "Identifies the record.",
  );
  TestValidator.equals(
    "decoded note source span",
    dbmlText.slice(
      identifier.location.range.start.offset,
      identifier.location.range.end.offset,
    ),
    "#### @evidence docs/spec.md#identifier\\nIdentifies the record.",
  );

  const description: string = dedent`
    Creates a record.

    ~~~markdown
    ## @evidence docs/fake.md#fence Example only.
    ~~~

        ## @evidence docs/fake.md#indent Example only.

    ## @evidence docs/spec.md#records

    Stores the required records.

    ### @evidenceExclude docs/spec.md#billing

    Billing is external.

    #### @evidenceReview docs/spec.md#records #abcdef0

    Checked the storage contract.
  `;
  const swagger: IEvidenceInventory = await analyzeSwagger(description);
  TestValidator.equals("Swagger heading diagnostics", swagger.diagnostics, []);
  TestValidator.equals(
    "Swagger heading targets",
    swagger.declarations.map(
      (entry: IEvidenceDeclaration): string => entry.target,
    ),
    ["docs/spec.md#records", "docs/spec.md#billing"],
  );
  TestValidator.equals(
    "Swagger heading review count",
    swagger.reviews.length,
    1,
  );
  const operation: IEvidenceUnit | undefined = swagger.units[0];
  if (operation === undefined) throw new Error("Missing Swagger operation.");
  const original: string = EvidenceFingerprint.inspect(
    swagger,
    operation.id,
  ).fingerprint;
  const reasonEdit: IEvidenceInventory = await analyzeSwagger(
    description.replace(
      "Stores the required records.",
      "Persists records in the configured database.",
    ),
  );
  const proseEdit: IEvidenceInventory = await analyzeSwagger(
    description.replace(
      "Creates a record.",
      "Creates a record with an identifier.",
    ),
  );
  TestValidator.equals(
    "Swagger heading reason excluded from fingerprint",
    EvidenceFingerprint.inspect(reasonEdit, operation.id).fingerprint,
    original,
  );
  TestValidator.predicate(
    "Swagger semantic prose changes fingerprint",
    EvidenceFingerprint.inspect(proseEdit, operation.id).fingerprint !==
      original,
  );
}

/**
 * Encodes authored Markdown inside an operation description scalar.
 *
 * JSON escaping exercises source mappings independently of Markdown physical
 * lines.
 */
async function analyzeSwagger(
  description: string,
): Promise<IEvidenceInventory> {
  return new EvidenceSwaggerAdapter().analyze(
    EvidenceTestSourceSnapshot.create(
      "openapi.json",
      JSON.stringify({
        openapi: "3.1.0",
        info: { title: "Records", version: "1.0.0" },
        paths: {
          "/records": {
            post: {
              description,
              responses: { "200": { description: "Created" } },
            },
          },
        },
      }),
    ),
  );
}
