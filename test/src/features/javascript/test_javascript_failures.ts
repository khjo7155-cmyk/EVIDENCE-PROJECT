import { EvidenceJavaScriptAdapter } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Rejects JavaScript export surfaces that static analysis cannot prove
 * complete.
 *
 * Dynamic or uncertain export behavior cannot publish a smaller selected
 * denominator.
 *
 * 1. Analyze each unsupported export form.
 * 2. Require incompleteness and diagnostics.
 * 3. Verify no uncertain case passes.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes unsupported JavaScript export forms and asserts incompleteness with diagnostics.
 * @evidence contracts/testing.md#independent-expectations Expected incompleteness follows the adapter's static-surface boundary.
 * @evidence contracts/testing.md#distinguishing-cases Covers computed keys, conditional mutation, dynamic replacement values, shadowed bindings and escaped aliases.
 * @evidence contracts/testing.md#execution-ownership The exported test_javascript_failures is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_javascript_failures(): Promise<void> {
  const adapter = new EvidenceJavaScriptAdapter();
  await verify(
    adapter,
    "computed CommonJS key",
    "javascript-commonjs-computed",
    dedent`
        const key = "run";
        function run() {}
        exports[key] = run;
      `,
  );
  await verify(
    adapter,
    "conditional exports alias",
    "javascript-commonjs-control-flow",
    dedent`
        function run() {}
        if (disabled) exports = {};
        exports.run = run;
      `,
  );
  await verify(
    adapter,
    "reassigned module binding",
    "javascript-commonjs-mutation",
    dedent`
        function run() {}
        module = createModule();
        module.exports.run = run;
      `,
  );
  await verify(
    adapter,
    "property after opaque replacement",
    "javascript-commonjs-target",
    dedent`
      const surface = 1;
      const late = 2;
      module.exports = surface;
      module.exports.late = late;
    `,
  );
  await verify(
    adapter,
    "conditional CommonJS export",
    "javascript-commonjs-control-flow",
    dedent`
        function run() {}
        if (enabled) exports.run = run;
      `,
  );
  await verify(
    adapter,
    "dynamic module replacement",
    "javascript-commonjs-replacement",
    "module.exports = createSurface();",
  );
  await verify(
    adapter,
    "captured export object",
    "javascript-commonjs-alias",
    dedent`
        const publicApi = module.exports;
        function run() {}
        publicApi.run = run;
      `,
  );
  await verify(
    adapter,
    "inline export value",
    "javascript-commonjs-value",
    "exports.run = () => {};",
  );
  await verify(
    adapter,
    "shadowed CommonJS binding",
    "javascript-commonjs-shadow",
    dedent`
        const exports = {};
        exports.value = value;
      `,
  );
  await verify(
    adapter,
    "CommonJS prototype mutation",
    "javascript-commonjs-prototype",
    dedent`
      const prototype = {};
      module.exports.__proto__ = prototype;
      `,
  );
  await verify(
    adapter,
    "compound CommonJS assignment",
    "javascript-commonjs-mutation",
    dedent`
      function run() {}
      exports.run ||= run;
    `,
  );

  const mixed = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "src/mixed.cjs",
      "export const value = 1;",
    ),
  );
  TestValidator.predicate(
    "ESM syntax in CommonJS",
    mixed.diagnostics.some(
      (diagnostic) => diagnostic.code === "javascript-module-syntax",
    ),
  );

  const malformed = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "src/broken.mjs",
      "export class Broken {",
    ),
  );
  TestValidator.predicate(
    "malformed JavaScript",
    malformed.diagnostics.some(
      (diagnostic) => diagnostic.code === "javascript-parse-incomplete",
    ),
  );

  const missing = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "src/missing.mjs",
      'export { Contract } from "./absent.mjs";',
    ),
  );
  TestValidator.predicate(
    "missing JavaScript reexport",
    missing.diagnostics.some(
      (diagnostic) => diagnostic.code === "javascript-export",
    ),
  );

  // Dynamic expressions inside a function do not alter the initialization surface.
  const localComputation = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "src/local.cjs",
      dedent`
        function run(key) {
          return exports[key];
        }
        exports.run = run;
      `,
    ),
  );
  TestValidator.equals(
    "function-local computation remains complete",
    localComputation.diagnostics,
    [],
  );
}

async function verify(
  adapter: EvidenceJavaScriptAdapter,
  label: string,
  code: string,
  content: string,
): Promise<void> {
  const inventory = await adapter.analyze(
    EvidenceTestSourceSnapshot.create("src/failure.cjs", content),
  );

  TestValidator.equals(`${label} is incomplete`, inventory.complete, false);
  TestValidator.predicate(
    `${label} diagnostic`,
    inventory.diagnostics.some((diagnostic) => diagnostic.code === code),
  );
}
