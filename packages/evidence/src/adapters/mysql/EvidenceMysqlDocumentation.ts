import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";

/**
 * Maps an attached MySQL COMMENT literal without losing original UTF-16
 * positions.
 *
 * The MySQL scanner supplies the literal range after it has established
 * ownership.
 *
 * @evidence contracts/common.md#principled-implementation COMMENT string literals are decoded with doubled-quote escapes while keeping original UTF-16 offsets for every character.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps literals; ownership is established by the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Backslash escapes, whose meaning depends on server mode, are rejected rather than guessed.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains offset preservation; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceMysqlDocumentation {
  /**
   * Decodes SQL doubled quotes while rejecting server-mode-dependent backslash
   * escapes.
   *
   * Rejection avoids assigning annotation offsets under an unknown MySQL
   * session mode.
   *
   * @evidence contracts/common.md#principled-implementation Doubled quotes collapse to one character while offsets and ends map each decoded character to its source span.
   * @evidence contracts/common.md#clear-and-simple-design It produces IEvidenceDocumentation directly for decoded text.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Server-mode-dependent backslash escapes return no mapping.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the rejection.
   * @evidence contracts/performance.md#efficient-algorithms Linear in literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each literal is read once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(
    content: string,
    range: IEvidenceSourceRange,
    hostId: string,
  ): IEvidenceDocumentation | undefined {
    const raw = content.slice(range.start.offset, range.end.offset);
    if (!/^'(?:[^'\\]|'')*'$/su.test(raw)) return undefined;
    const result: IEvidenceDocumentation = {
      hostId,
      text: "",
      offsets: [],
      ends: [],
      tagBoundaries: true,
      allowWithdrawal: true,
    };
    for (
      let cursor = range.start.offset + 1;
      cursor < range.end.offset - 1;
      ++cursor
    ) {
      const character = content[cursor] ?? "";
      result.text += character;
      result.offsets.push(cursor);
      if (character === "'" && content[cursor + 1] === "'") ++cursor;
      result.ends.push(cursor + 1);
    }
    result.offsets.push(range.end.offset - 1);
    return result;
  }
}
