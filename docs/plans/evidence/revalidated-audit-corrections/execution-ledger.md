# RAC execution ledger

## Entry and scope

Execution authorized 2026-10-29, branch `codex/revalidated-audit-corrections`,
HEAD/planning commit `618d6af472c7dfe73b123a91c4c7018f4e0d0da9`.
Empty index and clean worktree; no pre-existing changes or post-plan drift.
Raw entry manifest, immutable command logs, before/after input manifests and
receipts live under ignored `tmp/evidence/revalidated-audit-corrections/`.
No Git publication is authorized.

Mutable source/test allowlist, selected after inspecting existing owners:

- `apps/desktop/src/reader/ReaderPublication.tsx` and its `.test.tsx`;
  `apps/desktop/src/App.test.tsx` (App production only if wiring proves necessary).
- M1 bounded amendment before edits: `apps/desktop/src/reader/active-visual-locator.ts`
  and `reader-reflow-restoration.ts` in the same directory, adding callback setters
  so layout-phase registration preserves both instances and satisfies React's
  refs rule. No shared/IPC/public package contract changes.
- `apps/desktop/src/reader/segment-highlight-controller.ts` and its `.test.tsx`.
- `apps/desktop/src/tts/hardware-profile-compatibility.ts` and its `.test.ts`.
- `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`.
- `packages/epub/src/narration/narration-preparation.ts`,
  `packages/epub/src/resource/opened-publication.ts`,
  `packages/epub/src/narration/narration-bilingual-normalizer.ts`.
- `packages/epub/src/public/open-epub-publication.test.ts`,
  `packages/epub/src/narration/narration-normalizer.test.ts`,
  `packages/epub/src/integration/narration-preparation-matrix.test.ts`.
- `services/tts/benchmarks/quality.py`, `dual_worker_playback.py` in that directory;
  `services/tts/tests/test_benchmark_quality.py`, `test_benchmark_dual_worker.py`,
  `test_chatterbox_v7_preparation.py` in that test directory.
- `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs` and its `.node-test.mjs`;
  `scripts/test-chatterbox-runtime-smoke.py`.

Documentation scope: this ledger/review summaries, the active ExecPlan (archive
only on acceptance), `docs/README.md`, active/completed indexes,
`docs/development/testing.md`, `benchmarks/tts/README.md`, and maintained
`docs/architecture/overview.md` where clarification is needed. Review the system
diagram without changing topology; preserve completed M005 and frozen authorities.

## Gate decisions before edits

| Gate | Decision | Timing and reason |
| --- | --- | --- |
| D-Desktop, D-EPUB, D-Python, D-Host | RUN | Missing regression assertions first; capture intended failures on unchanged production. No complete baseline suites. |
| F-TS-static | RUN | Final TS inputs; format, lint and typecheck (including package builds). |
| F-TS-tests | RUN fallback | One `pnpm.cmd test:typescript`; includes shared generate:check/build, EPUB build and all seven desktop Node suites. No independent duplicate complete leaves. |
| F-Python, F-Smoke-script | RUN | Fresh format/lint/mypy/pytest/wheel/sdist; external smoke Ruff checks separately. |
| B1 | RUN | Entire final reader browser spec, after fast checks, including package/frontend hooks. |
| F-Build | RUN | Standalone frontend then default native build after B1. No proof of equivalent browser build leaf is assumed. |
| F-Native | RUN | Format, both Clippy and both test variants after final frontend/native assets. |
| N1 | RUN | Direct native smoke on the identified final binary, without wrapper rebuild. |
| F-Docs | RUN | Current evidence guard and guard tests; archive changes renew the guard. |
| Historical PASS reuse | NONE | Original VCA/VAF/SAC receipts are historical references; full execution-time environment and discovery equivalence is not established. |
| Model/GPU/listening/download/personal installer gates | NOT APPLICABLE | No runtime/model/DSP/containment semantics or installer hooks are planned to change. Reassess only on the plan's explicit triggers. |

All acceptance commands run in normal local PowerShell outside the managed
sandbox. The local capture wrapper records exact commands, exit codes, times
and complete tracked/discovered source identities before and after each gate.
No aggregate `check` or `check:portable` is scheduled.

## Results

M1 corrections, M2 runtime gates and documentation checks pass.
[RAC-R1-20261029](review-R1.md) independently approves implementation and the
current-task evidence continuation below. Original failures are retained:

- `D-EPUB-red-01`: six intended failures, nine controls pass. Unknown-spine
  preparation chose auxiliary content or succeeded without primary content;
  ordinal `St.` became `Saint`. The expected `21st` output was corrected to
  retain existing `twenty-first` normalization, as the plan explicitly requires.
- `D-Desktop-red-01`: six failures, one control pass. Delayed handoff starts
  remained at offset zero, Resume did not follow, and available CPU fallback
  was false. A ReaderPublication fixture also canonicalized every offset to
  block start; `D-Desktop-green-01` isolated that fixture defect (six pass, one
  failure). It now uses the existing exact-locator fixture pattern.
- `D-Python-red-01`: twelve intended failures, eighteen passes (selection also
  matches existing tests). All three finalized quality profiles were deleted;
  retained peak was 3,849,600 instead of 5,760,000; direct main falsely passed
  write/cleanup cases. Two historical pytest-cache permission warnings are
  environmental; final execution uses a task-owned cache directory.
- `D-Host-red-01/02`: five failures, success control passes. A behavior-preserving
  extraction of the existing nested finally exposed the actual production path;
  the second directed run moved the no-restoration assertion before error-shape
  checking, proving unsafe ordering directly. No personal path was touched.
- `F-TS-static-01`: format stopped before lint/types. Prettier's first pass left
  one new browser call chain noncanonical; `M1-format-02` records the isolated
  second-pass diff. No behavior or assertion changed.

RAC-03 also marks installation as requiring cleanup before launching the
installer, so a partially failed attempt cannot bypass teardown. Uninstall
arguments, process containment and stable-absence semantics are unchanged.

`F-TS-static-02` passed format but stopped at React's refs lint rule: passing
ref-reading closures into constructors during render cannot be proven deferred.
`D-Reader-lint-01` confirmed that a local dispatcher factory does not solve
that boundary. Bounded replan: discard the factory, keep current refs, and
register callbacks on the two retained owners in layout effects through small
setters. No rule suppression, new dependency, general refactor or wider retry.

Final self-inspection found a further RAC-03 cleanup case: WebDriver clears its
session ID before a failed deletion, so a second close could falsely succeed.
`D-Host-sticky-red-01` reproduces repeated-close and failed-startup false recovery
with owned synthetic Node children; both fail before correction and each child
is observed exited with unconditional cleanup. The actual session closer now
retains its one promise/failure, and startup cleanup propagates the same typed
failure into finalization. Finalization cannot restore after that prior failure.
No timeout, kill primitive, process tree policy or installer argument changes.
This invalidates the ordinary/Windows-release Node leaves and TS format/lint
from `F-TS-tests-01`/`F-TS-static-04`; `F-Host-final-02` renews them directly.
The other current-task test leaves, Python, EPUB/desktop and browser source
closures are unchanged; original receipts and complete manifests remain intact.

Other diagnosed attempts are retained separately:

- `F-TS-static-03` passed format/lint and found widened string literals in the
  new exact-locator fixture. Literal discriminants were restored; no assertion
  or production behavior was weakened. `F-TS-static-04` passes all three leaves.
- `F-Python-static-01` passed service format and found three long lines in the
  new synthetic subprocess fixture. Only those fixture lines were wrapped.
  `F-Python-static-02` then passed service format/lint/mypy but stopped at the
  external smoke script's formatting: the earlier formatter had selected its
  default config instead of the service config. `F-Smoke-script-01` explicitly
  selects that existing config, formats the script and passes both checks.
  The successful service-only leaves remain attributed to the original partial
  receipt; that receipt's overall exit code remains 1.
- `F-Host-final-01` passed format but lint found a missing `node:process` import
  in the new synthetic-child test. The import was added before
  `F-Host-final-02`; Node tests did not execute in the failed attempt.
- `M2-native-readiness-01` is informational, not a behavior gate. This installed
  `tauri-driver` does not support `--version`; its usage diagnostic is retained.
  Driver SHA-256 identities were captured during the final cleanup inspection.
- `M2-cleanup-01` stopped before inspection because PowerShell had already
  decoded the receipt timestamp into a DateTime; parsing its localized string
  failed. The scratch inspector now casts that value directly.
  `M2-cleanup-02` passes without repeating native execution.

## Correction coverage

| RAC | Implemented result and regression |
| --- | --- |
| 01 | Retained visual/reflow owners dispatch current layout-registered callbacks; a newly available coordinator receives the current visual locator through its existing inactive-only update. Mounted App and Chromium delayed-handoff cases cover observations during and after the barrier, including Play without another event. |
| 02 | Existing session admission precedes cleanup ownership. Synthetic finalized/submitted v2/v3/v6 sessions preserve every file byte and reject before adapter creation; genuine partial-generation failure still cleans up. |
| 03 | Finalization attempts session close and uninstall, restores only after confirmed cleanup, and retains backup plus original/cleanup errors otherwise. The production session closer retains its promise/error across repeated close and startup cleanup. Disposable filesystem and owned-process regressions cover success, close/uninstall/absence/restore failure and combined errors. |
| 04 | CPU fallback availability scans supported, language-admitted fallback profiles independently of retained Chatterbox selection. EN/ES/reset and unavailable/wrong-language controls pass. |
| 05 | Direct and supervised diagnostics share bounded Python audio-write observation before adapter import. Direct PASS follows cleanup and observed zero counts. Real-main isolated fake-adapter cases reject load/synthesis/cleanup writes, even swallowed exceptions, and cleanup network attempts. |
| 06 | Public preparation receives the existing primary-start authority without losing recovery reasons. EPUB 2/3 tests preserve exact auxiliary starts, recover unknown spines into primary content and reject unknown starts when primary content is absent. |
| 07 | Paused-to-playing refreshes the current followable projection once. Unit and real AudioContext/browser cases preserve focus, selection, later passive inspection and terminal/cleanup guards. |
| 08 | Retained PCM peak includes completed payloads awaiting ordered release. The legal four-unit synthetic timeline reports 5,760,000 bytes; reservations and frozen historical results remain unchanged. |
| 09 | A numeric prefix cannot supply title context for ambiguous English `St.`. Ordinal-address and Piper/Chatterbox preparation cases preserve source/ranges and existing number normalization; title and other ambiguity controls remain. |

## Final host executions

All commands below ran from the repository root in normal local PowerShell
7.6.5 outside the managed sandbox. The runner only supplies the existing
Corepack shim path and records the command; package hooks retain their configured
working directories. Host versions: Node 24.20.0, pnpm 11.15.1, uv 0.11.29,
locked service Python 3.12.10, Cargo/rustc 1.97.1 and Playwright 1.64.1.
The standalone Python 3.14.6 is used for evidence capture, not service tests.
No dependencies, tools, model packages or browser versions were installed or
changed during execution. EdgeDriver reports 155.0.4283.45.

| Receipt | Exact executed leaf/command | Result |
| --- | --- | --- |
| `F-TS-static-04` | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd typecheck:typescript` | All pass, 22.17 s; typecheck includes package builds. Format/lint subsequently renewed below. |
| `F-TS-tests-01` | `pnpm.cmd test:typescript` | Exit 0, 84.06 s. Shared 210, EPUB 723, desktop Vitest 935, seven Node suites 116 pass. Shared pretest verifies 17 generated files and builds; EPUB pretest builds. |
| `F-Host-final-02` | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs` | Exit 0, 66.44 s. Current format/lint and all 52 tests pass. Renews only the two Node suites invalidated by the RAC-03 follow-up; the other five leaves retain their fresh task receipt. |
| `F-Python-static-02` (successful leaves only) | `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python` | Service format (183 files), lint and mypy (180 files) pass. Aggregate exit 1 belongs to the later external-script format failure, not these leaves. |
| `F-Smoke-script-01` | `uv run --project services/tts --locked ruff format --config services/tts/pyproject.toml scripts/test-chatterbox-runtime-smoke.py`; same command with `--check`; `uv run --project services/tts --locked ruff check --config services/tts/pyproject.toml scripts/test-chatterbox-runtime-smoke.py` | Exit 0, 0.51 s; scoped formatting plus both external-script checks pass. |
| `F-Python-tests-build-01` | `pnpm.cmd test:python -o cache_dir=../../tmp/evidence/revalidated-audit-corrections/pytest-cache`; `pnpm.cmd build:python` | Exit 0, 61.69 s. All 749 tests pass (59.97 s), then wheel and sdist build. Task-owned cache avoids the earlier inaccessible historical cache. |
| `B1-browser-01` | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` | Exit 0, 178.43 s; all 17 cases pass, including both new real mounted-reader cases. Package/frontend preparation included. |
| `F-Build-01` | `pnpm.cmd --filter @voxleaf/desktop build`; `pnpm.cmd build:desktop` | Exit 0, 43.64 s; standalone frontend and final default native executable built after B1. Tauri's existing frontend hook retained. |
| `F-Native-01` | `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust` | Exit 0, 42.98 s; format and both Clippy variants pass; default 141 and release-locked 140 tests pass, seven explicit ignores each. |
| `N1-native-01` | `node apps/desktop/scripts/native-startup-smoke.mjs` | Exit 0, 14.23 s; current-binary WebView2, protocol, fake-service lifecycle, reader matrix, replacement/restoration and cleanup pass; no external requests. No wrapper rebuild. |
| `M2-cleanup-02` | `& ./tmp/evidence/revalidated-audit-corrections/verify-cleanup.ps1` | Exit 0. No app/driver/owned synthetic Node process, new native scratch directory or port 4173 listener remains. No cleanup deletion or process termination was performed by this read-only inspection. |
| `F-Docs-R1-01` | `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence`; `git diff --check` | Exit 0. Current evidence guard and all 31 guard tests pass. The guard is renewed after recording this result; guard-test inputs remain unchanged. |

Vite's existing large-chunk warning and Playwright's color-environment warning
remain diagnostics; thresholds/configuration were not weakened. Rust ignores
are not claimed as executed. `check` and `check:portable` were not run, and their
components were not duplicated as aggregate baselines.

## Evidence continuity for independent review

No historical VCA/VAF/SAC PASS is reused. All mandatory test leaves were run
fresh in this task. The original `*-result.json`, logs and complete `*-before`
and `*-after` snapshots are immutable. They capture tracked/nonignored discovered
source membership and bytes, package/frontend output bytes, native artifacts,
configuration/locks, installed pnpm metadata and Python distribution records.
The M0 and M2 readiness receipts identify the same toolchain/host; all subsequent
operations are captured, with no installation or environment mutation.

Current-task continuation is limited to unchanged consumed inputs:

- The later RAC-03 edits touch only the ordinary harness and its Node test.
  `windows-release.node-test.mjs` imports that harness, so both leaves were
  rerun. None of the other five Node leaves or their import/fixture closures
  imports it. Native-smoke's changed EPUB dependency was already built and
  tested fresh in `F-TS-tests-01` and remains byte-identical.
- TS typecheck/Vitest and the browser spec consume TS/TSX source, their own
  fixture/configuration closures and package outputs, not the ordinary harness.
  Those source memberships, locks and package bytes are unchanged. The final
  native/frontend build does not supply inputs to those source tests. Browser
  frontend outputs match the final build bytes.
- The service format/lint/mypy leaves in `F-Python-static-02` consume only the
  configured service tree. The later external-script formatting is outside
  those paths; Python runtime tests ran after it. All service source,
  dependencies, fixtures and installed distribution records remain unchanged.
- Python tests/wheel/sdist, Rust and native gates ran after their last relevant
  source change. Later documentation records are not runtime/test inputs;
  evidence-guard discovery is renewed after documentation edits.

RAC-R1-20261029 independently checked all 663 closed path identities, 1,775
snapshot entries, 33 gate differences and the original receipt/artifact hashes.
Its report explicitly approves the continuation above and rejects carrying the
superseded ordinary/Windows-release leaves forward. No approval hash was rebound.

## Constraints and closeout

The canonical system diagram still matches the implementation. No major
component, process, persistence responsibility, public/IPC contract or dependency
boundary changed. Completed M005, frozen authorities/results, model/lock payloads,
DSP and resource limits retain their original bytes. All runtime fixtures use
synthetic content; raw output and synthetic scratch stay outside tracked files.

No new real-model observed-zero claim, GPU matrix, download, personal
installation/uninstallation, listening campaign or historical benchmark rerun
is established. RAC-05 proves the measurement mechanism with synthetic adapters,
not a fresh measurement of real inference. RAC-03's containment primitives,
uninstaller arguments, stable-absence algorithm and NSIS hooks are unchanged,
so the plan's additional personal-host trigger is not activated.

RAC-R1-20261029 returns APPROVE with no findings. The plan was archived after
implementation, host gates, cleanup and that independent acceptance passed.
The separate [RAC-R2-20261029 report](review-R2.md) records the current archival
assessment, renewed documentation guard and unchanged source/artifact comparison;
its verdict belongs to that report. No runtime source/test was changed after R1.

Final native executable SHA-256:
`81bc3b785021844aa1379dff84a8a6b6581d0130bf80af3365a75d1be5158007`.
Closed manifest/patch/receipt/artifact identities are preserved in the review
reports; raw local captures remain ignored. Index is empty; changes remain
uncommitted on the original branch and HEAD. No commit, push, PR or merge was
performed or authorized.
