import { EvidenceDocumentation } from "../../parsers/EvidenceDocumentation";
import { EvidenceDocumentationExamples } from "../../parsers/EvidenceDocumentationExamples";
import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceCDocumentation } from "./IEvidenceCDocumentation";

/**
 * Reads C Doxygen documentation while masking embedded source examples.
 *
 * The C adapter uses this wrapper around the shared reader so Evidence tags in
 * code and preformatted examples cannot be mistaken for documentation claims.
 *
 * @evidence contracts/common.md#principled-implementation Doxygen carriers are normalized through EvidenceDocumentation with C's comment syntax, and code examples are masked in place so offsets never move.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps carriers; attachment is decided by the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Examples are masked rather than removed, so tag-shaped example text never becomes an annotation.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains example masking; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceCDocumentation {
  /**
   * Maps one classified C documentation carrier for Evidence tag parsing.
   *
   * Withdrawal-capable Doxygen receives native and HTML example masking; other
   * comment forms retain the shared source mapping without that prose syntax.
   *
   * @evidence contracts/common.md#principled-implementation The carrier is normalized and Doxygen example regions are replaced with spaces in place.
   * @evidence contracts/common.md#clear-and-simple-design It composes EvidenceDocumentation with the shared or language-specific example masking.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Masked characters keep their positions, so diagnostics stay aligned with the source.
   * @evidence contracts/common.md#meaningful-documentation The comment explains masking and preserved offsets.
   * @evidence contracts/performance.md#efficient-algorithms Linear in carrier length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each carrier is read once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(
    source: IEvidenceSourceFile,
    documentation: IEvidenceCDocumentation,
    hostId: string,
  ): IEvidenceDocumentation {
    const parsed = EvidenceDocumentation.read(
      source.content,
      hostId,
      documentation.range,
      documentation.syntax,
    );
    if (!documentation.syntax.allowWithdrawal) return parsed;
    return { ...parsed, text: mask(parsed.text) };
  }

  /**
   * Masks Markdown-aware Doxygen and HTML code regions in precedence order.
   *
   * Markdown code cannot open native state. Genuine native code is removed
   * before HTML pairing, and an unclosed native region owns the host
   * remainder.
   */
  function mask(input: string): string {
    const characters: string[] = input.split("");
    const markdown: readonly boolean[] =
      EvidenceDocumentationExamples.markdownCode(input);
    let opening: number | undefined;
    for (const match of input.matchAll(/(?:@|\\)(code|endcode)\b/giu)) {
      const index: number = match.index;
      const command: string = (match[1] ?? "").toLowerCase();
      if (opening === undefined) {
        if (command === "code" && markdown[index] !== true) opening = index;
      } else if (command === "endcode") {
        hide(characters, opening, index + match[0].length);
        opening = undefined;
      }
    }
    if (opening !== undefined) hide(characters, opening, input.length);
    EvidenceDocumentationExamples.maskHtml(characters, input, ["code", "pre"]);
    return characters.join("");
  }

  /**
   * Replaces a Doxygen example span while preserving mapped source positions.
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
