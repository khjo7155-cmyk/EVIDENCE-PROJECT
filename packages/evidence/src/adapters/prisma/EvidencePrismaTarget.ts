import type { IEvidenceAddress } from "../../structures/IEvidenceAddress";
import { EvidencePrismaSyntax } from "./EvidencePrismaSyntax";

/**
 * Parses one file-independent Prisma model or member target.
 *
 * Prisma references use the `prisma:` prefix because their parser-established
 * identities can span files, leaving the returned file key as a fixed
 * namespace.
 *
 * @evidence contracts/common.md#principled-implementation Prisma targets use the prisma: prefix and one or two identifier segments, because model identity spans the whole schema rather than one file.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only parses targets.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Malformed targets throw with the correct spelling.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the prefix; the function now has its own comment.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidencePrismaTarget {
  /**
   * Parses `prisma:Model` or `prisma:Model.member` into a schema-wide address.
   *
   * The file key is the fixed `prisma:` namespace because models are unique
   * across the schema. Other spellings throw with the accepted form.
   *
   * @evidence contracts/common.md#principled-implementation The prefix is required and the remainder must be Model or Model.member with valid identifiers, returned under the fixed prisma: file key.
   * @evidence contracts/common.md#clear-and-simple-design Identifier checks are delegated to EvidencePrismaSyntax.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Other spellings throw instead of being reinterpreted.
   * @evidence contracts/common.md#meaningful-documentation The new comment states the accepted forms.
   * @evidence contracts/performance.md#efficient-algorithms Linear in target length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each target is parsed once per resolution.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function parse(target: string): IEvidenceAddress {
    if (!target.startsWith("prisma:"))
      throw new Error("Start a Prisma target with 'prisma:'.");
    const segments = target.slice("prisma:".length).split(".");
    if (
      (segments.length !== 1 && segments.length !== 2) ||
      segments.some((segment) => !EvidencePrismaSyntax.identifier(segment))
    )
      throw new Error(
        "Use prisma:Model or prisma:Model.member with valid Prisma identifiers.",
      );
    return { file: "prisma:", segments };
  }
}
