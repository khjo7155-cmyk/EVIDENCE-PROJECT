import { EvidencePythonAdapter } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestGraph } from "../../internal/EvidenceTestGraph";
import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Resolves canonical file-qualified targets for Python declarations.
 *
 * The reference and claim snapshots use a type, class property, instance
 * method, and module function to test target parsing against the same public
 * address model used by graph resolution.
 *
 * 1. Analyze the Python reference and TypeScript claim inventories.
 * 2. Resolve each canonical target and verify every resolution succeeds.
 * 3. Verify the resolved units have the expected type, property, method, and
 *    function identities.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes Python reference and TypeScript claim inventories and resolves canonical file-qualified targets for a type, class property, method and function.
 * @evidence contracts/testing.md#independent-expectations Expected identities are the authored declarations; every canonical target must resolve.
 * @evidence contracts/testing.md#distinguishing-cases Covers each Python symbol kind through the public address model.
 * @evidence contracts/testing.md#execution-ownership The exported test_python_targets is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_python_targets(): Promise<void> {
  const adapter = new EvidencePythonAdapter();
  const reference = await adapter.analyze(
    EvidenceTestSourceSnapshot.combine([
      EvidenceTestSourceSnapshot.create(
        "src/sale.py",
        dedent`
          class Sale:
              currency = "USD"

              def total(self):
                  return 0
        `,
      ),
      EvidenceTestSourceSnapshot.create(
        "src/calculator.py",
        dedent`
          def add(left, right):
              return left + right
        `,
      ),
    ]),
  );
  const claim = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "test/test_sale.py",
      dedent`
        def verify():
            """
            @evidence ../src/sale.py#Sale Verifies the type.
            @evidence ../src/sale.py#Sale.currency Verifies the class attribute.
            @evidence ../src/sale.py#Sale.prototype.total Verifies the instance method.
            @evidence ../src/calculator.py#add Verifies the function.
            """
            return None
      `,
    ),
  );
  const resolutions = await EvidenceTestGraph.resolveDeclarations(
    claim,
    reference,
    reference.units.map((unit) => unit.id),
  );

  TestValidator.equals(
    "resolved Python targets",
    resolutions.map((resolution) => resolution.resolution.status),
    ["resolved", "resolved", "resolved", "resolved"],
  );
  TestValidator.equals(
    "resolved Python identities",
    resolutions
      .flatMap((resolution) => {
        const unit = resolution.resolution.units[0];
        return unit === undefined ? [] : [unit.identity.join(".")];
      })
      .sort(compare),
    ["Sale", "Sale.currency", "Sale.prototype.total", "add"].sort(compare),
  );
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
