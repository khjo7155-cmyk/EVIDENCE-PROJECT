import { createHash } from "node:crypto";
import type { ReadableStreamReadResult } from "node:stream/web";
import { setTimeout as delay } from "node:timers/promises";

import { EvidenceParserError } from "../parsers/EvidenceParserError";
import type { IEvidenceGrammar } from "../structures/IEvidenceGrammar";
import type { IEvidenceGrammarAsset } from "../structures/IEvidenceGrammarAsset";
import type { IEvidenceTreeSitterAssetOptions } from "./IEvidenceTreeSitterAssetOptions";
import type { IEvidenceTreeSitterAssetPending } from "./IEvidenceTreeSitterAssetPending";

/**
 * Acquires verified upstream grammar bytes entirely in process memory.
 *
 * Concurrent callers share transfers and completed immutable bytes, then
 * receive independent copies. No acquisition path creates directories, cache
 * files, locks, or temporary files; a new process downloads its own required
 * grammars.
 */
export class EvidenceTreeSitterAssetCache {
  /**
   * Verified bytes retained for reuse during this process's lifetime.
   *
   * Stored arrays remain private; every successful request returns a copy.
   */
  private static readonly completed: Map<string, Uint8Array> = new Map<
    string,
    Uint8Array
  >();

  /**
   * Active transfers with subscriber-local cancellation accounting.
   *
   * The last departing waiter evicts its record after transfer work settles.
   */
  private static readonly pending: Map<
    string,
    IEvidenceTreeSitterAssetPending
  > = new Map<string, IEvidenceTreeSitterAssetPending>();

  /**
   * Captures acquisition controls without network or filesystem work.
   *
   * The legacy cache directory is only a memory namespace for caller isolation.
   */
  public constructor(
    private readonly options: IEvidenceTreeSitterAssetOptions,
  ) {}

  /**
   * Returns caller-owned verified bytes, sharing acquisition with other
   * waiters.
   *
   * Failed and cancelled transfers are evicted so later calls can recover. Only
   * verified successful transfers enter the completed memory cache.
   */
  public async bytes(grammar: IEvidenceGrammar): Promise<Uint8Array> {
    const key: string = JSON.stringify([
      this.options.cacheDirectory ?? process.env["EVID_CACHE_DIR"] ?? "",
      grammar.wasm.url,
      grammar.wasm.size,
      grammar.wasm.sha256,
    ]);
    try {
      if (this.options.signal !== undefined)
        this.options.signal.throwIfAborted();
      const cached: Uint8Array | undefined =
        EvidenceTreeSitterAssetCache.completed.get(key);
      if (cached !== undefined) return cached.slice();

      let pending: IEvidenceTreeSitterAssetPending | undefined =
        EvidenceTreeSitterAssetCache.pending.get(key);
      if (pending === undefined || pending.controller.signal.aborted) {
        const controller: AbortController = new AbortController();
        pending = {
          controller,
          consumers: 0,
          promise: this.download(grammar, controller.signal).then(
            (bytes: Uint8Array): Uint8Array => {
              controller.signal.throwIfAborted();
              EvidenceTreeSitterAssetCache.completed.set(key, bytes);
              return bytes;
            },
          ),
        };
        EvidenceTreeSitterAssetCache.pending.set(key, pending);
      }
      ++pending.consumers;
      try {
        this.options.progress?.(
          `Preparing ${grammar.id} parser (${grammar.version})...`,
        );
        const bytes: Uint8Array = await consume(
          pending.promise,
          this.options.signal,
        );
        return bytes.slice();
      } finally {
        if (--pending.consumers === 0) {
          pending.controller.abort();
          await pending.promise.catch((): undefined => undefined);
          if (EvidenceTreeSitterAssetCache.pending.get(key) === pending)
            EvidenceTreeSitterAssetCache.pending.delete(key);
        }
      }
    } catch (cause) {
      if (this.options.signal?.aborted === true)
        throw new EvidenceParserError(
          "asset-cancelled",
          grammar.id,
          "Parser preparation was cancelled.",
          undefined,
          { cause },
        );
      if (cause instanceof EvidenceParserError) throw cause;
      throw new EvidenceParserError(
        "asset-download",
        grammar.id,
        "Cannot acquire the parser in memory. Restore access to the pinned asset and retry.",
        undefined,
        { cause },
      );
    }
  }

  /**
   * Downloads one pinned grammar with bounded retries, response size, and
   * cancellation.
   *
   * Downloaded bytes are verified before they can enter the shared memory
   * cache.
   */
  private async download(
    grammar: IEvidenceGrammar,
    signal: AbortSignal,
  ): Promise<Uint8Array> {
    const attempts = this.options.attempts ?? 3;
    let failure: unknown;
    for (let attempt = 0; attempt < attempts; ++attempt) {
      signal.throwIfAborted();
      if (attempt !== 0)
        await delay(100 * 2 ** (attempt - 1), undefined, { signal });
      const timeout = new AbortController();
      const timer = setTimeout(
        () => timeout.abort(),
        this.options.timeoutMilliseconds ?? 30_000,
      );
      try {
        const response = await (this.options.fetch ?? globalThis.fetch)(
          grammar.wasm.url,
          {
            signal: AbortSignal.any([signal, timeout.signal]),
            headers: { Accept: "application/wasm, application/octet-stream" },
          },
        );
        if (!response.ok) {
          if (response.body !== null) await response.body.cancel();
          const error = new Error(`HTTP ${response.status}`);
          if (
            response.status === 408 ||
            response.status === 429 ||
            response.status >= 500
          )
            throw error;
          throw new EvidenceParserError(
            "asset-download",
            grammar.id,
            `The pinned parser URL returned HTTP ${response.status}. Restore access to ${grammar.wasm.url} and retry.`,
            undefined,
            { cause: error },
          );
        }
        const bytes = await boundedBody(response, grammar.wasm.size);
        if (!matches(bytes, grammar.wasm))
          throw new EvidenceParserError(
            "asset-corrupt",
            grammar.id,
            "Downloaded parser bytes do not match the pinned size and SHA-256. Restore unmodified access to the pinned asset and retry.",
          );
        return bytes;
      } catch (cause) {
        if (cause instanceof EvidenceParserError) throw cause;
        failure = cause;
      } finally {
        clearTimeout(timer);
      }
    }
    signal.throwIfAborted();
    throw new EvidenceParserError(
      "asset-download",
      grammar.id,
      `Cannot download the pinned parser after ${attempts} attempts. Restore network access to ${grammar.wasm.url} and retry; verified parsers already acquired in this process work offline.`,
      undefined,
      { cause: failure },
    );
  }
}

/**
 * Verifies immutable bytes against the exact declared size and digest.
 *
 * Response headers cannot establish grammar provenance, so this comparison is
 * the shared trust boundary for cached and downloaded data.
 */
function matches(bytes: Uint8Array, asset: IEvidenceGrammarAsset): boolean {
  return (
    bytes.length === asset.size &&
    createHash("sha256").update(bytes).digest("hex") === asset.sha256
  );
}

/**
 * Streams a response with a byte cap so a bad server cannot exhaust the process
 * before validation.
 *
 * The reader is always released, including when the advertised asset is too
 * large or the stream ends unexpectedly.
 */
async function boundedBody(
  response: Response,
  size: number,
): Promise<Uint8Array> {
  if (response.body === null)
    throw new Error("The parser response has no body.");
  const reader: ReadableStreamDefaultReader<Uint8Array> =
    response.body.getReader();
  const output = new Uint8Array(size);
  let length = 0;
  try {
    for (;;) {
      const part: ReadableStreamReadResult<Uint8Array> = await reader.read();
      if (part.done !== false) break;
      if (length + part.value.length > size)
        throw new EvidenceParserError(
          "asset-corrupt",
          "parser download",
          "The parser response exceeds its pinned size.",
        );
      output.set(part.value, length);
      length += part.value.length;
    }
    return output.subarray(0, length);
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

/**
 * Races a shared transfer against one caller's cancellation without cancelling
 * peers.
 *
 * Other parser sessions may still consume the same destination promise, so a
 * single abort cannot own the shared controller.
 */
async function consume(
  promise: Promise<Uint8Array>,
  signal: AbortSignal | undefined,
): Promise<Uint8Array> {
  if (signal === undefined) return promise;
  let cancel: (() => void) | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        cancel = function abort(): void {
          reject(new Error("Parser preparation was cancelled."));
        };
        signal.addEventListener("abort", cancel, { once: true });
        if (signal.aborted) cancel();
      }),
    ]);
  } finally {
    if (cancel !== undefined) signal.removeEventListener("abort", cancel);
  }
}
