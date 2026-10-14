---
name: contracts
description: Defines the @evidence checklists every maintained evidence declaration and test answers, and their lint.config.ts wiring. Use when writing or reviewing maintained source or tests, or changing Evidence selection.
---

# Contracts

Each checklist H2 is a question that every selected declaration answers in its doc comment. Each workspace's `lint.config.ts` selects the checklists through the `@ttsc/evidence` rule `evidence/graph`; `ttsc` reports every unanswered item as a compile error, and [review](../review/SKILL.md) checks that the answers are true and complete.

| Checklist | Asks about |
| --- | --- |
| [common.md](common.md) | Method, design, shortcuts, and documentation of production code |
| [performance.md](performance.md) | Computation cost, reuse, and resource lifetime |
| [testing.md](testing.md) | Behavior, expectations, cases, and execution of every test |

## Answering

1. Before writing, read the declaration and everything its H2 asks about, such as its callees, callers, tests, and platforms.
2. Answer every fact the H2 asks for, from what the code actually does. A partial, generic, or untrue answer is a defect, not a pass.
3. If the code falls short of the question, fix the code, and state any gap that remains instead of claiming the requirement is met.
4. Write `@evidence contracts/<file>.md#<anchor> <reason>` after a blank comment line, and `@evidenceExclude` the same way only for an item that does not apply, never for a whole file.

## Selection

- `packages/evidence` selects production `type` and `function` declarations against `common.md` and `performance.md`; `test` selects `test_*` functions against `testing.md`.
- A selector that reaches nothing reports no error. After changing one, remove a single answer and confirm `ttsc` reports that host.
- For a declaration the adapter cannot address, keep its native doc comment and place its checklist answers and tags on the nearest supported owner the diagnostics name.
- Exclude only generated, copied, or dependency material with verified provenance, and omit a pure re-export barrel whose targets span disjoint claims.
- Never narrow a selector or lower a severity to pass the check.
- Record entries the adapter cannot address, such as anonymous callbacks or dynamic registrations, for [review](../review/SKILL.md).

## Editing The Checklists

Every tag cites a checklist path and H2, so adding, renaming, or removing an H2 needs an authorized migration of every answer. Keep one chapter per question.
