import { EvidenceSourceText } from "../internal/EvidenceSourceText";
import type { IEvidenceCommentSyntax } from "../structures/IEvidenceCommentSyntax";
import type { IEvidenceDocumentation } from "../structures/IEvidenceDocumentation";
import type { IEvidenceSourceRange } from "../structures/IEvidenceSourceRange";

/**
 * Normalizes adapter-identified comments without losing source coordinates.
 *
 * The adapter owns comment classification and attachment. This helper only
 * removes the supplied delimiters and line prefixes, retaining mappings that
 * let the tag parser report exact spans and exclude accepted annotations from
 * fingerprints.
 *
 * @evidence contracts/common.md#principled-implementation Normalization removes adapter-supplied delimiters and line prefixes while recording per-character original offsets, so tag diagnostics and fingerprint exclusions keep exact spans.
 * @evidence contracts/common.md#clear-and-simple-design Comment classification and attachment stay in adapters; the namespace only normalizes.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Mismatched delimiters or ranges throw instead of mapping unrelated text.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the division of responsibility.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceDocumentation {
  /**
   * Reads a validated comment span into mapped annotation text.
   *
   * The range must belong to the supplied content and match the declared
   * opening and closing delimiters. Invalid spans throw instead of mapping
   * unrelated text. Adapters must establish comment identity and declaration
   * ownership beforehand.
   *
   * @evidence contracts/common.md#principled-implementation After validating the range and delimiters, each line drops its prefix, CR before LF is removed from text but mapped, and a terminal boundary offset is appended.
   * @evidence contracts/common.md#clear-and-simple-design Read produces IEvidenceDocumentation; tag parsing is a later step.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts A line-run opening's first prefix is not stripped twice, preventing '# ##' from becoming a heading.
   * @evidence contracts/common.md#meaningful-documentation The comment states the preconditions; inline comments explain prefix and CRLF handling.
   * @evidence contracts/performance.md#efficient-algorithms Linear in comment length; range validation uses the source's shared line index from EvidenceSourceText.of instead of rebuilding it per comment.
   * @evidence contracts/performance.md#reuse-equivalent-work Each comment is read once, and the range check reuses the source's line index through EvidenceSourceText.of.
   * @evidence contracts/performance.md#bound-retention-and-release-resources Offset arrays are owned by the returned documentation; nothing else is retained.
   */
  export function read(
    content: string,
    hostId: string,
    range: IEvidenceSourceRange,
    syntax: IEvidenceCommentSyntax,
  ): IEvidenceDocumentation {
    if (!EvidenceSourceText.of(content).contains(range))
      throw new Error("The documentation range does not match the source.");
    const raw = content.slice(range.start.offset, range.end.offset);
    if (
      raw.length < syntax.opening.length + syntax.closing.length ||
      !raw.startsWith(syntax.opening) ||
      !raw.endsWith(syntax.closing)
    )
      throw new Error(
        "The documentation delimiters do not match the adapter's comment span.",
      );
    const start = range.start.offset + syntax.opening.length;
    const end = range.end.offset - syntax.closing.length;
    let text = "";
    const offsets: number[] = [];
    const ends: number[] = [];
    let cursor = start;
    while (cursor < end) {
      const newline = content.indexOf("\n", cursor);
      const until = newline < 0 || newline >= end ? end : newline;
      let from = cursor;
      const prefix = syntax.linePrefix;
      // A line-run opening already consumed its first prefix. Removing another
      // one would turn Python or Ruby '# ##' documentation into an H1 heading.
      const consumedPrefix: boolean =
        cursor === start && syntax.closing === "" && syntax.opening === prefix;
      if (prefix !== undefined && prefix !== "" && !consumedPrefix) {
        while (
          from < until &&
          (content[from] === " " || content[from] === "\t")
        )
          ++from;
        if (content.startsWith(prefix, from)) from += prefix.length;
        else from = cursor;
      }
      // Normalize CRLF for tag scanning while mapping the retained newline to
      // its original LF. Prefix removal must not shift diagnostic coordinates.
      const lineEnd = content[until - 1] === "\r" ? until - 1 : until;
      for (let index = from; index < lineEnd; ++index) {
        text += content[index] ?? "";
        offsets.push(index);
        ends.push(index + 1);
      }
      if (until < end) {
        text += "\n";
        offsets.push(until);
        ends.push(until + 1);
      }
      cursor = until + 1;
    }
    // Positions at normalized EOF still need an original source boundary even
    // when no text character remains after removing the closing delimiter.
    offsets.push(end);
    return {
      hostId,
      text,
      offsets,
      ends,
      tagBoundaries: syntax.tagBoundaries,
      allowWithdrawal: syntax.allowWithdrawal,
    };
  }
}
