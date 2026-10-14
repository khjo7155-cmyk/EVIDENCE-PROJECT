import { EvidenceGraph, EvidencePrismaAdapter } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Keeps rejected and unreadable Prisma schemas incomplete until repair.
 *
 * A failing schema remains an active graph participant so coverage cannot pass
 * from a reduced population.
 *
 * 1. Analyze rejected and unreadable schemas and inspect their diagnostics.
 * 2. Evaluate their active claim in the graph and require failure.
 * 3. Repair the schema and require complete recovery.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes rejected and unreadable Prisma schemas, evaluates them as active claims in a graph, then repairs them, asserting diagnostics, failure and recovery.
 * @evidence contracts/testing.md#independent-expectations Expected diagnostics follow the Prisma adapter's schema validation; the graph must fail because the failing claim stays an active participant.
 * @evidence contracts/testing.md#distinguishing-cases Covers a rejected schema, an unreadable source, graph failure from a reduced population, and complete recovery.
 * @evidence contracts/testing.md#execution-ownership The exported test_prisma_failures is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_prisma_failures(): Promise<void> {
  const adapter = new EvidencePrismaAdapter();
  const broken = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "prisma/schema.prisma",
      "model Sale {\n  id String @id\n",
    ),
  );

  TestValidator.equals("rejected schema is incomplete", broken.complete, false);
  TestValidator.equals(
    "rejected schema has no guessed units",
    broken.units,
    [],
  );
  TestValidator.predicate(
    "parser rejection is actionable",
    broken.diagnostics.some(
      (diagnostic) => diagnostic.code === "prisma-parse-failed",
    ),
  );

  // An incomplete claim remains active and cannot pass as an empty host population.
  const graph = EvidenceGraph.evaluate({
    claims: [
      {
        severity: "error",
        inventory: broken,
        unitIds: [],
        references: [],
      },
    ],
  });
  const claim = graph.claims[0];
  if (claim === undefined)
    throw new Error("Missing rejected Prisma claim result.");
  TestValidator.equals("rejected claim remains active", claim.active, true);
  TestValidator.equals(
    "rejected claim remains incomplete",
    claim.complete,
    false,
  );
  TestValidator.equals("rejected claim fails the graph", graph.success, false);

  // Repairing the same schema produces a complete parser inventory on the next run.
  const repaired = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "prisma/schema.prisma",
      "model Sale {\n  id String @id\n}\n",
    ),
  );
  TestValidator.equals("repaired schema is complete", repaired.complete, true);
  TestValidator.equals(
    "repaired schema restores its denominator",
    repaired.units.map((unit) => unit.id),
    ["prisma:Sale", "prisma:Sale.id"],
  );

  const unreadable = await adapter.analyze(
    EvidenceTestSourceSnapshot.fail(
      EvidenceTestSourceSnapshot.create("prisma/available.prisma", ""),
      {
        code: "path-unreadable",
        path: "/project/prisma/missing.prisma",
        message: "The selected Prisma schema file could not be read.",
      },
    ),
  );
  TestValidator.equals(
    "source failure is incomplete",
    unreadable.complete,
    false,
  );
  TestValidator.equals(
    "source failure remains visible",
    unreadable.diagnostics.map((diagnostic) => diagnostic.code),
    ["inventory-incomplete", "source-path-unreadable"],
  );
}
