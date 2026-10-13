import type {
  LoadFnOutput,
  ResolveFnOutput,
  LoadHookContext,
  ResolveHookContext,
  LoadHookSync,
  ResolveHookSync,
} from "node:module";
import type ts from "typescript-runtime";
import type { IEvidenceConfigPackageScope } from "./IEvidenceConfigPackageScope";

/**
 * Compiles and executes a configuration inside the isolated evaluator process.
 *
 * The parent embeds this function's emitted JavaScript as a Node eval entry.
 * Runtime dependencies arrive as parameters so the function has no enclosing
 * module state. Compiler writes and Node module loads use the same in-memory
 * output map; no project, emitted module, cache, or result file is created.
 */
export async function runEvidenceConfigEvaluator(
  compiler: typeof ts,
  fs: typeof import("node:fs"),
  modules: typeof import("node:module"),
  path: typeof import("node:path"),
  urls: typeof import("node:url"),
  importModule: (url: string) => Promise<Record<string, unknown>>,
  requireModule: (file: string) => Record<string, unknown>,
  configFile: string,
  nodeTypes: string,
  isPackageScope: (value: unknown) => value is IEvidenceConfigPackageScope,
): Promise<void> {
  /**
   * Determines module format without inheriting application tsconfig.
   *
   * Synchronous Node load hooks also need this lookup for JavaScript helpers.
   */
  function moduleFormat(file: string): "module" | "commonjs" {
    const extension: string = path.extname(file);
    if (extension === ".mts" || extension === ".mjs") return "module";
    if (extension === ".cts" || extension === ".cjs") return "commonjs";
    let directory: string = path.dirname(file);
    for (;;) {
      const manifest: string = path.join(directory, "package.json");
      if (fs.existsSync(manifest)) {
        const value: unknown = JSON.parse(fs.readFileSync(manifest, "utf8"));
        if (!isPackageScope(value))
          throw new Error(
            `Invalid configuration package scope in ${manifest}.`,
          );
        return value.type === "module" ? "module" : "commonjs";
      }
      const parent: string = path.dirname(directory);
      if (parent === directory) return "commonjs";
      directory = parent;
    }
  }

  const mode: "module" | "commonjs" = moduleFormat(configFile);
  const options: ts.CompilerOptions = {
    target: compiler.ScriptTarget.ES2023,
    module: compiler.ModuleKind.Preserve,
    moduleResolution: compiler.ModuleResolutionKind.Bundler,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    allowJs: true,
    checkJs: false,
    allowImportingTsExtensions: true,
    rewriteRelativeImportExtensions: true,
    resolveJsonModule: true,
    noEmit: true,
    types: ["*"],
    ignoreDeprecations: "6.0",
  };
  const output: Map<string, string> = new Map<string, string>();

  /**
   * Checks a source and its imports before retaining executable text in memory.
   *
   * Runtime require and dynamic imports may discover another TypeScript root.
   * They use the same check boundary instead of falling back to unchecked Node
   * stripping or a disk-backed compiler launcher.
   */
  function compile(file: string): void {
    const program: ts.Program = compiler.createProgram(
      [file, nodeTypes],
      options,
    );
    const diagnostics: readonly ts.Diagnostic[] =
      compiler.getPreEmitDiagnostics(program);
    if (diagnostics.length !== 0) {
      const format: ts.FormatDiagnosticsHost = {
        getCurrentDirectory: (): string => path.dirname(configFile),
        getCanonicalFileName: (name: string): string => name,
        getNewLine: (): string => "\n",
      };
      throw new Error(compiler.formatDiagnostics(diagnostics, format));
    }
    for (const source of program.getSourceFiles()) {
      if (source.isDeclarationFile || source.fileName.endsWith(".json"))
        continue;
      const format: "module" | "commonjs" = sourceFormat(source.fileName);
      const result: ts.TranspileOutput = compiler.transpileModule(source.text, {
        fileName: source.fileName,
        compilerOptions: {
          ...options,
          noEmit: false,
          module:
            format === "module"
              ? compiler.ModuleKind.ESNext
              : compiler.ModuleKind.CommonJS,
        },
        reportDiagnostics: true,
      });
      if (result.diagnostics !== undefined && result.diagnostics.length !== 0)
        throw new Error(
          `Cannot compile configuration dependency ${source.fileName}.`,
        );
      output.set(fs.realpathSync(source.fileName), result.outputText);
    }
  }

  /**
   * Retains explicit module extensions and the configuration's TS module mode.
   *
   * Ordinary JavaScript follows its own package boundary, matching Node and the
   * watch dependency scanner rather than inheriting the entry's mode.
   */
  function sourceFormat(file: string): "module" | "commonjs" {
    const extension: string = path.extname(file);
    return extension === ".mts" || extension === ".mjs"
      ? "module"
      : extension === ".cts" || extension === ".cjs"
        ? "commonjs"
        : extension === ".js" || extension === ".jsx"
          ? moduleFormat(file)
          : mode;
  }

  // No module executes until its static dependency graph has passed typechecking.
  compile(configFile);

  const hooks: ReturnType<typeof modules.registerHooks> = modules.registerHooks(
    {
      resolve(
        specifier: string,
        context: ResolveHookContext,
        nextResolve: Parameters<ResolveHookSync>[2],
      ): ResolveFnOutput {
        const local: boolean =
          specifier.startsWith(".") ||
          specifier.startsWith("file:") ||
          path.isAbsolute(specifier);
        const requireMode: boolean = context.conditions.includes("require");
        if (!local || (requireMode && specifier.startsWith("file:")))
          return nextResolve(specifier, context);
        const base: URL = specifier.startsWith("file:")
          ? new URL(specifier)
          : path.isAbsolute(specifier)
            ? urls.pathToFileURL(specifier)
            : requireMode && context.parentURL !== undefined
              ? urls.pathToFileURL(
                  path.resolve(
                    path.dirname(urls.fileURLToPath(context.parentURL)),
                    specifier,
                  ),
                )
              : new URL(specifier, context.parentURL);
        const file: string = urls.fileURLToPath(base);
        const extension: string = path.extname(file);
        const candidates: string[] =
          extension === ".js"
            ? [file.slice(0, -3) + ".ts", file.slice(0, -3) + ".tsx"]
            : extension === ".mjs"
              ? [file.slice(0, -4) + ".mts"]
              : extension === ".cjs"
                ? [file.slice(0, -4) + ".cts"]
                : extension === ""
                  ? [
                      ".ts",
                      ".tsx",
                      ".js",
                      ".mts",
                      ".cts",
                      "/index.ts",
                      "/index.js",
                    ].map((suffix: string): string => file + suffix)
                  : [];
        // A checked TS source wins over a neighboring stale JS emit.
        for (const candidate of candidates)
          if (
            fs.existsSync(candidate) &&
            output.has(fs.realpathSync(candidate))
          ) {
            const target: URL = urls.pathToFileURL(fs.realpathSync(candidate));
            target.search = base.search;
            target.hash = base.hash;
            return { url: target.href, shortCircuit: true };
          }
        try {
          return nextResolve(specifier, context);
        } catch (cause) {
          for (const candidate of candidates) {
            if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile())
              continue;
            const target: URL = urls.pathToFileURL(fs.realpathSync(candidate));
            target.search = base.search;
            target.hash = base.hash;
            return { url: target.href, shortCircuit: true };
          }
          throw cause;
        }
      },
      load(
        url: string,
        context: LoadHookContext,
        nextLoad: Parameters<LoadHookSync>[2],
      ): LoadFnOutput {
        if (!url.startsWith("file:")) return nextLoad(url, context);
        const file: string = urls.fileURLToPath(url);
        const physical: string = fs.realpathSync(file);
        if (!output.has(physical) && /\.[cm]?tsx?$/.test(physical))
          compile(physical);
        const content: string | undefined = output.get(physical);
        if (content === undefined) return nextLoad(url, context);
        return {
          format: sourceFormat(file),
          source: content,
          shortCircuit: true,
        };
      },
    },
  );
  // Configuration may schedule imports after its default export is available.
  // Keep the in-memory loader alive until this dedicated process exits.
  process.once("exit", (): void => hooks.deregister());
  try {
    const namespace: Record<string, unknown> =
      mode === "module"
        ? await importModule(urls.pathToFileURL(configFile).href)
        : requireModule(configFile);
    if (process.send === undefined)
      throw new Error("Configuration evaluator has no IPC channel.");
    // An envelope preserves undefined and other invalid values for validation.
    const send: NonNullable<typeof process.send> = process.send.bind(process);
    await new Promise<null>(
      (
        resolve: (value: null) => void,
        reject: (cause: Error) => void,
      ): void => {
        send([namespace["default"]], (cause: Error | null): void => {
          if (cause !== null) reject(cause);
          else resolve(null);
        });
      },
    );
  } finally {
    process.disconnect();
  }
}
