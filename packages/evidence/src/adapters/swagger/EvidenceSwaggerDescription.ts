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
 *
 * @evidence contracts/common.md#principled-implementation Description prose before the first active Evidence directive is the semantic part, so fingerprints ignore review metadata while keeping author prose.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only splits text; the directive boundary helper shares example masking with tag parsing.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Directive-looking lines inside examples stay prose.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the split; every function and helper is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceSwaggerDescription {
  /**
   * Returns description prose before the first active Evidence directive.
   *
   * Directive-looking lines inside fenced examples remain semantic prose.
   *
   * @evidence contracts/common.md#principled-implementation The text before the directive boundary is returned.
   * @evidence contracts/common.md#clear-and-simple-design Boundary detection is a private helper.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Examples cannot end prose early.
   * @evidence contracts/common.md#meaningful-documentation The comment states the boundary rule.
   * @evidence contracts/performance.md#efficient-algorithms Linear in description length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each description is split once per fingerprint.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
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
   *
   * @evidence contracts/common.md#principled-implementation Any active directive line makes the description a documentation carrier.
   * @evidence contracts/common.md#clear-and-simple-design It shares the boundary helper with semantic.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Empty visible prose with metadata still becomes a carrier.
   * @evidence contracts/common.md#meaningful-documentation The comment explains its use.
   * @evidence contracts/performance.md#efficient-algorithms Linear in description length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each description is checked once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
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
