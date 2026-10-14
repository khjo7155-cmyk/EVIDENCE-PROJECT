import { EvidenceTestParserAssets } from "../../internal/EvidenceTestParserAssets";
import { TestValidator } from "@nestia/e2e";
import { EvidenceTreeSitterAssets } from "@wrtnlabs/evidence";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

import { EvidenceTestFileSystem } from "../../internal/EvidenceTestFileSystem";
import { EvidenceTestParserError } from "../../internal/EvidenceTestParserError";
import { EvidenceTestSignal } from "../../internal/EvidenceTestSignal";

/**
 * Isolates subscriber cancellation while bounding shared acquisition timeouts.
 *
 * Two asset providers can subscribe to one cold transfer. Aborting one caller
 * must not invalidate another caller's bytes, while an unresponsive transport
 * must still terminate after the configured finite retry budget.
 *
 * 1. Join two providers to a transfer held behind a signal, with cancellation
 *    attached only to the first subscriber.
 * 2. Abort the first subscriber and require its asset-cancelled failure, then
 *    release the transfer and check the survivor:
 *
 *    - It receives the complete pinned byte length.
 *    - Exactly one transfer occurred and its transport signal was not aborted.
 * 3. Use a separate empty cache and a transport that waits for abort; configure
 *    two attempts with a short deadline and require asset-download failure
 *    after exactly two timeout aborts.
 *
 * @evidence contracts/testing.md#behavioral-verification Acquires a shared grammar from two providers with one cancelled, then a hanging transport, asserting bytes, transfer count and failure codes.
 * @evidence contracts/testing.md#independent-expectations Expected byte length comes from the pinned record; counts come from the controlled transport.
 * @evidence contracts/testing.md#distinguishing-cases Covers subscriber-local cancellation and bounded timeouts across retries.
 * @evidence contracts/testing.md#execution-ownership The exported test_parser_acquisition_cancellation is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_parser_acquisition_cancellation(): Promise<void> {
  const grammar = await new EvidenceTreeSitterAssets().grammar("python");
  const pinned = Uint8Array.from(await EvidenceTestParserAssets.bytes(grammar));
  await EvidenceTestFileSystem.experiment(
    join(__dirname, `cancel-${randomUUID()}`),
    {},
    async (cacheDirectory) => {
      const release = new EvidenceTestSignal();
      const joined = new EvidenceTestSignal();
      const cancellation = new AbortController();
      let requests = 0;
      let transferAborted = false;
      /**
       * Holds a shared download until both subscriber paths can be exercised.
       *
       * The captured transport signal distinguishes subscriber cancellation
       * from aborting the underlying request that the surviving caller still
       * needs.
       */
      async function transfer(
        _input: string | URL | Request,
        init?: RequestInit,
      ): Promise<Response> {
        ++requests;
        await release.wait;
        transferAborted = init?.signal?.aborted ?? false;
        return new Response(pinned);
      }
      const first = new EvidenceTreeSitterAssets({
        cacheDirectory,
        fetch: transfer,
        signal: cancellation.signal,
      });
      const second = new EvidenceTreeSitterAssets({
        cacheDirectory,
        fetch: transfer,
        progress: () => joined.open(),
      });
      const cancelled = EvidenceTestParserError.expect("asset-cancelled", () =>
        first.bytes(grammar),
      );
      const survivor = second.bytes(grammar);
      try {
        await joined.wait;
        cancellation.abort();
        await cancelled;
        release.open();
        TestValidator.equals(
          "other subscriber receives verified bytes",
          (await survivor).length,
          pinned.length,
        );
        TestValidator.equals("one shared transfer", requests, 1);
        TestValidator.equals(
          "shared transfer not aborted",
          transferAborted,
          false,
        );
      } finally {
        release.open();
        await Promise.allSettled([cancelled, survivor]);
      }

      // A timeout aborts the transport and retries only the configured finite number of times.
      let timeouts = 0;
      const timed = new EvidenceTreeSitterAssets({
        cacheDirectory: join(cacheDirectory, "timeout"),
        attempts: 2,
        timeoutMilliseconds: 10,
        fetch: async (_input, init) =>
          new Promise<Response>((_resolve, reject) => {
            const signal = init?.signal;
            if (signal === undefined || signal === null) {
              reject(new Error("Expected a bounded transfer signal."));
              return;
            }
            function abort(): void {
              ++timeouts;
              reject(new Error("timeout"));
            }
            if (signal.aborted) abort();
            else signal.addEventListener("abort", abort, { once: true });
          }),
      });
      await EvidenceTestParserError.expect("asset-download", () =>
        timed.bytes(grammar),
      );
      TestValidator.equals("bounded timeout attempts", timeouts, 2);
    },
  );
}
