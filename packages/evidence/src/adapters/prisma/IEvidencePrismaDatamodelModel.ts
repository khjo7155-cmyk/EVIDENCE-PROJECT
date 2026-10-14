import type { IEvidencePrismaDatamodelField } from "./IEvidencePrismaDatamodelField";

/**
 * One model or view returned by Prisma's schema parser.
 *
 * The loader later pairs this semantic result with a physical source location
 * instead of treating parser output as an independently owned artifact.
 *
 * @evidence contracts/common.md#principled-implementation A parser model keeps name, fields and documentation for pairing with source locations.
 * @evidence contracts/common.md#clear-and-simple-design The loader maps models into detached records.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaDatamodelModel {
  /**
   * Parser-resolved model or view name.
   *
   * This name joins a semantic model from the WASM parser to its separately
   * scanned source declaration and to its materialized Evidence identity.
   */
  name: string;

  /**
   * Parser-attached block documentation when present.
   *
   * Omission or `null` means the parser found no block documentation;
   * `EvidencePrismaModelLoader` normalizes both states to its detached empty
   * text value.
   */
  documentation?: string | null;

  /**
   * Members belonging to this parser-established model.
   *
   * Their parser classifications are converted into Evidence columns or
   * relations only after the containing model has been materialized.
   */
  fields: IEvidencePrismaDatamodelField[];
}
