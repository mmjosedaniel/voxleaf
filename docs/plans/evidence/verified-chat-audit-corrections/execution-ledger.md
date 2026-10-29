# Verified chat audit corrections execution ledger

Task: VCA-01–09; VCA-10 excluded. Base and unchanged HEAD:
`61b9f32c2360f8eb27c1822aa4c94768c465a9ed` on
`codex/verified-chat-audit-corrections`. Entry was clean. All implementation,
tests and maintained documentation remain unstaged and uncommitted.

## Evidence decisions

**EJECUTAR:** current static, language suites, package hooks, default native
build, portable frontend build, Python package, full affected browser spec,
native model-free smoke and independent review. VAF R4/R5 and SAC R3 were read
as historical reports. Their partial source comparison did not prove complete
dependency/install/discovery/tool/host equality. Shared/EPUB were prioritized as
candidates, but fresh cheap runs cost less than establishing missing proof.
**REUTILIZAR con prueba:** no historical runtime PASS or approval. Current-task
Python leaves are approved to carry into R2 by the independent
[R2 report](review-R2.md): the original before/after and
F-Host-R2-01 snapshots retain 309 Python/configuration identities with zero
changes or membership drift, including source, tests/fixtures, discovery
configuration, lock and installed distribution records. The same locked
interpreter/pytest and shell tool versions were re-observed; no dependency,
installation or environment-setting operation intervened. R2 inspected the
complete delta and artifact maps, runners, consumers and discovered source/test
membership, not only this selected count. The later reader/browser/docs/assets changes are outside those
Python gates' inputs. No old identity is added retrospectively.

Package builds are executed by the configured TS typecheck and pretest/browser
hooks. Their unchanged source/config/output identities are retained in the
current snapshots; no extra top-level build:packages repetition is needed.
Tauri also invokes Vite. Because complete Tauri-versus-standalone environment
equivalence was not established, the inexpensive standalone frontend leaf ran
explicitly. These leaves cover `check` and `check:portable`; neither aggregate
command is claimed to have run. Both Rust variants and all seven Node suites
are retained. Later Markdown-only updates renew the evidence guard and review,
not unrelated runtime tests.

**NO APLICA:** model/GPU inference, downloads, installation/uninstallation,
quality/listening/six-rate benchmarks and frozen-result regeneration. Their
adapters, dependencies, bootstrap, DSP, release policy and authorities are
unchanged. Native synthetic acquisition/removal and compiled NSIS controls still
run through the selected suites. Ignored exact-host cases are not reported PASS.

## Current executed leaves

All commands run from the repository in normal local PowerShell outside the
managed sandbox. Shell identities: PowerShell 7.6.5, Node 24.20.0, pnpm 11.15.1,
uv 0.11.29, Rust/Cargo 1.97.1, Windows build 26200. Locked Python tests use
3.12.10 with pytest 9.1.1; the shell snapshot helper uses Python 3.14.6.

| Commands actually executed | Current result / receipt |
| --- | --- |
| `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence` | F-Docs-R2-02: guard + 31 tests pass; archive guard is recorded separately in F-Docs-R3-03 |
| `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd typecheck:typescript`; `pnpm.cmd test:typescript` | F-TS-R2-04: pass, shared 210, EPUB 720, desktop 929, Node 110; generate:check and builds ran |
| `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`; `pnpm.cmd test:python` | F-Python-renewed-02: pass, mypy 180 files, pytest 735; one pytest cache-write warning |
| `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust` | F-Rust-R2-02: pass, default + release-locked Clippy after final frontend build |
| `pnpm.cmd test:rust` | F-Rust-R2-02: 141 default / 140 release-locked pass; seven configured ignores each |
| `pnpm.cmd build:desktop` | F-Desktop-R2-build-02: pass, corrected default native binary and nested Vite |
| `pnpm.cmd --filter @voxleaf/desktop build` | F-Desktop-R2-build-02: pass |
| `pnpm.cmd build:python` | F-Python-build-01: wheel + source archive pass |
| `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` | B1-browser-R2-04: 15 pass, 172.82 seconds including hooks |
| `node apps/desktop/scripts/native-startup-smoke.mjs` | N1-native-01: pass, 13.41 seconds including cleanup; model-free WebView2 and native supervisor |

The existing large frontend chunk warning does not fail the build. Pytest's
pre-existing cache permission warning does not alter discovery or test outcome;
no cache permission or global environment changes were made to suppress it.

## Reproduction, corrections and preserved failures

The ExecPlan records every intended-red selection and subsequent correction.
D1-state-red-01 had six intended failures plus two controls; corrected fixture
attempts D1-handoff-red-02 and D1-placement-red-02 failed three and two intended
assertions respectively. D2-red-01 failed both native path regressions.
D3-red-01 failed nine intended assertions with one proven-process-exit control.
The original whole commands remain failures even where other tests passed.

Static retries corrected React ref placement, test query typings and the private
Windows handle's portable typing. F-TS-static-replanned-03 completed its commands
but lost its after-snapshot to concurrent Rust linking; it has no completed
receipt and is not acceptance. The single unchanged host retry after Rust became
idle passed. Original logs and before-snapshots remain intact.

The first combined Python and focused CLI correction failed an instantaneous
child-handle assertion. D3-job-diagnostic-01 proved membership in the exact Job,
zero active accounting followed by asynchronously signalled child exit. The
regression now observes real exit within the original watchdog-plus-cleanup
bound, with no sleep or extended production limit. The suspended-start change
also closes the statically reachable interpreter-launcher assignment race;
those failed assertions did not independently demonstrate that race.

The first combined TS run passed shared/EPUB and 926 desktop tests but failed two
existing opening-state tests. The App no longer displays a replacement barrier
when there is no narrator to close. F-TS-renewed-02 then passed the whole gate.
After R1, F-TS-R2-03 passed format/lint but stopped before runtime tests on two
new fixture typings. Correcting the paused helper and state assertion produced
the current F-TS-R2-04 result. No production change followed that result.

Raw immutable logs, before/after membership/SHA-256 snapshots, receipts, traces,
artifact identities and review manifests are kept in ignored
`tmp/evidence/verified-chat-audit-corrections/`. No missing historical identity is
reconstructed. Only this sanitized summary and review reports belong in Git.

## Review and closeout

R1 (VCA-R1-20261029) requested one P2 correction for preference reflow replacing
an in-flight interior navigation. R1-overlap-red-01 reproduced the wrong
settlement reason. The correction preserves the pending navigation's original
settlement and sampling release. Renewed TS static/runtime and frontend/native
builds pass; both Rust variants pass after those assets. Current B1 and N1 pass;
**VCA-R2-20261029 APPROVE** accepts the exact implementation and scoped Python
carry-forward. Its 412 identities were rechecked by both reviewer and director.
The full R1 browser spec passed
15 cases; that result is retained but cannot accept the subsequently changed
reader. The canonical diagram was checked: component/process boundaries, local-only content,
memory-only generated audio and public contracts are unchanged. No completed
authority, model, dependency lock or generated tracked source was modified.

N1 reused the freshly built default executable rather than invoking its wrapper
and building it a second time. Its same-command before/after receipt covers the
exact binary, temporary synthetic WebView profile, native fake-service lifecycle
and successful cleanup. Browser's build hook produced byte-identical frontend
inputs to the renewed Rust gate; the full R2 delta map proves this comparison.
Both host runs were serialized. The seven Rust ignores per variant comprise
two subprocess-fixture entrypoints exercised by their owning tests plus five
opt-in artifact/installed/exact-host entries; ignored entries are not PASS.

The plan archive, maintained indexes/testing link and this ledger are the only
changes after R2, plus recording its immutable report. Runtime evidence is not
rerun for those documentation-only changes. The separately identified
[R3 closeout report](review-R3.md) assesses that final state; each report is
excluded only from its own manifest. No approval is silently renewed.
