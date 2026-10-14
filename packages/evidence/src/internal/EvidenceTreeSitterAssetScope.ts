import { AsyncLocalStorage } from "node:async_hooks";

import type { IEvidenceTreeSitterAssetOptions } from "./IEvidenceTreeSitterAssetOptions";

/**
 * Carries parser-asset controls through one asynchronous execution chain.
 *
 * Async-local inheritance lets nested checker and adapter instances share a
 * caller's cache, cancellation, and progress policy without global mutable
 * options.
 *
 * @evidence contracts/common.md#principled-implementation AsyncLocalStorage carries asset controls through one asynchronous chain, so nested checkers inherit a caller's policy without global mutable options.
 * @evidence contracts/common.md#clear-and-simple-design The namespace owns only scope storage; acquisition reads it through EvidenceTreeSitterAssets.
 * @evidence contracts/common.md#prohibited-implementation-shortcuts No global option or monkey-patched fetch is used to pass policy.
 * @evidence contracts/common.md#meaningful-documentation The namespace comment explains async-local inheritance.
 * @evidenceExclude contracts/performance.md#efficient-algorithms The namespace's functions do constant work; it adds no algorithm.
 * @evidenceExclude contracts/performance.md#reuse-equivalent-work Scopes carry policy, not results; there is no computed work to share.
 * @evidence contracts/performance.md#bound-retention-and-release-resources The module-level AsyncLocalStorage holds only options objects for active chains; each scope's store is released when its run callback completes.
 */
export namespace EvidenceTreeSitterAssetScope {
  /**
   * Returns a defensive copy of the current asset controls, or an empty default
   * outside a scope.
   *
   * EvidenceTreeSitterAssets merges this result with constructor options so
   * callers cannot mutate async-local state through the returned object.
   *
   * @evidence contracts/common.md#principled-implementation Reading the async-local store and spreading it returns the active controls or an empty default.
   * @evidence contracts/common.md#clear-and-simple-design The function only reads; merging with constructor options is the caller's job.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts The copy stops callers from mutating async-local state.
   * @evidence contracts/common.md#meaningful-documentation The comment explains the defensive copy and the empty default.
   * @evidence contracts/performance.md#efficient-algorithms Constant work: one store read and a shallow copy.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work The copy is cheap and must be fresh to protect the store.
   * @evidenceExclude contracts/performance.md#bound-retention-and-release-resources The function keeps no state after returning; its result is owned by the caller.
   */
  export function current(): IEvidenceTreeSitterAssetOptions {
    return { ...storage.getStore() };
  }

  /**
   * Runs work with inherited asset controls overridden for its asynchronous
   * chain.
   *
   * Nested parser construction inherits the merged controls, while sibling
   * tasks continue to observe the parent scope unchanged.
   *
   * @evidence contracts/common.md#principled-implementation AsyncLocalStorage.run with merged options overrides controls for the closure's chain while siblings keep the parent scope.
   * @evidence contracts/common.md#clear-and-simple-design The function merges and runs; it does not interpret options.
   * @evidence contracts/common.md#prohibited-implementation-shortcuts Overrides apply only to the closure's chain, never globally.
   * @evidence contracts/common.md#meaningful-documentation The comment explains inheritance and sibling isolation.
   * @evidence contracts/performance.md#efficient-algorithms Constant overhead: one shallow merge before running the closure.
   * @evidenceExclude contracts/performance.md#reuse-equivalent-work Each run creates its own scope; there is nothing to share between runs.
   * @evidence contracts/performance.md#bound-retention-and-release-resources The merged store lives only as long as the closure's asynchronous chain references it.
   */
  export function run<T>(
    options: IEvidenceTreeSitterAssetOptions,
    closure: () => T,
  ): T {
    return storage.run({ ...current(), ...options }, closure);
  }

  /**
   * Stores asset controls for the active asynchronous execution chain.
   *
   * This module-level storage carries policy only; importing the scope does not
   * initialize parsers or access the filesystem.
   */
  const storage = new AsyncLocalStorage<IEvidenceTreeSitterAssetOptions>();
}
