# Narration state and optional-package corrections

## Goal

Correct the six verified state-management defects and the approved session-volume
behavior from the 2026-10-20 review. Keep each fix inside its existing owner and
prove the failing transition plus its surrounding lifecycle behavior.

Status: implementation complete and independently accepted. Closing-document
acceptance is recorded separately after this file is frozen.

## User-visible outcome

1. Selecting Chatterbox again during download, verification, or removal preserves
   the active operation and its cancellation ownership.
2. An optional-package removal error becomes a recoverable failure. Once the
   filesystem obstruction is removed, the user can retry without restarting.
3. Opening a book before initial compatibility detection completes keeps
   narration checking until a valid availability decision can be made.
4. A compatibility probe cannot overwrite a language/profile selection or reset
   that succeeded after that probe captured its preference inputs.
5. Volume, including mute, remains in memory for the lifetime of the open book's
   narration coordinator, across navigation, Stop/Play, and internal restarts.
   A new book coordinator begins at the existing 100% default. Nothing is
   persisted to disk.
6. Preparation failures remain visible after successful cleanup until an
   explicit Stop/reset or a new narration action clears them. Failed cleanup
   retains its existing stronger containment/recovery semantics.
7. Selecting an admitted development-only profile updates the compatibility
   summary immediately. Qwen's development and runtime gates remain unchanged.

## Current state

- Base: `main`, `dfba58a85c075b3a43555364bd96176408e5587f`; tracked worktree and
  index were clean before planning.
- The first read-only audit found B1-B7. The second pass used real coordinator
  and React application/control paths with synthetic external boundaries,
  persisted preferences, and isolated native filesystem state.
- Local ignored verification evidence is
  `tmp/bug-verification-20261020/verification-evidence.json`: nine TypeScript
  reproductions/control cases and two Rust probes passed outside the sandbox.
  Native production bodies were compared with the source before those probes.
  Those tests assert defects and are not regression acceptance tests.
- B2 is process-local stuck state, recoverable by restarting; it is not permanent
  filesystem damage. B4 requires overlapping selection and probe completion.
  B7 is a development-only display inconsistency.
- B5's reset to 100% was reproduced, but retention across internal identity
  replacement was not explicit in the existing session-only documentation.
  This task adopts the behavior stated above under the user's request to
  correct the reviewed errors.
- Current product priority remains Piper and Chatterbox in Spanish/English.
  ADR-0051's deferred Qwen inference investigation is outside this plan.

## Scope and non-goals

Three state owners and the optional-package recovery presentation, integrated
and reviewed as one behavioral patch:

- Native Chatterbox operation state and directly associated Rust tests (B1/B2).
- Optional-package cleanup guidance and its existing component tests (B2).
- Hardware compatibility preferences/status and focused tests (B4/B7).
- Product narration availability, volume, preparation diagnostics, and
  coordinator/application/control regression tests (B3/B5/B6).

Update maintained product documentation and plan indexes. Do not alter EPUB
parsing, normalization, segment mapping, inference adapters, generated sources,
protocol schemas, frozen evaluation authority, completed historical plans,
runtime/model artifacts, download destinations, or installation roots.
No dependency, model promotion, installer publication, or remote Git action is
part of this work. The user authorized creating a local implementation branch;
commit/push/PR actions are not prerequisites for executing the plan.

## Relevant files and documentation

- `AGENTS.md`, `.agents/PLANS.md`,
  `.agents/skills/investigate-bug/SKILL.md`.
- `docs/README.md`, `docs/product/mvp.md`,
  `docs/product/reader-settings-and-playback-controls.md`.
- `docs/architecture/system-diagram.md`, `docs/architecture/overview.md`,
  `docs/architecture/bilingual-narration-authority-v2.md`.
- ADR-0015 (bounded adaptive buffering), ADR-0043 (verified acquisition),
  ADR-0047 (optional-data retention), ADR-0051 (Qwen deferral).
- `docs/development/agentic-change-review.md` and
  `docs/development/git-workflow.md`.
- `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`.
- `apps/desktop/src/tts/OptionalChatterboxControls.tsx` and its tests.
- `apps/desktop/src/tts/hardware-profile-compatibility.ts` and its tests.
- `apps/desktop/src/tts/product-narration-coordinator.ts` and its tests.
- `apps/desktop/src/App.test.tsx`,
  `apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx`,
  `apps/desktop/src/tts/ProductNarrationControls.test.tsx`, as needed.
- Existing callers:
  `settings/narration-settings-actions.ts`, `settings/ReaderSettingsDialog.tsx`,
  `tts/hardware-compatibility-check-binding.ts`,
  `tts/optional-chatterbox-client.ts`, `tts/pcm-playback.ts`.

## Architecture and constraints

The native manager continues to own package operations, exact manifests,
filesystem containment and cancellation flags. Serialize operation admission
under its existing mutex; never hold it across long filesystem/network work.
Publish removal failures through the existing closed state/error vocabulary.

The compatibility coordinator continues to own hardware facts and explicit
preferences. Reconcile an in-flight probe with successful newer preferences
without weakening fresh hardware admission or adding unbounded retry/history.

The product coordinator waits for initial compatibility readiness through a
narrow desktop-local dependency, retains one bounded scalar volume value, and
separates failure presentation from resource cleanup. Late asynchronous work
must not revive a closed/replaced coordinator.

Preserve one active model child, existing queue/PCM ceilings, stale-identity
invalidation, bounded cleanup and content-free diagnostics. No EPUB content,
generated audio, model weights or private user data may enter fixtures/logs.
Synthetic tests are sufficient for these state transitions; no model-specific
throughput or installer/acquisition certification is claimed.

The canonical system diagram's existing owners and arrows remain applicable.
Review it again at closeout; change it only if implementation actually changes
component/data-flow or persistence boundaries.

## Milestones

### 1. Plan, branch and failing regressions

- Finish this ExecPlan, then create and switch to
  `codex/fix-narration-state-and-optional-package`.
- Add small tracked regressions to existing test harnesses. Assert the desired
  behavior and demonstrate the failures against unchanged production code.
- Include controls for close/replacement, valid admission, direct cancellation,
  fresh hardware rejection, and explicit error dismissal.

Status: complete. Plan written before branch creation; branch created from the
stated base. Host regressions failed as expected: 12 desktop and three native
cases, with failures corresponding to all seven reviewed behaviors.

### 2. Native operation ownership and retry

- Preserve busy operation state and cancellation during reselection, including
  atomic rechecking before any operation replacement.
- Leave a recoverable `failed` state when removal fails after entering
  `removing`; allow a subsequent explicit retry.
- Test generic cleanup failure and a Windows sharing violation against
  disposable package fixtures. Never use the user's installed models.
- Render guidance for resolving file use and explicitly retrying removal;
  do not require an application restart after this recoverable error.

Status: implementation complete; focused native tests pass (32/32).

### 3. Compatibility and explicit preferences

- Await initial compatibility settlement before declaring a book's narration
  unavailable; suppress obsolete/closed availability results.
- Apply completed probes using newer successful language/profile/reset choices
  while still validating them against fresh hardware facts.
- Recompute selected-profile support status immediately after selection.

Status: complete. Expanded regression and full integration checks pass.

### 4. Narration continuity and failure presentation

- Restore the coordinator's current volume before any replacement player emits
  audio; cover mute and nonzero volume, paused navigation, and new-book default.
- Preserve preparation diagnostics after complete cleanup and test explicit
  dismissal/restart and cleanup-failure precedence.
- Document the precise session-volume and recovery behaviors.

Status: complete. Expanded regression and full integration checks pass.

### 5. Integration, independent review and closeout

- Run all gates below on the actual branch and inspect the complete diff.
- Freeze the patch and supply the exact HEAD, path identities, complete diff,
  expected behavior, and fresh host evidence to `change_reviewer`.
- Resolve actionable findings, rerun affected gates, and obtain APPROVE for
  the exact final patch. Missing evidence/reviewer means blocked acceptance.
- Move this plan to `completed/`, update active/completed/documentation indexes,
  and ensure the final reviewed identities include those documentation changes.

Status: implementation and host acceptance complete. The plan and maintained
indexes are closed; the final frozen-document identity review is recorded
separately as `NSC-20261020-R3`.

## Testing and benchmark strategy

Every command runs in normal local PowerShell outside the managed sandbox.
Use the existing Corepack shims to select repository-pinned pnpm 11.15.1:
`$env:PATH = 'C:\nvm4w\nodejs\node_modules\corepack\shims;' + $env:PATH`.

| Gate | Existing command, repository-root cwd | Timing / acceptance |
| --- | --- | --- |
| Focused desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/hardware-profile-compatibility.test.ts src/App.test.tsx src/tts/HardwareCompatibilityControls.test.tsx src/tts/ProductNarrationControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx` | New regression failures before fixes; all pass after affected changes |
| Focused native | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox` | Before/after native fixes; synthetic fixtures only |
| Repository integration | `pnpm.cmd check` | Fresh final evidence, including format, lint, types, TS/Node/Python/Rust tests, both native configurations and builds |
| Browser | `pnpm.cmd test:browser` | Fresh final reader/navigation regression coverage |
| Packaged native | `pnpm.cmd test:native-startup` | Fresh native/WebView2 synthetic lifecycle and cleanup coverage |
| Diff and source identity | `git diff --check`, `git status --short`, SHA-256/path manifest | Before review and after final documentation freeze |

Store content-safe command logs under ignored
`tmp/narration-state-corrections/`. Report failures and harness corrections
truthfully. Previous audit checks are historical diagnosis, not substituted
final acceptance. No live model benchmark, real multi-gigabyte acquisition,
installer mutation or real user EPUB is necessary for these owner-state fixes.
Expand validation only if changes cross those boundaries or review identifies
a concrete missing gate.

## Risks and rollback

- Holding the native operation mutex during verification could deadlock or
  block cancellation; keep critical sections short and inspect lock ordering.
- A stale probe fix must keep fresh hardware rejection authoritative and must
  not strand status at `checking` after a selection/reset.
- Preserving a diagnostic must not retain scheduler/PCM/service resources or
  hide a cleanup failure. Explicit user actions must still clear the error.
- Session volume must be applied before playback, with existing validation,
  and must not become persistent or affect the next book's default.
- Keep changes small enough to reverse by affected owner. Do not discard
  pre-existing/user edits or introduce automatic Git rollback.

## Progress log

- 2026-10-20: Created this plan after the user requested planning, branch
  creation and execution. Verified the clean base commit and existing ignored
  reproductions. Required documentation and applicable owner paths reviewed.
  No production code changed before this plan.
- 2026-10-20: Created and switched to
  `codex/fix-narration-state-and-optional-package` before regression/source edits.
  Added failing tests to existing harnesses; host results are
  `desktop-red.log` (12 expected failures/142 passes) and `native-red.log`
  (three expected failures/29 passes).
- 2026-10-20: Implemented busy native operation preservation, atomic removal
  admission and recoverable removal failure; all 32 focused native tests pass.
  Implemented initial availability settlement, preference reconciliation,
  immediate support status, volume ownership and retained preparation errors.
  The initial five-file desktop gate passes 154 tests.
- 2026-10-20: Added checks for late availability after a newer profile refresh,
  language selection followed by probe failure, volume edits while paused after
  navigation, App unmount during initial compatibility, and the rendered
  development-only summary.
- 2026-10-20: Added explicit restart and cleanup-failure precedence cases.
  All 160 focused desktop regressions pass. `pnpm.cmd check`,
  `pnpm.cmd test:browser` and `pnpm.cmd test:native-startup` pass outside the
  sandbox. All 1,316 repository inputs, HEAD and the empty index remained
  identical through these integration gates. Architecture review found no
  component, data-flow, persistence or deployment change requiring a diagram
  update. The patch now awaits independent review.
- 2026-10-20: Independent `change_reviewer` report `NSC-20261020-R1` returned
  CHANGES_REQUESTED with one low-priority finding, F1: the unchanged cleanup
  error copy still instructed a restart despite B2's recoverable native state.
  All 57 reviewed identities stayed stable; no other actionable finding was
  reported. Added a component regression that fails on that exact old copy
  (`review-f1-red.log`, one failure/eight passes), then changed the instruction
  to close apps using the files and retry Remove Chatterbox. The test also
  exercises the enabled retry through the real renderer client. Renewed host
  checks and independent acceptance remain pending.
- 2026-10-20: F1 now passes in the six-file focused gate (169 tests).
  Re-executed `pnpm.cmd check`, `pnpm.cmd test:browser` and
  `pnpm.cmd test:native-startup` on this revision; every command exits zero.
  The second before/after manifest again confirms 1,316 unchanged inputs,
  unchanged HEAD and an empty index. Fresh review of the corrected patch is
  pending; the original CHANGES_REQUESTED report remains historical evidence.
- 2026-10-20: Independent report `NSC-20261020-R2` returned APPROVE, resolved
  F1 and found no remaining actionable issue. Its 57-path identity recheck
  passed with unchanged HEAD, branch and empty index. Moved this plan to
  `completed/` and updated maintained indexes without changing accepted
  runtime/test inputs. Final documentary review uses a separate immutable
  `NSC-20261020-R3` receipt outside this plan's own identity.

## Discoveries and decisions

- The volume requirement is now explicit for one open-book coordinator, not
  a persistent default-volume feature.
- The six correctness defects and the volume improvement will share one final
  behavioral review, not a refactor-campaign validator.
- The current topology remains local and bounded; no new public process/EPUB
  contract or architectural component is proposed.
- Successful preference writes are retained as only the latest two bounded
  in-memory selections. A probe compares their object identities with those
  captured at its start, so newer choices replace stale reads while new hardware
  facts remain authoritative. Failed writes do not supersede persisted inputs.
- Availability commits its language/profile/result together under a revision,
  preventing a superseded asynchronous check from mutating a newer selection.
- The generic Stop path clears preparation presentation explicitly; internal
  failure cleanup preserves only the diagnostic and a zero-buffer failed
  presentation while releasing scheduler/player ownership.

## Final validation results

The following integration results were executed again after correcting review
finding F1. Initial `*-red.log`, `check.log`, `browser.log` and
`native-startup.log` captures remain separate from the final `*-r2.log` runs.

Host checks on 2026-10-20 used the repository root, local PowerShell 7.6.5,
Node 24.20.0, Corepack-selected pnpm 11.15.1, Cargo 1.97.1 and uv 0.11.29.
Every validation command ran outside the managed sandbox. Base and tested
HEAD are `dfba58a85c075b3a43555364bd96176408e5587f`; the branch is
`codex/fix-narration-state-and-optional-package`.

| Command | Result |
| --- | --- |
| Focused six-file Vitest command from the gate table | Exit 0; 169 tests pass (`desktop-green-04.log`) |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox` | Exit 0; 32 tests pass (`native-green-01.log`); final full Rust suites also cover these tests after formatting |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | Exit 0; final full check repeats type checking after the last test additions |
| `pnpm.cmd check` | Exit 0; evidence guard and 13 guard tests, format, lint, types, builds, 209 shared + 661 EPUB + 767 desktop Vitest tests, 77 desktop Node tests, 101 default + 100 release-locked Rust tests, and 586 Python tests pass (`check-r2.log`) |
| `pnpm.cmd test:browser` | Exit 0; nine Chromium scenarios pass (`browser-r2.log`) |
| `pnpm.cmd test:native-startup` | Exit 0; rebuilt WebView2 synthetic reader, protocol/service lifecycle, cancellation, restart/restoration and cleanup scenarios pass, with no errors or external requests (`native-startup-r2.log`) |
| `git diff --check` and input identity comparison | Exit 0; all 1,316 inputs match before/after integration; HEAD unchanged and index empty |

Each Rust configuration deliberately excludes the one subprocess-only fixture
from direct execution. Non-failing warnings report an unwritable existing
pytest cache, Vite's large-chunk advisory, and Playwright color settings.
No test assertion failed and no cache permission or user-data modification
was needed.

The complete logs and before/after identity manifests are local ignored
artifacts in `tmp/narration-state-corrections/`. The acceptance scope is these
state transitions and synthetic integration paths. No new real-model
throughput, multi-gigabyte acquisition or installer certification is claimed.

The final changed source/test SHA-256 identities are:

| Path, relative to `apps/desktop/` | SHA-256 |
| --- | --- |
| `src-tauri/src/tts_optional_chatterbox.rs` | `9E542EDF39883A26C30713BFB5E2B46D486D2BEC02B7E6D027F834F617779B52` |
| `src-tauri/src/tts_optional_chatterbox/tests.rs` | `F966514CCC436809D3E761EA7014467C24564179C107B09FF0BF8548370C9E75` |
| `src/App.test.tsx` | `154A508456C379241887EEB741B2C4FE383D9EE9299365F8CE7C008FCB489ABD` |
| `src/tts/HardwareCompatibilityControls.test.tsx` | `BA00B8BD13B5B80FB0757D227919CE4CBB4A38ADB3E0940BE805BDE9E8DE4121` |
| `src/tts/OptionalChatterboxControls.tsx` | `0600E3AA4447EC2771CA50DC9521EA850AB1505C38967C9D038B8B47AAC6FD54` |
| `src/tts/OptionalChatterboxControls.test.tsx` | `D7E432BEF2B37D291E3399913F1C533C74F5FBF2B3E5FB4F759E461EC7103944` |
| `src/tts/hardware-profile-compatibility.test.ts` | `FD0BC55A352E42CE582FE0FC5E0BD68E624A828C2EFA8623442D817571E7AE24` |
| `src/tts/hardware-profile-compatibility.ts` | `F5876F7D579FB95EB7F2BFCF4DFAE3CD4B6ADB1D7FD8A623C6EE38A8467675B5` |
| `src/tts/product-narration-coordinator.test.ts` | `51EAB6ED02DEA0C3B3A3AD8D91F2689E6A3EF020C5B9ADF67E510968BC32B780` |
| `src/tts/product-narration-coordinator.ts` | `C2B6371BBD52758ED7F1AF3694509FB87A5FA19177903D6DB514FCBFDF9D0BE0` |

Independent implementation review: `NSC-20261020-R2`, APPROVE. F1 from
`NSC-20261020-R1` is resolved and no actionable findings remain. The reviewer
independently rechecked the closed 57-path manifest, HEAD and empty index
before/after inspection and verified the attribution of the host evidence.
Its manifest SHA-256 is
`C1BDE2773A491CFB81D07BFA21D34D383627F88D0A8A14030CBC5C2661CA7389`.

Closing-document acceptance uses the separate `NSC-20261020-R3` receipt in
`tmp/narration-state-corrections/review-r3-report.md`. It covers the completed
plan, both maintained indexes, active-plan removal and unchanged source/test
identities. Keeping this last receipt outside the reviewed manifest avoids
changing the plan merely to record its own approval.

Changes are unstaged and uncommitted on the requested local branch. No remote
Git action was part of this execution.
