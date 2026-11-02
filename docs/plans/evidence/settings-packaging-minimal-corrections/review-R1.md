# Change Review Report

Review ID: **SPM-R1-20261101**
Task ID: **SPM-01–06**
Verdict: **CHANGES_REQUESTED**

Base commit and reviewed HEAD: `599b4cf4a446c006ae3262cfceac0f75e596a50d`
Branch: `codex/settings-packaging-minimal-corrections-plan`

Reviewed paths and identities:

- Closed 44-path manifest: `tmp/evidence/settings-packaging-minimal-corrections/R1-identities.json`
- Manifest SHA-256: `cba99821bec57d5744d4d2dd0beb874a924a66ecc896b29bfc69a0ca71e3c855`
- Complete tracked patch: `tmp/evidence/settings-packaging-minimal-corrections/R1-diff.patch`
- Patch SHA-256: `02143245e0eafb0edb0bf2d88262ba9b309b24210237ee97408279b04a355800`
- The untracked execution ledger was reviewed in full and is included in the manifest.
- Additional unchanged supporting documents inspected:

| Path | SHA-256 | Filter-aware blob |
|---|---|---|
| `docs/README.md` | `0e4da6650adc6c96fbdc81671e4c0a1e10fc93a0ab4b3c0977e520342a3f28ff` | `4d047e3553b3b979666ac23647ec621492a7385c` |
| `docs/product/mvp.md` | `965f4827342e95539d5a88a6a807441494c86fe771a4b89fc6a9ff97cf8ce5a3` | `5c6485013fd766988ba3887b7454fbac2bed1e01` |
| `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` | `a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae` | `16ba1a7002366ad9312223d51dace7902d6ae751` |

Identity recheck: **PASS.** Base/HEAD remained unchanged. All 44 supplied status, SHA-256 and filter-aware blob identities matched before and after review. The actual 16 changed/new paths exactly match the supplied list; the saved patch matches the actual tracked diff. The index remained empty. Additional supporting-document identities match the original G8 input inventory.

Acceptance review:

- **SPM-01:** Cleanup now precedes startup persistence. Configuration ownership prevents Play during the write. Contained reset requires released player/scheduler/operations and a stopped service with no generation or retained audio. Explicit recovery reset and no-autoplay behavior remain intact.
- **SPM-02:** Coordinator-backed startup rejection, language/profile rejection and partial-reset feedback are implemented and covered. One reachable fallback startup path remains silent; see F1.
- **SPM-03/04:** Piper prepares and verifies candidates before promotion, stages authority/evidence for explicit `write-manifest`, compensates partial promotion, retains failed-restoration backups and distinguishes post-commit cleanup failure.
- **SPM-05:** Chatterbox prepares archive, bounded parts and applicable receipt before final promotion. Failure coverage exercises real filesystem replacement and receipt verification. Sole-backup recovery and stale-part disposal are preserved.
- **SPM-06:** Exact Piper tuples are checked before build mutation and at core verification, consistently with native admission.
- No actionable regression found in the examined privacy, cancellation, bounded-memory, stable-locator, synchronization, profile or frozen-runtime boundaries. The patch does not change the canonical component topology.

Test evidence reviewed:

All results below are **supplied host-execution evidence**, not commands I ran. Original result/input hashes and output logs were inspected.

| Receipt | Command | Result |
|---|---|---|
| G2-desktop-r2 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/hardware-profile-compatibility.test.ts src/App.test.tsx` | Exit 0; 354 passed |
| G3-packaging-final | `uv run --project services/tts --locked pytest services/tts/tests/test_release_core.py services/tts/tests/test_release_chatterbox.py services/tts/tests/test_chatterbox_sources.py` | Exit 0; 136 passed |
| G4 TS leaves | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/desktop typecheck` | All exit 0 |
| G4 final Python leaves | `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python` | All exit 0 |
| G5-browser-r2 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep '"SPM-\|MAF-11\|EFC-07\|SAF-09"'`¹ | Exit 0; 6 passed |
| G6-core | `pnpm.cmd package:piper-core:check` | Exit 0 |
| G6-build | `pnpm.cmd build:desktop` | Exit 0 |
| G7-Piper | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | Exit 0 |
| G8 review leaves | `pnpm.cmd check:evidence`; `git diff --check` | Both exit 0 |

¹ Backslashes escape Markdown table separators; the recorded command contains ordinary `|` characters.

The changed inputs since earlier desktop/browser/core/build receipts are documentation and Chatterbox maintainer code/tests outside their consumed closure. Final Python receipts match current Python sources. The 251 shared/EPUB export identities match the examined retained gates. G8 review inventories match the current patch.

Installed inventories contain 24,009 identical entries between `2026-11-02T04:48:30.609Z` and `04:55:58.506Z`; this brackets browser/native/final Python execution, but does not independently bracket earlier desktop/static executions. Those earlier receipts retain their original source/configuration/lock/export/tool identities.

Core reuse is artifact-only: supplied evidence records 2,024 matching payload files and 26 unchanged runtime/authority inputs; a new core check ran. No historical behavioral PASS is credited. Native evidence binds binary SHA-256 `6c768facc28063fe639fd481fafa16153b89faf6f93e9ca5defc4c4fa7c38a06`, zero external requests/generated audio files, released audio ownership, identical restored resources, and no newly owned process or scratch identities.

Findings:

**F1 — P2: Fallback startup rejection still has no feedback**

- **File/symbol:** `apps/desktop/src/settings/ReaderSettingsDialog.tsx:157`, `NarrationStartSettings`; direct caller `apps/desktop/src/App.tsx:576`, `handleFallbackNarrationStartChange`.
- **Concrete trigger:** Replace a publication while prior narration containment remains pending or fails. The replacement publication can be ready while `narrationHandoff !== "ready"` leaves its coordinator undefined (`App.tsx:249`). Settings remains available for the ready publication (`App.tsx:836`), exposing hydrated fallback Quick/Prepared controls. A subsequent startup-preference write returns `unavailable`.
- **Consequence:** The saved/displayed previous value remains, but the user receives no fixed retry feedback. This leaves SPM-02 incomplete and contradicts the newly documented startup-rejection behavior.
- **Supporting evidence:** The fallback callback contract returns `void` (`ReaderSettingsDialog.tsx:59`) and is passed straight through at line 157. Its App handler handles only `result.status === "saved"` and discards rejection. The new SPM-02 test explicitly supplies a coordinator, so it cannot cover this branch.
- **Bounded correction criterion:** Carry the fallback operation’s result into the same bounded startup feedback behavior, preserving current values and future-version protection. Add regression coverage for a ready publication with absent coordinator, rejected fallback write, and successful retry clearing the error. No shared result hierarchy or broader settings redesign is necessary.

Remaining uncertainty: No additional blocking evidence gap identified for the submitted scope. F1 is established by source tracing; I did not execute a reproduction.

Required next action: Correct F1, rerun affected selected gates, and submit a new frozen patch/identity manifest for a new review ID. This report grants neither acceptance nor Git authorization and is not a Validation Report.
