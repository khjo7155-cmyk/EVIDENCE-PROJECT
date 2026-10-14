import { EvidenceAdapterCertification } from "../../internal/certification/EvidenceAdapterCertification";
import { EvidenceAdapterCertificationFixtures } from "../../internal/certification/EvidenceAdapterCertificationFixtures";

/**
 * Certifies exact adapter inventories, ownership, hosts, withdrawals, and
 * source ranges.
 *
 * The independently declared fixture surface prevents an adapter from passing
 * by publishing only a convenient subset of its parsed declarations.
 *
 * 1. Analyze every shared adapter fixture.
 * 2. Compare units, addresses, attached hosts, and withdrawn hierarchy with
 *    fixture expectations.
 * 3. Verify Unicode annotation ranges retain the expected source coordinates.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared inventory certification, comparing units, addresses, hosts, withdrawals and Unicode ranges for every fixture.
 * @evidence contracts/testing.md#independent-expectations The fixture surface is declared independently, so a convenient subset of declarations cannot pass.
 * @evidence contracts/testing.md#distinguishing-cases Covers every certified language's units, aliases, hosts, withdrawals and annotation ranges.
 * @evidence contracts/testing.md#execution-ownership The exported test_adapter_certification_inventories is discovered by DynamicExecutor; its cases are registered through EvidenceAdapterCertificationFixtures.all(), which owns the per-language fixtures, and it calls the adapters in-process without installing or spawning anything.
 */
export async function test_adapter_certification_inventories(): Promise<void> {
  for (const certification of EvidenceAdapterCertificationFixtures.all()) {
    const inventory = await EvidenceAdapterCertification.analyze(certification);
    EvidenceAdapterCertification.assertInventory(certification, inventory);
  }
}
