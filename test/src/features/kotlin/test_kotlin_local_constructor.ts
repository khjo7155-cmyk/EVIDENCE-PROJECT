import { EvidenceKotlinAdapter } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Prevents local constructor parameters in defaults from becoming owner
 * properties.
 *
 * Only declared public constructor properties belong to the enclosing type.
 *
 * 1. Analyze constructor defaults with local parameters. 2. Compare selected
 *    properties. 3. Require local names to stay absent.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes constructor defaults that use local parameters and asserts which properties belong to the owner.
 * @evidence contracts/testing.md#independent-expectations Expected properties are the declared constructor properties only.
 * @evidence contracts/testing.md#distinguishing-cases Covers local parameters in defaults that must stay absent beside real constructor properties.
 * @evidence contracts/testing.md#execution-ownership The exported test_kotlin_local_constructor is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_kotlin_local_constructor(): Promise<void> {
  const inventory = await new EvidenceKotlinAdapter().analyze(
    EvidenceTestSourceSnapshot.create(
      "src/Container.kt",
      dedent`
    class Container(val value: Int = run {
      class Local(val nested: Int)
      1
    })
  `,
    ),
  );

  TestValidator.equals("default lambda parses", inventory.diagnostics, []);
  TestValidator.equals(
    "only immediate constructor properties",
    inventory.units
      .map((unit) => unit.identity.join("."))
      .sort((a, b) => a.localeCompare(b)),
    ["Container", "Container.value"],
  );
}
