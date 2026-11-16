# Four-pass corrections execution

The work started with a clean tree and empty index on
`codex/four-pass-findings-corrections-plan` at
`df0109b0cefb50394e55eed10f2065140de837ec`.

The early execution observations below retain the pending states at the time
of each run. The gate table and R02 evidence record the accepted results.

U1 initial runs used normal local PowerShell, Windows, Python 3.12.10 and
pytest 9.1.1, with the existing locked environment and `uv run --no-sync
--locked --project services/tts pytest`. Each path below is relative to
`services/tts/tests/`.

| Scope | Selector and observation |
| --- | --- |
| VF-0065 | `test_benchmark_batch_cli.py -k vf0065` exited 1. Failed JSON decoding returned the expected error but had removed the original raw input. The corrected full CLI file passed 14 tests. |
| VF-0069, VF-0070, VF-0073 | `test_benchmark_v14_authority.py -k 'known_failure or cpu_admission' --tb=short` exited 1 with three failures. Unproved playback and privacy retained passing audit flags, and committed counts without causal stop evidence admitted CPU. The corrected full authority file passed 10 tests. |
| VF-0073 | `test_benchmark_batch_official.py -k vf0073 --tb=short` exited 1. Injecting a typed adapter privacy failure through the actual measured controller produced generic generation failure. The correction preserved the closed code in the combined run. |

The interim U1 union passed 125 tests. The expanded union passed 128 tests,
exit 0, with a pytest cache write warning. Both used the plan's eight G-PY
files and the invocation prefix above with `--tb=short`. The expanded run
covers real authority rejection and retry of the same session, removal before
success output, full producer overflow with a synthetic clock, and a spawned
measured child with redacted diagnostics and verified reap. It binds the
command, result and captured inputs to ignored receipt `u1-final/receipt.json`
under `tmp/evidence/four-pass-findings-corrections/`. The earlier invocations
are observations from the execution tool; they do not have a separate complete
input capture. No historical run was credited toward acceptance. The scoped
Ruff format check flagged three Python files. Formatting, static validation
and independent acceptance are pending.

U2 is partial. The focused VF-0059 Node regression exited 1 before the change
because missing cleanup confirmation still permitted restoration. It passed
after the production launcher began forwarding receipt and terminal outcome
to the finalizer. The test uses actual synthetic Node children. It checks
positive, negative and missing receipt cases. The other U2 cases, the final
release suite and independent acceptance remain pending when U2 was interrupted.

For U3, the original three targeted Vitest files failed five assertions
selected with `-t 'VF-006[014]'`. Both public navigation formats rejected
the exact-length padded label, both article gaps duplicated the article, and
implicit direction differed from explicit direction. The first corrected
run still loaded pre-build exports in the public narration test. After
`pnpm.cmd run build:packages`, all eight plan G-EPUB files passed
(574 tests). Chromium also passed the selected VF-0064 test from
`reader-reflow-restoration.smoke.spec.ts`, comparing computed RTL direction
and caret geometry after opening and reopening from a seeded position.
Live visual-position persistence and native direction coverage remain pending.

For VF-0058, the mounted App Vitest regression failed under both response
orders before correction. The first corrected run reached the explicit Play
assertion, where the fixture observed the coordinator's internal method
instead of the UI's `startAtVisibleLocator` entry point. After correcting that
fixture, `src/App.test.tsx src/tts/optional-chatterbox-client.test.ts
src/tts/OptionalChatterboxControls.test.tsx` passed 152 tests using
`pnpm.cmd --filter @voxleaf/desktop exec vitest run`. The cases assert one
refresh, no autoplay and a successful explicit Play dispatch. The adjacent
client cases assert no completion when cleanup fails.

For U5, `src/tts/pcm-playback.test.ts -t 'VF-006[26]'` failed three assertions:
two full-sized arrays were allocated, and automatic refill released early
for both selection and fallback. The three-file playback, scheduler and
coordinator group passed 344 tests after correcting both causes. The real
browser worklet/recovery continuation check remains pending.

The U6 Piper ES preflight first returned configuration unavailable without
the profile and offline environment set. A process-local configuration using
the existing interpreter, model and network isolation passed the same preflight.
The RED used the then-current earlier-unit input tree and the original
ReaderPublication modifier guard. The native runner created controlled
placement unavailability, restored ordinary geometry and verified trusted
Shift+Space on the focused article moved the viewport upward. Play remained
disabled and the route exited 1 at the named VF-0063 stage. This first probe
measured from before WebDriver dispatch. The rebuilt candidate admitted
Shift+Space with existing target and selection guards. Its selected Piper ES
native route exited 0 and verified recovered Play and audibility. The same
route reported no external requests and balanced audio-context creation and
release. Its captured inputs, exits and logs are in `u6-red/` and `u6-green/`.

The first Ctrl+Home probe reached disabled Play after movement. The first
Ctrl+End probe had a negative total delta despite a trusted keydown. Both
initial Ctrl probes measured the setup-to-result displacement, so the check
was tightened to capture the viewport position inside the trusted keydown
listener. Both tightened Ctrl probes then reproduced desired displacement
after keydown and timed out waiting for Play to recover. These two reports
are in `u6-control-red/` and `u6-measured-control-red/`.

The final Reader change admits the three exact observed chords. The final
dev binary passed focused native Shift+Space and Ctrl+Home with the
keydown-anchored measurement, explicit Play and audible range containing
the saved visual position. Ctrl+End restored Play but the first stricter
continuation check compared with a visual checkpoint while the viewport
was still moving. With the same binary, measuring scroll stability before
the save passed that comparison for Ctrl+End. The logs are in
`u6-all-chords-green/` and `u6-settled-caret/`. Chromium inspected the first
prepared range directly and checked containment of the recovered visual
locator for all three chords. This separates the direct prepare observation
from native audible-range containment.

U2 resumed. The VF-0067 Node fixture failed on the source-path ownership
assertion before the change. The run-owned copy, matching bytes and basename,
and post-containment cleanup passed with VF-0059 and the previous missing-helper
recovery control. The two separate VF-0068/VF-0072 synthetic evidence writer
controls failed with missing rejections. The corrected writer and production
PowerShell command handoff with stubbed build/authenticode operations passed
the five selected assertions. The combined Node gate initially passed 148 of
150 cases. Its two failures were isolated saved-rate test doubles which
intercepted the new preceding keyboard setup. The focused corrected tests
passed, and no native production scenario changed in that correction.

The package wrapper verified the existing Piper core and created the unsigned
installer. In the first two attempts Windows PowerShell could not autoload
its Authenticode module during finalization. The second attempt used a
process-local default module search path. The standalone explicit import
resolved the cmdlet. Calling the official script from System32 Windows
PowerShell after that explicit import completed the current build, evidence
handoff, checksum and `pnpm.cmd package:windows:check`, exit 0. The source
remained unchanged between host attempts. Historical tracked release evidence
was restored byte-for-byte. Logs are under `g-release/`,
`g-release-host-modules/` and `g-release-security-module/` in ignored evidence.
The first bounded installer smoke stopped before mutation because its helper
required an absent profile. Normal-host checks established eligibility for
the supported production backup and restoration flow. The bounded actual
installer smoke exited 0.
It installed the unsigned candidate via the ordinary run-owned copy, checked
the installed executable against the loose build with only its Tauri bundle
marker mapped from UNK to NSS, then uninstalled and restored the original
profile. The private restoration checks and source installer hash matched.
The smoke stopped before optional download and inference.

The final desktop union passed 626 tests in 11 files. The selected
Chromium subset passed three cases for adjacent worklet, keyboard and seeded
direction restoration. The strengthened VF-0066 real worklet test passed the
actual exhaustion and refill trigger with controlled synthesis delivery. It
observed one underrun, no restart at 45 seconds after selecting 1x, and one
additional device start at 60 seconds. An initial visual direction save
fixture did not observe a persistent wheel position. The corrected VF-0064
fixture verified trusted End and Home displacement, flushed the actual
visual save through the lifecycle and matched the RTL caret geometry and
saved position after reopening. This test passed. Python formatted the three files
identified by the first check, passed the affected Ruff check and passed the
configured mypy invocation from the service directory (189 source files).
The renewed Python behavior union passed 128 tests. The preliminary mypy
invocation from the repository root used the wrong source-discovery context
and also exposed two U1 type errors, corrected before the official-directory
check. All invocations ran on normal local Windows PowerShell.

No historical behavioral result is used as current acceptance. The existing
Piper model/core were reused as verified inputs. The canonical diagram's
existing ownership, inference and persistence boundaries still apply.
The release ownership correction adds a private local build receipt, with
no new distributed payload or product/runtime edge.

| Findings | Current candidate behavior observed |
| --- | --- |
| VF-0058 | Mounted App recovered after original download completion in both response orders. No autoplay, explicit next Play and cleanup-failure controls passed. |
| VF-0059 | Real synthetic children proved positive, negative and missing containment receipt handling. Verified cleanup still permits restoration when the smoke assertion fails. |
| VF-0060 | Public EPUB2 and EPUB3 open at the exact retained label limit with literal and entity suffix padding. Substantive overflow was rejected and attribute budget controls passed. |
| VF-0061 | Public Spanish preparation produced one article for the two reported separators. Exact source ranges and earlier separators passed in the same matrix. |
| VF-0062 | Direct 1x allocated one full device store for an unaligned maximum unit. Partial-offset and WSOLA controls passed. |
| VF-0063 | WebView2 measured actual trusted motion and recovered audible reading after the three modified chords. Chromium confirmed first prepared anchor and range on explicit Play. The upward Shift case can legitimately prepare the first segment at offset zero, so its scoped assertion uses containment. Existing PageDown and nonzero downward controls retain their original assertions. |
| VF-0064 | Implicit and explicit RTL match in projection, Chromium direction and caret geometry. Actual visual save and reopen recovered that position while inline-only direction remained local. |
| VF-0065 | The v14 CLI preserves inputs after rejected reading or authority validation. Retry of the same corrected session deletes it before success. |
| VF-0066 | The actual browser Worklet registration and deterministic rate-failure controls prevented an early restart. Refill resumed at sufficient lead and kept one underrun. |
| VF-0067 | The synthetic journey proved private copy ownership and the actual unsigned journey verified install, teardown and restoration using production owners. |
| VF-0068, VF-0072 | Synthetic input checks reject mismatched build authority and missing or conflicting fresh artifact verification. The actual unsigned build validated the PowerShell-to-Node handoff and checksum. Signed, scanned and optional receipt journeys remain separately scoped. |
| VF-0069 | Real producer logic with model-free timings hit invalid playback. The v14 output kept bounded retention unproved and rejected a contradictory direct summary. |
| VF-0070 | Version and commit controls still reject conclusions without the necessary proof, including a committed aggregate memory signal without attribution. No positive successor admission is introduced. |
| VF-0071 | Excluded by plan; no ordinary-workflow correction attempted. |
| VF-0073 | A spawned synthetic worker exercised redacted diagnostics, the measured controller preserved the code, and summary and direct validation denied a passing privacy audit. |

| Gate | Current result | Scope and retained evidence |
| --- | --- | --- |
| G-PY | 130 passed in R02 | Exact eight-file command and before/after receipt below. Earlier `g-python.log` and `u1-final/` describe their own snapshots. |
| G-NODE | 93 passed in R02; 59 native fixture cases previously passed | The renewed ordinary journey and release fixtures bind their commands and inputs under `r02-b1/`. R02 did not change native fixture inputs. |
| G-EPUB | 574 passed in R02 | Eight selected files with the current generated package exports captured in `r02-epub/`. |
| G-DESKTOP | 626 passed | Eleven selected files after all Reader changes. `g-desktop-final/receipt.json` binds the exact inputs and log. |
| G-BROWSER | Focused passes | `g-browser.log` contains the three adjacent checks. `g-browser-keyboard-final.log` records Ctrl+Home, Ctrl+End, refill and visual RTL save/reopen passes. The initial Shift+Space assertion rejected an otherwise valid first-segment offset of zero. `g-browser-shift-refinement.log` records its scoped retry with unchanged anchor and range containment assertions. |
| G-NATIVE | Three selected Piper ES chord checks passed on the final harness | R02 renewed Shift+Space and Ctrl+Home on the retained current dev binary. Current Ctrl+End is in `u6-settled-caret/` with the same binary and settled-caret harness. |
| G-RELEASE | Local unsigned build, package check, install, startup and restoration passed | `g-release-final-reader/` records the final Reader build. `r02-installed-startup/` records actual startup of the installed candidate, positive process containment, uninstall and profile restoration. Signed artifacts, separate Defender scan, optional downloads and inference were not selected. |
| G-STATIC | Affected formatting, lint and types passed | `g-static-frontend.log`, `g-static-python.log` and `g-static-reader-final.log`. `pnpm.cmd check:evidence` and `git diff --check` passed. Rust source and tooling checks were not selected because the corrections do not change Rust sources or contracts. Relevant native builds completed. |
| G-REVIEW | R02 approved | R01 documented five evidence gaps. R02 approved the renewed exact implementation and evidence. [R01](review-r01.md) · [R02](review-r02.md) |

## R02 evidence and commands

The R02 patch adds regression assertions in three test files. Production owners,
runtime configuration, generated frontend inputs and retained binaries did not
change relative to the R01 candidate. All R02 validation ran in normal local
PowerShell. Paths below are relative to the repository root unless prefixed by
the ignored evidence root `tmp/evidence/four-pass-findings-corrections/`.

- **B1 — release regressions.** The previous implementation owners were copied
  into a disposable fixture tree and exercised against revised fixture tests.
  In VF-0067, the install callback read the wrong inert fixture bytes with or
  without restoring the source before its later observation. In VF-0068, the
  baseline accepted a changed authority file. Current code rejects that input,
  preserves the earlier evidence and checksum, and accepts the restored input.
  In VF-0072, the inert artifact was mutable during the baseline PowerShell
  handoff. The current handoff denies the fixture write while the file is held
  and validates the unchanged-path evidence and checksum.
  `r02-b1/baseline-command.json`, `baseline-inputs.json`, `baseline.log` and
  `baseline.exit.txt` preserve the selected failures. The current paired command
  passed all 93 tests, exit 0, with equal inputs in `r02-b1/receipt.json`.

```powershell
node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs
```

- **B2–B3 — failed deletion and exact Python/EPUB identities.** The current CLI
  exercises both a failed deletion with all inputs still present and one with
  partially removed inputs. Neither emits a success result. The successful
  retry and removal-before-success remain in the same union. Its command,
  before/after identities and output are under `r02-final-python/`. G-EPUB
  includes the generated `packages/epub/dist` and `packages/shared/dist`
  exports and installed dependencies in its before/after inventory.
  `r02-epub/environment.json` and `receipt.json` bind the 574-pass result.

```powershell
uv run --no-sync --locked --project services/tts pytest services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_batch_matrix.py services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_batch_execution.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_v14_authority.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_benchmark_v13_authority.py --tb=short
pnpm.cmd --filter @voxleaf/epub exec vitest run src/navigation/navigation-document.test.ts src/navigation/ncx-navigation-parser.test.ts src/public/open-epub-publication.test.ts src/document/xhtml-projector.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source-window.test.ts src/narration/narration-resource-bounds.test.ts
```

- **B4 — final native harness.** With `$Evidence` set to the ignored evidence
  root, each command exited 0 with unchanged inputs and verified trusted
  keydown-to-scroll movement, recovery and audibility at the saved placement.
  `r02-native/` has per-chord commands, logs and exits, plus the matching input
  inventories with the executable, harness, tools and existing Piper ES
  resources. The final settled-caret Ctrl+End receipt already used this
  executable and script. No new native build or model provisioning was needed.

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --executable "$Evidence/u6-all-chords-green/current-dev-binary.exe" --adaptive-tts-exact-host --keyboard-placement-only=shift-space --tts-profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --tts-language=es --operation-timeout-ms=60000
node apps/desktop/scripts/native-startup-smoke.mjs --executable "$Evidence/u6-all-chords-green/current-dev-binary.exe" --adaptive-tts-exact-host --keyboard-placement-only=ctrl-home --tts-profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --tts-language=es --operation-timeout-ms=60000
```

- **B5 — installed startup and containment.** The ignored local driver invoked
  the production ordinary journey with the same final unsigned installer, the
  local Tauri/WebView2 drivers and verified installed executable bytes. It
  delegated to `runNativeSmoke` with `--scrollbar-probe-only --executable`
  targeting the actual installed executable and a 90000 ms operation limit.
  Startup and viewport movement, positive IPC containment and exit preceded
  uninstall and verified restoration of the original profile. No optional
  models were downloaded or run. `r02-installed-startup/command.json` contains
  the full invocation and exact paths. Its before/after inventories, log,
  exit file and ordinary-journey receipt support the result.

```powershell
node "$Evidence/ordinary-local-startup-r02.mjs" "$Installer" "$Evidence/r02-installed-startup/ordinary-local-empty-profile-receipt.json" "$TauriDriver" "$EdgeDriver"
```

The R02 test-file changes do not enter G-DESKTOP, G-BROWSER, G-NATIVE or the
compiled installer. Retained R01 gate evidence covers those unchanged inputs
within its original scope. The R02 native renewals and installed startup add
the specific previously missing observations. Earlier exploratory invocations
without complete command/input capture remain contextual and carry no reuse
credit. The comparison with R01 and the current captured input inventories is
retained as `r02-input-comparison.json` under the ignored evidence root.

The first R02 Python union passed before the type checker identified a
test-module import issue. The final 130-pass union uses the explicit standard
library import and produces one pytest cache warning. The renewed affected
Python Ruff and type checks passed, as did the selected Node test lint and
format. The commands use the repository's existing Node 24.18.0, pnpm
11.15.1 and locked Python environment.

```powershell
uv run --no-sync --locked --project services/tts ruff format --check services/tts/tests/test_benchmark_batch_cli.py
uv run --no-sync --locked --project services/tts ruff check services/tts/tests/test_benchmark_batch_cli.py
uv run --no-sync --directory services/tts --locked mypy .
pnpm.cmd exec prettier --check apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs
pnpm.cmd exec eslint apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs
pnpm.cmd check:evidence
git diff --check
```

## Documentary closure

After R02 approval, the [ExecPlan](../../completed/four-pass-findings-corrections.md)
moved to completed and the findings registry recorded the bounded dispositions.
The retained gate inputs, runtime and test files preserve their R02 identities.
The closure checks run in normal local PowerShell are the evidence retention
check, archive link check, Git diff/whitespace check and exact candidate identity
comparison. The commands and outcomes are retained in the ignored evidence
directory alongside the final documentary manifest.
The [R03 documentary report](review-r03.md) requested preservation of the
original planning receipt. Its link still identifies the active plan in the
planning commit. The current archive has a separate navigation path.
[R04 documentary review](review-r04.md) · [Implementation closeout](implementation-closeout.md).
