# Validation Report

Report ID: MOD-A-POST-CHANGE-03-20261006
Target ID: MOD-A
Mode: POST-CHANGE
Verdict: BLOCKED
Environment: local PowerShell outside sandbox, require_escalated, repository root;
Node v24.20.0, pnpm 11.15.1 via process-local Corepack shim PATH.
Validator: configured refactor_validator (GPT-6 Astra high).
Order: MOD-A-WORK-02.
Starting HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1
Ending HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1

Validated paths and before/after identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | ` M apps/desktop/src/App.tsx` | cfdcf0f1a2a816a026c0533e7f7f9ad1c7b5b590a0dde109e7d141f769c5b13b | 65808bbbec4042937f6ee5e08917dea65920c5f8 |
| apps/desktop/src/App.test.tsx | `""` | 8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb | 6a2431df8b78a16ff9995fa47abc82524c48c573 |
| apps/desktop/src/settings/narration-settings-actions.ts | `?? apps/desktop/src/settings/narration-settings-actions.ts` | 8782470007e32e81af7f6b04bd3cd51f878635e410ab9c70664371e327517db5 | d49281f8ad9c336568cc6e56f6d596cd25458ac7 |
| apps/desktop/src/settings/narration-settings-actions.test.ts | `?? apps/desktop/src/settings/narration-settings-actions.test.ts` | 7f3d915c522c3f77fa40d7c2d30e585118e6554d91049428a052890433ae5ab1 | a2f0b6cf72c77128e95a4134bf5be1208d1c8a24 |

Identity recheck: PASS, all paths and HEAD identical after all commands. Index
empty before/after (`git diff --cached --quiet`, exit 0).

## Commands and outcomes

1. `pnpm.cmd build:packages` -> exit 0, shared/EPUB compile.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0; 54 files/581 Vitest tests
   plus 32 Node harness tests pass.
4. `pnpm.cmd format:check:typescript` -> exit 0.
5. `pnpm.cmd lint:typescript` -> exit 0.
6. `pnpm.cmd test:browser` -> exit 0; 7/7 Chromium tests, including Settings
   language/reset wiring, preferences, keyboard, restoration, EPUB opening and
   synchronization presentation.
7. `pnpm.cmd test:tts:bilingual-portfolio-exact-host` -> NOT RUN / BLOCKED. Actual
   installed Chatterbox interpreter has no enabled outbound block, current token
   is not administrator. No UAC, firewall or model action attempted. This is missing
   privileged setup, not an automatic approval rejection.
8. `git diff --check` -> exit 0 after aggregate checks.
9. `pnpm.cmd check:portable` -> exit 0; format/lint/types/generated-contract checks,
   shared 209, EPUB 653, desktop 581, Node 32, Python 386 tests and portable builds.
10. `pnpm.cmd check` -> exit 0; complete format/lint/type/test/build aggregate,
    above counts plus Rust 79 normal and 80 release-locked-runtime tests. Native
    release executable and Python distributions built successfully.

Nonfatal output: Vite ::highlight minification/chunk-size warnings and pytest
inability to write existing nodeids cache. All tests/aggregates exit successfully;
no warning-related repair attempted.

Diff scope: PASS, 568 lines (App 49 added/71 removed, actions 109, tests 339),
three source changes within closed four-path/575-line scope; App.test unchanged.
Director plan/evidence/two documentation indexes are outside source manifest.
Invariant review: PASS for source and deterministic/browser coverage: callback
dependencies and invocation collaborators, receiver/arguments/rejections, nullish
stop, stop-before-mutation, DEV/installed gates and activation, selection/fulfilled-
removal refresh, sequential reset/false aggregation/presentation timing/saved-only
repository fallback, App resources and public/persistence/default contracts.

Untested boundary: no fresh packaged WebView2/model-backed selection, cancellation,
playback or process-cleanup evidence for this patch. The blocked portfolio includes
native-startup, but neither it nor a substitute ran. Aggregate passes do not fill
this gap or authorize accepting MOD-A.

Test-integrity review: PASS, all existing tests byte-identical; 39 meaningful new
direct cases pass, no assertion weakening.
Privacy/artifact review: PASS, no books/audio/models/private data/secrets/generated
source/dependency/unrelated source changes; bounded ignored build outputs only.
No user installation, firewall or Git mutation occurred.
Action required: privileged interpreter-scoped temporary offline setup preserving
existing rules, recheck actual interpreter coverage, then required acceptance
under a new immutable report. No source correction identified. MOD-A unaccepted;
MOD-B must not begin. See [host addendum](MOD-A-host-prerequisites-02.md).
