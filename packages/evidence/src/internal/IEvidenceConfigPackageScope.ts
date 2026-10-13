/**
 * Nearest package metadata relevant to the configuration evaluator's module
 * decision.
 *
 * The in-memory evaluator and watch dependency scanner validate this projection
 * while walking upward from a config file. Its module mode determines static
 * import conditions and the format of executable configuration output.
 */
export interface IEvidenceConfigPackageScope {
  /**
   * Node package module mode at this package boundary.
   *
   * The evaluator selects `ESNext` only when this value is `"module"`; omission
   * and every other value retain the CommonJS fallback for an unqualified
   * config.
   */
  type?: string;
}
