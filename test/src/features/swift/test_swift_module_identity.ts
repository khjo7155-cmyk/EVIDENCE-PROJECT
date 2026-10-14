import { EvidenceInventory, EvidenceSwiftAdapter } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Keeps equal Swift names independent across configured module roots.
 *
 * Module-root identity prevents equal declarations from sharing an address.
 *
 * 1. Analyze equal names in separate roots.
 * 2. Verify distinct identities and resolution.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes equal Swift names under separate configured module roots and asserts distinct identities and resolution.
 * @evidence contracts/testing.md#independent-expectations Expected identities follow the rule that a configured root is one module boundary.
 * @evidence contracts/testing.md#distinguishing-cases Covers equal declarations in two roots that must not share an address.
 * @evidence contracts/testing.md#execution-ownership The exported test_swift_module_identity is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_swift_module_identity(): Promise<void> {
  const adapter = new EvidenceSwiftAdapter();
  const first = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "Contract.swift",
      "public struct Contract {}",
      ["Contract.swift"],
      "/project/First",
    ),
  );
  const second = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "Other.swift",
      "public struct Contract {}",
      ["Other.swift"],
      "/project/Second",
    ),
  );
  const inventory = new EvidenceInventory([first, second]);
  const combined = inventory.snapshot();

  TestValidator.equals(
    "separate modules preserve two nominal identities",
    combined.units.length,
    2,
  );
  TestValidator.notEquals(
    "module roots disambiguate same-name units",
    first.units[0]?.id,
    second.units[0]?.id,
  );
  TestValidator.equals(
    "first module resolves its own type",
    inventory.resolve(
      { file: "/project/First/Contract.swift", segments: ["Contract"] },
      first.units.map((unit) => unit.id),
    ).status,
    "resolved",
  );
  TestValidator.equals(
    "second module cannot resolve inside first population",
    inventory.resolve(
      { file: "/project/Second/Other.swift", segments: ["Contract"] },
      first.units.map((unit) => unit.id),
    ).status,
    "missing",
  );
}
