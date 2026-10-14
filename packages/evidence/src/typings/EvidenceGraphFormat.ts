/**
 * Serialization formats accepted by the graph-report command.
 *
 * `json` preserves the report as structured data. `mermaid` and `dot` are
 * visualization languages for rendering the same graph relationships and must
 * not be used as a lossless replacement for the machine-readable report.
 *
 * @evidence contracts/common.md#principled-implementation The literals are the graph command's accepted encodings: lossless JSON plus two visualization languages.
 * @evidence contracts/common.md#clear-and-simple-design Rendering per format belongs to EvidenceGraphReporter; this alias only constrains the choice.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No format is chosen for a particular consumer.
 * @evidence contracts/common.md#meaningful-documentation The comment states that mermaid and dot are visualizations, not lossless replacements for JSON.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceGraphFormat = "json" | "mermaid" | "dot";
