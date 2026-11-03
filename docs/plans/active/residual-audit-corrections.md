# Resolve the residual findings from the ten-pass code audit

## Goal

Resolve all 18 distinct findings retained by the chat's final verification, with
the smallest changes to their existing owners and the smallest defensible set of
new validation runs. Preserve the earlier corrections and product constraints.
Do not convert static reasoning into a claim of an executed reproduction.

**Status on 2026-11-02: planning only; implementation is not authorized or started.**
The current request authorizes this document, its active-index entry, a branch
and a local documentation commit. It does not authorize executing this plan,
runtime tests, package preparation, push, PR, merge or release. Execution requires
a later instruction. Future Git/publication actions remain separately scoped.

Planning base: `59cc2e07962eb63ec61f4535d9e9db81443d5fee` (`main`, PR #302).
Planning branch: `codex/residual-audit-corrections-plan`.

## User-visible outcome

After implementation and acceptance, Settings retains truthful download and
profile state across remounts, preference failures are visible, and buffering
estimates describe the current playback threshold. Reflow preserves the intended
Resume target. Closing or rejecting a publication releases its ownership, and an
interrupted current import does not silently return to an unexplained idle state.

Optional download and TTS cleanup cannot borrow a later operation's identity or
claim successful containment without evidence. Unsupported numeric expressions
remain intact and are not cut at an internal decimal point. Maintainer package
retry cannot restore an obsolete part into a newer committed output set.

The four scale/capacity candidates receive bounded confirmation and a recorded
disposition. No unmeasured speedup, memory saving, WebView failure threshold,
orphan process, general EPUB conformance or new model-support claim is promised.

## Current state

The audit performed ten searches, compared findings with completed ExecPlans,
examined neighboring code and then revalidated the conclusions without running
tests. Its final inventory contains 15 earlier items and three deeper-analysis
additions. The `1\u202f120` variant belongs to finding 12; it is not a nineteenth
finding. IDs `RAF-01` through `RAF-18` preserve the final chat numbering.

Fourteen findings have identifiable static failure paths. RAF-01/09/10/18 are
capacity or repeated-work risks whose end-user impact is not established. None
has a new executed reproduction in this planning task. Test code and historical
receipts are evidence about earlier patches, not proof of these new sequences.

The worktree and index were clean at entry. Documentation and source inspection
used the planning base above. The latest completed NSL correction changed Settings,
App and the narration coordinator; the proposed work must retain its activation,
owner-lifetime, Stop and Reset protections. M005 remains complete in the
[roadmap](../roadmap.md); its legacy normalization and resource authorities remain
frozen. This is a cross-milestone correction plan, not a reopening of M005.

### Finding inventory and bounded correction

Line references below describe the planning base. Follow symbols and recheck
reachability at execution; line numbers are not an identity proof.

**RAF-01 — locator argument expansion; capacity risk.**
`packages/epub/src/locator/locator-index.ts:355` passes all chapter blocks to
`located.push(...blocks)`. The ingestion limits admit up to 200,000 semantic
blocks, and nested structural blocks can contribute locators before the visual
reader's smaller rendering limit is checked. A supported-host argument-limit
failure has not been demonstrated; admission/deadline limits may intervene.
Confirm the public open path with a bounded synthetic, admitted publication.
If confirmed, append iteratively, preserving order, identity and budget checks.
Do not lower supported limits or introduce an engine-specific magic number.
Record an unconfirmed/disproved trigger explicitly if it cannot be reached.

**RAF-02 — optional progress loses observation after Settings remount.**
`OptionalChatterboxControls.tsx:216-243` owns `downloadRequested` locally; its
polling condition excludes `confirming` after that flag is lost. Close/reopen
Settings while native host preflight is pending: the persistent client may still
finish the command, but intermediate progress is no longer polled. SFA-06 fixed
refresh/action result ordering, not this component lifetime. Keep operation
pending identity in the existing persistent client/App owner and derive the
mounted observation from it. Keep one bounded polling owner; old finalizers must
not release a newer action. Cover close/reopen before and during transfer,
terminal failure/success and cancellation. Settings closing remains available.

**RAF-03 — compact speed persistence failure is hidden.**
`ProductNarrationControls.tsx:172-184` ignores the update result while the
coordinator records `playbackPreferenceStatus = failed`. MPA-03 deliberately
keeps the applied in-memory speed when storage fails. Expose that existing status
and retry/restriction feedback without reverting the applied speed or adding a
second persistence path. Cover failed write, successful later choice, unsupported
future preference state and Reset's existing pending exclusion.

**RAF-04 — passive reflow retargets ordinary Resume.**
Pause, explicitly navigate to B, let cleanup/placement settle, passively inspect
C, then change typography. `App.tsx:619` calls `preserveActiveLocator`, whose
coordinator implementation at line 923 writes both visible and active locators.
Ownerless paused Resume then starts from C. The earlier VCA reflow correction
protected a navigation still pending, not this settled sequence. Keep visual
restoration separate from the heard/explicitly selected narration target. Cover
paused navigation, reflow, Resume, failed/early Resume, recovery, and Stop then
Play from the visible location. Preserve ADR-0017 and the documented distinction
between ordinary Resume and Play after Stop.

**RAF-05 — automatic-refill ETA uses the original Prepared target.**
`product-narration-coordinator.ts:2322` estimates from `scheduler.targetBufferMs`,
which can remain a five-minute preparation goal even though automatic refill
requires one minute. `AdaptivePreparationControls.tsx:45` can consequently label
a one-minute wait with the larger estimate. Derive the display calculation from
the phase's actual readiness threshold. Do not change producer targets, buffering
policy, manual Resume eligibility or introduce a fixed wall-clock wait. Cover
initial Prepared, automatic refill, Quick, tail completion and rate-adjusted lead.

**RAF-06 — App retains a closed publication through restoration state.**
`App.tsx:335-370` cancels restoration but retains the previous publication object
when no publication is ready. `OpenedPublication.close()` releases archive and
checkpoint ownership, but the immutable semantic documents/locator graph remain
reachable from that object until replacement or App disposal. Clear obsolete
restoration state by identity, retaining current-owner and StrictMode protection.
Cover close and failed replacement without clearing a newer ready publication.
This is bounded prior-publication retention, not proven ZIP retention or an
unbounded leak; avoid GC timing or heap-size assertions.

**RAF-07 — valid publication with no primary start remains owned.**
`publication-session.ts:149` accepts an active publication before
`reader-lifecycle.ts:106` returns the unreadable/empty outcome for an undefined
`defaultStartLocator`. The accepted handle remains open. Close that exact rejected
publication and surface cleanup failure through the existing lifecycle policy.
Never close a newer open attempt. Cover an empty primary spine with auxiliary
content, concurrent replacement, close failure and later successful open. CLB-04
and ADR-0060 deliberately forbid substituting auxiliary content as the default
start; retain that behavior.

**RAF-08 — healthy continuing Chatterbox is presented as inactive.**
`ReaderSettingsDialog.tsx:222` uses the compatibility snapshot's fresh-start
`activeProfileId`; the coordinator's continuation check can correctly retain
already loaded Chatterbox with less free VRAM. Healthy reselection then returns
success without changing that mismatched indicator. Derive the active indicator
from the actual selected/continuing narrator; present future-start availability
separately. Retain all fresh-start hardware gates, language identity, loading and
recovery rules. Cover healthy continuation below the fresh-load threshold,
genuine Piper selection, failed activation and a later new start. Do not admit
new Chatterbox loads on insufficient hardware.

**RAF-09 — repeated global locator searches in reader navigation; perf risk.**
`reader-navigation.ts:115-144` finds documents and searches the complete locator
list per spine item during synchronous reader construction. The operation count
can grow with spine count times locator count; a visible freeze has not been
measured on an admitted book. Confirm reachable scaling with synthetic inputs
and a deterministic traversal/count oracle. Build private first-location/document
lookups once in this owner if warranted. Preserve spine occurrence identity,
fallback aliases, order, empty/nonlinear items and all navigation recovery.
No new exported cache or timing assertion is required.

**RAF-10 — every preparation batch sums the global source budget; perf risk.**
`narration-preparation.ts:677-696` iterates all located blocks to calculate work
allowances even when warm continuation context is reusable. This is repeated
metadata traversal, not reparsing all preceding prose; B02 already addressed
prefix replay. Establish its deterministic cost through public repeated batches.
If material, retain checked aggregate counts once in immutable publication/index
metadata, charging construction and preserving safe arithmetic, exact limits,
yielding, cancellation and close. No process-global cache or larger work budget.
Compare cold/warm output, sequence and source ranges with existing behavior.

**RAF-11 — retry can restore a retired package part after late cleanup failure.**
`release_chatterbox.py:393-399` restores backups before checking all conflicts.
After promotion from four parts to three, backup deletion can fail at retired
part four, leaving that backup and the old receipt backup. The next build restores
part four before encountering the receipt conflict, corrupting the new set's
`check-local` consistency. SPM covered first-backup cleanup failure and sole-part
recovery, not this combined retry. Preflight recovery of the entire closed output
set before mutation; distinguish committed retirement from rollback sufficiently
to prevent resurrection. Prefer bounded fail-closed recovery over a new transaction
framework. Test actual build/retry/check boundaries with tiny temporary packages,
late conflict, rollback and successful shrinking/growing splits. Preserve the
complete new set and available backups; do not promise power-loss atomicity or
support concurrent builders.

**RAF-12 — suffix expansion changes part of an unsupported numeric expression.**
The continuation/compound guards in
`narration-bilingual-normalizer.ts:402,772` can expand the `25 %` portion of
`.25 %`, or `120` within `1\u202f120` (U+202F narrow no-break space). Preserve the
whole unsupported compound through bounded contextual guards, including relevant
ordinary/nonbreaking grouping variants. Do not broaden the accepted numeric
grammar or edit frozen corpora. Cover public Piper EN preparation, shared mutable
profiles, leading/trailing punctuation, removable marks, language boundaries,
code, batch edges, exact source spans and accepted standalone controls. BNC-03,
VUC-02 and SAC-07 adjacency protections remain positive controls.

**RAF-13 — unsupported decimal can be split at its internal point.**
The mutable normalizer marks unprotected `.` as a sentence boundary; scanner and
packer can select `12.|34` when the surrounding long paragraph needs a split.
A short intact paragraph is not a reproduction. BNC-05 protects accepted Spanish
thousands forms, not every unsupported decimal. Protect the bounded numeric
punctuation context against internal sentence splitting without expanding its
text or changing hard ceilings. Prefer the existing mutable-profile protection
mechanism; change scanner/packer only if a public regression proves it necessary.
Cover forced public Piper EN splits, sentence punctuation, long-token hard splits,
source completeness/ranges and other mutable profiles. Keep legacy v1 unchanged.

**RAF-14 — synthesis completion during failure cleanup hides valid recovery.**
With synthesis pending, an audio backend failure can retain a cancellation
transition. Native completion may win before cancellation, yielding the typed
client's `tts-service-invalid-state` after verified shutdown. Operational
containment at coordinator lines 2141/2182 treats that as a permanent cleanup
failure; Stop already handles the completed-request case at line 1394. Apply that
same narrow verified-completion rule to operational containment. Join the old
operation and verify service, player and scheduler ownership under the existing
deadline before enabling explicit recovery. Test with the real typed client and
existing backend/native seams. Preserve timeout, malformed/foreign identity,
failed shutdown and repeated-failure terminal controls. A generic synthesis error
that already released its reservation is a different path.

**RAF-15 — failed handshake plus failed termination can report false stopped.**
`process-client.ts:335` releases the settled start promise; `stopService()` only
uses `startRequestId` while that promise is pending. Without an accepted service
ID it can publish stopped at line 595, while native `fail_session()` retains the
session when termination fails. Retain failed-start ownership until verified
containment, using the existing owned start identity. If the native empty-slot
path needs a receipt for an already contained failed start, keep only bounded
private identity evidence and match it strictly; generic InvalidState is not
proof of absence. Cover real supervisor failure/termination ordering, successful
retry, already contained start, wrong identity and replacement safety. F08 fixed
old pending-start shutdown killing a replacement; it did not cover this settled
failure. No claim that an orphan OS process was observed. Avoid public protocol
changes; document/review a coordinated contract change explicitly if unavoidable.

**RAF-16 — old download preflight can claim a newer Confirming operation.**
`download_optional_chatterbox` evaluates host admission before
`download_at_if_host_admitted`; `download_at()` only checks the current state.
During that delay, Cancel A can clear Confirming and Select B can establish a new
Confirming state. A then starts acquisition for B without B's Download action.
Bind the attempt before preflight and compare its identity atomically when
claiming download. Prefer private generation/cancellation identity in the current
manager. Renderer response filtering alone is insufficient. Exercise the actual
command admission order with bounded injected probe/transfer barriers, proving
zero transfer for stale A and successful explicit Download B. Cover cancellation
cleanup failure, denial, repeated select, stale finalizers and replacement state.
Keep network admission, lock ownership, byte/deadline bounds and diagnostics.

**RAF-17 — deadline cancellation can silently return a current import to idle.**
`processing-budget.ts:130`, `publication-session.ts:144` and
`reader-lifecycle.ts:101` map deadline expiry through cancellation to idle.
ADR-0007 intentionally maps caller abort and deadline to the same public code.
Distinguish an explicitly aborted/stale attempt from an unexpected cancellation
of the current open in the existing desktop owner and show bounded retry feedback
for the latter. Do not label it a deadline unless that reason is actually known;
keep the public error enum unchanged. Cover an injected budget clock through the
public import path, intentional cancellation, replacement and malformed EPUB.
Use no real 30-second wait and do not weaken ingestion budgets.

**RAF-18 — package lookup construction repeats across documents; perf risk.**
`open-epub-publication.ts:80-107` filters spine entries per manifest item; each
XHTML projector constructs a resolver with package-wide indexes. Confirm the
scaling in an admitted synthetic multi-document publication. Reuse private
publication-owned lookup context where equivalent, preserving per-occurrence
spine identity and local self-link overrides. Retain fallback and duplicate-path
semantics, quotas, source charging, deadlines and cancellation. Do not add a global
cache or public resolver contract. Tests must distinguish repeated fallback spine
occurrences, direct navigation, local fragments and unavailable targets.

## Scope and non-goals

All 18 rows remain accounted for until acceptance. For a risk row, a supported
no-change disposition needs source evidence plus bounded confirmation results and
independent review; an unconfirmed trigger is recorded as unresolved, not fixed.
The four risks do not justify a speculative optimization campaign.

Use these sequential implementation units. Files shared between rows have one
current owner; finish the affected source and tests before freezing integration.

| Unit | Findings | Minimum implementation boundary |
| --- | --- | --- |
| U1 publication lifetime | 06, 07, 17 | App restoration and publication session/lifecycle; ingestion remains authoritative. |
| U2 visual/narration position | 04, 09 | Coordinator reflow authority and reader navigation's private lookups. |
| U3 truthful Settings/playback | 03, 05, 08 | Existing coordinator snapshots and compact/adaptive/Settings presentation. |
| U4 optional attempt ownership | 02, 16 | Persistent optional client/UI and native manager/command admission. |
| U5 verified containment | 14, 15 | Typed process client, coordinator and native supervisor; preserve PCM ownership. |
| U6 ingestion scale | 01, 18 | Locator construction, opener and package/XHTML lookup context, if confirmed. |
| U7 preparation metadata | 10 | Publication/index-owned counts and existing preparation budgets, if confirmed. |
| U8 conservative numbers | 12, 13 | Mutable bilingual normalizer and its existing protected spans; scanner/packer changes conditional. |
| U9 maintainer promotion | 11 | Chatterbox packaging recovery/promotion and synthetic packaging tests. |

Do not refactor unrelated helpers, add production dependencies, change profile
eligibility, switch models, modify DSP/rates, widen accepted numeric grammar,
persist audio, introduce automatic restart, or alter public schemas by default.
Package/model acquisition, personal installations, firewall changes, signing,
release manifests and publication are outside the planned default work.

## Relevant files and documentation

Production paths are the symbols above under `apps/desktop/src/`,
`apps/desktop/src-tauri/src/`, `packages/epub/src/` and
`services/tts/src/voxleaf_tts/release_chatterbox.py`. Particularly relevant support
owners are `reader/ReaderPublication.tsx`, `tts/optional-chatterbox-client.ts`,
`tts/adaptive-audio-scheduler.ts`, `tts/pcm-playback.ts`,
`resource/opened-publication.ts`, `document/xhtml-projector.ts`,
`package/package-document.ts` and `security/processing-budget.ts`. Inspect these
without adding them to the edit list unless the regression requires it.

Use existing adjacent tests and synthetic builders. The concrete selected suites
are listed below; Rust seams live in `tts_optional_chatterbox/tests.rs` and
`tts_service_supervisor/tests.rs`. Browser cases belong in the existing
`apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`.

Read/reconcile [docs index](../../README.md), [MVP](../../product/mvp.md),
[reader/playback requirements](../../product/reader-settings-and-playback-controls.md),
[overview](../../architecture/overview.md),
[system diagram](../../architecture/system-diagram.md),
[completed M005](../completed/M005-narration-text-preparation.md), and ADRs
[0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md),
[0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md),
[0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md),
[0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
[0057](../../architecture/decisions/ADR-0057-reader-acquisition-correctness.md),
[0059](../../architecture/decisions/ADR-0059-optional-download-diagnostics.md),
[0060](../../architecture/decisions/ADR-0060-primary-publication-start.md), and
[0065](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md).

Adjacent completed work is context and regression authority:
[SFA](../completed/six-finding-audit-corrections.md),
[MPA](../completed/minimal-playback-audit-corrections.md),
[VUC](../completed/visible-locator-unicode-compound-corrections.md),
[BNC](../completed/narration-boundary-navigation-corrections.md),
[RIA](../completed/reader-narration-acquisition-bugfixes.md),
[CLB](../completed/confirmed-logic-bugfixes.md),
[F4](../completed/four-finding-minimal-corrections.md),
[validated chat findings](../completed/validated-chat-findings-corrections.md),
[lifecycle follow-up](../completed/lifecycle-correctness-follow-up.md),
[SPM](../completed/settings-packaging-minimal-corrections.md), and
[NSL](../completed/narration-settings-lifecycle-corrections.md).
Preserve their historical content and evidence. Link current results from a new
`docs/plans/evidence/residual-audit-corrections/` ledger only during execution.

## Architecture and constraints

Keep the current process/component topology. EPUB owns immutable semantic data,
stable locators and bounded preparation. App/reader own visual placement and
publication lifetime. The coordinator owns narration intent, estimates and
recovery; typed client/native supervisor jointly prove service containment.
The optional manager owns its admission/transfer identity. Python release code
owns only the maintainer's closed package output set.

Private precomputed data must be bounded by the publication's existing limits,
discarded with its owner and free of retained extra prose. Cancel/close must still
invalidate before late results publish. No stale completion may clear a newer
owner. Preserve timeout limits, one active service tree, memory bounds, content-free
diagnostics, local-only EPUB/TTS and default ephemeral audio. Start readiness is
playable audio lead, never a mandatory 15-second wall-clock delay.

Review the diagram at closeout. Update it only if the accepted ownership/data flow
actually changes. Update current product/testing descriptions for changed user
behavior; leave frozen authorities and completed plans intact. A durable contract
or policy change requires its explicit design/ADR and corresponding gates before
implementation, not an undocumented workaround.

## Milestones

### M0 — freeze scope and evidence decisions

**Not started.** After execution authorization, capture base/HEAD, dirty paths,
tool/dependency membership and relevant host facts without disturbing other work.
Recheck every RAF trigger against current source. Create a gate ledger with all
18 rows, exact selections, dependency closures, environments and invalidation
rules. Retrieve original receipts below and compare complete inputs only where
reuse is cheaper than rerunning. Record `EJECUTAR`, `REUTILIZAR CON PRUEBA`,
`NO APLICA` or `BLOQUEADO` for each gate. No inferred PASS from Git ancestry.

### M1 — establish focused failures or candidate dispositions

**Not started.** Add regressions to existing suites before changing each affected
production owner. Batch independent RAF cases in one red invocation per runner
where practical. Use `RAF-` labels for Vitest/browser cases and `raf_` for Rust/
pytest tests; these are planned labels, not existing test commands or evidence.
Do not rerun an entire historical baseline merely to establish red evidence.

Exercise public/real owner boundaries, including mounted App remount/reflow,
public EPUB preparation, native preflight/containment ordering and complete tiny
package retry. A fixture setup error is not a reproduction. The four risk rows
need a deterministic cost/admission demonstration; add one bounded host/browser
measurement only if static counts cannot settle the actual impact question.

### M2 — apply the nine bounded units

**Not started.** Implement U1-U9 without opportunistic cleanup. Verify each unit's
new cases and directly coupled controls, then retain those receipts. Shared
coordinator/App/index edits invalidate earlier dependent evidence. Reconcile the
inventory explicitly if a smaller fix removes the need to edit a conditional
support file. Do not drop a row solely because an earlier plan has a similar title.

### M3 — final combined acceptance

**Not started.** Freeze the final implementation/test inputs. Run the selected
deterministic groups and applicable format/lint/types before native preparation.
A unit green run can satisfy its final group only with complete unchanged-input
proof; do not run identical gates again by habit. Perform one combined Chromium
selection, one final app build, current model-free native race controls and one
Piper EN packaged arm. Reuse package/model bytes under proof. Extra model or
acquisition campaigns require a concrete changed responsibility or failed gate.
Verify cleanup and preserve all failed attempts.

### M4 — independent review and documentation closeout

**Not started.** Follow
[agentic change review](../../development/agentic-change-review.md): delegate the
exact final behavioral patch to `change_reviewer` (GPT-6 Astra high), read-only
and without running tests. Supply the closed path list, HEAD/base, full diff,
SHA-256 and filter-aware Git identities, gate receipts, reuse proof and every RAF
disposition. Resolve actionable findings and obtain approval for the exact current
patch. Missing evidence or reviewer is `BLOQUEADO`, not acceptance.

After approval, update current product/testing docs where needed, record the
diagram/M005 review, archive this plan and reconcile active/completed indexes and
incoming links. Documentation-only drift can retain behavior gates with explicit
closure proof; review/report identities still must match. No commit/push/merge is
implied by implementation acceptance. This planning-only documentation patch does
not itself require a behavioral change review.

## Testing and benchmark strategy

### Historical work inspected and its limits

The following are historical results read during planning, not tests run today.
Original NSL desktop/browser/Piper and SPM packaging result JSON files were also
retrieved locally and record exit 0, exact commands, timestamps and input digests.
Full current dependency/environment/artifact equivalence has **not** been proven
by this planning task. No historical PASS has yet been accepted for this plan.

| Evidence | Earlier result and exact receipt | Use in this plan |
| --- | --- | --- |
| [NSL ledger](../evidence/narration-settings-lifecycle-corrections/execution-ledger.md) | `20261102-01/G2-desktop-current`: 407 tests in eight suites; `G4-browser-eligibility`: six Chromium journeys; TS format/lint/types and build pass. Base `bfbf391d7a13e1ee6b3f704051a6596359ce5deb`. | Reuse fixtures, selected controls and receipt format. App/coordinator/UI edits invalidate these behavioral results. |
| NSL native/core | `G7-Piper`: one Piper EN arm, zero underruns/external requests/audio files, cancellation 244 ms; `G5-core-check` succeeds. `core-artifact-reuse.json` compares 2,024 payload files and 26 source/authority/lock inputs with no drift at that execution. | Candidate Piper artifact and checker-result reuse with complete current proof. Old native binary/timing cannot accept a changed app. |
| [SPM ledger](../evidence/settings-packaging-minimal-corrections/execution-ledger.md) | `G3-packaging-final`: 136 tests across release core, release Chatterbox and source closure; Python format/lint/types pass. Final desktop F1: 355 tests, six browser cases and replacement native arm. | Reuse tiny build/fault fixtures and resource-preservation pattern. RAF-11 invalidates the combined packaging result; unchanged core-only evidence can be considered separately if independently recorded. |
| [BNC ledger](../evidence/narration-boundary-navigation-corrections/execution-ledger.md) | Final `run-02`: 265 EPUB tests, 194 desktop tests, three browser cases and renewed native integration pass. Earlier run-01 alone does not accept its later normalizer correction. | Reuse numeric/public-preparation regressions, deterministic bound checks and failed-fixture lessons. New normalizer/index/coordinator inputs require current relevant groups. |
| [Validated-chat ledger](../evidence/validated-chat-findings-corrections.md) | `R1-D6-F08` validates real native old-start/replacement ordering; `R1-Q-desktop` records 867 tests; `R1-Q-native-final` records 132 default/131 release tests with six opt-ins ignored in each. | Reuse the real model-free child/hook harness. Ignore counts are not passes; old host/Rust results cannot close RAF-15. Earlier corrected totals in that ledger refer to earlier attempts. |

Local originals are under ignored
`tmp/evidence/narration-settings-lifecycle-corrections/20261102-01/`,
`tmp/evidence/settings-packaging-minimal-corrections/`,
`tmp/evidence/narration-boundary-navigation-corrections/run-02/`, and
`tmp/evidence/validated-chat-findings/`. Retrieve originals and their referenced
manifests at M0; a Markdown summary is not a substitute when a gate is reused.
Do not commit raw inventories, private paths, book text, models or audio.

### Minimal gate matrix

All test, build and validation commands execute from repository root in normal
local PowerShell **outside the managed automation sandbox**, per AGENTS.md.
Configured leaf selections below use the existing package scripts/runners; no
new command name is assumed. Final selected leaves replace redundant root
aggregates for this scoped plan; they do not claim `pnpm check` ran or waive later
CI requirements.

| Gate | Decision and timing | Invariant / dependency / invalidation |
| --- | --- | --- |
| G0 preparation | Reuse identical exports with proof only before affected edits; otherwise `pnpm.cmd build:packages`. Rebuild after final EPUB changes. | Package source, declarations, membership, shared/schema outputs, TS configs, locks and installed tools. Configured browser/native build hooks remain enabled. |
| G1 new regressions | EJECUTAR before affected edits, with focused label filters; then current green. | Each RAF trigger and specified controls. No historical suite covers the new order just by sharing a file. |
| G2 EPUB | EJECUTAR final selected group, once after U6-U8. | Public opening, fallback identity, bounded work, source/range preservation and malformed/cancel behavior; EPUB source/tests/fixtures/config/dependencies. |
| G3 desktop | EJECUTAR final selected group, once after U1-U5 and final exports. | Mounted lifetime, progress, persistence, position and containment; desktop plus transitive EPUB exports/fixtures. |
| G4 native | EJECUTAR supervisor/optional selections in both default and release-locked configurations. | Actual ownership/lock/probe ordering; native source/test/build scripts, Cargo features/lock/toolchain, embedded manifests/schemas and fake child. Run real F08 model-free opt-in on final identities. |
| G5 packaging | EJECUTAR release Chatterbox and source-closure tests once after U9. Add core tests only if a consumed helper/recipe changes. | Tiny build/promote/retry/check with all backup positions; Python helpers/tests/tooling/locks. Old SPM aggregate is invalidated, not partially relabeled. |
| G6 static | EJECUTAR applicable TS/Rust/Python format/lint/types once final source/tests settle. | Each configured scope including tests, generated declarations, config, installed toolchain and membership. Markdown-only changes do not enter unrelated source globs. |
| G7 browser | EJECUTAR one selected batch after cheap gates. | Real mounted App wiring/reflow, optional Settings remount, closing/replacement and recovery controls; current renderer/build/browser identity. Fake service coverage is not native acquisition/inference evidence. |
| G8 core/artifacts | REUTILIZAR CON PRUEBA preferred; rerun current integrity checker if complete checker/environment proof is missing. | Entire payload membership, sizes/hashes, archive, original receipt, source closure discovery, recipe/authority/locks and environment. Never regenerate models merely because renderer/native owners changed. |
| G9 app/native | EJECUTAR one final app build and Piper EN arm; include model-free failure/replacement controls. | Current compiled app, renderer, exports, native harness, runtime/voice payload and host/WebView identities. Old binary PASS is invalidated by this plan. |
| G10 closeout | EJECUTAR evidence guard, diff/scope review, cleanup, identities and independent review. | Exact final patch and all receipts/dispositions. Any relevant later drift renews affected gates/review. |

`NO APLICA` by default: full unrelated Python inference/benchmark suite, shared
schema generation/tests when contracts are unchanged, unchanged Node harness test
campaigns, full browser sweep, six-rate DSP benchmark, Qwen, full Chatterbox GPU
matrix, multi-GB acquisition, installer/firewall and signing/release campaigns.
This is an impact decision, not reuse of their historical PASS. If implementation
changes loaders, runtime payload, extraction/promotion/security authority or a
contract, revise the corresponding row before acceptance. In particular, RAF-16
must reach native preflight and transfer admission; a UI-only mock cannot justify
excluding native validation. Use the existing local-admission opt-in only if the
bounded command-level tests cannot establish that invariant or broader acquisition
code changes. Do not invoke a whole installed journey just to exercise a race.

### Concrete existing commands and selections

Use the EPUB package's configured Vitest leaf for G2 (omit conditional suites
only with the M0 dependency decision, not after a failure):

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/locator/locator-index.test.ts src/public/open-epub-publication.test.ts src/document/xhtml-projector.test.ts src/package/package-document.test.ts src/resource/opened-publication.test.ts src/security/processing-budget.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-boundary-scanner.test.ts src/narration/narration-segment-packer.test.ts src/narration/narration-resource-bounds.test.ts src/testing/narration-preparation-limits.test.ts src/integration/narration-preparation-matrix.test.ts
```

G3 combines the affected desktop owners and prior NSL/position controls. Use
`exec vitest` explicitly; the package's `test` script also appends Node runners
and is not a transparent filtered-Vitest wrapper.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/publication/publication-session.test.ts src/publication/reader-lifecycle.test.ts src/reader/ReaderPublication.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/AdaptivePreparationControls.test.tsx src/tts/HardwareCompatibilityControls.test.tsx src/tts/hardware-profile-compatibility.test.ts src/tts/product-narration-coordinator.test.ts src/tts/process-client.test.ts src/tts/pcm-playback.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts
```

G1 uses these same Vitest commands with `-t RAF-`, or the frozen smaller affected
file subset, and the Python/Rust leaves with their supported new-case filters.
Do not substitute a filtered green subset for a failed final group.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_service_supervisor::tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
uv run --project services/tts --locked pytest services/tts/tests/test_release_chatterbox.py services/tts/tests/test_chatterbox_sources.py
```

Run only applicable G6 leaves; no root aggregate repeats them:

```powershell
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
```

Add the planned RAF browser scenarios to the existing smoke file: settled paused
navigation/reflow/Resume and Stop/Play, download remount during preflight/transfer,
and rejected/closed/replaced publication plus visible status feedback. Combine
compatible steps into bounded journeys, retain production assertions and current
timeouts/retries, and reuse existing NSL/SPM/VCA controls whose behavior is touched.
Freeze the enumerated case names at M0/M1; `RAF-` does not exist before that work.
The quoted regex below follows the already exercised Windows pnpm spelling.

```powershell
pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep '"RAF-|NSL-|SPM-01/02|VCA-06/09"'
```

G8 uses `pnpm.cmd package:piper-core:check` only when its original successful
receipt cannot be reused with complete proof, or current integrity must be
re-established. Artifact reuse and checker-PASS reuse are separate decisions.
RAF-11 changes a maintainer builder; verify that it is excluded from each reused
runtime source closure instead of assuming every Python edit changes model bytes.

```powershell
pnpm.cmd build:desktop
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en
```

The native runner directly consumes that build. Extend the existing model-free
failure/ordering seams for RAF-14/15, not the inference adapter. For the existing
F08 regression, bind process-local `VOXLEAF_NATIVE_MODEL_FREE_BINARY` to the verified
default app produced above; retain its exact path/hash in local evidence, not a
guessed executable. Run the existing opt-in:

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement -- --exact --ignored --nocapture --test-threads=1
```

Record the test executable identity after any final link and before/after host
execution. Additional RAF native tests must exercise real ownership transitions
and termination failure, with no artificial ordering that production locks forbid.
Where model-free tests cannot settle OS cleanup, one bounded owned-child check is
required; Piper playback by itself does not prove failed-handshake containment.

Closeout uses the existing commands:

```powershell
pnpm.cmd check:evidence
git diff --check
```

### Reuse proof, resource safety and stopping rules

For each reused gate retain the original receipt, output and execution-time
input/environment digests. Compare the full consumed closure, including new and
deleted file membership, fixtures, transitive imports, config, locks, tools,
generated exports and executable/payload bytes. Match the invariant and feature
flags as well as the environment. A source hash subset, unchanged package version,
old approval or current Git tree alone is insufficient. Follow the evidence
identity principles in the [validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md);
this behavioral plan does not adopt a refactor campaign or its unrelated gates.

Collect each needed inventory once per frozen revision and share that immutable
snapshot among applicable gates. Later independent Python-only or Markdown-only
changes can preserve other groups only after closure comparison. When complete
proof is unavailable or more expensive than the gate, rerun the smallest affected
gate. Do not sum historical partial passes into an aggregate result.

Use owned short scratch roots and synthetic content. Reuse the NSL/SPM native
resource-preservation pattern: validate containment, save the entire original
resource membership/content, stage verified artifacts, restore in `finally`, and
verify restoration. Cleanup only owned PID/creation-time/executable identities and
owned temporary paths; preserve pre-existing processes, caches and user data.
No model download, audio persistence or firewall mutation is planned. Record
zero unexpected network/audio files and zero remaining owned resources.

Distinguish assertion regressions from fixture, environment and cleanup failures.
Keep failed receipts/traces. Permit at most one infrastructure retry after a
documented prerequisite correction; unchanged blind retries are not useful.
Product fixes may renew affected gates with a new immutable attempt ID. Missing
runtime, host eligibility or cleanup proof remains `BLOQUEADO` for the affected
acceptance; it is not replaced by a historical PASS. Do not run broad benchmarks
unless a specific risk requires measurement. Deterministic complexity evidence
does not establish a universal latency or memory improvement.

## Risks and rollback

The main regression risks are conflating visible/selected/heard location,
weakening cancellation or identity checks, changing repeated-spine link semantics,
loosening resource accounting, and treating all backups as rollback material.
The per-finding positive controls above protect these boundaries. Prefer a small
private helper or field only when it removes a demonstrated owner gap.

Keep fixes separable by U1-U9 and retain pre-edit identities. If a candidate fails,
restore only that candidate's owned changes after inspecting shared dependencies;
never reset unrelated user work. Package recovery failures retain inspectable
outputs/backups, with no broad directory deletion. A native containment failure
stays visibly failed until exact owned cleanup is proven; do not conceal it to
make recovery controls pass. If a minimal solution requires a public contract or
frozen-authority change, replan explicitly before editing it.

## Progress log

- 2026-11-02: Created this planning inventory from the chat's final 18-item
  verification and checked relevant current source. Preserved four unconfirmed
  capacity/performance risks and the distinction between static and executed
  evidence. No implementation or runtime test was performed.
- 2026-11-02: Inspected completed plans, NSL/SPM/BNC/validated-chat ledgers and
  retrievable NSL/SPM raw receipts. Recorded conditional reuse and scoped reruns;
  no current behavioral PASS or complete artifact-reuse proof is claimed.
- 2026-11-02: Created `codex/residual-audit-corrections-plan` from the planning
  base. Only this document and the active index belong to the planning commit.
- M0-M4: not started; execution awaits a later user instruction.

## Discoveries and decisions

- Earlier ExecPlans corrected neighboring sequences. The residual triggers are
  explicit above; their similar titles do not make these duplicates. Keep prior
  fixes as controls rather than rewriting completed history.
- Paused preparation, one-minute automatic refill, primary-only default start,
  and heard/selected Resume versus visible-location Play after Stop are intended.
  They are not findings to reverse.
- Native operation identity is required for RAF-15/16. UI response suppression
  cannot establish native ownership or user consent for a replacement download.
- RAF-06 is one retained semantic graph; RAF-15 is unverified containment. Neither
  supports the stronger unbounded-leak/orphan-process claim without new evidence.
- Minimum validation means eliminating duplicate preparation and unrelated
  campaigns while retaining new regression evidence, real boundary controls and
  exact-patch independent review. Reusing models is not reusing playback PASS.
- Repository documents use English; the user-facing planning report uses Spanish.

## Final validation results

**Implementation: NOT STARTED.** All 18 findings remain open under the status
distinctions above. No test, benchmark, model, browser, native, package or runtime
validation from this plan has executed. No finding is marked fixed.

**Historical reuse: CANDIDATE ONLY.** Earlier results were inspected; full current
reuse proof and independent acceptance belong to M0-M4. Old failures remain part
of their original evidence.

**Planning deliverable:** this ExecPlan plus the active-index link, on the named
branch. Documentation-only inspection in local PowerShell outside the sandbox
found all 37 local Markdown link targets and all 29 named Vitest suite paths;
`git diff --check`, `git diff --cached --check` and `pnpm.cmd check:evidence`
passed. Staged scope is exactly the two planning Markdown files. These checks
execute no suite and do not validate runtime behavior. The planning deliverable
is prepared for its authorized local commit. No push or publication.
