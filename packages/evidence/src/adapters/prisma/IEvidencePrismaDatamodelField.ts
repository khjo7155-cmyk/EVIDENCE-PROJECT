/**
 * One resolved model member returned by Prisma's schema parser.
 *
 * This reduced parser payload contains only information that affects Evidence
 * unit selection, documentation, and fingerprints.
 *
 * @evidence contracts/common.md#principled-implementation A parser field keeps name, kind and documentation, the data that affects selection and fingerprints.
 * @evidence contracts/common.md#clear-and-simple-design The loader maps fields into detached records.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields are copied from parsed schema data; no schema- or project-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment states what the record represents and its role in the adapter; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidencePrismaDatamodelField {
  /**
   * Parser-resolved field name within its owning model.
   *
   * The loader retains this parser-approved spelling for the model member's
   * identity instead of attempting to classify source tokens independently.
   */
  name: string;

  /**
   * Parser classification used to select supported database members.
   *
   * `EvidencePrismaModelLoader` maps object fields to relations and every other
   * retained field to columns when it creates the adapter's normalized field
   * contract.
   */
  kind: string;

  /**
   * Parser-attached documentation, when source supplied it.
   *
   * `null` and omission both mean no parser documentation is available.
   */
  documentation?: string | null;
}
