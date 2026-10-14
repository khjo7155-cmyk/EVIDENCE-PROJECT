import type { IEvidenceCheckContext } from "./contexts/IEvidenceCheckContext";
import { EvidenceConfigLoader } from "./loaders/EvidenceConfigLoader";
import { EvidenceCheckProgrammer } from "./programmers/EvidenceCheckProgrammer";
import type { IEvidenceCheckAnalysis } from "./structures/IEvidenceCheckAnalysis";
import type { IEvidenceCheckReport } from "./structures/IEvidenceCheckReport";
import type { IEvidenceConfigPlan } from "./structures/IEvidenceConfigPlan";

/**
 * Runs configuration-driven extraction, target resolution, and graph
 * evaluation.
 *
 * Use `check` for the command report, or `analyze` when queries also need the
 * captured inventories and graph relationships. Both operations reload the
 * configured file. `evaluate` accepts an already resolved plan and captures its
 * own copy before loading the selected populations.
 *
 * Each invocation owns its execution context. Reusing a checker does not retain
 * coverage or diagnostics from a previous run, and concurrent evaluations can
 * use different plans without sharing mutable claim state. Static methods offer
 * the same operations for callers that do not need to retain a facade.
 *
 * @example
 *   const checker: EvidenceChecker = new EvidenceChecker(
 *     "evidence.config.ts",
 *   );
 *   const report: IEvidenceCheckReport = await checker.check();
 *   // A subsequent call reloads the configuration and selected source files.
 *   const updated: IEvidenceCheckReport = await checker.check();
 *
 * @evidence contracts/common.md#principled-implementation Each invocation reloads configuration, materializes fresh inventories and evaluates its own context, so runs never share coverage or mutable claim state.
 * @evidence contracts/common.md#clear-and-simple-design The facade only sequences loading, materialization and evaluation; the programmers own each step.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No result is cached between runs, so edits and recovery are always observed.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains the three operations and isolation with an example; every member is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The facade adds no algorithm; cost is the materialization and evaluation it delegates.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Runs are deliberately not reused so every check reflects current files.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The facade holds only its configuration path; each run's context is released when it returns.
 */
export class EvidenceChecker {
  /**
   * Configuration location used by `analyze` and `check`.
   *
   * Retaining a path does not retain its contents. Every invocation reloads the
   * file so edits and recovery from an earlier load failure remain observable.
   */
  private readonly configFile: string | undefined;

  /**
   * Selects the configuration file for subsequent checks.
   *
   * Construction performs no file access or parser initialization. Omission
   * discovers `evidence.config.ts`, then `evidence.config.json` only when the
   * TS entry is absent. Selection happens on each invocation; an explicit path
   * never falls back.
   */
  public constructor(configFile?: string) {
    this.configFile = configFile;
  }

  /**
   * Reloads configuration and returns the complete analysis of its populations.
   *
   * The result retains graph input, graph evaluation, and the command report
   * for queries against the same source snapshots. Configuration loading
   * failures reject the call; materialized analysis findings remain in the
   * result.
   *
   * @evidence contracts/common.md#principled-implementation The configuration is planned afresh and evaluated, returning inventories, graph result and report together.
   * @evidence contracts/common.md#clear-and-simple-design It composes the loader's plan with evaluate.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Loading failures reject; analysis findings stay in the result.
   * @evidence contracts/common.md#meaningful-documentation The comment explains what the analysis retains for queries.
   * @evidence contracts/performance.md#efficient-algorithms Cost is configuration evaluation plus materialization and graph evaluation.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each analysis must reflect current inputs.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The returned analysis is owned by the caller; no state stays on the checker.
   */
  public async analyze(): Promise<IEvidenceCheckAnalysis> {
    return this.evaluate(await EvidenceConfigLoader.plan(this.configFile));
  }

  /**
   * Analyzes one configuration through a temporary checker.
   *
   * This is the static convenience form of the instance `analyze` operation. It
   * returns captured graph context as well as the report, suitable for a
   * subsequent list, inspection, or graph export without another source load.
   * Omission discovers TS before JSON with absence-only fallback.
   *
   * @evidence contracts/common.md#principled-implementation The static form analyzes through a temporary checker with the same discovery rules.
   * @evidence contracts/common.md#clear-and-simple-design It wraps construction plus the instance method.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No separate analysis path exists.
   * @evidence contracts/common.md#meaningful-documentation The comment explains its use for later queries.
   * @evidence contracts/performance.md#efficient-algorithms Same cost as the instance form.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each call analyzes afresh.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The static form keeps no state after returning; its result is owned by the caller.
   */
  public static async analyze(
    configFile?: string,
  ): Promise<IEvidenceCheckAnalysis> {
    return new EvidenceChecker(configFile).analyze();
  }

  /**
   * Runs a fresh analysis and returns its command-facing result.
   *
   * Use this when counts, diagnostics, and exit status are sufficient. Call
   * `analyze` instead when the caller also needs materialized units for
   * queries.
   *
   * @evidence contracts/common.md#principled-implementation Check returns the report from a fresh analysis.
   * @evidence contracts/common.md#clear-and-simple-design It is a projection of analyze.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No shortcut path skips analysis.
   * @evidence contracts/common.md#meaningful-documentation The comment explains when to prefer analyze.
   * @evidence contracts/performance.md#efficient-algorithms Same cost as analyze.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each check reflects current inputs.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The report is owned by the caller.
   */
  public async check(): Promise<IEvidenceCheckReport> {
    return (await this.analyze()).report;
  }

  /**
   * Checks one configuration without retaining a facade.
   *
   * The configuration and its selected sources are loaded for this invocation.
   * The returned report has the same status and diagnostic semantics as the
   * instance `check` method. Omission discovers TS before JSON with
   * absence-only fallback.
   *
   * @evidence contracts/common.md#principled-implementation The static form checks through a temporary checker.
   * @evidence contracts/common.md#clear-and-simple-design It wraps construction plus the instance method.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Status and diagnostic semantics match the instance form.
   * @evidence contracts/common.md#meaningful-documentation The comment states discovery and equivalence.
   * @evidence contracts/performance.md#efficient-algorithms Same cost as the instance form.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each call checks afresh.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The static form keeps no state after returning; its result is owned by the caller.
   */
  public static async check(
    configFile?: string,
  ): Promise<IEvidenceCheckReport> {
    return new EvidenceChecker(configFile).check();
  }

  /**
   * Materializes and evaluates an explicitly supplied configuration plan.
   *
   * The plan is cloned before asynchronous extraction begins, isolating this
   * invocation from caller mutation. It supplies resolved configuration policy;
   * selected source inventories are still loaded afresh for the evaluation.
   *
   * @evidence contracts/common.md#principled-implementation The supplied plan is cloned before any await, populations are materialized, and the context is evaluated.
   * @evidence contracts/common.md#clear-and-simple-design Materialization and evaluation are delegated to EvidenceCheckProgrammer.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Cloning first prevents caller mutation from changing populations mid-run.
   * @evidence contracts/common.md#meaningful-documentation The comment and inline comment explain the clone.
   * @evidence contracts/performance.md#efficient-algorithms Cost is materialization plus graph evaluation.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each evaluation loads sources afresh.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The context is local to the call; the analysis is owned by the caller.
   */
  public async evaluate(
    input: IEvidenceConfigPlan,
  ): Promise<IEvidenceCheckAnalysis> {
    // Capture policy before awaiting extraction so a caller cannot change the
    // plan halfway through building this invocation's independent populations.
    const plan = structuredClone(input);
    const context: IEvidenceCheckContext = {
      plan,
      claims: await EvidenceCheckProgrammer.materialize(plan),
    };
    return EvidenceCheckProgrammer.evaluate(context);
  }

  /**
   * Evaluates a resolved plan through a temporary checker.
   *
   * The plan supplies its configuration location and is copied by the instance
   * operation. This entry point skips configuration loading while retaining
   * fresh source materialization and per-invocation graph state.
   *
   * @evidence contracts/common.md#principled-implementation The static form evaluates a resolved plan through a temporary checker anchored at the plan's configuration file.
   * @evidence contracts/common.md#clear-and-simple-design It wraps construction plus the instance method.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Configuration loading is skipped but sources are still loaded fresh.
   * @evidence contracts/common.md#meaningful-documentation The comment explains what is skipped and what is not.
   * @evidence contracts/performance.md#efficient-algorithms Same cost as the instance form.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each call evaluates afresh.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The static form keeps no state after returning; its result is owned by the caller.
   */
  public static async evaluate(
    input: IEvidenceConfigPlan,
  ): Promise<IEvidenceCheckAnalysis> {
    return new EvidenceChecker(input.configFile).evaluate(input);
  }
}
