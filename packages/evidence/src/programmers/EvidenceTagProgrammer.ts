import type { IEvidenceTagContext } from "../contexts/IEvidenceTagContext";
import { EvidenceTargetBody } from "../internal/EvidenceTargetBody";
import { EvidenceDocumentationExamples } from "../parsers/EvidenceDocumentationExamples";
import { EvidenceDocumentationHeading } from "../parsers/EvidenceDocumentationHeading";
import type { IEvidenceDocumentationHeading } from "../parsers/IEvidenceDocumentationHeading";
import type { IEvidenceDocumentationFence } from "../parsers/IEvidenceDocumentationFence";
import type { IEvidenceSourceLocation } from "../structures/IEvidenceSourceLocation";
import type { IEvidenceTagParseResult } from "../structures/IEvidenceTagParseResult";

/**
 * Parses Evidence annotations from documentation already mapped to a source
 * host.
 *
 * Adapters own comment syntax and provide a normalized documentation map; this
 * namespace owns only Evidence tag semantics. Its mutable context carries a
 * pending multiline tag, fenced-code state, and parse result so every emitted
 * annotation can retain coordinates in the original source file.
 *
 * @example
 *   const result = EvidenceTagProgrammer.parse(context);
 *   // result.declarations contains valid @evidence and @link annotations.
 *
 * @evidence contracts/common.md#principled-implementation Tag semantics are a line-oriented state machine over mapped documentation: HTML comments and Markdown code are masked first, then compact tags, H2-H4 heading sections and fences are recognized with coordinates mapped back to the source.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns only tag grammar; comment syntax and attachment belong to adapters and EvidenceDocumentation, and state lives in the caller's context.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid tags become diagnostics without aborting siblings, and examples, strings and HTML comments never create annotations.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains its boundary with an example; private helpers are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceTagProgrammer {
  /**
   * Parses valid Evidence tags and diagnostics from one mapped documentation
   * block.
   *
   * The function consumes no text outside
   * {@link IEvidenceTagContext.documentation}. It preserves multiline tag bodies
   * in compact tags and H2-H4 sections, ignores apparent tags inside examples
   * or HTML comments, and ends heading explanations at structural section
   * boundaries. Invalid tags become diagnostics rather than aborting sibling
   * tags.
   *
   * @evidence contracts/common.md#principled-implementation After validating the context, the documentation is masked, split into lines with a shared baseline, and each line updates fence state, opens or continues a pending tag, or closes a heading section at a structural boundary.
   * @evidence contracts/common.md#clear-and-simple-design Parse drives private recognizers and finalizers; masking and fence detection come from EvidenceDocumentationExamples.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Malformed tags are reported, not dropped, and heading explanations end at the next tag or same-or-higher ordinary heading as documented.
   * @evidence contracts/common.md#meaningful-documentation The comment states consumption limits and section rules; inline comments explain coordinate tracking.
   * @evidence contracts/performance.md#efficient-algorithms Linear in documentation length: masking, code mapping and the line scan are each single passes.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each host's documentation is parsed once per extraction.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The mutable context is owned by the caller; masking buffers are local and released after the call.
   */
  export function parse(context: IEvidenceTagContext): IEvidenceTagParseResult {
    validate(context);
    const characters: string[] = context.documentation.text.split("");
    EvidenceDocumentationExamples.maskHtmlComments(
      characters,
      context.documentation.text,
    );
    const input: string = characters.join("");
    const code: readonly boolean[] =
      EvidenceDocumentationExamples.markdownCode(input);
    const lines: string[] = input.split("\n");
    const documentBaseline: number =
      EvidenceDocumentationExamples.baseline(input);
    let cursor: number = 0;
    for (const rawLine of lines) {
      const line: string = rawLine.trim();
      // Coordinates must point at trimmed annotation text while cursor advances
      // across the untrimmed mapped documentation, including blank-line bytes.
      const start: number = cursor + rawLine.indexOf(line);
      const end: number = start + line.length;
      cursor += rawLine.length + 1;
      const delimiter: IEvidenceDocumentationFence | undefined =
        EvidenceDocumentationExamples.fence(rawLine, documentBaseline);
      if (delimiter !== undefined) {
        if (context.fence === "") {
          // Legacy tags end at a fence. Heading sections resume their prose
          // after the example without letting code supply a missing reason.
          if (context.pending?.headingLevel === undefined) flush(context);
          context.fence = delimiter.marker;
          context.fenceLength = delimiter.length;
        } else if (
          // Closing fences must use the opening marker character and at least its
          // length; a shorter marker remains literal code inside the fenced block.
          delimiter.marker === context.fence &&
          delimiter.length >= context.fenceLength &&
          delimiter.remainder.trim() === ""
        )
          context.fence = "";
        continue;
      }
      if (context.fence !== "") continue;
      if (code[start] === true) continue;
      const heading: IEvidenceDocumentationHeading | undefined =
        EvidenceDocumentationHeading.parse(line);
      const supported: boolean =
        heading !== undefined && heading.level >= 2 && heading.level <= 4;
      const annotation: string =
        supported && heading !== undefined ? heading.title : line;
      const marker: RegExpExecArray | null =
        /^@(evidenceExcludeReview|evidenceReview|evidenceExclude|evidence|link)(?:[ \t]|$)/.exec(
          annotation,
        );
      if (marker !== null) {
        flush(context);
        const kind: string | undefined = marker[1];
        if (
          kind === "evidenceExcludeReview" ||
          kind === "evidenceReview" ||
          kind === "evidenceExclude" ||
          kind === "evidence" ||
          kind === "link"
        )
          context.pending = {
            kind,
            body: annotation.slice(marker[0].length).trim(),
            start,
            end,
            ...(supported && heading !== undefined
              ? { headingLevel: heading.level }
              : {}),
          };
        // A section must name its target in the heading. Body prose cannot
        // repair an empty header by becoming an accidental target token.
        if (
          context.pending?.headingLevel !== undefined &&
          context.pending.body === ""
        )
          flush(context);
        continue;
      }
      if (
        heading !== undefined &&
        context.pending?.headingLevel !== undefined &&
        heading.level <= context.pending.headingLevel
      ) {
        flush(context);
        continue;
      }
      const hidden = /^@(internal|hidden|ignore)(?:[ \t]|$)/.exec(line);
      if (hidden !== null && context.documentation.allowWithdrawal) {
        flush(context);
        const tag = hidden[1];
        if (
          context.host.attachment === "attached" &&
          (tag === "internal" || tag === "hidden" || tag === "ignore")
        )
          context.result.withdrawals.push({
            tag,
            location: location(context, start, end),
          });
        continue;
      }
      if (
        line.startsWith("@") &&
        (context.documentation.tagBoundaries ||
          context.pending?.kind === "evidenceReview" ||
          context.pending?.kind === "evidenceExcludeReview")
      ) {
        flush(context);
        continue;
      }
      if (context.pending !== undefined) {
        context.pending.body += "\n" + line;
        context.pending.end = end;
      }
    }
    flush(context);
    return context.result;
  }

  /**
   * Verifies that a documentation map belongs to its declared source host.
   *
   * Offset and end arrays must cover the normalized text exactly and remain
   * monotonic inside the host range. The source lookup also validates that
   * every retained boundary can be converted into a public line-and-column
   * location. Violations are adapter bugs, so this function throws instead of
   * producing a user-facing annotation diagnostic.
   */
  function validate(context: IEvidenceTagContext): void {
    if (
      context.documentation.hostId !== context.host.id ||
      context.documentation.offsets.length !==
        context.documentation.text.length + 1 ||
      context.documentation.ends.length !== context.documentation.text.length ||
      !context.source.contains(context.host.range)
    )
      throw new Error(
        "The documentation map does not belong to its host or text.",
      );
    let previous = context.host.range.start.offset;
    for (const [index, offset] of context.documentation.offsets.entries()) {
      if (offset < previous || offset > context.host.range.end.offset)
        throw new Error("The documentation map escapes its source host.");
      context.source.position(offset);
      const end = context.documentation.ends[index] ?? offset;
      if (end < offset || end > context.host.range.end.offset)
        throw new Error("The documentation character escapes its source host.");
      context.source.position(end);
      previous = end;
    }
  }

  /**
   * Converts a half-open documentation-text span to an original source
   * location.
   *
   * The documentation map can omit or transform syntax such as comment
   * prefixes, so source offsets cannot be derived from character counts. The
   * final character uses its mapped end boundary; an empty span uses its mapped
   * start boundary.
   */
  function location(
    context: IEvidenceTagContext,
    start: number,
    end: number,
  ): IEvidenceSourceLocation {
    const from = context.documentation.offsets[start];
    const until = end === start ? from : context.documentation.ends[end - 1];
    if (from === undefined || until === undefined)
      throw new Error("Missing documentation source boundary.");
    return {
      file: context.host.file,
      range: context.source.range(from, until),
    };
  }

  /**
   * Appends a source-located tag diagnostic for the current host.
   *
   * Centralizing this projection guarantees parser errors carry the same
   * severity and host identity as later graph diagnostics, while callers supply
   * the actionable repair text appropriate to the failed tag rule.
   */
  function problem(
    context: IEvidenceTagContext,
    code: string,
    message: string,
    repair: string,
    where: IEvidenceSourceLocation,
  ): void {
    context.result.diagnostics.push({
      code,
      severity: "error",
      message,
      repair,
      location: where,
      hostId: context.host.id,
    });
  }

  /**
   * Finalizes the pending tag, appending an annotation or an explanatory
   * diagnostic.
   *
   * Pending state is cleared before validation so a failing tag cannot be
   * emitted again at a later boundary. Attachment, inline-link, target,
   * review-fingerprint, and reason requirements are checked in that order
   * because each later rule assumes the preceding source and target
   * interpretation is valid.
   */
  function flush(context: IEvidenceTagContext): void {
    if (context.pending === undefined) return;
    const tag = context.pending;
    context.pending = undefined;
    const where = location(context, tag.start, tag.end);
    // Detached comments never provide evidence, even if their tag syntax is valid.
    if (context.host.attachment !== "attached") {
      problem(
        context,
        "unsupported-annotation-host",
        "The annotation has no eligible declaration host.",
        context.host.problem ??
          "Attach the citation to documentation owned by the declaration that supplies the evidence, or remove it if stale.",
        where,
      );
      return;
    }
    if (/^\s*\{@link(?:code|plain)?\b/u.test(tag.body)) {
      problem(
        context,
        "unsupported-inline-link",
        "Compiler import-scoped inline links are unavailable in standalone Evidence.",
        "Use an explicit target such as @evidence ../calculator.ts#add Implements the arithmetic contract.",
        where,
      );
      return;
    }
    const body = EvidenceTargetBody.split(tag.body);
    try {
      EvidenceTargetBody.check(body.target, tag.kind === "link");
    } catch (cause) {
      problem(
        context,
        "malformed-target",
        "The annotation has a malformed target.",
        cause instanceof Error
          ? cause.message
          : "Use a valid artifact target or file-qualified accessor.",
        where,
      );
      return;
    }
    const id = JSON.stringify([
      context.host.id,
      context.documentation.offsets[tag.start],
      tag.kind,
    ]);
    if (tag.kind === "evidenceReview" || tag.kind === "evidenceExcludeReview") {
      let description = body.remainder;
      let fingerprint: string | undefined;
      if (description.startsWith("#")) {
        const token = description.split(/\s/u)[0] ?? "";
        const prose = description.slice(token.length).trim();
        // A fingerprint is only consumed when it has the precise short-hash form;
        // ordinary prose beginning with '#' remains part of the review description.
        if (/^#[0-9a-f]{7}$/.test(token)) {
          fingerprint = token.slice(1);
          description = prose;
        } else if (prose === "") {
          problem(
            context,
            "malformed-fingerprint",
            "The review contains only an invalid fingerprint-like token.",
            "Write a seven-character lowercase hexadecimal fingerprint after '#', followed by a description of the review.",
            where,
          );
          return;
        }
      }
      if (description === "") {
        problem(
          context,
          "missing-review-description",
          "The review does not explain what was checked.",
          "Describe the verification after the target and optional fingerprint.",
          where,
        );
        return;
      }
      context.result.reviews.push({
        id,
        hostId: context.host.id,
        reviews: tag.kind === "evidenceReview" ? "evidence" : "evidenceExclude",
        target: body.target,
        description,
        location: where,
        ...(fingerprint === undefined ? {} : { fingerprint }),
      });
    } else if (body.remainder === "")
      problem(
        context,
        "missing-evidence-reason",
        "The acknowledgement does not state a reason.",
        "Explain how the host supplies the cited evidence or why the target does not apply.",
        where,
      );
    else
      context.result.declarations.push({
        id,
        hostId: context.host.id,
        kind: tag.kind === "evidenceExclude" ? "evidenceExclude" : "evidence",
        target: body.target,
        reason: body.remainder,
        location: where,
      });
  }
}
