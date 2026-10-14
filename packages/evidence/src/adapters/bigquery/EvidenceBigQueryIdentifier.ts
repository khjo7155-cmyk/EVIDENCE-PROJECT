/**
 * Decodes GoogleSQL names without inferring an ambient project or dataset.
 *
 * Explicit segments preserve schema identity across snapshots, avoiding an
 * environment-dependent address when source omits a project or dataset.
 *
 * @evidence contracts/common.md#principled-implementation GoogleSQL table paths keep explicit project and dataset segments and case, while member and constraint names compare case-insensitively.
 * @evidence contracts/common.md#clear-and-simple-design The namespace separates table-path, member and column grammars.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No ambient project or dataset is inferred from the environment.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains explicit qualification; every function is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceBigQueryIdentifier {
  /**
   * Splits a declared table path into explicit identity segments.
   *
   * A whole-path backtick pair still permits segment boundaries at dots,
   * matching BigQuery table qualification rather than treating it as one member
   * name.
   *
   * @evidence contracts/common.md#principled-implementation A declared path splits into dot-separated segments, also inside one whole-path backtick pair, matching BigQuery qualification.
   * @evidence contracts/common.md#clear-and-simple-design Each grammar has its own function so table and field rules stay separate.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid spellings return undefined instead of being approximated.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted spelling and its purpose.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the identifier or literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each spelling is decoded once where it occurs.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function table(raw: string): string[] | undefined {
    const quoted =
      raw.startsWith("`") &&
      raw.endsWith("`") &&
      !raw.slice(1, -1).includes("`");
    const value = quoted ? raw.slice(1, -1) : raw;
    const parts = value.split(".").map((part, index) => {
      if (quoted) return member(`\`${part}\``);
      if (index === 0 && /^[A-Za-z_][A-Za-z0-9_-]*$/u.test(part)) return part;
      return member(part);
    });
    if (parts.length > 3 || parts.some((part) => part === undefined))
      return undefined;
    return parts.filter((part) => part !== undefined);
  }

  /**
   * Decodes one member identifier without splitting its literal content.
   *
   * Unsupported escapes and line breaks are rejected because they cannot form a
   * stable selector segment.
   *
   * @evidence contracts/common.md#principled-implementation One member identifier is decoded without splitting, rejecting escapes and line breaks that cannot form a stable segment.
   * @evidence contracts/common.md#clear-and-simple-design Each grammar has its own function so table and field rules stay separate.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid spellings return undefined instead of being approximated.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted spelling and its purpose.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the identifier or literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each spelling is decoded once where it occurs.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function member(raw: string): string | undefined {
    if (raw.startsWith("`") && raw.endsWith("`")) {
      const value = raw.slice(1, -1);
      return value.length > 0 && !/[`\\\r\n]/u.test(value) ? value : undefined;
    }
    return /^[A-Za-z_][A-Za-z0-9_]*$/u.test(raw) ? raw : undefined;
  }

  /**
   * Normalizes a case-insensitive field or constraint identifier.
   *
   * Table paths retain their declared spelling; only member comparisons use
   * this canonical form.
   *
   * @evidence contracts/common.md#principled-implementation Case-insensitive field and constraint names normalize to one spelling for comparison.
   * @evidence contracts/common.md#clear-and-simple-design Each grammar has its own function so table and field rules stay separate.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid spellings return undefined instead of being approximated.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted spelling and its purpose.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the identifier or literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each spelling is decoded once where it occurs.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function canonical(raw: string): string | undefined {
    const value = member(raw);
    return value === undefined ? undefined : value.toLowerCase();
  }

  /**
   * Accepts documented flexible column characters, including quoted whitespace
   * and Unicode letters.
   *
   * Field validation remains separate from table-path validation because their
   * grammars differ.
   *
   * @evidence contracts/common.md#principled-implementation Column names accept BigQuery's documented flexible characters, including quoted whitespace and Unicode letters.
   * @evidence contracts/common.md#clear-and-simple-design Each grammar has its own function so table and field rules stay separate.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid spellings return undefined instead of being approximated.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted spelling and its purpose.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the identifier or literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each spelling is decoded once where it occurs.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function column(raw: string): string | undefined {
    const value = member(raw);
    if (value === undefined) return undefined;
    const characters = Array.from(value);
    return characters.length <= 300 &&
      characters.every(
        (character) =>
          /^\p{L}$/u.test(character) ||
          /^\p{N}$/u.test(character) ||
          /^\p{Pc}$/u.test(character) ||
          /^\p{Pd}$/u.test(character) ||
          /^\p{M}$/u.test(character) ||
          /^[&%=+:'<>#|]$/u.test(character) ||
          /^\s$/u.test(character),
      )
      ? value
      : undefined;
  }

  /**
   * Normalizes valid field endpoints independently of case-sensitive table
   * paths.
   *
   * Foreign-key endpoint comparison needs one stable spelling for supported
   * field names.
   *
   * @evidence contracts/common.md#principled-implementation Valid field endpoints normalize to one spelling for foreign-key comparison.
   * @evidence contracts/common.md#clear-and-simple-design Each grammar has its own function so table and field rules stay separate.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Invalid spellings return undefined instead of being approximated.
   * @evidence contracts/common.md#meaningful-documentation The comment states the accepted spelling and its purpose.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the identifier or literal length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each spelling is decoded once where it occurs.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function canonicalColumn(raw: string): string | undefined {
    const value = column(raw);
    return value === undefined ? undefined : value.toLowerCase();
  }
}
