---
name: contracts
description: Defines the @evidence checklists every maintained evidence declaration and test answers, and their Evidence configuration wiring. Use when writing or reviewing maintained source or tests, or changing Evidence selection.
---

# Contracts

Each checklist H2 is a question that every selected declaration answers in its doc comment. A package's Evidence configuration selects the checklists; the Evidence check verifies that answers exist, and [review](../review/SKILL.md) checks that they are true and complete.

| Checklist | Asks about |
| --- | --- |
| [common.md](common.md) | Method, design, shortcuts, and documentation of production code |
| [portability.md](portability.md) | Native filesystem, path, and process boundaries |
| [performance.md](performance.md) | Computation cost, reuse, and resource lifetime |
| [testing.md](testing.md) | Behavior, expectations, cases, and execution of every test |

## Answering

1. Before writing, read the declaration and everything its H2 asks about, such as its callees, callers, tests, and platforms.
2. Answer every fact the H2 asks for, from what the code actually does. A partial, generic, or untrue answer is a defect, not a pass.
3. If the code falls short of the question, fix the code, and state any gap that remains instead of claiming the requirement is met.
4. Write `@evidence contracts/<file>.md#<anchor> <reason>` after a blank comment line, and `@evidenceExclude` the same way only for an item that does not apply, never for a whole file.

## Selection

- The Evidence CLI's `list` and `inspect '<target>'` show what a selector reaches.
- For a declaration the adapter cannot address, keep its native doc comment and place its checklist answers and tags on the nearest supported owner shown by `list` and `inspect`.
- Exclude only generated, copied, or dependency material with verified provenance, and omit a pure re-export barrel whose targets span disjoint claims.
- Never narrow a selector or lower a severity to pass the check.
- Record entries the adapter cannot address, such as anonymous callbacks or dynamic registrations, for [review](../review/SKILL.md).

## Editing The Checklists

Every tag cites a checklist path and H2, so adding, renaming, or removing an H2 needs an authorized migration of every answer. Keep one chapter per question.
