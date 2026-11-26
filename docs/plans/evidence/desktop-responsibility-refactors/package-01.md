# Validation Report

Report ID: DRR-PACKAGE-01  
Target ID: desktop responsibility refactors, H/A/V/R/M  
Mode: PACKAGE  
Verdict: PASS  
Environment: normal local PowerShell, Node 22.23.5, pnpm 11.15.1, Rust 1.97.1, local Chromium and matching WebView2/EdgeDriver 158.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths and identities: both private input captures contain all 13 exact paths, statuses, worktree SHA-256s and filter-aware blobs. The following is the closed path set, grouped by the five immutable reports recording the same identities. All paths are under `apps/desktop/`.

| Unit | Paths |
| --- | --- |
| [H](H-post-01.md) | `scripts/tts-adapter-layout-host.mjs`, `scripts/tts-adapter-layout-host.node-test.mjs` |
| [A](A-post-01.md) | `src/App.tsx`, `src/App.test.tsx`, `src/persistence/reader-appearance-writer.ts`, `src/persistence/reader-position-save-coordinator.ts`, `src/persistence/reader-position-save-coordinator.test.ts` |
| [V](V-post-01.md) | `src/reader/ReaderPublication.tsx`, `src/reader/use-reader-viewport-input.ts` |
| [R](R-post-01.md) | `src-tauri/src/tts_service_supervisor.rs` |
| [M](M-post-01.md) | `src/tts/product-narration-coordinator.ts`, `src/tts/product-narration-coordinator.test.ts`, `src/tts/playback-episode-metrics.ts` |

Identity recheck: PASS. All 13 source identities, empty index, HEAD, package exports, toolchain, source discovery, dirty source hashes and existing plan/evidence bytes matched across the batch. The two captures, original package scripts, phase timings and immutable gate receipts are bound by `tmp/evidence/desktop-responsibility-refactors/DRR-M-PACKAGE-01/manifest.json`, SHA-256 `1166dce843f26ad61338477af58fb1d39297b8b9195a2da7656c90c05d68c3f3`.  
Commands and outcomes: the original `pnpm.cmd check` exited **1** in 40.62 s at its TypeScript lint leaf. Its earlier successful leaves are credited below. The original `pnpm.cmd check:portable` wrapper was not executed. The complete native and portable requirements were assembled from the configured leaves on the combined candidate.

| Gate and exact command or nested leaf | Result and coverage |
| --- | --- |
| PACKAGE-CHECK · `pnpm.cmd check` | `check:evidence` passed, `test:evidence` passed 34/34, and all three `format:check` leaves (TypeScript, Rust, Python) passed. The wrapper then stopped at `eslint .`. |
| PACKAGE-ESLINT · installed `eslint.cmd .` | Passed in 6.90 s in the verified candidate source view. This supplies the TS lint leaf for both aggregate graphs. |
| PACKAGE-LINT-RS · `pnpm.cmd run lint:rust`; PACKAGE-LINT-PY · `pnpm.cmd run lint:python` | Both Clippy configurations passed in 4.61 s; Ruff passed in 0.57 s. |
| PACKAGE-TYPES · `pnpm.cmd run typecheck` | Passed in 11.88 s. The TS leaf built shared/EPUB outputs and checked all configured workspace projects; mypy passed for 197 sources. |
| PACKAGE-TEST · `pnpm.cmd run test` | Passed in 387.03 s. Vitest passed 212 shared, 1,146 EPUB and 1,436 desktop cases. The desktop Node wrapper passed 297 tests, and the root portfolio fixture passed two. Rust passed 208 with nine ignored in default mode and 207 with ten ignored in release-locked mode. Python passed 1,298 with two skipped, plus one cache-write warning. The ignored-by-default F08 case was separately exercised on R's own candidate. |
| PACKAGE-BUILD · `pnpm.cmd run build` | Passed in 30.10 s, including `build:packages`, ordinary Tauri `build:desktop` and `build:python`. Captured renderer/package exports, ordinary binary and Python artifacts. |
| PACKAGE-VITE · `pnpm.cmd --filter @voxleaf/desktop build` | Passed in 1.01 s. This is the portable-specific Vite leaf. Its package prerequisites and Python build are covered in PACKAGE-BUILD. |
| PACKAGE-CHROMIUM · `pnpm.cmd test:browser` | All 115 passed in 360.03 s. The two M RIA-03 cases ran inside this single full execution. |
| M-PIPER · English packaged arm | Passed in 129.07 s on PACKAGE-BUILD's ordinary executable. The exact invocation, cleanup and metrics are in the [M report](M-post-01.md). |

Reused gates: the shared leaves mapped above have the same scripts, arguments, lockfiles, installed dependencies and candidate inputs for both configured aggregate graphs. The portable wrapper uses TS/Python format and lint, both typecheck leaves, TS/Python tests and package/Vite/Python builds; its only exclusive leaf is the separately executed PACKAGE-VITE. The successful evidence and format commands in the interrupted wrapper were not repeated. The H/A/V/R source identities were checked against their earlier independent reports; those reports retain their original unit-specific observations and executable identities.  
Acceptance boundary: BATCH, combined runtime and package foundation.  
Pending batch gates: final documentation/archive validation on the resulting record.  
Preparation/cleanup: `eslint .` in the actual worktree discovered three ignored files from a Nov 23 historical experiment under `apps/desktop/tmp/nov23-reader/` and reported 3,748 errors exclusively in that scratch. The isolated source view included all 1,970 tracked and untracked candidate files with matching bytes, including the new modules, tests and ESLint config. Node resolved all ESLint plugins to identical installed paths in both locations. The temporary dependency junction was removed. Original historical files, source and copied bytes were rechecked. Isolated technical receipts and a source snapshot remain in ignored scratch. The packaged run used one ordinary executable and process-local model settings.  
Retries: the initial isolated pnpm invocation stopped before ESLint because the relocated workspace triggered dependency-install confirmation. The original `node_modules/.bin/eslint.cmd .` executed the configured leaf directly with the same plugin and dependency resolution. No dependency reinstall, historical-file move or gate-weakening flag was used.  
Diff scope: PASS. The runtime changes match the five closed unit sets. Plan and evidence records are separate from runtime paths.  
Invariant review: PASS for the declared five units and combined gates. The tagged unit reports document detailed invariants, coverage limits and executed host cases.  
Test-integrity review: PASS. Test discovery remained enabled in the underlying package wrappers and the full Chromium run. Existing Rust ignored and Python skipped cases are reported separately.  
Privacy/artifact review: PASS. Source scope contains no books, model weights, generated audio, secrets or unrelated runtime artifacts. Existing [A shared baseline](A-shared-baseline-01.md) remains byte-identical, SHA-256 `2c6c905dc5c9ea66844b0d588dabd226645c022a99c1e4b5af9ece153832f52f`. Its link to the active plan records the original location and will be historical after archival.  
Action required: complete archive and documentation verification.
