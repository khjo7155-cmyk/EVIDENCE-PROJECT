import type { Node as EvidenceNode } from "web-tree-sitter";

/**
 * Bounds the grammar's permissive type names to declared GoogleSQL schema
 * types.
 *
 * Tree-sitter accepts broader syntax than this adapter can materialize safely,
 * so the scanner rejects fields outside this explicit semantic surface.
 *
 * @evidence contracts/common.md#principled-implementation Column types are limited to declared GoogleSQL scalar types and ARRAY or STRUCT envelopes, narrowing the grammar's permissive names.
 * @evidence contracts/common.md#clear-and-simple-design The namespace validates types; nested fields are validated by the scanner.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported types are rejected instead of materialized.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains why the grammar is narrowed.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceBigQueryColumnType {
  /**
   * Checks scalar leaves and structural envelopes.
   *
   * Nested fields are validated separately by the scanner; replacing them with
   * `FIELD` here verifies only the enclosing ARRAY or STRUCT shape.
   *
   * @evidence contracts/common.md#principled-implementation Scalar leaves must be known type names and envelopes must be well-formed ARRAY or STRUCT shapes with nested fields abstracted.
   * @evidence contracts/common.md#clear-and-simple-design Nested field validation stays in the scanner.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Anything unrecognized returns false.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the FIELD substitution.
   * @evidence contracts/performance.md#efficient-algorithms Linear in the inspected statement's syntax subtree.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each statement is validated once during its file scan.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function reads borrowed nodes during the parse callback and keeps no reference to them.
   */
  export function supported(node: EvidenceNode): boolean {
    const nested = node.namedChildren.filter(
      (child) => child.type === "column_definition",
    );
    let envelope = node.text;
    for (const child of [...nested].reverse()) {
      const from = child.startIndex - node.startIndex;
      const until = child.endIndex - node.startIndex;
      envelope = `${envelope.slice(0, from)}FIELD${envelope.slice(until)}`;
    }
    envelope = envelope.replace(/\s+/gu, "").toUpperCase();
    if (nested.length !== 0)
      return /^(?:STRUCT<FIELD(?:,FIELD)*>|ARRAY<STRUCT<FIELD(?:,FIELD)*>>)$/u.test(
        envelope,
      );
    if (envelope.startsWith("ARRAY<") && envelope.endsWith(">"))
      envelope = envelope.slice(6, -1);
    return (
      /^(?:INT64|INT|SMALLINT|INTEGER|BIGINT|TINYINT|BYTEINT|FLOAT64|FLOAT|BOOL|BOOLEAN|DATE|DATETIME|TIME|TIMESTAMP|INTERVAL|JSON|GEOGRAPHY)$/u.test(
        envelope,
      ) ||
      /^(?:STRING|BYTES)(?:\(\d+\))?$/u.test(envelope) ||
      /^(?:NUMERIC|DECIMAL|BIGNUMERIC|BIGDECIMAL)(?:\(\d+(?:,\d+)?\))?$/u.test(
        envelope,
      )
    );
  }
}
