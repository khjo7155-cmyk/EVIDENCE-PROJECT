import { type ITtscEvidenceRules, evidence } from "@ttsc/evidence";
import type { ITtscLintConfig } from "@ttsc/lint";

export default {
  extends: "../config/lint.config.ts",
  plugins: { evidence },
  rules: {
    "evidence/graph": [
      "error",
      {
        claims: [
          {
            name: "Logic unit tests",
            type: "typescript",
            files: ["src/features/**/test_*.ts"],
            symbol: "function",
            reference: {
              type: "markdown",
              root: "../.agents/skills",
              files: ["contracts/testing.md"],
              symbol: "h2",
              checklist: true,
            },
          },
        ],
      },
    ],
  },
} satisfies ITtscLintConfig<ITtscEvidenceRules>;
