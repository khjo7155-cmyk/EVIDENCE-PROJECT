import path from "node:path";

import type { EvidenceEcmaScriptType } from "./EvidenceEcmaScriptType";

/**
 * Shares bounded local module candidates between capture and alias resolution.
 *
 * Dependency reads and in-memory resolution must consider the same emitted
 * extensions and index spellings so excluded barrels behave like selected
 * ones.
 *
 * @evidence contracts/common.md#principled-implementation One candidate list shared by dependency capture and alias resolution keeps excluded barrels behaving like selected ones.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only spells candidates.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Candidates follow TypeScript emitted-extension substitution and index lookup, not project layouts.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains why both phases share it.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceEcmaScriptModulePaths {
  /**
   * Lists source candidates for a local module base without accessing files.
   *
   * TypeScript substitutes source/declaration extensions for emitted JavaScript
   * paths; JavaScript explicit extensions remain exact. Extensionless requests
   * consider ordinary files and index modules.
   *
   * @evidence contracts/common.md#principled-implementation Emitted JavaScript extensions map back to TypeScript sources and declaration files, extensionless bases try known extensions and index files, without touching the filesystem.
   * @evidence contracts/common.md#clear-and-simple-design The function spells candidates; callers check existence.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Only the language's own extensions are considered.
   * @evidence contracts/common.md#meaningful-documentation The comment states the no-file-access rule.
   * @evidence contracts/performance.md#efficient-algorithms Constant per specifier: a bounded candidate list.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Candidates are cheap per specifier.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function candidates(
    base: string,
    type: EvidenceEcmaScriptType,
  ): string[] {
    const extension: string = path.posix.extname(base).toLowerCase();
    if (extension === "") {
      const extensions: string[] =
        type === "javascript"
          ? [".js", ".jsx", ".mjs", ".cjs"]
          : [".ts", ".tsx", ".d.ts", ".mts", ".cts", ".d.mts", ".d.cts"];
      return extensions
        .map((suffix: string): string => base + suffix)
        .concat(
          extensions.map((suffix: string): string =>
            path.posix.join(base, "index" + suffix),
          ),
        );
    }
    if (type === "javascript") return [base];
    const without: string = base.slice(0, -extension.length);
    if (extension === ".js" || extension === ".jsx")
      return [without + ".ts", without + ".tsx", without + ".d.ts"];
    if (extension === ".mjs") return [without + ".mts", without + ".d.mts"];
    if (extension === ".cjs") return [without + ".cts", without + ".d.cts"];
    return [base];
  }
}
