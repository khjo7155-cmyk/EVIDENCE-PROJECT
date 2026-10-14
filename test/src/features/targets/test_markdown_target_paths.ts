import {
  EvidenceMarkdownAdapter,
  EvidenceTargetResolver,
  EvidenceTypeScriptAdapter,
} from "@wrtnlabs/evidence";
import type {
  IEvidenceDeclaration,
  IEvidenceHost,
  IEvidenceInventory,
  IEvidenceTargetResolution,
  IEvidenceUnit,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Resolves root-relative Markdown paths and literal anchors.
 *
 * Markdown target paths and anchors must retain their public spelling through
 * normalization and resolution.
 *
 * 1. Build a Markdown anchor whose file name contains a literal percent sign and
 *    parse claim declarations with root-relative and backslash-authored paths.
 * 2. Resolve both supported spellings to that literal dotted anchor.
 * 3. Require percent-decoded and wrong-case paths to be missing files.
 * 4. Mark the reference incomplete and require that state to suppress the
 *    derivative missing-file result.
 *
 * @evidence contracts/testing.md#behavioral-verification Resolves Markdown targets through EvidenceTargetResolver against an analyzed Markdown inventory and asserts resolved, missing-file and incomplete statuses.
 * @evidence contracts/testing.md#independent-expectations Statuses follow the Markdown target grammar: root-relative literal paths, backslashes normalized, percent signs and case literal.
 * @evidence contracts/testing.md#distinguishing-cases Covers a literal percent sign in a file name, backslash spelling, a dotted anchor, percent-decoded and wrong-case negatives, and incompleteness suppressing a derivative missing-file result.
 * @evidence contracts/testing.md#execution-ownership The exported test_markdown_target_paths is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_markdown_target_paths(): Promise<void> {
  const reference = await new EvidenceMarkdownAdapter().analyze(
    EvidenceTestSourceSnapshot.create(
      "docs/spec%value.md",
      "## Pricing {#price.v2}",
    ),
  );
  const pricing = requireUnit(reference, "price.v2");
  const claim = await new EvidenceTypeScriptAdapter().analyze(
    EvidenceTestSourceSnapshot.create(
      "src/claim.ts",
      dedent`
        /** @evidence .\\docs\\spec%value.md#price.v2 Uses the portable Markdown target. */
        export function portable(): void {}

        /** @evidence docs/spec%25value.md#price.v2 Must not decode the percent sign. */
        export function encoded(): void {}

        /** @evidence docs/Spec%value.md#price.v2 Must preserve path case. */
        export function wrongCase(): void {}
      `,
    ),
  );
  const resolver = new EvidenceTargetResolver([reference]);
  const declarations = claim.declarations;

  const portable = await resolve(
    resolver,
    claim,
    requireDeclaration(declarations, ".\\docs\\spec%value.md#price.v2"),
    pricing,
  );
  TestValidator.equals(
    "portable root-relative path",
    portable.status,
    "resolved",
  );
  TestValidator.equals("literal dotted anchor", portable.units, [pricing]);

  const encoded = await resolve(
    resolver,
    claim,
    requireDeclaration(declarations, "docs/spec%25value.md#price.v2"),
    pricing,
  );
  TestValidator.equals(
    "percent sign is not decoded",
    encoded.status,
    "missing-file",
  );

  const wrongCase = await resolve(
    resolver,
    claim,
    requireDeclaration(declarations, "docs/Spec%value.md#price.v2"),
    pricing,
  );
  TestValidator.equals(
    "Markdown path is case sensitive",
    wrongCase.status,
    "missing-file",
  );

  // Incomplete source analysis suppresses a derivative missing-path result.
  const incomplete = structuredClone(reference);
  incomplete.complete = false;
  incomplete.diagnostics.push({
    code: "fixture-markdown-incomplete",
    severity: "error",
    message: "The Markdown reference is incomplete.",
    repair: "Restore its source before resolving targets.",
  });
  const interrupted = await resolve(
    new EvidenceTargetResolver([incomplete]),
    claim,
    requireDeclaration(declarations, "docs/Spec%value.md#price.v2"),
    pricing,
  );

  TestValidator.equals(
    "incomplete reference suppresses missing path",
    interrupted.status,
    "incomplete",
  );
}

async function resolve(
  resolver: EvidenceTargetResolver,
  claim: IEvidenceInventory,
  declaration: IEvidenceDeclaration,
  unit: IEvidenceUnit,
): Promise<IEvidenceTargetResolution> {
  return resolver.resolve(declaration, requireHost(claim, declaration.hostId), [
    unit.id,
  ]);
}

function requireDeclaration(
  declarations: IEvidenceDeclaration[],
  target: string,
): IEvidenceDeclaration {
  const declaration = declarations.find(
    (candidate) => candidate.target === target,
  );
  if (declaration === undefined)
    throw new Error(`Missing Markdown target declaration: ${target}`);
  return declaration;
}

function requireHost(inventory: IEvidenceInventory, id: string): IEvidenceHost {
  const host = inventory.hosts.find((candidate) => candidate.id === id);
  if (host === undefined)
    throw new Error(`Missing Markdown target host: ${id}`);
  return host;
}

function requireUnit(
  inventory: IEvidenceInventory,
  identity: string,
): IEvidenceUnit {
  const unit = inventory.units.find(
    (candidate) => candidate.identity.at(-1) === identity,
  );
  if (unit === undefined)
    throw new Error(`Missing Markdown target unit: ${identity}`);
  return unit;
}
