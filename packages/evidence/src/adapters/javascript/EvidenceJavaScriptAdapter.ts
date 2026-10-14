import { EvidenceEcmaScriptAdapter } from "../ecmascript/EvidenceEcmaScriptAdapter";

/**
 * Extracts static JavaScript module exports and bounded CommonJS
 * initialization.
 *
 * The shared ECMAScript extractor classifies the selected files' module modes,
 * establishes declaration and JSDoc ownership, and publishes file-qualified
 * export paths. Public aliases retain one semantic identity; instance members
 * use prototype paths while static members remain on their class.
 *
 * Dynamic CommonJS mutation, computed export keys, and unsafe aliases cannot be
 * used to infer a complete public population. Those cases remain analysis
 * failures rather than silently omitted exports.
 *
 * @example
 *   // A declared instance method is addressed as client.js#Client.prototype.send.
 *   // Adding another supported export name does not create a second method unit.
 *
 * @evidence contracts/common.md#principled-implementation The JavaScript variant runs the shared ECMAScript pipeline with the JavaScript grammar, file and package module modes, and bounded CommonJS initialization.
 * @evidence contracts/common.md#clear-and-simple-design The subclass only selects the variant and diagnostic name; the pipeline lives in EvidenceEcmaScriptAdapter.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Dynamic CommonJS mutation, computed keys and unsafe aliases remain analysis failures rather than omitted exports.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains addressing and failure boundaries with an example; both members are documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The subclass adds no algorithm; cost is the shared pipeline's.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Reuse is handled by the shared pipeline.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The subclass holds no state beyond its configured variant.
 */
export class EvidenceJavaScriptAdapter extends EvidenceEcmaScriptAdapter<"javascript"> {
  /**
   * Configures the shared extractor for JavaScript and JSX source.
   *
   * The inherited analysis chooses module semantics from file and package
   * context. No grammar or source is loaded until a snapshot is analyzed.
   */
  public constructor() {
    super("JavaScript");
  }

  /**
   * JavaScript discriminator for the shared ECMAScript extraction pipeline.
   *
   * The literal return type lets adapter registries preserve this entry point's
   * artifact identity without narrowing a shared base instance at runtime.
   */
  public get type(): "javascript" {
    return "javascript";
  }
}
