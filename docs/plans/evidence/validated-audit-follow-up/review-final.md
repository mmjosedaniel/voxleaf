# Change Review Report

Review ID: **VAF-R3-20261028**  
Task ID: **validated-audit-follow-up**  
Verdict: **BLOCKED — required L1 evidence remains unavailable**

Base commit and reviewed HEAD: `beb1093447a9bd75ee3eee9c28575e4a902b55d7`  
Branch: `codex/validated-audit-follow-up`

## Reviewed paths and identities

Closed manifest: `tmp/evidence/validated-audit-follow-up/VAF-R3-20261028-manifest.json`, containing **95 reviewed paths, including 45 task-owned changed paths**. The final report is excluded.

Artifacts under `tmp/evidence/validated-audit-follow-up/`:

| Artifact | SHA-256 |
| --- | --- |
| `VAF-R3-20261028-manifest.json` | `beab5910f1f162f3a67f70b684b071e7b26330c1f20e97a0c1b15f8344263590` |
| `VAF-R3-20261028-tracked.patch` | `6b06f061721eaacb02ecc163d721a81f25cdc8efc7704690011e0ad3066c7cc0` |
| `VAF-R3-20261028-new-files.json` | `afd1354cc5494e7ca06f917d91501b11bbcd2d235ba4b26be085d00938d2c5d3` |
| `VAF-R3-20261028-receipts.json` | `246ba720a3b4e30d11d101a6e85e0c1427c6df72814d4c08e50ac213477b7fa4` |
| `VAF-R3-20261028-gate-deltas.json` | `54c273ec657d3e824c3209b7296dc07999dd3727ab0382e76cb08310cf89056c` |

Identity recheck: **PASS**. Opening and closing checks matched all 95 porcelain statuses, SHA-256 hashes and filter-aware blob IDs. HEAD and branch remained unchanged, the index remained empty, and no extra changed paths appeared. All **185 receipt entries** matched their hashes. R1 and R2 manifest identities remain unchanged.

Since R2, the only code change is the native synchronization fixture’s bounded readiness wait. Other changes are maintained documentation and the preserved R2 report.

## Acceptance review

The complete patch retains the reviewed corrections:

- **H1/H7:** Awaited compatibility recheck reconciles the existing session correctly; pending controls retain accessible focus containment.
- **H8:** Complete nonempty sub-millisecond PCM becomes playable using sample-frame truth, with completion and release coverage.
- **H10:** Completed decoration retains highlighting without authority to follow, navigate or settle the reader.
- **H6/H11:** Conservative title handling and Unicode Mark classification preserve source mapping, ambiguous forms, boundary behavior and public batching contracts.
- **H3/H4/H12:** Diagnostic matching remains bounded across writes; privacy and cleanup claims require successful observation; presentation shuffling preserves synthesis order and sample correspondence.
- **H2:** Cancellation wins at the request-error boundary while preserving prior diagnostics and ordinary failure behavior.
- **H9:** Preference cleanup independently reports retained, unsafe or inaccessible data.
- **H13:** Owned installation cleanup precedes restoration, failures preserve recovery material, and uninstallation has a finite deadline.

H5 remains excluded. No change to frozen authorities, corpus/history, public contracts, production dependencies or architectural boundaries was identified. EPUB privacy, transient audio ownership, cancellation and bounded-memory constraints remain preserved by the reviewed changes.

**VAF-R1-F1 remains resolved.** The verified recovery-directory uninstaller copy exposes the retained process lifetime. Its 120-second wait and ten-second termination bound replace the unbounded wait; failed uninstallation is not retried automatically, and restoration requires verified cleanup. The hanging-uninstaller regression exercises these conditions. Real integration still requires L1.

**The N1 readiness correction is within the documented bounded replan.** It waits for the intended viewport and two rendering opportunities before measuring the offscreen precondition. It preserves the target and every existing proof assertion. The condition and WebDriver requests remain bounded. No application rebuild was necessary for this external fixture change.

The new uninstrumented N1 pass closes the previous missing N1 evidence. It establishes success of the revised fixture on this host; it does not independently prove timing as the cause of the earlier failures.

## Test evidence reviewed

Results are attributed to recorded **normal local PowerShell execution outside the sandbox**. This reviewer ran no tests, builds or formatters. Exact compound commands and input deltas are preserved in the identified receipt and gate-delta artifacts.

| Evidence | Command/result |
| --- | --- |
| `F-Native-fixture-03` | Scoped Prettier check, ESLint and `node --test apps/desktop/scripts/native-smoke.node-test.mjs`: **23 passed**, zero skipped |
| `N1-native-replanned-03` | `node apps/desktop/scripts/native-startup-smoke.mjs`: **PASS**, 15.217 seconds; synchronization proof, cleanup, no errors and no external requests |
| `F-documents-03` | `pnpm.cmd check:evidence` followed by `git diff --check`: passed |
| `F-Windows-tests-03` | `node --test apps/desktop/scripts/windows-release.node-test.mjs`: **31 passed**, zero skipped |
| `F-Windows-static-02` | Scoped Windows-test Prettier and ESLint: passed |
| `B1-browser-final-03` | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts`: **14 passed** |
| `F-Python-tests-01` | `pnpm.cmd test:python`: **722 passed**, one cache-write warning |
| `F-Python-static-01`, `F-Python-build-01` | Python formatting, lint, type checks and build: passed |
| `F-Rust-static-tests-01` | Rust formatting, lint and tests: **140 default / 139 release-locked passed**, seven ignored per configuration |
| `F-TS-static-01`, `TS-format-02` | TypeScript static checks and subsequent scoped checks: passed |
| `F-TS-tests-01` | Shared **210** and EPUB **720** passed; failed desktop portion superseded |
| `F-Desktop-tests-02` | Desktop **913 passed**; affected Node leaves subsequently renewed |
| `F-Desktop-build-01` | `pnpm.cmd build:desktop`: passed |
| `F-evidence-01` | `pnpm.cmd test:evidence`: **31 passed** |

Current composed Node coverage is **110 tests**, not a newly executed aggregate. The native leaf is renewed by `F-Native-fixture-03`; the Windows leaf is renewed by `F-Windows-tests-03`.

N1 and its fixture checks had no recorded input changes during execution. Subsequent changes were documentation only. Final document checks have no recorded subsequent input changes. The R3 fixture change does not invalidate the retained application, browser, Python, Rust, shared/EPUB or unrelated Node evidence.

Earlier failed N1 attempts and the instrumented diagnostic remain separately attributed. No historical approval is reused.

## Findings

**None outstanding.** No additional actionable correctness defect or weakened acceptance assertion was identified.

## Remaining uncertainty

- **L1 remains unexecuted.** The plan requires one fresh real lifecycle invocation with an identified installer and an authorized clean entry state. An existing personal installation lacks authorization for removal/restoration. Mocked fault coverage cannot establish real installation/process/restoration integration.
- **Historical host equality remains unproven.** The earlier coarse metadata digest transition is unexplained. The final N1 before/after inventories match exactly across 2,339 and 60,439 recorded entries respectively. Final cleanup reports unchanged installed executable/uninstaller hashes, zero named native processes, zero VAF fixture roots and unchanged native temporary-root inventory. These observations establish the final run’s recorded equality, not complete historical equality or corruption.
- Synthetic H8 coverage does not establish occurrence in real model output. No new model, listening, runtime-package or release acceptance is claimed.

## Required next action

Obtain the required **`pnpm.cmd package:windows:lifecycle`** evidence in an explicitly authorized clean-entry or disposable environment, with identified installer, process cleanup and restoration results. Preserve the historical host-state limitation unless further evidence explains it.

Renew documentation checks after closeout additions. Any changed reviewed content requires a new immutable review; this report’s identities must not be refreshed.

Review inspection is complete and the review write freeze may end. This report is immutable, is not a Validation Report, and authorizes no staging, commit, push, PR, merge or publication.
