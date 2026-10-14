import { EvidenceCAdapter } from "@wrtnlabs/evidence";
import type { EvidenceTargetResolutionStatus } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestGraph } from "../../internal/EvidenceTestGraph";
import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

interface IEvidenceCTargetStatus {
  target: string | undefined;
  status: EvidenceTargetResolutionStatus;
}

/**
 * Resolves C tags, typedef aliases, and aggregate members to their declared
 * owners.
 *
 * Target spelling can name either an ordinary public alias or an exact tag, and
 * the resolver must keep those possibilities distinct.
 *
 * 1. Analyze declarations with tags, typedefs, and aggregate fields.
 * 2. Resolve evidence targets using exact names and supported aliases.
 * 3. Require valid targets to resolve and invalid or ambiguous forms to keep their
 *    reported status.
 *
 * @evidence contracts/testing.md#behavioral-verification Resolves C targets for tags, typedef aliases and aggregate members and asserts resolved, missing and ambiguous statuses.
 * @evidence contracts/testing.md#independent-expectations Expected resolutions follow the C addressing rules (exact tag segments and safe aliases).
 * @evidence contracts/testing.md#distinguishing-cases Covers exact tag targets, typedef aliases, aggregate members, and invalid or ambiguous spellings.
 * @evidence contracts/testing.md#execution-ownership The exported test_c_targets is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_c_targets(): Promise<void> {
  const adapter = new EvidenceCAdapter();
  const reference = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "include/models.h",
      dedent`
        typedef struct Sale {
            int total;
        } Sale;

        union Payload {
            int number;
        };

        struct Later {
            int value;
        };
        typedef struct Later Later;

        struct Collision {
            int member;
        };
        extern int Collision;
      `,
    ),
  );
  const claim = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "test/verify.c",
      dedent`
        /**
         * @evidence ../include/models.h#["struct Sale"] Verifies the exact tag.
         * @evidence ../include/models.h#Sale Verifies the typedef alias.
         * @evidence ../include/models.h#Sale.total Verifies its field.
         * @evidence ../include/models.h#Payload Verifies a safe tag alias.
         * @evidence ../include/models.h#Payload.number Verifies its field alias.
         * @evidence ../include/models.h#Later.value Verifies a typedef declared after its tag definition.
         * @evidence ../include/models.h#["struct Collision"] Verifies the exact colliding tag.
         * @evidence ../include/models.h#["struct Collision"].member Verifies its exact field.
         * @evidence ../include/models.h#Collision Verifies the ordinary object.
         * @evidence ../include/models.h#Collision.member Cannot cross into a suppressed tag alias.
         */
        void verify(void) {}
      `,
    ),
  );

  TestValidator.equals(
    "complete C target reference",
    reference.diagnostics,
    [],
  );
  TestValidator.equals("complete C target claim", claim.diagnostics, []);
  const resolutions = await EvidenceTestGraph.resolveDeclarations(
    claim,
    reference,
    reference.units.map((unit) => unit.id),
  );
  TestValidator.equals(
    "C target statuses",
    resolutions
      .map((resolution) => ({
        target: claim.declarations.find(
          (declaration) => declaration.id === resolution.declarationId,
        )?.target,
        status: resolution.resolution.status,
      }))
      .sort(compareTarget),
    (<IEvidenceCTargetStatus[]>[
      {
        target: '../include/models.h#["struct Collision"]',
        status: "resolved",
      },
      {
        target: '../include/models.h#["struct Collision"].member',
        status: "resolved",
      },
      { target: '../include/models.h#["struct Sale"]', status: "resolved" },
      { target: "../include/models.h#Collision", status: "resolved" },
      {
        target: "../include/models.h#Collision.member",
        status: "missing-member",
      },
      { target: "../include/models.h#Later.value", status: "resolved" },
      { target: "../include/models.h#Payload", status: "resolved" },
      { target: "../include/models.h#Payload.number", status: "resolved" },
      { target: "../include/models.h#Sale", status: "resolved" },
      { target: "../include/models.h#Sale.total", status: "resolved" },
    ]).sort(compareTarget),
  );
}

function compareTarget(
  left: IEvidenceCTargetStatus,
  right: IEvidenceCTargetStatus,
): number {
  return compare(left.target ?? "", right.target ?? "");
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
