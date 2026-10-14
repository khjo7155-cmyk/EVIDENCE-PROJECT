import { EvidenceAdapterCertification } from "../../internal/certification/EvidenceAdapterCertification";
import { EvidenceAdapterCertificationFixtures } from "../../internal/certification/EvidenceAdapterCertificationFixtures";

/**
 * Certifies the Scala adapter through the shared adapter contract.
 *
 * The registered Scala certification fixture provides inventory, graph,
 * failure, and fingerprint cases that must remain valid without
 * adapter-specific test rewrites.
 *
 * 1. Locate the Scala fixture in the shared certification set.
 * 2. Run inventory and graph certification against its adapter and scenarios.
 * 3. Verify incomplete, fingerprint, and ambiguity expectations through the shared
 *    certification helpers.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared adapter certification for the Scala fixture (inventory, graph, failure, fingerprint and ambiguity checks).
 * @evidence contracts/testing.md#independent-expectations The fixture declares the expected surface independently of the adapter; the shared harness compares adapter output against it.
 * @evidence contracts/testing.md#distinguishing-cases Covers the shared certification dimensions for this language; per-feature behavior is owned by the language's other tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_scala_certification is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_scala_certification(): Promise<void> {
  const fixture = EvidenceAdapterCertificationFixtures.all().find(
    (item) => item.type === "scala",
  );
  if (fixture === undefined)
    throw new Error("Scala certification fixture is missing.");

  EvidenceAdapterCertification.assertInventory(
    fixture,
    await EvidenceAdapterCertification.analyze(fixture),
  );
  await EvidenceAdapterCertification.assertGraph(fixture);
  await EvidenceAdapterCertification.assertFailures(fixture);
  await EvidenceAdapterCertification.assertFingerprint(fixture);
  await EvidenceAdapterCertification.assertAmbiguity(fixture);
}
