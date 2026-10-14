import { EvidenceAccessor } from "../targets/EvidenceAccessor";
import type { IEvidenceTargetBody } from "./IEvidenceTargetBody";

/**
 * Splits and validates the syntax shared by all authored target bodies.
 *
 * Artifact resolution remains outside this helper because the same lexical
 * token may be valid under more than one selected reference grammar.
 *
 * @evidence contracts/common.md#principled-implementation Shared target lexing and validation live apart from artifact resolution because one token can be valid under several reference grammars.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns only lexical splitting and checks.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No artifact-specific rule is embedded here.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains why resolution is kept outside.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceTargetBody {
  /**
   * Separates the first unquoted target token from its optional explanation.
   *
   * Tag parsing calls this before target resolution so prose following the
   * target cannot alter its authored address.
   *
   * @evidence contracts/common.md#principled-implementation A single left-to-right scan tracks JSON-string quoting and escapes to find the first unquoted whitespace, so bracketed names may contain spaces.
   * @evidence contracts/common.md#clear-and-simple-design The function only splits; validation is in check.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Prose after the target cannot change the authored address.
   * @evidence contracts/common.md#meaningful-documentation The comment explains when splitting runs and why.
   * @evidence contracts/performance.md#efficient-algorithms One linear pass over the body.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each body is split once by its tag parser; there is no repeated work to share.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function split(value: string): IEvidenceTargetBody {
    const body = value.trim();
    let cursor = 0;
    let quoted = false;
    let escaped = false;
    while (cursor < body.length) {
      const character = body[cursor] ?? "";
      if (escaped) escaped = false;
      else if (quoted && character === "\\") escaped = true;
      else if (character === '"') quoted = !quoted;
      else if (!quoted && /\s/u.test(character)) break;
      ++cursor;
    }
    return {
      target: body.slice(0, cursor),
      remainder: body.slice(cursor).trim(),
    };
  }

  /**
   * Rejects missing targets and validates forced file-qualified accessors.
   *
   * File path decoding is checked before accessor parsing to keep control
   * characters out of filesystem resolution and subsequent diagnostics.
   *
   * @evidence contracts/common.md#principled-implementation Missing targets are rejected, and forced file targets require a path, '#', and a parsable accessor, decoding the path first to reject NUL and line breaks.
   * @evidence contracts/common.md#clear-and-simple-design Accessor syntax is delegated to EvidenceAccessor.parse.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Errors name the correct form instead of accepting a partial target.
   * @evidence contracts/common.md#meaningful-documentation The comment explains why path decoding precedes accessor parsing.
   * @evidence contracts/performance.md#efficient-algorithms Linear in target length: one decode and one accessor parse.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Validation runs once per authored tag; nothing is shared.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The check keeps no state after returning; its result is owned by the caller.
   */
  export function check(target: string, forcedFile: boolean): void {
    if (target === "")
      throw new Error("Name the target before explaining the acknowledgement.");
    if (!forcedFile) return;
    const hash = target.indexOf("#");
    if (hash < 0) {
      throw new Error(
        "Write a file path followed by '#' and a public accessor, such as ../calculator.ts#add.",
      );
    }
    const file = target.slice(0, hash);
    if (file === "") throw new Error("Name the file before '#'.");
    const decoded = decodeURIComponent(file);
    if (
      decoded.includes("\0") ||
      decoded.includes("\r") ||
      decoded.includes("\n")
    )
      throw new Error("Target paths cannot contain NUL or line breaks.");
    EvidenceAccessor.parse(target.slice(hash + 1));
  }
}
