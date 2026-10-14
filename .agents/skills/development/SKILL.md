---
name: development
description: Repairs, implements, tests, and validates evidence source, tests, scripts, workflows, and package wiring. Use before editing any of them; acknowledgments belong to contracts and graph semantics to evidence-graph.
---

# Development

## Contracts

Every maintained declaration answers, in its doc comment, the [contracts](../contracts/SKILL.md) checklists its package selects:

- production types and functions: [`common.md`](../contracts/common.md) and [`performance.md`](../contracts/performance.md);
- tests: [`testing.md`](../contracts/testing.md).

## Code

- Implementation and tests are TypeScript, compiled by `ttsc` and executed by `ttsx`. `scripts` holds plain CommonJS JavaScript run by Node, with no tsconfig or lint configuration.
- Packages are CommonJS, with no `type: "module"` or engine constraint. Workspace `main` and `exports` point to `./src/index.ts`; compiled entries, declarations, and the CLI bin belong only in `publishConfig`.
- Importing the package never starts the CLI, scans a project, or evaluates configuration. Executables stay small and hold no reusable logic.
- Every object shape is a named interface in its own file. Never write an anonymous object type literal, including in a union member, intersection, annotation, generic argument, or assertion. Evidence-prefixed types follow the base-interface and artifact-specific structure of `D:/github/samchon/ttsc/packages/evidence`.
- Annotate every new or changed variable, destructured binding, class field, parameter, callback, and return value with its named contract. Type a `for...of` iterable instead of its binding, keep catch values `unknown` until narrowed, and never substitute `any` or an assertion.
- Declare named functions with `function`. Use asynchronous filesystem and process APIs, and keep pure computation synchronous.
- Check runtime shapes with `typia`, never a hand-written validator. Use constant `Singleton` and `VariadicSingleton` instances initialized inside their callbacks, and put a namespace's exported members before its internal ones.
- Each project's `lint.config.ts` extends `config/lint.config.ts`, which keeps every enabled rule at error. Fix a violation instead of weakening the configuration.
- Dependency versions live in the `pnpm-workspace.yaml` family catalogs (`samchon`, `typescript`, `tree-sitter`, `utils`); manifests use `catalog:<family>` or `workspace:`. Add no pnpm policy option. `typescript` and `ttsc` stay required peers, `@ttsc/lint` and `@ttsc/evidence` stay development dependencies, and compiler dependencies stay in the workspaces that use them.
- Update the root README in the same change as the behavior it describes.
- Tests, fixtures, CI, wiring, dependencies, and pinned grammar records are specification. Change them only on request or for a product reason, and say so.

## Task Guides

- Read [Repair](repair.md) when changing existing behavior.
- Read [Testing](testing.md) when adding or changing tests.
- Read [Validation](validation.md) before running checks or preparing a change for CI.
