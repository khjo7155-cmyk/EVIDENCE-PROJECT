import type { Scalar } from "yaml";

import type { IEvidenceYamlScalarMapping } from "./IEvidenceYamlScalarMapping";
import { EvidenceSourceText } from "../../internal/EvidenceSourceText";

/**
 * Maps a decoded YAML string scalar back to its original UTF-16 token.
 *
 * Swagger documentation extraction needs this mapping because YAML escape
 * decoding changes text length while Evidence diagnostics must address source.
 *
 * @evidence contracts/common.md#principled-implementation Decoded YAML string scalars are mapped back to their source token so annotation diagnostics address editable positions.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps scalars; escape measurement is a private helper.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Positions stay monotonic and within the token, never invented outside it.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains why decoding changes length; the function now has its own comment.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceYamlScalarMapper {
  /**
   * Maps a decoded YAML string scalar to the source positions of its
   * characters.
   *
   * Double-quoted escapes map every produced code unit to the escape's source
   * span. A scalar without a source range yields undefined.
   *
   * @evidence contracts/common.md#principled-implementation Each decoded UTF-16 unit is matched to its source span, expanding double-quoted escapes to their full source length and clamping unmatched characters inside the token.
   * @evidence contracts/common.md#clear-and-simple-design Escape measurement is delegated to a private helper.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Scalars without a range return undefined instead of guessed offsets.
   * @evidence contracts/common.md#meaningful-documentation The new comment states the mapping and its undefined case.
   * @evidence contracts/performance.md#efficient-algorithms Linear in scalar length; the document's line index comes from EvidenceSourceText.of and is shared across scalars of the same document.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each description scalar is mapped once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function map(
    content: string,
    node: Scalar<string>,
  ): IEvidenceYamlScalarMapping | undefined {
    const tuple = node.range;
    if (tuple === undefined || tuple === null) return undefined;
    const source = EvidenceSourceText.of(content);
    const range = source.range(tuple[0], tuple[1]);
    const text = node.value;
    const offsets: number[] = [];
    const ends: number[] = [];
    let cursor = tuple[0];
    let escapedStart = cursor;
    let escapedEnd = cursor;
    let escapedUnits = 0;
    if (node.type === "QUOTE_DOUBLE" || node.type === "QUOTE_SINGLE") ++cursor;
    for (let index = 0; index < text.length; ++index) {
      if (escapedUnits > 0) {
        offsets.push(escapedStart);
        ends.push(escapedEnd);
        escapedStart = escapedEnd;
        --escapedUnits;
        continue;
      }
      if (node.type === "QUOTE_DOUBLE" && content[cursor] === "\\") {
        const escape = escaped(content, cursor, tuple[1]);
        const unitEnd =
          escape[1] === 1
            ? escape[0]
            : cursor + Math.floor((escape[0] - cursor) / escape[1]);
        offsets.push(cursor);
        ends.push(unitEnd);
        escapedStart = unitEnd;
        escapedEnd = escape[0];
        escapedUnits = escape[1] - 1;
        cursor = escape[0];
        continue;
      }
      const found = content.indexOf(text[index] ?? "", cursor);
      if (found >= cursor && found < tuple[1]) {
        offsets.push(found);
        ends.push(found + 1);
        cursor = found + 1;
      } else {
        const start = Math.min(cursor, tuple[1]);
        const end = Math.min(start + 1, tuple[1]);
        offsets.push(start);
        ends.push(end);
        cursor = end;
      }
    }
    offsets.push(Math.min(cursor, tuple[1]));
    return { text, range, offsets, ends };
  }
}

function escaped(
  content: string,
  start: number,
  limit: number,
): [number, number] {
  const marker = content[start + 1];
  const length =
    marker === "x" ? 4 : marker === "u" ? 6 : marker === "U" ? 10 : 2;
  const end = Math.min(start + length, limit);
  if (marker !== "U") return [end, 1];
  const value = Number.parseInt(content.slice(start + 2, end), 16);
  return [end, Number.isFinite(value) && value > 0xffff ? 2 : 1];
}
