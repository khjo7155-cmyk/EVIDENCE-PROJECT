import { EvidenceSqlAdapter } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";
import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Distinguishes leading SQL documentation from trailing and detached comments.
 *
 * Attachment is determined by the declaration boundary, so adjacent comment
 * positions can have different acknowledgement effects.
 *
 * 1. Analyze leading, trailing, and detached SQL comment carriers.
 * 2. Verify only the supported leading comment attaches.
 * 3. Require exact host and declaration outcomes.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes leading, trailing and detached SQL comments and asserts hosts and declarations.
 * @evidence contracts/testing.md#independent-expectations Expected attachment follows the leading-comment rule at the declaration boundary.
 * @evidence contracts/testing.md#distinguishing-cases Covers each comment position next to the same declaration.
 * @evidence contracts/testing.md#execution-ownership The exported test_sql_comment_boundaries is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_sql_comment_boundaries(): Promise<void> {
  const adapter = new EvidenceSqlAdapter();
  const inventory = await adapter.analyze(
    EvidenceTestSourceSnapshot.create(
      "comments.sql",
      dedent`
    CREATE TABLE account (
      first INTEGER, -- @evidence docs/spec.md#trailing A trailing comment.
      -- @evidence docs/spec.md#leading A separate leading comment.
      second INTEGER,
      -- @evidence docs/spec.md#detached A detached comment.

      third INTEGER
    );
  `,
    ),
  );
  TestValidator.equals(
    "comment boundaries preserve the complete table",
    inventory.complete,
    true,
  );
  const attached = inventory.declarations.filter((declaration) =>
    inventory.hosts.some(
      (host) =>
        host.id === declaration.hostId && host.attachment === "attached",
    ),
  );
  TestValidator.equals(
    "only standalone adjacent comment attaches",
    attached.map((entry) => entry.target),
    ["docs/spec.md#leading"],
  );
  TestValidator.equals(
    "trailing and blank-separated tags are diagnosed",
    inventory.diagnostics.filter(
      (entry) => entry.code === "unsupported-annotation-host",
    ).length,
    2,
  );
  const owner = inventory.hosts.find((host) => host.id === attached[0]?.hostId);
  const ownerIds = new Set(owner === undefined ? [] : owner.unitIds);
  TestValidator.equals(
    "leading documentation owns exactly the second column",
    inventory.units
      .filter((unit) => ownerIds.has(unit.id))
      .map((unit) => unit.name),
    ["SECOND"],
  );
}
