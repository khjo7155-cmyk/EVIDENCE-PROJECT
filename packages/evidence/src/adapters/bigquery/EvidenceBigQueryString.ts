import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";

/**
 * Decodes static GoogleSQL descriptions while retaining original UTF-16
 * coordinates.
 *
 * The BigQuery scanner uses these mappings when an OPTIONS description hosts
 * annotations.
 *
 * @evidence contracts/common.md#principled-implementation Static GoogleSQL string literals in OPTIONS descriptions are decoded with offset maps so annotations keep source coordinates.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps strings; the scanner decides when a description hosts tags.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Byte strings, unsupported escapes and concatenations return no mapping instead of guessed offsets.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains its use; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceBigQueryString {
  /**
   * Returns no mapping for unsupported byte strings, escapes, or concatenated
   * expressions.
   *
   * A missing result makes the enclosing declaration incomplete instead of
   * guessing offsets.
   *
   * @evidence contracts/common.md#principled-implementation Quoted, triple-quoted and raw literals are decoded character by character with start and end offsets.
   * @evidence contracts/common.md#clear-and-simple-design It produces IEvidenceDocumentation directly.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported forms return undefined so the declaration becomes incomplete.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the missing-result rule.
   * @evidence contracts/performance.md#efficient-algorithms Linear in literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each description is read once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(
    raw: string,
    start: number,
  ): IEvidenceDocumentation | undefined {
    const head = /^(r?)("""|'''|"|')/iu.exec(raw);
    if (head === null) return undefined;
    const delimiter = head[2];
    if (delimiter === undefined || !raw.endsWith(delimiter)) return undefined;
    const rawMode = (head[1] ?? "").toLowerCase() === "r";
    const end = raw.length - delimiter.length;
    let text = "";
    const offsets: number[] = [];
    const ends: number[] = [];
    for (let cursor = head[0].length; cursor < end;) {
      const from = cursor;
      let value = raw[cursor++] ?? "";
      if (value === "\\" && !rawMode) {
        const escape = raw[cursor++];
        const simple = escape === undefined ? undefined : ESCAPES.get(escape);
        if (simple !== undefined) value = simple;
        else if (escape === "u" || escape === "U" || escape === "x") {
          const width = escape === "U" ? 8 : escape === "u" ? 4 : 2;
          const digits = raw.slice(cursor, cursor + width);
          if (digits.length !== width || !/^[\da-f]+$/iu.test(digits))
            return undefined;
          const point = Number.parseInt(digits, 16);
          if (point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff))
            return undefined;
          value = String.fromCodePoint(point);
          cursor += width;
        } else return undefined;
      }
      if (cursor > end) return undefined;
      text += value;
      for (let index = 0; index < value.length; ++index) {
        offsets.push(start + from);
        ends.push(start + cursor);
      }
    }
    offsets.push(start + end);
    return {
      hostId: "",
      text,
      offsets,
      ends,
      tagBoundaries: true,
      allowWithdrawal: true,
    };
  }

  const ESCAPES = new Map<string, string>([
    ["n", "\n"],
    ["r", "\r"],
    ["t", "\t"],
    ["b", "\b"],
    ["f", "\f"],
    ["v", "\v"],
    ["a", "\x07"],
    ["\\", "\\"],
    ["'", "'"],
    ['"', '"'],
    ["?", "?"],
  ]);
}
