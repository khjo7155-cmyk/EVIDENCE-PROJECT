/**
 * Identifies the receiver side on which Ruby installs a method or generated
 * attribute.
 *
 * Scanner contexts retain this distinction so instance and singleton members of
 * the same container receive separate semantic identities and public
 * addresses.
 *
 * @evidence contracts/common.md#principled-implementation Instance and singleton sides give members of the same container separate identities and addresses.
 * @evidence contracts/common.md#clear-and-simple-design Scanner contexts carry the side.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No language form outside the documented set is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceRubyMethodSide = "instance" | "singleton";
