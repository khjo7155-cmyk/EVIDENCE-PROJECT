/**
 * Defines source-spelled MySQL names without consulting server or filesystem
 * settings.
 *
 * The adapter preserves this deterministic identity across hosts with different
 * server policy.
 *
 * @evidence contracts/common.md#principled-implementation MySQL names keep source spelling with backtick unquoting, independent of server case settings or the filesystem.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only decodes names.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts ANSI quotes and other delimiters, whose meaning depends on server mode, are rejected.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains deterministic identity; the function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceMysqlIdentifier {
  /**
   * Unquotes backticks and rejects other dialect delimiters or ANSI quotes.
   *
   * Their interpretation can depend on server configuration outside a source
   * snapshot.
   *
   * @evidence contracts/common.md#principled-implementation Backtick-quoted names are unquoted with doubled backticks decoded; regular names stay as written.
   * @evidence contracts/common.md#clear-and-simple-design Decoding is limited to one name.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Server-dependent quoting is rejected.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the rejection.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the identifier or literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each spelling is decoded once where it occurs.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function read(raw: string): string | undefined {
    if (raw.includes("\0") || /[\uD800-\uDFFF]/.test(raw)) return undefined;
    if (raw.startsWith("`")) {
      if (!/^`(?:[^`]|``)+`$/u.test(raw)) return undefined;
      const name = raw.slice(1, -1).replaceAll("``", "`");
      return name.endsWith(" ") ? undefined : name;
    }
    return /^[A-Za-z_\u0080-\uFFFF][A-Za-z_0-9$\u0080-\uFFFF]*$/u.test(raw)
      ? raw
      : undefined;
  }
}
