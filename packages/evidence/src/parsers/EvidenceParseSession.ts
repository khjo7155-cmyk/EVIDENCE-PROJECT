import { Query } from "web-tree-sitter";
import type { Node, QueryCapture, QueryMatch, Tree } from "web-tree-sitter";

import { EvidenceParserError } from "./EvidenceParserError";
import { EvidenceTreeSitterRange } from "../internal/EvidenceTreeSitterRange";
import type { IEvidenceSourceRange } from "../structures/IEvidenceSourceRange";

/**
 * Borrows one syntax tree and owns its query cache during an extraction
 * callback.
 *
 * `EvidenceParser.parse` creates the session after verifying syntax
 * completeness and disposes it before releasing the tree. Adapters can traverse
 * `root`, query captures or matches, and convert nodes into serializable
 * ranges. Nodes and query results remain borrowed; only copied names, ranges,
 * and relationships may survive the callback.
 *
 * Every operation checks lifetime and node ownership. A query that cannot be
 * compiled, needs unsupported external predicates, or exceeds its match limit
 * rejects extraction rather than supplying an apparently complete subset.
 *
 * @example
 *   // Inside EvidenceParser.parse's callback:
 *   const range: IEvidenceSourceRange = session.range(session.root);
 *   // Return range, not session.root: the range is data, while the node is borrowed.
 *
 * @evidence contracts/common.md#principled-implementation A callback-scoped session lends the tree, compiles queries once per source text, and rejects foreign nodes, closed access, unsupported predicates and match-limit truncation.
 * @evidence contracts/common.md#clear-and-simple-design The session owns only compiled queries; the parser owns the tree and parser objects.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Queries with predicates the binding cannot evaluate are refused instead of being treated as ignored filters.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains borrowing and failure rules with an example; every member is documented.
 * @evidence contracts/performance.md#efficient-algorithms Queries are compiled once per distinct source within a session.
 * @evidence contracts/performance.md#reuse-equivalent-work The query cache reuses compiled queries across repeated captures and matches in one callback.
 * @evidence contracts/performance.md#bound-retention-and-release-resources Compiled queries are deleted when the parser disposes the session, before it deletes the tree.
 */
export class EvidenceParseSession {
  /**
   * Whether the callback's query resources have been released.
   *
   * The closed flag prevents subsequent access to the borrowed tree and makes
   * disposal idempotent without relying on native object state.
   */
  private closed = false;

  /**
   * Compiled queries owned by this session, keyed by exact query source.
   *
   * Repeated extraction queries reuse their compiled form. The cache is
   * released before the runtime deletes the tree and cannot be shared across
   * sessions.
   */
  private readonly queries = new Map<string, Query>();

  /**
   * Binds a complete tree to its callback-scoped extraction session.
   *
   * The runtime retains ownership of the tree; this session owns only compiled
   * queries. Adapters receive an existing session instead of constructing one.
   *
   * @internal
   */
  public constructor(
    /**
     * Tree borrowed from the parser runtime.
     *
     * Nodes passed to session operations must belong to this exact tree. The
     * runtime deletes it only after the session has released its queries.
     */
    private readonly tree: Tree,

    /**
     * Source filename attached to session failures.
     *
     * Query and lifetime errors retain this location even when no valid node
     * range is available for a more precise diagnostic.
     */
    private readonly file: string,
  ) {}

  /**
   * Returns the borrowed root node while the session remains open.
   *
   * Traversal is valid only within the parse callback. Access after disposal
   * throws a session-closed error instead of exposing an already released
   * tree.
   */
  public get root(): Node {
    this.assertOpen();
    return this.tree.rootNode;
  }

  /**
   * Copies a session-owned node's source coordinates into a serializable range.
   *
   * The range can safely escape the callback. Foreign-tree nodes and calls
   * after disposal reject before coordinate conversion, preserving source
   * ownership.
   *
   * @evidence contracts/common.md#principled-implementation Range ownership is checked before converting the node with EvidenceTreeSitterRange.
   * @evidence contracts/common.md#clear-and-simple-design Conversion is delegated; the method enforces ownership.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Foreign or closed nodes throw rather than reporting coordinates under the wrong file.
   * @evidence contracts/common.md#meaningful-documentation The comment states that the range can escape the callback.
   * @evidence contracts/performance.md#efficient-algorithms Constant work.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each conversion is specific to its node.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The range copies primitives, so no native node escapes.
   */
  public range(node: Node): IEvidenceSourceRange {
    this.assertNode(node);
    return EvidenceTreeSitterRange.from(node);
  }

  /**
   * Runs a query and returns its flattened borrowed captures.
   *
   * Omit `node` to query the full root. A supplied node must belong to this
   * tree. Compilation failures, unsupported predicates, and match-limit
   * truncation throw, since incomplete captures cannot establish a public
   * population.
   *
   * @evidence contracts/common.md#principled-implementation Captures are run on the root or an owned node with a cached query, then checked for match-limit truncation.
   * @evidence contracts/common.md#clear-and-simple-design Query compilation and completeness checks are private helpers.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Truncated results throw so a partial capture list cannot shrink the population.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the default target and failure cases.
   * @evidence contracts/performance.md#efficient-algorithms Cost is Tree-sitter's query execution over the target subtree.
   * @evidence contracts/performance.md#reuse-equivalent-work Compiled queries are reused from the session cache.
   * @evidence contracts/performance.md#bound-retention-and-release-resources Returned captures are borrowed and valid only inside the callback.
   */
  public captures(source: string, node?: Node): QueryCapture[] {
    const target = node ?? this.root;
    this.assertNode(target);
    const query = this.query(source);
    const captures = query.captures(target);
    this.assertComplete(query);
    return captures;
  }

  /**
   * Runs a query while retaining captures grouped by their matching pattern.
   *
   * Use matches when ownership depends on captures belonging to the same syntax
   * occurrence. The default target is the root; ownership and completeness
   * checks are the same as for `captures`, and returned nodes remain
   * callback-scoped.
   *
   * @evidence contracts/common.md#principled-implementation Matches keep captures grouped by occurrence, with the same ownership and completeness checks as captures.
   * @evidence contracts/common.md#clear-and-simple-design It shares the private query and completeness helpers with captures.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Truncated results throw.
   * @evidence contracts/common.md#meaningful-documentation The comment explains when matches are preferable to captures.
   * @evidence contracts/performance.md#efficient-algorithms Cost is Tree-sitter's query execution over the target subtree.
   * @evidence contracts/performance.md#reuse-equivalent-work Compiled queries are reused from the session cache.
   * @evidence contracts/performance.md#bound-retention-and-release-resources Returned matches are borrowed and valid only inside the callback.
   */
  public matches(source: string, node?: Node): QueryMatch[] {
    const target = node ?? this.root;
    this.assertNode(target);
    const query = this.query(source);
    const matches = query.matches(target);
    this.assertComplete(query);
    return matches;
  }

  /**
   * Closes the session and releases its compiled queries once.
   *
   * The runtime calls this before deleting the separately owned tree. Marking
   * the session closed first prevents later API calls from accessing borrowed
   * nodes.
   *
   * @internal
   */
  public dispose(): void {
    if (this.closed) return;
    this.closed = true;
    for (const query of this.queries.values()) query.delete();
    this.queries.clear();
  }

  /**
   * Compiles or reuses a query whose semantics the binding can fully evaluate.
   *
   * External and property predicates are refused before caching. Treating them
   * as ignored filters would return incorrect captures while claiming a
   * complete inventory; failed queries are deleted and reported against the
   * source file.
   */
  private query(source: string): Query {
    let query = this.queries.get(source);
    if (query !== undefined) return query;
    try {
      query = new Query(this.tree.language, source);
      // The binding exposes custom/property predicates without evaluating their semantics.
      if (
        query.predicates.some((predicates) => predicates.length !== 0) ||
        query.assertedProperties.some(
          (properties) => Object.keys(properties).length !== 0,
        ) ||
        query.refutedProperties.some(
          (properties) => Object.keys(properties).length !== 0,
        )
      ) {
        query.delete();
        throw new Error(
          "Query predicates requiring an external evaluator are unsupported.",
        );
      }
      this.queries.set(source, query);
      return query;
    } catch (cause) {
      throw new EvidenceParserError(
        "query-invalid",
        this.file,
        "The adapter query is incompatible with this grammar or requires an unsupported predicate. Correct the query before extracting symbols.",
        undefined,
        { cause },
      );
    }
  }

  /**
   * Rejects a query result truncated by Tree-sitter's match limit.
   *
   * A truncated result can omit public declarations, so it must fail extraction
   * rather than become a smaller coverage denominator.
   */
  private assertComplete(query: Query): void {
    if (query.didExceedMatchLimit())
      throw new EvidenceParserError(
        "query-incomplete",
        this.file,
        "The adapter query exceeded its match limit. Simplify the query before using its captures as a complete inventory.",
      );
  }

  /**
   * Enforces the parse callback's lifetime boundary.
   *
   * Every exposed tree operation checks this state before touching native data,
   * producing a stable session error after disposal.
   */
  private assertOpen(): void {
    if (this.closed)
      throw new EvidenceParserError(
        "session-closed",
        this.file,
        "This parse callback has ended; its borrowed nodes are no longer valid.",
      );
  }

  /**
   * Requires a live node from this session's own tree.
   *
   * A node from another callback may still be live but has a different source
   * and lifetime. Reject it instead of reporting coordinates under this file.
   */
  private assertNode(node: Node): void {
    this.assertOpen();
    if (node.tree !== this.tree)
      throw new EvidenceParserError(
        "query-invalid",
        this.file,
        "The node belongs to another parse session.",
      );
  }
}
