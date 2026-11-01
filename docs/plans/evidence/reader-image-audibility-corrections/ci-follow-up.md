# PR #295: wait for settled Stop before stale resume rejection

Starting HEAD: `fd36c2cd03e9fd2cb53b5f6a70afd70d7ac9ce9d` on
`codex/reader-image-audibility-plan`; worktree and index initially clean.
This follow-up preserves the completed ExecPlan and original acceptance receipts.
The user's CI correction request continues the authorized implementation,
validation, commit and PR update; merge remains outside scope.

## Reproduction and cause

[Windows job 125000043679](https://github.com/mmjosedaniel/voxleaf/actions/runs/41357311657/job/125000043679)
passed 46 Chromium cases and failed RIA-03: the test expected narration phase
`stopped`, but the observed settled phase was `idle`, with service `stopped`,
failure `none`, inactive intent and zero retained audio. The later native and
foundation steps were skipped; this run does not establish their outcome.

`ProductNarrationCoordinator.#performStopActiveRun` publishes a stopped player
during teardown, then clears the scheduler/player after verified cleanup.
`ProductNarrationControls` presents absent state as `idle` and enables fresh
Play. The original test raced this transition and could accept the transient
phase locally. The failure is an incorrect test observation, not a demonstrated
runtime cleanup regression.

Local `browser-red` adds only a wait for fresh Play before delivering the stale
resume rejection, retaining the old `stopped` assertion. It reproduces the same
expected/actual mismatch. Its source, log, screenshot and trace are retained
under ignored `tmp/evidence/ria-ci-follow-up/`, along with the original CI log.

## Bounded correction

The existing RIA-03 case waits for successful teardown, delivers the obsolete
device rejection, then requires exact `idle`, service `stopped`, failure `none`,
operational recovery and enabled Play. It still requires every created audio
context to close. All pending-start, highlight, persistence and resume-duration
assertions remain intact. No regex accepting both phases, retry or timeout
increase is used. Production code, fixtures, DSP, dependencies and architectural
boundaries are unchanged; no native build or model rerun is needed for this
browser-test-only correction.

## Validation

All local checks execute in normal PowerShell outside the managed sandbox with
Node 24.20.0 and pnpm 11.15.1. `run-gate.ps1` retains command, time, exit status,
HEAD, source inputs and generated package/renderer identities per invocation.
Fresh installed-input captures bind the local dependencies and browser.

| Receipt | Command | Result |
| --- | --- | --- |
| browser-red | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep RIA-03` | exit 1, expected stopped / received idle after confirmed cleanup |
| browser-final | `pnpm.cmd test:browser` | exit 0, 47/47 Chromium cases, including corrected RIA-03 |
| static-final | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/desktop typecheck` | all exit 0 |

The failed hosted browser group justifies renewing all 47 local Chromium cases.
The strict installed comparison exits 1 because Chromium appends its existing
`chromium_headless_shell-1248/chrome-headless-shell-win64/debug.log`. Both full
captures and `installed-delta.json` preserve that result: all other 24,008
entries, membership and environment metadata are identical. The sole changed
entry is generated diagnostic output, not an input to the test. No dependency
or tool was installed or updated. Later maintained-index and follow-up Markdown
changes are outside the browser/static consumed inputs; the tested spec remains
byte-identical. Documentation checks run separately before review.

Historical runtime PASS results do not validate this changed test. Original
native/product receipts remain historical and are not recast as new CI results.
The updated PR must obtain its own hosted checks after publication.

Independent exact-patch assessment is recorded in [the CI review](ci-review.md).
It reviews the test's changed acceptance assertion and host evidence without
editing files or running tests. No remote-green claim is made before completion.
