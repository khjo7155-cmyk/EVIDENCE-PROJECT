import {
  EvidenceAccessor,
  EvidenceBigQueryAdapter,
  EvidenceMysqlAdapter,
  EvidencePostgresqlAdapter,
  EvidenceSqlAdapter,
  EvidenceSqliteAdapter,
} from "@wrtnlabs/evidence";
import type {
  IEvidenceAdapter,
  IEvidenceDeclaration,
  IEvidenceHost,
  IEvidenceInventory,
  IEvidenceDiagnostic,
  IEvidenceUnit,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceAdapterCertification } from "../../internal/certification/EvidenceAdapterCertification";
import { EvidenceAdapterCertificationFixtures } from "../../internal/certification/EvidenceAdapterCertificationFixtures";
import type { IEvidenceAdapterCertification } from "../../internal/certification/IEvidenceAdapterCertification";
import type { IEvidenceAdapterCertificationSource } from "../../internal/certification/IEvidenceAdapterCertificationSource";
import type { IEvidenceAdapterCertificationRequirement } from "../../internal/certification/IEvidenceAdapterCertificationRequirement";
import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Carries heading annotations through every programming reader and SQL dialect.
 *
 * Adapter prefilters must recognize the same tags as the common parser,
 * including unsupported carriers, without changing declaration ownership or
 * populations.
 *
 * 1. Replace certified evidence tags with H2, H3, and H4 variants in each
 *    language.
 * 2. Require complete inventories, exact target owners, and passing graph
 *    coverage; remove each acknowledgement in turn and require the
 *    corresponding gap.
 * 3. Apply the heading form to each language's attachment counterexamples and
 *    require the same supported target and unsupported-host findings.
 * 4. Parse heading documentation through all SQL dialect adapters and verify model
 *    and column ownership with multiline reasons.
 *
 * @evidence contracts/testing.md#behavioral-verification Rewrites certified tags into H2-H4 heading forms for every language and SQL dialect and asserts inventories, ownership, coverage and gaps.
 * @evidence contracts/testing.md#independent-expectations Expected owners and coverage are the fixtures' certified values.
 * @evidence contracts/testing.md#distinguishing-cases Covers each heading depth, removal of each acknowledgement, attachment counterexamples, and SQL multiline reasons.
 * @evidence contracts/testing.md#execution-ownership The exported test_adapter_heading_annotations is discovered by DynamicExecutor; its cases are registered through EvidenceAdapterCertificationFixtures.all(), which owns the per-language fixtures, and it calls the adapters in-process without installing or spawning anything.
 */
export async function test_adapter_heading_annotations(): Promise<void> {
  for (const certification of EvidenceAdapterCertificationFixtures.all()) {
    for (const level of [2, 3, 4]) {
      const prefix: string = "#".repeat(level) + " ";
      const sources: IEvidenceAdapterCertificationSource[] =
        certification.sources.map(
          (
            source: IEvidenceAdapterCertificationSource,
          ): IEvidenceAdapterCertificationSource => ({
            ...source,
            content: source.content.replaceAll(
              "@evidence ",
              prefix + "@evidence ",
            ),
          }),
        );
      const variant: IEvidenceAdapterCertification = {
        ...certification,
        sources,
      };
      const inventory: IEvidenceInventory =
        await EvidenceAdapterCertification.analyze(variant);
      TestValidator.equals(
        `${certification.type} H${level} complete`,
        inventory.complete,
        true,
      );
      TestValidator.equals(
        `${certification.type} H${level} diagnostics`,
        inventory.diagnostics,
        [],
      );
      TestValidator.equals(
        `${certification.type} H${level} ownership`,
        inventory.declarations
          .map((entry: IEvidenceDeclaration): string[] => {
            const host: IEvidenceHost | undefined = inventory.hosts.find(
              (candidate: IEvidenceHost): boolean =>
                candidate.id === entry.hostId,
            );
            const unit: IEvidenceUnit | undefined = inventory.units.find(
              (candidate: IEvidenceUnit): boolean =>
                host !== undefined && host.unitIds.includes(candidate.id),
            );
            if (unit === undefined)
              throw new Error("Heading annotation has no semantic owner.");
            return [
              entry.target,
              `${unit.symbol}:${EvidenceAccessor.format(unit.identity)}`,
            ];
          })
          .sort(comparePair),
        certification.requirements
          .map((entry: IEvidenceAdapterCertificationRequirement): string[] => [
            entry.target,
            entry.unit,
          ])
          .sort(comparePair),
      );
      await EvidenceAdapterCertification.assertGraph(variant);
    }
    const counterexample: IEvidenceInventory =
      await EvidenceAdapterCertification.analyze(certification, [
        {
          ...certification.falsePositive.source,
          content: certification.falsePositive.source.content.replaceAll(
            "@evidence ",
            "## @evidence ",
          ),
        },
      ]);
    TestValidator.equals(
      `${certification.type} heading attachment control`,
      counterexample.declarations.map(
        (entry: IEvidenceDeclaration): string => entry.target,
      ),
      [certification.falsePositive.attachedTarget],
    );
    TestValidator.equals(
      `${certification.type} unsupported heading carriers`,
      counterexample.diagnostics.filter(
        (entry: IEvidenceDiagnostic): boolean =>
          entry.code === "unsupported-annotation-host",
      ).length,
      certification.falsePositive.unsupportedAnnotations,
    );
  }

  const adapters: IEvidenceAdapter[] = [
    new EvidenceSqlAdapter(),
    new EvidencePostgresqlAdapter(),
    new EvidenceMysqlAdapter(),
    new EvidenceSqliteAdapter(),
    new EvidenceBigQueryAdapter(),
  ];
  for (const adapter of adapters) {
    const table: string =
      adapter.type === "postgresql" ? "public.records" : "records";
    const inventory: IEvidenceInventory = await adapter.analyze(
      EvidenceTestSourceSnapshot.create(
        "schema.sql",
        dedent`
      -- ## @evidence docs/spec.md#table
      -- Stores the required records.
      CREATE TABLE ${table} (
        -- #### @evidence docs/spec.md#id
        -- Identifies each record.
        id INT
      );
    `,
      ),
    );
    TestValidator.equals(
      `${adapter.type} heading diagnostics`,
      inventory.diagnostics,
      [],
    );
    TestValidator.equals(
      `${adapter.type} table and column targets`,
      inventory.declarations
        .map((entry: IEvidenceDeclaration): string => entry.target)
        .sort((left: string, right: string): number =>
          left.localeCompare(right),
        ),
      ["docs/spec.md#id", "docs/spec.md#table"],
    );
  }
}

/**
 * Orders target-owner pairs for comparison independent of extraction order.
 *
 * Targets distinguish fixture obligations without relying on physical host IDs.
 */
function comparePair(left: string[], right: string[]): number {
  return JSON.stringify(left).localeCompare(JSON.stringify(right));
}
