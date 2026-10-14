import { EvidenceDocumentation } from "../../parsers/EvidenceDocumentation";
import { EvidenceDocumentationExamples } from "../../parsers/EvidenceDocumentationExamples";
import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceMatlabDocumentation } from "./IEvidenceMatlabDocumentation";

/**
 * Reads MATLAB help while preserving source mappings and masking code examples.
 *
 * The MATLAB adapter supplies attached help carriers here before shared tag
 * parsing, preserving source coordinates while examples become ineligible
 * text.
 *
 * @evidence contracts/common.md#principled-implementation MATLAB help carriers are normalized through EvidenceDocumentation with MATLAB's comment syntax, and code examples are masked in place so offsets never move.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps carriers; attachment is decided by the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Examples are masked rather than removed, so tag-shaped example text never becomes an annotation.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains example masking; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceMatlabDocumentation {
  /**
   * Maps a carrier and masks examples without moving source offsets.
   *
   * The resulting documentation retains its source mapping while annotations in
   * help examples cannot be parsed as Evidence declarations.
   *
   * @evidence contracts/common.md#principled-implementation The carrier is normalized and MATLAB help example regions are replaced with spaces in place.
   * @evidence contracts/common.md#clear-and-simple-design It composes EvidenceDocumentation with the shared or language-specific example masking.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Masked characters keep their positions, so diagnostics stay aligned with the source.
   * @evidence contracts/common.md#meaningful-documentation The comment explains masking and preserved offsets.
   * @evidence contracts/performance.md#efficient-algorithms Linear in carrier length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each carrier is read once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(
    source: IEvidenceSourceFile,
    documentation: IEvidenceMatlabDocumentation,
    hostId: string,
  ): IEvidenceDocumentation {
    const parsed = EvidenceDocumentation.read(
      source.content,
      hostId,
      documentation.range,
      documentation.syntax,
    );
    return {
      ...parsed,
      text: mask(parsed.text),
    };
  }

  /**
   * Masks HTML examples and Markdown-indented code in MATLAB help text.
   *
   * Shared Evidence parsing handles fenced examples separately; this helper
   * only replaces content whose physical offsets must remain aligned with the
   * source.
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
   * `mask` uses the common indentation baseline to identify lines belonging to
   * an indented example without changing line lengths or coordinates.
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
   * Preserved newlines and character positions keep parsed tag offsets valid
   * for source diagnostics after the example text has been hidden.
   */
  function hide(characters: string[], start: number, end: number): void {
    for (let index = start; index < end; ++index)
      if (characters[index] !== "\n" && characters[index] !== "\r")
        characters[index] = " ";
  }
}
