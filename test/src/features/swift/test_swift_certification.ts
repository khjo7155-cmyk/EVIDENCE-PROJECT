import { EvidenceAdapterCertification } from "../../internal/certification/EvidenceAdapterCertification";
import { EvidenceAdapterCertificationFixtures } from "../../internal/certification/EvidenceAdapterCertificationFixtures";

/**
 * Applies shared adapter certification to Swift.
 *
 * The Swift fixture defines inventory, graph, and fingerprint expectations.
 *
 * 1. Construct the fixture.
 * 2. Run every shared certification gate.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared adapter certification for the Swift fixture (inventory, graph, failure, fingerprint and ambiguity checks).
 * @evidence contracts/testing.md#independent-expectations The fixture declares the expected surface independently of the adapter; the shared harness compares adapter output against it.
 * @evidence contracts/testing.md#distinguishing-cases Covers the shared certification dimensions for this language; per-feature behavior is owned by the language's other tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_swift_certification is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_swift_certification(): Promise<void> {
  const fixture = EvidenceAdapterCertificationFixtures.all().find(
    (item) => item.type === "swift",
  );
  if (fixture === undefined)
    throw new Error("Swift certification fixture is missing.");

  EvidenceAdapterCertification.assertInventory(
    fixture,
    await EvidenceAdapterCertification.analyze(fixture),
  );
  await EvidenceAdapterCertification.assertGraph(fixture);
  await EvidenceAdapterCertification.assertFailures(fixture);
  await EvidenceAdapterCertification.assertFingerprint(fixture);
  await EvidenceAdapterCertification.assertAmbiguity(fixture);
}
