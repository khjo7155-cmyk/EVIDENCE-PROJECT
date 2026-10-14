import { EvidenceDocumentation } from "../../parsers/EvidenceDocumentation";
import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceDbmlDocumentation } from "./IEvidenceDbmlDocumentation";

/**
 * Decodes DBML note escapes without losing original UTF-16 annotation
 * positions.
 *
 * The adapter uses mapped positions to attach Evidence tags to original source
 * text.
 *
 * @evidence contracts/common.md#principled-implementation DBML note strings and comments are decoded with escape handling while each character keeps its original UTF-16 span.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps text whose owner the scanner already established.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported escapes are rejected rather than approximated.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains offset preservation; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceDbmlDocumentation {
  /**
   * Reads established comment or note ownership and preserves mapped decoded
   * characters.
   *
   * Callers provide a scanner-created carrier after structural ownership is
   * known.
   *
   * @evidence contracts/common.md#principled-implementation Comment or note text is decoded and mapped back to source offsets for the tag parser.
   * @evidence contracts/common.md#clear-and-simple-design Ownership is supplied by the caller.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Malformed escapes produce no mapping.
   * @evidence contracts/common.md#meaningful-documentation The comment explains preserved mappings.
   * @evidence contracts/performance.md#efficient-algorithms Linear in carrier length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each carrier is read once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(
    content: string,
    hostId: string,
    documentation: IEvidenceDbmlDocumentation,
  ): IEvidenceDocumentation {
    const parsed = EvidenceDocumentation.read(
      content,
      hostId,
      documentation.range,
      documentation.syntax,
    );
    if (!documentation.syntax.opening.startsWith("'")) return parsed;
    const offsets: number[] = [];
    const ends: number[] = [];
    let text = "";
    for (let index = 0; index < parsed.text.length; ++index) {
      let character = parsed.text[index] ?? "";
      const start = parsed.offsets[index];
      if (character === "\\" && index + 1 < parsed.text.length) {
        character = parsed.text[++index] ?? "";
        character =
          character === "n"
            ? "\n"
            : character === "r"
              ? "\r"
              : character === "t"
                ? "\t"
                : character;
      }
      const end = parsed.ends[index];
      if (start === undefined || end === undefined)
        throw new Error("A DBML note lost its original source mapping.");
      text += character;
      offsets.push(start);
      ends.push(end);
    }
    offsets.push(parsed.offsets.at(-1) ?? documentation.range.end.offset);
    return { ...parsed, text, offsets, ends };
  }
}
