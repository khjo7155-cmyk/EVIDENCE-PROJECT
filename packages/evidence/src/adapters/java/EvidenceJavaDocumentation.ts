import { EvidenceDocumentation } from "../../parsers/EvidenceDocumentation";
import { EvidenceDocumentationExamples } from "../../parsers/EvidenceDocumentationExamples";
import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceJavaDocumentation } from "./IEvidenceJavaDocumentation";

/**
 * Reads Javadoc while masking inline and preformatted code examples.
 *
 * The adapter preserves original source coordinates while removing example text
 * from tag parsing, so code-looking annotations cannot create evidence
 * records.
 *
 * @evidence contracts/common.md#principled-implementation Javadoc carriers are normalized through EvidenceDocumentation with Java's comment syntax, and code examples are masked in place so offsets never move.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps carriers; attachment is decided by the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Examples are masked rather than removed, so tag-shaped example text never becomes an annotation.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains example masking; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceJavaDocumentation {
  /**
   * Maps one Java documentation carrier and removes its code examples.
   *
   * Javadoc applies native inline-tag precedence before HTML pairing. Other
   * Java comment forms retain their shared mapping because they do not own this
   * syntax.
   *
   * @evidence contracts/common.md#principled-implementation The carrier is normalized and Javadoc example regions are replaced with spaces in place.
   * @evidence contracts/common.md#clear-and-simple-design It composes EvidenceDocumentation with the shared or language-specific example masking.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Masked characters keep their positions, so diagnostics stay aligned with the source.
   * @evidence contracts/common.md#meaningful-documentation The comment explains masking and preserved offsets.
   * @evidence contracts/performance.md#efficient-algorithms Linear in carrier length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each carrier is read once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(
    source: IEvidenceSourceFile,
    documentation: IEvidenceJavaDocumentation,
    hostId: string,
  ): IEvidenceDocumentation {
    const parsed = EvidenceDocumentation.read(
      source.content,
      hostId,
      documentation.range,
      documentation.syntax,
    );
    if (documentation.syntax.opening !== "/**") return parsed;
    return {
      ...parsed,
      text: mask(parsed.text),
    };
  }

  /**
   * Masks native Javadoc and HTML examples without changing mapped coordinates.
   *
   * Inline tags are hidden before HTML pairing so their literal markup cannot
   * consume ordinary documentation between two separate examples.
   */
  function mask(input: string): string {
    const characters: string[] = input.split("");
    const markdown: readonly boolean[] =
      EvidenceDocumentationExamples.markdownCode(input);
    const openings: string[] = ["{@code", "{@literal", "{@snippet"];
    for (const opening of openings)
      for (let index: number = input.indexOf(opening); index >= 0;) {
        if (markdown[index] === true) {
          index = input.indexOf(opening, index + opening.length);
          continue;
        }
        const end: number = closingBrace(input, index);
        hide(characters, index, end);
        index = input.indexOf(opening, Math.max(end, index + opening.length));
      }
    EvidenceDocumentationExamples.maskHtml(characters, input, ["pre", "code"]);
    return characters.join("");
  }

  /**
   * Finds the balanced end of one native Javadoc inline example.
   *
   * Nested braces belong to the inline body. An unmatched opening owns the rest
   * of the documentation carrier so its contents cannot become annotations.
   */
  function closingBrace(input: string, start: number): number {
    let depth: number = 0;
    for (let index: number = start; index < input.length; ++index) {
      const character: string | undefined = input[index];
      if (character === "{") ++depth;
      else if (character === "}" && --depth === 0) return index + 1;
    }
    return input.length;
  }

  /**
   * Replaces a Javadoc example span while preserving mapped source positions.
   *
   * Newline bytes remain intact so annotations after the example retain their
   * original diagnostic and host ranges.
   */
  function hide(characters: string[], start: number, end: number): void {
    for (let index = start; index < end; ++index)
      if (characters[index] !== "\n" && characters[index] !== "\r")
        characters[index] = " ";
  }
}
