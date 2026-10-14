import { EvidenceAdapterCertification } from "../../internal/certification/EvidenceAdapterCertification";
import { EvidenceLuaCertificationFixture } from "../../internal/certification/EvidenceLuaCertificationFixture";

/**
 * Certifies Lua ownership, failures, graph coverage, ambiguity, and
 * fingerprints.
 *
 * The Lua fixture supplies independently declared assertions for the adapter's
 * supported module surface.
 *
 * 1. Validate fixture inventory. 2. Run graph and failure checks. 3. Verify
 *    ambiguity and fingerprint behavior.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared adapter certification for the Lua fixture (inventory, graph, failure, fingerprint and ambiguity checks).
 * @evidence contracts/testing.md#independent-expectations The fixture declares the expected surface independently of the adapter; the shared harness compares adapter output against it.
 * @evidence contracts/testing.md#distinguishing-cases Covers the shared certification dimensions for this language; per-feature behavior is owned by the language's other tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_lua_certification is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_lua_certification(): Promise<void> {
  const fixture = EvidenceLuaCertificationFixture.create();

  EvidenceAdapterCertification.assertInventory(
    fixture,
    await EvidenceAdapterCertification.analyze(fixture),
  );
  await EvidenceAdapterCertification.assertGraph(fixture);
  await EvidenceAdapterCertification.assertFailures(fixture);
  await EvidenceAdapterCertification.assertFingerprint(fixture);
  await EvidenceAdapterCertification.assertAmbiguity(fixture);
}
