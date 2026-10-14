/**
 * Lists local configuration module candidates in source-resolution order.
 *
 * The watch scanner and isolated evaluator share this function so a source
 * substitution cannot execute one file while watching another. Platform path
 * operations are supplied by callers, keeping the function self-contained for
 * the evaluator's in-memory bootstrap.
 *
 * @evidence contracts/common.md#principled-implementation Candidates follow TypeScript source substitution (.js to .ts/.tsx, .mjs to .mts, .cjs to .cts) and Node's extension and index lookup order.
 * @evidence contracts/common.md#clear-and-simple-design One function is shared by the watch scanner and the evaluator so both consider the same files; callers supply path joining.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts The order mirrors resolution rules rather than any particular project layout.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the sharing requirement and why path operations are injected.
 * @evidence contracts/performance.md#efficient-algorithms Work is constant: at most nineteen candidate strings for one specifier.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Candidate lists are cheap and depend on each specifier, so there is no shared work.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
 */
export function evidenceConfigModuleCandidates(
  base: string,
  extension: string,
  join: (directory: string, filename: string) => string,
): string[] {
  const stem: string = base.slice(0, -extension.length);
  if (extension === ".js" || extension === ".jsx")
    return [`${stem}.ts`, `${stem}.tsx`, base];
  if (extension === ".mjs") return [`${stem}.mts`, base];
  if (extension === ".cjs") return [`${stem}.cts`, base];
  if (extension !== "") return [base];
  const extensions: string[] = [
    ".ts",
    ".tsx",
    ".mts",
    ".cts",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
  ];
  return [
    base,
    ...extensions.map((value: string): string => base + value),
    ...extensions.map((value: string): string => join(base, "index" + value)),
  ];
}
