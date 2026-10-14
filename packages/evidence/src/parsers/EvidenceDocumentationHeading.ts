import type { IEvidenceDocumentationHeading } from "./IEvidenceDocumentationHeading";

/**
 * Shares ATX title normalization between documentation tags and Markdown units.
 *
 * Callers establish example and indentation boundaries before passing a trimmed
 * line, keeping comment padding separate from heading syntax.
 *
 * @evidence contracts/common.md#principled-implementation One ATX parser shared by documentation tags and Markdown outlines keeps title and anchor normalization identical.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns heading syntax only; callers handle examples and indentation.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No document-specific heading rule exists.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment states the caller's responsibilities.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceDocumentationHeading {
  /**
   * Reads a trimmed H1-H6 heading with optional closing hashes and anchor.
   *
   * A missing space after the opening hashes leaves the line as ordinary text.
   * Explicit anchors are metadata, never part of an annotation explanation.
   *
   * @evidence contracts/common.md#principled-implementation A CommonMark-style ATX pattern requires a space after one to six hashes, strips optional closing hashes and extracts a trailing {#anchor}.
   * @evidence contracts/common.md#clear-and-simple-design The function returns structure; callers decide whether a heading is tagged.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Lines without the required space stay ordinary text instead of being guessed as headings.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the space rule and anchor metadata.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the line length with two anchored regular expressions.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each line is parsed once by its reader.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function parse(
    line: string,
  ): IEvidenceDocumentationHeading | undefined {
    const match: RegExpExecArray | null = /^(#{1,6})(?:[ \t]+(.*)|$)/u.exec(
      line,
    );
    if (match === null) return undefined;
    const level: number = match[1]?.length ?? 0;
    const title: string = (match[2] ?? "")
      .replace(/(?:^|[ \t]+)#+$/u, "")
      .trim();
    const anchor: RegExpExecArray | null =
      /\s*\{#([A-Za-z0-9][A-Za-z0-9._:-]*)\}\s*$/u.exec(title);
    return anchor === null || anchor[1] === undefined
      ? { level, title }
      : {
          level,
          title: title.slice(0, anchor.index).trim(),
          anchor: anchor[1],
        };
  }
}
