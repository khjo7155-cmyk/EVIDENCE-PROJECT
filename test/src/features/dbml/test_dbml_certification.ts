import { EvidenceDbmlCertificationFixture } from "../../internal/EvidenceDbmlCertificationFixture";
import { EvidenceDatabaseAdapterCertification } from "../../internal/certification/EvidenceDatabaseAdapterCertification";

/**
 * Certifies DBML inventories, selector graphs, failures, fingerprints, and
 * ambiguity.
 *
 * The DBML fixture independently specifies the expected database surface for
 * the shared certification contract.
 *
 * 1. Analyze the fixture and compare its declared units, ownership, addresses, and
 *    hosts.
 * 2. Run coverage and failure checks for every DBML selector.
 * 3. Verify review fingerprints and competing target resolution behavior.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared database certification for the DBML fixture (inventory, graph, failure, fingerprint and ambiguity checks).
 * @evidence contracts/testing.md#independent-expectations The fixture declares the expected surface independently of the adapter; the shared harness compares adapter output against it.
 * @evidence contracts/testing.md#distinguishing-cases Covers the shared certification dimensions for this language; per-feature behavior is owned by the language's other tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_dbml_certification is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_dbml_certification(): Promise<void> {
  const fixture = EvidenceDbmlCertificationFixture.create();
  EvidenceDatabaseAdapterCertification.assertInventory(
    fixture,
    await EvidenceDatabaseAdapterCertification.analyze(fixture),
  );
  await EvidenceDatabaseAdapterCertification.assertGraph(fixture);
  await EvidenceDatabaseAdapterCertification.assertFailures(fixture);
  await EvidenceDatabaseAdapterCertification.assertFingerprint(fixture);
  await EvidenceDatabaseAdapterCertification.assertAmbiguity(fixture);
}
