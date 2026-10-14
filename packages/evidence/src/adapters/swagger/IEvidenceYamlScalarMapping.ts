import type { IEvidenceSourceRange } from "../../structures/IEvidenceSourceRange";

/**
 * Decoded YAML scalar with monotonic positions in its source token.
 *
 * Documentation handling uses the maps to convert decoded annotation offsets
 * back to the UTF-16 positions that users can edit.
 *
 * @evidence contracts/common.md#principled-implementation Decoded text with monotonic start and end positions maps annotation offsets back to source.
 * @evidence contracts/common.md#clear-and-simple-design The scalar mapper produces it for documentation handling.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Fields come from the parsed document or response; no API-specific value is encoded.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how loader and adapter use the record; each field is documented.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export interface IEvidenceYamlScalarMapping {
  /**
   * Decoded scalar text inspected for Evidence annotations.
   *
   * Annotation parsing uses this value while `offsets` and `ends` translate its
   * decoded UTF-16 positions back into the original YAML source token.
   */
  text: string;

  /**
   * Complete scalar token span in the original document.
   *
   * This range bounds every decoded-offset mapping and supplies the source
   * location when a YAML scalar's annotation needs a diagnostic.
   */
  range: IEvidenceSourceRange;

  /**
   * Source start offsets indexed by decoded UTF-16 code unit.
   *
   * Each entry identifies where the corresponding decoded unit begins,
   * including escape sequences that occupy a wider physical spelling in the
   * document.
   */
  offsets: number[];

  /**
   * Source end offsets paired with `offsets` entries.
   *
   * The matching interval permits annotation spans to include an entire escape
   * spelling rather than pointing into only part of one YAML scalar token.
   */
  ends: number[];
}
