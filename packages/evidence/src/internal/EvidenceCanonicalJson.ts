import { createHash } from "node:crypto";

/**
 * Produces canonical JSON-derived values for semantic identity calculations.
 *
 * The renderer normalizes object order and cyclic references so equivalent
 * extracted structures have stable hashes across process runs.
 *
 * @evidence contracts/common.md#principled-implementation Canonical JSON with sorted keys and a cycle sentinel gives equivalent structures identical hashes across runs.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns canonical rendering and hashing; callers choose what to hash.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No field is special-cased except those the caller names in without.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains normalization of order and cycles.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceCanonicalJson {
  /**
   * Hashes a canonical representation with SHA-256 for persisted semantic
   * comparison.
   *
   * Fingerprint consumers use the digest to compare semantic records whose
   * ordinary object enumeration order may differ.
   *
   * @evidence contracts/common.md#principled-implementation SHA-256 over a canonical rendering with sorted keys and only active-ancestor cycle tracking is order-independent and total.
   * @evidence contracts/common.md#clear-and-simple-design Rendering and hashing are separate helpers; the caller supplies the semantic value.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported values render as null, matching JSON.stringify, instead of throwing or being skipped silently.
   * @evidence contracts/common.md#meaningful-documentation The comment explains why canonical form is needed for comparisons.
   * @evidence contracts/performance.md#efficient-algorithms Rendering is linear in value size plus a key sort per object (k log k for k keys); hashing is linear in the rendered string.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Digests depend on each caller's value; callers decide when to reuse a digest.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The rendered string is passed straight to the hash and the active-ancestor set is emptied as recursion returns, so nothing is retained.
   */
  export function digest(value: unknown): string {
    return createHash("sha256").update(render(value, new Set())).digest("hex");
  }

  /**
   * Copies enumerable fields except caller-named non-semantic metadata.
   *
   * This is non-mutating because adapters may reuse the source record for
   * diagnostics after computing an identity-specific view.
   *
   * @evidence contracts/common.md#principled-implementation Object.entries filtered by a key set copies a record without caller-named metadata, leaving the source unchanged.
   * @evidence contracts/common.md#clear-and-simple-design The function only removes named keys.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts The copy is non-mutating so adapters can still use the original for diagnostics.
   * @evidence contracts/common.md#meaningful-documentation The comment explains why the copy is non-mutating.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the record's key count with constant-time set lookups.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each record is filtered once for one digest.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The copy keeps no state after returning; its result is owned by the caller.
   */
  export function without(
    value: object,
    keys: string[],
  ): Record<string, unknown> {
    const excluded = new Set(keys);
    return Object.fromEntries(
      Object.entries(value).filter(([key]) => !excluded.has(key)),
    );
  }

  /**
   * Serializes values recursively while replacing an active cycle with a stable
   * sentinel.
   *
   * Tracking only the active ancestry permits shared acyclic values while
   * preventing recursive structures from making fingerprint rendering diverge.
   */
  function render(value: unknown, seen: Set<object>): string {
    if (value === null || typeof value !== "object") return stringify(value);
    if (seen.has(value)) return '"[circular]"';
    seen.add(value);
    try {
      if (Array.isArray(value)) {
        const elements: unknown[] = value;
        return `[${elements
          .map((element) => render(element ?? null, seen))
          .join(",")}]`;
      }
      const raw: Array<[string, unknown]> = Object.entries(value);
      const entries = raw.filter(([, element]) => element !== undefined);
      entries.sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0));
      return `{${entries
        .map(
          ([key, element]) => `${JSON.stringify(key)}:${render(element, seen)}`,
        )
        .join(",")}}`;
    } finally {
      seen.delete(value);
    }
  }

  /**
   * Serializes JSON primitives while representing unsupported values as `null`.
   *
   * This follows `JSON.stringify` for representable primitives and keeps the
   * canonical renderer total for arbitrary input.
   */
  function stringify(value: unknown): string {
    return JSON.stringify(value) ?? "null";
  }
}
