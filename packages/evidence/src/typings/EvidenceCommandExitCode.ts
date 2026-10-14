/**
 * Process exit codes reserved by the Evidence command-line interface.
 *
 * Command callers can distinguish a passing check, a completed check with
 * reported violations, and an operational failure without parsing formatted
 * output. The numeric values are part of the shell-facing compatibility
 * contract.
 *
 * @evidence contracts/common.md#principled-implementation Numeric literals encode the documented shell contract: 0 passing, 1 violations, 2 invalid command or incomplete analysis.
 * @evidence contracts/common.md#clear-and-simple-design The alias carries only the process-facing code; command handlers decide which code a result maps to.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No consumer-specific code exists; the three values are the public CLI contract.
 * @evidence contracts/common.md#meaningful-documentation The comment explains the three outcomes and that the numbers are a compatibility contract.
 * @evidenceExclude contracts/performance.md#efficient-algorithms A type declaration chooses no processing strategy.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work A type declaration computes nothing, so there is no work to share.
 * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources A type declaration acquires and holds no runtime resource.
 */
export type EvidenceCommandExitCode = 0 | 1 | 2;
