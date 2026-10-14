import type { IEvidenceAddress } from "../../structures/IEvidenceAddress";

/**
 * Parses one whitespace-free Swagger operation target.
 *
 * Swagger has no physical source-file address, so accepted selectors are placed
 * in the synthetic `swagger:` file namespace as one atomic segment.
 *
 * @evidence contracts/common.md#principled-implementation An uppercase method and exact path form one atomic segment under the synthetic swagger: file, because operations have no physical file address.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only parses targets, using the same validation as loader targets.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Shapes the adapter would never materialize are rejected.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the synthetic file; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceSwaggerTarget {
  /**
   * Converts a public `METHOD:/path` selector to an Evidence address.
   *
   * Validation here matches loader targets so a citation cannot select an
   * operation shape the adapter would never materialize.
   *
   * @evidence contracts/common.md#principled-implementation A whitespace-free METHOD:/path selector is validated and returned as one segment.
   * @evidence contracts/common.md#clear-and-simple-design Validation is shared with the loader.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid methods or paths throw.
   * @evidence contracts/common.md#meaningful-documentation The comment explains matching loader validation.
   * @evidence contracts/performance.md#efficient-algorithms Linear in target length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each target is parsed once per resolution.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function parse(target: string): IEvidenceAddress {
    if (/\s/u.test(target))
      throw new Error("Remove whitespace from the Swagger operation target.");
    const separator = target.indexOf(":");
    const method = separator < 0 ? "" : target.slice(0, separator);
    const path = separator < 0 ? "" : target.slice(separator + 1);
    if (
      !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/u.test(method) ||
      method !== method.toUpperCase() ||
      !path.startsWith("/")
    )
      throw new Error(
        "Use an uppercase METHOD:/path target such as POST:/members.",
      );
    return { file: "swagger:", segments: [target] };
  }
}
