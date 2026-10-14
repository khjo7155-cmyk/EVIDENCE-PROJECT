import type { EvidenceGrammarWasmAvailability } from "../typings/EvidenceGrammarWasmAvailability";
import type { EvidenceLanguageCandidateId } from "../typings/EvidenceLanguageCandidateId";
import type { EvidenceLanguageCandidateKind } from "../typings/EvidenceLanguageCandidateKind";

/**
 * Research record for a possible future language or embedded-format adapter.
 *
 * Grammar provenance and WASM availability describe parsing feasibility;
 * visibility, declaration boundaries, and blockers describe the semantic work
 * still required. Candidate records are not configuration support or adapter
 * certification.
 *
 * @evidence contracts/common.md#principled-implementation A research record captures grammar, license, WASM availability, visibility model, blockers and next step for an uncertified language.
 * @evidence contracts/common.md#clear-and-simple-design Candidate data is separate from selectable language entries.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Candidates cannot be selected, so research cannot overstate support.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the record's purpose; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceLanguageCandidate {
  /**
   * Stable candidate key used by the research catalog.
   *
   * This belongs to the candidate vocabulary and does not make the value a
   * supported population type.
   */
  id: EvidenceLanguageCandidateId;

  /**
   * Display name identifying the researched language or format.
   *
   * Reports present this label alongside the stable candidate key.
   */
  name: string;

  /**
   * Whether the candidate is a programming language or an embedded format.
   *
   * The distinction affects which declaration and host model must be
   * established.
   */
  kind: EvidenceLanguageCandidateKind;

  /**
   * Dialects considered within this research entry.
   *
   * These define the scope of investigation rather than promising certified
   * support.
   */
  dialects: string[];

  /**
   * Upstream grammar repository used to assess parsing feasibility.
   *
   * Certification still requires pinned provenance and verified runtime
   * compatibility.
   */
  grammarRepository: string;

  /**
   * License information recorded for the candidate grammar.
   *
   * This accompanies provenance when evaluating whether to acquire and ship
   * support.
   */
  grammarLicense: string;

  /**
   * Available route to obtaining grammar WASM bytes.
   *
   * A release asset and a source build impose different acquisition work;
   * neither alone establishes an ABI-compatible, certified adapter.
   */
  wasm: EvidenceGrammarWasmAvailability;

  /**
   * Details qualifying the candidate's WASM acquisition route.
   *
   * These explain build or distribution constraints beyond the route
   * discriminator.
   */
  wasmNotes: string;

  /**
   * Authoritative language reference guiding semantic extraction research.
   *
   * Declaration ownership and public visibility must be derived from the
   * language contract rather than guessed from grammar node names.
   */
  languageReference: string;

  /**
   * Researched rules governing the candidate's public surface.
   *
   * These identify how visibility would affect unit eligibility and coverage.
   */
  visibility: string;

  /**
   * Proposed declaration families and ownership boundaries to extract.
   *
   * The description guides inventory work without claiming that extraction
   * exists.
   */
  declarations: string;

  /**
   * Unresolved requirements preventing adapter certification.
   *
   * Each item identifies a concrete parsing or semantic gap to resolve before
   * promoting the candidate into supported capabilities.
   */
  blockers: string[];

  /**
   * Next concrete research or implementation step for the candidate.
   *
   * This keeps the record actionable without turning it into a support
   * guarantee.
   */
  next: string;
}
