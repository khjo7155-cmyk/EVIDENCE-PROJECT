import { EvidenceAdapterCertification } from "../../internal/certification/EvidenceAdapterCertification";
import { EvidenceAdapterCertificationFixtures } from "../../internal/certification/EvidenceAdapterCertificationFixtures";

/**
 * Certifies passing and missing-evidence graphs for every common adapter
 * fixture.
 *
 * The shared contract checks both graph success and exact missing populations
 * for the type, function, and property categories each adapter supports.
 *
 * 1. Load each programming-language certification fixture.
 * 2. Evaluate its passing graph and its deliberately uncovered graph.
 * 3. Require the uncovered graph to identify the expected missing units.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared graph certification, evaluating passing and deliberately uncovered graphs for every adapter fixture.
 * @evidence contracts/testing.md#independent-expectations Missing units are declared in each fixture, not taken from the evaluation.
 * @evidence contracts/testing.md#distinguishing-cases Covers type, function and property categories per adapter in both passing and missing directions.
 * @evidence contracts/testing.md#execution-ownership The exported test_adapter_certification_graphs is discovered by DynamicExecutor; its cases are registered through EvidenceAdapterCertificationFixtures.all(), which owns the per-language fixtures, and it calls the adapters in-process without installing or spawning anything.
 */
export async function test_adapter_certification_graphs(): Promise<void> {
  for (const certification of EvidenceAdapterCertificationFixtures.all())
    await EvidenceAdapterCertification.assertGraph(certification);
}
