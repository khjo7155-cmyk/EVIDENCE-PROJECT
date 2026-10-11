import { EvidenceDocumentationExamples } from "../../parsers/EvidenceDocumentationExamples";
import { EvidenceDocumentationHeading } from "../../parsers/EvidenceDocumentationHeading";
import type { IEvidenceDocumentationHeading } from "../../parsers/IEvidenceDocumentationHeading";

const TAG =
  /^@(evidenceExcludeReview|evidenceReview|evidenceExclude|evidence|link)(?:[ \t]|$)/u;

/**
 * Separates operation prose from Evidence metadata appended to a description.
 *
 * Fingerprints retain author-facing prose but exclude Evidence directives,
 * which control review state without changing the described API operation.
 */
export namespace EvidenceSwaggerDescription {
  /**
   * Returns description prose before the first active Evidence directive.
   *
   * Directive-looking lines inside fenced examples remain semantic prose.
   */
  export function semantic(text: string): string {
    const lines: string[] = text.split("\n");
    const index: number = boundary(text);
    return lines
      .slice(0, index < 0 ? lines.length : index)
      .join("\n")
      .trimEnd();
  }

  /**
   * Reports whether an active Evidence directive begins in this description.
   *
   * Callers use this to decide whether the mapped scalar must become a
   * documentation carrier even when the visible prose is empty.
   */
  export function hasMetadata(text: string): boolean {
    return boundary(text) >= 0;
  }
}

/**
 * Finds the first directive line outside Markdown examples and HTML comments.
 *
 * Shared example masking keeps semantic description boundaries consistent with
 * the parser that reads the corresponding mapped documentation.
 */
function boundary(text: string): number {
  const characters: string[] = text.split("");
  EvidenceDocumentationExamples.maskHtmlComments(characters, text);
  const input: string = characters.join("");
  const code: readonly boolean[] =
    EvidenceDocumentationExamples.markdownCode(input);
  const lines: string[] = input.split("\n");
  let cursor: number = 0;
  for (const [index, raw] of lines.entries()) {
    const line: string = raw.trim();
    const start: number = cursor + raw.indexOf(line);
    cursor += raw.length + 1;
    if (code[start] === true) continue;
    const heading: IEvidenceDocumentationHeading | undefined =
      EvidenceDocumentationHeading.parse(line);
    const annotation: string =
      heading !== undefined && heading.level >= 2 && heading.level <= 4
        ? heading.title
        : line;
    if (TAG.test(annotation)) return index;
  }
  return -1;
}
