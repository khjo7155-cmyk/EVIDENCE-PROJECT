import { EvidenceInventory } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";

import { EvidenceTestInventory } from "../../internal/EvidenceTestInventory";

/**
 * Builds structural scope from explicit parents while preserving literal
 * accessor segments.
 *
 * Public name prefixes are not ownership edges. A selected property with a dot
 * in its literal name must retain its actual parent without making a similarly
 * named unselected declaration or unrelated unit part of the resolvable
 * population.
 *
 * 1. Create Box, its explicit child named value.part, a parentless lookalike named
 *    Box.value, and an unrelated declaration; select only the literal dotted
 *    child.
 * 2. Require the scope closure to contain exactly Box, that selected child and the
 *    file scope that owns Box.
 * 3. Resolve the literal value.part segment successfully, but reject splitting it
 *    into value and part as a different, missing accessor.
 * 4. Require both the unselected lookalike and the unrelated declaration to remain
 *    missing from lookup within this selected population.
 *
 * @evidence contracts/testing.md#behavioral-verification Selects a literal dotted child and asserts the scope closure and which accessors resolve.
 * @evidence contracts/testing.md#independent-expectations Expected closure and statuses follow explicit-parent semantics, not name prefixes.
 * @evidence contracts/testing.md#distinguishing-cases Covers the literal dotted segment, a split accessor, a parentless lookalike and an unrelated declaration.
 * @evidence contracts/testing.md#execution-ownership The exported test_inventory_scopes is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_inventory_scopes(): Promise<void> {
  const input = EvidenceTestInventory.create();
  EvidenceTestInventory.unit(
    input,
    "box",
    ["Box"],
    "type",
    "export class Box { value = 1; }",
  );
  EvidenceTestInventory.unit(
    input,
    "member",
    ["Box", "value.part"],
    "property",
    "value = 1",
    "box",
  );
  EvidenceTestInventory.unit(
    input,
    "lookalike",
    ["Box", "value"],
    "property",
    "extra: string",
  );
  EvidenceTestInventory.unit(
    input,
    "other",
    ["Other"],
    "property",
    "export const unrelated = 3;",
  );

  const index = new EvidenceInventory([input]);
  const selected = index.select(["member"]);

  TestValidator.equals(
    "actual ancestor closure",
    selected.scopes.map((unit) => unit.id),
    ["box", "member", "typescript:source:file"],
  );
  TestValidator.equals(
    "literal dotted member is addressable",
    index.resolve(
      { file: "/project/source.ts", segments: ["Box", "value.part"] },
      ["member"],
    ).status,
    "resolved",
  );
  TestValidator.equals(
    "literal dot does not split",
    index.resolve(
      { file: "/project/source.ts", segments: ["Box", "value", "part"] },
      ["member"],
    ).status,
    "missing",
  );
  TestValidator.equals(
    "unselected lookalike is not a scope",
    index.resolve({ file: "/project/source.ts", segments: ["Box", "value"] }, [
      "member",
    ]).status,
    "missing",
  );
  TestValidator.equals(
    "unrelated declarations stay outside closure",
    index.resolve({ file: "/project/source.ts", segments: ["Other"] }, [
      "member",
    ]).status,
    "missing",
  );
}
