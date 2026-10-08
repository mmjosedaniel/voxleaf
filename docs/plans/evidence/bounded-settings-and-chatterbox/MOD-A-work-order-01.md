# APPROVED WORK ORDER

Order ID: MOD-A-WORK-01
Target ID: MOD-A
Goal: isolate narration configuration orchestration for direct testing without
changing App's behavior or resource ownership.
Risk: medium
Allowed files:

- apps/desktop/src/App.tsx
- apps/desktop/src/App.test.tsx
- apps/desktop/src/settings/narration-settings-actions.ts
- apps/desktop/src/settings/narration-settings-actions.test.ts

Required edits:

1. Add internal stateless `createNarrationSettingsActions` with narrow typed
   collaborators and explicit DEV value; move only profile selection, activation,
   removal, language selection and narration-settings reset from App.
2. Consolidate only the exact nullish stop expression in a private helper. Avoid
   extra asynchronous layers and preserve receiver binding and await boundaries.
3. Keep each App callback's collaborator capture/lifetime and dependency behavior.
   App owns the successful-start-reset notification's Quick/ready/canPersist update.
   Resource creation, subscriptions, cleanup and unrelated callbacks stay intact.
4. Keep App.test.tsx's existing reset integration test and assertions unchanged;
   it proves the existing Settings route still invokes actions. Add meaningful
   direct deferred/rejection tests for the audit's required branch matrix.

Behavior invariants:

1. All eight detailed invariants in [MOD-A-AUDIT-01](MOD-A-audit-01.md) are binding:
   exact parameters/results/receivers/rejections and handler lifetime; nullish stop;
   packaged installed-state gate and DEV bypass; conditional selection refresh and
   shared activation route; refresh after ANY fulfilled removal; sequential reset
   without false short-circuit; absent-coordinator repository status behavior; App
   presentation and all unchanged privacy/resource/locator/default contracts.
2. Playback-reset rejection prevents the fallback notification. Refresh rejection
   follows it. No exception catches, retries, serialization or fallback changes.

Forbidden changes: anything outside allowlist; contracts, dependencies, defaults,
admission/errors, native calls, coordinator decomposition, generated/frozen/historic
authority, normalizers, resource/cleanup ownership, unrelated formatting or weakened
tests. No commit, push, PR, Git mutations, model download or installer mutation.
Diff ceiling: at most four files and 550 added/deleted lines total including tests.
Baseline evidence: [MOD-A-BASELINE-01-20261006](MOD-A-baseline-01.md), PASS,
unchanged identities at HEAD c140d0f2971cd6498fff2728dfa009acd01126f1.
Worker validation: none. Validator owns all checks. Author formatted code without
running broad format commands or modifying other files.

Acceptance commands (local PowerShell outside sandbox, repository root):

1. pnpm.cmd build:packages
2. pnpm.cmd --filter @voxleaf/desktop typecheck
3. pnpm.cmd --filter @voxleaf/desktop test
4. pnpm.cmd format:check:typescript
5. pnpm.cmd lint:typescript
6. pnpm.cmd test:browser
7. pnpm.cmd test:tts:bilingual-portfolio-exact-host
8. git diff --check
9. pnpm.cmd check:portable (package)
10. pnpm.cmd check (final)

The portfolio's same no-flag native-startup-smoke lifecycle explicitly subsumes
standalone test:native-startup; see [gate mapping](MOD-A-draft-01.md). Direct tests
own reset/removal sequencing not covered by the host harness. Actual installed
payload is already corrected with no observed pending migration/repair; bounded
normal inference/cache use is within authorized checks, installation/download/
payload repair is not. Missing prerequisites block acceptance, not an assumed pass.

Completion output: Change Packet only; no commit or push. You are not alone in
the codebase: preserve director documentation and all other edits; stop on source
overlap or ceiling violation. Do not delegate. Director and other writers remain
idle during implementation.
