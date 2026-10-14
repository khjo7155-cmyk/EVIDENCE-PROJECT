import { EvidenceTypeScriptAdapter } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Rejects TypeScript reexports that escape their population root.
 *
 * Logical and physical roots both bound the selected public population.
 *
 * 1. Analyze reexports crossing each root boundary.
 * 2. Require incomplete status and the corresponding diagnostic.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes TypeScript re-exports that cross logical and physical population roots and asserts incompleteness.
 * @evidence contracts/testing.md#independent-expectations Expected diagnostics follow the rule that both roots bound the selected population.
 * @evidence contracts/testing.md#distinguishing-cases Covers a crossing of each root kind.
 * @evidence contracts/testing.md#execution-ownership The exported test_typescript_root_boundary is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_typescript_root_boundary(): Promise<void> {
  const inside = EvidenceTestSourceSnapshot.create(
    "api/index.ts",
    'export { value } from "../outside/value";',
    undefined,
    "/project",
  );
  inside.root.absolute = "/project/api";
  inside.root.physical = "/project/api";
  const outside = EvidenceTestSourceSnapshot.create(
    "outside/value.ts",
    "export const value = 1;",
  );

  const logical = await new EvidenceTypeScriptAdapter().analyze(
    EvidenceTestSourceSnapshot.combine([inside, outside]),
  );

  TestValidator.equals("logical escape is incomplete", logical.complete, false);
  TestValidator.predicate(
    "logical root cause",
    logical.diagnostics.some((diagnostic) =>
      diagnostic.message.includes("leaves the declared source root"),
    ),
  );

  // A logical alias inside the root cannot hide a physical target outside it.
  const linkedInside = EvidenceTestSourceSnapshot.create(
    "api/index.ts",
    'export { value } from "./linked/value";',
    undefined,
    "/project",
  );
  linkedInside.root.absolute = "/project/api";
  linkedInside.root.physical = "/project/api";
  const linkedOutside = EvidenceTestSourceSnapshot.create(
    "api/linked/value.ts",
    "export const value = 1;",
  );
  const linkedSource = linkedOutside.files[0];
  if (linkedSource === undefined)
    throw new Error("Missing linked source fixture.");
  linkedSource.physicalPath = "/outside/value.ts";

  const physical = await new EvidenceTypeScriptAdapter().analyze(
    EvidenceTestSourceSnapshot.combine([linkedInside, linkedOutside]),
  );

  TestValidator.equals(
    "physical escape is incomplete",
    physical.complete,
    false,
  );
  TestValidator.predicate(
    "physical root cause",
    physical.diagnostics.some((diagnostic) =>
      diagnostic.message.includes("leaves the declared source root"),
    ),
  );
}
