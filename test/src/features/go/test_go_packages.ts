import { EvidenceGoAdapter } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Keeps ordinary and test-package Go identities separate.
 *
 * Same-package tests share package identity while external test packages form
 * their own public boundary.
 *
 * 1. Analyze ordinary, package-test, and external-test files.
 * 2. Compare their unit IDs.
 * 3. Require only intended package sharing.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes ordinary, same-package test and external test files and asserts unit IDs.
 * @evidence contracts/testing.md#independent-expectations Expected sharing follows Go's package rules for _test files.
 * @evidence contracts/testing.md#distinguishing-cases Covers same-package tests sharing identity and an external test package staying separate.
 * @evidence contracts/testing.md#execution-ownership The exported test_go_packages is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_go_packages(): Promise<void> {
  const inventory = await new EvidenceGoAdapter().analyze(
    EvidenceTestSourceSnapshot.combine([
      EvidenceTestSourceSnapshot.create(
        "shop/api.go",
        dedent`
          package shop

          type Record struct{}
          func Shared() {}
        `,
      ),
      EvidenceTestSourceSnapshot.create(
        "shop/api_test.go",
        dedent`
          package shop

          func TestHelper() {}
          func (Record) Verify() {}
        `,
      ),
      EvidenceTestSourceSnapshot.create(
        "shop/external_test.go",
        dedent`
          package shop_test

          func Shared() {}
        `,
      ),
    ]),
  );

  TestValidator.equals(
    "Go selected test source units",
    inventory.units.map((unit) => unit.identity.join(".")).sort(compare),
    ["Record", "Record.Verify", "Shared", "Shared", "TestHelper"].sort(compare),
  );
  TestValidator.equals(
    "separate Go package identities",
    new Set(
      inventory.units
        .filter((unit) => unit.identity.join(".") === "Shared")
        .map((unit) => unit.id),
    ).size,
    2,
  );
  TestValidator.equals(
    "complete Go package selection",
    inventory.diagnostics,
    [],
  );
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
