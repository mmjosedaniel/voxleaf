# Revalidated chat findings: minimal corrections

Status: **Implementation and behavioral acceptance complete (RCF-R3-20261103). Final archival disposition is recorded in RCF-R4-20261103.**

Created: 2026-11-03. Planning base: 5e4c44b5dde4b099036fcab4ca08218536631fe7.
Branch: codex/revalidated-chat-findings-plan.

On 2026-11-03 the user authorized implementation and necessary host verification.
No commit, push, PR, merge or publication is authorized. The user delegated the
four pending policy choices to the implementer; the selected bounded decisions
and revalidation are recorded in the execution ledger.

## Goal

Resolve the actionable findings from the six review passes and subsequent
per-case investigation, with the smallest changes at the existing owners.
Preserve the original case numbers as RCF-01 through RCF-21. RCF-22 records the
additional benchmark ownership defect found while revalidating RCF-12.
Variants stay with their original case rather than becoming duplicate fixes.

Distinguish a reachable defect from a policy choice, a previous partial fix and
an unmeasured impact. Reuse existing fixtures, verified package bytes and
eligible immutable evidence; do not repeat a complete test matrix per finding.
This plan is self-contained and does not require access to the earlier chat.

## User-visible outcome

After authorized implementation and acceptance:

- Opening an admitted EPUB avoids unnecessary per-word projection objects,
  preserves supported list numbering and excludes hidden navigation text.
- Play starts only after the intended reader placement has settled. Settings
  changes require successful containment, optional-download Cancel remains
  available during unrelated settings work, and natural completion preserves a
  newer manually inspected passage.
- A failed preparation of a slower playback rate returns effective selection
  and, when saving succeeds, the stored preference to 100%. A visible reason
  explains the fallback. Healthy current audio finishes without an unnecessary
  fatal shutdown. A newer user selection remains authoritative.
- Buffer thresholds use aggregate precision, an exhausted finite tail does not
  advertise an avoidable low-buffer warning, and completed narration stops its
  periodic ticker.
- Optional-runtime cleanup can recover explicitly after successful installation;
  manifest reads are bounded before allocation. Package recovery and benchmark
  cancellation cannot damage a newer valid output or worker.

RCF-03, RCF-06 and RCF-17 use the bounded policies selected under the user's
delegated decision. Their accepted criteria are recorded below.
They are not counted as unconditional regressions against an approved contract.

## Current state

The planning base has the previous corrections, including the completed
[residual audit plan](../completed/residual-audit-corrections.md). The initial
worktree and index were clean. Source inspection and historical receipts are
the evidence for this plan; that planning phase ran no runtime reproduction or benchmark. Current execution
results and case coverage are in the linked execution ledger.
Earlier PASS results establish what was tested on their own input identities.
They do not prove these newly identified paths correct.

The strongest overlap with earlier work is:

| Earlier work | What it already handled | Residual scope here |
| --- | --- | --- |
| M003/M004 and RAF-01/18 | Bounded XML/blocks/rendering, iterative locator indexing, shared lookup context | Per-word objects before render admission; list ordinals; hidden nav labels; rendition policy |
| PSC, BNC, RAC, RIA and RAF-04 | Resume/navigation rejection, late reader availability and settled reflow | Initial/inactive placement races, terminal settlement and paused appearance ownership |
| NSL, SPM and SAC-06 | Settings serialization, persistence and retained Stop recovery | Configuration mutation after failed real containment; Cancel availability |
| RNB B06/B07, CLB-05 and RAF-02/16 | Acquisition commit/cancel boundaries, cleanup failure, mounted attempt ownership | Successful install stuck behind recoverable cleanup failure; manifest allocation |
| RAF-11 and SPM packaging | Output promotion and preflight of conflicting backups | Backup-only retired parts without a receipt conflict |
| M002/M008/M010.2 and MPA | Source-duration precision, boundary-deferred playback and processor failures | Per-unit effective-duration rounding and recoverable future-rate preparation |
| R7 benchmark teardown | Retained failed process ownership and teardown retry | Cancelled-ID reuse and stale iterator/cancel interference with a replacement |

The detailed case register below is the implementation scope. For RCF-01 and
RCF-14 the allocation path is established; an actual OOM or universal latency
threshold is not. RCF-12/22 concern benchmark tooling, not desktop production
playback. Ordinary official benchmark runs using fresh IDs do not establish
that those races have occurred in recorded benchmark results.

## Scope and non-goals

Use five cohesive implementation units and one integration batch:

| Unit | Cases | Principal responsibility | Acceptance risk |
| --- | --- | --- | --- |
| U1 EPUB | 01, 03, 07, 08, 15 | Projection, package admission, numeric guards, nav labels | High: admission and stable source locations |
| U2 reader/settings | 02, 05, 06, 09, 10, 11, 16, 17, 18 | Placement, cancellation, visible/heard ownership, controls | High: async ownership and persistence |
| U3 playback | 19, 20, 21 | Future-rate recovery and effective buffer accounting | High: audio, queue ownership and saved preferences |
| U4 native acquisition | 13, 14 | Explicit cleanup recovery and bounded manifest reads | High: filesystem ownership and trusted runtime admission |
| U5 tooling | 04, 12, 22 | Package rollback preflight and isolated worker ownership | High for output integrity; no new model evaluation |

U2/U3 share the coordinator and form one desktop integration batch. U1 also
affects desktop rendering and narration input. A unit may be implemented before
the others, but final acceptance remains pending until the combined gates pass.
Keep edits focused; do not split the coordinator or redesign the scheduler,
installer, EPUB model or benchmark framework for general cleanup.

No dependency, model, voice, hardware-admission threshold, DSP algorithm,
TTS-wire protocol, persisted reading-position schema, ZIP budget or release
authority change is planned. Do not edit frozen evaluation corpora, generated
manifests, historical evidence or completed ExecPlans. No network download,
full model benchmark, live acquisition, installer publication or Git delivery
beyond the authorized local planning commit is part of this request.

### Case register and minimal correction boundaries

**RCF-01 — Per-word XHTML allocation.** In document/xhtml-projector.ts,
appendTextNode splits normalized prose into many text objects. An admitted
large alternating-word/space leaf can create millions of objects before the
reader's 80,000-node admission check; off-spine manifest XHTML is also projected.
RAF's locator and lookup improvements do not remove this allocation.
Coalesce adjacent normalized text within the same raw leaf/context, preserving
ASCII whitespace state across siblings, NBSP, code/emphasis/link boundaries,
text offsets and anchors. Do not apply generic trim or merge semantic contexts.
Check projection counts, exact text/locator equivalence and the reader's
remaining protection for a very large single text node. Use synthetic bounded
input; do not turn a measured object-count improvement into an OOM guarantee.

**RCF-02 — Play overtakes explicit placement.** startAtVisibleLocator can clear
pending navigation and restart at old visible A while target B is still being
placed. The inactive-narration variant also matters: beginExternalNavigation
does not create the active-owner pending state, and B can await incremental
mounting while the narrator still has A. Guard both command and presentation
with reader placement ownership from intent through matching settlement,
including the inactive path. A pendingNavigation-only guard is insufficient.
Use the same barrier for RCF-09; allow explicit superseding navigation, Stop,
failure and owner replacement to resolve/cancel it. Preserve paused intent and
exactly one eventual start. Regress new-section and unmounted same-section
targets, rejected placement, stale settlement and repeated Play.

**RCF-03 — Per-item fixed-layout rendition prevents later rootfile fallback.**
container-resolver.ts preselects using version/global layout; package-document.ts
can reject an individual fixed-layout spine item before validating later items.
M003's narrower implementation and ADR-0007's first-supported wording differ.
Selected policy under the user's delegated decision: continue to the next rootfile only after
complete structural/security validation identifies a supported-shape but
layout-incompatible candidate. Return a typed incompatibility result rather
than broadly catching an unsupported error. Malformed idrefs, unsafe content,
cancellation and exhausted shared budgets still fail closed. Regress a later
valid rendition, malformed later items in the first rendition, multiple
incompatible candidates and exhaustion. Do not implement fixed-layout reading.

**RCF-04 — Backup-only retired package part is resurrected.** In
release_chatterbox.py, _recover_outputs can restore an old part after a prior
four-to-three-part promotion left only that part's backup. A v2/v3 output set
has no receipt; later formats can also lack an old receipt backup. RAF-11's
conflicting-receipt regression does not cover this case. Preflight the complete
visible and virtually restored output sets, including part/archive size and
hash coherence, before moving any file. Preserve a coherent committed set and
report recovery-required for ambiguity; preserve backups for explicit recovery.
Do not blindly restore or delete every orphan, or retrofit receipts into old
formats. Exercise real temporary output promotion/retry with tiny synthetic
archives, including shrink, missing receipt, old sole backup, valid rollback
and a second injected failure. For v2/v3 verify the output bytes/part sequence
directly; the current check-local command is not a v2/v3 verifier.

**RCF-05 — Failed Stop still permits configuration mutation.**
stopForConfigurationChange resolves after Stop retains failed service/player
owners, so profile/language/reset/removal actions can proceed. Existing tests
with a rejecting mock do not prove the real coordinator contract. Return an
explicit typed containment outcome and require success before any write or
removal. Success requires zero owned active work/service/audio under the
existing bounded shutdown/recovery policy. Apply this to all callers, including
refreshSelectedProfile. Retain recovery data on failure. Do not globally make
Stop throw or clear failure state to satisfy the check. Use a real-coordinator
test with failed shutdown, deferred completion and a newer operation, alongside
successful Reset and existing partial-persistence controls.

**RCF-06 — Previous may jump across disjoint retained preparation ranges.**
Navigation currently sorts retained prepared ranges; the earlier bounded-history
and segmentation-context fixes allow that history and do not promise an
immediate textual predecessor. Selected policy under the user's delegated decision: enable
Previous only for a known immediate predecessor in the preparation chain.
Disable it when that relationship is unknown. Do not add reverse preparation,
discard all history on every restart, or infer continuity merely from equal
locator endpoints; skipped non-narrable material/chapter boundaries can be
legitimate. Regress a disjoint restart, a continuous retained chain, eviction
beyond the existing history limit and profile/language context changes.

**RCF-07 — Ordered-list ordinals are lost.** document-model.ts/projector and
SemanticDocument omit ol start and li value. Dropping an empty li can also turn
the next visible item from ordinal 2 into 1 without either attribute. Carry
bounded valid integer ordinals through the existing semantic model/render plan
to ol/li rendering; account for an empty visible item's ordinal effect without
inventing a narratable block/anchor. Preserve offsets and nested-list identity.
Cover explicit start/value, zero/negative/invalid values, empty versus hidden
items, nesting and incremental mounting. Do not add general CSS counters or
reversed-list support implicitly. Document the additive EPUB export contract
and typecheck its consumers.

**RCF-08 — Code context bypasses the prose numeric-run cap.** A digit or sign in
an immediately preceding code span can suppress the prose run-start check;
129 prose digits then bypass the 128-character cap. The source-window context
preserves the distinction, and Unicode/compound fixes do not address it.
Make predecessor suppression conditional on prose context and preserve code
literal behavior and source mappings. Cover digit/sign code predecessors,
128/129 boundaries, normal prose predecessors and source-window continuation
across every affected active profile. The analogous legacy-v1 guard must be
included by the user's delegated M0 decision as the same admission-only
correction without altering normalized output or the frozen corpus.

**RCF-09 — Initial saved placement is busy but Play is available.** App's
pending readyRestoration and ReaderPublication's narrator attachment can expose
Play before DOM placement completes. This is a readiness race, not proof that
the stored narration offset is always wrong. Feed initial restoration into the
RCF-02 barrier. Keep late narrator attachment, explicit TOC supersession,
unavailable/oversized chapters and failed restoration recoverable. One combined
reader integration scenario can cover both 02 and 09.

**RCF-10 — Completion leaves the 250 ms coordinator ticker alive.** Completion
continues publishing/requesting pump work even though synthesis no longer
starts. Stop the ticker after final metric reconciliation and before a
reentrant completion publication. Preserve the retained owners needed by the
existing restart/recovery flow. A subsequent Play starts one ticker; pause and
buffering still retain their required observations. One fake-clock assertion
in the coordinator suite is sufficient; no performance benchmark is required.

**RCF-11 — Saved-paragraph action label overpromises exact resume.**
ParagraphLeaf says resume at the saved checkpoint, but activation deliberately
uses the paragraph start under the existing authority. Change the accessible
label to describe starting at the beginning of the saved paragraph. Preserve
the target and persistence behavior. Reuse the existing reader action test
with a nonzero saved offset; a new standalone label-only suite is unnecessary.

**RCF-12 — Reusing a cancelled benchmark request ID strands work.**
IsolatedBenchmarkAdapter.generate accepts a tombstoned ID while its iterator
immediately terminates, potentially leaving the worker active. Reject a
cancelled ID before loading/spawning, using the existing bounded failure path,
unless the RCF-22 ownership implementation establishes an equally explicit
attempt contract. Do not introduce automatic retries or remove cancellation
history merely to accept the ID. Confirm a fresh distinct ID still works and
no worker survives the rejected same-ID call.

**RCF-13 — Post-commit cleanup failure remains terminal after retry succeeds.**
Native optional acquisition can commit a verified install, fail backup/staging
cleanup and retain a Failed snapshot even when later cleanup succeeds. Earlier
B06/B07 and CLB-05 deliberately preserved failure/recovery. The UI offers
Check Chatterbox again and Remove; it is not an unrecoverable install and this
Check action must not be confused with hardware compatibility Recheck.
Record narrowly scoped post-commit cleanup provenance. Let an explicit retry
claim the idle acquisition lock, clean only the recorded owned paths, verify
the committed runtime, and then transition to Installed. If a typed optional
retry argument is needed on the existing snapshot command, document and test
both bridge/native sides. Ordinary polling must remain read-only and cannot
clear Failed or touch an active/replacement attempt. Cover backup and staging
failures, repeated failure, successful retry, removal and a newer download.

**RCF-14 — Installed manifest allocation precedes trust checks.**
tts_release_core.rs and optional verification/retained cleanup read whole local
manifests before checking their authority. Bound actual reads, including a
cap-plus-one rejection path; metadata checks alone do not bound a file that
grows. Derive the core bound from the trusted manifest and optional bounds
from all supported current/cleanup-only authorities. Keep hash/byte identity,
symlink/path protections and cancellation. Test oversized/truncated/malformed
files and admitted current/historical cleanup manifests. No model or archive
payload limits change; use small synthetic fixtures rather than huge files.

**RCF-15 — Hidden navigation descendants affect labels and limits.**
navigation-document.ts collects text/alt from hidden descendants; a hidden
label can exceed the 1,024-character limit and reject the EPUB. Apply the
existing explicit hidden-subtree policy to label collection and its visible
length budget. Keep forbidden markup validation even inside hidden subtrees.
Preserve the established title fallback and existing malformed result if no
usable label exists. Descendant image alt is intentionally supported; do not
restrict it to a direct child. Do not treat aria-hidden as visually hidden
without an explicit accessibility policy: preserve current visual text there
unless M0 approves a separately documented rule. Cover hidden wrappers/images,
mixed visible text, a hidden-only label, unsafe descendants and a long hidden
string with a valid short visible label.

**RCF-16 — Terminal highlight settlement overwrites newer manual inspection.**
segment-highlight-controller emits final settlement before coordinator
completion. ReaderPublication can then replace visible/tracker state B with
the final heard position A without moving the viewport. Earlier final-range
tests intentionally preserve final settlement; removing it wholesale would
regress completion persistence. Track the relevant manual viewport revision
and suppress obsolete visible settlement while retaining the separate final
heard checkpoint. Cover manual B before completion, no manual movement, the
last nonzero source offset, buffered/paused completion and a later Play/Resume.
Verify the actually persisted visible/heard owners, not just highlight state.

**RCF-17 — Paused typography refresh can pull inspection back to narration.**
The preference refresh still considers the paused highlight follow-eligible,
settles A and can cancel B's pending reflow. Existing audible-precedence and
Resume-follow corrections do not establish the desired paused-appearance rule.
Selected policy under the user's delegated decision: preserve manually inspected B through
paused typography changes; refresh decorations independently of follow and
visible settlement. Explicit Resume or new audible ownership follows A once.
Test both A already comfortable and A out of view, rapid preference changes,
and true resumed playback. Coordinate this with 02/09/16, rather than adding a
second reader-position authority.

**RCF-18 — Unrelated settings work disables download Cancel.** The shared
disabled state reaches optional Cancel while profile/language/reset awaits
containment. Split cancellation capability from mutation admission; keep
Cancel available whenever that acquisition remains cancellable. Give its
pending state the existing attempt identity so an older download/finalizer
cannot clear a newer action. Preserve the irreversible commit boundary and
RAF remount/preflight protection. Regress deferred settings Stop plus download,
Cancel during transfer, commit already begun and an obsolete finalizer.

**RCF-19 — Future speed preparation kills healthy current playback.**
pcm-playback.ts handles a rejected future-rate preparation as a fatal active
failure, clearing healthy direct audio/queue. Apply the user's approved rule:
return the selected effective rate to 100%, show a bounded reason and save
100% through the existing preference owner. Do not change an already-started
unit's immutable rate or duplicate its ended/heard checkpoint. Retain healthy
audio and continue the queue at 100% at the next boundary. If saving fails,
show effective 100% plus the save failure; do not claim durable success.
Bind recovery to current session, preparation attempt and latest selection.
85% then 75% can share one failed preparation, so comparing only the old rate
must not suppress a still-relevant failure. A newer 100% selection or replaced
session must ignore stale failure. Cover rejection during A, after A ends
awaiting B, paused state, Stop/replacement, repeated slower selection and
persistence races. Include processorerror after successful preparation but
before the future unit starts in web-audio-pcm-playback.ts. Active/initial
playback failures still use fatal containment; this is not a generic silent
fallback for broken audio. Reuse an existing visible status surface.

**RCF-20 — Effective lead floors each unit before summing.**
adaptive-buffer-scheduler.ts can calculate 14,999 ms for source units of
180,011 and 179,989 frames at 24 kHz, although their aggregate is exactly
15,000 ms. Source duration already has an earlier fix; effective-rate lead
reintroduced the rounding. Aggregate precise duration contributions before
one final floor, respecting the immutable active-unit rate, selected future
rate and consumed frames. Do not floor separate rate groups. Preserve
source-frame memory accounting and safe numeric bounds. Regress exact startup,
refill/producer targets, one-frame neighbors, mixed rates and partial
consumption. No change to the approximately-15-seconds lead policy.

**RCF-21 — Final buffered tail displays low-buffer warning.** Suppress the
avoidable low-buffer warning only when preparation is exhausted, no pending
segment/preparation/synthesis can add audio, and positive playable frames
remain. rangeComplete alone is insufficient; a positive tail shorter than
one millisecond must not disappear behind a floored duration check. Keep
underrun accounting, active replenishment and displayed duration truthful.
Cover final tail versus pending generation and zero-buffer completion in the
scheduler/presentation suites. Do not change warning thresholds.

**RCF-22 — Obsolete benchmark iterator/cancel affects a newer worker.**
An iterator retained after close/abort can consult the adapter's replacement
pipe; an old timeout/mismatched response or cancel(A) can terminate current B.
Bind iterator reads, deadline handling and cancellation to the concrete
attempt/channel owner. Retired iterators terminate without touching B.
Retain ownership of a teardown failure so close can retry it, preserving R7.
Test A retained, B started with a different ID, next(A), cancel(A), stale
deadline and failed-close retry. Combine with 12 in one implementation/test
unit; do not rerun Qwen/CUDA performance evaluations for this model-free fix.

## Relevant files and documentation

Read these authorities at execution time, checking for drift from the planning
base: [documentation index](../../README.md), [MVP](../../product/mvp.md),
[system diagram](../../architecture/system-diagram.md),
[overview](../../architecture/overview.md), [roadmap](../roadmap.md),
[M005](../completed/M005-narration-text-preparation.md),
[ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md),
[ADR-0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md),
[ADR-0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
[ADR-0039](../../architecture/decisions/ADR-0039-freeze-boundary-deferred-playback-authority-v3.md),
[ADR-0040](../../architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md),
[ADR-0057](../../architecture/decisions/ADR-0057-reader-acquisition-correctness.md),
and [change review](../../development/agentic-change-review.md).

Principal existing sources and adjacent tests:

- packages/epub/src/document/{xhtml-projector,document-model}.ts;
  container/container-resolver.ts; package/package-document.ts;
  public/open-epub-publication.ts; navigation/navigation-document.ts;
  narration/{narration-normalizer,narration-bilingual-normalizer,narration-source-window}.ts.
- apps/desktop/src/App.tsx; reader/{ReaderPublication,SemanticDocument,ParagraphLeaf}.tsx;
  reader/{reader-navigation,semantic-document-render-plan,segment-highlight-controller}.ts;
  persistence/{reader-position-save-coordinator,narration-position-save-bridge}.ts.
- apps/desktop/src/tts/{product-narration-coordinator,adaptive-buffer-scheduler,pcm-playback,pcm-playback-contracts}.ts;
  playback-backends/web-audio-pcm-playback.ts under that tts directory;
  tts/{ProductNarrationControls,OptionalChatterboxControls}.tsx;
  settings/{narration-settings-actions.ts,ReaderSettingsDialog.tsx}.
- apps/desktop/src-tauri/src/{tts_release_core,tts_optional_chatterbox}.rs
  and their test modules; the existing optional-chatterbox bridge if necessary.
- services/tts/src/voxleaf_tts/release_chatterbox.py;
  services/tts/benchmarks/isolation.py; corresponding Python tests.
- apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts;
  apps/desktop/scripts/native-startup-smoke.mjs and native-smoke.node-test.mjs.

These are responsibility boundaries, not permission for unrelated edits. Read
the owning code and callers before selecting a helper or public-contract change.

## Architecture and constraints

Keep EPUB bytes on device, inference local and generated PCM bounded and
ephemeral. Long operations retain cancellation and stale-owner suppression.
No logs, fixtures or committed evidence may contain book prose, private paths,
model weights or generated audio; create synthetic EPUB text for regressions.

Reader placement, current audible range, heard checkpoint and saved visible
location are distinct states that must agree at their documented transitions.
Do not solve races by always snapping to narration or by clearing ownership
before containment. A terminal notification must not resurrect an old owner.

RCF-07 adds explicitly documented semantic-model fields. RCF-05 may change an
internal typed result; RCF-13/19 may require additive IPC/playback result data.
Prefer existing channels, enumerate all callers and keep defaults compatible.
If a public contract changes, document it and add consumer validation; do not
silently broaden schema or persist a new field.

Update maintained product/development documentation after behavior is accepted.
Record durable policy decisions in a new available ADR number at execution
time, referencing historical ADRs without rewriting completed plans. Review
the system diagram and M005 terminology/roadmap status; update the diagram
only if actual boundaries/data flow change. Historical v1 normalization and
playback evaluation authorities remain frozen unless a distinct decision
explicitly permits a bounded correction.

## Milestones

### M0 — Reconfirm scope, decisions and the smallest gate set

Status: Complete. All 22 cases revalidated; four policy choices resolved.

After execution is authorized, record actual HEAD, clean/index state and any
pre-existing changes; revalidate every owning path against this planning base.
Resolve the RCF-03/06/17 proposals and RCF-08 legacy scope explicitly. Preserve
RCF-15's existing aria-hidden behavior unless a separate policy is approved.
Do not block unrelated units on these decisions, or mark undecided cases fixed.

Create an execution ledger under docs/plans/evidence/revalidated-chat-findings/
with privacy-safe summaries and a command register. Store raw host receipts,
input manifests and diagnostics under ignored tmp/evidence/revalidated-chat-findings/.
Record gate membership, commands, cwd, environment and complete input identities.
Retain original failed attempts. No execution evidence directory is created
by this planning-only change.

Before production edits, add only behavioral regressions needed to distinguish
the claimed failure from already-covered behavior. Run those narrow selections
once for red/control evidence; do not run a full repository baseline. RCF-11's
label update can use its existing action test without a separate red run.
Use fresh host evidence if an old baseline cannot prove identical inputs.

### M1 — U1: EPUB boundaries and representation

Status: Complete and accepted by RCF-R3-20261103. Current checks are recorded in the execution ledger.

Implement 01/07/08/15 and approved 03 in their existing owners. Validate source
text/ranges and rendering together; handle whitespace/list changes before
freezing the combined EPUB test input. Expected acceptance: G1, G2 and the
affected G3/G6 rendering scenarios pass, with current type/contract checks.

### M2 — U2/U3: reader, settings and playback

Status: Complete and accepted by RCF-R3-20261103. Current checks are recorded in the execution ledger.

Implement the shared placement barrier for 02/09 first, then containment 05,
position ownership 16 and approved 06/17. Make the bounded 10/11/18 changes
without new position/state frameworks. Implement 19 with preference ownership,
then 20/21 with exact buffer invariants. Run focused red-to-green selections
while iterating; run the combined desktop selection once after shared files
settle. Expected acceptance: G1/G3/G6/G8, plus G7 where the harness changes.

### M3 — U4: optional cleanup and manifest admission

Status: Complete and accepted by RCF-R3-20261103. Current checks are recorded in the execution ledger.

Implement 13/14 with file-operation faults under isolated temporary roots.
Preserve current and cleanup-only authority identities. Expected acceptance:
G1/G4, G6 if IPC/UI changes, G8 for the current packaged core, and G9 when
the optional admission/verification route is changed (expected for 13/14).
Do not substitute an old native binary's PASS.

### M4 — U5: output recovery and benchmark ownership

Status: Complete and accepted by RCF-R3-20261103. Current checks are recorded in the execution ledger.

Implement 04 as a transactional preflight, then 12/22 together using process
fakes and real temporary IPC where the current tests do so. Expected
acceptance: G1/G5. Model binaries, downloads and synthesis benchmarks are not
inputs to these regressions.

### M5 — Combined acceptance and independent review

Status: Implementation acceptance complete under RCF-R3-20261103; final archival assessment is recorded separately in RCF-R4-20261103.

Run the required final gates on their final affected inputs. Reuse within this
execution only where complete identity proof still holds. Perform one final
desktop build after cheap checks and use that exact binary for host modes.
Update maintained docs and this plan's actual results. Check final diff scope
and privacy, verify cleanup, then delegate an independent review to the required
change_reviewer (GPT-6 Astra high) under the change-review policy.

The reviewer reads code and host receipts without edits/tests. Bind APPROVE
to the exact current patch, input identities and reviewed evidence. Resolve
actionable findings and rerun only their invalidated gates; obtain renewed
approval. Missing host evidence or an unavailable reviewer blocks acceptance.
Only after all required outcomes and decisions are closed may this plan move
to completed. Future implementation commits/push/PR/merge need their own
applicable user authorization.

## Testing and benchmark strategy

### Historical evidence assessment

The following ledgers and available local receipts were inspected for planning.
Counts are historical outcomes, not tests run for this plan.

| Evidence | Recorded result | Reuse decision for this work |
| --- | --- | --- |
| [RAF ledger](../evidence/residual-audit-corrections/execution-ledger.md) and [commands](../evidence/residual-audit-corrections/validation-commands.md) | G2-epub-corrected: 522 tests/12 suites; R2-desktop: 604/17; G5-packaging: 96; G7-browser-corrected: 7 journeys; final native feature selections and R2-G9 Piper/build passed | Reuse fixtures and regression controls. Changed projection, reader, native and builder paths invalidate behavioral acceptance. Do not repeat all 17 old desktop suites automatically. |
| [SPM ledger](../evidence/settings-packaging-minimal-corrections/execution-ledger.md) | G3-packaging-final: 136; G2-desktop-F1-formatted: 355; final Piper/build passed | Retain promotion/reset/persistence controls. Core-builder tests are conditional on a real dependency change, not mandatory because Chatterbox builder changes. |
| [NSL ledger](../evidence/narration-settings-lifecycle-corrections/execution-ledger.md) | G2-desktop-current: 407/8; G4-browser-eligibility: 6; core/build/Piper passed | Reuse settings ownership scenarios; real containment and Cancel paths need new evidence. |
| [RIA ledger](../evidence/reader-image-audibility-corrections/execution-ledger.md) | G2-desktop-final: 439/11; G3-browser-final: 11; G7-Piper-r2 exercised six speeds on the final binary | Reuse host harness/fixtures. New playback/native bytes require one fresh integrated Piper arm; image-only cases are out of scope unless projection affects them. |
| [R7 ledger](../evidence/seven-finding-minimal-corrections/execution-ledger.md) | G5-python: 17 isolation/dual-worker tests; failed-close ownership covered | Reuse process fakes and teardown assertions. Changed isolation ownership invalidates this PASS; no need for a new Qwen/GPU benchmark. |
| RAF core-artifact-reuse.json and original SPM identity records | At that execution, all 2,024 Piper payload files and 26 source/authority/lock inputs matched, including membership/size/SHA-256 | Candidate artifact reuse after a fresh complete comparison. Reuse payload/model bytes, not app binary or host behavior. Do not assume the old match still holds. |
| [VUC](../completed/visible-locator-unicode-compound-corrections.md), [R8](../completed/eight-revalidated-findings-minimal-corrections.md) and [RNB](../completed/reader-narration-acquisition-bugfixes.md) | Existing locator, fallback, cleanup and acquired-runtime controls passed their recorded gates | Reuse relevant cases/fixtures. Unchanged unrelated image/GPU/voice matrices are outside this scope, not silently marked reused PASS. |

RAF's raw records are under tmp/evidence/residual-audit-corrections/20261103-01/;
SPM's are under tmp/evidence/settings-packaging-minimal-corrections/.
The records include original inputs/environment, result files and artifact
membership. Their recorded HEAD alone is insufficient because validation
included then-uncommitted changes. If those ignored receipts are unavailable
on another machine, the public summary alone cannot authorize PASS reuse.

No historical behavioral PASS is pre-approved for the changed paths. Potential
unchanged leaf-gate reuse requires the original immutable command/result and
complete source, test, fixture, configuration, lock, tool, environment and
artifact dependency identities, including additions/deletions; it must prove
the same invariant and receive the independent reviewer's explicit assessment.
Compare the cost of proof with rerunning a cheap check: prefer rerunning the
short core integrity check over constructing a costly environment equivalence
claim. Artifact reuse saves package/model preparation, which is the principal
expected saving.

### Execution rules

All tests and validation commands run from normal local PowerShell outside
the managed sandbox, at repository root unless a runner changes cwd. A sandbox
exploration is never acceptance evidence. Confirm configured tool versions
and locally available dependencies before starting; do not install/download
models as an automatic preflight.

Use the existing configured runners below. Narrow red selections add the
runner's existing test-name filter after the new regression is written.
The RCF browser names are planned additions, not existing validated tests.
Do not bypass test hooks: build workspace exports before direct Vitest
invocations; the configured browser hook performs its own incremental build.

Run final format/lint/type checks once per affected language after relevant
edits settle, before expensive build/host work. Then run the combined relevant
suites, selected browser journeys, one build and the required host arms.
Do not run both check and check:portable merely for duplicate coverage; do
not claim either aggregate passed without executing it. Required CI remains
required if later delivery is authorized.

| Gate | Required invariant and scope | Timing, invalidation and receipt |
| --- | --- | --- |
| G0 readiness | Actual base, tools, dependencies, prior receipt availability; no runtime PASS claim | M0; recapture after environment/lock drift |
| G1 static/build exports | Formats, lint, types and EPUB export consumers | Final affected source/config; rebuild exports after EPUB/shared changes; per-command receipt |
| G2 EPUB | 01/03/07/08/15 and admission/source-range controls | Once after U1; source/test/fixture/admission-config changes invalidate |
| G3 desktop | 02/05/06/07/09/10/11/16/17/18/19/20/21 and real coordinator/persistence controls | Once after U2/U3 and U1 exports settle; JSX/coordinator/PCM/preferences/test changes invalidate |
| G4 native | 13/14 under default and release-locked-runtime features | After U4; Rust sources, authorities, Cargo inputs/toolchain and fixtures invalidate |
| G5 Python | 04/12/22, promotion/rollback and failed-close controls | Once after U5; Python modules/fixtures/locks/interpreter invalidate |
| G6 Chromium | Real placement/reflow and worklet recovery, Cancel/settings ownership | Final app/EPUB/browser inputs; preserve before/after tracing on failure |
| G7 harness, conditional | Harness export/argument/cleanup correctness | Only if a host harness changes; native-smoke suite on final harness |
| G8 core/build/Piper | Current packaged app, six boundary-deferred rates, cancellation, ownership and resource restoration | One final binary, verified reused core bytes; app/native/export/core/tool/env changes invalidate |
| G9 optional local admission | Exact current package remains admitted after verifier/cleanup changes | Reuse verified v7 parts/models; fresh replay for changed native path, no network/GPU |
| G10 closeout | Evidence policy, whitespace, doc links, cleanup, reviewed immutable patch | Last; changed docs/paths/reports need appropriate review renewal |

### Concrete command register

Commands are existing scripts or scoped invocations of their configured
Vitest, pytest and Cargo runners. Run each line separately, record its exit
code, and stop dependent work on failure. Expected outcome is exit 0 and all
selected cases passing; ignored native tests are reported separately.

G1, applicable across this planned five-unit scope:

    pnpm.cmd build:packages
    pnpm.cmd format:check:typescript
    pnpm.cmd lint:typescript
    pnpm.cmd --filter @voxleaf/epub typecheck
    pnpm.cmd --filter @voxleaf/desktop typecheck
    pnpm.cmd format:check:python
    pnpm.cmd lint:python
    pnpm.cmd typecheck:python
    pnpm.cmd format:check:rust
    pnpm.cmd lint:rust

G2, selected owner and integration suites:

    pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/document/document-model.test.ts src/container/container-resolver.test.ts src/package/package-document.test.ts src/navigation/navigation-document.test.ts src/public/open-epub-publication.test.ts src/locator/locator-index.test.ts src/narration/narration-source-projector.test.ts src/narration/narration-source-window.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-resource-bounds.test.ts src/testing/narration-preparation-limits.test.ts src/integration/narration-preparation-matrix.test.ts

G3, one combined selection; add a directly affected omitted consumer only with
an identified invariant, recording why it is needed:

    pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/SemanticDocument.test.tsx src/reader/large-chapter-rendering.test.ts src/reader/segment-highlight-controller.test.tsx src/reader/semantic-dom-range-mapper.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/pcm-playback.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/product-narration-presentation.test.ts src/persistence/narration-playback-preference.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts

Add optional-chatterbox-client.test.ts if the native retry bridge changes,
process-client.test.ts if the containment transport changes, and the applicable
shared-contract suite/typecheck if a shared export changes. Do not weaken an
existing assertion simply because the new implementation breaks it.

G4 (small native suite in both configured feature modes, including core and
optional modules; avoids redundant per-module recompilation/runs):

    pnpm.cmd test:rust

G5:

    uv run --project services/tts --locked pytest services/tts/tests/test_release_chatterbox.py services/tts/tests/test_chatterbox_sources.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_runtime.py

Include test_release_core.py only if a shared builder/helper dependency changes.
Include additional version-authority tests only when their corresponding
builder dispatch/authority path is changed; no frozen outputs are regenerated.

G6: extend the existing browser spec with a few integrated RCF journeys for
02/09/07, 16/17, 05/18 and 19/20/21. Reuse fixtures rather than one end-to-end
test per case. The real-worklet future-failure test must prove current direct
audio continues and the next unit's selected rate/status are truthful.
Retain the existing targeted boundary controls below. The literal inner
quotes preserve the regex through pnpm.cmd on Windows.

    pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep '"RCF-|RAF-02|RAF-04|NSL-03|SPM-01/02|MPA-01/03|MPA-02|NCC final"'

G7, only if the native harness changes:

    pnpm.cmd test:native-smoke-harness

G8: verify the reused core payload's complete current identity against the
original artifact closure, run its integrity check, and build the new app once.
The existing six-rate mode exercises real packaged playback without repeating
the historical full DSP evaluation. Extend focused host assertions only where
browser/unit coverage cannot establish the WebView2/native invariant.

    pnpm.cmd package:piper-core:check
    pnpm.cmd build:desktop
    node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-playback-speeds

G9: the current exact-local fixture requires VOXLEAF_V7_PARTS and
VOXLEAF_V7_MODELS pointing to verified existing local v7 parts/models. Record
full required artifact identities and preserve/restore any prior variable
values. Select paths from available receipts, not an assumed user directory.
It exercises the real admission code with local file transfer, without model
inference. Missing artifacts make this gate pending; they do not authorize an
automatic multi-gigabyte download or an invented PASS.

    pnpm.cmd test:chatterbox:v7:local-admission

G9 does not itself inject every cleanup failure: G4 supplies those fault cases.
If a change reaches loader/runtime selection or frozen service/model bytes,
replan the affected native-loader/inference gates before acceptance. Otherwise
no Chatterbox ES/EN GPU run, bilingual portfolio, Qwen benchmark, full security
audit or live-download matrix is required by these defects.

G10:

    pnpm.cmd check:evidence
    git diff --check

Also check local documentation links and the staged exact path set. Record
manual inspections separately from command PASS. The Markdown-only planning
commit needs these documentation checks, not G1-G9 or runtime acceptance.

### Evidence reuse, failures and cleanup

For each gate record original command, timestamps/duration, cwd, exit/result,
test membership, tool/environment identities, complete transitive input hash
manifest, artifact identity and any explicit exclusions. Reports use portable
paths and no book text. Keep raw logs/manifests ignored; commit concise curated
evidence. A final documentation-only edit does not automatically invalidate a
runtime gate, but its independence must be proved rather than assumed.

Run host work sequentially where it touches app data/resources. Before a
native mutation, record a cleanup journal for exact resource paths, settings,
scratch, environment values and owned process PID/creation/executable identity.
Restore pre-existing resources and verify the before/after identities, zero
owned child processes and no retained audio/scratch. Never clean all processes
by name or delete unrelated installed data. Native unit fixtures must use
isolated roots rather than the user's active optional installation.

For an infrastructure failure allow at most one retry with a concrete changed
hypothesis; then diagnose the blocked phase. Preserve assertion failures and
their candidate identity. Source/test fixes invalidate their dependent gates,
not every unrelated gate. Do not retry to hide nondeterministic ownership.

## Risks and rollback

- Projection coalescing and ordinal retention can change source/DOM mappings.
  Require exact logical text/range controls before browser/native work; do not
  compensate with rendered page numbers or regenerated historical baselines.
- Placement and terminal settlement share state with cancellation, reflow and
  persistence. Keep one existing owner chain and reject stale completions at
  the boundary. Avoid guards that permanently disable Play after a failed open.
- A 100% fallback can race newer preferences or a unit boundary. Use explicit
  attempt/version ownership and preserve the current unit. A persistence
  failure is visible and does not retroactively make audio preparation fatal.
- Cleanup recovery must never bless an unverified install or delete a newer
  attempt. Bound and verify retained provenance; recovery remains explicit.
- Package repair is conservative when visible/backup sets are ambiguous.
  Preserve data for recovery instead of guessing which generation is current.
- Reduced testing is based on affected invariants, not a fixed test-count
  quota. Missing identity proof means rerun the affected check, not all checks.
- Decisions 03/06/17 and legacy 08 were resolved under the user's delegation.
  Do not close the whole plan by silently excluding them.

Before implementation, record owned paths and preserve unrelated work. Roll
back only this plan's changes/temporary artifacts with current authorization.
No data migration is planned. Do not reset the repository, overwrite user
settings or delete an installed runtime as an implementation rollback.
If a minimal fix requires a broader contract/architecture change, amend this
plan and its risk/gate map before dependent implementation.

## Progress log

- 2026-11-03 execution: verified branch and HEAD
  `887c5898d0712cf4053e845bbf286e8dadd3cf80`, with clean worktree/index.
  Applied investigate-bug; independent final change review remains mandatory.
  Grouped consultation received "Analiza qué es lo más recomendable y aplicalo".
  Selected all four bounded proposals (03/06/17 and admission-only legacy 08).
  See [execution ledger](../evidence/revalidated-chat-findings/execution-ledger.md).

- 2026-11-03: Consolidated the 21 original findings, their residual variants and
  the additional benchmark ownership case as RCF-22. Distinguished three
  unresolved behavior choices from unconditional defects.
- 2026-11-03: Reviewed previous plans, execution ledgers, configured commands
  and available original RAF/SPM receipts. Identified artifact/fixture reuse;
  no historical behavioral PASS is accepted for changed paths in advance.
- 2026-11-03: Created codex/revalidated-chat-findings-plan from the clean
  planning base. Prepared this plan and index entry only.
- 2026-11-03: Planning-document evidence policy and local link/structure/path
  inspection passed in normal local PowerShell outside the sandbox. Local
  documentation commit follows the final staged-diff check.
- M0 source revalidation complete. U1-U5 implementation and grouped checks are
  in progress; see the execution ledger for exact outcomes and failed attempts.
  Final static, integrated host, cleanup and independent review gates remain.

## Discoveries and decisions

- User decision: RCF-19 returns to 100% with a visible explanation when future
  speed preparation fails. Restore the stored preference through the normal
  persistence owner; explicitly report a failed save. This does not authorize
  interrupting a healthy immutable current unit or discarding a newer choice.
- Selected under the user's delegated decision: RCF-03 permits only validated layout-specific
  rootfile fallback; RCF-06 Previous requires a known immediate predecessor;
  RCF-17 paused appearance changes preserve manual inspection until Resume.
- RCF-08's legacy-v1 admission variant is included under the delegated decision;
  normalized output and frozen evaluation corpora remain unchanged.
  RCF-15 does not broaden aria-hidden into a visual-hidden rule.
- RCF-02 includes inactive/incrementally mounted placement; RCF-04 includes
  receiptless old package formats; RCF-07 includes empty li numbering;
  RCF-19 includes prepared-but-not-yet-active processorerror; RCF-21 includes
  a positive sub-millisecond tail. These are acceptance cases, not new IDs.
- RCF-13 has an existing removal escape path and explicit Check action; do not
  describe it as irreversible or confuse Check with compatibility Recheck.
- RCF-01/14 have an allocation defect, without measured OOM. RCF-12/22 have
  reachable adapter sequences, without evidence that official benchmark
  measurements are wrong.
- Reusing a package/model artifact differs from reusing a test result. The
  previous 2,024-file/26-input Piper match is historical and needs fresh proof.
- No implementation review is required to accept this documentation-only
  planning commit. Runtime execution later requires the independent reviewer
  and host evidence specified above.

## Final validation results

Implementation: **ACCEPTED by RCF-R3-20261103**. All 22 cases and
registered variants are implemented. G1–G6, G8–G10 pass; G7 is inapplicable
because the native smoke harness is unchanged. The execution ledger records
516 EPUB, 632 desktop, 165/164 native, 126 Python, ten Chromium journeys,
the current build/six-speed Piper run and exact-local Chatterbox admission.
R1-F1 and R2-F2 exposed shared/retired preparation ownership gaps. Both are
corrected with real-backend and player controls. All affected playback gates
pass on the final binary; RCF-R3-20261103 approves without remaining findings.

Implementation review: [RCF-R3-20261103](../evidence/revalidated-chat-findings/review-R3.md).
The separate [RCF-R4-20261103 archival report](../evidence/revalidated-chat-findings/review-R4.md)
governs acceptance of the final documentation/path changes; a pending report is not approval.

Planning-only checks on 2026-11-03, outside the managed sandbox:

- node scripts/check-evidence.mjs (the configured check:evidence script's
  command): exit 0, evidence retention check passed.
- Read-only PowerShell documentation inspection: exit 0; 28 local links,
  all 22 case entries, all 12 required sections and 30 existing Vitest suite
  paths verified; no trailing whitespace.
- git diff --cached --check: exit 0. Staged path inspection contains only this
  plan and docs/plans/active/README.md; final commit handoff records its identity.

These are documentation checks, not execution of the implementation plan.

Historical results in this document are labeled as historical. Current test results are recorded in the execution ledger. Implementation acceptance and artifact/source equivalence are recorded in the execution ledger.
Final archival disposition is recorded separately. No deployment or Git delivery occurred. The system diagram and completed-plan authorities are unchanged by
this planning commit.

Archival closeout: all RCF-01–22 and registered variants are resolved. The four
delegated policy choices and RCF-19 are implemented; R1-F1 and R2-F2 are resolved.
Current static, deterministic, Chromium, native Piper and optional admission
evidence satisfies the plan. No decision or runtime gate remains pending.
Indexes and maintained documentation are reconciled for the final archival assessment.
