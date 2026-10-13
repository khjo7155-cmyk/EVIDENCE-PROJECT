import type { IEvidenceGrammar } from "@wrtnlabs/evidence";
import { randomUUID } from "node:crypto";

import {
  EvidenceTreeSitterAssets,
  EvidenceTreeSitterAssetScope,
} from "@wrtnlabs/evidence";

/**
 * Supplies pinned test grammars through isolated memory namespaces.
 *
 * Fixture acquisition uses the real network once per grammar and process.
 * Scenario transports reuse those verified bytes without writing a fixture
 * cache.
 */
export namespace EvidenceTestParserAssets {
  /**
   * Returns verified in-memory fixture bytes.
   *
   * The separate namespace keeps scenario retries and cancellations from
   * changing the network fixture acquisition that supplies their input.
   */
  export async function bytes(grammar: IEvidenceGrammar): Promise<Uint8Array> {
    return EvidenceTreeSitterAssetScope.run(
      {
        cacheDirectory: "parser-fixtures",
        fetch: globalThis.fetch,
        attempts: 3,
        timeoutMilliseconds: 30_000,
        signal: undefined,
        progress: undefined,
      },
      async () => new EvidenceTreeSitterAssets().bytes(grammar),
    );
  }

  /**
   * Runs a suite with an isolated grammar acquisition namespace.
   *
   * Nested adapters inherit a controlled transport that supplies catalog-pinned
   * bytes from the fixture namespace instead of creating runtime cache files.
   */
  export async function run<T>(closure: () => Promise<T>): Promise<T> {
    const grammars = await new EvidenceTreeSitterAssets().list();
    const files = new Map(
      grammars.map((grammar) => [grammar.wasm.url, grammar]),
    );

    async function fetchFixture(
      input: string | URL | Request,
    ): Promise<Response> {
      const url = input instanceof Request ? input.url : String(input);
      const grammar = files.get(url);
      if (grammar === undefined)
        throw new Error(`No pinned parser fixture for ${url}`);
      return new Response(Uint8Array.from(await bytes(grammar)));
    }

    return EvidenceTreeSitterAssetScope.run(
      { cacheDirectory: `parser-runtime-${randomUUID()}`, fetch: fetchFixture },
      closure,
    );
  }
}
