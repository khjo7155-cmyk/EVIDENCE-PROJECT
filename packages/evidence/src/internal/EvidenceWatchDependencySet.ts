import type { IEvidenceCheckAnalysis } from "../structures/IEvidenceCheckAnalysis";
import type { IEvidenceSourceDependency } from "../structures/IEvidenceSourceDependency";

import { EvidenceSourcePath } from "./EvidenceSourcePath";

/**
 * Builds deterministic watch dependency sets from an analysis snapshot.
 *
 * Merging upgrades duplicate paths to recursive monitoring, preserving the
 * broader invalidation boundary without retaining duplicate watcher requests.
 *
 * @evidence contracts/common.md#principled-implementation Deterministic, deduplicated dependency sets let watch compare snapshots and keep the broadest invalidation boundary.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns merging and containment; observation is in the watcher.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Duplicate paths upgrade to recursive instead of dropping a requirement.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains merging.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceWatchDependencySet {
  /**
   * Combines configuration dependencies with every loaded claim and reference
   * inventory.
   *
   * Watch setup uses the merged result so edits to configuration, selected
   * claims, or selected reference sources can invalidate the published
   * analysis.
   *
   * @evidence contracts/common.md#principled-implementation Configuration dependencies are merged with every claim and reference inventory's dependencies so any selected input invalidates the analysis.
   * @evidence contracts/common.md#clear-and-simple-design Collection is delegated to merge.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No inventory is skipped, including references shared by several claims.
   * @evidence contracts/common.md#meaningful-documentation The comment explains which inputs are included.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the total number of dependencies plus a sort.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work It runs once per published analysis.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function analysis(
    value: IEvidenceCheckAnalysis,
    configuration: IEvidenceSourceDependency[],
  ): IEvidenceSourceDependency[] {
    return merge(
      configuration,
      value.graphInput.claims.flatMap((claim) => [
        ...claim.inventory.dependencies,
        ...claim.references.flatMap(
          (reference) => reference.inventory.dependencies,
        ),
      ]),
    );
  }

  /**
   * Normalizes, deduplicates, and orders dependency paths for stable snapshots.
   *
   * Duplicate paths retain recursive monitoring when any source requires it,
   * preserving the broadest invalidation boundary in the returned set.
   *
   * @evidence contracts/common.md#principled-implementation A map keyed by slash-normalized path deduplicates entries, ORs recursion, then sorts for deterministic snapshots.
   * @evidence contracts/common.md#clear-and-simple-design Normalization is delegated to EvidenceSourcePath.slash.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Recursion is preserved from any source rather than the last one.
   * @evidence contracts/common.md#meaningful-documentation The comment explains normalization, deduplication and recursion upgrade.
   * @evidence contracts/performance.md#efficient-algorithms Linear map insertion plus an n log n sort.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each merge serves one snapshot.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The merge keeps no state after returning; its result is owned by the caller.
   */
  export function merge(
    ...groups: IEvidenceSourceDependency[][]
  ): IEvidenceSourceDependency[] {
    const output = new Map<string, IEvidenceSourceDependency>();
    for (const dependency of groups.flat()) {
      const location = EvidenceSourcePath.slash(dependency.path);
      const previous = output.get(location);
      output.set(location, {
        path: location,
        recursive: dependency.recursive || previous?.recursive === true,
      });
    }
    return Array.from(output.values()).sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
  }

  /**
   * Checks whether available dependencies cover every required path at equal or
   * broader recursion.
   *
   * A recursive requirement cannot be satisfied by an exact watch, while a
   * recursive available dependency can satisfy an exact requirement for its
   * path.
   *
   * @evidence contracts/common.md#principled-implementation A path-to-recursion map answers each requirement in constant time, honoring that only a recursive watch covers a recursive requirement.
   * @evidence contracts/common.md#clear-and-simple-design The function only checks coverage.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No path is treated as covered by a mere prefix match.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the recursion rule.
   * @evidence contracts/performance.md#efficient-algorithms Linear in available plus required dependencies.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each check compares two specific sets.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The check keeps no state after returning; its result is owned by the caller.
   */
  export function contains(
    available: IEvidenceSourceDependency[],
    required: IEvidenceSourceDependency[],
  ): boolean {
    const lookup = new Map(
      available.map((dependency) => [dependency.path, dependency.recursive]),
    );
    return required.every((dependency) => {
      const recursive = lookup.get(dependency.path);
      return recursive !== undefined && (!dependency.recursive || recursive);
    });
  }
}
