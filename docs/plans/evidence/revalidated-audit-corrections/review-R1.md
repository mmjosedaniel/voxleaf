# Change Review Report

Review ID: **RAC-R1-20261029**  
Task ID: Revalidated audit corrections, RAC-01–RAC-09  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `618d6af472c7dfe73b123a91c4c7018f4e0d0da9`  
Branch: `codex/revalidated-audit-corrections`  
Index: empty before and after review. No pre-existing changes were included.

This report approves the current implementation and supplied acceptance evidence. The plan’s archive and subsequent documentation changes require their separately identified review. This is not a Validation Report or authorization to stage, commit, push, create a PR, or merge.

**Reviewed paths and identities**

The closed manifest is `tmp/evidence/revalidated-audit-corrections/RAC-R1-20261029-manifest.json`: 663 paths with porcelain status, worktree SHA-256 and filter-aware Git blob identity, including all 31 task-owned changed paths. The report exclusion is `docs/plans/evidence/revalidated-audit-corrections/review-R1.md`.

The following immutable artifacts are incorporated into this report by exact filename and SHA-256. All reside under `tmp/evidence/revalidated-audit-corrections/`.

| Artifact | SHA-256 |
|---|---|
| `RAC-R1-20261029-manifest.json` | `9aa24f0d44384343eeab42021dc58ee6920fe16dfbe8bbd5836908dd94400dc1` |
| `RAC-R1-20261029-tracked.patch` | `4299d625c8ab5040b597eee6da92320d08205c24122513732e6c8b298fcb3328` |
| `RAC-R1-20261029-new-files.json` | `76bb507ee2ee57fb76d394ef409c7657ff75594c117d782bcb2020490d97c22f` |
| `RAC-R1-20261029-current.json` | `e109e79b61b5f9cd6628db2871693462945e100a483e3f046876eb3050b624bd` |
| `RAC-R1-20261029-gate-deltas.json` | `804695e92ab56b5b9d55e7979efc9f1301a588d7089d9b33c244fa20548b44a6` |
| `RAC-R1-20261029-artifacts.json` | `59c2cfa2347f11589652fcb28704b324d953ee6e56e8f820654deb1143f240b0` |
| `RAC-R1-20261029-receipts.json` | `12e8f6464bf99d1a20f5c237f5a9fc4ea28f40931e496fa9d79bd2edd12a014a` |

Identity recheck: **PASS**.

- Independently recomputed all 663 worktree hashes and filter-aware blobs before and after inspection; no mismatches.
- HEAD, branch, empty index and all manifest porcelain statuses match.
- Independent changed-path discovery exactly matches the 31-path task allowlist.
- The supplied tracked patch equals the current `git diff --binary HEAD` byte-for-byte. The single untracked ledger’s complete content matches its supplied new-file record.
- All 256 artifact entries and 148 evidence entries match their supplied hashes.
- All 1,775 current snapshot entries match disk, with no unrepresented tracked or nonignored discovered path.
- Independently recomputed all 33 supplied before/after/current gate comparisons; no discrepancy.
- No identity drift occurred and no approval hashes were replaced.

The reviewed native executable is `apps/desktop/src-tauri/target/release/voxleaf-desktop.exe`, SHA-256 `81bc3b785021844aa1379dff84a8a6b6581d0130bf80af3365a75d1be5158007`.

**Acceptance review**

I inspected the actual patch, governing requirements and relevant production callers and tests. The review applied the intended behavior changes in the ExecPlan, rather than requiring preservation of the defects.

| Criterion | Assessment |
|---|---|
| RAC-01: callback freshness and delayed handoff | The retained visual tracker and reflow restorer receive current callbacks in layout effects. A newly available narration coordinator receives the current visual locator; its existing `updateVisibleLocator` implementation changes the active start only while inactive and rejects updates during pending navigation. App’s failed-handoff barrier remains intact. Mounted tests cover observations both before and after delayed closure; the browser test starts B from the observed passage without another scroll event. |
| RAC-02: finalized quality sessions | Existing-session admission now precedes generation cleanup ownership. Finalized sessions reject before adapter construction and deletion. Tests preserve every completed file byte for the retained v2/v3/v6 cases, including submitted scorecards. Existing partial-generation cleanup behavior remains covered. The CLI still maps rejection to its content-free failure result. |
| RAC-03: uncertain host cleanup | Actual journey finalization attempts close and uninstall and restores only after successful cleanup. Failures preserve recovery data and aggregate the journey and cleanup errors. The real session closer retains its promise and rejection across repeated calls; startup cleanup failures propagate into finalization and cannot become false recovery through an absent session. Partial installer failure now remains eligible for cleanup. Owned filesystem/process tests exercise these paths. Uninstall arguments, containment primitives, stable-absence semantics and installer hooks are unchanged. |
| RAC-04: CPU fallback availability | Language application derives availability from supported, language-admitted CPU fallback profiles independently of the selected Chatterbox profile. EN/ES transitions, reset, unavailable-provider and wrong-language controls cover the intended distinction. |
| RAC-05: observed audio-write measurement | Direct and supervised diagnostics install shared observation before adapter import. Direct PASS is emitted only after cleanup and zero observed audio/network attempts. Isolated real-main tests reject load, synthesis and cleanup writes, including swallowed audit exceptions, and cleanup network attempts. The existing supervised-observer forwarding/content-free test remains intact. |
| RAC-06: primary-start recovery | Public preparation passes the existing primary-start authority, preserving the distinction between omitted internal default and explicit absence of primary content. The resolver’s exact and nearest recovery paths remain intact. EPUB 2/3 tests cover primary recovery, empty primary items, exact auxiliary starts and `invalid-start` when primary content is unavailable. |
| RAC-07: Resume following | A paused-to-playing transition refreshes the current follow-eligible range once. Completed projections remain ineligible; failure, stop, clear and close retain their existing suppression. Unit/browser assertions cover focus, selection, same-unit Resume and later passive inspection without repeated follow. |
| RAC-08: retained PCM accounting | The reported peak includes queued payloads and completed payloads awaiting ordered release without double counting. The synthetic out-of-order case establishes 5,760,000 retained bytes. Reservation calculations, capacity limits and frozen historical results remain unchanged. |
| RAC-09: ordinal street ambiguity | A numeric prefix no longer supplies title context for `St.`. Existing title and ambiguity controls remain. Public Piper/Chatterbox preparation tests preserve displayed source and canonical ranges while retaining existing ordinal-number normalization. |

No public serialized schema, dependency, model/runtime package, DSP policy, scheduling limit or frozen authority is modified. The additions to reader interfaces are internal wiring. EPUB processing and inference remain local; this patch adds no product audio persistence or unbounded retained state. The canonical diagram’s component and persistence boundaries remain applicable. Completed M005 and its roadmap status remain unchanged.

The changed tests add or strengthen behavioral assertions. The fixture corrections and ordinal expected-output correction do not conceal an implementation failure or weaken an existing requirement.

**Test evidence reviewed**

These are attributed executions by the task’s host executor, **not commands run by this reviewer**. Original receipts identify repository-root normal local PowerShell outside the managed sandbox. I inspected configuration, logs, recorded inputs and their current differences.

| Original receipt | Executed commands and accepted result |
|---|---|
| `F-TS-tests-01` | `pnpm.cmd test:typescript`: shared 210, EPUB 723, desktop 935 and seven Node suites 116 pass; shared `generate:check` verifies 17 generated files; package hooks complete. |
| `F-TS-static-04` | `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript`: pass. Format/lint subsequently renewed below. |
| `F-Host-final-02` | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs`: pass, 52 tests. |
| `F-Python-static-02` | Successful leaves only: `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`, `pnpm.cmd typecheck:python`: service format, lint and mypy pass. This receipt’s overall exit remains **1**, caused by the subsequent external-script format check. |
| `F-Smoke-script-01` | Explicit service-config Ruff formatting followed by `ruff format --check` and `ruff check` on `scripts/test-chatterbox-runtime-smoke.py`: pass. |
| `F-Python-tests-build-01` | `pnpm.cmd test:python -o cache_dir=../../tmp/evidence/revalidated-audit-corrections/pytest-cache`; `pnpm.cmd build:python`: 749 pass; wheel and sdist built. |
| `B1-browser-01` | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts`: complete affected spec, 17 pass. |
| `F-Build-01` | `pnpm.cmd --filter @voxleaf/desktop build`; `pnpm.cmd build:desktop`: pass after B1. |
| `F-Native-01` | `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust`: format and both Clippy variants pass; default/release-locked tests 141/140 pass, seven explicit ignores each. |
| `N1-native-01` | `node apps/desktop/scripts/native-startup-smoke.mjs`: final-binary model-free WebView2/native integration and cleanup pass; no external requests reported. |
| `M2-cleanup-02` | Read-only `verify-cleanup.ps1`: no remaining app/driver/owned synthetic Node process, new native scratch directory or preview listener. The failed timestamp inspection remains preserved as `M2-cleanup-01`. |
| `F-Docs-R1-01`, `F-Docs-R1-02` | Evidence guard and 31 guard tests pass; guard and `git diff --check` renewed after documentation updates. |

Directed failing regressions and diagnosed intermediate failures are retained. Neither aggregate `check` nor `check:portable` is represented as executed.

**Current-task evidence continuation decisions**

Continuation is accepted only for the following unchanged consumed inputs:

- **TypeScript suites and shared generation checking:** retain `F-TS-tests-01`. Source/test discovery, configurations, locks, shared/EPUB package outputs and installed dependency records match. Later frontend/native outputs are not inputs to these source suites.
- **Five unaffected Node leaves:** retain their results from `F-TS-tests-01`: native-webdriver-client, bilingual-portfolio-host, tts-adapter-layout-host, native-smoke and acquisition-file-barrier. Their inspected import/fixture closures do not consume the changed ordinary harness. Native-smoke’s EPUB dependency was already built with this task’s correction and remains identical; the Python subprocess and PowerShell barrier inputs remain unchanged.
- **Ordinary and Windows-release Node leaves:** do **not** retain their earlier result as current acceptance. Windows-release imports ordinary; both are renewed by `F-Host-final-02`.
- **Type checking:** retain `F-TS-static-04`. The later `.mjs` harness edits are outside the configured TS input sets; relevant TS source, package outputs and compiler configuration remain unchanged.
- **Python service static checks:** accept only the successful service leaves of `F-Python-static-02`. The subsequent external-script formatting is outside their configured service scope. Full Python tests/build ran afterward.
- **Browser, build, Rust and native evidence:** accept the stated receipts. Subsequent changed documentation is not consumed by those gates. Browser frontend bytes match the final build, and native smoke used the identified final executable.
- **Evidence guard tests:** retain `F-Docs-R1-01`’s unchanged test leaf; the discovery-sensitive guard is renewed by `F-Docs-R1-02`.

These decisions use the original receipts, complete recorded discovery/input differences, installed records, host/tool readiness evidence and unchanged capture wrapper. No historical VCA/VAF/SAC PASS is reused.

**Findings:** none.

**Remaining uncertainty:** No unresolved issue blocks this reviewed scope. Synthetic observer tests do not establish a new real-inference zero-write result or universal OS write auditing. No new model/GPU, listening, full acquisition or personal installation journey is established. Those additional gates are not triggered by the inspected patch. Rust ignores remain unexecuted.

**Required next action:** Preserve this report and its immutable evidence references. Complete M3 documentation/archive work under a new review identity, renewing the affected documentation checks and rechecking identities. No implementation correction or additional runtime gate is required for the exact patch approved here.
