# Change Review Report

Review ID: **SPM-R2-20261102**
Task ID: **SPM-01–06**
Verdict: **APPROVE**

Base commit and reviewed HEAD: `599b4cf4a446c006ae3262cfceac0f75e596a50d`
Branch: `codex/settings-packaging-minimal-corrections-plan`

Reviewed paths and identities:

- Closed 45-path manifest: `tmp/evidence/settings-packaging-minimal-corrections/R2-identities.json`
- Manifest SHA-256: `abe366f9fe99bc724dc0e3fa33ead6e83244aff054cfb9c6567e354999de0f3f`
- Complete tracked patch: `tmp/evidence/settings-packaging-minimal-corrections/R2-diff.patch`
- Patch SHA-256: `bb05a03507305388f358833a742d986226d86e949265e136a09a31398de8f404`
- Untracked execution ledger and immutable R1 report are included in the manifest.
- Supporting `docs/README.md`, `docs/product/mvp.md`, and `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` retain the exact supplementary identities recorded in SPM-R1-20261101, independently rechecked for R2.

Identity recheck: **PASS.** Before/after inspection matched all 45 status, SHA-256 and filter-aware blob identities. Actual changed/new membership matches the supplied 19-path list. The saved patch matches the actual tracked diff. Base/HEAD remained unchanged and the index remained empty.

Acceptance review:

- **R1 F1 resolved.** The fallback startup callback now returns its acceptance result. Both startup routes use the same local pending/rejection presentation. The mounted App regression opens a ready replacement publication while the old coordinator’s close remains pending, verifies rejected persistence preserves Quick with feedback, and verifies successful retry selects Prepared and clears that feedback.
- **SPM-01:** Cleanup and eligibility precede startup persistence; contained reset preserves explicit recovery and no-autoplay requirements. Failed cleanup retains ownership and the previous preference.
- **SPM-02:** Coordinator and fallback startup rejection, language/profile rejection and partial-reset feedback meet the approved behavior. Feedback remains fixed and content-free.
- **SPM-03/04:** Piper prepares the complete verified candidate before promotion and includes authority/evidence in explicit `write-manifest` promotion. Compensation, retained recovery backups and truthful post-commit cleanup semantics remain covered.
- **SPM-05:** Chatterbox stages bounded parts and the applicable receipt before replacement. Failure and retry handling preserve the reviewed output-set guarantees.
- **SPM-06:** Early and verification-time exact Piper tuple validation remains consistent with native admission.
- No additional actionable regression found in public contracts, stale ownership, cancellation, bounded memory, EPUB privacy, stable locations, synchronization or persistence. Frozen runtime authorities and component topology remain unchanged.

Test evidence reviewed:

These are **attributed local PowerShell host results**, not tests executed by the reviewer. Original receipts, command output and matching input inventories were inspected.

| Receipt | Command | Outcome |
|---|---|---|
| G1-F1-red | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx -t 'SPM-F1'` | Expected failure at missing feedback |
| G2-desktop-F1-formatted | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/hardware-profile-compatibility.test.ts src/App.test.tsx` | Exit 0; 355 passed |
| G4-ts-format-R2 | `pnpm.cmd format:check:typescript` | Exit 0 |
| G4-ts-lint-R2 | `pnpm.cmd lint:typescript` | Exit 0 |
| G4-ts-types-R2 | `pnpm.cmd --filter @voxleaf/desktop typecheck` | Exit 0 |
| G5-browser-F1 | Recorded six-case SPM/MAF-11/EFC-07/SAF-09 selector, with preserved Windows quoting | Exit 0; 6 passed |
| G6-build-F1 | `pnpm.cmd build:desktop` | Exit 0 |
| G7-Piper-F1 | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | Exit 0 |
| G8-evidence-R2 | `pnpm.cmd check:evidence` | Exit 0 |
| G8-diff-R2 | `git diff --check` | Exit 0 |

Accepted retained current-task evidence:

- **G3-packaging-final:** Three selected Python suites, 136 passed.
- **G4-py-format-final / lint-final / types-final:** All passed.
- **G6-core:** Current Piper package verification passed.

The original retained result/input hashes match `R2-retained-evidence.json`. Independent inventory comparison found no changed consumed Python/core inputs. Differences are desktop code/tests, Markdown and, for Piper verification, unrelated Chatterbox maintainer code/tests. No historical behavioral PASS supplies acceptance.

The browser receipt predates a formatting-only change to `App.test.tsx`; this test file is outside the browser runner and renderer’s consumed inputs. Final desktop/static/build/native receipts match current relevant source. The 251 shared/EPUB export identities remain unchanged.

Installed F1 inventories bracket renewed validation from `05:03:35.430Z` to `05:09:32.699Z`, with 24,009 identical entries and unchanged captured environment. They also match the initial installed inventory.

The replacement native arm uses binary SHA-256:

`86aee8fcd5aa92db9a496efd8bbee8dd6bd6178821748bccf69fbe890a3db679`

Native evidence records zero external requests/generated audio files, five created and closed audio contexts, zero retained/discarded units after cleanup, and no stale playback. Resource inventories match byte-for-byte; restoration evidence reports the recovery sibling absent and no new owned processes or scratch roots. The first binary/native arm is superseded, not reused.

The case-insensitive receipt collision is documented. The restored original G2 input snapshot matches its previously recorded SHA-256 and identical independent receipt copies. Final desktop acceptance uses the distinct `G2-desktop-F1-formatted` receipt. Retained failed attempts were not relabeled as passing.

Findings: **None.**

Remaining uncertainty: **None blocking the approved scope.** No full Rust/GPU/EPUB matrix, six-rate campaign, new installer matrix or crash-atomic packaging guarantee is claimed.

Required next action: **None for this frozen behavioral patch.** Archival/index/report additions require the planned new exact-patch assessment because they change reviewed identities. This approval is neither a Validation Report nor permission to commit, push or create a pull request.
