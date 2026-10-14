import { type ITtscEvidenceRules, evidence } from "@ttsc/evidence";
import type { ITtscLintConfig } from "@ttsc/lint";

export default {
  extends: "../../config/lint.config.ts",
  plugins: { evidence },
  rules: {
    "evidence/graph": [
      "error",
      {
        claims: [
          {
            name: "TypeScript production declarations",
            type: "typescript",
            files: ["src/**/*.ts"],
            symbol: ["type", "function"],
            reference: {
              type: "markdown",
              root: "../../.agents/skills",
              files: ["contracts/common.md", "contracts/performance.md"],
              symbol: "h2",
              checklist: true,
            },
          },
        ],
      },
    ],
  },
} satisfies ITtscLintConfig<ITtscEvidenceRules>;
