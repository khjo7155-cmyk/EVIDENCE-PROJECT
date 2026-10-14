import { EvidenceDocumentation } from "../../parsers/EvidenceDocumentation";
import { EvidenceDocumentationExamples } from "../../parsers/EvidenceDocumentationExamples";
import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceSqlDocumentation } from "./IEvidenceSqlDocumentation";

/**
 * Reads SQL documentation while preserving source mappings and masking code
 * examples.
 *
 * Shared SQL adapters use the result before passing supported annotations to
 * the tag parser.
 *
 * @evidence contracts/common.md#principled-implementation SQL comment carriers are normalized with their delimiters while Markdown and HTML examples are masked, keeping original offsets for tag diagnostics.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps carriers; attachment is decided by scanners.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Example masking keeps tag-shaped examples inert instead of special-casing documents.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains its consumers; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceSqlDocumentation {
  /**
   * Maps a carrier and removes examples without moving source offsets.
   *
   * Preserved offsets keep tag diagnostics aligned with the original SQL
   * source.
   *
   * @evidence contracts/common.md#principled-implementation The carrier is read through EvidenceDocumentation with SQL comment syntax and then masked with the shared example rules.
   * @evidence contracts/common.md#clear-and-simple-design Reading composes the shared documentation and example helpers.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Masking replaces characters in place so offsets never move.
   * @evidence contracts/common.md#meaningful-documentation The comment explains offset preservation.
   * @evidence contracts/performance.md#efficient-algorithms Linear in carrier length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each carrier is read once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(
    source: IEvidenceSourceFile,
    documentation: IEvidenceSqlDocumentation,
    hostId: string,
  ): IEvidenceDocumentation {
    if (documentation.mapped !== undefined)
      return {
        ...documentation.mapped,
        hostId,
        text: mask(documentation.mapped.text),
      };
    const raw = source.content.slice(
      documentation.range.start.offset,
      documentation.range.end.offset,
    );
    const syntax = documentation.syntax ?? {
      opening: raw.startsWith("--")
        ? "--"
        : raw.startsWith("/**")
          ? "/**"
          : "/*",
      closing: raw.startsWith("--") ? "" : "*/",
      linePrefix: raw.startsWith("--") ? "--" : "*",
      tagBoundaries: false,
      allowWithdrawal: true,
    };
    const parsed = EvidenceDocumentation.read(
      source.content,
      hostId,
      documentation.range,
      syntax,
    );
    return {
      ...parsed,
      text: mask(parsed.text),
    };
  }

  /**
   * Masks HTML examples and Markdown indented code before tag parsing.
   *
   * Masking replaces only visible characters so source line and UTF-16
   * positions remain stable.
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
   * Tabs advance to the next four-column boundary before code-block comparison.
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
   * Newlines remain intact so later offset mapping still identifies the source
   * carrier.
   */
  function hide(characters: string[], start: number, end: number): void {
    for (let index = start; index < end; ++index)
      if (characters[index] !== "\n" && characters[index] !== "\r")
        characters[index] = " ";
  }
}
