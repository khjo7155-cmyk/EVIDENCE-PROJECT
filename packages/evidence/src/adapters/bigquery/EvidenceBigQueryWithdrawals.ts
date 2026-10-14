import { EvidenceTagParser } from "../../parsers/EvidenceTagParser";
import { EvidenceSqlDocumentation } from "../sql/EvidenceSqlDocumentation";
import type { IEvidenceSqlFileAnalysis } from "../sql/IEvidenceSqlFileAnalysis";

/**
 * Propagates STRUCT withdrawals while keeping each field owned by its table
 * model.
 *
 * Nested fields inherit only parsed withdrawal annotations from their enclosing
 * schema field.
 *
 * @evidence contracts/common.md#principled-implementation Withdrawals on a STRUCT field propagate to its explicitly nested fields while every field stays owned by its table model.
 * @evidence contracts/common.md#clear-and-simple-design The namespace only propagates parsed withdrawals after attachment.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Ordinary annotations are not copied, only withdrawals.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains the ownership rule.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace only groups its exported functions, which each own their processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work The namespace owns no cached result; any reuse belongs to its member functions or module singletons documented there.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources Grouping functions acquires no resource; member functions own any resource they use.
 */
export namespace EvidenceBigQueryWithdrawals {
  /**
   * Copies parsed withdrawal annotations to explicitly nested schema fields.
   *
   * This runs after documentation attachment so ordinary annotations remain at
   * their own sites.
   *
   * @evidence contracts/common.md#principled-implementation Nested declarations inherit withdrawal tags from their enclosing field's parsed annotations.
   * @evidence contracts/common.md#clear-and-simple-design It mutates the file analysis after documentation attachment.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Only withdrawal annotations propagate.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the timing.
   * @evidence contracts/performance.md#efficient-algorithms Linear in declarations and their withdrawals.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work It runs once per file.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources It mutates the caller-owned analysis and keeps nothing.
   */
  export function apply(analysis: IEvidenceSqlFileAnalysis): void {
    const declarations = new Map(
      analysis.declarations.map((declaration) => [declaration.id, declaration]),
    );
    for (const documentation of [...analysis.documentation]) {
      for (const attachment of documentation.attachments) {
        const owner = declarations.get(attachment.declarationId);
        if (owner === undefined || owner.symbol !== "column") continue;
        const descendants = analysis.declarations.filter(
          (declaration) =>
            declaration.symbol === "column" &&
            declaration.ownerDeclarationId === owner.ownerDeclarationId &&
            declaration.identity.length > owner.identity.length &&
            owner.identity.every(
              (segment, index) => declaration.identity[index] === segment,
            ),
        );
        if (descendants.length === 0) continue;
        const mapped = EvidenceSqlDocumentation.read(
          analysis.source,
          documentation,
          documentation.id,
        );
        const parsed = EvidenceTagParser.parse(
          analysis.source.content,
          {
            id: documentation.id,
            file: analysis.source.physicalPath,
            range: documentation.range,
            siteId: owner.site.id,
            unitIds: [owner.id],
            attachment: "attached",
          },
          mapped,
        );
        if (parsed.withdrawals.length === 0) continue;
        const ranges = parsed.withdrawals.flatMap((withdrawal) =>
          withdrawal.location.range === undefined
            ? []
            : [withdrawal.location.range],
        );
        const text = mapped.text
          .split("")
          .map((character, index) => {
            const offset = mapped.offsets[index];
            return character === "\r" ||
              character === "\n" ||
              (offset !== undefined &&
                ranges.some(
                  (range) =>
                    offset >= range.start.offset && offset < range.end.offset,
                ))
              ? character
              : " ";
          })
          .join("");
        analysis.documentation.push({
          id: `${documentation.id}:nested-withdrawal`,
          range: documentation.range,
          mapped: { ...mapped, text },
          attachments: descendants.map((declaration) => ({
            declarationId: declaration.id,
            siteId: declaration.site.id,
          })),
        });
      }
    }
  }
}
