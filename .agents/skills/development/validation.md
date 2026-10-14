# Validation

Prove a change first with the narrowest test that fails without it, then run `pnpm build` and the affected tests with `pnpm start --include <filter>`. Never run the full suite locally; `test.yml` owns it. `pnpm build` owns type and lint checks, so add no separate typecheck command.

Keep `build.yml` and `test.yml` independent single-Ubuntu workflows: no OS matrix, no test dependency on the build, and no build prepended to `pnpm test`. Package compilation belongs in `build` and `prepack`, never an install-time `prepare` hook.

Inspect package metadata and preparation scripts directly instead of creating installation experiments. Report a check that could not run, with its command and the limitation.

Run `pnpm format` once during final preparation for merge. Fix any later defect without running it again.
