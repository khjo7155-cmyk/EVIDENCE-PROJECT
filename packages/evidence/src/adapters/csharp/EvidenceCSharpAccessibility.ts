/**
 * Records C# accessibility as declared before containing-type reachability.
 *
 * EvidenceCSharpFileScanner retains the raw form so later visibility evaluation
 * can combine C# defaults and modifiers with every enclosing type's
 * accessibility.
 *
 * @evidence contracts/common.md#principled-implementation The literals record every C# accessibility as written, including combined forms and the implicit default.
 * @evidence contracts/common.md#clear-and-simple-design Visibility evaluation combines it with containing types and C# defaults.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No form outside the documented C# surface is represented.
 * @evidence contracts/common.md#meaningful-documentation The comment explains how the scanner and adapter use the value.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCSharpAccessibility =
  | "default"
  | "public"
  | "private"
  | "protected"
  | "internal"
  | "protected-internal"
  | "private-protected"
  | "file";
