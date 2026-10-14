/**
 * The side of an Evidence obligation to which a configured population belongs.
 *
 * A claim population provides units requiring coverage. A reference population
 * provides targets that can satisfy those units. The same source may appear on
 * both sides, but planning keeps their roles separate for validation and
 * scope.
 *
 * @evidence contracts/common.md#principled-implementation Two literals name the obligation sides so the same source can appear as both claim and reference without merging their scopes.
 * @evidence contracts/common.md#clear-and-simple-design Role is a discriminator only; validation and scope rules live in planning code.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No population is special-cased by role.
 * @evidence contracts/common.md#meaningful-documentation The comment states what each side provides and that planning keeps the roles apart.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidencePopulationRole = "claim" | "reference";
