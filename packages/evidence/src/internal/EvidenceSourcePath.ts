import path from "node:path";

/**
 * Performs lexical path normalization without filesystem access or case
 * folding.
 *
 * Source discovery owns physical resolution; these helpers preserve authored
 * spelling boundaries so logical addresses remain portable across platforms.
 *
 * @evidence contracts/common.md#principled-implementation Lexical path normalization without filesystem access or case folding keeps authored spellings portable while discovery owns physical resolution.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns lexical operations only.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No platform guess is made from an OS name beyond rejecting Windows paths on non-Windows hosts.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the lexical boundary.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceSourcePath {
  /**
   * Resolves a portable absolute or relative path and rejects drive-relative
   * notation.
   *
   * Source collection uses the result for lexical addressing before physical
   * resolution, preserving platform-independent configured path behavior.
   *
   * @evidence contracts/common.md#principled-implementation Separators are normalized, drive-relative and foreign Windows paths are rejected, and Node's path.resolve produces a slash-separated absolute path.
   * @evidence contracts/common.md#clear-and-simple-design The function resolves lexically; physical resolution is the collector's job.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Drive-relative paths fail with a repair instead of resolving against an arbitrary drive cwd.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the rejection and the lexical result.
   * @evidence contracts/performance.md#efficient-algorithms Linear in path length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Resolution depends on each base and value.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function resolve(base: string, value: string): string {
    const normalized = value.replaceAll("\\", "/");
    if (/^[A-Za-z]:(?!\/)/.test(normalized))
      throw new Error(
        `Path '${value}' is drive-relative; write its full path.`,
      );
    if (process.platform !== "win32" && /^[A-Za-z]:/.test(normalized))
      throw new Error(
        `Windows path '${value}' cannot be resolved on this platform.`,
      );
    return slash(path.resolve(base, normalized));
  }

  /**
   * Resolves a configured population root while keeping glob syntax confined to
   * files.
   *
   * Roots must name concrete directories, so this boundary rejects glob markers
   * before discovery can confuse a pattern with a filesystem location.
   *
   * @evidence contracts/common.md#principled-implementation Roots must be one concrete directory, so whitespace padding and glob markers are rejected before resolving against the config directory.
   * @evidence contracts/common.md#clear-and-simple-design Root validation is separate from file glob handling.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Globs are refused in roots instead of being reinterpreted.
   * @evidence contracts/common.md#meaningful-documentation The comment explains why glob syntax stays in files.
   * @evidence contracts/performance.md#efficient-algorithms Linear in path length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each configured root is resolved once.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function root(configFile: string, declared: string): string {
    if (declared.trim() !== declared || declared === "")
      throw new Error(
        "A population root must not be empty or padded with whitespace.",
      );
    if (declared.includes("*") || declared.includes("?"))
      throw new Error(
        "A population root names one directory; put globs in files.",
      );
    return resolve(path.dirname(path.resolve(configFile)), declared);
  }

  /**
   * Produces a slash-normalized diagnostic path relative to a stable display
   * base.
   *
   * Diagnostic and public source addresses use this display spelling without
   * changing the absolute path used for filesystem operations.
   *
   * @evidence contracts/common.md#principled-implementation path.relative from a stable base, slash-normalized, with '.' for the base itself, gives portable display spellings.
   * @evidence contracts/common.md#clear-and-simple-design Display spelling is separate from the absolute path used for I/O.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No path is shortened or rewritten beyond relativization.
   * @evidence contracts/common.md#meaningful-documentation The comment explains where the display spelling is used.
   * @evidence contracts/performance.md#efficient-algorithms Linear in path length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Display paths are cheap per record.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function display(base: string, absolute: string): string {
    const relative = slash(path.relative(base, absolute));
    return relative === "" ? "." : relative;
  }

  /**
   * Tests both logical and resolved physical paths when bounding reexports.
   *
   * A path is inside the selected root only when neither authored symlink paths
   * nor their resolved filesystem locations escape that boundary.
   *
   * @evidence contracts/common.md#principled-implementation Both paths are normalized with the matching win32 or posix flavor and compared on a segment boundary, so /a/bc is not inside /a/b.
   * @evidence contracts/common.md#clear-and-simple-design Normalization is a private helper; the function only compares.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Prefix matching respects segment boundaries instead of raw string prefixes.
   * @evidence contracts/common.md#meaningful-documentation The comment explains checking both logical and physical paths; the helper is documented.
   * @evidence contracts/performance.md#efficient-algorithms Linear in path length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each containment check is specific to its pair.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function contains(root: string, absolute: string): boolean {
    const prefix = normalize(root);
    const target = normalize(absolute);
    return (
      target === prefix ||
      target.startsWith(prefix.endsWith("/") ? prefix : prefix + "/")
    );
  }

  /**
   * Converts separators without canonicalizing dot segments or case.
   *
   * Callers use this narrow normalization for portable keys while physical path
   * resolution remains responsible for filesystem-aware canonicalization.
   *
   * @evidence contracts/common.md#principled-implementation Replacing backslashes with slashes gives portable keys without canonicalizing dots or case.
   * @evidence contracts/common.md#clear-and-simple-design Only separators change; canonicalization belongs to physical resolution.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Case and dot segments are left as authored.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the narrow normalization.
   * @evidence contracts/performance.md#efficient-algorithms Linear in path length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work A single replace has no reusable work.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function slash(value: string): string {
    return value.replaceAll("\\", "/");
  }

  /**
   * Selects the appropriate path flavor for lexical containment comparison.
   *
   * This helper deliberately avoids filesystem access, allowing root-boundary
   * checks to operate on configured and resolved path spellings alike.
   */
  function normalize(value: string): string {
    const normalized = slash(value);
    const flavor =
      /^[A-Za-z]:/.test(normalized) || normalized.startsWith("//")
        ? path.win32
        : path.posix;
    const result = slash(flavor.normalize(normalized)).replace(/\/+$/, "");
    return result === "" ? "/" : result;
  }
}
