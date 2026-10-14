# Test Contracts

Answer for every test from its actual assertions and execution path, including cases registered through a shared harness. A passing run is not an answer.

## Behavioral verification

Run the behavior and assert its observable result. Checks of repository arrangement, such as a file existing, a manifest or document containing a string, a workflow having a step, source matching a pattern, or two files agreeing, are not tests; delete them. Restating type members, registry entries or counts, or package allowlists, and asserting `typia.assert`, another dependency's validator, or a test harness, are not tests either.

State the operation exercised, the defect the assertions catch, and the valid behavior they allow.

## Independent expectations

Derive expected values from the supported contract, a specification, or an independent reference, never from the implementation under test or a snapshot of its output.

State that basis, how the assertion would catch a wrong implementation, and any oracle limitation.

## Distinguishing cases

Cover the decisions the test owns with positive, negative, and boundary cases: input that must change and meaning that must stay, an adjacent input where a predicate must not act, and empty, singleton, limit, malformed, and failure cases where relevant. Never weaken assertions or drop cases to save time.

State this test's contribution and the cases another test owns.

## Execution ownership

A test calls maintained logic directly. It never installs a consumer, packs or installs a tarball, spawns the CLI as a subprocess, or runs under a Node test-runner framework. Moving or relabeling a file does not change what it exercises.

State the discoverable entry and who owns dynamically registered cases.
