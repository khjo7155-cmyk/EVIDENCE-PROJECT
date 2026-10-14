# AGENTS.md

`evidence` is a standalone Evidence Graph checker in TypeScript on upstream Tree-sitter WASM. The pnpm workspace holds the published package in `packages/evidence` and its logic unit tests in `test`.

Never fork the parser engine, or import a language compiler to cover a syntax case an adapter misses, without a product decision. Use the official `web-tree-sitter` and pinned upstream grammars through the common adapter contract, and record a needed grammar fix with its owner.

## Attitude

- Do the literal request, widening it only when the user hands that over.
- The user's instruction outranks any skill.
- Answer a question from the user before continuing any work.
- Write everything the user sees in the user's language.
- Write code, comments, commits, issues, and pull requests in English.
- Let a test run, CI run, or review round finish, then fix all of its findings together by cause.
- Do the work yourself; use subagents only when the user asks.
- Delete every scratch file once it has served.

## Finishing Work

A message without a tool call ends the turn. While work remains, do not end it with:

- a summary that announces the next step;
- an offer to continue;
- a list of decisions that do not block the work;
- a report because a stage finished;
- a wait on background work.

Put status notes in the same message as the next tool call.

Stop only when nothing can move without the user, a protected target blocks you, or a destructive or outward-facing action needs confirmation.

## Skills

Read the skill whose trigger applies.

- [contracts](.agents/skills/contracts/SKILL.md): writing or reviewing maintained source or tests, for their `@evidence` checklists.
- [development](.agents/skills/development/SKILL.md): changing code, tests, scripts, or workflows.
- [evidence-graph](.agents/skills/evidence-graph/SKILL.md): changing graph semantics, configuration types, adapters, grammars, or diagnostics.
- [prompting](.agents/skills/prompting/SKILL.md): changing `AGENTS.md`, `CLAUDE.md`, or a skill.
- [documentation](.agents/skills/documentation/SKILL.md): writing any document or doc comment.
- [review](.agents/skills/review/SKILL.md): any review or self-review.
- [issue-campaign](.agents/skills/issue-campaign/SKILL.md): a broad audit or repeated issue-to-pull-request work.
- [pull-request](.agents/skills/pull-request/SKILL.md): only when asked to push, open, update, or merge, or under a delivery mandate.
