import { EvidenceQuery } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";
import { EvidenceTestQueryAnalysis } from "../../internal/EvidenceTestQueryAnalysis";

/**
 * Keeps reusable query contexts independent of caller mutations and concurrent
 * resolution state.
 *
 * Repeated reference entries retain separate configured boundaries even when a
 * caller mutates the analysis and output objects used to create the query. The
 * facade must preserve its own indexes while one inspection resolves and
 * another reports a missing target.
 *
 * 1. Create a query from the shared fixture and capture baseline list and graph
 *    reports.
 * 2. Erase caller-owned claims, report entries, listed items, diagnostics, and
 *    graph nodes; require subsequent list and graph calls to equal their
 *    baselines.
 * 3. Inspect a known target and an absent target concurrently. Require the known
 *    result to resolve through reference indexes 4 and 5 while the absent
 *    result remains unresolved.
 * 4. Mutate the returned inspection and require a later inspection to reproduce
 *    the unmodified baseline.
 *
 * @evidence contracts/testing.md#behavioral-verification Builds an EvidenceQuery, mutates caller-owned inputs and outputs, and runs concurrent inspections, asserting list, graph and inspection results.
 * @evidence contracts/testing.md#independent-expectations Isolation is checked relationally against baselines captured before mutation; the resolved target's reference indexes 4 and 5 come from the shared fixture's configuration.
 * @evidence contracts/testing.md#distinguishing-cases Covers mutation of every input and output collection, a concurrent known and absent target, and mutation of a returned inspection.
 * @evidence contracts/testing.md#execution-ownership The exported test_query_context is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_query_context(): Promise<void> {
  await EvidenceTestFileSystem.experiment(
    join(__dirname, `query context ${randomUUID()}`),
    EvidenceTestQueryAnalysis.records(),
    async (directory) => {
      const analysis = await EvidenceTestQueryAnalysis.analyze(directory, 2);
      const query = new EvidenceQuery(analysis, directory);
      const listing = query.list();
      const baseline = structuredClone(listing);
      const target = listing.items.find(
        (item) =>
          item.scope.role === "reference" && item.selection === "selected",
      )?.target;
      if (target === undefined)
        throw new Error("Missing selected reference target.");
      const graph = query.graph();
      const graphBaseline = structuredClone(graph);

      // Caller mutations cannot invalidate the facade's population indexes.
      analysis.graphInput.claims.length = 0;
      analysis.graph.claims.length = 0;
      analysis.report.claims.length = 0;
      listing.items.length = 0;
      listing.diagnostics.length = 0;
      graph.nodes.length = 0;
      TestValidator.equals("owned listing", query.list(), baseline);
      TestValidator.equals("owned graph", query.graph(), graphBaseline);

      // Concurrent valid and missing targets must not share resolution state.
      const [resolved, missing] = await Promise.all([
        query.inspect(target),
        query.inspect("contracts/absent.ts#Missing"),
      ]);
      TestValidator.equals(
        "independent reference entries",
        resolved.inspections.map((entry) => entry.scope.reference),
        [4, 5],
      );
      TestValidator.predicate(
        "known target resolves",
        resolved.inspections.every((entry) => entry.status === "resolved"),
      );
      TestValidator.predicate(
        "missing target stays unresolved",
        missing.inspections.some((entry) => entry.status !== "resolved"),
      );
      const inspectedBaseline = structuredClone(resolved);
      resolved.inspections.length = 0;
      TestValidator.equals(
        "owned inspection",
        await query.inspect(target),
        inspectedBaseline,
      );
    },
  );
}
