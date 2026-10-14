import type { IEvidenceInventory } from "../structures/IEvidenceInventory";
import type { IEvidenceSourceLocation } from "../structures/IEvidenceSourceLocation";

/**
 * Reconciles physical source paths across inventories without rewriting public
 * addresses.
 *
 * Merge consumers need one physical key for source content and annotations, but
 * adapters retain logical origins because they remain valid user-facing
 * targets.
 *
 * @evidence contracts/common.md#principled-implementation Source IDs identify filesystem identity, so reconciling physical paths by ID gives merged inventories one key per source.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns only physical-path reconciliation; public addresses are left to resolution.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Conflicts are reported as incomplete inventories instead of picking one silently.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains why logical origins stay untouched.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceInventorySources {
  /**
   * Normalizes location-bearing records in place and reports impossible source
   * conflicts.
   *
   * Merge callers obtain one canonical physical path per source ID while public
   * logical addresses remain untouched for target resolution and reporting.
   *
   * @evidence contracts/common.md#principled-implementation The lexicographically smallest physical path per source ID becomes canonical, and every location-bearing record is rewritten through one path map.
   * @evidence contracts/common.md#clear-and-simple-design A local locate helper rewrites locations; addresses and host origins keep their logical spellings.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts A physical path claimed by two source IDs marks that inventory incomplete with an inventory-source diagnostic.
   * @evidence contracts/common.md#meaningful-documentation The comment explains in-place normalization and conflict reporting; the helper documents why addresses are unchanged.
   * @evidence contracts/performance.md#efficient-algorithms Three passes over sources and one pass over each record list, with constant-time map lookups: linear in inventory size.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Reconciliation runs once per merge over its specific inputs.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The temporary maps are local to the call; the inputs are mutated in place and no state is kept.
   */
  export function reconcile(inputs: IEvidenceInventory[]): void {
    const canonical = new Map<string, string>();
    const owners = new Map<string, string>();
    for (const input of inputs)
      for (const source of input.sources) {
        const previous = canonical.get(source.id);
        if (previous === undefined || source.physicalPath < previous)
          canonical.set(source.id, source.physicalPath);
        const owner = owners.get(source.physicalPath);
        if (owner !== undefined && owner !== source.id) {
          input.complete = false;
          input.diagnostics.push({
            code: "inventory-source",
            severity: "error",
            message:
              "One physical source path has conflicting filesystem identities.",
            repair:
              "Load populations from a consistent filesystem snapshot before combining them.",
            location: { file: source.physicalPath },
          });
        }
        owners.set(source.physicalPath, source.id);
      }
    const paths = new Map<string, string>();
    for (const input of inputs)
      for (const source of input.sources)
        paths.set(
          source.physicalPath,
          canonical.get(source.id) ?? source.physicalPath,
        );

    /**
     * Rewrites one physical location through the source-ID canonicalization
     * map.
     *
     * This helper leaves logical addresses unchanged because the map represents
     * filesystem identity, not the source spelling a user can target.
     */
    function locate(location: IEvidenceSourceLocation): void {
      location.file = paths.get(location.file) ?? location.file;
    }

    for (const input of inputs) {
      for (const source of input.sources)
        source.physicalPath = canonical.get(source.id) ?? source.physicalPath;
      for (const annotation of input.annotationRanges) locate(annotation);
      for (const unit of input.units) {
        for (const site of unit.sites) locate(site);
        for (const withdrawal of unit.withdrawals) locate(withdrawal.location);
      }
      for (const host of input.hosts) {
        host.origins = host.origins ?? [host.file];
        locate(host);
      }
      for (const declaration of input.declarations)
        locate(declaration.location);
      for (const review of input.reviews) locate(review.location);
      for (const diagnostic of input.diagnostics)
        if (diagnostic.location !== undefined) locate(diagnostic.location);
    }
  }
}
