import { EvidenceAdapterCertification } from "../../internal/certification/EvidenceAdapterCertification";
import { EvidenceAdapterCertificationFixtures } from "../../internal/certification/EvidenceAdapterCertificationFixtures";

/**
 * Certifies Dart inventory, graph, failure, fingerprint, and ambiguity
 * behavior.
 *
 * The Dart fixture supplies an independent public surface for the shared
 * certification helpers.
 *
 * 1. Locate the Dart certification fixture.
 * 2. Validate its analyzed inventory against the fixture.
 * 3. Run its graph, failure, fingerprint, and ambiguity certifications.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared adapter certification for the Dart fixture (inventory, graph, failure, fingerprint and ambiguity checks).
 * @evidence contracts/testing.md#independent-expectations The fixture declares the expected surface independently of the adapter; the shared harness compares adapter output against it.
 * @evidence contracts/testing.md#distinguishing-cases Covers the shared certification dimensions for this language; per-feature behavior is owned by the language's other tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_dart_certification is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_dart_certification(): Promise<void> {
  const fixture = EvidenceAdapterCertificationFixtures.all().find(
    (item) => item.type === "dart",
  );
  if (fixture === undefined)
    throw new Error("Dart certification fixture is missing.");

  EvidenceAdapterCertification.assertInventory(
    fixture,
    await EvidenceAdapterCertification.analyze(fixture),
  );
  await EvidenceAdapterCertification.assertGraph(fixture);
  await EvidenceAdapterCertification.assertFailures(fixture);
  await EvidenceAdapterCertification.assertFingerprint(fixture);
  await EvidenceAdapterCertification.assertAmbiguity(fixture);
}
