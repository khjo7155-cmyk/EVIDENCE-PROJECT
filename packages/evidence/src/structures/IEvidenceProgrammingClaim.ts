import type { EvidenceProgrammingSymbol } from "../typings/EvidenceProgrammingSymbol";
import type { EvidenceProgrammingType } from "../typings/EvidenceProgrammingType";
import type { IEvidenceClaimBase } from "./IEvidenceClaimBase";

/**
 * Public programming declarations that cite evidence in documentation comments.
 *
 * The language adapter extracts declaration identity and documentation
 * ownership before the configured symbol selector chooses claim hosts. This
 * lets one policy require evidence from public functions while still
 * recognizing an exclusion authored on another eligible declaration in the
 * selected files.
 *
 * - Evidence needs a target, a nonempty reason, and a selected declaration host.
 * - Exclusions may use any supported public declaration in a selected file,
 *   regardless of the claim's symbol selector.
 * - Unsupported or unexported declarations host neither form. A TypeScript
 *   variable statement containing callable and data declarations can host both
 *   function and property evidence.
 *
 * @example
 *   const claim: IEvidenceProgrammingClaim = {
 *     type: "typescript",
 *     files: ["src/*.ts"],
 *     symbol: "function",
 *     reference: { type: "markdown", files: ["requirements.md"] },
 *   };
 *
 * @evidence contracts/common.md#principled-implementation Specializing the claim base with programming types and symbols reuses shared selection for code declarations.
 * @evidence contracts/common.md#clear-and-simple-design The interface adds no fields; host rules come from each language adapter.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language is special-cased by this declaration.
 * @evidence contracts/common.md#meaningful-documentation The comment explains which declarations and comments host tags.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceProgrammingClaim extends IEvidenceClaimBase<
  EvidenceProgrammingType,
  EvidenceProgrammingSymbol
> {}
