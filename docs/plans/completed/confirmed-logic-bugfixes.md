# Correct confirmed playback, recovery, EPUB-start, and cleanup defects

> Privacy redaction authorized on 2026-10-23: internal assistant metadata and
> unnecessary host inventory/capture identities were omitted. Originals are
> retained privately. Technical outcomes are unchanged; historical source
> hashes identify the original reviewed snapshots, not these redacted copies.

Planning date: 2026-10-21 (America/Bogota; 2026-10-22 UTC).
Status: **Completed on 2026-10-22: implementation, required behavioral validation and independent implementation approval satisfied.**
Branch: `codex/confirmed-logic-bugfixes`.
Audited base: `26ecd6cd6d678e541f6569d8d45661887942ad6b` (`main`).

The 2026-10-21 execution request supersedes the planning-only restriction and
authorizes implementation, regression tests and host validation. Leave all
changes unstaged and uncommitted; no push, PR, merge or publication. This plan spans existing
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

The following planning-audit snapshot was static on the base above with a clean
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

- The earlier planning task performed no implementation or baseline runs.
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

**Status:** Regression baseline established on the planning HEAD; each finding reproduced on host before its production fix.

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

**Status:** Complete. Compiled detection regressions and the final installer silent lifecycle pass. User-operated ordinary-session NSIS checks confirm absent-data omission, backup-only visibility, defaults and all four independent retention/removal combinations. Installed artifacts are hash-bound and final data restoration passed.

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

**Status:** Deterministic correction and all four Piper/Chatterbox ES/EN WebView2 boundary timing cases pass at 100/75 percent. The resumed v5 acquisition and installed-integrity diagnostic passed before the four-profile host rerun.

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

**Status:** Complete. Operational classification and identity-safe containment implemented; deterministic, real-client and real-child native regressions pass. R2 confirmed F01 resolved and R7 approved the complete implementation/evidence snapshot.

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

**Status:** Primary-start API and consumers implemented; package/reader regressions and the current Chromium primary/auxiliary restoration scenario pass.

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

**Status:** Complete. Native backup/promotion/lock/junction regressions pass in both Rust configurations. Installed-app discovery, real locked-file failure, restart/retry and preservation pass in the earlier host profile. The same final installer now passes ordinary-session interactive backup-only detection, retention/removal and independent preferences choices. Scope and environment distinctions are recorded in the host evidence summary.

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

**Status:** Complete. Behavioral and validation gates passed; independent R7 `CLB-R7-ASTRA-20261023T025408Z` approved the implementation with no actionable findings. The ordinary-session interactive matrix, final reinstall/restoration and fresh post-restoration integrity/four-profile checks pass. No source changes followed the validated implementation. The separate closeout report covers this plan move and final index/link changes.

## Testing and benchmark strategy

The tables define required commands; actual executions and limits are recorded in the progress and final results sections. Run every test/validation from
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
| Supported-profile reader regression | `pnpm.cmd test:tts:reader-corrections-host` | Sequential Piper ES/EN and Chatterbox ES/EN reader/speed arms now include controlled direct/WSOLA completion after Pause. The native-startup synthetic-child matrix and real-client coordinator tests cover operational recovery. Unavailable profile/hardware arms remain pending. |
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

- 2026-10-22 closeout: independent `change_reviewer` GPT-6 Astra high issued
  APPROVE, `CLB-R7-ASTRA-20261023T025408Z`, with no actionable findings. It
  verified 99 reviewed paths, all 32 new evidence/helper identities and the
  saved immutable report SHA-256
  `c5c0faa10196e888b098f9e10753c70355cc0b5efab4f4f8a242ce50aa7a2e53`.
  It explicitly accepted unchanged-input evidence reuse at its recorded scope
  and the new ordinary-session boundary; no remaining behavioral acceptance
  blocker was identified. After that approval, moved this plan to completed
  and updated maintained indexes/current links. The separate final closeout
  review below covers those documentation changes. Runtime files stayed
  unchanged; branch/HEAD retained, index empty, no commit or publication.

- 2026-10-22 post-restoration ordinary validation PASS (UTC logs end 2026-10-23):
  the user launched the prepared wrapper in normal System32 Windows PowerShell.
  `pnpm.cmd check:evidence`, `pnpm.cmd test:chatterbox:installed-integrity` and
  `pnpm.cmd test:tts:reader-corrections-host` each returned 0. Integrity passed
  all four diagnostic stages, 1 test/0 failures in 151.02 seconds. All four
  Piper/Chatterbox ES/EN arms and all eight Pause/ended direct/WSOLA cases passed.
  The wrapper confirmed unchanged non-documentation R6 inputs, installer and
  installed executable; the new diagnostic build is separately bound below.
  original optional-package data remains present, old cached data absent, no reader processes remain,
  HEAD is unchanged and the index is empty. Windows PowerShell's NativeCommandError
  decoration of ordinary stderr is preserved in the logs; native exit codes and
  explicit test summaries establish the result, not that decoration.
  See the [ordinary-host validation summary](../evidence/confirmed-logic-bugfixes/ordinary-host-validation.md)
  for commands, user-attributed NSIS observations, artifact identities, bounded
  metrics and restoration proof. All earlier progress entries retain their
  checkpoint meaning; pending statements there are historical, not current gates.
  Reviewed the canonical system diagram again: these fixes preserve its major
  component, process and data-flow boundaries, so no diagram edit is required.

- 2026-10-22 final ordinary reinstall/restoration PASS: the user executed
  `finish-ordinary-nsis.ps1` in normal Windows PowerShell. The final reinstall
  snapshot records exit 0 and matching installer/executable/uninstaller hashes.
  `ordinary-nsis-final-restoration.json` confirms the exact same-volume move of
  original app data into the ordinary root, preservation of original optional-package data and local
  preferences, old cache source absent, synthetic deletion authority revoked,
  backup/quarantine absent and external sentinel unchanged. No model download
  or runtime source change occurred. Prepared the ignored
  `validate-ordinary-restoration.ps1` wrapper to run only configured commands,
  in order: `pnpm.cmd check:evidence`, `pnpm.cmd test:chatterbox:installed-integrity`,
  `pnpm.cmd test:tts:reader-corrections-host`. It binds unchanged R6 non-doc
  inputs and installed artifacts before/after, captures actual normal-host
  versions, exit codes and logs, and stops on failure. Execution is pending;
  prior cached-profile results do not replace this post-restoration validation.

- 2026-10-22 ordinary interactive both-selected removal PASS: the prepared and
  reinstalled `ordinary-nsis-both-removal-*` snapshots bind the unchanged final
  artifacts and both synthetic marker classes. The final observation records
  program, `.previous`, current-version and preference roots absent, unchanged
  unrelated/external sentinel hashes, and cached v5 present. All requested
  ordinary interactive page/default and choice combinations have now been
  exercised; final host restoration remains pending.
  Prepared the ignored `finish-ordinary-nsis.ps1` helper for normal PowerShell.
  It verifies source/target containment and non-reparse ancestors/trees, refuses
  unexpected files in the owned synthetic root, reinstalls the same verified
  installer, cleans only owned synthetic data through the existing helper and
  revokes deletion authority. It then performs a non-overwriting same-volume
  directory rename from the explicit Codex-cache original app-data root to the
  absent ordinary root, preserving old model versions, v5 and original
  preferences. There is no copy/delete fallback. This completes the intended
  ordinary reinstall with preserved data; execution and post-restoration
  ordinary-profile integrity/playback validation remain pending. The helper
  never launches or controls the blocked uninstaller.

- 2026-10-22 ordinary interactive current-data retention/preferences removal
  PASS: `ordinary-nsis-current-retention-preferences-removal-reinstalled.json`
  records exit 0 and matching final artifacts; its prepared snapshot records
  the synthetic current-version marker SHA-256. The user-operated uninstall's
  observation shows the program absent, current-version marker unchanged,
  preferences directory/marker absent, and unchanged unrelated/external markers.
  Cached v5 remains present. All three ignored evidence filenames share the
  `ordinary-nsis-current-retention-preferences-removal-` prefix. Next exercise
  both removal choices selected using the already prepared helper's
  `-Phase both-removal`; this result and final fixture cleanup/reinstallation
  remain pending.

- 2026-10-22 ordinary interactive backup removal/preferences retention PASS:
  `ordinary-nsis-backup-removal-reinstalled.json` records exit 0, the same
  installer/installed executable/uninstaller hashes and unchanged markers before
  the user-operated uninstall. The subsequent normal PowerShell observation
  `ordinary-nsis-backup-removal-observation.json` records the program and
  `.previous` directory/marker absent; preferences, unrelated and external
  sentinel hashes remain equal to preparation. Cached v5 remains present.
  Prepared the ignored `prepare-ordinary-current-fixture.ps1` helper for the two
  remaining interactive combinations. It reuses the verified reinstall helper,
  rejects unexpected existing target roots/reparse points, and adds only a
  synthetic current-version marker or recreates the synthetic preferences
  marker. Its execution and these two interactive outcomes are still pending.

- 2026-10-22 ordinary interactive backup retention PASS: after the user-operated
  uninstall with both removal choices unchecked, the normal Windows PowerShell
  observation (`inspect-ordinary-nsis-result.ps1 -Phase backup-retention`) shows
  executable/uninstaller absent and `.previous`, preferences, unrelated and
  external marker SHA-256 values identical to preparation. Current-version root
  remains absent and cached v5 remains present. Evidence:
  `temp/clb-review/ordinary-nsis-backup-retention-observation.json`.
  Prepared `reinstall-ordinary-nsis.ps1 -Phase backup-removal` for the user's
  normal PowerShell: verify prior marker identities and absent executables,
  install the same hashed NSIS package with `/S`, verify both installed hashes
  and unchanged markers. It does not open or automate the blocked uninstaller.
  Reinstallation and the next interactive removal combination remain pending.

- 2026-10-22 backup-only interactive visibility/default PASS: the user's screenshot
  shows the actual ordinary uninstaller's Spanish Chatterbox data page and the
  optional-removal checkbox initially checked. The preceding prepared fixture
  contains only `.previous` as an optional root. Next the user will uncheck that
  option, keep preferences removal unchecked and complete uninstall to exercise
  retention. Prepared a read-only, non-overwriting marker observation helper
  `temp/clb-review/inspect-ordinary-nsis-result.ps1 -Phase backup-retention`
  for the same normal PowerShell session. Uninstall and marker outcomes remain
  pending; page visibility alone does not establish cleanup/retention behavior.

- 2026-10-22 backup-only ordinary-session fixture prepared successfully by the
  user in System32 Windows PowerShell. Read back
  `temp/clb-review/ordinary-nsis-phase1-prepared.json` and
  `ordinary-nsis-data-state.json`: no original ordinary app data existed, the
  helper owns the synthetic root, no original backup was needed, and the only
  optional root is `tts/cb/.previous`. The three synthetic marker hashes and
  external sentinel hash are recorded; installed executable/uninstaller hashes
  still match the final artifacts. The real cached Chatterbox tree was not a
  preparation target. Next observe backup-only page visibility/defaults before
  selecting any removal choice; this interactive outcome remains pending.

- 2026-10-22 manual absent-data observation: the user's screenshot of the final
  uninstall confirmation shows the ordinary installation path and an unchecked
  preferences/reading-position/recovery checkbox. The user explicitly confirmed
  no Chatterbox page appeared before it, then reported that Back closed the
  wizard. No uninstall was confirmed. This supplies the absent-data page/default
  observation, not retention/removal evidence. Prepared the ignored helper
  `temp/clb-review/prepare-ordinary-nsis-fixture.ps1` for normal user PowerShell;
  it refuses any pre-existing app-data root or test state, verifies the uninstaller
  hash, reuses the lifecycle ownership helper and creates only synthetic
  backup/preferences/unrelated markers plus an external sentinel. Execution is
  pending. The current Computer Use policy block still prevents automation of
  the uninstaller; the user will operate its controls manually.

- 2026-10-22 ordinary-session inspection completed by the user from Windows Run
  (`powershell -NoProfile -NoExit -File "<repo>/temp/clb-review/inspect-ordinary-profile.ps1"`).
  The saved `ordinary-profile-inspection.json` records Windows PowerShell under
  System32, the expected installed executable/uninstaller SHA-256 identities,
  zero running reader processes, no ordinary app-data/preferences/optional roots,
  and retained v5 in the explicit Codex cache. Thus the ordinary installation
  exists, but the cached v5 has not been transferred or admitted in that session.
  Start manual NSIS acceptance with the absent-optional scenario before creating
  any synthetic roots. Asked the user to observe all pages and preferences
  defaults, stopping before final uninstall; observation remains pending.

- 2026-10-22 ordinary-session recovery: the user manually launched the unchanged
  final installer from the repository and selected Add/Reinstall components.
  User screenshots show Installation Complete and then Explorer opening
  `%LOCALAPPDATA%/VoxLeaf` with `resources`, `uninstall` and
  `voxleaf-desktop`. This establishes user-visible installation success, not
  interactive uninstall acceptance or the data/profile boundary. Prepared the
  ignored, read-only `temp/clb-review/inspect-ordinary-profile.ps1` diagnostic
  for the user to launch from Windows Run in normal PowerShell. It records
  executable hashes and owned-root presence without changing app data; its
  execution/result is still pending. No synthetic data has been prepared in
  that ordinary session and no uninstall has been requested there yet.

- 2026-10-22 interactive handoff exposed an environment discrepancy before any
  wizard scenario ran: the user's Explorer reported the supplied ordinary
  `%LOCALAPPDATA%/VoxLeaf` path unavailable, although the escalated PowerShell
  environment could see it. Explicit filesystem inspection found the executable,
  synthetic `.previous` marker and protected original backup under the Codex
  package's `LocalCache/Local` directory. The earlier ordinary-profile claims
  are therefore not established by those path checks or by the recorded process
  identity alone. Preserve the executed test results, but do not transfer the
  installed lifecycle, residue, acquisition or profile-location evidence to the
  user's ordinary Explorer session; their environment applicability requires
  revalidation. Interactive NSIS remains NOT RUN, and the independent reviewer
  was notified to keep acceptance paused.
  The existing lifecycle ownership helper restored the original data using
  explicit physical cache paths after checking the exact synthetic marker,
  containment and non-reparse trees. Restoration returned no failures; original optional-package data is preserved, synthetic marker/backup/quarantine are absent. Evidence:
  ignored `temp/clb-review/interactive-virtualized-restoration.json`. The final
  installer SHA-256 remains `53be8afdafc6b40d434b49b31e64f58d0049ba2edf9d4d0ef8a4caefb44e7434`.
  No runtime source or Git index changes were made. Next establish the ordinary
  Windows installation/data boundary before preparing another interactive test.

- Manual NSIS continuation authorized: the user will operate the actual final
  uninstaller because Computer Use cannot target it. Before any manual uninstall,
  use the existing lifecycle ownership helper to rename original app data into
  a verified sibling backup (including newly installed v5); persist recovery
  state in `temp/clb-review/interactive-resumed-data-state.json`. Use only
  synthetic owned optional/preference/unrelated markers in the active data root.
  Exercise backup-only page visibility/defaults and retention, backup removal
  while preferences remain, current-version retention with preferences removal,
  both classes removed, and absent-optional page omission. Reinstall the same
  hashed installer between completed uninstall scenarios, without launching
  the reader on test data. Attribute page observations to the user and verify
  marker outcomes independently on the host. Restore original data with the
  existing helper and leave the same reviewed program installed after testing.
  R6 review was paused before report issuance; its source review found no runtime
  issue and identified one stale milestone-2 status, now corrected. Fresh final
  documentation and identities require a new immutable review after this work.

- Resumed host validation passed `pnpm.cmd test:chatterbox:installed-integrity`
  (exit 0, one explicit installed diagnostic, 141.61 seconds) and
  `pnpm.cmd test:tts:reader-corrections-host` (exit 0, all four Piper/Chatterbox
  ES/EN arms). Logs: `temp/clb-chatterbox-integrity2.log` and
  `temp/clb-profiles3.log`. All eight direct/WSOLA Pause/ended cases at 100/75
  percent passed with paused intent, resume and cleanup. Every arm reported zero
  external requests, generated audio files and retained units after cleanup,
  plus zero underruns during its approximately 60-second steady observation.
  Chatterbox ES/EN quick startup was 41,278/40,151 ms with 17,480/15,800 ms
  playable lead; cancellation was 298/312 ms. These are current scoped host
  observations, not a guaranteed startup time or a broader performance claim.
  The approximately 15 seconds still describes playable audio, not elapsed wait.
- The configured reader command rebuilt only the diagnostic application
  (`bundle.active=false`); its SHA-256 is recorded below. The final NSIS installer
  and installed release executable remain byte-identical, so their earlier
  installed lifecycle/residue evidence is not replaced by diagnostic playback
  evidence. Final inspection confirms v5 and retained older optional-package data present, no desktop
  test process remaining, and an empty Git index. Supporting captures:
  `temp/clb-review/resume-profile-summary.json`, `resume-final-state.json` and
  `resume-baseline.json`. Runtime/test source files were not edited in this
  continuation. Actual interactive NSIS is the sole remaining acceptance group;
  manual assistance was requested because the tool blocks that application.

- Resumed acquisition completed successfully through the unchanged installed
  application's confirmation/download/verification flow. The app reports a
  verified local Chatterbox package; ordinary-host inspection confirms `cb/5`
  exists, prior optional-package data remains, and operation staging is absent. Captures:
  `temp/clb-review/resume-chatterbox-installed-ui.txt` and
  `resume-acquisition-state.json`. Closed the app before the configured integrity
  diagnostic. This establishes installation, not yet successful integrity or
  playback gates. Preserved the exact loose release-locked executable in ignored
  `temp/clb-review/release-locked-voxleaf-desktop.exe` before the later configured
  diagnostic build can replace the loose target executable; the installed
  executable and final NSIS artifact are unchanged.

- 2026-10-22 resumed execution: all 95 R5 reviewed source/documentation byte
  identities, planning HEAD and empty index still match. The installed executable
  and final installer also retain their recorded hashes. Chatterbox v5 is absent;
  the inspected local package preparation contains no v5 payload. The existing
  explicit acquisition authorization and renewed continuation request support
  one bounded retry through the installed app. This prerequisite retry does not
  repeat benchmarks or rebuild the optional package, and preserves older
  versions. No further download retry is planned if this attempt fails.
  Interactive NSIS still requires manual assistance because Computer Use blocks
  that application; no alternate automation bypass is attempted. R5 remains the
  immutable review of its earlier documentation snapshot, not this new progress
  entry. Final results and any new review will be recorded after execution.

- Follow-up outcome, 2026-10-22: the authorized ordinary uninstall returned 0
  after original data had been moved by the existing ownership helper to a
  verified sibling backup. The unchanged configured command
  `pnpm.cmd package:windows:lifecycle` then returned 0 in local PowerShell
  outside the sandbox (`temp/clb-lifecycle2.log`): install, first start, repair
  and all six silent option scenarios passed, including all seven optional
  roots, exact preference scope and unrelated sentinels. Its own
  `preexistingApplicationDataRestored: false` correctly describes an empty test
  root: the user's actual data was protected by the outer verified backup, not
  by that inner harness run. No guard was removed or bypassed.
- Installed in-app residue procedure passed on the exact final installer.
  A real Windows file handle from the existing cleanup barrier prevented
  deletion of a synthetic `.previous` file. The actual installed Settings UI
  showed cleanup failure, retained the backup, and rediscovered it after a full
  application close/restart. Releasing the handle and clicking Remove again
  produced the absent state and actual directory absence. Synthetic `cb/99`,
  unrelated application data and preference markers remained byte-identical.
  The barrier exited 0. Evidence: ignored
  `temp/clb-review/installed-residue-{locked,restart,retry}-ui.txt` and
  `installed-residue-{locked,retry}-files.json`. No production file or public
  behavior changed during this follow-up.
- Interactive NSIS remains NOT RUN. With the final installer installed and
  synthetic optional data prepared, Computer Use rejected launching the exact
  `uninstall.exe` with `product policy blocks this app`. Did not rename it,
  switch automation mechanisms or otherwise bypass that restriction. The
  compiled fixture and six silent scenarios do not establish page visibility,
  checkbox defaults or interactive retention/removal acceptance.
- The original acquisition ended independently before any cancellation:
  `github-release`, artifact 1, HTTP 200, read/IO failure after 485,984 ms,
  received 1,896,430,272 of 1,900,000,000 bytes. The UI reported download failure
  and the operation staging directory was absent. Exported the existing
  content-free diagnostic locally to ignored
  `temp/clb-review/follow-up-download-error.json`; it was not transmitted.
  No v5 runtime was installed, no successful integrity/profile result is claimed,
  and no repeated multi-gigabyte acquisition was started solely for these fixes.
  The earlier cancellation question became unnecessary when this attempt ended.
- Final restoration passed through `Complete-LifecycleData`: synthetic product
  data removed, original data restored, sibling backup and quarantine absent,
  original optional-package data preserved, external sentinel unchanged. VoxLeaf is
  left installed as the user requested. Evidence:
  `temp/clb-review/follow-up-restoration.json`. Installer identity is unchanged.
  The installed executable SHA-256 is
  `3be12a8e0cee3141297827734450bbb15c6faa97a24f52bc6aa681a7e6aa19f3`;
  it differs from the loose executable only at offsets 9,128,866-9,128,868,
  where Tauri's bundle marker is `NSS` instead of `UNK`. Bind the installed
  observations to that installed identity, not to the loose executable hash.
  Windows exposes the same installed bytes through the package-host LocalCache
  view as well; the actual locked-file/marker observations verified the product
  data used by the host operations and UI.
- Follow-up review output is
  `docs/plans/evidence/confirmed-logic-bugfixes/change-review-follow-up.md`,
  excluded from its own identity manifest. The earlier R3 report remains
  immutable historical evidence. Freeze all source/documentation before the
  new review and retain BLOCKED until the remaining gates are actually satisfied.

- Follow-up installed procedure (recorded before use): while original data is
  held by `scripts/windows-package-lifecycle-data.ps1` under the verified
  `.voxleaf-clb-original-20261022` sibling backup, install the exact final NSIS
  artifact with its documented silent mode. Create only synthetic `.previous`,
  preference and unrelated-root marker files under the isolated product root.
  Use the existing `acquisition-file-barrier.ps1` cleanup mode to hold a real
  Windows handle denying deletion of the backup marker; operate Remove through
  the installed app, observe failure and retained residue, close/restart, release
  the handle and retry, then verify absence and unrelated markers. Exercise
  actual interactive uninstall with optional data (retention choice), backup-only
  data (default removal choice), and no optional data (page skipped). Record
  accessibility observations and exact marker outcomes. These are the planned
  manual procedures above, not a new production command or alternate remover.

- 2026-10-22 follow-up: the user explicitly authorized downloading/installing
  Chatterbox v5 in the current profile, then authorized uninstalling and
  reinstalling the ordinary VoxLeaf installation on this Windows host. This
  supersedes the earlier restriction against removing that installation; it
  does not authorize deleting existing preferences, retained models or private
  publications. The planned continuation uses the existing lifecycle data
  ownership helper to move original application data to a verified sibling
  backup while synthetic installed scenarios run, then restores it and leaves
  the reviewed VoxLeaf installer installed. No safety guard will be bypassed.
  The host token is not administrator; Windows Sandbox executable and Hyper-V
  PowerShell module are unavailable. Separate-account preparation is no longer
  required if the authorized ordinary uninstall and verified data isolation
  succeed; any actual host prerequisite failure remains blocked.
- Follow-up preparation verified the same planning HEAD, empty index, all 45
  R3 task-path hashes and the final release binary hash. Opened that executable
  using the Computer Use skill with a fresh repository-authored synthetic EPUB.
  The ordinary selection/consent flow admitted v5 without removing retained
  existing optional-package data. After explicit user approval, the UI began the declared
  8,240,055,749-byte acquisition. Automatic approval review initially rejected
  the acquisition until that explicit approval; later it rejected cancellation
  of approximately 1.1 GiB of non-resumable partial download. Cancellation
  was requested; at that preparation checkpoint no cancellation, uninstall,
  data backup or installation test had occurred. Later outcomes are recorded
  above. Content-free environment evidence:
  ignored `temp/clb-review/follow-up-environment.json`.

- Final installer attempt 2 passed `pnpm.cmd package:windows:verified-core`
  with exit 0 using the process-local module-path repair described below.
  `pnpm.cmd package:windows:check` exited 0. The unsigned local installer and
  executable identities are recorded below; no signing or publication occurred.
  Fresh generated receipt: ignored `temp/clb-review/current-windows-package-evidence.json`.
  The historical tracked v3 receipt was restored and verified at SHA-256
  `7fd9db70e4964bd3ecbded94e2861f48c02bc49ec1949cf49d787077f91ac30c`.
- `pnpm.cmd package:windows:lifecycle` exited 1 at its first safety guard,
  `windows-release-lifecycle-preexisting-install`, before backing up or mutating
  application data or running the installer. No installed test data needed
  restoration. Interactive NSIS and installed in-app residue scenarios were
  not run; they require a suitable isolated host/account. Compiled synthetic
  NSIS execution and native synthetic backup tests do not substitute for them.
- Host identities: Windows 10.0.26200.0, PowerShell 7.6.5 (Windows PowerShell
  child 5.1.26100.9711), Node 24.20.0, pnpm 11.15.1, cargo 1.97.1, uv 0.11.29,
  Edge WebDriver 155.0.4283.45. Driver/NSIS executable hashes are retained in
  ignored `temp/clb-host-tool-identities.json`; tauri-driver does not expose a
  version flag, so its executable hash is the recorded identity.
- The final review report is the additional documentation output
  `docs/plans/evidence/confirmed-logic-bugfixes/change-review.md`. Per the review
  policy it is stored outside its own identity manifest; the source and plan
  remain frozen while the reviewer produces it. The linked report records
  the final Review ID/verdict and exact source identities without a self-hash cycle.
- Final installer attempt 1 completed NSIS generation but
  `pnpm.cmd package:windows:verified-core` exited 1 at
  Get-AuthenticodeSignature: Windows PowerShell 5.1 launched through Node
  inherited PowerShell 7 module paths and could not load its Security module
  (duplicate extended type-data members). Reproduced the module failure in a
  Node-spawned PowerShell child. Restricting process-local PSModulePath to
  `C:\Windows\System32\WindowsPowerShell\v1.0\Modules` and
  `C:\Program Files\WindowsPowerShell\Modules` made that probe succeed.
  Retry the unchanged configured package command under that temporary
  environment; no repository tooling or persistent machine setting changed.
  The historical receipt was verified restored after the failed attempt.
- Final-source profile rerun `pnpm.cmd test:tts:reader-corrections-host`
  exited 1 (`temp/clb-profiles2.log`): Piper ES/EN each exited 0, including
  the new controlled Pause/ended orderings at 100/75 percent, six playback
  speeds, synchronization, seek/chapter restart and cleanup. Chatterbox ES/EN
  each exited 1 at optional profile selection before any audio. Required
  installed v5 remains absent, so those arms are blocked rather than passed.
  Default diagnostic binary SHA-256:
  `8646c6eeb98e76055a639a629919b73bf2287cabe6adba99898612efa6e1a23f`.
  Piper quick command-to-audible was 4811/4508 ms and cancellation 682/243 ms
  (ES/EN); both observed zero underruns, zero retained units after cleanup,
  zero generated audio files and zero external requests. These bounded runs
  do not establish general performance improvements or Chatterbox behavior.
- Independent R1 `CLB-R1-ASTRA-20261022T020505Z` returned BLOCKED with
  one confirmed P1 (F01): after native failure containment removed the session,
  the real client's identity-bound shutdown received InvalidState, preventing
  explicit product recovery. The fake coordinator client and direct native
  replacement had missed this handshake. Add a failing shutdown regression,
  then a bounded verified-termination receipt, real-child acknowledgement and
  real-TtsProcessClient coordinator coverage. R1 identities remained stable;
  the report does not approve this patch. No new production owner is required.
- Independent R2 `CLB-R2-ASTRA-20261022T021737Z` reviewed all 45 task paths
  plus the same 36 supporting paths with before/after identities PASS, empty
  index and unchanged HEAD. It confirmed F01 resolved with no remaining
  actionable findings, but returned BLOCKED for missing profile/installed
  acceptance. Source writing was paused during both reviews. Final
  documentation/evidence updates require another immutable report; R2 is not
  approval for later bytes.
- Final-source `pnpm.cmd check` attempt 6 exited 0: 209 shared, 674 EPUB,
  818 desktop Vitest, 97 Node, Rust 117/116 (two ignored helpers each), 619
  Python, 13 evidence tests, format/lint/types and builds passed. Input identities
  are in `temp/clb-review/check6-inputs.json`. No executable edits followed.
  `pnpm.cmd test:native-startup` attempt 2 exited 0, now including the real-child
  identity-bound shutdown handshake. Its binary SHA-256 is
  `aaf28bf0adb67ae326f70b2f5865eab4867cc259a41d5b17f244378f101e7823`.
  Logs are `temp/clb-check6.log` and `temp/clb-native2.log`.
- Supported-profile command exited 1: Piper ES/EN each passed, including
  queued completion at 100/75 percent, synchronization and cleanup; Chatterbox
  ES/EN failed before audio with optional-profile-unavailable. Existing read-only
  `pnpm.cmd test:chatterbox:installed-integrity` exited 101 at canonical-root.
  Exact host-root inspection confirmed the required installed v5 root missing.
  This is an environment prerequisite, not passing Chatterbox evidence. No
  acquisition, model modification or user-installation deletion was attempted.
- `pnpm.cmd package:piper-core:check` exited 0; current core payload is usable.
- The configured final package build writes the existing historical
  `windows-package-evidence-v3.json`. Preserve its bytes/hash in ignored scratch
  before running the command, retain the new generated receipt separately,
  and restore the historical file byte-for-byte afterwards. Bind the new local
  installer in this plan; do not rewrite accepted historical receipts or claim
  their installed lifecycle results apply to the rebuilt artifact.
- F01 red `pnpm.cmd test:rust` exited 101 (115 pass, one failure, two ignored):
  matching shutdown returned InvalidState instead of stopping/stopped after
  verified containment. The repair keeps one native identity receipt issued
  only after successful termination and clears it on replacement/force-stop.
  Rust then passed 117/116 with two ignored per configuration. Real-client
  coordinator coverage passed with the desktop suite (818 Vitest + 97 Node).
  Its first attempt expected the wrong repeated-failure terminal phase;
  corrected the assertion to the existing policy's `unavailable`, with no
  production policy change. Native real-child shutdown/replacement gate and
  final combined revalidation remain required for the repaired source.
- Earlier deterministic checkpoint, superseded by attempt 6: `pnpm.cmd check`
  attempt 5 exited 0 in normal host PowerShell (log `temp/clb-check5.log`).
  Evidence guard and 13 evidence tests, formatting, lint, TypeScript/Python
  types, 209 shared + 674 EPUB + 814 desktop Vitest tests, 97 desktop Node
  tests, Rust 116/115 tests with two intentional ignored diagnostic helpers
  per configuration, 619 Python tests and all builds passed. Warnings were
  the existing large renderer chunk advisory and one Python dependency
  deprecation; no test failure was hidden. Source identities were captured
  in `temp/clb-review/check5-inputs.json`; subsequent documentation edits
  do not change those executable inputs.
- `pnpm.cmd test:native-startup` exited 0 with a fresh desktop binary
  (`temp/clb-native1.log`). The supervised fake-child matrix includes
  canonical load/warm/synthesis failures and timeout, containment, explicit
  replacement and subsequent synthesis. The existing WebView2 reader,
  persistence and cancellation smoke also passed with no external requests.
- At that checkpoint the supported-profile matrix was pending; the final
  profile rerun and its exact evidence limits are recorded above.
- Additional test owners: `packages/epub/test-support/epub-fixture.ts` supplies
  a synthetic primary/auxiliary fixture to desktop integration and
  `tests/browser/foundation.smoke.spec.ts`. `native-smoke/tts-scenarios.mjs`
  extends the existing reader-corrections runner with controlled delivery of
  one actual direct/WSOLA completion after Pause; actual profile arms remain
  required and cannot be inferred from the unit tests.
- Earlier deterministic checkpoints: full `pnpm.cmd check` attempt 2 passed
  (209 shared, 674 EPUB, 814 desktop Vitest, 97 Node, Rust 116/115 with two
  ignored helpers in each feature configuration, 619 Python, lint/types/build).
  Later bounded test/harness edits require renewed acceptance. Attempt 1 stopped
  at formatting. Attempt 3 exposed a newly added NSIS absence check using a
  separately sampled Win32 error; captured error atomically with System `?e`
  per the installed NSIS documentation. The configured Node component then
  passed all 18 tests, including backup retention, `/UPDATE`, junction refusal,
  explicit removal and preference/external-sentinel preservation. Attempt 4
  stopped at a misplaced test variable; corrected its parameterized scope.
- `pnpm.cmd test:browser` passed 10/10, including fresh primary opening,
  auxiliary link and saved auxiliary restoration. Its production renderer
  inputs are unchanged by the later Rust/test-only edits. No actual installer
  interactive behavior is inferred from Chromium or the compiled NSIS fixture.
- Reviewed the canonical system diagram: component/process relationships,
  local-only inference, ephemeral audio and persistence owners are unchanged.
  Default-start selection and residual backup ownership remain within the
  existing EPUB/native owners, so the diagram needs no topology change.
  M005 remains complete for narration preparation only; no normalization or
  segmentation change or broader TTS claim was added to its historical plan.

- Execution dependency additions: `publication/reader-lifecycle.ts` must classify
  absent primary start as unreadable; its fake and the other typed publication
  fakes require the additive member. `tts_service_fake_child.rs` and
  `tts_service_supervisor/host_diagnostics.rs` will execute canonical engine
  failures through the real supervised-child path in the existing native gate.
  `package-reader-matrix.test.tsx` covers package-to-reader/persistence agreement.
  `scripts/test-windows-package-lifecycle.ps1` gains only the seventh exact
  optional root/marker; backup/quarantine ownership is unchanged.
- Host red evidence: desktop test (804 tests: 802 pass, CLB-02's two rates fail
  on unreleased completed PCM); configured Node release component (17 pass,
  compiled CLB-01 fixture fails on regular-file detection); Rust (110 pass,
  3 CLB-03/05 failures, 2 helper tests ignored; second feature command not reached);
  EPUB (671 pass, two failures in EPUB 2/3 book-start recovery choosing spine 0
  instead of primary spine 1). Initial EPUB probe first failed on absent new API;
  reordered assertions reproduced the existing wrong recovery before runtime edits.
  Logs: ignored `temp/clb-*-red*.log`; commands are the planned suite commands,
  with `node --test apps/desktop/scripts/windows-release.node-test.mjs` selecting
  the configured Node component. All ran in local PowerShell outside the managed sandbox.
- First repair checkpoint: desktop suite passes 804 Vitest tests and 97 Node
  tests, including compiled NSIS and Pause/ended. Later changes invalidate this
  as final batch evidence. Type checking found missing fake fields/test union
  narrowing; corrected those without weakening the public type.

- 2026-10-21 execution: branch `codex/confirmed-logic-bugfixes`, HEAD
  `a9f60ed2ef8be53141391260985aeabcd237140c`, empty index and clean worktree.
  No intervening commits or pre-existing changes. Read the investigation skill,
  review workflow and plan. Host PowerShell readiness: pnpm 11.15.1 (Corepack
  shim), Node v24.20.0, cargo 1.97.1, uv 0.11.29, Tauri NSIS available.
  An existing ordinary VoxLeaf uninstaller is present: do not run the installed
  lifecycle by removing that installation. Isolated interactive/installed
  acceptance remains pending until an appropriate environment is available.
- Initial edit allowlist: candidate production/test paths in the table above;
  `pcm-playback.test.ts` owns synthetic callback fixtures; release Node tests
  own temporary compiled NSIS fixtures; Rust test modules own synthetic roots
  and channel fixtures; EPUB/reader adjacent tests own synthetic books. Also
  this plan, relevant current architecture/testing/product guidance and new
  ADRs 0060/0061 (default-start and backup ownership). Any additional harness
  paths require a dependency justification here before editing.

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
  or mutating serialized stable identities. ADR-0060 defines the additive immutable API and its unreadable outcome.
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

**Implementation acceptance: APPROVED. All five corrections and required behavioral gates passed.**

The [R7 implementation approval](../evidence/confirmed-logic-bugfixes/change-review-ordinary-host.md)
records `CLB-R7-ASTRA-20261023T025408Z`, APPROVE, no actionable findings.
The [final closeout review](../evidence/confirmed-logic-bugfixes/change-review-closeout.md)
covers the completed-plan path and final maintained documentation snapshot.
The [ordinary-host evidence](../evidence/confirmed-logic-bugfixes/ordinary-host-validation.md)
records the new host observations and exact scopes.
The earlier environment discrepancy has been resolved for the ordinary
interactive installation, restoration, integrity and four-profile playback gates.
The [earlier R5 report](../evidence/confirmed-logic-bugfixes/change-review-follow-up.md),
[R3 report](../evidence/confirmed-logic-bugfixes/change-review.md) and R1/R2 history
remain immutable. The separate closeout report is the authority for the final
documentation snapshot; older reports do not approve changed bytes.

| Evidence | Current result |
| --- | --- |
| Static findings and existing commands inspected | Planning audit preserved above; execution verified current code and configured commands. |
| Permanent regressions on unmodified implementation | Five findings reproduced; see host red evidence above. |
| Corrections CLB-01 through CLB-05 | Implemented, regression-tested and independently approved. |
| Unit/integration/schema/lint/type/format/build checks | Final-source `pnpm.cmd check` attempt 6 PASS, exit 0; counts and input manifest above. |
| Browser and native startup | `pnpm.cmd test:browser` PASS 10/10; `pnpm.cmd test:native-startup` PASS, exit 0. |
| Supported-profile reader matrix | Fresh ordinary post-restoration run PASS, exit 0: all four Piper/Chatterbox ES/EN arms and all eight controlled Pause/ended cases. Prior cached-profile and missing-v5 outcomes remain historical. |
| Chatterbox prerequisite and integrity | v5 acquired, preserved and relocated with original app data; fresh ordinary `pnpm.cmd test:chatterbox:installed-integrity` PASS, exit 0, 1 test/0 failures. Earlier transfer failure preserved. |
| Core and final installer | `pnpm.cmd package:piper-core:check`, `pnpm.cmd package:windows:verified-core` attempt 2, and `pnpm.cmd package:windows:check` PASS, exit 0. Attempt 1 failed after bundling on the diagnosed PowerShell module environment. |
| Silent installed lifecycle | Follow-up `pnpm.cmd package:windows:lifecycle` PASS, exit 0 in the earlier redirected host profile. Its exact-artifact six-scenario results are retained at that scope; ordinary interactive checks and silent reinstalls provide separate current evidence. |
| Interactive NSIS | Manual ordinary-session page/default observations, all four retention/removal combinations and final cleanup/reinstallation PASS. Earlier automated attempts were blocked and used a different data environment. |
| Installed in-app residue matrix | PASS in the earlier redirected host profile: backup-only detection, real locked-file failure, restart/redetection, unlocked retry/absence, unrelated version/data and preference preservation. Same installed release bytes; do not label this an ordinary-profile rerun. |
| Host-data backup/restoration | Final normal-PowerShell helper removed owned synthetic data, revoked deletion authority and moved original cached app data into the ordinary root without overwriting. Original optional-package data and preferences preserved; cache source, backup and quarantine absent; final installed hashes match. Fresh ordinary integrity/playback passed after restoration. |
| Independent implementation review | R1 F01 resolved; R7 APPROVE with no actionable findings, including new ordinary-host evidence. The linked final closeout report binds the completed plan and final documentation paths. |
| Git handoff | Existing planning branch/HEAD retained; task changes unstaged and uncommitted. No publication authorized. |

Final local artifact identities (acceptance limited to the scopes above):

| Artifact | SHA-256 |
| --- | --- |
| Preserved release-locked executable `temp/clb-review/release-locked-voxleaf-desktop.exe` (Tauri `UNK` marker; original loose target before diagnostic rebuild) | `ba5dca615375255763e249f9e6a6b4f415130efc2b1e856ef15d4fbb2f171ac8` |
| `apps/desktop/src-tauri/target/release/voxleaf-desktop.exe` (ordinary post-restoration diagnostic build) | `dfc27248386e44957ba23477d89e149dc45b561a37c986f8fac7c5e45c260fe1` |
| `apps/desktop/src-tauri/target/release/bundle/nsis/VoxLeaf_0.1.0_x64-setup.exe` | `53be8afdafc6b40d434b49b31e64f58d0049ba2edf9d4d0ef8a4caefb44e7434` |
| Installed `VoxLeaf/voxleaf-desktop.exe` (Tauri `NSS` bundle marker) | `3be12a8e0cee3141297827734450bbb15c6faa97a24f52bc6aa681a7e6aa19f3` |

The earlier default diagnostic binaries are separately bound to native/profile
tests above. Resumed cached-profile attempt 3 used `e24ca25275d615dd3d3db0edad56f5273a6af87b02194ddfc9534f377921a80f`;
the final ordinary-profile run used `dfc27248386e44957ba23477d89e149dc45b561a37c986f8fac7c5e45c260fe1`.
Do not transfer diagnostic-build results to the installed release binary.
The earlier silent lifecycle and installed residue procedure remain evidence
only for their stated environment/scope, not interactive NSIS or Chatterbox audio.
The browser 10/10 evidence is explicitly reused only for its unchanged renderer,
EPUB and browser-test inputs, with matching input identities reviewed in R1/R2;
later source changes were Rust and coordinator tests. No historical installed
receipt or historical Chatterbox result replaces the final ordinary-profile
validation, executed against unchanged current source and restored installed v5.
All source changes remain unstaged and uncommitted on the planning HEAD.
The plan moved to completed and the maintained indexes/current links were
updated only after R7 independent implementation approval. No tests were rerun
solely for the plan move; the final closeout report separately verifies these
documentation-only changes and reuse of the unchanged runtime evidence.
