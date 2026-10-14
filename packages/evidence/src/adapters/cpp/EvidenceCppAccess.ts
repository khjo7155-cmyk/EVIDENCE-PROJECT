/**
 * Represents the access section currently governing a C++ member declaration.
 *
 * EvidenceCppFileScanner carries this value through nested records so their
 * visibility can account for both the member's section and its containing
 * type.
 *
 * @evidence contracts/common.md#principled-implementation The three C++ access specifiers track the section governing each member.
 * @evidence contracts/common.md#clear-and-simple-design The scanner combines it with the containing type's visibility.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts Unsupported forms are diagnosed by the scanner rather than represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCppAccess = "public" | "protected" | "private";
