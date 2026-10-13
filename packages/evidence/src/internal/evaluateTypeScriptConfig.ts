import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import path from "node:path";
import typia from "typia";

import { runEvidenceConfigEvaluator } from "./runEvidenceConfigEvaluator";
import { evidenceConfigModuleCandidates } from "./evidenceConfigModuleCandidates";
import type { IEvidenceEvaluateTypeScriptConfigOptions } from "./IEvidenceEvaluateTypeScriptConfigOptions";
import type { IEvidenceConfigPackageScope } from "./IEvidenceConfigPackageScope";

/**
 * Typechecks and evaluates a configuration without writing any files.
 *
 * A fresh process captures compiler output in memory and returns the default
 * export over V8-backed IPC. Configuration logs remain diagnostic output, and
 * each evaluation starts with a fresh module cache for watch recovery.
 */
export async function evaluateTypeScriptConfig(
  configFile: string,
  options: IEvidenceEvaluateTypeScriptConfigOptions = {},
): Promise<unknown> {
  const filename: string = path.resolve(configFile);
  const bootstrap: string = `(${runEvidenceConfigEvaluator.toString()})(
    require(${JSON.stringify(require.resolve("typescript-runtime"))}),
    require("node:fs"), require("node:module"), require("node:path"),
    require("node:url"), (url) => import(url),
    (file) => require("node:module").createRequire(file)(file),
    ${JSON.stringify(filename)},
    ${JSON.stringify(require.resolve("@types/node/index.d.ts"))},
    ${isPackageScope.toString()},
    (base) => (${evidenceConfigModuleCandidates.toString()})(base,
      require("node:path").extname(base).toLowerCase(), require("node:path").join)
  ).catch((error) => { console.error(error); process.exitCode = 1; });`;
  const writeDiagnostic: (content: string) => void =
    options.writeDiagnostic ?? writeProcessDiagnostic;
  return new Promise<unknown>(
    (
      resolve: (value: unknown) => void,
      reject: (cause: Error) => void,
    ): void => {
      const child: ChildProcess = spawn(
        process.execPath,
        ["--permission", "--allow-fs-read=*", "--eval", bootstrap],
        {
          cwd: path.dirname(filename),
          stdio: ["ignore", "pipe", "pipe", "ipc"],
          serialization: "advanced",
          windowsHide: true,
          // Inherited preload hooks and Node's compile cache can write before our
          // evaluator starts. Use a clean, read-only child with both disabled.
          env: {
            ...process.env,
            NODE_OPTIONS: "",
            NODE_DISABLE_COMPILE_CACHE: "1",
          },
        },
      );
      let returned: boolean = false;
      let value: unknown;
      if (child.stdout !== null) {
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", writeDiagnostic);
      }
      if (child.stderr !== null) {
        child.stderr.setEncoding("utf8");
        child.stderr.on("data", writeDiagnostic);
      }
      child.once("message", (message: unknown): void => {
        if (!typia.is<[unknown]>(message)) return;
        returned = true;
        value = message[0];
      });
      child.once("error", (cause: Error): void => {
        reject(
          new Error(`Could not start the config evaluator for ${filename}.`, {
            cause,
          }),
        );
      });
      child.once(
        "close",
        (code: number | null, signal: NodeJS.Signals | null): void => {
          if (code !== 0)
            reject(
              new Error(
                `Config evaluation failed for ${filename} (${signal ?? `exit ${String(code)}`}). See compiler or runtime diagnostics above.`,
              ),
            );
          else if (!returned)
            reject(
              new Error(
                `Config evaluator for ${filename} exited without returning its default export.`,
              ),
            );
          else resolve(value);
        },
      );
    },
  );
}

/**
 * Sends evaluator logs to stderr without mixing them with report stdout.
 *
 * Callers may replace this sink to retain the original compiler and runtime
 * diagnostic chunks themselves.
 */
function writeProcessDiagnostic(content: string): void {
  process.stderr.write(content);
}

/**
 * Validates the package projection used to choose the evaluator's module mode.
 *
 * Typia emits a self-contained predicate that can accompany the evaluator
 * bootstrap without loading runtime transformers or creating compiler files.
 */
function isPackageScope(value: unknown): value is IEvidenceConfigPackageScope {
  return typia.is<IEvidenceConfigPackageScope>(value);
}
