import typia from "typia";

/**
 * Converts the accessor portion of a file-qualified target between text and
 * segments.
 *
 * Target resolution uses segments to distinguish lexical ownership from a
 * literal dot in a member name. This namespace accepts the portable baseline
 * syntax only: identifiers after dots, JSON strings in brackets, and
 * non-negative integer bracket members. It neither resolves symbols nor
 * interprets a segment as code.
 *
 * @example
 *   EvidenceAccessor.parse('Client.prototype["send.request"]');
 *   // ["Client", "prototype", "send.request"]
 *
 * @evidence contracts/common.md#principled-implementation Accessors are dotted Unicode identifiers plus bracketed JSON strings or unsigned integers, so literal dots and brackets stay inside one segment.
 * @evidence contracts/common.md#clear-and-simple-design The namespace converts between text and segments only; it never resolves symbols.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported bracket contents and separators are rejected instead of being reinterpreted.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment defines the grammar with an example; the private identifier helper is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceAccessor {
  /**
   * Parses one accessor spelling into the literal segments used by an address.
   *
   * A bracket string preserves characters that have structural meaning in
   * dotted syntax. Invalid separators, unterminated brackets, and unsupported
   * bracket content reject before a resolver can look up a different
   * declaration.
   *
   * @evidence contracts/common.md#principled-implementation A single cursor scan reads identifier runs and quote-aware bracket segments, decoding strings with typia's JSON parser so escapes match the formatter.
   * @evidence contracts/common.md#clear-and-simple-design Parsing returns segments; identifier validation is a private helper.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Malformed separators and unterminated brackets throw before resolution can look up a different declaration.
   * @evidence contracts/common.md#meaningful-documentation The comment explains bracket strings and the failure cases; the inline comment explains JSON decoding.
   * @evidence contracts/performance.md#efficient-algorithms Linear in accessor length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each target is parsed once per resolution attempt.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function parse(value: string): string[] {
    const segments: string[] = [];
    let cursor = 0;
    while (cursor < value.length) {
      if (value[cursor] === "[") {
        const start = ++cursor;
        let quoted = false;
        let escaped = false;
        while (cursor < value.length) {
          const character = value[cursor];
          if (escaped) escaped = false;
          else if (quoted && character === "\\") escaped = true;
          else if (character === '"') quoted = !quoted;
          else if (!quoted && character === "]") break;
          ++cursor;
        }
        if (cursor === value.length)
          throw new Error(
            "Close the bracket accessor and its quoted member name.",
          );
        const literal = value.slice(start, cursor++);
        // JSON parsing handles escapes exactly as the canonical formatter emits
        // them, while numeric brackets remain literal accessor segments.
        if (literal.startsWith('"'))
          segments.push(typia.json.assertParse<string>(literal));
        else if (/^(?:0|[1-9][0-9]*)$/.test(literal)) segments.push(literal);
        else
          throw new Error(
            "A bracket accessor must contain a JSON string or an unsigned integer without leading zeroes.",
          );
      } else {
        const start = cursor;
        while (
          cursor < value.length &&
          value[cursor] !== "." &&
          value[cursor] !== "["
        )
          ++cursor;
        const segment = value.slice(start, cursor);
        if (!identifier(segment))
          throw new Error(
            "Use dotted identifiers or JSON-string brackets for literal member names.",
          );
        segments.push(segment);
      }
      if (cursor === value.length) break;
      if (value[cursor] === ".") {
        ++cursor;
        if (cursor === value.length || value[cursor] === "[")
          throw new Error("A dot must be followed by an identifier.");
      } else if (value[cursor] !== "[")
        throw new Error("Separate accessor segments with a dot or a bracket.");
    }
    if (segments.length === 0)
      throw new Error("Name a public declaration after '#'.");
    return segments;
  }

  /**
   * Serializes literal accessor segments in the canonical target spelling.
   *
   * Identifier segments use dotted notation. Every other segment is JSON-quoted
   * in brackets so formatting cannot turn a literal dot, bracket, or space into
   * an accidental parent relationship. Empty paths are invalid because a target
   * accessor must identify at least one declaration segment.
   *
   * @evidence contracts/common.md#principled-implementation Identifier segments are joined with dots and all others are JSON-quoted in brackets, giving one canonical spelling that parse reverses.
   * @evidence contracts/common.md#clear-and-simple-design Formatting reuses the private identifier rule shared with parse.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Literal segment characters can never create an accidental parent relationship.
   * @evidence contracts/common.md#meaningful-documentation The comment explains canonical quoting and the empty-path error.
   * @evidence contracts/performance.md#efficient-algorithms Linear in total segment length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Formatting is per address.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function format(segments: string[]): string {
    if (segments.length === 0)
      throw new Error("An accessor needs at least one segment.");
    let output = "";
    for (const segment of segments)
      output += identifier(segment)
        ? (output === "" ? "" : ".") + segment
        : "[" + JSON.stringify(segment) + "]";
    return output;
  }

  /**
   * Determines whether one segment is safe in dotted accessor notation.
   *
   * The Unicode-aware expression matches the baseline's identifier subset. A
   * segment outside that subset remains valid, but `format` must quote it.
   */
  function identifier(value: string): boolean {
    return /^(?:[$_]|\p{L})(?:[$_]|\p{L}|\p{Nd}|\p{M})*$/u.test(value);
  }
}
