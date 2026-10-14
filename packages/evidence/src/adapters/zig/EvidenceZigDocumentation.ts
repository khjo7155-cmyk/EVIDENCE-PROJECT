import { EvidenceDocumentation } from "../../parsers/EvidenceDocumentation";
import { EvidenceDocumentationExamples } from "../../parsers/EvidenceDocumentationExamples";
import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceZigDocumentation } from "./IEvidenceZigDocumentation";

/**
 * Reads Zig documentation while preserving source mappings and masking
 * examples.
 *
 * EvidenceZigAdapter uses this reader so annotations in HTML or indented code
 * examples cannot become claims at the original source host.
 *
 * @evidence contracts/common.md#principled-implementation Zig doc comment carriers are normalized through EvidenceDocumentation with Zig's comment syntax, and code examples are masked in place so offsets never move.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps carriers; attachment is decided by the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Examples are masked rather than removed, so tag-shaped example text never becomes an annotation.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains example masking; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceZigDocumentation {
  /**
   * Maps one carrier and removes examples without moving source offsets.
   *
   * Only triple-slash documentation is masked because other carrier forms exist
   * solely to report unsupported tag-bearing source text with its original
   * mapping.
   *
   * @evidence contracts/common.md#principled-implementation The carrier is normalized and Zig doc comment example regions are replaced with spaces in place.
   * @evidence contracts/common.md#clear-and-simple-design It composes EvidenceDocumentation with the shared or language-specific example masking.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Masked characters keep their positions, so diagnostics stay aligned with the source.
   * @evidence contracts/common.md#meaningful-documentation The comment explains masking and preserved offsets.
   * @evidence contracts/performance.md#efficient-algorithms Linear in carrier length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each carrier is read once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(
    source: IEvidenceSourceFile,
    documentation: IEvidenceZigDocumentation,
    hostId: string,
  ): IEvidenceDocumentation {
    const parsed = EvidenceDocumentation.read(
      source.content,
      hostId,
      documentation.range,
      documentation.syntax,
    );
    if (documentation.syntax.opening !== "///") return parsed;
    return {
      ...parsed,
      text: mask(parsed.text),
    };
  }

  /**
   * Masks HTML examples and Markdown indented code in mapped documentation
   * text.
   *
   * Fenced code remains the shared tag parser's responsibility, while this pass
   * preserves offsets by replacing example characters with spaces.
   */
  function mask(input: string): string {
    const characters = input.split("");
    EvidenceDocumentationExamples.maskHtml(characters, input, ["pre", "code"]);
    const lines = input.split("\n");
    const indents = lines.filter((line) => line.trim() !== "").map(indentation);
    const baseline = indents.reduce(
      (minimum, indent) => Math.min(minimum, indent),
      Infinity,
    );
    let offset = 0;
    for (const line of lines) {
      if (indentation(line) >= baseline + 4)
        hide(characters, offset, offset + line.length);
      offset += line.length + 1;
    }
    return characters.join("");
  }

  /**
   * Counts Markdown indentation after the documentation delimiter is removed.
   *
   * Tab stops advance to four-column boundaries so indented example detection
   * matches Markdown's visual indentation rule for the mapped text.
   */
  function indentation(line: string): number {
    let spaces = 0;
    for (const character of line) {
      if (character === " ") ++spaces;
      else if (character === "\t") spaces += 4 - (spaces % 4);
      else break;
    }
    return spaces;
  }

  /**
   * Replaces example characters while retaining original line boundaries.
   *
   * Keeping line endings intact preserves Evidence tag offsets and diagnostics
   * relative to the original source documentation carrier.
   */
  function hide(characters: string[], start: number, end: number): void {
    for (let index = start; index < end; ++index)
      if (characters[index] !== "\n" && characters[index] !== "\r")
        characters[index] = " ";
  }
}
