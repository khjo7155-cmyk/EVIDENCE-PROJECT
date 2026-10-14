import { TestValidator } from "@nestia/e2e";
import { EvidenceDatabaseAdapterCertification } from "../../internal/certification/EvidenceDatabaseAdapterCertification";
import { EvidenceSqlCertificationFixture } from "./EvidenceSqlCertificationFixture";

/**
 * Certifies SQL inventory against exact database adapter expectations.
 *
 * Removing a unit, kind, host, or address must fail the fixture rather than
 * weaken its declared contract.
 *
 * 1. Construct the SQL certification fixture.
 * 2. Run shared database certification and its mutation checks.
 * 3. Require every removal and behavior gate to be rejected.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared database certification for the SQL fixture (inventory, graph, failure, fingerprint and ambiguity checks) and asserts that unit, kind, host and address mutations of the inventory are rejected.
 * @evidence contracts/testing.md#independent-expectations The fixture declares the expected surface independently of the adapter, and each mutation must make validation fail.
 * @evidence contracts/testing.md#distinguishing-cases Covers the healthy certification plus four structural mutations; per-feature behavior is owned by the language's other tests.
 * @evidence contracts/testing.md#execution-ownership The exported test_sql_certification is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_sql_certification(): Promise<void> {
  const fixture = EvidenceSqlCertificationFixture.create();
  const inventory = await EvidenceDatabaseAdapterCertification.analyze(fixture);
  EvidenceDatabaseAdapterCertification.assertInventory(fixture, inventory);
  await EvidenceDatabaseAdapterCertification.assertGraph(fixture);
  await EvidenceDatabaseAdapterCertification.assertFailures(fixture);
  await EvidenceDatabaseAdapterCertification.assertFingerprint(fixture);
  await EvidenceDatabaseAdapterCertification.assertAmbiguity(fixture);
  for (const mutation of ["unit", "kind", "host", "address"]) {
    const broken = structuredClone(inventory);
    if (mutation === "unit") broken.units.pop();
    else if (mutation === "kind") {
      const unit = broken.units.find((entry) => entry.symbol === "column");
      if (unit !== undefined) unit.symbol = "relation";
    } else if (mutation === "host") broken.hosts.pop();
    else {
      const address = broken.addresses[0];
      if (address !== undefined) address.segments = ["WRONG"];
    }
    TestValidator.error(`reject ${mutation} mutation`, () =>
      EvidenceDatabaseAdapterCertification.assertInventory(fixture, broken),
    );
  }
}
