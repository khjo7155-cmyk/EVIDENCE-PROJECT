import type { Node as EvidenceNode } from "web-tree-sitter";
import type { EvidenceDatabaseSymbol } from "../../typings/EvidenceDatabaseSymbol";

/**
 * Defines dialect-specific decisions for the shared SQL table scanner.
 *
 * The scanner owns common declaration extraction; a policy supplies only the
 * syntax and namespace choices that vary by SQL dialect.
 *
 * @evidence contracts/common.md#principled-implementation Identifier decoding, statement validation, optional identity and reference projection, and relation options capture exactly what differs between SQL dialects.
 * @evidence contracts/common.md#clear-and-simple-design The shared scanner owns extraction; the policy only answers dialect questions.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed syntax; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceSqlPolicy {
  /**
   * Decodes one grammar identifier under this dialect's quoting rules.
   *
   * Returning `undefined` rejects the spelling and makes the containing scan
   * incomplete rather than inventing an address.
   *
   * @evidence contracts/common.md#principled-implementation The hook decodes one identifier under the dialect's quoting rules.
   * @evidence contracts/common.md#clear-and-simple-design Decoding is the dialect's responsibility.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Returning undefined rejects the spelling instead of inventing an address.
   * @evidence contracts/common.md#meaningful-documentation The comment states the rejection effect.
   * @evidenceExclude contracts/performance.md#efficient-algorithms A callback signature chooses no algorithm; each dialect implements it.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work The signature computes nothing.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The signature holds no resource.
   */
  identifier: (raw: string) => string | undefined;

  /**
   * Validates a complete grammar statement or comment for this dialect.
   *
   * Returning a message marks the analysis incomplete and provides the
   * diagnostic reason; returning `undefined` permits common extraction.
   *
   * @evidence contracts/common.md#principled-implementation The hook validates a statement or comment and returns a rejection reason.
   * @evidence contracts/common.md#clear-and-simple-design Validation is the dialect's responsibility; the scanner records the reason.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts A returned message marks analysis incomplete.
   * @evidence contracts/common.md#meaningful-documentation The comment states both outcomes.
   * @evidenceExclude contracts/performance.md#efficient-algorithms A callback signature chooses no algorithm; each dialect implements it.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work The signature computes nothing.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The signature holds no resource.
   */
  validate: (node: EvidenceNode) => string | undefined;

  /**
   * Projects a decoded public address into its dialect-specific identity.
   *
   * Omission preserves the address as the semantic identity.
   *
   * @evidence contracts/common.md#principled-implementation The optional hook projects a decoded address into dialect identity, such as case folding.
   * @evidence contracts/common.md#clear-and-simple-design Projection is optional per dialect.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Omission keeps the address as identity rather than guessing.
   * @evidence contracts/common.md#meaningful-documentation The comment states omission.
   * @evidenceExclude contracts/performance.md#efficient-algorithms A callback signature chooses no algorithm; each dialect implements it.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work The signature computes nothing.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The signature holds no resource.
   */
  identity?: (address: string[], symbol: EvidenceDatabaseSymbol) => string[];

  /**
   * Resolves a referenced table name within its declared owner scope.
   *
   * Omission leaves the decoded reference unchanged when building relation
   * endpoint identity.
   *
   * @evidence contracts/common.md#principled-implementation The optional hook resolves a referenced table name within its owner's scope.
   * @evidence contracts/common.md#clear-and-simple-design Resolution is optional per dialect.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Omission leaves the reference unchanged.
   * @evidence contracts/common.md#meaningful-documentation The comment states omission.
   * @evidenceExclude contracts/performance.md#efficient-algorithms A callback signature chooses no algorithm; each dialect implements it.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work The signature computes nothing.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The signature holds no resource.
   */
  reference?: (reference: string[], owner: string[]) => string[];

  /**
   * States whether a grammar constraint name is a relation's public name.
   *
   * Omission treats explicit table constraint names as relation names.
   */
  constraintNames?: boolean;

  /**
   * Selects how column-level `REFERENCES` syntax contributes relations.
   *
   * Omission uses the scanner's normal relation behavior; `ignore` omits it and
   * `reject` records dialect incompleteness.
   */
  inlineReferences?: "ignore" | "relation" | "reject";
}
