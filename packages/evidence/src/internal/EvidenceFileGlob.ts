import type { IEvidenceFileGlobPattern } from "./IEvidenceFileGlobPattern";

/**
 * Matches the restricted Evidence glob language: `*`, `**`, `?`, and ordered
 * negation.
 *
 * The matcher operates on portable path segments, keeping selection independent
 * of host separator conventions and refusing patterns that escape a population
 * root.
 *
 * @evidence contracts/common.md#principled-implementation Patterns compile to portable segments, and matching uses memoized globstar recursion with ordered last-match-wins negation.
 * @evidence contracts/common.md#clear-and-simple-design The class owns compiled patterns; compile, split and match are private helpers.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Absolute, drive-qualified, empty-segment and parent-escaping patterns are rejected at compile time.
 * @evidence contracts/common.md#meaningful-documentation The class comment states the supported language; each public method and private helper is documented.
 * @evidence contracts/performance.md#efficient-algorithms Matching one path costs O(P x S) per pattern for P pattern and S path segments thanks to memoization, avoiding exponential globstar backtracking.
 * @evidence contracts/performance.md#reuse-equivalent-work Patterns are compiled once in the constructor and reused for every candidate path.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The instance holds only compiled segment arrays, owned by its source collector.
 */
export class EvidenceFileGlob {
  private readonly patterns: IEvidenceFileGlobPattern[];

  /**
   * Compiles ordered patterns and requires at least one positive selection
   * baseline.
   *
   * A population with only exclusions would have no defined initial set, so
   * configuration validation rejects it at construction.
   */
  public constructor(patterns: readonly string[]) {
    this.patterns = patterns.map(compile);
    if (!this.patterns.some((pattern) => !pattern.exclude))
      throw new Error(
        "The files array must contain at least one positive glob.",
      );
  }

  /**
   * Applies every matching pattern in declaration order.
   *
   * Later matching positives or exclusions replace the inclusion decision made
   * by earlier patterns.
   *
   * @evidence contracts/common.md#principled-implementation Every pattern is applied in order and the last matching pattern decides inclusion, so later positives can restore excluded paths.
   * @evidence contracts/common.md#clear-and-simple-design The method composes split and match.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Ordering follows the documented glob grammar for every population alike.
   * @evidence contracts/common.md#meaningful-documentation The comment explains replacement of earlier decisions.
   * @evidence contracts/performance.md#efficient-algorithms O(N x P x S) for N patterns, using memoized segment matching.
   * @evidence contracts/performance.md#reuse-equivalent-work It reuses the patterns compiled in the constructor.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The memo table is local to each match call and discarded afterward.
   */
  public matches(location: string): boolean {
    const segments = split(location);
    let included = false;
    for (const pattern of this.patterns)
      if (match(pattern.segments, segments, false)) included = !pattern.exclude;
    return included;
  }

  /**
   * Determines whether a directory can contain a selected descendant.
   *
   * Discovery uses this conservative result to prune traversal without
   * excluding descendants restored by a later positive pattern.
   *
   * @evidence contracts/common.md#principled-implementation A directory may hold a match if any positive pattern can extend its prefix, unless a later recursive exclusion covers it.
   * @evidence contracts/common.md#clear-and-simple-design The method answers traversal pruning only; final selection is matches.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Pruning is conservative so later positive patterns can still restore descendants.
   * @evidence contracts/common.md#meaningful-documentation The comment explains conservative pruning.
   * @evidence contracts/performance.md#efficient-algorithms O(N x P x S) per directory; it lets discovery skip whole subtrees.
   * @evidence contracts/performance.md#reuse-equivalent-work It reuses the compiled patterns.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The memo table is local to each call.
   */
  public couldMatchDescendant(directory: string): boolean {
    const prefix = split(directory);
    let possible = false;
    for (const pattern of this.patterns)
      if (!pattern.exclude) {
        if (match(pattern.segments, prefix, true)) possible = true;
      } else if (
        pattern.segments.at(-1) === "**" &&
        match(pattern.segments, prefix, false)
      )
        possible = false;
    return possible;
  }
}

/**
 * Parses one authored glob into normalized segments while rejecting ambiguous
 * root escapes.
 *
 * `EvidenceFileGlob` uses the result for portable matching relative to one
 * selected population root.
 */
function compile(raw: string): IEvidenceFileGlobPattern {
  if (raw.trim() === "") throw new Error("Glob strings must not be empty.");
  const exclude = raw.startsWith("!");
  let value = (exclude ? raw.slice(1) : raw).replaceAll("\\", "/");
  while (value.startsWith("./")) value = value.slice(2);
  if (value === "")
    throw new Error("The exclusion marker '!' must be followed by a glob.");
  if (value.startsWith("/") || /^[A-Za-z]:/.test(value))
    throw new Error(`Glob '${raw}' must be relative to its population root.`);
  if (value.endsWith("/")) value = value.slice(0, -1);
  const segments = value.split("/");
  if (segments.includes("") || segments.includes(".."))
    throw new Error(
      `Glob '${raw}' contains an empty segment or escapes its root.`,
    );
  return { segments, exclude };
}

/**
 * Splits a candidate path into portable relative segments without filesystem
 * resolution.
 *
 * Matching operates on these normalized segments so Windows and POSIX
 * separators have identical selection semantics.
 */
function split(value: string): string[] {
  let normalized = value.replaceAll("\\", "/");
  while (normalized.startsWith("./")) normalized = normalized.slice(2);
  normalized = normalized.replace(/^\/+|\/+$/g, "");
  return normalized === "" || normalized === "." ? [] : normalized.split("/");
}

/**
 * Matches a pattern with memoized globstar branches bounded by the pattern and
 * path grid.
 *
 * Memoization prevents repeated `**` branches from causing exponential
 * discovery work for long paths.
 */
function match(
  pattern: readonly string[],
  segments: readonly string[],
  descendant: boolean,
): boolean {
  const memo = new Map<string, boolean>();
  return visit(0, 0);

  function visit(patternIndex: number, pathIndex: number): boolean {
    const key = `${patternIndex}:${pathIndex}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    const token = pattern[patternIndex];
    const segment = segments[pathIndex];
    let result: boolean;
    if (descendant && pathIndex === segments.length)
      result = patternIndex < pattern.length;
    else if (token === undefined) result = pathIndex === segments.length;
    else if (token === "**")
      result =
        visit(patternIndex + 1, pathIndex) ||
        (segment !== undefined && visit(patternIndex, pathIndex + 1));
    else
      result =
        segment !== undefined &&
        matchSegment(token, segment) &&
        visit(patternIndex + 1, pathIndex + 1);
    memo.set(key, result);
    return result;
  }
}

/**
 * Matches one segment where star and question mark never cross a separator
 * boundary.
 *
 * A question mark consumes one Unicode code point, as in the Go matcher.
 */
function matchSegment(pattern: string, value: string): boolean {
  const tokens = Array.from(pattern);
  const characters = Array.from(value);
  let patternIndex = 0;
  let valueIndex = 0;
  let starPattern = -1;
  let starValue = 0;
  while (valueIndex < characters.length)
    if (tokens[patternIndex] === "*") {
      starPattern = patternIndex++;
      starValue = valueIndex;
    } else if (
      tokens[patternIndex] === "?" ||
      tokens[patternIndex] === characters[valueIndex]
    ) {
      patternIndex++;
      valueIndex++;
    } else if (starPattern >= 0) {
      patternIndex = starPattern + 1;
      valueIndex = ++starValue;
    } else return false;
  while (tokens[patternIndex] === "*") patternIndex++;
  return patternIndex === tokens.length;
}
