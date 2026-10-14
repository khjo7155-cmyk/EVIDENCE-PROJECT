const LETTER = /^\p{L}$/u;
const NUMBER = /^\p{N}$/u;

/**
 * Shared lexical rules that do not determine Prisma schema semantics.
 *
 * Target and position helpers use these checks for safe identifier spelling;
 * the Prisma WASM parser remains the authority on whether a schema is valid.
 *
 * @evidence contracts/common.md#principled-implementation Identifier spelling uses Unicode letters and numbers plus underscore and hyphen, enough for safe target and position checks.
 * @evidence contracts/common.md#clear-and-simple-design The namespace holds lexical rules only; the parser remains the authority on validity.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No schema semantics are inferred here.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the boundary; the function now has its own comment.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidencePrismaSyntax {
  /**
   * Reports whether a value is a safe Prisma identifier spelling.
   *
   * It must start with a Unicode letter or number and continue with letters,
   * numbers, underscores, or hyphens. Schema validity is left to the parser.
   *
   * @evidence contracts/common.md#principled-implementation A nonempty name starts with a letter or number and continues with letters, numbers, underscores or hyphens.
   * @evidence contracts/common.md#clear-and-simple-design Character classes are a private helper.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts The check never decides schema validity.
   * @evidence contracts/common.md#meaningful-documentation The new comment states the accepted spelling.
   * @evidence contracts/performance.md#efficient-algorithms Linear in name length.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each name is checked where used.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function identifier(value: string): boolean {
    const characters = Array.from(value);
    const first = characters[0];
    return (
      first !== undefined &&
      initial(first) &&
      characters
        .slice(1)
        .every(
          (character) =>
            initial(character) || character === "_" || character === "-",
        )
    );
  }

  function initial(character: string): boolean {
    return LETTER.test(character) || NUMBER.test(character);
  }
}
