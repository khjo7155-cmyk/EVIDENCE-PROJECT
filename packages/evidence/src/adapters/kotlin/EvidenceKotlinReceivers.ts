import type { IEvidenceKotlinDeclaration } from "./IEvidenceKotlinDeclaration";
import type { IEvidenceKotlinFileAnalysis } from "./IEvidenceKotlinFileAnalysis";
import type { IEvidenceKotlinResolvedType } from "./IEvidenceKotlinResolvedType";
import type { IEvidenceKotlinTypeReference } from "./IEvidenceKotlinTypeReference";

/**
 * Resolves explicit nominal receiver names and selected aliases without
 * compiler execution.
 *
 * Extension members must acquire the identity of their receiver type, but the
 * resolver stays within selected source and reports paths needing compiler
 * lookup.
 *
 * @evidence contracts/common.md#principled-implementation Explicit receiver names are resolved through lexical candidates and selected type alias chains, so extension members take their receiver type's identity without compiler execution.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns snapshot-wide resolution only; scanning and materialization are separate.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Paths that need compiler lookup are reported instead of resolved by guesswork.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains why resolution waits for every file; its function and helpers are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceKotlinReceivers {
  /**
   * Unifies equivalent extension sites before semantic units and addresses are
   * materialized.
   *
   * Resolution happens before publication so aliases and nullable spellings do
   * not create separate units for methods on the same public nominal receiver.
   *
   * @evidence contracts/common.md#principled-implementation Receiver candidates are looked up among selected declarations and supported aliases are expanded with cycle detection, then equivalent extension sites are unified under their effective receiver.
   * @evidence contracts/common.md#clear-and-simple-design It mutates the copied file analyses in place before units are materialized.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Paths that need compiler lookup are reported instead of resolved by guesswork.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the resolution and its failure cases.
   * @evidence contracts/performance.md#efficient-algorithms Linear in declarations and references with map lookups; alias chains are followed with cycle detection.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work It runs once per analysis over all files.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources It mutates caller-owned analyses and keeps no state.
   */
  export function resolve(analyses: IEvidenceKotlinFileAnalysis[]): void {
    const types = new Map<string, IEvidenceKotlinDeclaration[]>();
    for (const declaration of analyses.flatMap(
      (analysis) => analysis.declarations,
    )) {
      if (declaration.symbol !== "type") continue;
      const key = JSON.stringify(declaration.identity);
      const entries = types.get(key) ?? [];
      entries.push(declaration);
      types.set(key, entries);
    }
    for (const analysis of analyses)
      for (const declaration of analysis.declarations) {
        if (!declaration.public || declaration.receiver === undefined) continue;
        const resolved = lookup(declaration.receiver, types, new Set<string>());
        if (resolved === undefined) {
          analysis.complete = false;
          analysis.diagnostics.push({
            code: "kotlin-receiver-unresolved",
            severity: "error",
            message:
              declaration.receiver.problem ??
              "The extension receiver cannot be resolved uniquely through selected nominal declarations and type aliases.",
            repair:
              "Select the receiver declaration, use an explicit nominal import or qualified name, or implement the required generic, alias, or wildcard resolution.",
            location: {
              file: analysis.source.physicalPath,
              range: declaration.site.range,
            },
          });
          continue;
        }
        const spelling =
          resolved.segments.map(segment).join(".") +
          (resolved.nullable ? "?" : "");
        const receiverSegment = `extension(${spelling})`;
        declaration.identity[declaration.identity.length - 2] = receiverSegment;
        declaration.address[declaration.address.length - 2] = receiverSegment;
      }
  }

  /**
   * Resolves lexical candidates and expands selected alias chains with cycle
   * detection.
   *
   * A receiver must identify exactly one selected nominal declaration;
   * ambiguity, cycles, and file-private visibility outside the declaring file
   * remain unresolved.
   */
  function lookup(
    reference: IEvidenceKotlinTypeReference,
    types: Map<string, IEvidenceKotlinDeclaration[]>,
    visited: Set<string>,
  ): IEvidenceKotlinResolvedType | undefined {
    if (reference.problem !== undefined) return undefined;
    for (const path of reference.paths) {
      const key = JSON.stringify(path);
      const candidates = types.get(key);
      if (candidates === undefined) continue;
      const privateTypes = candidates.filter(
        (candidate) =>
          candidate.filePrivate && candidate.site.file === reference.file,
      );
      const declarations =
        privateTypes.length !== 0
          ? privateTypes
          : candidates.filter((candidate) => !candidate.filePrivate);
      const declaration = declarations[0];
      if (
        declarations.length !== 1 ||
        declaration === undefined ||
        visited.has(key)
      )
        return undefined;
      if (declaration.aliasTarget === undefined)
        return { segments: path, nullable: reference.nullable };
      const next = new Set(visited);
      next.add(key);
      const resolved = lookup(declaration.aliasTarget, types, next);
      return resolved === undefined
        ? undefined
        : {
            segments: resolved.segments,
            nullable: reference.nullable || resolved.nullable,
          };
    }
    return reference.external === undefined
      ? undefined
      : { segments: reference.external, nullable: reference.nullable };
  }

  /**
   * Retains literal Kotlin identifier boundaries inside the receiver address
   * segment.
   *
   * Non-identifier names use Kotlin backticks so punctuation cannot be mistaken
   * for a separator when the resolved receiver spelling is published.
   */
  function segment(value: string): string {
    return /^[A-Za-z_][A-Za-z0-9_]*$/u.test(value) ? value : `\`${value}\``;
  }
}
