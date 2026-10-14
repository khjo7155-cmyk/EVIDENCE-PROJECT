import {
  EvidenceSwiftAdapter,
  EvidenceTreeSitterAssetScope,
  EvidenceTreeSitterAssets,
} from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";
import { EvidenceTestParserAssets } from "../../internal/EvidenceTestParserAssets";
import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Acquires the pinned Swift parser and reuses it offline.
 *
 * Cold and warm analysis must produce the same complete inventory.
 *
 * 1. Record cold parser acquisition.
 * 2. Verify the selected asset and warm offline equivalence.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes Swift with a cold grammar cache while recording requests, then offline, asserting the requested asset and equal inventories.
 * @evidence contracts/testing.md#independent-expectations Only the configured Swift asset may be requested; the offline inventory must equal the cold one.
 * @evidence contracts/testing.md#distinguishing-cases Covers cold acquisition and warm offline reuse.
 * @evidence contracts/testing.md#execution-ownership The exported test_swift_acquisition is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_swift_acquisition(): Promise<void> {
  const grammar = await new EvidenceTreeSitterAssets().grammar("swift");
  const bytes = Uint8Array.from(await EvidenceTestParserAssets.bytes(grammar));
  const source = EvidenceTestSourceSnapshot.create(
    "src/Contract.swift",
    "public struct Contract { public var value = 1 }",
  );

  await EvidenceTestFileSystem.experiment(
    "swift-acquisition",
    {},
    async (directory) => {
      const requests: string[] = [];
      const cold = await EvidenceTreeSitterAssetScope.run(
        {
          cacheDirectory: directory,
          fetch: async (input) => {
            requests.push(String(input));
            return new Response(bytes);
          },
        },
        () => new EvidenceSwiftAdapter().analyze(source),
      );
      const warm = await EvidenceTreeSitterAssetScope.run(
        {
          cacheDirectory: directory,
          attempts: 1,
          fetch: async () => {
            throw new Error("offline");
          },
        },
        () => new EvidenceSwiftAdapter().analyze(source),
      );

      TestValidator.equals(
        "cold analysis requests only the necessary Swift variant",
        requests,
        [grammar.wasm.url],
      );
      TestValidator.equals("cold source is complete", cold.complete, true);
      TestValidator.equals("warm offline analysis is equivalent", warm, cold);
    },
  );
}
