import type { IEvidenceAddress } from "../../structures/IEvidenceAddress";

/**
 * Parses one root-relative Markdown path and optional literal anchor.
 *
 * Target resolution uses this grammar for Markdown references, retaining the
 * anchor as one accessor segment because Markdown headings are not nested
 * paths.
 *
 * @evidence contracts/common.md#principled-implementation A root-relative path plus one literal anchor segment models Markdown targets, since headings are not nested accessor paths.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns Markdown target spelling; the resolver maps it to selected files.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Anchors are never parsed as programming accessors or percent-decoded.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the single-segment anchor; both functions are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceMarkdownTarget {
  /**
   * Splits a Markdown target into its root-relative file and literal anchor.
   *
   * Text after the first '#' is one anchor segment, including dots, colons and
   * hyphens, because Markdown headings are not nested accessor paths. A missing
   * '#' cites the file unit; an empty file or a trailing '#' throws.
   *
   * @evidence contracts/common.md#principled-implementation The text before '#' is normalized as a root-relative path and everything after it is kept as one literal anchor segment.
   * @evidence contracts/common.md#clear-and-simple-design Path normalization is delegated to normalize.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts A trailing '#' or empty file throws with the correct spelling instead of citing the file unit by accident.
   * @evidence contracts/common.md#meaningful-documentation The new comment states the split, the literal anchor and the failures.
   * @evidence contracts/performance.md#efficient-algorithms Linear in target length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each target is parsed once per resolution.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function parse(target: string): IEvidenceAddress {
    const hash = target.indexOf("#");
    if (hash === target.length - 1)
      throw new Error(
        "Name a Markdown anchor after '#', or omit '#' when citing the file unit itself.",
      );
    const file = normalize(hash < 0 ? target : target.slice(0, hash));
    if (file === "") throw new Error("Name the Markdown file before '#'.");
    return {
      file,
      segments: hash < 0 ? [] : [target.slice(hash + 1)],
    };
  }

  /**
   * Preserves authored path text except portable separators and leading `./`.
   *
   * This makes equivalent relative spellings compare consistently without
   * resolving dot segments or changing the case-sensitive public file address.
   *
   * @evidence contracts/common.md#principled-implementation Separators become slashes and repeated leading './' is removed, keeping case and dot segments as authored.
   * @evidence contracts/common.md#clear-and-simple-design Normalization is lexical only.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No case folding or dot-segment resolution changes the public address.
   * @evidence contracts/common.md#meaningful-documentation The comment explains what is and is not normalized.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the line length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Normalization is evaluated per line during one scan.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function normalize(file: string): string {
    let output = file.replaceAll("\\", "/");
    while (output.startsWith("./")) output = output.slice(2);
    return output;
  }
}
