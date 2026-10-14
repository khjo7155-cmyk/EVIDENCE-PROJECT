import { EvidenceAdapterCertification } from "../../internal/certification/EvidenceAdapterCertification";
import { EvidenceAdapterCertificationFixtures } from "../../internal/certification/EvidenceAdapterCertificationFixtures";

/**
 * Certifies mutation-sensitive fingerprints and ambiguous target handling.
 *
 * Adapters must keep a unit fingerprint stable for annotation prose, change it
 * for implementation content, and never resolve an injected collision to an
 * arbitrary declaration.
 *
 * 1. Run mutation certification for each shared adapter fixture.
 * 2. Change annotation prose and require the fingerprint to remain stable, then
 *    change declared implementation content and require it to move.
 * 3. Inject a competing target and require the resolver to report ambiguity.
 *
 * @evidence contracts/testing.md#behavioral-verification Runs the shared mutation certification: prose edits, implementation edits and injected collisions for every fixture.
 * @evidence contracts/testing.md#independent-expectations Fingerprint expectations are relational (stable for prose, changed for content); ambiguity is the documented outcome for collisions.
 * @evidence contracts/testing.md#distinguishing-cases Covers fingerprint stability, sensitivity and ambiguous targets per language.
 * @evidence contracts/testing.md#execution-ownership The exported test_adapter_certification_mutations is discovered by DynamicExecutor; its cases are registered through EvidenceAdapterCertificationFixtures.all(), which owns the per-language fixtures, and it calls the adapters in-process without installing or spawning anything.
 */
export async function test_adapter_certification_mutations(): Promise<void> {
  for (const certification of EvidenceAdapterCertificationFixtures.all()) {
    await EvidenceAdapterCertification.assertFingerprint(certification);
    await EvidenceAdapterCertification.assertAmbiguity(certification);
  }
}
