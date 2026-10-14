import { EvidenceDartAdapter, EvidenceInventory } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Parses Dart directives by their URI fields despite annotations and trivia.
 *
 * Annotation string arguments are not dependencies, while actual export and
 * part URIs define the library topology used for resolution.
 *
 * 1. Analyze a library and part with annotated directives, spaced library name,
 *    and a commented declarator list.
 * 2. Require both declared variables and the exported type to resolve through the
 *    actual API URI.
 * 3. Verify annotation strings do not create dependencies.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes a Dart library and part with annotated directives and trivia, asserting resolution through the actual URIs and no annotation dependencies.
 * @evidence contracts/testing.md#independent-expectations Expected resolutions follow Dart's directive grammar, where only URI fields define topology.
 * @evidence contracts/testing.md#distinguishing-cases Covers annotated directives, spaced library names, commented declarator lists, and annotation strings that must not become dependencies.
 * @evidence contracts/testing.md#execution-ownership The exported test_dart_directive_syntax is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_dart_directive_syntax(): Promise<void> {
  const inventory = await new EvidenceDartAdapter().analyze(
    EvidenceTestSourceSnapshot.combine([
      EvidenceTestSourceSnapshot.create(
        "src/api.dart",
        dedent`
      library app . api;
      @Deprecated('not-a-library.dart') export 'external.dart';
      @Deprecated('not-a-part.dart') part 'part.dart';
    `,
      ),
      EvidenceTestSourceSnapshot.create(
        "src/part.dart",
        dedent`
      part of app.api;
      int first = 1, /* declaration trivia */ second = 2;
    `,
      ),
      EvidenceTestSourceSnapshot.create(
        "src/external.dart",
        "class Exported {}",
      ),
    ]),
  );

  TestValidator.equals(
    "valid directive trivia remains complete",
    inventory.diagnostics,
    [],
  );
  TestValidator.equals(
    "both variables retained",
    inventory.units
      .filter((unit) => unit.symbol === "property")
      .map((unit) => unit.name),
    ["first", "second"],
  );
  const graph = new EvidenceInventory([inventory]);
  for (const name of ["first", "second", "Exported"])
    TestValidator.equals(
      `${name} resolves through actual URI`,
      graph.resolve(
        { file: "/project/src/api.dart", segments: [name] },
        inventory.units.map((unit) => unit.id),
      ).status,
      "resolved",
    );
  TestValidator.equals(
    "annotation strings create no dependencies",
    inventory.dependencies.some((dependency) =>
      dependency.path.includes("not-a-"),
    ),
    false,
  );
}
