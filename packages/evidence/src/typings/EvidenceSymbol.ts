import type { EvidenceDatabaseSymbol } from "./EvidenceDatabaseSymbol";
import type { EvidenceMarkdownSymbol } from "./EvidenceMarkdownSymbol";
import type { EvidenceProgrammingSymbol } from "./EvidenceProgrammingSymbol";

/**
 * Symbol kind used to select a unit within its artifact-specific inventory.
 *
 * Programming, database, and Markdown adapters contribute their own precise
 * classifications. `operation` covers API operations, whose target semantics do
 * not correspond to a programming declaration or document heading. Consumers
 * must retain the accompanying artifact type when interpreting this value.
 *
 * @evidence contracts/common.md#principled-implementation The union composes each family's selector kinds plus operation, so a selector value always means a kind defined by its artifact family.
 * @evidence contracts/common.md#clear-and-simple-design Family unions own their members; this alias composes them without repetition.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No family is special-cased; operation is listed because API operations have no other family kind.
 * @evidence contracts/common.md#meaningful-documentation The comment explains why the artifact type must accompany the value when interpreting it.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceSymbol =
  | EvidenceProgrammingSymbol
  | EvidenceDatabaseSymbol
  | EvidenceMarkdownSymbol
  | "operation";
