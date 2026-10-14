/**
 * Prisma comment syntax relevant to documentation attachment.
 *
 * The position scanner classifies comment runs with these forms before adapter
 * attachment determines whether they are eligible carriers for Evidence tags.
 *
 * @evidence contracts/common.md#principled-implementation Three literals distinguish triple-slash documentation, ordinary line comments and block comments, which attach differently.
 * @evidence contracts/common.md#clear-and-simple-design The scanner classifies; the adapter decides eligibility.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No comment form is special-cased beyond Prisma's syntax.
 * @evidence contracts/common.md#meaningful-documentation The comment explains its role in attachment.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidencePrismaCommentForm = "doc" | "line" | "block";
