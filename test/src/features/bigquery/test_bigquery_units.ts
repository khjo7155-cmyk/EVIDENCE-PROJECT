import {
  EvidenceBigQueryAdapter,
  EvidenceFingerprint,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Classifies BigQuery tables, fields, and declared keys with their full
 * ownership paths.
 *
 * The selected schema surface includes nested and repeated field structure, so
 * identity must retain explicit project qualifiers and parent relationships.
 *
 * 1. Analyze qualified tables with scalar, nested, repeated, and flexible-name
 *    fields plus key constraints.
 * 2. Compare the complete unit identities and symbols against the declared schema
 *    surface.
 * 3. Verify nested fields and constraints retain the model as their owner.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes qualified tables with scalar, nested, repeated and flexible-name fields and keys and asserts identities, symbols and owners.
 * @evidence contracts/testing.md#independent-expectations Expected identities are the declared schema surface written in the test.
 * @evidence contracts/testing.md#distinguishing-cases Covers nested and repeated fields, flexible names, key constraints and explicit project qualifiers.
 * @evidence contracts/testing.md#execution-ownership The exported test_bigquery_units is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_bigquery_units(): Promise<void> {
  const content = dedent`
    CREATE TABLE \`acme-prod.sales.orders\` (
      id INT64,
      customer_id INT64,
      details STRUCT<label STRING, items ARRAY<STRUCT<sku STRING, quantity INT64>>>,
      tags ARRAY<STRING>,
      PRIMARY KEY (id) NOT ENFORCED,
      CONSTRAINT customer_key FOREIGN KEY (customer_id) REFERENCES \`acme-prod.sales.customers\` (id) NOT ENFORCED
    ) OPTIONS(description="Orders schema");
  `;
  const adapter = new EvidenceBigQueryAdapter();
  const inventory = await adapter.analyze(
    EvidenceTestSourceSnapshot.create("schema.sql", content, [
      "schema.sql",
      "alias.sql",
    ]),
  );

  TestValidator.equals(
    "complete GoogleSQL inventory",
    inventory.diagnostics,
    [],
  );
  TestValidator.equals("complete source", inventory.complete, true);
  TestValidator.equals(
    "exact declarations",
    inventory.units
      .map((unit) => JSON.stringify([unit.symbol, unit.identity]))
      .sort((left, right) => left.localeCompare(right, "en")),
    [
      ["file", []],
      ["model", ["acme-prod", "sales", "orders"]],
      ...[
        "id",
        "customer_id",
        "details",
        "details.label",
        "details.items",
        "details.items.sku",
        "details.items.quantity",
        "tags",
      ].map((name) => [
        "column",
        ["acme-prod", "sales", "orders", ...name.split(".")],
      ]),
      ["relation", ["acme-prod", "sales", "orders", "customer_key"]],
    ]
      .map((value) => JSON.stringify(value))
      .sort((left, right) => left.localeCompare(right, "en")),
  );
  const model = inventory.units.find((unit) => unit.symbol === "model");
  if (model === undefined) throw new Error("Missing orders model.");
  TestValidator.equals(
    "every field and relation has one owning table",
    inventory.units
      .filter((unit) => unit.symbol !== "model" && unit.symbol !== "file")
      .every((unit) => unit.parentId === model.id),
    true,
  );
  TestValidator.equals(
    "file aliases retain every declaration",
    inventory.addresses.length,
    inventory.units.length * 2,
  );
  TestValidator.equals(
    "all undocumented units remain hosts",
    new Set(inventory.hosts.flatMap((host) => host.unitIds)).size,
    // The structural file scope is not a declaration.
    inventory.units.filter((unit) => unit.symbol !== "file").length,
  );

  const moved = await adapter.analyze(
    EvidenceTestSourceSnapshot.create("moved.sql", content),
  );
  TestValidator.equals(
    "schema identity independent of file",
    // Schema declarations survive a move; only the file scope names the file.
    moved.units.filter((unit) => unit.symbol !== "file").map((unit) => unit.id),
    inventory.units
      .filter((unit) => unit.symbol !== "file")
      .map((unit) => unit.id),
  );
  TestValidator.equals(
    "file move preserves review",
    EvidenceFingerprint.inspect(moved, model.id).fingerprint,
    EvidenceFingerprint.inspect(inventory, model.id).fingerprint,
  );
  const changed = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "schema.sql",
      content.replace("quantity INT64", "quantity NUMERIC"),
    ),
  );
  TestValidator.notEquals(
    "nested semantic edit invalidates table review",
    EvidenceFingerprint.inspect(changed, model.id).fingerprint,
    EvidenceFingerprint.inspect(inventory, model.id).fingerprint,
  );
}
