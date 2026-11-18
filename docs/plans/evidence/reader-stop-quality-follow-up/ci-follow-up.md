# PR #325 CI follow-up

<!-- Privacy redaction. Repository account links are recorded as their original reference IDs. -->

Base and HEAD before this patch are `d912f20fcca7e993ccdf47b78d118c3ef019a4de`
on `codex/revalidated-findings-execplan`. The initial tree/index were clean.
This bounded correction changes two desktop test files and their documentation;
it does not change production behavior, a frozen authority, or a completed plan.
The independent result and terminal identity checks are recorded in
[CI review R01](ci-review-r01.md) and [CI closeout R01](ci-closeout-r01.md).

## Original failures and correction

Foundation run 43992357344
failed on the PR merge of this head. Ubuntu reached six failures in
`product-narration-coordinator.test.ts`. Windows stopped earlier with an HTTP
504 downloading the pinned NSIS archive. Its SHA-256 check remains required;
no workflow or integrity rule is relaxed. The new commit will start a fresh CI
run. Rust and production dependency graphs passed on the original PR revision.
These outcomes do not establish success for the corrected revision.

**VF-0074 test callers.** BNC-01's available/unavailable/Stop variants, NLC-02
and NCC-01's 100/75-percent variants called an unmarked passive save while
describing manual reading. The real reader passes `measuredManual` through App;
the protected save owner rejects an unmarked sample after a heard checkpoint.
Each test now first asserts rejection of that sample, then supplies measured
manual intent. Original persisted-locator, restore, completion and next-Play
assertions remain. These are modeled coordinator/storage tests, not new proof
of real gesture delivery or a replacement for the historical mounted regression.

The follow-up's selected desktop command covered persistence, active visual
locator and App suites but omitted this direct coordinator consumer. That
selection gap is demonstrated by the retained ledger; the reason the omission
was not caught in review is unknown. This CI issue does not reproduce lost
product progress and does not reopen the product finding.

**VF-0088 test fixture.** Once Vitest passed, the configured desktop Node phase
exposed three additional failures before the probe's assertions. The tests
passed `path.resolve(".")` as the repository root, which works from the checkout
root but points to `apps/desktop` under the package script. The probe then could
not import `packages/epub/test-support/epub-fixture.ts`. Both test calls now use
the test module's location, matching the production host's existing approach.
Matching, export-mismatch and cancellation-retention branches reach their
original assertions; wrong source/artifact/kind/OS-error rejection remains.
The prior root-directory execution did not cover the configured package cwd.
No live download or installed journey is claimed by these controlled tests.

## Local checks and evidence boundaries

All executions use normal local PowerShell outside the managed sandbox, pinned
Node 24.18.0 and pnpm 11.15.1 with existing locked dependencies. Raw logs are
retained under ignored `tmp/evidence/pr325-ci/`. Failed attempts are retained.

- RUN, failed invocation — the initial Vitest name filter containing `|` was
  misinterpreted through `pnpm.cmd`; it did not run the selected tests.
- RUN, RED — `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts`;
  exit 1, six failures and 229 passes, reproducing the reported assertions.
- RUN, mixed result — `pnpm.cmd --filter @voxleaf/desktop test`; all 62 Vitest
  files and 1,373 tests passed after the manual-input correction. The subsequent
  Node phase failed with 268 passes and three fixture-path failures. The whole
  aggregate is **not** a PASS.
- RUN — from `apps/desktop`, `node --test scripts/native-webdriver-client.node-test.mjs scripts/bilingual-portfolio-host.node-test.mjs scripts/ordinary-chatterbox-release-host.node-test.mjs scripts/windows-release.node-test.mjs scripts/tts-adapter-layout-host.node-test.mjs scripts/native-smoke.node-test.mjs scripts/acquisition-file-barrier.node-test.mjs`;
  exit 0, all 271 tests pass, including native installer/ownership checks.
- RUN — `node --test --test-name-pattern=FSF-VF-0088 apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs`
  from the repository root; exit 0, eight passing tests including the parent
  file result. This preserves the previously supported invocation context.
- RUN — `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`,
  `pnpm.cmd typecheck:typescript`, `pnpm.cmd check:evidence`, `git diff --check`.
  Formatting/lint repeat after the later Node test edit.
- REUSE within this task — Vitest's 1,373 passing assertions and TypeScript
  types from the mixed run/static checks. The later `.node-test.mjs` file is
  outside Vitest discovery and TypeScript's explicit include list; no source,
  Vitest test, fixture, configuration, dependency, tool, environment or resource
  input to those successful checks changed. This is not reuse of the failed
  aggregate or a historical behavioral acceptance.
- NOT-APPLICABLE — new application packaging/lifecycle, browser, Python/Rust,
  GPU, acoustic and live-download validation for this test-only patch. Existing
  package receipts are not renewed. Remote CI will execute its configured gates.

The next action is independent review, exact-path commit/push under the user's
PR authorization, then inspect the replacement CI. A new remote failure requires
its own diagnosis; a prior green job is not acceptance of a different head.
