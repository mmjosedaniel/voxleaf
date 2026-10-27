# Minimal narration and Chatterbox correctness corrections

## Goal

Correct the five findings below in their existing owners, with the smallest justified changes and the smallest validation set that still demonstrates the affected behavior. Do not redesign narration, recovery, acquisition, storage contracts or packaging.

Planning date: **2026-10-27**. Source baseline: **`fd333f6e387723640091f00362ded8014fc0cb6b`**, clean `main`. Working branch: **`codex/narration-chatterbox-correctness`**. The descriptive filename spans narration, hardware compatibility and optional-package tooling rather than one roadmap milestone.

**Authorization: planning only.** The user authorized this ExecPlan, its branch and one local documentation commit. Implementation, regression execution, builds, model work, push, PR, merge and publication are not authorized in this turn. Every validation command below is a future command unless explicitly described as an inspected historical receipt. Future implementation requires a separate instruction.

**Execution authorization, 2026-10-27 (supersedes the preceding restriction):** The user explicitly authorized implementing NCC-01 through NCC-05 and the validation strategy below on the existing branch at planning commit `e3471ce4ba92077e27fd6a8de4e82c733a3cd582`. Preserve the planning history. Leave all changes uncommitted; no push, PR, merge or publication. Initial branch/HEAD match, index empty and worktree clean. Apply `investigate-bug` and require independent `change_reviewer` approval of the exact final patch.

## User-visible outcome

| ID | Trigger | Required result |
| --- | --- | --- |
| NCC-01 | The last unit's frame counter reaches its end before its queued `ended` callback arrives. | Persist its exact heard end before ending narration persistence; subsequent manual reading and explicit restart remain functional. |
| NCC-02 | Returning from hidden visibility triggers a hardware check that changes or rejects the selected profile during narration. | Contain obsolete narration before applying the changed selection. An unchanged admissible selection preserves playback. Restart and recovery remain explicit. |
| NCC-03 | A download fails, its cause is resolved, and the user chooses the advertised retry/check action. | Reach a usable explicit confirmation/retry state without restarting VoxLeaf or removing an otherwise valid package. No network request occurs before download confirmation. |
| NCC-04 | The executable and application-local optional-data destination are on different volumes. | Chatterbox storage eligibility uses the actual managed data destination, including before its `tts` directory exists. |
| NCC-05 | Maintainer packaging moves the old target aside and then fails to promote staging. | Restore the previous valid target, or preserve its recoverable backup if restoration fails; a later attempt cannot delete that sole surviving previous tree before recovery. |

NCC-05 concerns the maintainer's generated package tree, not an installed user's Chatterbox directory. NCC-01 is a source-confirmed ordering defect, not a measured runtime reproduction or frequency claim. NCC-02 establishes selection/runtime inconsistency, not a proven crash. NCC-03 applies to cached terminal acquisition failures, not every possible package error. NCC-04 requires different storage locations to expose the wrong-volume decision.

## Current state

At the planning checkpoint, the audit and follow-up verification read production code, callers and existing tests; no tests or builds had been executed and no source files had been changed. The execution log and final results below record the subsequently authorized implementation.

- **NCC-01:** `AdaptivePcmPlayer.#refreshProgress` can account every remaining frame without publishing `segment-completed`. The scheduler then becomes complete; `ProductNarrationCoordinator.#tick` makes play intent inactive. The persistence bridge calls `finishNarration`, and `ReaderPositionSaveCoordinator.recordHeardCheckpoint` rejects the later completion. The real direct backend derives frames from `AudioContext.currentTime` separately from `source.onended`. Existing NLC-02 integration uses a backend whose counter is always zero and delivers `ended` before the tick; CLB-02 controls delayed callbacks around Pause, not this final persistence ordering.
- **NCC-02:** `bindHardwareCompatibilityChecks` fires `check("operating-system-resume")` without reconciling the narration owner after settlement. The hardware coordinator can replace `activeProfileId`; Settings observes it, but the narration owner has no corresponding subscription. Manual recheck calls `resetRecoveryEpisode` and reaches the existing containment logic. Reuse that containment responsibility without automatically resetting a spent recovery episode.
- **NCC-03:** download failure stores `Operation.state = Failed`. `snapshot_with_manifest` returns that cached operation before examining disk. The failed-state button normally calls `client.refresh`, which only invokes that snapshot. The existing explicit `select_at` route can move an idle Failed operation to Confirming while preserving active-worker guards. Existing native B07 coverage already demonstrates this state transition after cleanup failure.
- **NCC-04:** `windows_probe::application_volume` uses `current_exe().parent()`. The renderer matcher uses that quantity to admit Chatterbox; its native destination is `app_local_data_dir()/tts`. Native download admission separately checks the correct destination. Do not remove that second check or change capacity thresholds.
- **NCC-05:** `release_chatterbox.build_package` deletes an existing `.previous`, moves target there, then calls `staging.replace(target)` with only a staging-cleanup `finally`. There is no restoration handler. `release_core.atomic_stage` illustrates local rollback, but embeds core-specific naming and is not a generic helper to import unchanged.

### Inspected historical validation and reuse decision

Sources are the completed [lifecycle follow-up](../completed/lifecycle-correctness-follow-up.md#final-validation-results), completed [narration corrections](../completed/narration-logic-corrections.md#final-validation-results), their review records, and retained local receipts. Nothing in this table was rerun during planning. No fresh CI status was queried.

| Evidence | Verified historical result | Decision for this plan |
| --- | --- | --- |
| LCF `I1-result.json`, `I1-continuation-results.json`, logs and before/after manifests | `pnpm.cmd check` exited 1 at Prettier. Its evidence stages passed; the subsequent `format:check`, `lint`, `typecheck`, `test` and `build` commands each exited 0. `I1-test.log` records shared 209, EPUB 680, desktop 844, Node 101, Rust 123/122 passed with two ignores per configuration, and Python 645. | Reuse as inspected baseline context; do not run another full baseline before edits. Do not relabel the failed aggregate as a passed command or use it to approve changed owners. |
| LCF `B1-final-result.json` and `B1-final.log` | One real Chromium/synthetic-service LCF case passed, 55.2 seconds total. Its log hash matches the independent report. | Reuse its fixture and assertions. New completion ordering changes consumed playback inputs, so this old browser result cannot replace NCC-01's new browser case. |
| LCF R01/R02 independent review | R01 approved implementation; R02 approved documentary closeout. The inspected R02 manifest has 1,383 records. | Not approval of this patch or exact current baseline: two test files and `docs/development/testing.md` differ from R02. The test differences add Windows traverse-privilege handling in `windows-release.node-test.mjs` and `#[cfg(windows)]` on the real-download staging race in `tts_optional_chatterbox/tests.rs`. Preserve both. |
| NLC R02/R03 and H1/H2 receipts | Final Piper EN arm exercised six rates; final Chatterbox ES H2 exited 0 in 403.8935 seconds after the earlier missing-runtime failure was resolved. H2 result hash still matches its review. | Historical evidence for unchanged DSP/model/voice responsibilities; not current playback, native admission or installed-state acceptance. No new quality, GPU or six-rate campaign is justified by this scope. |
| Existing package/model payloads, frozen authority and lockfiles | This plan changes none of their bytes or identities. Receipt identity is distinct from a currently installed artifact's identity. | Reuse existing verified prerequisites if later needed and recheck their manifests first. Do not rebuild/download models or regenerate release authority merely because maintainer promotion code changes. |

Planning compared the LCF I1 continuation's recorded filter-aware blobs with the clean current index. Of 1,382 recorded entries, seven differ or are absent: the two test paths above and five documentation/archive paths. All other recorded source/configuration blobs match, including the three dependency lockfiles and all five production areas under investigation. Its before/after path-identity arrays match each other. This is a source comparison, not proof of current toolchain, installed-package or hardware state, and not a new passing test receipt.

Retrievable evidence is under ignored `tmp/evidence/lifecycle-correctness-follow-up/`; preserve it unchanged. Content identities checked during planning:

| Receipt | SHA-256 |
| --- | --- |
| `I1-continuation-before.json` | `2f9c0b82faf9017981b99a4c07bbdf67a2f576e2bbe26c09a4862c434a9e39bd` |
| `I1-continuation-after.json` | `b2175268fc9595bce65be4f94ac36cc6819054f7202ed11923c2db2cc90d5647` |
| `I1-continuation-results.json` | `03dea7a8d5621d1710958b7b577db8d035b9dfd593c5e1a9ae98353ff0e19149` |
| `I1-test.log` | `282d6c8cdb97d117af0c0a01bb1b09e6d1a7560d9fb57647315cf842eff1b9fe` |
| `B1-final.log` | `1c197deea79c2751ae9b7eff79d9a44230d6669f198691912814303c181f9133` |
| `change-review-R02.md` | `19a1eb2294ed2a8ec80d0b3bff031b16e0407f5d8d0fe95ecbfe96aa45aa49ff` |

NLC's retained `tmp/evidence/narration-logic-corrections/H2-R03-result.json` hashes to `d20a46de397bed9353c8f6b45a8801c4035ad6f116ca76df1e891a16f562801b`. The NLC final executable identity was `4c60a4ee9829983b6f6340c0df50def6513bc0723e93561b43e9dddbe614ecd8`; no claim is made that the current executable or installation still has that identity.

## Scope and non-goals

One behavioral integration batch, with four implementation units: NCC-01; NCC-02; the related NCC-03/04 acquisition presentation/admission boundary; and NCC-05 maintainer promotion. This is not a refactor campaign; do not add auditor/worker/validator orchestration or an expensive baseline per unit.

Preferred change envelope (a list of eligible owners, not a requirement to edit every file):

| Unit | Existing production owners | Existing test owners |
| --- | --- | --- |
| NCC-01 | `apps/desktop/src/tts/pcm-playback.ts`; coordinator only if the player correction cannot establish completion ordering | PCM and coordinator tests; existing persistence bridge/save tests as controls; existing browser correction spec |
| NCC-02 | `apps/desktop/src/tts/hardware-compatibility-check-binding.ts`, `apps/desktop/src/App.tsx`; existing coordinator refresh path if necessary | Binding, App and coordinator tests |
| NCC-03 | `apps/desktop/src/tts/OptionalChatterboxControls.tsx`; client/native manager only if existing explicit selection cannot satisfy the correction | Controls/client tests; existing `tts_optional_chatterbox/tests.rs` state-transition controls |
| NCC-04 | `apps/desktop/src-tauri/src/host_profile_detection.rs`, `host_profile_detection/windows_probe.rs`; `main.rs` and existing optional-root configuration only as needed to use the same private Tauri-derived root | `host_profile_detection/tests.rs`; matcher tests only if matcher behavior changes |
| NCC-05 | `services/tts/src/voxleaf_tts/release_chatterbox.py` | `services/tts/tests/test_release_chatterbox.py` |

Extend existing harnesses; no new test framework, commands, dependencies, persisted settings, IPC fields, diagnostics exports or generalized transaction service. No DSP changes, model/voice upgrades, inference tuning, normalization/EPUB edits, installer changes, HTTP transport changes, new package version, new storage threshold or automatic failover. Do not edit frozen authority, generated manifests, historical evidence or completed plans.

## Relevant files and documentation

Execution starts by reading `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`, the [bug skill](../../../.agents/skills/investigate-bug/SKILL.md), [testing guide](../../development/testing.md), [independent review workflow](../../development/agentic-change-review.md), and [evidence retention policy](../../development/evidence-retention.md).

Product/architecture references: [MVP](../../product/mvp.md), [reader settings](../../product/reader-settings-and-playback-controls.md), [overview](../../architecture/overview.md), [canonical diagram](../../architecture/system-diagram.md), [synchronization authority](../../architecture/synchronization-authority-v1.md), [hardware/recovery authority](../../architecture/hardware-profile-recovery-authority-v1.md), ADR-0019 and ADR-0062. The [roadmap](../roadmap.md) retains current milestone/model status.

Command authority: root and desktop `package.json`, desktop Vite/Playwright configuration, native `Cargo.toml`, `services/tts/pyproject.toml`, and the existing foundation workflow. Use the [validation policy's evidence-reuse proof](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md#revalidate-changed-evidence-not-everything-by-default) as a conservative evidence rule, without importing refactor-specific roles or baseline requirements.

## Architecture and constraints

Keep local-only EPUB/inference, memory-only generated audio, existing queue/buffer ceilings, stable locator ranges, exact audible-boundary persistence and identity-first containment. Preserve Pause, explicit Stop/navigation/restart, one-child ownership, zero automatic service retry, and no work from a replaced book.

The final completion event remains authoritative; do not infer a heard end from elapsed wall time, relax persistence's inactive/stale guards, retain all completed units, add a completion delay, or flush more frequently to conceal the ordering defect.

Automatic hardware reconciliation must not reset a spent recovery budget, start an engine or switch a running engine silently. Storage paths stay native-private; the existing bounded report field/schema and thresholds remain unchanged. The product stores optional data at its existing root; only the probe's source location is corrected. Unknown or denied storage remains fail-closed.

Package retry is an explicit state transition through existing admission/confirmation. Preserve active worker/cancellation identity, installed data, lock order and diagnostics. A read-only snapshot must not erase all failures or reset an active operation as a shortcut.

Promotion rollback is confined to this build's exact target/staging/backup under its output root. Keep verification before promotion. Do not operate on installed runtime/user data or regenerate frozen package bytes to test directory transitions.

Review the canonical diagram after the patch. These corrections are intended to preserve its components and flows; update it only if actual architectural wiring changes. Document the corrected retry UX, automatic reconciliation and storage meaning in maintained product/development guidance. An additive ADR is needed only if a durable existing authority actually changes; no schema change is planned.

## Milestones

### 1. Establish minimal regressions and readiness

**Status: Implemented, validated and independently accepted by NCC-R02-20261027.** After execution authorization, confirm the branch/base, empty index, scoped dirty paths and required tool versions. Inspect saved receipts before launching anything. Reuse the baseline investigation above; do not run a full repository baseline. Build workspace packages only if consumed ignored `dist` outputs are missing or stale.

Add small regressions immediately before their owner fixes. Tag new TS/browser cases `NCC`, native cases `ncc_`, and Python cases `ncc_` so pre-fix runs select only the new behavior. A passing pre-fix test requires reassessing the hypothesis, not weakening its assertion. Existing correct controls need no artificial red result. Synthetic EPUB/PCM, injected hardware/path probes and temporary package trees are sufficient; no private book, model or real network is needed.

### 2. NCC-01: publish the exact end before terminal persistence

**Status: Implemented, validated and independently accepted by NCC-R02-20261027.** Prefer a local player completion-ordering repair. A terminal observation must not release narration persistence while its matching audible completion remains pending. Preserve one-time event delivery/payload release, Pause semantics, transition pauses and stale callback rejection. Change coordinator/bridge code only if this cannot be established at the player boundary.

Regression: counter reaches the final frame, an intervening coordinator tick runs, then `ended` arrives. Compose the real player, coordinator, bridge and save owner; verify the end locator is stored, completion fires once, manual reading can then save and explicit restart works. Cover normal event-first order and a stale callback after Stop using existing controls. Parameterize direct `1.00x` and one WSOLA rate (`0.75x`); no six-rate DSP matrix. The browser case must retain the real audio implementation and delay only completion delivery, not fake the completion state being tested.

### 3. NCC-02: reconcile automatic hardware results with the current owner

**Status: Implemented, validated and independently accepted by NCC-R02-20261027.** Connect settled automatic checks to the current narration owner through the existing refresh/containment API. Guard closed/replaced owners and overlapping checks; preserve the binding's one effective listener and StrictMode cleanup. Do not route visibility changes through an unconditional recovery-episode reset.

Extend the current visibility/App tests with one changed-profile playing run, one unavailable-profile paused run, unchanged admission, and late settlement after replacement/close. Avoid a redundant cross-product of every state. Assert containment before policy change, no automatic restart, no duplicate probe/listener and no stale owner callback. Reuse the existing NLC-03 coordinator tests for stop/availability races rather than duplicating their full matrix.

### 4. NCC-03/04: repair retry and storage eligibility

**Status: Implemented, validated and independently accepted by NCC-R02-20261027.** For cached terminal acquisition failures, prefer connecting the advertised action to the existing explicit selection/confirmation operation, with honest action text. Preserve integrity recheck and removal-specific recovery where they are the correct actions. Do not globally clear the native operation in every snapshot. The UI regression should demonstrate failure, corrected prerequisite, explicit retry, fresh confirmation and zero download calls until confirmation; use the native B07 transition/busy controls as supporting coverage.

For storage, derive the measurement from the same Tauri application-local root used by optional acquisition. Reuse existing private configuration/plumbing; do not expose a filesystem path in IPC or build another storage service. When the managed leaf is absent, measure an existing ancestor on the destination volume without creating/deleting user data; permission or resolution failure must not fall back to the executable volume. Keep native download's independent free-space check.

Native regression uses distinct executable/data paths and injected free-space values to prove which path drives the report: low executable space with adequate destination, insufficient destination, and missing-leaf/unknown cases. It must test production path selection, not only feed fabricated quantities to the renderer matcher. No physical second disk or multi-gigabyte fixture is required. If Tauri setup/IPC wiring changes, include the existing model-free native startup gate described below.

### 5. NCC-05: restore or retain the previous package on promotion failure

**Status: Implemented, validated and independently accepted by NCC-R02-20261027.** Add bounded rollback around the existing move/promotion sequence. Restore the previous target when promotion fails; preserve its backup and report failure if restoration itself fails. An orphaned `.previous` with no target is recovery input, not disposable stale data. Do not delete it before recovery on the next attempt. Remove the backup only when a valid target safely exists. Avoid extracting a generic transaction abstraction.

Use tiny temporary package trees and fault injection at the actual rename boundary. Cover failed staging promotion after backup creation, failed restoration with a subsequent retry, and success with an unrelated sentinel preserved. Exercise the builder's real promotion path while stubbing expensive preparation/downloads; perform real filesystem moves except for the specifically injected rename failure. Retain v6 synchronization/source-integrity controls and historical layout compatibility without building a real runtime.

### 6. Combined acceptance and independent review

**Status: Implementation acceptance complete under NCC-R02-20261027; final documentary review is recorded separately in the closeout report.** Finish the selected gates, freeze source/tests/docs and record identities. Delegate one `change_reviewer` (GPT-6 Astra high), supplying the exact patch, scope, host receipts and explicit reuse/omission decisions. The reviewer does not edit or run tests. Resolve findings and obtain APPROVE for the exact patch; missing required evidence or reviewer remains blocked. Historical approval does not satisfy this gate.

Review the final diff for unrelated work, preserve original receipts and record cleanup. Archive this plan only after implementation acceptance. This planning commit grants no later implementation commit, push, PR or release authorization.

## Testing and benchmark strategy

### Minimum execution policy

All future checks run in normal local PowerShell outside the managed sandbox, from the repository root unless the command selects its own project. No tests, formatters, builds or benchmarks run during planning. Git diff/index inspection for the authorized documentation commit is separate from implementation validation.

Run only new regressions for pre-fix evidence. Group TS cases in one invocation when prepared together; native and Python require their own runners. After fixing a unit, run its new cases, not an entire package suite. The complete existing controls run once in the final foundation check. Do not repeat focused green runs after that final check unless consumed inputs changed or a failure needs diagnosis.

| Gate | Existing command with bounded selection | Purpose / timing |
| --- | --- | --- |
| R-TS | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts src/tts/hardware-compatibility-check-binding.test.ts src/App.test.tsx src/tts/OptionalChatterboxControls.test.tsx -t NCC` | New NCC-01/02/03 regressions before/after fixes. Remove files with no new cases; include client tests only if that owner changes. Existing bridge/save/NLC/LCF controls are included by I1. |
| R-Rust | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml ncc_` | New NCC-04 path-selection regressions, plus NCC-03 manager regression only if native behavior changes. Default configuration for red/green; both feature configurations run once through I1. |
| R-Python | `uv run --project services/tts --locked pytest services/tts/tests/test_release_chatterbox.py -k ncc_` | NCC-05 promotion/rollback controls with synthetic trees. No real environment sync, package build or network. |
| B1 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep NCC` | One focused end-ordering/persistence journey, using direct and one slow-rate arm. Real Chromium audio, mounted reader and save/reopen; synthetic service only. The configured wrapper builds required packages and the frontend; do not add duplicate build commands. |
| I1 | `pnpm.cmd check` | One final authoritative foundation attempt after all fixes and docs: evidence, format, lint, types, TS/Node/Rust/Python suites and builds. No full baseline, no per-bug full check, no separate default/release Rust matrix beyond this command. |
| N1, conditional | `node apps/desktop/scripts/native-startup-smoke.mjs` | Only if NCC-04 changes Tauri setup/command wiring, or native initialization cannot be established by focused tests. Reuse I1's exact executable instead of the wrapper that builds again. Model-free integration; do not label it a two-disk or inference test. |

`pnpm.cmd build:packages` is preparation only when current shared/EPUB outputs are missing/stale for direct Vitest use; otherwise reuse them after input comparison. The root build/typecheck/browser scripts already manage their own prerequisites. Preserve command dependency order.

There is intentionally one broad final check despite the user's minimum-test objective: it is the repository's required foundation gate and includes required lint/type/build coverage. The main savings are no broad baseline, no broad run per finding, narrow red/green selections, one browser journey and no unnecessary model/installer campaign. Do not invent a measured speedup.

If I1 fails, retain the failure and continue only its failed/unexecuted stages after repair. Reuse already-passed stages only with their complete unchanged input/environment proof; otherwise rerun the affected stages. Report the actual leaf commands and outcomes, never a fictional successful aggregate. A one-off infrastructure retry needs a specific corrected condition; a second failure requires diagnosis, not an until-green loop.

### Reuse versus omission

An individual old PASS can replace a future execution only when its original immutable receipt records command, result and complete execution-time inputs; all consumed source/transitive imports, tests, fixtures, configuration, locks, toolchain, discovered file membership, generated artifacts and relevant environment remain identical; and the current independent review accepts that dependency comparison. Never reconstruct missing historical identities after the fact. Changed tests invalidate their gates even if production is unchanged. Document-only edits do not automatically invalidate unrelated code receipts, but the final patch still needs current review.

No historical whole-suite, browser, native or binary result is preapproved as a passing gate for these fixes. The inspected receipts legitimately avoid a new broad baseline and unnecessary exploration. They also identify reusable unchanged fixtures, controls and immutable prerequisites. Unchanged responsibility outside this patch is an omission decision, not a newly reused acceptance PASS.

| Omit by default | Reason | Reopen only when |
| --- | --- | --- |
| Full pre-change foundation and full suites after each fix | Existing baseline evidence plus discriminating red cases; one final I1 covers integration. | A specific pre-existing failure needs a baseline comparison; select that check only. |
| Local `check:portable`, separate full format/lint/type/build and full Rust feature runs after green I1 | Duplicate leaves of I1. Required remote CI remains unchanged. | A changed input invalidates a leaf, or a genuinely platform-specific change requires the applicable platform gate. |
| Standalone complete EPUB/shared, normalization, queue, persistence and Settings suites | No normalization/contracts/queue change; existing controls already execute in I1. | Diff crosses those responsibilities or focused findings show a missing assertion. |
| Full Playwright suite, image-delay/large-book/layout benchmarks | B1 targets the only new real-audio ordering issue; no ingress/rendering/layout change. | The patch changes those boundaries or the scoped browser test cannot prove the corrected path. |
| Piper/Chatterbox ES/EN matrices, six-rate host matrix, GPU benchmarks, listening and Qwen work | No engine, model, voice, DSP algorithm, rate table or inference policy change. Direct and one slow arm discriminate wrapper ordering. | Audio backend/DSP, engine-specific launch, public transport or model admission rules change; add only the affected existing host arm. |
| Full Chatterbox download, runtime rebuild, installed integrity scan and publication audit | NCC-03 uses state transitions; NCC-04 uses native destination probes; NCC-05 uses local filesystem failures. No transfer/verifier/payload/lock changes. | HTTP/extraction/verifier/runtime contents or frozen provenance changes. Current live v6 delivery remains unresolved, not repaired by these fixes. |
| Installer build/install/repair/uninstall and ordinary-user package removal | No NSIS, installed-root migration, deletion scope or removal-choice change. I1 retains current compiled-hook tests. | The actual patch changes installer integration, ownership/deletion roots or user choices. |
| New permanent readiness/diagnostic/test infrastructure | Existing runners and fixtures suffice. | A concrete missing capability prevents proving the invariant; first justify a bounded, tested harness change. |

Capture future receipts once under ignored `tmp/evidence/narration-chatterbox-correctness/<run-id>/`, with before/after identities, exact commands, exit outcomes, toolchain and relevant artifact inputs. Keep concise summaries/review references in the plan; do not commit raw logs or private paths/data. Do not modify any historical receipt.

## Risks and rollback

- Completion repair must not hang after Pause, duplicate a completion event, skip unheard content, revive a stale callback or regress LCF explicit restart. Preserve existing guards and test the observable saved locator.
- Automatic recheck may settle after replacement or during teardown. Do not capture a stale narration owner, reset recovery authorization or start a second worker. Same-profile checks must remain neutral.
- A blanket Failed reset could hide corrupt installed data or erase a live operation. Prefer the explicit retry route and preserve lock/cancellation semantics.
- A missing storage leaf must not report the executable's disk or create user data. Avoid changing shared field shape/thresholds to work around the producer bug.
- Failed rollback must preserve recoverable data and the original failure classification. Never recursively delete an unchecked derived path; all filesystem fault tests stay under their own temporary root.
- Treat unexpectedly required package preparation, setup changes or new public contracts as scope decisions. Preserve original data and receipts, and replan before broadening.
- Revert only task-owned changes if a unit cannot satisfy its invariant. No broad reset/clean/stash, historical rewrite or user-data cleanup.

## Progress log

- 2026-10-27: Read-only source verification established the five conditional defects and their boundaries; no runtime reproduction claimed.
- 2026-10-27: Inspected NLC/LCF plans, immutable reviews, result/log files and source manifests. Confirmed LCF's failed aggregate plus passing continuation, current test-input drift and the limits of historical model evidence.
- 2026-10-27: Created this planning branch from clean `fd333f6`; drafted minimal owner corrections, narrow regressions, one final foundation gate and explicit omissions. Only the plan and active-plan index are in the planning commit scope.
- Historical planning checkpoint: implementation, regressions and acceptance had not started; execution authorization was pending.
- 2026-10-27 execution: confirmed clean planning HEAD/branch and empty index; recorded the new authorization above. The seven retained receipt hashes match the planning table. They remain baseline context only; no old acceptance PASS is transferred.
- NCC-01 now reserves the final frame for the actual completion callback, which publishes the exact end before releasing the scheduler unit. The real coordinator/bridge/save regression covers 100/75 percent, duplicate callback, manual restoration and explicit restart; existing event-first and stale-callback controls remain intact.
- NCC-02 binds a settled automatic check to the mounted owner, ignores obsolete/overlapping callbacks and calls existing profile refresh without resetting recovery. Changed playing and unavailable paused runs contain before policy changes; unchanged admission and spent recovery remain intact.
- NCC-03 routes cached download, insufficient-space and acquisition-verification failures through existing explicit selection/confirmation. Integrity-only and removal actions remain separate; confirmation still precedes download. No native manager state-machine behavior changed.
- NCC-04 uses the existing configured optional root through its private native getter and probes the nearest existing destination ancestor without writes or executable fallback. IPC/setup, schema and thresholds are unchanged. N1 is selected because injected path tests cannot establish real Tauri initialization of this newly consumed root; it will use I1's executable.
- NCC-05 restores the old target after failed promotion, retains the backup on failed restoration, and recovers an orphaned backup before a later replacement. The original promotion exception is retained, with a content-free note if rollback fails.
- Focused red evidence: R-TS-red failed 9 selected cases for the missing behaviors; R-Rust-red failed all 3 destination-path cases. R-Python-red exposed both rollback defects plus an incomplete success-fixture receipt stub; R-Python-red-corrected retained 2 functional failures and 1 passing success control.
- Focused green evidence: R-TS-green passed 8 narration/compatibility cases and failed 3 retry assertions because the fixture omitted the existing IPC profile argument. R-TS-retry-green corrected that assertion and passed those 3 cases alone. R-Rust-green and R-Python-green each passed 3 cases. Python reports a nonfatal pre-existing cache-write permission warning; logs retain it.
- B1 passed once: one Chromium journey, two actual audio arms, 42.3 seconds test / 46.2 seconds runner. Only completion delivery was held for 600 ms after real device completion; persisted exact end, manual save and reopen passed. No model inference or listening claim.
- The canonical system diagram was reviewed against the diff: components, process topology, acquisition root and persistence responsibility are unchanged; no diagram or new ADR is needed. Maintained product/testing guidance describes the corrected behavior.

## Discoveries and decisions

- Previous passing tests exercise a different event order or only one side of the UI/native boundary. Add the missing observable transitions, not mirrored implementation assertions or another large test matrix.
- The current source is newer than LCF's retained review in two test files. Matching historical production bytes alone cannot justify blanket reuse of its complete test results.
- The recovery budget must not be reset by automatic visibility handling. Reuse profile containment, not every side effect of manual recheck.
- NCC-03 can likely be corrected at its existing UI action; do not change native snapshot semantics unless the focused regression demonstrates necessity.
- NCC-05 does not justify rebuilding or republishing Chatterbox. Generated package and installed-runtime acceptance are separate from transactional maintainer output handling.
- This documentation-only planning change is exempt from independent behavioral review. Future implementation requires exact-patch `change_reviewer` approval; no refactor validator campaign is added.

## Final validation results

**Implementation and host validation are complete; independent implementation review NCC-R02-20261027 is APPROVE.** The final archived-patch review is retained separately as `tmp/evidence/narration-chatterbox-correctness/run-01/change-review-R04.md`, with its own immutable manifest and patch. That report is outside the inputs it reviews; its verdict must be read there rather than inferred from this archival note.

Receipts are retained under ignored `tmp/evidence/narration-chatterbox-correctness/run-01/`. Each run records the literal command, exit, timestamps, environment and before/after source manifests. All validation ran with escalated normal local PowerShell, not sandbox acceptance. The initial ambient pnpm was 11.25.0; before any checks the runner selected repository-pinned 11.15.1 via Corepack. Node is 24.20.0, Rust/Cargo 1.97.1, Python 3.12.10 and uv 0.11.29.

| Gate | Actual command/result |
| --- | --- |
| P1 | `pnpm.cmd build:packages`: exit 0. Current ignored outputs lacked complete historical execution-time identities, so preparation ran once; B1/I1 own their normal build prerequisites. |
| R-TS | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/hardware-compatibility-check-binding.test.ts src/App.test.tsx src/tts/OptionalChatterboxControls.test.tsx -t NCC`: red exit 1 (9 failures); green attempt exit 1 (8 pass, 3 fixture-assertion failures). No new PCM-file cases, so that file was omitted as planned. |
| R-TS retry-only | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/OptionalChatterboxControls.test.tsx -t NCC`: exit 0, 3 passed after correcting existing IPC argument assertions; previously passing selections were not repeated. |
| R-Rust | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml ncc_`: red exit 1, 3 failed; green exit 0, 3 passed. Production path-selection seam retains old behavior for red, then uses the configured root for green. |
| R-Python | `uv run --project services/tts --locked pytest services/tts/tests/test_release_chatterbox.py -k ncc_`: original/corrected red exit 1; final exit 0, 3 passed. Tiny local trees only; synchronization/download and post-build receipt are stubbed; pre-promotion verification and actual moves execute. |
| B1 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep NCC`: initial and final exit 0, 1 case with both 1.00x/0.75x arms. Final 42.3 seconds test / 45.1 seconds runner. Repeated only because its test formatting and a consumed callback changed. |
| I1 | `pnpm.cmd check`: exit 1 at Prettier; evidence stages passed (13 guard tests). Aggregate was not rerun. The exact continuation leaves and failures are recorded below. |
| N1 | `node apps/desktop/scripts/native-startup-smoke.mjs`: exit 0. Existing real Tauri/WebView2 model-free startup/reader/fake-service checks passed, no errors or external requests. I1 executable SHA-256 before/after: `56f97195559bba35eb62d3bdc1f38cfca78f6908ff2e2b38c543502751ac66d4`. No rebuild or inference. |
| Independent review | NCC-R01-20261027 requested correction of two transcribed exit codes only. NCC-R02-20261027 APPROVE resolves that finding and accepts implementation plus scoped evidence reuse; no historical approval is reused. Exact archival review is retained separately as described above. |
| Git | HEAD remains `e3471ce4ba92077e27fd6a8de4e82c733a3cd582`; index empty, changes uncommitted. No push, PR, merge or publication. |

Historical reuse is limited to baseline investigation and unchanged fixtures/controls. No historical suite, browser, native binary, installed-model or hardware PASS is claimed as acceptance here. Current B1 and selected checks were compared with the final input manifests and accepted in R02; I1 supplies the existing broad controls, including B07, NLC/LCF, StrictMode, both Rust configurations and v6 source/synchronization security controls.

Omissions remain exactly the strategy above: no broad baseline or per-finding full suites, standalone duplicate check:portable/build/lint/type suites, full browser suite, GPU/voice/six-rate matrices, model downloads/rebuilds, installed integrity scans, installer campaign or publication audit. No engine/DSP/model/lock/transport/installer ownership changed. Full live v6 delivery remains unresolved historical work outside NCC. Current compiler/browser warnings and Python cache warning are retained rather than suppressed.

### I1 continuation and current evidence decisions

The failed aggregate is preserved as a failure, not relabelled as green.

| Receipt | Command | Result |
| --- | --- | --- |
| `I1-format` | `pnpm.cmd format:check` | Exit 0 after the second Prettier pass stabilized two browser-test expressions. Rust/Python formatting passed. |
| `I1-lint` / `I1-lint-corrected` | `pnpm.cmd lint` | First exit 1: test backend aliased `this`. Corrected to a captured accessor; next exit 0 (TS, both Rust feature configurations, Python). |
| `I1-typecheck` | `pnpm.cmd typecheck` | Exit 2: shared/EPUB types passed, desktop callback lacked an explicit return on every path. Python had not run. Corrected to awaited reconciliation. |
| `I1-typecheck-desktop` | `pnpm.cmd --filter @voxleaf/desktop typecheck` | Exit 0. Only failed owner repeated; shared/EPUB inputs and dependency artifacts unchanged. |
| `I1-typecheck-python` | `pnpm.cmd typecheck:python` | Exit 0, 177 files. |
| `I1-format-typescript` | `pnpm.cmd format:check:typescript` | Exit 0 after the TS lint/type corrections. |
| `I1-lint-typescript` | `pnpm.cmd lint:typescript` | Exit 0 after the callback correction. |
| `I1-test` | `pnpm.cmd test` | Exit 101: shared 209, EPUB 680, desktop 854 and Node 101 passed. Default Rust had 125 pass/1 failure/2 ignores: the static privacy guard prohibited the new read-only metadata lookup. Release Rust and Python had not run. |
| `I1-test-rust` | `pnpm.cmd test:rust` | Exit 0: default 126 pass/2 ignores; release-locked 125 pass/2 ignores. The guard now permits exactly one `std::fs::metadata(directory)` call in the Windows producer, preserving the remaining filesystem/network/model/process prohibitions. |
| `I1-test-python` | `pnpm.cmd test:python` | Exit 0, 648 passed; one nonfatal cache permission warning retained. |
| `I1-format-rust` | `pnpm.cmd format:check:rust` | Exit 0 after the privacy-test adjustment. |
| `I1-lint-rust` | `pnpm.cmd lint:rust` | Exit 0 in both configurations after that adjustment. |
| `I1-build` | `pnpm.cmd build` | Exit 0: workspace packages, frontend/Tauri release executable and Python distributions. No installer or optional runtime rebuilt. |

- Existing TypeScript/Node suites from `I1-test` are reused only for their unchanged source/test/config/lock/toolchain inputs. The only later code change was the Rust test's explicit metadata exception; those TS/Node runners do not consume that Rust test. Rust was rerun independently, including the release configuration never reached by the failed aggregate.
- Shared/EPUB type leaves from `I1-typecheck` remain byte-identical, with unchanged dist and lock/tool versions. The corrected desktop binding is downstream, not an input to either package's typecheck. Desktop types were rerun, and Python types executed for the first time.
- Python format/lint and the final Rust/TS format/lint receipts have unchanged language-specific inputs. These commands retain directory membership from the complete source manifests; no new production files, dependency entries or test runners were added.
- The evidence guards consume the unchanged index, HEAD membership and evidence-retention configuration. All new raw captures stay ignored under `tmp/`; no tracked raw evidence or staged paths were introduced.
- Current B1-final, N1 and build outputs are independently captured with before/after source and artifact identities. Historical B1/H1/H2/LCF approvals are not reused. The initial current B1 remains historical within this run after its consumed inputs changed; B1-final supersedes it.
- Final documentation updates do not change any runtime/test/format-glob/build input. R02 independently accepts these dependency comparisons; subsequent archival is covered only by its separate exact-patch report.
- Cleanup: test-owned temporary package trees use pytest lifetime cleanup; no installed optional data, models, user book, firewall setting or release authority was modified. Native/browser runners exited successfully and closed their test application contexts. Ignored receipts are intentionally retained.

### Closeout

- 2026-10-27: NCC-R01-20261027 found no actionable functional defect or acceptance gap, but required accurate exit codes for `I1-typecheck` (2) and `I1-test` (101). Both cells were corrected without changing source or tests; the failed original receipts remain intact.
- 2026-10-27: NCC-R02-20261027 APPROVE verified the 1,383-path closed manifest, exact diff, empty index, unchanged artifacts and scoped continuation reuse. Manifest SHA-256: `781b3c1fa1d656372138b673055f1a3be978894d069916a204b30bb4e3a39026`; patch SHA-256: `f0ee0a0e1d40008b795c8d94bf41452df1ab191fe5222ecb57da21f998f71a33`. Reviewer: `change_reviewer`, GPT-6 Astra high, read-only, no test execution.
- After implementation approval, this plan moved to `completed/`; maintained indexes and the testing link were updated. Final archive review R04 covers the resulting exact patch; its report is retained outside the reviewed source manifest to avoid a self-referential approval identity.
- All five corrections and planned acceptance responsibilities are complete. No dependencies, public contracts, model/runtime packages or architecture boundaries changed. Changes remain uncommitted at the authorized planning HEAD, with no push, PR, merge or publication. Physical multi-volume hardware, inference, full v6 live delivery and installer acceptance remain outside this patch's claims.

- NCC-R03-20261027 requested updating six stale milestone status declarations only. Those statuses now reflect R02 implementation acceptance; the documentary correction is submitted under R04 without changing runtime inputs or rerunning their checks. R03 remains preserved as CHANGES_REQUESTED.
