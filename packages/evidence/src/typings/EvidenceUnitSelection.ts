/**
 * Relationship between an inventory unit and a configured population.
 *
 * `selected` units form the coverage denominator. `ancestor` units remain
 * addressable to cover selected descendants but do not count themselves, while
 * `unselected` units are outside that population's target space altogether.
 *
 * @evidence contracts/common.md#principled-implementation Three states separate denominator units, addressable ancestors and units outside the population, which coverage and target resolution treat differently.
 * @evidence contracts/common.md#clear-and-simple-design Selection is computed by inventory projection; the alias only names the result.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Ancestors stay addressable without counting toward coverage, so selection cannot inflate the denominator.
 * @evidence contracts/common.md#meaningful-documentation The comment defines each state and its effect on coverage and target space.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceUnitSelection = "selected" | "ancestor" | "unselected";
