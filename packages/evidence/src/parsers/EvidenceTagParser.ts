import type { IEvidenceTagContext } from "../contexts/IEvidenceTagContext";
import { EvidenceSourceText } from "../internal/EvidenceSourceText";
import { EvidenceTagProgrammer } from "../programmers/EvidenceTagProgrammer";
import type { IEvidenceDocumentation } from "../structures/IEvidenceDocumentation";
import type { IEvidenceHost } from "../structures/IEvidenceHost";
import type { IEvidenceTagParseResult } from "../structures/IEvidenceTagParseResult";

/**
 * Coordinates annotation parsing for one documented host.
 *
 * Every parse creates fresh continuation, fence, and diagnostic state. The
 * adapter establishes host attachment and documentation mapping before
 * construction; this controller preserves those inputs while delegating the
 * grammar to the tag programmer.
 *
 * @evidence contracts/common.md#principled-implementation A per-host controller snapshots content, host and documentation, then delegates the tag grammar to EvidenceTagProgrammer with fresh state per parse.
 * @evidence contracts/common.md#clear-and-simple-design The class owns input capture and state allocation; the grammar lives in the programmer.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Host and documentation are cloned so callers cannot redirect parsed annotations afterward.
 * @evidence contracts/common.md#meaningful-documentation The class comment explains the split with the programmer; every field and method is documented.
 * @evidence contracts/performance.md#efficient-algorithms Cost is the programmer's linear scan of the documentation; the source line index is shared through EvidenceSourceText.of, so hosts of one file reuse a single index.
 * @evidence contracts/performance.md#reuse-equivalent-work Parse state is fresh per host by design, while the immutable source line index is shared across hosts through EvidenceSourceText.of.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The controller holds cloned inputs only for its own lifetime.
 */
export class EvidenceTagParser {
  /**
   * Original source content used to restore annotation positions.
   *
   * Documentation stores normalized text, while diagnostics must point into
   * this complete host source through the documentation's retained offset
   * mapping.
   */
  private readonly content: string;

  /**
   * Adapter-established attachment and semantic identity of the documented
   * host.
   *
   * The tag programmer uses this host for statements and diagnostics. It is
   * copied at construction so a caller cannot redirect parsed annotations by
   * later mutation.
   */
  private readonly host: IEvidenceHost;

  /**
   * Mapped documentation accepted for this host by its adapter.
   *
   * Its tag boundaries and withdrawal policy define what annotation syntax is
   * valid; the copy keeps a parse operation tied to the attachment it was
   * created for.
   */
  private readonly documentation: IEvidenceDocumentation;

  /**
   * Captures one adapter-established host and its mapped documentation.
   *
   * Callers supply the full source solely for source-coordinate conversion. The
   * constructor does not parse tags, allowing adapters to build all host
   * records before the independent parsing phase begins.
   */
  public constructor(
    content: string,
    host: IEvidenceHost,
    documentation: IEvidenceDocumentation,
  ) {
    this.content = content;
    this.host = structuredClone(host);
    this.documentation = structuredClone(documentation);
  }

  /**
   * Parses the captured documentation into statements, withdrawals, and
   * diagnostics.
   *
   * Mutable continuation and code-fence state is allocated per call. Repeated
   * calls therefore produce independent results and cannot carry an unfinished
   * tag from one extraction cycle into another.
   *
   * @evidence contracts/common.md#principled-implementation Each call allocates a fresh context with an empty result and fence state, then runs the tag programmer.
   * @evidence contracts/common.md#clear-and-simple-design State allocation is here; parsing rules are in EvidenceTagProgrammer.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Fresh state prevents an unfinished tag from leaking between calls.
   * @evidence contracts/common.md#meaningful-documentation The comment explains independence of repeated calls.
   * @evidence contracts/performance.md#efficient-algorithms Linear in documentation length; the source line index is reused across hosts through EvidenceSourceText.of.
   * @evidence contracts/performance.md#reuse-equivalent-work Tag state starts fresh per call; the source line index is the shared work and comes from EvidenceSourceText.of.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The context is local; the result is owned by the caller.
   */
  public parse(): IEvidenceTagParseResult {
    const context: IEvidenceTagContext = {
      source: EvidenceSourceText.of(this.content),
      host: this.host,
      documentation: this.documentation,
      result: {
        declarations: [],
        reviews: [],
        withdrawals: [],
        diagnostics: [],
      },
      pending: undefined,
      fence: "",
      fenceLength: 0,
    };
    return EvidenceTagProgrammer.parse(context);
  }

  /**
   * Parses one adapter-mapped documentation attachment without retaining a
   * controller.
   *
   * This convenience entry point has the same snapshot and isolation guarantees
   * as constructing a parser and calling `parse`, and is suitable for one-off
   * adapter work.
   *
   * @evidence contracts/common.md#principled-implementation The static form constructs a controller and parses once, with the same snapshot guarantees.
   * @evidence contracts/common.md#clear-and-simple-design It is a convenience wrapper over the constructor and instance parse.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts No separate parsing path exists.
   * @evidence contracts/common.md#meaningful-documentation The comment states its equivalence to the instance form.
   * @evidence contracts/performance.md#efficient-algorithms Same cost as the instance parse.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work One-off parsing has nothing to share.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  public static parse(
    content: string,
    host: IEvidenceHost,
    documentation: IEvidenceDocumentation,
  ): IEvidenceTagParseResult {
    return new EvidenceTagParser(content, host, documentation).parse();
  }
}
