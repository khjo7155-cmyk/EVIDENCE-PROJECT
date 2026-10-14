/**
 * Programming-language identifiers accepted by programming artifact adapters.
 *
 * A configuration selects one of these explicit parser and extraction
 * contracts; filename detection is not a substitute for declaring the artifact
 * type. New language research remains in the candidate types until it meets
 * that contract.
 *
 * @evidence contracts/common.md#principled-implementation Explicit language literals select a certified parser and extraction contract rather than relying on filename detection.
 * @evidence contracts/common.md#clear-and-simple-design The alias only enumerates languages; grammars and adapters are registered elsewhere.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Only certified languages are listed; candidates stay in EvidenceLanguageCandidateId.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why the type is declared and where uncertified research belongs.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceProgrammingType =
  | "c"
  | "cpp"
  | "csharp"
  | "dart"
  | "go"
  | "java"
  | "javascript"
  | "kotlin"
  | "lua"
  | "matlab"
  | "objc"
  | "php"
  | "python"
  | "ruby"
  | "rust"
  | "scala"
  | "swift"
  | "typescript"
  | "zig";
