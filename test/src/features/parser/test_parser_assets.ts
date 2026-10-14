import { EvidenceTestParserAssets } from "../../internal/EvidenceTestParserAssets";
import { TestValidator } from "@nestia/e2e";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  EvidenceTreeSitterAssetCache,
  EvidenceTreeSitterAssets,
} from "@wrtnlabs/evidence";
import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";

/**
 * Shares verified grammar bytes in memory without creating filesystem
 * artifacts.
 *
 * Cold acquisition, offline reuse, and caller isolation must work even when a
 * legacy cache path names a regular file. Existing disk entries are ignored.
 *
 * 1. Acquire a cold grammar from eight callers; require one transfer, complete
 *    bytes, and independent returned arrays.
 * 2. Reuse those bytes from another provider offline, then mutate the returned
 *    copy and require another offline read to remain intact.
 * 3. Require no files after cold and warm acquisition. Use a regular file as the
 *    legacy cache path and require acquisition without modifying it.
 * 4. Exercise default and environment namespaces from an empty working directory;
 *    require successful acquisition and no created directories.
 *
 * @evidence contracts/testing.md#behavioral-verification Acquires grammars from concurrent callers and offline providers and asserts transfer counts, byte isolation and absence of files.
 * @evidence contracts/testing.md#independent-expectations Expected lengths and digests come from the pinned record.
 * @evidence contracts/testing.md#distinguishing-cases Covers cold shared acquisition, offline reuse, returned-copy mutation, a regular file as the legacy cache path, and default and environment namespaces.
 * @evidence contracts/testing.md#execution-ownership The exported test_parser_assets is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_parser_assets(): Promise<void> {
  const original = new EvidenceTreeSitterAssets();
  const grammar = await original.grammar("python");
  const pinned = Uint8Array.from(await EvidenceTestParserAssets.bytes(grammar));
  const directory = join(__dirname, "assets-" + randomUUID());

  await EvidenceTestFileSystem.experiment(directory, {}, async (location) => {
    const requests: string[] = [];
    const assets = new EvidenceTreeSitterAssets({
      cacheDirectory: location,
      fetch: async (input) => {
        requests.push(String(input));
        return new Response(pinned);
      },
    });

    // Independent callers share a single cold transfer and receive owned byte arrays.
    const results = await Promise.all(
      Array.from({ length: 8 }, () => assets.bytes(grammar)),
    );
    TestValidator.equals("one pinned request", requests, [grammar.wasm.url]);
    TestValidator.predicate(
      "all callers receive the complete grammar",
      results.every((bytes) => Buffer.from(bytes).equals(pinned)),
    );
    const first = results[0];
    if (first !== undefined) first.fill(0);
    TestValidator.predicate(
      "callers cannot mutate shared bytes",
      results.slice(1).every((bytes) => Buffer.from(bytes).equals(pinned)),
    );

    // A separate resolver performs no request with verified cache bytes, including no HEAD.
    const offline = new EvidenceTreeSitterAssets({
      cacheDirectory: location,
      attempts: 1,
      fetch: async () => {
        throw new Error("offline");
      },
    });
    TestValidator.equals(
      "warm offline bytes",
      Array.from(await offline.bytes(grammar)),
      Array.from(pinned),
    );

    const warm: Uint8Array = await offline.bytes(grammar);
    warm.fill(0);
    TestValidator.equals(
      "warm reads cannot mutate memory",
      Array.from(await offline.bytes(grammar)),
      Array.from(pinned),
    );
    TestValidator.equals("no acquisition files", await readdir(location), []);

    await EvidenceTestFileSystem.save(location, { "cache-file": "unchanged" });
    await new EvidenceTreeSitterAssetCache({
      cacheDirectory: join(location, "cache-file"),
      fetch: async (): Promise<Response> => new Response(pinned),
    }).bytes(grammar);
    TestValidator.equals(
      "legacy path is never opened",
      await readdir(location),
      ["cache-file"],
    );
    TestValidator.equals(
      "existing file is preserved",
      await readFile(join(location, "cache-file"), "utf8"),
      "unchanged",
    );

    const projectDirectory = join(location, "project");
    await EvidenceTestFileSystem.save(projectDirectory, {});
    const previousWorkingDirectory = process.cwd();
    const previousCacheDirectory = process.env["EVID_CACHE_DIR"];
    delete process.env["EVID_CACHE_DIR"];
    try {
      process.chdir(projectDirectory);
      await new EvidenceTreeSitterAssetCache({
        fetch: async (): Promise<Response> => new Response(pinned),
      }).bytes(grammar);
    } finally {
      process.chdir(previousWorkingDirectory);
      if (previousCacheDirectory === undefined)
        delete process.env["EVID_CACHE_DIR"];
      else process.env["EVID_CACHE_DIR"] = previousCacheDirectory;
    }
    TestValidator.equals(
      "default acquisition creates no directories",
      await readdir(projectDirectory),
      [],
    );

    // The environment value isolates memory without being opened as a path.
    const environmentDirectory: string = join(location, "environment cache");
    const previousEnvironmentDirectory: string | undefined =
      process.env["EVID_CACHE_DIR"];
    process.env["EVID_CACHE_DIR"] = environmentDirectory;
    try {
      await new EvidenceTreeSitterAssetCache({
        fetch: async (): Promise<Response> => new Response(pinned),
      }).bytes(grammar);
    } finally {
      if (previousEnvironmentDirectory === undefined)
        delete process.env["EVID_CACHE_DIR"];
      else process.env["EVID_CACHE_DIR"] = previousEnvironmentDirectory;
    }
    TestValidator.equals(
      "environment namespace creates no files",
      (await readdir(location)).sort((left: string, right: string): number =>
        left.localeCompare(right),
      ),
      ["cache-file", "project"],
    );
  });
}
