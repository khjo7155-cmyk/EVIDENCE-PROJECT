import { EvidenceTestParserAssets } from "../../internal/EvidenceTestParserAssets";
import { TestValidator } from "@nestia/e2e";
import { EvidenceTreeSitterAssets } from "@wrtnlabs/evidence";
import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";
import { EvidenceTestParserError } from "../../internal/EvidenceTestParserError";

/**
 * Rejects unverified grammar downloads and permits recovery on the same
 * provider.
 *
 * Retry policy must distinguish transient transport failures from permanent
 * HTTP and content-integrity failures. Rejected work must leave neither a
 * completed memory entry nor a retained promise that prevents a later healthy
 * acquisition.
 *
 * 1. Return HTTP 503 and require asset-download failure after the configured two
 *    attempts; switch to HTTP 404 and require only one additional request.
 * 2. Supply truncated, oversized, and same-sized modified bytes separately:
 *
 *    - Each attempt fails with asset-corrupt.
 *    - No files or directories are created.
 *    - Integrity failures are not retried.
 * 3. Switch the same provider to pinned bytes and require successful acquisition
 *    with exactly one additional request.
 *
 * @evidence contracts/testing.md#behavioral-verification Acquires grammars through failing and corrupting transports and asserts error codes, request counts, no files and recovery.
 * @evidence contracts/testing.md#independent-expectations Expectations follow the retry and integrity contract: transient HTTP retries, permanent HTTP and integrity failures do not.
 * @evidence contracts/testing.md#distinguishing-cases Covers HTTP 503 and 404, truncated, oversized and modified bytes, and recovery with pinned bytes.
 * @evidence contracts/testing.md#execution-ownership The exported test_parser_acquisition_failures is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_parser_acquisition_failures(): Promise<void> {
  const grammar = await new EvidenceTreeSitterAssets().grammar("python");
  const pinned = Uint8Array.from(await EvidenceTestParserAssets.bytes(grammar));
  await EvidenceTestFileSystem.experiment(
    join(__dirname, `acquisition-${randomUUID()}`),
    {},
    async (cacheDirectory) => {
      let requests = 0;
      let mode = "unavailable";
      const assets = new EvidenceTreeSitterAssets({
        cacheDirectory,
        attempts: 2,
        fetch: async () => {
          ++requests;
          if (mode === "unavailable")
            return new Response("unavailable", { status: 503 });
          if (mode === "missing")
            return new Response("missing", { status: 404 });
          if (mode === "truncated")
            return new Response(pinned.slice(0, pinned.length - 1));
          if (mode === "oversized")
            return new Response(new Uint8Array(pinned.length + 1));
          if (mode === "modified")
            return new Response(new Uint8Array(pinned.length));
          return new Response(pinned);
        },
      });

      await EvidenceTestParserError.expect("asset-download", () =>
        assets.bytes(grammar),
      );
      TestValidator.equals("bounded transient attempts", requests, 2);
      mode = "missing";
      await EvidenceTestParserError.expect("asset-download", () =>
        assets.bytes(grammar),
      );
      TestValidator.equals("permanent HTTP error is not retried", requests, 3);

      for (const invalid of ["truncated", "oversized", "modified"]) {
        mode = invalid;
        await EvidenceTestParserError.expect("asset-corrupt", () =>
          assets.bytes(grammar),
        );
        TestValidator.equals(
          `${invalid} bytes never published`,
          await readdir(cacheDirectory),
          [],
        );
      }
      TestValidator.equals("checksum failures are not retried", requests, 6);
      mode = "healthy";
      TestValidator.equals(
        "same resolver recovers",
        (await assets.bytes(grammar)).length,
        pinned.length,
      );
      TestValidator.equals("one recovery request", requests, 7);
    },
  );
}
