/**
 * Lists local configuration module candidates in source-resolution order.
 *
 * The watch scanner and isolated evaluator share this function so a source
 * substitution cannot execute one file while watching another. Platform path
 * operations are supplied by callers, keeping the function self-contained for
 * the evaluator's in-memory bootstrap.
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
