import { EvidenceAdapterCertification } from "../../internal/certification/EvidenceAdapterCertification";
import { EvidenceAdapterCertificationFixtures } from "../../internal/certification/EvidenceAdapterCertificationFixtures";

/**
 * Certifies that common adapters fail safely on incomplete or misleading
 * source.
 *
 * Certification fixtures exercise adapter boundaries where a partial inventory
 * could otherwise make graph coverage look successful.
 *
 * 1. Run failure certification for every shared adapter fixture.
 * 2. Require unsupported and malformed source to produce incomplete inventories.
 * 3. Require literal false-positive annotations to remain rejected rather than
 *    becoming evidence.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared failure certification for every adapter fixture, analyzing unsupported, malformed and false-positive sources.
 * @evidence contracts/testing.md#independent-expectations Each fixture declares its expected failure cases independently of adapter output.
 * @evidence contracts/testing.md#distinguishing-cases Covers unsupported constructs, malformed syntax and tag-shaped false positives for every certified language.
 * @evidence contracts/testing.md#execution-ownership The exported test_adapter_certification_failures is discovered by DynamicExecutor; its cases are registered through EvidenceAdapterCertificationFixtures.all(), which owns the per-language fixtures, and it calls the adapters in-process without installing or spawning anything.
 */
export async function test_adapter_certification_failures(): Promise<void> {
  for (const certification of EvidenceAdapterCertificationFixtures.all())
    await EvidenceAdapterCertification.assertFailures(certification);
}
