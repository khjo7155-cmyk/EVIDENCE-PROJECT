import { EvidenceDocumentation } from "../../parsers/EvidenceDocumentation";
import { EvidenceDocumentationExamples } from "../../parsers/EvidenceDocumentationExamples";
import type { IEvidenceDocumentation } from "../../structures/IEvidenceDocumentation";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { IEvidenceCSharpDocumentation } from "./IEvidenceCSharpDocumentation";

/**
 * Reads C# XML documentation while masking code and example elements.
 *
 * The C# adapter retains mapped prose from the shared reader but hides example
 * content so its code-like text cannot be interpreted as Evidence annotations.
 *
 * @evidence contracts/common.md#principled-implementation XML documentation carriers are normalized through EvidenceDocumentation with C#'s comment syntax, and code examples are masked in place so offsets never move.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only maps carriers; attachment is decided by the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Examples are masked rather than removed, so tag-shaped example text never becomes an annotation.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains example masking; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceCSharpDocumentation {
  /**
   * Maps one C# XML documentation carrier and removes its example elements.
   *
   * Character replacement keeps the shared source offsets intact while
   * preventing tags inside `c`, `code`, `example`, or `pre` content from
   * becoming evidence.
   *
   * @evidence contracts/common.md#principled-implementation The carrier is normalized and XML documentation example regions are replaced with spaces in place.
   * @evidence contracts/common.md#clear-and-simple-design It composes EvidenceDocumentation with the shared or language-specific example masking.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Masked characters keep their positions, so diagnostics stay aligned with the source.
   * @evidence contracts/common.md#meaningful-documentation The comment explains masking and preserved offsets.
   * @evidence contracts/performance.md#efficient-algorithms Linear in carrier length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each carrier is read once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(
    source: IEvidenceSourceFile,
    documentation: IEvidenceCSharpDocumentation,
    hostId: string,
  ): IEvidenceDocumentation {
    const parsed = EvidenceDocumentation.read(
      source.content,
      hostId,
      documentation.range,
      documentation.syntax,
    );
    if (!documentation.syntax.allowWithdrawal) return parsed;
    return {
      ...parsed,
      text: mask(parsed.text),
    };
  }

  /**
   * Masks supported XML documentation elements without moving source offsets.
   *
   * The shared helper owns Markdown, HTML comment, nesting, and unclosed-region
   * precedence for all four C# example element names. XML mode keeps a true
   * self-closing element from consuming the annotation that follows it.
   */
  function mask(input: string): string {
    const characters = input.split("");
    EvidenceDocumentationExamples.maskHtml(
      characters,
      input,
      ["c", "code", "example", "pre"],
      true,
    );
    return characters.join("");
  }
}
