import { readFile } from "node:fs/promises";
import { hash, Singleton, VariadicSingleton } from "tstl";
import { Language, Parser } from "web-tree-sitter";

import { EvidenceParserError } from "../parsers/EvidenceParserError";
import type { IEvidenceGrammar } from "../structures/IEvidenceGrammar";

/**
 * Initializes the WASM binding once and shares immutable loaded grammar
 * modules.
 *
 * Web-tree-sitter offers no language disposal API, so cache keys use verified
 * byte digests and instances are intentionally process-lifetime resources.
 *
 * @evidence contracts/common.md#principled-implementation The binding is initialized once and each verified grammar is loaded once per digest because web-tree-sitter offers no language disposal.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns runtime initialization and language loading; the parser owns sessions.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Core WASM is read from its resolved package path rather than fetched relative to cwd.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains why languages are process-lifetime resources.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace adds no algorithm; it caches loads.
 * @evidence contracts/performance.md#reuse-equivalent-work Engine initialization is a Singleton and language loads are a VariadicSingleton keyed by WASM digest, so every caller shares one load.
 * @evidence contracts/performance.md#bound-retention-and-release-resources Loaded languages are retained for the process because the binding exposes no unload API; the population is bounded by the pinned grammar count.
 */
export namespace EvidenceTreeSitterRuntime {
  /**
   * Returns the language module for verified grammar bytes after engine
   * initialization.
   *
   * The runtime key is the grammar digest, so equivalent metadata objects share
   * one process-lifetime Language instance regardless of object identity.
   *
   * @evidence contracts/common.md#principled-implementation Awaiting the initialization singleton before loading guarantees the engine exists, and keying by digest makes equal bytes share a Language.
   * @evidence contracts/common.md#clear-and-simple-design Loading and error translation are in the singletons; the function only sequences them.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Link failures become grammar-incompatible errors rather than being retried with other runtimes.
   * @evidence contracts/common.md#meaningful-documentation The comment explains digest keying.
   * @evidence contracts/performance.md#efficient-algorithms Constant work after the first call: one awaited singleton and a digest lookup.
   * @evidence contracts/performance.md#reuse-equivalent-work Calls with the same digest share one in-flight or completed load through the VariadicSingleton.
   * @evidence contracts/performance.md#bound-retention-and-release-resources Returned languages are process-lifetime by design; the cache holds at most one per pinned grammar digest.
   */
  export async function language(
    grammar: IEvidenceGrammar,
    bytes: Uint8Array,
  ): Promise<Language> {
    await initialization.get();
    return languages.get(grammar, bytes);
  }

  /**
   * Initializes the installed web-tree-sitter engine once on first use.
   *
   * Loading the packaged core WASM from its resolved path avoids cwd-sensitive
   * fetches, and failures become runtime-initialization diagnostics.
   */
  const initialization = new Singleton(async () => {
    try {
      // Supplying local bytes avoids cwd-sensitive URLs and any runtime fetch fallback.
      const wasmBinary = await readFile(
        require.resolve("web-tree-sitter/web-tree-sitter.wasm"),
      );
      await Parser.init({ wasmBinary });
    } catch (cause) {
      throw new EvidenceParserError(
        "runtime-initialization",
        "web-tree-sitter",
        "Cannot initialize the packaged WASM runtime. Inspect the installed core asset and underlying error.",
        undefined,
        { cause },
      );
    }
  });

  /**
   * Shares one grammar Language load per immutable WASM digest.
   *
   * The singleton compares digest strings rather than input objects because all
   * callers with the same verified bytes can safely reuse one loaded module.
   */
  const languages = new VariadicSingleton(
    async (grammar: IEvidenceGrammar, bytes: Uint8Array): Promise<Language> => {
      try {
        return await Language.load(bytes);
      } catch (cause) {
        throw new EvidenceParserError(
          "grammar-incompatible",
          grammar.wasm.file,
          `Cannot link grammar ${grammar.id} (${grammar.version}) with web-tree-sitter. Supply a compatible pinned grammar/runtime pair.`,
          undefined,
          { cause },
        );
      }
    },
    ([grammar]) => hash(grammar.wasm.sha256),
    ([left], [right]) => left.wasm.sha256 === right.wasm.sha256,
  );
}
