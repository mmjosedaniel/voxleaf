# Settings and packaging minimal corrections

Status: **Complete; independently accepted and archived on 2026-11-02 local.**
Planning date: 2026-11-02 UTC (2026-11-01 local).
Base: `85dd916b9fea1771f3da6eb181df392342823368`, clean `main` at entry.
Branch: `codex/settings-packaging-minimal-corrections-plan`.

The user authorized implementation and local host tests on 2026-11-01 (local).
Commit, push, PR, merge and publication remain unauthorized. The preceding audit
was static; its results are not executable acceptance evidence.

## Goal

Correct the confirmed settings and maintainer-packaging failure paths with
small changes in their existing owners. Preserve normal successful behavior,
current profile/manifest identities, local inference and explicit recovery.
Add only the missing failure-path regressions and run the affected checks once
on the final combined patch, except for necessary red tests or invalidated gates.

## User-visible outcome

- An explicit narration reset after verified containment can apply English,
  Quick and 1x coherently and finish its existing recovery-reset sequence.
- Changing Quick/Prepared after natural completion cannot save a different
  mode merely to reject its application when the preceding cleanup fails.
- Failed language/profile/start/reset changes leave stable, content-free,
  actionable feedback. A partial reset is not presented as complete success.
- A maintainer build prepares and verifies a complete candidate before replacing
  its current outputs. Ordinary reported pre-commit failures preserve the old
  coherent output set, or retain identified recovery material if rollback fails.
- Invalid Piper profile metadata is rejected before output mutation. Current
  valid metadata and all runtime trust checks remain unchanged.

## Current state

The findings below were rechecked against the base source, complete callers,
product requirements and related test source. Priority is review triage, not a
measured failure frequency. Cases sharing a cause are not independent bugs.

| ID | Confirmed boundary and qualification | Minimal correction / acceptance |
| --- | --- | --- |
| SPM-01 / P2 | `product-narration-coordinator.ts` saves in `resetStartPreference` before its final recovery guard. With Prepared selected and recovery outside `operational`, reset can store Quick but retain Prepared and return false; the aggregate false suppresses the UI recovery reset. `setSelection` also saves before completed-run cleanup, whose failure can reject publication. | Establish cleanup/eligibility before persistence; reconcile an accepted write with the active selection. Explicit reset after verified containment must not deadlock behind the episode it is meant to reset. Preserve failed cleanup ownership, close/replacement guards and explicit Play. Not every preparation error enters this recovery state. |
| SPM-02 / P2 | `HardwareCompatibilityControls.tsx` removes its pending status on false without a write-failure explanation; `ReaderSettingsDialog.tsx` discards the startup-selection result. `narration-settings-actions.ts` combines three reset results into one boolean. | Add bounded per-action feedback in existing controls. Show partial-reset wording and accurate current values. Retain existing future-version explanations. A boolean false alone is not proof of storage failure, and no cross-key all-or-nothing reset contract is currently specified. |
| SPM-03 / P2 | Piper `atomic_stage` discards the prior folder before ZIP, ES/EN offline checks and measurements finish. | Defer replacement/backup disposal until the candidate folder, archive and required checks are complete; compensate failures during multi-output promotion. A failed ZIP may leave the old ZIP, so this is not necessarily loss of every prior copy. |
| SPM-04 / P2, related to 03 | `_assemble_staging` writes the tracked runtime manifest before promotion. `write_package_evidence` writes the final evidence file directly. | Include manifest and evidence in the same bounded promotion when `write-manifest` is requested. Failed promotion must not pair old package A with new authority B; stage evidence writes before replacing the previous file. |
| SPM-05 / related P2 | Chatterbox promotes its folder before ZIP/parts/local receipt, and `split_archive` removes old parts before generating replacements. | Prepare a complete bounded part set and applicable local receipt before final replacement, preserving old outputs on pre-commit failure. The failure is an incomplete set, not necessarily corruption of every individual part. |
| SPM-06 / conditional validation gap | Python copies recipe profile tuples and validates file integrity; native `tts_release_core.rs` additionally requires exact profile/language/root/voice tuples. Offline smokes instantiate adapter profiles directly. | Validate those exact tuples at the Python release boundary before mutation and at its corresponding verification boundary. Current source/runtime tuples already match Rust; this is not evidence of a broken installed package or a security bypass. |

Packaging findings affect local maintainer outputs. They do not establish
loss of user books/audio, a broken installed application, or a defect in the
native optional downloader. Existing sole-backup recovery already works in
the bounded rename cases; retain that behavior instead of replacing it.

## Scope and non-goals

Three implementation units form one integration batch:

| Unit | Primary production owners | Existing tests / conditional support |
| --- | --- | --- |
| U1: SPM-01/02 | `apps/desktop/src/tts/product-narration-coordinator.ts`, `HardwareCompatibilityControls.tsx`; `apps/desktop/src/settings/ReaderSettingsDialog.tsx` | Their matching test files; `narration-settings-actions.ts` and its test only if sequencing requires it. Read existing hardware coordinator, repositories and App wiring; change `App.tsx` only for indispensable integration and then include `App.test.tsx`. |
| U2: SPM-03/04/06 | `services/tts/src/voxleaf_tts/release_core.py` | `services/tts/tests/test_release_core.py`; `packaging/core_integrity.py` only for a small reused metadata validator or candidate-evidence calculation. Keep generic synthetic manifest builders usable. |
| U3: SPM-05 | `services/tts/src/voxleaf_tts/release_chatterbox.py` | `services/tts/tests/test_release_chatterbox.py`, `test_chatterbox_sources.py`. Reuse existing `output_root`, tiny builder fixture, receipt and integrity functions. |
| Integration | Existing settings and build boundaries | `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`, existing settings helpers. Native runner changes are conditional on a demonstrated coverage gap, not planned by default. |

Freeze literal changed paths before implementation. Listing a support file is
not an instruction to edit it. Prefer the existing boolean settings APIs and
local error presentation; a new shared result hierarchy, storage transaction
framework or packaging framework is unnecessary. If a small private helper is
needed, keep it in its current module unless actual duplicated use justifies it.

Do not change shared/wire schemas, preference versions, engines, voices, model
weights, dependency locks, package identities, archive member layout, DSP,
buffer policy, EPUB extraction/normalization/locators, native admission or
installer behavior. Do not regenerate or publish frozen Chatterbox authorities.
No full download, quality/listening matrix, GPU campaign or broad refactor.

The implementation may update maintained Settings requirements and
`docs/development/tts-service-organization.md` for corrected failure semantics,
plus `docs/development/testing.md` only if test guidance changes. Record execution
later under `docs/plans/evidence/settings-packaging-minimal-corrections/`; raw
receipts stay in ignored `tmp/evidence/settings-packaging-minimal-corrections/`.
This planning commit changes only this file and `active/README.md`.

## Relevant files and documentation

Required context:
[documentation index](../../README.md), [MVP](../../product/mvp.md),
[Settings requirements](../../product/reader-settings-and-playback-controls.md),
[bilingual preference/reset authority](../../architecture/bilingual-narration-authority-v2.md),
[overview](../../architecture/overview.md),
[system diagram](../../architecture/system-diagram.md),
[roadmap](../roadmap.md), [testing](../../development/testing.md),
[TTS organization](../../development/tts-service-organization.md),
[evidence retention](../../development/evidence-retention.md),
[independent review](../../development/agentic-change-review.md) and
[Git workflow](../../development/git-workflow.md).

Read [ADR-0065](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md)
for recovery/sole-backup constraints and
[ADR-0064](../../architecture/decisions/ADR-0064-admit-msgpack-chatterbox-v7.md)
for immutable optional-runtime boundaries. Native optional-data ownership in
[ADR-0061](../../architecture/decisions/ADR-0061-owned-promotion-backup.md) is a
separate boundary, not permission to alter native installation cleanup.
Preserve the current [release authority](../../architecture/mvp-release-authority-v1.md)
and its superseding optional-package decisions.

Important unchanged callers: `App.tsx`, `hardware-profile-compatibility.ts`,
`operational-recovery.ts`, the three narration-preference repositories,
`tts_release_core.rs`, `package.json`, `apps/desktop/package.json`,
`services/tts/pyproject.toml` and `apps/desktop/playwright.config.ts`.
Read the existing `build_package`, `atomic_stage`, ZIP/split functions,
`package_evidence`, `_local_package_receipt`, and Python/native verification
before editing promotion order.

Use the complete-input evidence principles in the
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md).
This is a bug-fix plan, not a refactor campaign: no auditor/worker ceremony or
full per-unit refactor baseline is imposed. Future implementation follows
[investigate-bug](../../../.agents/skills/investigate-bug/SKILL.md).

## Architecture and constraints

### Settings

For ordinary mode selection, finish required completed-owner cleanup and check
eligibility before writing. On cleanup rejection, preserve both the prior saved
preference and its visible selection. Keep the final heard checkpoint and mode
projection coherent; no automatic restart or locator movement is permitted.

For explicit reset, distinguish a non-operational episode with verified released
owners from failed/unverified cleanup. Only the former can apply reset preferences
and finish the existing explicit recovery-reset path. Moving the operational
guard earlier without this distinction would merely turn the current partial
write into a reset that can never succeed after failure. Do not call recovery
reset unconditionally, discard retained owners or weaken termination checks.
Preserve guards after asynchronous boundaries and publication replacement.

Keep best-effort per-preference reset semantics unless a concrete invariant
requires otherwise. Successful fields may stay applied when another write
fails; report that result honestly. Prefer one local message per action, using
fixed text and existing displayed values, over passing raw exceptions or
expanding all callback contracts. Cover ordinary Quick/Prepared rejection as
well as language/profile/reset. Retain future-version preservation and pending
focus/control structure; clear obsolete messages on an appropriate new action.

### Maintainer output promotion

Prepare candidate files on the same volume in owned temporary locations. For
Piper, run tree verification, deterministic ZIP generation, both existing offline
smokes and measurements against the candidate before the commit point. Generate
candidate manifest/evidence bytes using candidate identities, not old final
files. Ordinary `build` still requires the current tracked authority;
`write-manifest` alone may replace the tracked authority/evidence.

Retain prior folder/archive and, when applicable, manifest/evidence until all
required replacements succeed. A multi-file rename is not a filesystem-atomic
transaction: explicitly compensate partial promotion. If rollback itself fails,
retain the only valid backup and report failure; never delete it in `finally`.
After the complete verified new set is committed, backup-cleanup failure must
retain a coherent new set and truthful cleanup status, rather than claim that
the old set was restored. Document this commit boundary; do not claim universal
power-loss recovery or concurrent-build support. Scope any existing
`previousPackagePreservedOnFailure` statement to failures before commit.

Chatterbox uses the same invariant in its existing owner, not necessarily the
same implementation. Stage ZIP parts before removing/replacing current parts;
validate the at-most-four bound before destructive replacement and retain bounded
streaming. Cover the builder's folder/ZIP/parts/applicable local-receipt set,
including a failed final receipt. Do not mutate installed packages or published
v2/v3/v5/v6/v7 artifacts. Tests use isolated synthetic outputs, not live dist.

Validate only the missing closed Piper tuple relationship needed for SPM-06;
avoid importing model libraries merely to validate metadata. Preserve generic
hash/manifest helpers and native fail-closed checks. Current valid recipe and
manifest bytes must remain valid and successful archive layout deterministic.

No architecture topology change is intended. Recheck the canonical diagram at
closeout; amend it only if actual ownership/data flow changes. M005 narration
preparation is unaffected. Keep content on-device, audio ephemeral, queues and
work bounded, cancellation effective and diagnostics free of book text/private
paths. Preserve unrelated files and resources during rollback and test cleanup.

## Milestones

### M0: Freeze scope and evidence decisions — Complete

Entry HEAD is `599b4cf4a446c006ae3262cfceac0f75e596a50d` on the planned branch;
index and worktree were clean. The immutable initial tracked/discovered input
inventory is `tmp/evidence/settings-packaging-minimal-corrections/M0-inputs.json`.
The implementation allowlist is the three U1 production files and their tests,
`services/tts/src/voxleaf_tts/release_core.py`,
`services/tts/src/voxleaf_tts/release_chatterbox.py`,
`services/tts/tests/test_release_core.py`,
`services/tts/tests/test_release_chatterbox.py`, and the G5 browser spec.
Conditional support remains limited to the paths explicitly named in Scope;
record any activation before editing. Documentation outputs are this plan,
its active/completed indexes, the Settings requirements, TTS organization and
the task evidence directory. No pre-existing changes require preservation.

G1–G8 are RUN. G0 exports will be rebuilt if their full input proof is absent.
No historical behavioral PASS is reused. The original MAF Python/core and RIA
desktop/core/native result receipts were retrieved; only the existing core
payload is a conditional artifact reuse candidate, pending complete membership,
hash and source-closure comparison before G6. Rust/GPU/EPUB matrices remain
NOT APPLICABLE under the unchanged scope. No installation/download is selected.
Local unsandboxed PowerShell readiness found Node 24.20.0, pnpm 11.15.1,
uv 0.11.29, PowerShell 7.6.5, existing JS/Python dependencies and 139 GB free.
Use the existing Corepack shim through process-local PATH. Task scratch is the
new ignored `tmp/evidence/settings-packaging-minimal-corrections/` directory;
synthetic packaging tests use their pytest temporary roots. Native resources
will be journaled before the host arm.

After execution authorization, record actual HEAD, dirty paths, literal allowlist
and per-gate source/test/config/lock/discovered-input identities before edits.
Retrieve the receipts listed below. Classify each gate as RUN, REUSE WITH PROOF,
NOT APPLICABLE or BLOCKED; do not run a broad baseline by default. Check only
needed tool/package/browser/driver readiness. Do not install/update/download by
default. Confirm a safe owned scratch root and preserve current user state.

### M1: Implement U1 with directed regressions — Complete

Use existing fake transport, cleanup barriers and storage seams to reproduce
SPM-01/02 before changing production. Implement only required coordinator order
and local feedback. Add a mounted browser case through the real settings action
and coordinator; do not prove the circular reset only with boolean mocks.

### M2: Implement U2/U3 with synthetic outputs — Complete

Exercise real builder orchestration and filesystem renames with tiny fixtures;
mock acquisition/model work, not the promotion mechanism under test. Fix Piper
as one cohesive transaction unit including authority/evidence and metadata.
Fix Chatterbox output/part replacement while retaining versioned sources and
sole-backup retry behavior. No real package generation is needed merely to
demonstrate an injected file/ZIP/smoke/receipt failure.

### M3: Combined verification and acceptance — Complete

Run the final selected deterministic/static gates below, followed by the selected
Chromium journey and one current native build/Piper EN arm. Reuse verified core
payloads when eligible; never reuse the old desktop binary after renderer edits.
Record cleanup and restoration. Renew only consumers of subsequent changes.

Obtain independent `change_reviewer` approval for the exact current behavioral
patch and host receipts. The reviewer edits nothing and runs no tests. Missing
reviewer/evidence blocks acceptance. Freeze documentation before final review;
retain reports outside their own identity manifests. Only after all required
gates pass, archive this plan and update indexes. Future Git mutations require
their own applicable user authorization.

## Testing and benchmark strategy

### Prior evidence inspected and reuse decisions

Planning inspected both maintained summaries and the original local result
receipts named here. These are historical results, not current executions.

| Prior evidence | Recorded result | Decision for this plan |
| --- | --- | --- |
| [MAF ledger](../evidence/minimal-audit-findings-corrections/execution-ledger.md), MAF-11 and `F-TS-01`; [review](../evidence/minimal-audit-findings-corrections/review-R1.md) | Shared 210, EPUB 749, desktop 984, Node 151 passed; completed Prepared-to-Quick happy paths covered. | Reuse tests, transport/clock doubles and completion assertions. Old results do not cover cleanup failure after preference persistence or reset from non-operational recovery. No full old TS aggregate is needed here. |
| MAF `F-Python-01-result.json`, retrieved locally | Exit 0; ledger records 806 passed; approximately 59 seconds. | Reuse release fixtures and rollback controls. Changed builder/tests require the three selected Python suites, not the full historical suite or an extracted green subset. |
| MAF `F-Core-01-result.json`, retrieved locally | `package:piper-core:write-manifest` then `package:piper-core:check`, exit 0; approximately 68 seconds, ES/EN offline smokes included. | Confirms previous real packaging coverage; does not prove the new transaction. No automatic rerun of real generation for maintainer-only edits. Preserve authority/runtime inputs; use synthetic real-filesystem regression evidence. |
| [RIA ledger](../evidence/reader-image-audibility-corrections/execution-ledger.md), `G2-desktop-final`, original result retrieved; RIA-R1-20261101 | 439/439 across eleven suites, exit 0. | Reuse current recovery/cleanup/audibility assertions. Coordinator edits invalidate this as final acceptance; run only the selected affected suites below. |
| RIA `G6-core`, original result and input manifest retrieved; `G6-r2-package-source.json` inspected | Core check exit 0; retained manifest records 2,024 files, including runtime authority. | Candidate **artifact** reuse only. At execution compare complete payload membership/hashes, source closure, tracked authority, locks and relevant tool/environment identities. Builders and the `packaging` helper tree are excluded from the core runtime. A new check is selected because the verification boundary may change. No full payload comparison has been performed in this planning turn. |
| RIA `G7-Piper-r2`, original result retrieved; [review reports](../evidence/reader-image-audibility-corrections/review-reports.md) | One identified binary, six-rate Piper EN mode, exit 0; approximately 115 seconds with verified cleanup. | Reuse runner/fixtures and eligible payload/driver assets. Changed renderer and settings require one new build/arm. Do not reuse old timings, native PASS or binary as current acceptance. Six-rate/DSP campaign need not be repeated. |
| [RIA CI follow-up](../evidence/reader-image-audibility-corrections/ci-follow-up.md) | Corrected stopped-versus-idle assertion; final 47/47 Chromium cases recorded. | Preserve its settled-cleanup assertion and failed receipt. Select relevant settings controls plus new cases instead of rerunning all 47. |
| [SAF review](../evidence/static-audit-follow-up/review-R2.md) | Historical 791 Python cases, packaging/offline checks and explicit same-task evidence reuse after runner-only changes. | Useful precedent for dependency-scoped reuse, not approval to transplant its PASS. Sole-backup and versioned-source tests remain controls. |

Original receipt roots are `tmp/evidence/minimal-audit-findings-corrections/`
and `tmp/evidence/reader-image-audibility-corrections/run-01/`; do not commit raw
logs or private inventories. Prepared shared/EPUB exports and installed caches
may also be reused after complete input/membership proof. Keep configured browser
and Tauri build hooks; avoid a duplicate standalone build before those hooks.

No historical changed-path PASS is pre-approved. To retain any individual gate,
the new independent review must identify its original immutable receipt and
prove identical consumed source/transitive imports, tests/fixtures, configuration,
locks, generated artifacts, discovered membership, tool versions and relevant
environment. HEAD is an input when consumed. Missing proof means run the affected
gate. Unaffected Rust/GPU/EPUB matrices are excluded by scope, not relabeled as
reused PASS. Recheck this classification if implementation expands.

### Missing regression matrix

| Area | Required directed cases and controls |
| --- | --- |
| Reset and mode | Prepared plus non-operational recovery with successful containment: saved/visible Quick and explicit recovery reset, no auto-play. Failed/unverified cleanup: prior start preference retained, owners/recovery retained. Natural-complete mode change plus cleanup failure: no divergent write. Include saved/unavailable/future preference and closed/replaced-owner controls; use current 2/5/10-minute completion cases as existing controls. |
| Feedback | Language/profile/start write rejection gets stable fixed-text feedback; partial reset preserves accurate successful values without claiming full success; retry success clears obsolete error. Future-version preservation and pending/focus structure remain. Verify mounted wiring once; do not duplicate every combination in browser/native. |
| Piper | Parameterized orchestration failures at ZIP, ES smoke, EN smoke, measurement, staged manifest/evidence write and each final promotion step; assert old folder/ZIP/authority/evidence bytes and unrelated sentinel survival. First build with no prior output, successful complete replacement, sole-backup retry and failed rollback retention. Verify explicit post-commit cleanup semantics. |
| Chatterbox | Read/write failure during splitting, empty/over-four rejection before replacement, stale extra-part removal only on success, failed promotion/receipt and failed rollback retention. Assert complete prior output set; use tiny archives and the real streaming splitter/renames. |
| Metadata | Current tuple set accepted; wrong profile/voice/root/language/duplicate or missing tuple rejected before output mutation. Preserve deterministic current/synthetic manifest controls and native exact tuples. No new runtime schema or heavy adapter import. |

### Minimal gate table

The table below preserves the selected commands, from the repository root in
normal local PowerShell outside the managed sandbox. They use configured scripts or selectors
on their existing Vitest/pytest/Playwright runners. Use repository-selected pnpm,
not an unrelated PATH version. Actual command, timing, result and input identities are retained in the
execution ledger and original host receipts.

| Gate | Command / timing | Invariant, invalidation and reuse |
| --- | --- | --- |
| G0 preparation | Inspect retained inputs; `pnpm.cmd build:packages` only if exports cannot be proved current. | Exports are prerequisites, not behavioral acceptance. Changed shared/EPUB source/config/toolchain invalidates them. |
| G1 directed red | Run only new `SPM-` Vitest/browser cases and `spm` pytest cases through G2/G3/G5 selectors before the corresponding fix. | Prove the intended defect, not a fixture/import failure. Reuse final whole selected suites as green proof; no redundant full baseline or per-unit broad runs. |
| G2 desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/hardware-profile-compatibility.test.ts src/App.test.tsx` once on final U1. | Settings, persistence ordering, recovery and mounted wiring. Consumes desktop dependencies, fixtures/config/locks and shared/EPUB exports. Renew after consumed edits, not after independent packaging/docs edits. |
| G3 packaging | `uv run --project services/tts --locked pytest services/tts/tests/test_release_core.py services/tts/tests/test_release_chatterbox.py services/tts/tests/test_chatterbox_sources.py` once on final U2/U3. | Real filesystem promotion, source closure, deterministic archives/parts and metadata. Uses synthetic data; no model/network. All imported packaging helpers and versioned fixture/authority membership are inputs. |
| G4 static | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`. | Separate available leaves, once after combined affected edits and before costly preparation. Do not also run `check`, `check:portable` or their repeated test/build leaves. Broad static leaves consume their configured discovery scope. |
| G5 Chromium | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep 'SPM-|MAF-11|EFC-07|SAF-09'` once on final source/spec. | New reset/feedback journeys plus completion, explicit recheck and stale-selection controls. Existing browser config builds its renderer; preserve that hook. Real clock/DOM/storage behavior complements unit fakes. |
| G6 current payload/build | `pnpm.cmd package:piper-core:check`, then `pnpm.cmd build:desktop` once after fast gates. | Current core validity and new renderer/native binary. Reuse existing verified runtime payload, not the old G6 PASS. Build retains Tauri hooks. If payload drift requires regeneration, diagnose first and amend the closed output scope; do not reflexively run `write-manifest`. |
| G7 native | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` once using G6 binary. | Existing Quick/Prepared/settings/playback/cancellation integration and verified restoration on WebView2. Omit the optional six-rate sweep; error combinatorics belong to G2/G5. No wrapper that rebuilds. Driver, binary, renderer, runtime and host conditions invalidate old native results. |
| G8 documentation/review | `pnpm.cmd check:evidence`; `git diff --check`; review plan links, scope, Settings/TTS guidance and canonical diagram. Independent exact-patch `change_reviewer`. | Current documentation/privacy and acceptance. Guard tests only if the guard changes. Final reviewer approval and host cleanup are mandatory; old approval IDs are context only. |

Native harness source changes require `pnpm.cmd test:native-smoke-harness` and
affected static leaves before G7; do not modify it merely to collect another
receipt. If native/Rust/runtime/recipe/manifest format or artifact bytes change,
replan the affected integration gates before expanding scope. Existing builder
fixtures must execute real candidate verification and promotion, not mock away
the new guarantee. If they cannot establish an affected real-package invariant,
add the smallest applicable real packaging check and record the reason.

For directed red execution, use the G2 command with `-t 'SPM-'`, the G3 command
with `-k spm`, and the G5 command with only `--grep 'SPM-'`. These names identify
regressions to add in M1/M2, not tests that already exist. Stop if selection finds
no tests. Do not repeat the red browser group when it adds no independent
observation beyond the unit reproduction; its final G5 integration remains due.

No general benchmark, full Python/TS/Rust suite, image/EPUB matrix, new installer,
Chatterbox download/rebuild or bilingual six-model portfolio is selected. Changed
inference/runtime support, DSP, performance, native installation or generated
payload behavior would invalidate those exclusions. CI/publication, if later
authorized, retains its own required checks. Do not claim aggregate `check` PASS
from the selected leaf set.

## Risks and rollback

- Clearing recovery too early can admit playback with owned resources. Keep the
  existing containment proof and test retained-owner failure before acceptance.
- Returning false after an accepted mode write can recreate divergence. Trace
  current-owner and persistence publication as one bounded mutation; do not
  hide mismatches with fallback UI values or suppress errors.
- Multi-output promotion can fail halfway and backups can be locked. Preserve
  recoverable bytes, distinguish pre/post-commit failure, and test failed rollback
  plus retry. Do not promise crash-proof atomicity across directories/files.
- Staging both old and new outputs uses additional disk, not unbounded RAM.
  Preserve streaming limits, same-volume moves and exact owned paths; never
  perform broad cleanup of dist, user data, unrelated sibling files or history.
- Before any native host mutation, journal owned resource identity, original
  state, action and restoration. Verify PID/creation-time/executable ownership,
  app resources, scratch and temporary firewall changes on every exit. Unverified
  cleanup blocks acceptance. No personal installer changes are planned.
- Retain failed receipts and classify assertion, fixture, environment and cleanup
  failures. Permit at most one infrastructure retry per failed stage with a
  recorded hypothesis/changed condition; repeated failure requires diagnosis and
  explicit replanning. Never turn a partial failed aggregate into PASS.
- Keep changes separable by unit. Reverting code is not enough to restore an
  already modified local output set; use retained owned backups and verify it.
  Git resets/reverts and future commits require their applicable authorization.

## Progress log

- 2026-11-02 UTC: completed planning-only source/requirement review and inspection
  of prior MAF/RIA result receipts, input manifests and retained review summaries.
  Recorded conditional artifact reuse and rejected historical changed-path PASS
  reuse. No tests, builds, model runs or implementation edits performed.
- 2026-11-02 UTC: created the dedicated branch from the clean base for this plan.
  M0-M3 remain not started; no execution baseline or acceptance is claimed.

## Discoveries and decisions

- The verified audit contains four principal P2 findings, related variants and
  one conditional metadata gap; six ledger rows here identify correction work,
  not six unrelated product failures.
- Reset after arbitrary preparation failure is not the trigger: non-operational
  recovery is material. Existing future-version UI warnings must remain.
- Partial cross-key reset is not by itself a forbidden transaction policy.
  Fix saved/active mode divergence and feedback without adding global rollback.
- Package backup recovery during promotion is already tested. Missing coverage
  concerns later build stages and authority/evidence consistency; extend the
  existing tests instead of introducing a new packaging harness.
- Piper builders/helpers are excluded from its runtime payload, and Chatterbox
  runtime sources are versioned separately. These maintainer edits alone do not
  justify rebuilding engines, downloading weights or rerunning quality matrices.
- Current metadata tuples are correct. SPM-06 is early rejection of incompatible
  future edits, with existing Rust checks remaining authoritative at consumption.
- Reuse of prepared artifacts differs from reuse of a behavioral PASS. Original
  receipts are available locally, but current complete-input/environment equality
  has not been proved in this planning turn and cannot be pre-approved for the
  future patch. Run fast selected gates first; keep one native build and arm.

## Final validation results

Current host results and preserved failures are recorded in the
[execution ledger](../evidence/settings-packaging-minimal-corrections/execution-ledger.md).
G0 preparation, final G2 desktop (355), final G3 Python (136), all six G4 leaves,
G5 Chromium (6) and current G6 core check pass. The initial build/native
arm passed; R1 F1 required a replacement build (passed), and its native arm/restoration also pass. In total two builds and two native
arms ran; R1 F1 invalidated the first renderer/binary result. Native original resources are restored byte-for-byte; no new
owned process or native scratch remains. Historical PASS results are not reused.
The current Piper payload alone is reused after complete membership/hash and
runtime-source/authority equality checks. G8 passes. Independent
[SPM-R2-20261102](../evidence/settings-packaging-minimal-corrections/review-R2.md)
is APPROVE with R1 F1 resolved and no findings. The plan is accepted and archived;
the separate [final archival assessment](../evidence/settings-packaging-minimal-corrections/review-R3.md)
binds the final documentation/index patch without rewriting this record.

## Execution update (2026-11-01 local)

- G1 desktop: six intended failures reproduced. G1 packaging: 22 failures and
  two passing controls; failed receipts retained. No production data was used.
- G2 first combined run: 351 passed, three old status-removal expectations failed.
  Updated those expectations for the required stable failure feedback. G2-r2:
  all 354 passed. G3 first combined run: 131 passed, two legacy rename injections
  intercepted the newly staged ZIP instead of final promotion. Narrowed each
  injection to its intended target. G3-r2: all 133 passed. The fixture now uses
  real local receipt verification. Pytest reports a nonfatal pre-existing cache
  permission warning; no test or assertion was skipped because of it.
- Static checks pass after correcting one long fixture line and its overload
  annotation. G5's first invocation failed before tests because pnpm/cmd removed
  the grep expression's quoting. The one infrastructure retry preserves literal
  double quotes through that boundary; all six selected Chromium cases pass.
- Current core check passes. Complete retained/current payload comparison finds
  2,024 identical files, with unchanged runtime closure, recipe and authority.
  This reuses prepared bytes only. No prior test PASS, desktop binary or timing
  is accepted. G6 desktop build is running; G7 and independent review remain due.
- Before R1, no App change was required. No shared contract, native runner, runtime source, model,
  dependency, frozen authority or generated tracked artifact changed. The
  canonical system topology and M005 boundary remain unchanged. Closeout may
  update `docs/README.md` as required by the active-index archival instructions.

- Final native receipt G7-Piper passes with zero external requests/generated
  audio files and verified restoration. The final splitter recovery correction
  renews G3 (136 passed) and all Python static leaves; it is excluded from the
  runtime and does not invalidate the one completed build/native arm.

## R1 correction order (2026-11-02 local)

Independent [SPM-R1-20261101](../evidence/settings-packaging-minimal-corrections/review-R1.md)
requests F1: ready-publication Settings may use the fallback startup callback
while narration handoff is pending/failed, and it silently drops write rejection.
Activate the already conditional `App.tsx`/`App.test.tsx` allowance. Return the
existing boolean result through the local Settings callback and apply the same
bounded feedback to fallback startup. Add the mounted App regression before the
fix. Renew G2, TS static leaves, G5 and desktop build/native G6/G7 because renderer
inputs change. The one-build condition no longer holds; retain the first passing
build/native receipts as superseded evidence. Python and core verification inputs
remain unchanged; retention requires the reviewer's exact input comparison.

- R1 F1 now has a discriminating mounted App red test and passes the final
  355-test desktop group. G4 TypeScript, six G5 cases, replacement G6 build and
  G7-Piper-F1 pass. Resources and installed inputs are restored/unchanged; final
  review is pending. Original Python/core evidence has a complete current-input
  comparison, with only unconsumed desktop/docs/Chatterbox differences.


## Acceptance closeout (2026-11-02 local)

M0–M3 are complete. SPM-R2-20261102 independently approves all six correction
boundaries and accepts the original current-task Python/static/core evidence
against complete input comparisons. The latest desktop, Chromium, build and
native receipts validate F1; earlier renderer/binary results are superseded.
All relevant selected gates pass. Original native resources were restored on
both arms; no new owned processes, scratch, audio, firewall or installation
changes remain. Raw receipts are intentionally retained in ignored task scratch.

The Git index remains empty, with intentional source/test/documentation changes
unstaged. HEAD and branch are unchanged; no commit, push, PR, merge or publication
occurred. The system diagram still matches the unchanged implementation topology
and M005 boundary. There are no acceptance blockers. Limits remain the selected
host/engine scope, nonfatal existing pytest-cache/Vite advisories, and compensated
ordinary filesystem failures rather than power-loss/concurrent-build atomicity.
The final archival assessment is retained outside its own identity manifest.
