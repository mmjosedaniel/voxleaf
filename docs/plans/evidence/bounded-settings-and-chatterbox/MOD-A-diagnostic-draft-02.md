# Source-free diagnostic draft

Target ID: MOD-A-DIAG-02  
Auditor: reused clean_code_auditor (GPT-6.1 Sol high).  
Decision: CHANGE to temporary diagnostic tooling only; no repository source edit.  
Risk: medium. Director accepts the bounded recommendation pending independent
baseline review before the sole worker prepares the observer.

## Evidence and goal

POST05 failed after a compatible Piper snapshot. Three predicates share one
timeout code; the existing output cannot identify which failed. Existing action
and controls tests establish pending/rejection behavior but cannot recover that
run's state. The exported WebDriverClient is patchable through a Node preload;
portfolio subprocesses inherit process-local environment. Observe a fresh attempt
without changing application or harness sources, assertions, timing policy or arms.

## Closed temporary allowlist

- `tmp/mod-a-host-observer/observer.mjs`
- `tmp/mod-a-host-observer/observer.node-test.mjs`

The directory was absent and is ignored by existing repository rules. Maximum
two files and 350 lines. No tracked source changes or third correction loop.

## Required operations and invariants

1. Guard activation by the exact resolved native-startup-smoke.mjs path and its
   adaptive-mode argument. Import the same exported native-webdriver-client module.
2. Observe only the three profile conditions with bounded counters, timestamps
   and last boolean results. Never retain arbitrary script text or per-poll history.
3. Around the existing alternate-click command, read fixed DOM state in the same
   renderer execution, returning the original result. Preserve arguments, receiver,
   original rejection, selection calls, assertions, retries and timeouts.
4. Before deleteSession, emit one final fixed-field DOM snapshot. Diagnostic
   failure must never suppress original cleanup or replace its result/error.
5. Whitelist profile IDs, language, compatibility status, effective-disabled and
   pending booleans, optional state/fixed failure categories. No book/DOM text,
   raw errors, paths, storage, browser logs or private host information.
6. Add meaningful stubbed-client tests for inactive guard, preserved result/error,
   bounded recording and cleanup after failed observation. Use the existing Node
   test runner outside sandbox before any host attempt.

Acceptance of diagnostic tooling is distinct from MOD-A acceptance. Retain POST05
FAIL. Run the unchanged full portfolio with process-local NODE_OPTIONS only after
independent observer review and host prerequisites. An instrumented pass alone
does not establish an uninstrumented pass. Restore NODE_OPTIONS after each run.

Forbidden: repository source/harness/dependency/authority edits, model acquisition,
installed-payload changes, altered assertions/timeouts, Git mutations, or MOD-B.

## Separate host setup

The user explicitly directs completion. Temporary tooling setup is necessary
within that task: restore only the unique exact-interpreter outbound block
`VoxLeaf-MOD-A-Offline`, display name `VoxLeaf TTS Benchmark Offline`, Profile Any.
The rule was verified absent after prior cleanup. Use an ordinary Windows UAC
elevation for that exact operation; never bypass elevation or alter other rules.
Verify ActiveStore before model execution and remove only that unique rule after
all dependent runs. Keep it available while validation is in progress.

The repository-pinned downloader has restored only the task-owned temporary
EdgeDriver. Version 154.0.4258.62, Valid Microsoft signature, SHA-256
`0f4600639201ccd2e84c72c3977ac33c67e19152e197c89eb16a6591d1fbe9f7`.
Preserve global tools. Remove path-verified task tooling after dependent gates.

## Baseline and commands

Independent validator must confirm unchanged source/HEAD/index and inspect the
observer design before writing. Existing immutable POST05 identities and passing
unchanged tests provide source baseline; no redundant full suite is requested.

Diagnostic tooling: `node --test tmp/mod-a-host-observer/observer.node-test.mjs`.
Host attempt: `pnpm.cmd test:tts:bilingual-portfolio-exact-host` unchanged, local
PowerShell outside sandbox with verified offline/model/driver configuration.
