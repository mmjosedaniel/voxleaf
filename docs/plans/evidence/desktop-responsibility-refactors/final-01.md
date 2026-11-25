# Validation Report

Report ID: DRR-FINAL-01  
Target ID: archived desktop responsibility refactors, H/A/V/R/M  
Mode: FINAL  
Verdict: PASS  
Environment: normal local PowerShell at the repository root, pnpm 11.15.1, Node 22.23.5, the same checkout and installed toolchain as the accepted batch.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths: the 13 runtime and test paths individually listed in the [package report](package-01.md), both plan locations (the old active plan is ABSENT), `docs/README.md`, `docs/plans/active/README.md`, `docs/plans/completed/README.md`, and the following 14 existing files under `docs/plans/evidence/desktop-responsibility-refactors/`. This newly issued report is separately sealed outside the evaluated path set.

| Existing public records | File names |
| --- | --- |
| Planning | `plan-review-r01.md`, `plan-review.md`, `plan-closeout.md` |
| H | `H-baseline-01.md`, `H-post-01.md` |
| A | `A-shared-baseline-01.md`, `A-post-01.md` |
| V | `V-baseline-01.md`, `V-post-01.md` |
| R | `R-baseline-01.md`, `R-post-01.md` |
| M and batch | `M-baseline-01.md`, `M-post-01.md`, `package-01.md` |

Validated path identities: `tmp/evidence/desktop-responsibility-refactors/DRR-FINAL-01/paths-before.json`, SHA-256 `c3c9bf6a863191a2d95b4b4a32befa21913f9b02284e6548b1fdfc9a314ba2e3`, lists each of the 32 paths, its exact Git status, worktree SHA-256 and filter-aware blob. The three new modules are included.  
Identity recheck: PASS. The final receipt directory holds the after-command identities and the separately hashed public report. Its `manifest.json` binds both captures, the exact commands, their start/end times and exit status. The full HEAD, source paths, input discovery, dirty source hashes, package exports and toolchain match the accepted batch, with an empty Git index.  
Commands and outcomes: `git diff --check HEAD --` exited 0. The pre-issue archive verifier found 12 plan sections, five completed milestones, 76 existing local references and one reserved final-report link. After publication, `pnpm.cmd check:evidence` passed and the same verifier resolved the final link, this report's links and the affected index links. The only historical link exception is the one below. The raw verifier is `DRR-FINAL-01/verify_archive.py`.  
Reused gates: [DRR-PACKAGE-01](package-01.md), raw manifest SHA-256 `1166dce843f26ad61338477af58fb1d39297b8b9195a2da7656c90c05d68c3f3`, and its five unit reports. All 15 original baseline, post-change, package and accepted worker receipt identities qualified. Hashing verified 176 files recorded by their manifests. All earlier independent public reports retained their issued bytes. The [planning closeout](plan-closeout.md) now points to the archived plan. The archive changes affect Markdown paths and indexes; searching the runtime, build and test sources found no references to the renamed document or indexes and no plan-directory discovery consuming them. The Markdown evidence guard was renewed.  
Acceptance boundary: FINAL, local worktree.  
Pending batch gates: none.  
Preparation/cleanup: the source snapshot and raw receipts remain in ignored scratch. The isolated lint dependency junction is absent. Historical scratch files retained their original hashes. The ordinary executable still matches the packaged Piper witness. No recorded native executable, driver, English Piper interpreter or Playwright listener on port 4173 remained active. Piper reported zero retained/discarded units, generated audio files and external requests.  
Retries: none at final verification. The package report retains the earlier wrapper and isolated-pnpm failures, with the subsequent exact ESLint leaf and downstream results.  
Diff scope: PASS. The five accepted units, archive/index changes and public evidence exhaust the worktree changes. The [completed plan](../../completed/desktop-responsibility-refactors.md) is the canonical location. The immutable A baseline still cites its original active location. Its SHA-256 remains `2c6c905dc5c9ea66844b0d588dabd226645c022a99c1e4b5af9ece153832f52f`; the same section exists in the archived plan. Historical planning review citations retain their original scope.  
Invariant review: PASS for the approved bounded changes and their local acceptance gates. All five completed milestones trace to their distinct baseline and candidate evidence.  
Test-integrity review: PASS. Final verification reused the same 115-case Chromium run, coordinator and package tests, and native witnesses already accepted. The root `pnpm.cmd check` invocation exited 1 on ignored historical scratch. Its configured leaves passed on the candidate, including the separately verified `eslint .` leaf. Portable coverage was assembled from leaves. Reported limits include the Rust ignored and Python skipped cases, one exercised Piper profile, and structural review of touch/cancel/blur on detach.  
Privacy/artifact review: PASS. The public evidence contains Markdown summaries. Model files, audio, private logs and the source snapshot remain outside submitted paths.  
Action required: none for the scoped local campaign.
