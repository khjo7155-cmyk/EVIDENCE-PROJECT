import type { IEvidenceDocumentationHeading } from "./IEvidenceDocumentationHeading";

/**
 * Shares ATX title normalization between documentation tags and Markdown units.
 *
 * Callers establish example and indentation boundaries before passing a trimmed
 * line, keeping comment padding separate from heading syntax.
 */
export namespace EvidenceDocumentationHeading {
  /**
   * Reads a trimmed H1-H6 heading with optional closing hashes and anchor.
   *
   * A missing space after the opening hashes leaves the line as ordinary text.
   * Explicit anchors are metadata, never part of an annotation explanation.
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
