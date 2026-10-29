# Change Review Report

Review ID: `VAF-R2-20261028`  
Task ID: `validated-audit-follow-up`  
Verdict: **BLOCKED**

Base commit and reviewed HEAD: `beb1093447a9bd75ee3eee9c28575e4a902b55d7`  
Branch: `codex/validated-audit-follow-up`

**R1-F1 is resolved, and final B1 evidence is complete. No actionable code findings remain. Mandatory N1 and L1 evidence remains incomplete, so APPROVE is unavailable.**

## Reviewed paths and identities

The closed scope is the 94 paths in `tmp/evidence/validated-audit-follow-up/VAF-R2-20261028-manifest.json`, including 43 task-owned changed paths and all seven supporting paths added during R1. No additional supporting paths were introduced during R2. `review-final.md` is excluded.

All artifacts below are under `tmp/evidence/validated-audit-follow-up/`:

| Artifact | SHA-256 |
| --- | --- |
| `VAF-R2-20261028-manifest.json` | `e6734aa214019ac78e7048710245924bc66cbcb93096daa51580c151e85789dd` |
| `VAF-R2-20261028-tracked.patch` | `c4e451a526c8f11ba6f741859558f33d59d155e417e6a152448659a7c404e5d7` |
| `VAF-R2-20261028-new-files.json` | `e6660f02e703c3ef043a78219c8f7b3e155762c1e9eaa70c4724df954875e1a1` |
| `VAF-R2-20261028-receipts.json` | `88a519d199c6f83dd97dc1658ee83b149bb3c7888a4736c36885c19bbbdb6ece` |
| `VAF-R2-20261028-gate-deltas.json` | `22b23ffdb8de17ccff2e33fdf9b454ee9b326d861a3df26819e752c6f90be36f` |

Identity recheck: **PASS**. Before and after review, all manifest statuses, SHA-256 hashes and filter-aware blob IDs matched. Base/HEAD and branch remained unchanged, the index remained empty, and no extra changed paths appeared. All 153 entries in the R2 receipt manifest matched their recorded hashes. R1 manifest, receipt-manifest and gate-delta hashes remain unchanged.

Since R1, changes are limited to the lifecycle script, its existing Windows test, three maintained documentation files, and the archived R1 report.

## Acceptance review

The complete patch retains the following reviewed behavior:

- **H1/H7:** Awaited optional compatibility recheck uses existing reconciliation. Changed selection contains the old session; unchanged selection preserves playback. Summaries participate in focus containment during pending checks.
- **H8:** Complete nonempty sub-millisecond PCM becomes playable using sample-frame truth. Scheduler/coordinator coverage verifies the six specified frame/rate combinations, completion and release.
- **H10:** Completed decoration loses follow, navigation and settlement authority. Manual reading and appearance reflow retain the reader's location.
- **H6/H11:** Conservative English title handling preserves ambiguous forms and source mapping; Unicode Mark classification prevents admitted combining-sequence splits. Corpus, boundary, overflow and public batching controls remain intact.
- **H3/H4/H12:** Diagnostic matching remains bounded across writes beyond the capture limit; privacy/cleanup audits require successful observation; presentation records are shuffled without changing synthesis order or audio/case/sample correspondence.
- **H2:** Cancellation wins at the real request-error boundary without replacing the prior diagnostic; ordinary request failures remain failures.
- **H9:** Requested preference cleanup independently reports retained, unsafe or inaccessible data while preserving unrelated data.
- **H13:** Installation ownership precedes mutation; cleanup precedes restoration; failed cleanup preserves recovery material. The revised uninstall path now has a finite deadline.

H5 remains excluded. Public contracts, frozen authorities/corpus/history, dependencies, generated tracked sources, EPUB privacy, transient audio ownership and architectural boundaries remain unchanged. No weakened assertion concealing a product failure was identified.

### R1-F1 disposition: resolved

`Invoke-Uninstaller` now copies the validated uninstaller into the owned recovery directory, verifies its hash, and invokes it with `_?=<exact installRoot>` last. This approach exposes the actual uninstaller's lifetime and exit status rather than its self-relocating stub, consistent with the [official NSIS documentation](https://nsis.sourceforge.io/Docs/AppendixD.html#D.1).

The retained process receives a 120-second wait. Timeout flows into cleanup with a ten-second termination bound. A failed uninstall is not automatically retried; original data and recovery artifacts remain preserved until cleanup is verified. No recursive installation-deletion fallback was added.

The new deterministic hanging-uninstaller fixture verifies a finite wait, termination, preservation of the primary failure, exactly one uninstall attempt, retained backup/journal, and absence of unsafe restoration. This closes the source-level finding; real installer integration still requires L1.

## Test evidence reviewed

All results below are attributed to the executor's recorded **normal local PowerShell runs outside the sandbox**. This reviewer ran no tests, builds or formatters.

| Evidence | Command/result and disposition |
| --- | --- |
| `D-H13-timeout-red-01` | `node --test --test-name-pattern=hanging-uninstaller apps/desktop/scripts/windows-release.node-test.mjs`: reproduced `synthetic-unbounded-uninstall` before correction |
| `F-Windows-tests-03` | `node --test apps/desktop/scripts/windows-release.node-test.mjs`: **31 passed, zero skipped** |
| `F-Windows-static-02` | Scoped Prettier and ESLint on the changed Windows test: passed |
| `B1-browser-final-03` | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts`: **14 passed** on the unchanged final spec |
| `F-documents-02` | `pnpm.cmd check:evidence` and `git diff --check`: passed on current documented inputs |
| `F-Python-tests-01` | `pnpm.cmd test:python`: 722 passed; one cache-write warning |
| `F-Python-static-01`, `F-Python-build-01` | Python format/lint/typecheck and `pnpm.cmd build:python`: passed |
| `F-Rust-static-tests-01` | Rust format/lint/test scripts: passed; 140 default and 139 release-locked tests, seven explicitly ignored per configuration |
| `F-TS-static-01`, `TS-format-02` | TypeScript static checks and subsequent scoped test-file checks: passed |
| `F-TS-tests-01` | Shared 210 and EPUB 720 passed; the failed desktop portion is superseded |
| `F-Desktop-tests-02` | 913 desktop tests and six unaffected Node leaves retained; its Windows leaf is superseded by `F-Windows-tests-03` |
| `F-Desktop-build-01` | `pnpm.cmd build:desktop`: passed; consumed application inputs unchanged |
| `F-evidence-01` | `pnpm.cmd test:evidence`: 31 passed; guard-test inputs unchanged |

The current composed Node coverage is **110 tests**, not a newly executed 110-test aggregate.

Before/after snapshots confirm stable Windows script/test/hook inputs during `F-Windows-tests-03` and stable browser spec/config/application inputs during final B1. Concurrent lifecycle-script and Markdown changes are outside B1's build/runtime inputs. The earlier incomplete B1 composition is superseded, not relabeled.

The R2 changes do not invalidate the retained Python, Rust, shared/EPUB, desktop Vitest, six other Node leaves or default application build. No historical approval is reused.

## Findings

**None outstanding.** `VAF-R1-F1` is resolved.

## Remaining uncertainty

- **N1:** Two uninstrumented runs still fail `synchronization-feasibility-failed` with `followed=false`. The instrumented diagnostic pass is not acceptance evidence. The probe constructs its own range rather than calling the changed highlight controller; these failures do not establish a defect in that controller.
- **L1:** The real lifecycle run remains unexecuted because a personal installation exists without authorization for its removal/restoration.
- **Host state:** Executable/uninstaller hashes, entry counts and named temporary roots match, and the reported native process count is zero. The earlier full metadata digest difference remains unexplained. Neither complete host equality nor corruption is established.
- Synthetic H8 coverage does not establish occurrence in real model output. No new model, listening, runtime-package or release acceptance is claimed.

## Required next action

1. Resolve N1 through a documented diagnosis and bounded next-step disposition, then obtain the required uninstrumented receipt.
2. Obtain L1 evidence in an explicitly authorized clean-entry or disposable environment.
3. Preserve the unresolved historical host-metadata limitation unless additional evidence explains it.
4. Renew documentation checks after final report/ledger additions and request a new immutable review for any changed reviewed content.

A narrowly scoped native-fixture readiness correction is not inherently excluded: the plan permits fixture changes for demonstrated browser/native divergence. However, further failure after the infrastructure retry requires replanning. Any correction must establish readiness with a finite bound, retain every existing assertion, and avoid treating the timing hypothesis as a proven cause.

Review inspection is complete. This report is immutable, is not a Validation Report, and authorizes no staging, commit, push, PR, merge or publication.
