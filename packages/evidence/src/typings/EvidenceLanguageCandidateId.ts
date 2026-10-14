/**
 * Identifier for a language or embedded format still being researched.
 *
 * Candidate IDs are deliberately outside `EvidenceProgrammingType`: recording
 * parser availability, grammar provenance, or extraction gaps must not imply
 * that configurations can already select the language as a supported artifact.
 *
 * @evidence contracts/common.md#principled-implementation The union lists exactly the researched candidates, vue and svelte, so a candidate can never also be a selectable programming type.
 * @evidence contracts/common.md#clear-and-simple-design Candidate identity stays outside EvidenceProgrammingType; candidate details live in IEvidenceLanguageCandidate records.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The union previously still listed nine certified languages; it now matches the registry's actual candidates instead of keeping stale members.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why candidate IDs are kept outside the supported language types.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceLanguageCandidateId = "vue" | "svelte";
