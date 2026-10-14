# Testing

Every test is a logic unit test in the `test` workspace that calls maintained source directly. The [test contracts](../contracts/testing.md) define the evidence every test must provide.

## Layout

A test is one exported `test_<behavior>` in `test/src/features/<category>/test_<behavior>.ts`. `test/src/index.ts` discovers it through `@nestia/e2e`'s `DynamicExecutor`, and it asserts with `TestValidator`. Keep one test workspace, `test`, never a second `tests` tree, and reuse `test/src/internal`.

## Test Conventions

- Start each test with a JSDoc summary, a paragraph on its purpose, and numbered steps naming the initial state, action, and expected outcome, with sublists where one step checks several outcomes. Claim only what the assertions exercise.
- Create files and directories only under the gitignored `test/.tmp`, through `EvidenceTestFileSystem.experiment(location, records, closure)`, `save`, and `erase`. Write multiline source fixtures with `dedent` from `@typia/utils`.
- Obtain pinned grammars through `EvidenceTestParserAssets`, which keeps them in memory for the test process.
- Use English file and directory names. Unicode belongs in content and identifiers only when the test verifies it.
- Read a type's literal values through typia reflection instead of restating them.
