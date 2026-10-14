import { readFile } from "node:fs/promises";
import path from "node:path";

import typia from "typia";
import { VariadicSingleton } from "tstl";

import type { IEvidenceDiagnostic } from "../../structures/IEvidenceDiagnostic";
import type { IEvidenceSourceDependency } from "../../structures/IEvidenceSourceDependency";
import type { IEvidenceSourceFile } from "../../structures/IEvidenceSourceFile";
import type { EvidenceEcmaScriptModuleMode } from "./EvidenceEcmaScriptModuleMode";
import type { IEvidenceEcmaScriptModuleResolution } from "./IEvidenceEcmaScriptModuleResolution";
import type { IEvidenceJavaScriptPackageJson } from "./IEvidenceJavaScriptPackageJson";
import { EvidenceSourcePath } from "../../internal/EvidenceSourcePath";

/**
 * Selects JavaScript module mode for every selected source file.
 *
 * `EvidenceEcmaScriptAdapter` uses this resolver before scanning JavaScript
 * because `.js` and `.jsx` files inherit ESM or CommonJS semantics from the
 * nearest package metadata. The resolver also records consulted manifests as
 * watch dependencies and turns unreadable or conflicting package scopes into
 * inventory diagnostics.
 *
 * @evidence contracts/common.md#principled-implementation Explicit .mjs and .cjs extensions decide the mode directly; .js and .jsx inherit the nearest package.json type, read once per directory, defaulting to CommonJS as Node does.
 * @evidence contracts/common.md#clear-and-simple-design The resolver owns mode selection and manifest dependencies; scanning uses the result.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unreadable or invalid manifests become diagnostics instead of silently defaulting.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains inheritance and watch dependencies; every member is documented.
 * @evidence contracts/performance.md#efficient-algorithms Package lookups are memoized per normalized directory, so each manifest is read at most once per analysis.
 * @evidence contracts/performance.md#reuse-equivalent-work A VariadicSingleton shares in-flight and completed lookups among files in the same directories.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The resolver and its memo live for one analysis.
 */
export class EvidenceEcmaScriptModuleResolver {
  /**
   * Creates a resolver whose package-scope lookups are isolated to one
   * analysis.
   *
   * The lazy cache reads each package directory at most once. Missing manifests
   * delegate to the parent directory, matching EvidenceNode's nearest-package
   * scope rule.
   */
  public constructor() {
    this.packages = new VariadicSingleton(
      async (directory: string): Promise<EvidenceEcmaScriptModuleMode> => {
        const manifest = EvidenceSourcePath.slash(
          path.join(directory, "package.json"),
        );
        this.dependencies.set(manifest, { path: manifest, recursive: false });
        try {
          const content = await readFile(manifest, "utf8");
          const metadata =
            typia.json.assertParse<IEvidenceJavaScriptPackageJson>(
              content.replace(/^\uFEFF/u, ""),
            );
          if (metadata.type === undefined || metadata.type === "commonjs")
            return "commonjs";
          if (metadata.type === "module") return "esm";
          this.problem(
            "javascript-package-type",
            `Package metadata declares unsupported JavaScript module type '${metadata.type}'.`,
            "Use 'module' or 'commonjs' for the package.json type field.",
            manifest,
          );
          return "commonjs";
        } catch (cause) {
          if (this.absent(cause)) {
            // A directory without a manifest inherits its parent package scope.
            // Reaching the filesystem root supplies JavaScript's CommonJS default.
            const parent = path.dirname(directory);
            return parent === directory
              ? "commonjs"
              : this.packages.get(EvidenceSourcePath.slash(parent));
          }
          this.problem(
            "javascript-package-json",
            `Could not read JavaScript module metadata: ${this.message(cause)}`,
            "Correct the nearest package.json before evaluating JavaScript coverage.",
            manifest,
          );
          return "commonjs";
        }
      },
    );
  }

  /**
   * Resolves module modes and watched package manifests for selected sources.
   *
   * Every logical address of one source must select the same mode. A mismatch
   * is reported because parsing one file with either mode alone would make
   * export semantics depend on an arbitrary alias.
   *
   * @evidence contracts/common.md#principled-implementation Each selected source's mode is resolved and returned with consulted manifests and diagnostics.
   * @evidence contracts/common.md#clear-and-simple-design Per-file lookup is a private method using the directory memo.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Conflicting or failing package scopes are reported, not ignored.
   * @evidence contracts/common.md#meaningful-documentation The comment states what the resolution contains.
   * @evidence contracts/performance.md#efficient-algorithms Linear in sources with memoized directory lookups.
   * @evidence contracts/performance.md#reuse-equivalent-work The directory memo is shared across all sources in the call.
   * @evidence contracts/performance.md#bound-retention-and-release-resources Manifest reads complete before returning; the resolution is owned by the caller.
   */
  public async resolve(
    sources: IEvidenceSourceFile[],
  ): Promise<IEvidenceEcmaScriptModuleResolution> {
    const modes = new Map<string, EvidenceEcmaScriptModuleMode>();
    await Promise.all(
      sources.map(async (source) => {
        const addresses =
          source.addresses.length === 0
            ? [source.physicalPath]
            : source.addresses.map((address) => address.absolute);
        const selected = new Set(
          await Promise.all(addresses.map((file) => this.mode(file))),
        );
        if (selected.size !== 1)
          this.problem(
            "javascript-module-mode",
            "Logical aliases of one JavaScript source select different module modes.",
            "Keep aliases under package scopes with the same type or select one logical file.",
            source.physicalPath,
          );
        modes.set(source.id, selected.values().next().value ?? "commonjs");
      }),
    );
    return {
      modes,
      dependencies: Array.from(this.dependencies.values()),
      diagnostics: this.diagnostics,
      complete: this.diagnostics.length === 0,
    };
  }

  /**
   * Package manifests consulted while resolving selected source modes.
   *
   * The final resolution exposes these records as watch dependencies.
   */
  private readonly dependencies = new Map<string, IEvidenceSourceDependency>();

  /**
   * Failures that prevent a complete and reliable module-mode selection.
   *
   * `resolve` returns them to the adapter, which incorporates them into the
   * inventory and derives its completeness flag from their presence.
   */
  private readonly diagnostics: IEvidenceDiagnostic[] = [];

  /**
   * Selects a file's explicit or package-inherited JavaScript module mode.
   *
   * `.mjs` and `.cjs` always determine their own mode; other extensions consult
   * the nearest cached package directory after converting the path to a stable
   * key.
   */
  private async mode(file: string): Promise<EvidenceEcmaScriptModuleMode> {
    const extension = path.extname(file).toLowerCase();
    if (extension === ".mjs") return "esm";
    if (extension === ".cjs") return "commonjs";
    return this.packages.get(
      EvidenceSourcePath.slash(path.dirname(path.resolve(file))),
    );
  }

  /**
   * Memoizes package metadata lookup by normalized directory.
   *
   * Its callback also records the manifest before reading it, ensuring watch
   * can rerun analysis when a missing, changed, or repaired package boundary
   * changes.
   */
  private readonly packages: VariadicSingleton<
    Promise<EvidenceEcmaScriptModuleMode>,
    [string]
  >;

  /**
   * Identifies a missing package manifest without suppressing other read
   * errors.
   *
   * Only ENOENT permits parent-scope fallback; permissions and malformed
   * metadata must leave a diagnostic because their intended module mode is
   * unknown.
   */
  private absent(cause: unknown): boolean {
    return cause instanceof Error && "code" in cause && cause.code === "ENOENT";
  }

  /**
   * Converts an unknown read failure into diagnostic text.
   *
   * Error messages retain filesystem context while non-Error throws still
   * produce a useful, deterministic string for the inventory diagnostic.
   */
  private message(cause: unknown): string {
    return cause instanceof Error ? cause.message : String(cause);
  }

  /**
   * Appends a package-resolution failure for the adapter to materialize.
   *
   * Each call represents a distinct encountered failure; unlike export
   * traversal, package lookup is memoized so this method does not need an extra
   * deduplication key.
   */
  private problem(
    code: string,
    message: string,
    repair: string,
    file: string,
  ): void {
    this.diagnostics.push({
      code,
      severity: "error",
      message,
      repair,
      location: { file },
    });
  }
}
