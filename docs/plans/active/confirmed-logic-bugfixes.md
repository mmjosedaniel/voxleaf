# Correct confirmed playback, recovery, EPUB-start, and cleanup defects

Planning date: 2026-10-21 (America/Bogota; 2026-10-22 UTC).
Status: **Planning only. Implementation and validation have not started.**
Branch: `codex/confirmed-logic-bugfixes`.
Audited base: `26ecd6cd6d678e541f6569d8d45661887942ad6b` (`main`).

The current authorization is to create this ExecPlan, its branch, and a local
documentation commit. It explicitly excludes executing the plan. No tests,
builds, probes, installer operations, or runtime fixes belong to that planning
task. Later execution requires a new instruction. This plan spans existing
roadmap milestones, so its filename intentionally has no milestone number.

## Goal

Correct the five bounded defects below without changing the supported engine
set, frozen audio/resource limits, shared serialized schemas, or existing
publication identities. Establish permanent regressions, current Windows host
evidence, and independent approval before accepting the implementation.

## User-visible outcome

- Interactive uninstall offers the existing independent Chatterbox removal
  choice when owned optional data exists.
- Pausing at an audio-unit boundary does not strand Resume or manufacture a
  playback failure. Completion and paused intent remain consistent.
- Valid operational errors from the local TTS engine receive the existing
  recovery treatment: containment and verified cleanup, then at most one
  explicit retry when allowed. Actual protocol violations remain terminal.
- A newly opened book, or an applicable book-start fallback, begins at the
  first addressable primary/linear content. Valid saved positions and explicit
  links to auxiliary content remain usable.
- Explicit Chatterbox removal includes an abandoned application-owned
  `tts/cb/.previous` promotion backup and does not report successful cleanup
  while that owned residue remains.

## Current state

The audit and its verification were static on the base above with a clean
worktree and empty index. They inspected production paths, callers, contracts,
existing test source, and relevant standards. They did **not** execute tests or
reproduce the failures in WebView2, Python, Rust, or NSIS. Historical passing
records elsewhere in the repository are not acceptance evidence for this work.

| ID | Verified code path and consequence | Evidence boundary |
| --- | --- | --- |
| CLB-01 | `un.ExactDirectoryExists` in `apps/desktop/src-tauri/windows/nsis-hooks.nsh:23` uses `StrCmp ... 0 +2` before a `StrCpy` and `Return`. An existing path jumps to `Return` without setting `$R0` to `"1"`. `un.OptionalChatterboxDataExists` consequently skips the interactive data page. | The relative-jump error follows directly from NSIS instruction semantics. Explicit silent removal uses a separate path. |
| CLB-02 | `AdaptivePcmPlayer.#handleEnded` in `apps/desktop/src/tts/pcm-playback.ts:390` clears its handle after `#refreshProgress(true)` refuses progress while paused. `resume()` rejects paused state with no handle, transition timer, or pending-start intent. The Web Audio backend's asynchronous suspension does not suppress an already pending completion callback. | A valid event ordering exposes the state-machine defect; real WebView2 reproduction and frequency remain unmeasured. Existing late-callback tests cover stop/seek/close/failure, not this paused completion. |
| CLB-03 | `receive_control` in `apps/desktop/src-tauri/src/tts_service_supervisor.rs:943` rejects a schema-valid `error` control when waiting for `state`, `audioMetadata`, or another success record. Python emits `error` plus failed state for engine failures. The resulting `tts-service-protocol-rejected` becomes terminal `protocol-failed` in the desktop coordinator. | The service and consumer disagree on existing valid responses. No new wire message is needed. Recovery authority allows one explicit attempt for eligible operational failures and zero for protocol failure. |
| CLB-04 | `projectBookV1` drops package spine linearity; the locator index preserves all spine items in order. `ReaderNavigationCoordinator` and position restoration use `publication.locators[0]` as book start. A leading addressable `linear="no"` document therefore becomes the default start. | This is narrower than the original audit claim. EPUB permits traversing non-linear items; their mere inclusion or narration is not sufficient evidence of a defect. Only default-start selection and matching fallback semantics are in scope. |
| CLB-05 | `promote` in `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs:1407` moves an old destination to `cb/.previous`. A failed backup deletion can leave it behind. `remove_with_manifest`, retained-data discovery, and NSIS optional-root handling omit that path. Removal can return Absent while residue remains. | The failure path is present in code; a real filesystem cleanup failure was not injected during the audit. A later successful promotion may remove the backup, but that does not repair explicit removal or discovery. |

Line numbers identify the audited base; use symbols after edits. Current product
status remains the roadmap's pre-alpha Windows local/portfolio MVP, with Piper
CPU and compatibility-gated Chatterbox v5. Qwen is development-only. Milestone 5
is complete; its text-preparation evidence does not establish these playback,
recovery, or installer corrections.

## Scope and non-goals

### Execution units and acceptance boundary

Use one focused correction per CLB ID, with its directly affected tests and
documentation. CLB-01 and CLB-05 share uninstall integration and must be checked
together on the final installer. CLB-02 and CLB-03 share product narration and
recovery acceptance. CLB-04 crosses the EPUB public API, reader, and persistence
boundary. Passing one unit does not accept the integration batch.

At execution start, record exact owned paths and any pre-existing changes.
Expand a path list only with a recorded dependency justification. Preserve
unrelated work; do not reset, clean, stash, or rewrite it. Future implementation
commits, pushes, PRs, merges, releases, and signing require their own current
authorization; this documentation commit does not authorize them.

### Non-goals

- No implementation during plan creation; no current tests or baseline runs.
- No rule that all `linear="no"` content must be hidden, skipped, or silenced.
- No renumbering/removal of spine entries, locator migrations, normalization
  changes, segmentation redesign, or new book-format admission.
- No automatic TTS retry, automatic provider fallback, buffer increase,
  startup delay, or replacement of Web Audio/WSOLA.
- No new production dependency, model/version upgrade, benchmark campaign,
  Chatterbox publication, Qwen evaluation, or general refactor.
- No broad deletion of `tts/cb`, application data, unrelated versions, or user
  files. No automatic restoration or execution of `.previous` as a runtime.

## Relevant files and documentation

Read `.agents/PLANS.md`, `AGENTS.md`, `docs/README.md`, `docs/product/mvp.md`,
`docs/architecture/overview.md`, `docs/architecture/system-diagram.md`, and
`docs/development/testing.md` before implementation. Follow
`.agents/skills/investigate-bug/SKILL.md` and
`docs/development/agentic-change-review.md` for behavioral corrections.

Candidate implementation and test paths are:

| Unit | Production owners | Existing regression/integration locations |
| --- | --- | --- |
| CLB-01 | `apps/desktop/src-tauri/windows/nsis-hooks.nsh`; release policy in `apps/desktop/scripts/windows-release.mjs` if needed | `apps/desktop/scripts/windows-release.node-test.mjs`; `scripts/test-windows-package-lifecycle.ps1`; actual interactive NSIS observation |
| CLB-02 | `apps/desktop/src/tts/pcm-playback.ts`; `adaptive-buffer-scheduler.ts`; `playback-backends/web-audio-pcm-playback.ts`; worklet only if the regression proves it necessary | `apps/desktop/src/tts/pcm-playback.test.ts`; `product-narration-coordinator.test.ts`; `apps/desktop/tests/browser/`; existing native smoke path |
| CLB-03 | `apps/desktop/src-tauri/src/tts_service_supervisor.rs`; `tts_service_protocol.rs`; desktop `apps/desktop/src/tts/process-client.ts` and `product-narration-coordinator.ts` only as required | Rust `tts_service_supervisor/tests.rs` and `tts_service_protocol/tests.rs`; desktop `process-client.test.ts`, `product-narration-coordinator.test.ts`, `operational-recovery.test.ts`; `services/tts/tests/test_service.py` |
| CLB-04 | `packages/epub/src/document/document-model.ts`; `resource/opened-publication.ts`; `public/open-epub-publication.ts`; `locator/locator-index.ts` and `locator-resolver.ts`; desktop `reader/reader-navigation.ts`, `persistence/reader-position-restore-coordinator.ts`, `reader-position-save-coordinator.ts` | Adjacent EPUB tests, `packages/epub/src/integration/`, desktop persistence tests, `ReaderPublication.test.tsx`, browser EPUB fixtures; typed publication fakes directly affected by an additive API member |
| CLB-05 | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`; NSIS hooks and release policy above | `tts_optional_chatterbox/tests.rs`; `windows-release.node-test.mjs`; lifecycle optional-root fixtures; installed synthetic-data removal |

The paths within rows are candidates, not instructions to edit every file.
Inspect `scripts/windows-package-lifecycle-data.ps1` before touching the real
lifecycle harness; its backup, quarantine, and restore protections must hold.

Relevant authorities:

- EPUB: ADR-0007 and ADR-0048; completed
  `docs/plans/completed/M005-narration-text-preparation.md`; roadmap Milestone 5;
  synchronization authority v1 and the existing locator recovery rules.
- Audio: adaptive-buffer authority v1, playback-transition-pause policy v1,
  synchronization authority v1, reader-settings-playback authority v3, ADR-0040.
- TTS: `docs/architecture/tts-service-protocol-v1.md`, ADR-0016,
  `docs/architecture/hardware-profile-recovery-authority-v1.md`, and canonical
  protocol-control/operational-error schemas under `packages/shared/schemas/`.
- Cleanup: ADR-0047, ADR-0058, current release authority and
  `docs/development/evidence-retention.md`.

External semantic references checked during the static verification:
[NSIS relative jumps](https://nsis.sourceforge.io/Docs/Chapter4.html#4.4),
[Web Audio suspension](https://www.w3.org/TR/webaudio-1.0/#dom-audiocontext-suspend),
and [EPUB Reading Systems 3.3 spine behavior](https://www.w3.org/TR/epub-rs-33/#sec-spine).
These establish semantics, not an executed product test or a claim of full EPUB
conformance.

## Architecture and constraints

1. Keep EPUB parsing, locator selection, scheduling, native supervision, and
   filesystem ownership in their current non-UI owners. A UI catch-and-ignore
   workaround cannot repair an inconsistent underlying state.
2. Keep stable book/spine/anchor IDs and source ranges. For CLB-04, prefer one
   package-owned, immutable default-start result derived from parsed linearity
   and the existing locator index. An additive `OpenedPublication` member is a
   proposed public API change, not an existing capability. Document it and
   update all direct consumers/fakes deliberately; preserve serialized BookV1,
   ReadingLocatorV1, persisted-state, and narration schemas.
3. Keep the full addressable locator index for explicit navigation and valid
   restored positions. Never reorder it merely to make index zero primary.
   Apply the new default only at genuine book-start decisions, preserving exact
   and nearest-valid recovery semantics elsewhere.
4. Treat `error` as a valid control only after canonical decoding, matching
   service identity, current-session checks, and applicable active-work identity.
   Allowlist eligible engine reasons; invalid/unknown messages, wrong identities,
   format violations, and impossible sequencing remain protocol failures. Reuse
   existing native failure codes where sufficient; do not add permissive parsing
   or silently change protocol v1.
5. Pause retains its established same-identity bounded-preparation behavior.
   Stop, seek, chapter/profile changes, close, and replacement still invalidate
   obsolete work. Late completion must not release PCM twice, replay a consumed
   unit, skip an unheard successor, or start audio while paused.
6. Preserve the existing playable-audio thresholds and simultaneous resource
   ceilings. Keep one active inference, bounded queues, one active audio handle,
   and at most one intentional transition timer. Do not insert silent PCM.
7. Treat `.previous` as one literal owned residual path under the validated
   product root. Use the existing containment, reparse-point, busy, service
   shutdown, and installed-runtime lock rules for discovery and removal. Reject
   unsafe trees without following them; report cleanup failure truthfully.
8. EPUB content, narration, and generated audio remain local and ephemeral.
   Tests use synthetic text/PCM and temporary data. Reports contain no book text,
   audio, private paths, secrets, or model weights.
9. Review the canonical diagram before final acceptance. Add an ADR for durable
   default-start API semantics and additive backup ownership before implementing
   those decisions; choose the next available ADR number then. Update current
   architecture/product/testing guidance as needed, preserving completed plans,
   historical evidence, frozen authorities, and generated sources. Update the
   diagram only if its documented boundary/data-flow/storage model changes.

## Milestones

### Milestone 0: Establish executable regressions and the bounded work order

**Work:** After execution is authorized, confirm branch/base, working-tree/index
state, available host tooling, and the current applicability of each finding.
Record the exact edit allowlist and fixture ownership before changing runtime
code. Add minimal regressions for each scenario and observe the expected failure
against the unchanged implementation in normal local PowerShell. Read existing
tests before introducing new harness machinery. A non-reproduced scenario must
be investigated and narrowed or withdrawn with evidence, not patched blindly.

**Validation:** Use the configured focused commands in the next section. For
CLB-02, control callback ordering deterministically before attempting a timing
scenario in a real WebView. For CLB-01, source-string assertions alone do not
prove the NSIS control flow. Record missing native evidence explicitly.

**Status:** Not started. Static findings only; no failing regression has run.

### Milestone 1: Repair optional-data detection (CLB-01)

**Work:** Replace fragile relative jumps with clear local labels or equivalently
correct control flow. Preserve both interactive choice defaults, update/repair
behavior, and all silent flags. Add behavioral coverage for an existing directory,
an empty directory, a regular file, a missing path, and each supported optional
root. Use an isolated compiled NSIS fixture or the actual installer to execute
the function; integrate a reusable fixture into the existing release test path
only after locating the configured NSIS toolchain. Do not invent an already
available smoke command or replace executable proof with string matching.

**Acceptance:** Real directories yield exactly `"1"`; files/missing paths yield
`"0"`. Interactive uninstall shows the Chatterbox choice only when appropriate,
with removal selected and preferences retention unchanged. Silent uninstall
without explicit flags and `/UPDATE` preserve the existing retention policy.
Final installer coverage runs together with Milestone 5.

**Status:** Not started.

### Milestone 2: Settle audio completion consistently with Pause (CLB-02)

**Work:** Model completion and paused intent explicitly in the player/scheduler
boundary. A completed backend handle may be retired while paused, but queue
accounting and the resumable successor/end state must settle coherently. Avoid
temporarily starting playback merely to consume final frames.

**Regression matrix:** Queue `ended` immediately before/after Pause; include an
already-accounted completed unit, remaining final frames, a buffered successor,
an unavailable successor, and the final publication unit. Exercise direct 1.00x
and WSOLA playback, a pending rate change, a remaining semantic transition delay,
duplicate/stale callbacks, and Stop/Seek/Close after the race.

**Acceptance:** No `invalid-state` caused solely by that boundary ordering; no
successor started before Resume, lost successor, replay, double release/completion,
or false recovery prompt. Account for the already-rendered tail while asynchronous
suspension settles. Resume follows existing refill/end-of-book rules. The next
unit's highlighting and heard-position persistence remain synchronized. Retain
existing Pause-during-rate-initialization coverage.

**Status:** Not started; real-host timing remains unmeasured.

### Milestone 3: Preserve operational failure classification (CLB-03)

**Work:** Handle the existing valid `error` response in the native receive path.
Validate identity and state before mapping closed engine-failure/engine-timeout
reasons to suitable existing operational native codes. Contain and terminate the
failed session through existing cleanup. Do not return failed audio or treat a
trailing failed-state record as success. Keep the typed desktop mapping aligned.
Load and warm currently share a prepare operation; precise phase-specific new
codes are unnecessary unless a regression establishes that need.

**Regression matrix:** Engine load failure, warm failure, synthesis failure, and
engine timeout; correct service/work identity; malformed/unknown error reason;
wrong/stale service or request identity; format violation; cleanup/termination
failure; repeated failure after the single explicit retry. Read Python's existing
service tests and extend them only if a needed response scenario lacks coverage.

**Acceptance:** Valid engine errors reach operational recovery, zero automatic
attempts occur, and at most one explicit attempt is enabled only after verified
cleanup. True protocol, cancellation-timeout, and cleanup failures remain terminal.
Success-record ordering and frozen protocol/resource bounds remain enforced.

**Status:** Not started.

### Milestone 4: Select the primary default reading start (CLB-04)

**Work:** Preserve parsed linearity long enough for the EPUB owner to derive a
default stable start. Prefer an additive immutable default-start value on
`OpenedPublication`, backed by the full locator index; settle its exact name,
availability/error semantics, and ADR before implementation. Update reader
initialization, persistence initialization/restoration, and genuine locator
`book-start` recovery to use that same authority. Inspect App and narration
creation so all initial consumers agree. Skip empty linear items when selecting
addressable primary content; if none exists, use a documented content-free
unreadable outcome, not an auxiliary document silently relabeled as primary.

**Regression matrix:** Synthetic EPUB 3 and admitted EPUB 2/NCX with an
addressable auxiliary item before primary content; omitted `linear` (default
primary); multiple primary items; empty leading primary content; no addressable
primary content; valid saved auxiliary position; explicit auxiliary link; missing
or invalid saved state and true book-start recovery. Preserve existing rejection
of a package with no linear item and all hostile-input budgets.

**Acceptance:** A fresh open starts at the appropriate primary locator, and
visible location, initial narration, and saved position agree. Existing stable
IDs/indexes and exact auxiliary locators remain resolvable. Normalization,
segmentation, and later traversal of non-linear entries retain their policy.
This change does not claim complete EPUB conformance.

**Status:** Not started. Only the narrowed default-start defect is accepted scope.

### Milestone 5: Own abandoned promotion backups through removal (CLB-05)

**Work:** Centralize the literal `.previous` path alongside the existing package
roots. Include safe residue detection, explicit in-app removal, NSIS detection,
and NSIS removal in the additive ownership decision. Preserve the transactional
promotion/rollback intent; do not swallow cleanup failures or activate the backup.
Cover existing promotion-time backup deletion with the same containment discipline
where required. A leftover backup must remain discoverable/removable after restart.

**Regression matrix:** Existing package promoted and old-backup deletion fails;
rollback leaves residual data; backup-only state; active package plus backup;
locked/read-only backup removal and later successful retry; missing backup;
unsafe root or nested reparse point; active worker/busy rejection; unrelated
version, reader preference, and external target sentinels. Use deterministic
filesystem fault injection and synthetic roots rather than a model download.

**Acceptance:** A safe backup is removed on an explicit removal request; locked
or unsafe residue produces truthful failure/retention, not Absent/success. The
interactive prompt recognizes backup-only data. Silent defaults and update/repair
retain data; exact removal flags cover the backup while preserving unrelated roots.
Verify real installer behavior after both CLB-01 and CLB-05 are implemented.

**Status:** Not started.

### Milestone 6: Validate the combined patch and obtain independent approval

**Work:** Update current documentation and this plan before review; inspect the
full diff for unrelated changes and unsupported claims. Run the final gates below
on exact current sources and artifacts, with sequential ownership of audio,
WebView2, installed data, and any GPU. Record actual results and cleanup.

Delegate one independent `change_reviewer` (GPT-6 Astra high) under
`docs/development/agentic-change-review.md`. Supply requested behavior, reproductions,
complete diff/new files, base/HEAD, exact reviewed-path identities, and host command
evidence. The reviewer does not edit or run tests. Pause source writing and Git
mutation during review; resolve actionable findings and obtain APPROVE for the
exact final patch. Missing tests, host evidence, or reviewer availability leave
acceptance BLOCKED. Do not substitute the implementer's own assessment.

**Acceptance:** All five scoped outcomes, relevant checks, cleanup, and current
independent approval are complete. Only then move the plan to `completed/`, update
both indexes and incoming links. Obtain a fresh review report covering those
closeout changes before the final handoff; do not reuse approval for a different
path/content set. Preserve the report outside its own identity manifest.

**Status:** Not started.

## Testing and benchmark strategy

All commands below are **planned**, not executed. Run every test/validation from
normal local PowerShell outside the managed automation sandbox, including failed
reproductions, formatting, lint, type/schema checks, builds, browser/native tests,
and installer observations. Record cwd, command, exit/result, source identity,
tool/runtime identity, and artifact hashes where applicable. Historical green
results or sandbox-only runs are not final evidence.

### Configured deterministic gates

Run from the repository root. Commands were read from current package scripts;
the package filters below select existing script owners.

| Gate | Existing command | When / expected evidence |
| --- | --- | --- |
| Workspace package preparation | `pnpm.cmd build:packages` | Before desktop consumers need current shared/EPUB output; rerun after those inputs change. |
| EPUB regression suite | `pnpm.cmd --filter @voxleaf/epub test` | Before/after CLB-04; public open, locator, auxiliary navigation, narration and bounded-input behavior. |
| Desktop and release-harness regressions | `pnpm.cmd --filter @voxleaf/desktop test` | Before/after relevant CLB units; includes Vitest plus configured Node release/harness tests. |
| Native regressions | `pnpm.cmd test:rust` | Before/after CLB-03/05; both ordinary and `release-locked-runtime` configurations. |
| Python protocol producer | `pnpm.cmd test:python` | Verify load/warm/synthesis error fixtures and existing service behavior for CLB-03. |
| Canonical shared compatibility | `pnpm.cmd --filter @voxleaf/shared test` | Retain canonical protocol/schema conformance; generated sources must match their authority. |
| Combined repository acceptance | `pnpm.cmd check` | Once final source/doc changes are ready: evidence guard/tests, formatting, lint, types, tests, and builds. No separate repetitive full run without invalidation. |
| Browser integration | `pnpm.cmd test:browser` | Real browser EPUB default-start and playback state regressions, after shared/package output is current. |

The first observed regression must fail for the identified behavior, not missing
dependencies, stale generated output, or an unavailable host. Use supported runner
filters only after verifying the actual script invocation; in particular the
desktop `test` script chains Vitest and several Node tests, so do not assume an
appended file argument filters every stage. New targeted commands must be added
and documented before being cited as existing commands.

### Native, installed, and interactive acceptance

| Gate | Existing command / procedure | Required evidence and limits |
| --- | --- | --- |
| Packaged native startup | `pnpm.cmd test:native-startup` | Current desktop binary, renderer/native startup and basic protocol integration. |
| Supported-profile reader regression | `pnpm.cmd test:tts:reader-corrections-host` | Existing sequential Piper ES/EN and Chatterbox ES/EN reader/speed arms. Extend their actual covered cases for boundary Pause and operational recovery; the present runner does not already prove the new scenarios. Record unavailable profile/hardware arms as pending. |
| Build final local installer | `pnpm.cmd package:windows:verified-core` | Fresh installer after all native/NSIS changes, reusing only a currently verified core payload. If core verification fails, diagnose and use the configured `pnpm.cmd package:piper-core` preparation when justified. No manual authority edits. |
| Release configuration/evidence | `pnpm.cmd package:windows:check` | Exact final binary/installer identities and current scoped release policy. Static checks cannot substitute for interactive behavior. |
| Silent installed lifecycle | `pnpm.cmd package:windows:lifecycle` | Updated synthetic optional-root matrix including `.previous`; original data/sentinels restored. Existing script rejects a pre-existing installation: use a suitable isolated Windows account/host, not automatic removal of the user's installation. |
| Interactive NSIS | Manual observation of that exact final installer/uninstaller in the isolated test environment | Existing optional data and backup-only cases show the expected choice/defaults; user retention/removal choices work independently of preferences. No invented interactive CLI switch or claim that the silent matrix covers this page. |
| Installed in-app residue removal | Controlled synthetic backup fixture under the isolated application's owned root | Discovery, Remove, cleanup failure, retry, restart, and unrelated-root preservation through the actual native command. Extend the existing installed harness only if needed; record any new scenario/entrypoint before use. |

Only run expensive preparation after deterministic checks pass. Inspect existing
verified runtime/core prerequisites first. Do not repeat multi-gigabyte acquisition
or broad engine benchmarks solely for these defects. A real operational-failure
scenario may use a bounded synthetic native child/fixture; never corrupt the user's
installed models. Actual playback checks still need the supported runtime arms.

Record startup/underrun/cancellation observations produced by existing host checks;
do not claim improved latency, measured race frequency, or a new performance gate.
If measurements regress, investigate within the affected boundary before acceptance.

## Risks and rollback

- **State races:** Updating only Resume may mask incomplete accounting. Require
  both callback orderings, exact ownership counts, and unchanged stale suppression.
- **Protocol weakening:** Accepting arbitrary `error` records could turn identity
  violations into retryable failures. Closed decoding/identity/sequence negative
  tests are mandatory; retain verified cleanup before any restart.
- **Locator compatibility:** Filtering or reindexing the spine would invalidate
  saved positions. Keep existing identities and add one default-start authority;
  do not broadly change nearest-spine recovery or auxiliary access.
- **Filesystem safety:** `.previous` may be locked or unsafe. Retain it with a
  truthful error rather than widening deletion. Before recursive operations verify
  resolved literal roots/ancestors and nested reparse handling. Use native
  PowerShell end-to-end for harness file operations; no cross-shell deletion.
- **User-data preservation:** Host lifecycle runs require isolated ownership and
  verified restoration, including after failure. Never delete a pre-existing
  installation or data merely to unblock a test; retain ambiguous backups and
  record required recovery. No change to global security/firewall settings is
  implied by this plan.
- **Artifact drift:** A rebuild invalidates previous installer evidence. Recheck
  code/artifact identities before review and any later Git handoff; rerun affected
  gates after changes. An unavailable gate is pending, not a pass.
- **Rollback:** Keep corrections separable. If a fix fails acceptance, revise or
  revert only task-owned changes within current authorization. Preserve user edits,
  installed-data backups, historical packages, and evidence. No branch reset,
  blanket cleanup, schema downgrade, or automatic runtime fallback.

## Progress log

- 2026-10-21: Static verification completed on the audited base without tests or
  edits. Confirmed CLB-01/02/03/05 and narrowed CLB-04 to default-start semantics.
- 2026-10-21: User authorized only the ExecPlan, a dedicated branch, and a local
  documentation commit; explicitly prohibited execution. Created
  `codex/confirmed-logic-bugfixes` from the audited base and prepared this plan
  with an active-index entry. Runtime implementation and every gate remain pending.

## Discoveries and decisions

- The original blanket claim that `linear="no"` entries must be omitted is
  withdrawn. EPUB permits their traversal; recognizing the primary default start
  is the narrower confirmed issue. Preserve valid auxiliary navigation/restoration.
- `BookV1` does not retain linearity, but package parsing does. The preferred fix
  derives a default locator inside EPUB rather than adding parser logic to React
  or mutating serialized stable identities. The additive API decision is pending.
- Web Audio suspension is asynchronous. A pending completion is not automatically
  invalidated by Pause; Stop/Seek/Close stale-callback protections do not cover it.
- The current Python producer already emits canonical engine error controls.
  Recovery classification can be corrected without designing protocol v2 or
  broadening model support. Native-to-desktop code changes, if needed, must remain
  explicit and typed.
- `.previous` is a promotion artifact, not an admitted runtime version. It needs
  explicit safe residual ownership; its existence never permits inference from it.
- Planning documentation has no runtime/contract effect and is exempt from
  `change_reviewer`. Implementation is not exempt and requires exact-patch APPROVE.

## Final validation results

**Implementation acceptance: NOT STARTED.**

| Evidence | Current result |
| --- | --- |
| Static findings and existing commands inspected | Recorded against the audited base; no runtime reproduction claimed. |
| Permanent regressions on unmodified implementation | Not run. |
| Corrections CLB-01 through CLB-05 | Not implemented. |
| Unit/integration/schema/lint/type/format/build checks | Not run for this task. |
| Browser, WebView2, actual TTS, installer and interactive checks | Not run. |
| Host-data backup/restoration | No host-data mutation performed by this planning task. |
| Independent implementation review | Not requested; required during execution. |
| Planning Git handoff | Documentation-only branch and local commit requested; record the resulting commit in the handoff. No push or PR authorized. |

During execution replace pending entries with exact commands, actual results,
source/artifact identities, cleanup outcomes, review ID/verdict, and remaining
limitations. Do not mark the plan complete while any required gate is pending.
