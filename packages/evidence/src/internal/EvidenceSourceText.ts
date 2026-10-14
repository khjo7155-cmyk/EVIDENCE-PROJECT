import type { IEvidenceSourcePosition } from "../structures/IEvidenceSourcePosition";
import type { IEvidenceSourceRange } from "../structures/IEvidenceSourceRange";

/**
 * Maps original UTF-16 offsets to source coordinates without rewriting text.
 *
 * Parser and documentation positions both use JavaScript string offsets, so
 * preserving BOM and line-ending bytes avoids a later location translation.
 *
 * @evidence contracts/common.md#principled-implementation A line-start table over the original string converts UTF-16 offsets to one-based positions without rewriting BOM or line endings.
 * @evidence contracts/common.md#clear-and-simple-design The class owns offset-to-position conversion for one immutable content string.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Positions are computed from the same content, so offsets from another snapshot cannot be paired with it.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains why text is not rewritten; every public member is documented.
 * @evidence contracts/performance.md#efficient-algorithms The constructor indexes line starts in one linear pass so each later lookup is a binary search.
 * @evidence contracts/performance.md#reuse-equivalent-work One instance serves every range and diagnostic in a source, and `of` lets independent per-host callers share the most recent index instead of rescanning the same content.
 * @evidence contracts/performance.md#bound-retention-and-release-resources Each instance holds only its content string and line table. The shared `of` memo retains exactly one instance, the most recently requested source, and replaces it on the next distinct content.
 */
export class EvidenceSourceText {
  /**
   * Most recently requested index, reused while callers keep asking about the
   * same content.
   *
   * Adapters read documentation host by host within one file, so a single entry
   * captures nearly every repeat while bounding retention to one source.
   */
  private static recent: EvidenceSourceText | undefined;

  private readonly lines = [0];

  /**
   * Returns a line index for the content, reusing the most recent one when the
   * content is identical.
   *
   * Instances are immutable, so sharing one between callers is safe. Use this
   * where many short-lived callers inspect the same source, such as one tag
   * parse or documentation read per host.
   *
   * @evidence contracts/common.md#principled-implementation A one-entry memo keyed by the content string serves repeated per-host requests for the same source, and a different string builds and replaces the entry.
   * @evidence contracts/common.md#clear-and-simple-design The memo lives with the class that owns line indexing; callers only switch from the constructor to this factory.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Reuse requires an identical content string, so an index is never applied to other text.
   * @evidence contracts/common.md#meaningful-documentation The comment explains when sharing is safe and which callers should use it.
   * @evidence contracts/performance.md#efficient-algorithms A hit costs one string comparison, usually by reference; a miss costs the same linear indexing as the constructor.
   * @evidence contracts/performance.md#reuse-equivalent-work Consecutive requests for the same content share one immutable index instead of rescanning the file per documentation host.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The memo holds at most one instance and drops it when another source is requested.
   */
  public static of(content: string): EvidenceSourceText {
    const recent: EvidenceSourceText | undefined = EvidenceSourceText.recent;
    if (recent !== undefined && recent.content === content) return recent;
    const created: EvidenceSourceText = new EvidenceSourceText(content);
    EvidenceSourceText.recent = created;
    return created;
  }

  /**
   * Indexes line starts in the supplied immutable source content.
   *
   * Range conversion uses this table to translate parser UTF-16 offsets without
   * rescanning the source string for every diagnostic or host position.
   */
  public constructor(public readonly content: string) {
    for (let index = 0; index < content.length; ++index)
      if (content[index] === "\n") this.lines.push(index + 1);
  }

  /**
   * Resolves one bounded UTF-16 offset to one-based line and column
   * coordinates.
   *
   * Parser and documentation mapping consumers use this conversion when
   * emitting source ranges with human-readable positions.
   *
   * @evidence contracts/common.md#principled-implementation A bounds check followed by binary search over line starts yields the line, and the column is the offset from that line start.
   * @evidence contracts/common.md#clear-and-simple-design The method converts one offset; ranges compose it.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Offsets outside the string throw rather than being clamped.
   * @evidence contracts/common.md#meaningful-documentation The comment states the conversion and its consumers.
   * @evidence contracts/performance.md#efficient-algorithms O(log L) for L lines.
   * @evidence contracts/performance.md#reuse-equivalent-work It reuses the line table built once by the constructor.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The method keeps no state after returning; its result is owned by the caller.
   */
  public position(offset: number): IEvidenceSourcePosition {
    if (
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      offset > this.content.length
    )
      throw new Error("The source offset is outside the original string.");
    let left = 0;
    let right = this.lines.length;
    while (left + 1 < right) {
      const middle = Math.floor((left + right) / 2);
      if ((this.lines[middle] ?? 0) <= offset) left = middle;
      else right = middle;
    }
    return {
      offset,
      line: left + 1,
      column: offset - (this.lines[left] ?? 0) + 1,
    };
  }

  /**
   * Builds a validated half-open range from offsets in this exact source
   * string.
   *
   * The result includes positions derived from the same immutable content, so
   * adapters cannot pair offsets from one source snapshot with another.
   *
   * @evidence contracts/common.md#principled-implementation Both ends are converted through position, and reversed spans are rejected.
   * @evidence contracts/common.md#clear-and-simple-design The method composes position.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts A range ending before its start throws instead of being swapped.
   * @evidence contracts/common.md#meaningful-documentation The comment explains why both positions come from the same content.
   * @evidence contracts/performance.md#efficient-algorithms Two O(log L) lookups.
   * @evidence contracts/performance.md#reuse-equivalent-work It reuses the constructor's line table.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The method keeps no state after returning; its result is owned by the caller.
   */
  public range(start: number, end: number): IEvidenceSourceRange {
    if (end < start) throw new Error("The source range ends before it starts.");
    return { start: this.position(start), end: this.position(end) };
  }

  /**
   * Checks whether positions and offsets agree with this source.
   *
   * It returns false for malformed or cross-content ranges, allowing callers to
   * reject invalid parser output before it enters an inventory.
   *
   * @evidence contracts/common.md#principled-implementation Recomputing the expected range from the offsets and comparing line and column detects ranges from another source or malformed parser output.
   * @evidence contracts/common.md#clear-and-simple-design The method reuses range and turns its errors into false.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid ranges are rejected before entering an inventory instead of being corrected.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the false result for malformed or cross-content ranges.
   * @evidence contracts/performance.md#efficient-algorithms Two O(log L) lookups.
   * @evidence contracts/performance.md#reuse-equivalent-work It reuses the constructor's line table.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The method keeps no state after returning; its result is owned by the caller.
   */
  public contains(range: IEvidenceSourceRange): boolean {
    try {
      const expected = this.range(range.start.offset, range.end.offset);
      return (
        expected.start.line === range.start.line &&
        expected.start.column === range.start.column &&
        expected.end.line === range.end.line &&
        expected.end.column === range.end.column
      );
    } catch {
      return false;
    }
  }
}
