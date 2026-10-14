import { extname } from "node:path";

/**
 * Selects the evaluator supported by a configuration filename's explicit
 * extension.
 *
 * Config loading calls this boundary before parsing so file content never
 * changes the evaluator selected for a path.
 *
 * @evidence contracts/common.md#principled-implementation The evaluator is chosen from the explicit extension only, so file content never changes how a path is evaluated.
 * @evidence contracts/common.md#clear-and-simple-design One namespace owns the extension-to-evaluator mapping used before parsing.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported extensions fail instead of guessing from content.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment states its role before parsing.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceConfigFormat {
  /**
   * Returns the evaluator selected by an explicit supported filename extension.
   *
   * Unsupported spellings fail here instead of causing configuration loading to
   * guess a parser from file content.
   *
   * @evidence contracts/common.md#principled-implementation Node's extname plus a fixed list maps .json and .ts/.cts/.mts to their evaluators.
   * @evidence contracts/common.md#clear-and-simple-design The function only maps the extension; loading and evaluation happen in the caller.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported spellings throw with the supported list instead of falling back to a parser guess.
   * @evidence contracts/common.md#meaningful-documentation The comment states the mapping and the refusal of unsupported spellings.
   * @evidence contracts/performance.md#efficient-algorithms Constant work: one extname call and a three-element membership check.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work A constant-time mapping has no work worth sharing.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The mapping keeps no state after returning; its result is owned by the caller.
   */
  export function get(file: string): "json" | "typescript" {
    const extension = extname(file);
    if (extension === ".json") return "json";
    if ([".ts", ".cts", ".mts"].includes(extension)) return "typescript";
    throw new Error(
      `Unsupported evidence configuration extension: ${file}. Use .json, .ts, .cts, or .mts.`,
    );
  }
}
