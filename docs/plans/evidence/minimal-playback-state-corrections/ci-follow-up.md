# PR #291 CI follow-up

This record follows the completed PSC plan without rewriting its historical
receipts or acceptance. Base: `91f17ab6e393f61d4bd97815c9ad1baa14b6b751`.
The maintainer authorized corrections, local validation, commit and push until
the PR checks pass. Merge is not authorized.

## Observed failures

[Foundation run 41251601002](https://github.com/mmjosedaniel/voxleaf/actions/runs/41251601002)
failed in two independent jobs:

- Ubuntu portable: 1,050 desktop tests passed; three `App.test.tsx` cases failed.
  RAC-01's two mounted-locator cases and VCA-05's successful replacement case
  still spied on `start()`. PSC-03 now dispatches `startAtVisibleLocator()`.
  The test double implements that method as a no-op. This was omitted from the
  original directed validation selection.
- Windows native: all 41 Chromium tests and the desktop build passed, then the
  native harness reported `WebDriver startup [unexpected-error]`. The run
  uploaded no artifacts; raw driver output is deliberately discarded. The
  reported stage also encompassed initial child-process ownership capture.
  The original log does not establish the underlying host failure or successful
  cleanup. It must not be labelled a confirmed transient failure.

The original logs are retained locally under ignored
`tmp/evidence/psc-ci-follow-up/original-{windows,ubuntu}.log`.
One Windows-only hosted retry was requested after the unmodified ordinary
native smoke passed locally. Its result is separate from the original failure.

## Bounded corrections

The three App cases observe the current visible-start entry point, retain the
exact B offsets and A-to-B-to-C shutdown conditions, and additionally reject a
call to internal `start()`. No assertion is removed or relaxed.

The native harness now reports fixed codes for cleanup and process-ownership
failures and includes nested aggregate/cause codes. It inspects at most eight
errors, deduplicates codes, tolerates cycles and never prints raw error messages.
The initial ownership capture has its own stage. This corrects lost diagnostics;
it does not by itself establish or repair the original hosted startup cause.
Process identity checks, cleanup, deadlines and native acceptance assertions
remain unchanged. Application playback, renderer, CSP, dependencies and
architecture do not change.

## Local validation

All commands below ran in normal local PowerShell outside the managed sandbox,
using Node 24.18.0 and pnpm 11.15.1. The ignored `run-gate.ps1` records exact
commands, exit status, source SHA-256, installed metadata and generated exports
with each receipt in `tmp/evidence/psc-ci-follow-up/`.

| Receipt | Command | Result |
| --- | --- | --- |
| `app-before` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx` | Reproduced exactly three failures; 75 passed. |
| `app-after` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/tts/ProductNarrationControls.test.tsx` | 93 passed. |
| `diagnostic-before` | `pnpm.cmd --filter @voxleaf/desktop exec node --test --test-name-pattern=PSC-CI scripts/native-smoke.node-test.mjs` | Two regressions failed because the original classifier returned only `unexpected-error`. |
| `native-node-after` | `pnpm.cmd --filter @voxleaf/desktop exec node --test scripts/native-smoke.node-test.mjs scripts/native-webdriver-client.node-test.mjs` | 65 passed, including real Windows child ownership, cancellation and cleanup. |
| `diagnostic-final` | Same two-test `PSC-CI` command | Two passed after strengthening the explicit eight-error limit assertion. |
| `final-directed` | The App/control Vitest command followed by the two-file native/client Node command above | Final grouped validation: 93 + 65 passed on the final source/test patch. |
| `static-final` | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/desktop typecheck` | All passed. |
| `native-before`, `native-after` | `node apps/desktop/scripts/native-startup-smoke.mjs`, through the identity/cleanup wrapper | Both ordinary WebView2 runs passed; zero new owned processes or scratch roots. |

The native executable is the current PSC renderer artifact, SHA-256
`09e69a0f47531c2df9952b1a92a2bf09ae814bafca376c84c3b1e6162ed48932`.
Its hash is checked against the PSC build receipt before and after each run;
this follow-up changes no executable input. Existing adjacent resources and
pre-existing scratch directories are preserved. No generated audio, books,
model weights or raw logs are committed.

No partial test result is reused for final acceptance: `final-directed` renews
the selected group after the final assertion change. No dependency installation
or tool update occurred. The original scoped PSC receipts are historical
context, not substitutes for the commands above.

Additional model matrices, Piper packaging, installers and full local suites
are not applicable to these test/harness-only changes. Hosted checks remain
required on the pushed commit. Independent review is recorded separately;
neither a local PASS nor a diagnostic correction asserts that CI is green.
