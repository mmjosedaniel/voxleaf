# Deep chat audit: minimal corrections and evidence reuse

Status: **Completed. Integrated change review approved by DCR-G12-R2-ASTRA-20261110-01.**

Privacy redaction (2026-11-09): local-profile inventory details were generalized
at the user's request. Original documents are retained privately. Technical
requirements, execution outcomes and limitations are unchanged; earlier review
manifests identify the pre-redaction document snapshots.

Planning date: 2026-11-09. Inspected source baseline:
`75deb2c9bda2f34dfa72fbd947a0fbf05fd3542a` (`main`). Planning branch:
`codex/deep-chat-audit-execplan`.

The user's pasted execution instruction authorizes implementation, the planned
host checks and independent per-unit/final review. It supersedes the earlier
planning-only restriction. It does not authorize implementation commits, push,
PR, merge, publication, signing or new benchmark/model promotion.

This plan spans M003-M011 and therefore has a descriptive filename, following
[PLANS.md](../../../.agents/PLANS.md). Case numbers below preserve the 25-case
order from five static searches and their individual investigations. `DCR-09`
means case 09 in this plan, not a similarly numbered case in CCF, CAF or EBC.

## 1. Goal

Correct the supported remaining failures with the smallest changes at their
existing owners. Preserve successful earlier corrections, explicit product
policies and frozen evaluation authorities. Establish a failing regression
before each production correction, then reuse that regression for acceptance.

The revised scope gives all 25 cases a decision: **23 corrections or bounded
policy changes, one defensive hardening (16), and one withdrawn finding (02)**.
The 23 cases are 01, 03-15 and 17-25. Cases 04/07 have explicit policy decisions;
17/18/22 include versioned successor tooling in this plan. They are no longer
deferred to another planning task. Every claimed defect remains static until
reproduced on the execution checkout. A disproved candidate receives an
evidence-backed no-change decision. Do not claim that all 25 cases were bugs
or were fixed; the pinned Chatterbox engine has no demonstrated shape failure.

Minimize verification by closing actual coverage gaps, grouping overlapping
checks, reusing verified prepared artifacts and accepting an old result only
when its original receipt and complete consumed inputs remain valid. Fewer
commands must not conceal a missing cancellation, cleanup or persistence check.

## 2. User-visible outcome

Recovery remains cancellable while loading; a confirmed partial WSOLA start
retains its heard checkpoint through Pause/Stop; playback failures reach the
correct containment path; and a new book is admitted only after the prior
owner is verifiably released. Exact buffered thresholds start without an
extra unit caused by floating-point loss. Development restoration and language
selection settle consistently before Play.

Unsupported Celsius ranges stay intact. Malformed WebP animation markers do
not become static admission. Optional-runtime removal rejects redirected
managed ancestors before deleting anything. Maintainer tools preserve process
ownership, bound failed runs, verify complete framed shutdown, and cannot
promote a lifecycle assertion without evidence tied to the actual installer.

CUDA admission describes only the default visible ordinal actually used by
inference. Retained TOC attribute text consumes the existing shared decoded-text
budget. The mutable Chatterbox adapter rejects unsupported audio shapes before
flattening. New Qwen batch and handoff tool versions cannot lose cleanup
failures, strand a monitor or sample a restarted child as predecessor residue.
These tool fixes do not themselves produce new hardware measurements.

No new engine, accepted numeric grammar, automatic recovery, audio persistence,
larger buffer, public TTS protocol or broader performance claim is introduced.

## 3. Current state

The planning checkout was clean at the baseline above. The five searches and
25 individual reports were revalidated through code, callers, tests and prior
plans without executing product code or tests. Several earlier fixes covered
another branch of the same responsibility; their historical PASS does not
establish these new triggers. Keep the distinction between static evidence,
reproduction, implementation and independently accepted behavior.

### Complete case register

| Case | Revalidated trigger and consequence | Earlier treatment and minimal disposition |
| --- | --- | --- |
| DCR-01 | `ProductNarrationControls` requires operational recovery for Stop; explicit recovery remains `recovering` during load/warm, hiding Cancel start. | Preserve the terminal episode/one-restart policy from CAF R7.1. U1 exposes cancellation for the actually owned recoverable startup; it does not add another recovery attempt. |
| DCR-02 | Visual block fallback can differ from the saved precise canonical locator. | **WITHDRAWN.** CAF R4.1 expressly preserves the precise checkpoint while publishing actual visual placement. Keep it as a regression control; do not overwrite precise persistence with temporary fallback. |
| DCR-03 | Development StrictMode detaches a ref, cancels initial restoration, then reconnects while `initialRestorationStarted` still prevents retry. Play can remain pending. | Earlier StrictMode work covered effect cleanup, not this ref lifetime. U2 rearms only the cancelled pending placement; no production-wide remount rewrite. |
| DCR-04 | Failure reading a secondary CUDA ordinal discards valid ordinal-0 facts, makes the report partial and can block CPU admission too. | **INCLUDE, U12.** Query only visible ordinal 0 after validating CUDA initialization/count. Amend ADR-0063's enumeration rule; retain fail-closed admission for an unknown/invalid default, LUID matching and DirectML behavior. Never fall through to another GPU or accept an unrelated partial report. |
| DCR-05 | The evidence alias supplies a lifecycle PASS constant; `createPackageEvidence` promotes it without a lifecycle receipt bound to that installer. | M011 recorded manually paired runs; that procedure is not enforced by the alias. U8 binds an actual successful lifecycle receipt, retaining the separate Chatterbox journey and signature requirements. Historical receipts are not declared false. |
| DCR-06 | Pause changes activation before queued `started` arrives; a later `paused` receipt has positive output frames but rendering is false, so partial start/checkpoint publication is lost. | RIA-03, CCF-C20, CLB-02 and CAF R7.3 cover different render/end/clock paths. U1 consumes positive current-unit output evidence once without restarting the paused clock or inferring physical speaker audibility. |
| DCR-07 | EPUB3 TOC retained image alt/title fallback does not charge the shared decoded-text counter. | **INCLUDE, U13.** Charge only normalized attribute-derived UTF-8 bytes retained in a TOC label, including title only when used. Attribute-only collapsed whitespace is charged once; already charged XML text/whitespace, hidden alt and eclipsed title are excluded. Preserve independent label/node limits; amend ADR-0007 explicitly. |
| DCR-08 | Blocking batch receive lacks streaming's generation identity and can tear down the same Process concurrently with Cancel. | RCF-22 corrected streaming ownership. U7 extends concrete attempt ownership to batch cancellation and idempotent teardown without holding a lock across blocking receive. |
| DCR-09 | `20 °C – 25,5 °C` and `20 °C – −5 °C` can expand the first endpoint because the right-neighbor recognizer accepts digits only. | CCF-C18 protects integer ranges and separators. U4 preserves the whole unsupported decimal/signed range, source mapping and bounded lookahead; no new number expansion. |
| DCR-10 | After PCM acceptance, synchronous sink failure enters a catch that calls `failActiveSynthesis` with no active synthesis; `invalid-state` masks the error and a derived finally promise rejects unobserved. | MPA handles processor/preparation failures. U1 routes the typed sink failure to playback containment and settles only an owned active action. A later tick may already clean up, so do not assert an inevitable leak. |
| DCR-11 | Bilingual, adapter-layout and handoff host firewall predicates accept partial restrictions rather than proving the effective unrestricted outbound block. | CAF R3.5 corrected Python preflight only. U9 checks the JS hosts against that effective-store/profile/service/filter contract. U10 makes the handoff caller reuse the existing Python WindowsFirewallNetworkProbe. Test actual PowerShell boundaries without modifying user firewall rules. This is another caller of 11, not a 26th case. |
| DCR-12 | The adapter host accepts `stopped` plus process close/code 0 despite trailing malformed/partial/extra stdout records. | Service-layout and cleanup fixes did not validate terminal reader state. U9 requires clean final framing after stdio close while preserving queued `protocolRejected` delivery on the malformed-input route. |
| DCR-13 | Batch controller marks itself active before initial clock/resource reads outside finally; an exception leaves it permanently busy. | Existing batch evaluation history does not fix controller lifetime. U7 protects acquisition and measurements while preserving the original exception and unrelated identity ownership. |
| DCR-14 | Loopback reservation has no error handler; an asynchronous bind error can terminate Node after backup/install, bypassing restoration. | SAF-01/RAC-03/CCF-C04 cover other spawn/restoration paths. U8 fixes only reservation/listener ownership and propagates failure into the existing finalizer. |
| DCR-15 | An early ANIM/ANMF marker sets animated=true, then a later VP8X can overwrite it with false and admit malformed input as static. | U5 makes animation evidence monotonic or rejects the contradictory order. This proves predecode rejection only, not an animation exploit accepted by the real decoder. |
| DCR-16 | Chatterbox flattens before checking dimensionality, so hypothetical multichannel output could become concatenated mono. | **INCLUDE AS HARDENING, U14.** Accept only bounded nonempty `(N,)`/`(1,N)` shapes before CPU copy/flattening in the mutable adapter. The pinned engine returns `(1,N)`; this is not a reproduced installed-v7 defect. Keep frozen packaged sources/payloads unchanged and state that deployment boundary explicitly. |
| DCR-17 | Official Qwen v4 stores a close failure in terminal_code after its last consumer, omitting it if residue is zero. | **INCLUDE, U15, successor v13.** Record close failure independently of the generation diagnostic; fail cleanup audit and both dependent viability conclusions even with zero residue. Do not start another trial after unverified close. Freeze new authority/schema identities; preserve historical v4 derivation and results. |
| DCR-18 | Official Qwen v4 starts its monitor before candidate factory/load but stops it only on normal completion. | **INCLUDE WITH 17, U15.** An outer owner finalizer covers monitor start, factory, load and trials. Always signal/attempt bounded join after candidate cleanup; preserve a primary failure and report incomplete cleanup separately. This is a tool lifetime defect, not a demonstrated app leak. |
| DCR-19 | Removal rejects root/leaf reparse points but follows an intermediate managed ancestor redirected to a sibling within the root. Containment alone does not prove ownership. | VCA-02 and later removal work protect other links/cleanup states. U6 checks every owned ancestor before mutation. Do not extend the claim to promotion, which already checks its parent. |
| DCR-20 | Replacement during pending containment can reject verified cleanup because the original TTS diagnostic survives; the sticky barrier blocks later books. Conversely, a non-TTS diagnostic can let App accept failed backend cleanup with zero unit counters. | VCA-05, CAF R7.1 and CCF-C07 remain necessary. U1 gives App an explicit idempotent verified-close outcome, independent of failure text, covering both directions. |
| DCR-21 | Handoff CLI waits in its process/reader/queue loop without an overall deadline; the later wait(timeout=5) cannot bound that loop. | MAF-05 strengthened finally but does not make the loop exit. U10 adds a monotonic outer watchdog and bounded draining, retaining owned cleanup and primary failure. |
| DCR-22 | Native handoff emits cleanup, sleeps 50 ms and restarts without observer acknowledgement; late sampling can count the successor as residue. | **INCLUDE WITH 21, U10, handoff v2.** Hold the native runner at each cleanup boundary until the observer returns a matching, bounded acknowledgement after fresh zero-resource checks. Version the private measurement exchange/profile/result; preserve the M007 service protocol and old v1 evidence. |
| DCR-23 | In development, saved Aiden plus EN→ES→EN can leave Piper visible while fresh pre-start probing restores Aiden; the identity guard then rejects Play. | U3 settles the language-specific choice from a fresh authoritative check before enabling start. Preserve saved explicit preference, stale-response rejection and release-locked exclusions. |
| DCR-24 | Four valid blocks totaling 360,000 frames at 24 kHz/1x can sum to 14999.999999999998 ms, then floor to 14999 and delay Quick startup. | RCF-20 removed per-unit flooring. U1 sums remaining frames with exact rational arithmetic across active/future rates and floors once; no epsilon or per-rate floor. |
| DCR-25 | A historical raw file modified in the index then deleted locally is exempted using worktree deletion although modified bytes remain staged. | The PR #229 exemption allows legitimate unstaged cleanup. U11 permits it only when the normal index entry still matches HEAD mode/blob. Current HEAD contains only four allowed non-Markdown evidence files; use synthetic repositories. |

## 4. Scope and non-goals

### Bounded implementation units

Units are work ownership boundaries, not permission for unrelated refactoring.
Exactly one writer may edit source/tests at a time. Reuse one independent
`change_reviewer` (GPT-6 Astra high) for acceptance under the existing workflow.
This is behavioral bug work, not a clean-code campaign: no clean-code worker,
per-file refactor baseline or refactor-validation report is substituted.

| Unit | Cases; risk | Initial production allowlist and direct tests |
| --- | --- | --- |
| U1 | 01/06/10/20/24; high | `apps/desktop/src/App.tsx`; `apps/desktop/src/tts/{ProductNarrationControls.tsx,product-narration-coordinator.ts,pcm-playback.ts,adaptive-buffer-scheduler.ts,playback-backends/web-audio-pcm-playback.ts}`; their existing owner tests, worklet and persistence controls. Worklet production changes require a demonstrated need; prefer consuming its existing positive-frame receipt. |
| U2 | 03; high | `apps/desktop/src/reader/ReaderPublication.tsx`; `reader-reflow-restoration.ts` only if ownership cannot be repaired at the caller; existing reader/restorer/App tests. |
| U3 | 23; high | `apps/desktop/src/tts/hardware-profile-compatibility.ts`; `apps/desktop/src/settings/narration-settings-actions.ts` if needed; their tests plus coordinator/Settings caller controls. Reuse U1's coordinator owner, never edit it concurrently. |
| U4 | 09; medium/high source mapping | `packages/epub/src/narration/narration-bilingual-normalizer.ts`; existing normalizer, resource-bounds and public preparation matrix tests. Frozen v1 files are excluded. |
| U5 | 15; high admission | `apps/desktop/src/reader/images/raster-image-policy.ts`; existing policy/source tests and synthetic browser image fixtures. No decoder replacement. |
| U6 | 19; high filesystem | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`; its existing `tests.rs`/direct test modules. Reuse owned-path and Windows junction helpers where available. No package-format or ownership-root expansion. |
| U7 | 08/13; high process ownership | `services/tts/benchmarks/isolation.py`, `batch_execution.py`; `dual_worker_runtime.py` only if needed by ownership; existing isolation/dual-worker/batch tests. No model execution or official v4 accounting edits. |
| U8 | 05/14; high release evidence/restoration | `apps/desktop/scripts/{windows-release.mjs,ordinary-chatterbox-release-host.mjs}` and their Node tests; `scripts/test-windows-package-lifecycle.ps1`; evidence alias in root `package.json`. A directly tested receipt helper is permitted only if needed to test the actual producer without executing an installer in a unit test. |
| U9 | 11/12; high verification | `apps/desktop/scripts/{bilingual-portfolio-host.mjs,tts-adapter-layout-host.mjs}` and their Node tests. At most one small shared predicate module if both real consumers justify it; no general harness redesign. |
| U10 | 21/22 and the handoff caller of 11; high native/tool ownership | `services/tts/benchmarks/service_handoff_cli.py`, `apps/desktop/src-tauri/src/tts_service_handoff.rs` and their direct tests; diagnostics dispatch only if needed to reject version mismatch. Add `benchmarks/tts/service-handoff-profile-v2.json`, `schemas/service-handoff-result-v2.schema.json` beneath that directory and `services/tts/benchmarks/service_handoff_v2_authority.py`. Preserve the v1 validator/files/results. Reuse `WindowsFirewallNetworkProbe` rather than another predicate. |
| U11 | 25; low/medium tooling | `scripts/check-evidence.mjs`, `scripts/check-evidence.test.mjs`, and the exact exemption description in `docs/development/evidence-retention.md`. |
| U12 | 04; high native admission | `apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs`, its directly coupled probe/normalization tests and ADR-0063. Add only the small native-call seam needed to test the actual ordinal selection. No report-schema, profile-ID or GPU selection change. |
| U13 | 07; high EPUB budget | `packages/epub/src/navigation/navigation-document.ts`, its tests, existing public ingestion/budget tests and ADR-0007. Use the existing processing budget and UTF-8 counting helper; no new counter policy or general parser refactor. |
| U14 | 16; medium defensive validation | `services/tts/src/voxleaf_tts/adapters/chatterbox.py` and `services/tts/tests/test_chatterbox_adapter.py`. Existing `test_chatterbox_sources.py` is a provenance control, not permission to edit frozen packaging. |
| U15 | 17/18; high evaluation ownership/accounting | `services/tts/benchmarks/{batch_official.py,batch_cli.py,batch_result.py,batch_result_cli.py}` and existing official/CLI tests; new `v13_authority.py` and its direct tests. Add `benchmarks/tts/profile-v13.json` and `schemas/short-segment-batch-{raw,summary}-v13.schema.json` there. Reuse stable mechanics without a general evaluation framework. Preserve v4 authority/corpus/schemas/results and legacy derivation. |

New behavioral tests should use `DCR-<case>` or `dcr_<case>` identifiers in the
existing test locations. Browser additions belong to existing reader/reflow
smoke files. Freeze a concrete path allowlist before each unit; record a
necessary directly coupled path before editing it. Do not rewrite a large owner
merely because it contains multiple findings.

Maintained product/architecture/testing documentation may be updated narrowly
where the implemented behavior actually changes. New concise execution records
belong in `docs/plans/evidence/deep-chat-audit/`; raw logs, manifests and recovery
journals stay in ignored `tmp/evidence/deep-chat-audit/<run>/`.

Excluded: dependencies/locks, engine selection/support, historical receipts,
completed plans, frozen v1 normalization, frozen Chatterbox runtime sources,
official Qwen v4 and handoff-v1 evaluation authority, bulk formatting, new
downloads, performance/quality campaigns and publication. New v13/v2 tooling
and its deterministic acceptance are included; new hardware result collection,
model promotion and a new installed Chatterbox package are not. Version names
are unoccupied at planning time; confirm before creating them at M0.

## 5. Relevant files and documentation

Read `AGENTS.md`, [documentation index](../../README.md),
[MVP](../../product/mvp.md),
[reader controls](../../product/reader-settings-and-playback-controls.md),
[system diagram](../../architecture/system-diagram.md),
[overview](../../architecture/overview.md),
[roadmap](../roadmap.md) and
[completed M005](../completed/M005-narration-text-preparation.md).
M005 is complete at preparation only; this plan does not extend its claims.

Follow [independent change review](../../development/agentic-change-review.md),
[evidence retention](../../development/evidence-retention.md),
[testing](../../development/testing.md), and the input/evidence/cleanup principles
in the [validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md).
Apply its reuse proof without importing a refactor campaign's unrelated gates.

Read the applicable authorities: synchronization, hardware-profile recovery,
mutable narration v2, ADR-0007/0008/0011/0012/0017/0018/0019/0040/0046/0051/0063/0064,
and the affected installed-release/lifecycle documentation. Inspect current
script configuration before invoking any command below.

The main historical evidence sources, with retrievable commands and failures,
are linked in section 8. Relevant predecessor plans also include
[VCA](../completed/verified-chat-audit-corrections.md),
[NLC](../completed/narration-logic-corrections.md),
[RIA](../completed/reader-image-audibility-minimal-corrections.md), and
[MAF](../completed/minimal-audit-findings-corrections.md).

## 6. Architecture and constraints

Keep EPUB content on device, inference local and generated PCM memory-only.
Preserve the existing source-frame/locator authority, typed IPC, one active
service tree, queue ceilings, explicit user recovery and cancellation on
session replacement. The approximately 15-second Quick target is playable
audio lead, not a wall-clock wait. Never add silence, increase a threshold or
discard existing cleanup checks to hide an error.

U1's verified close result is a desktop-local ownership contract. It must
distinguish successful disposal from stopped service/empty audio counters,
join the same pending close, and retain failed owners for the existing recovery
policy. Preserve the original diagnostic independently. No shared serialized
schema is needed. Cover A→B→C replacement and both false rejection/acceptance.

U1's duration arithmetic uses remaining frames at the immutable active rate
and selected future rate. With Fa/Fs frames and percentage rates Ra/Rs,
`100000 * (Fa * Rs + Fs * Ra) / (24000 * Ra * Rs)` can be floored once after
proving integer intermediates remain exact under current frame/rate limits.
Handle the absent group explicitly; preserve consumed frames, refill/prepared
thresholds and positive sub-millisecond final tails. Do not add an epsilon.

U8 adds only the smallest versioned lifecycle receipt necessary to bind the
installer identity, required install/start/repair/uninstall matrix and verified
cleanup. Emit it after successful finalization, not before restoring data.
Missing, malformed, stale or mismatched receipts cannot produce local PASS.
Retain separate journey and signing requirements; do not rewrite old receipts
or claim a fresh signed/publication-ready release. Document any new CLI option
and output location before using it; it is proposed, not an existing command.

U10's watchdog must bound outer waiting, inner draining and acknowledgement
waiting without resetting on each line. Bound individual blocking operations,
queued records and line sizes as well; an output flood cannot defer the deadline
or grow memory indefinitely. Derive and freeze the execution/cleanup bounds
from the finite matrix and existing operation timeouts. Keep primary failure
and bounded owned process/reader/sampler cleanup. Timeout or incomplete cleanup
never produces a successful benchmark receipt.

### Decisions for the seven previously excluded cases

**02: Preserve the precise checkpoint.** ADR-0011 and CAF R4.1 distinguish a
canonical persisted locator from temporary visual block placement. Overwriting
the former would lose precision on reopen/reflow. Keep the existing behavior
and existing checkpoint controls in U2/G3/G6; add no separate test merely to
relabel a non-bug. Reconsider only if an actual loss of the canonical checkpoint
is reproduced, which would be a different trigger.

**04: Probe the device actually used.** Preserve CUDA library/init/count
validation, then query only visible ordinal 0. Keep its compute capability,
LUID and free-memory/context cleanup checks. Unknown or invalid ordinal 0 still
fails closed; a healthy ordinal 1 never rescues it. Do not relax the global
partial-report guard or silently select another GPU. This is smaller than
representing partial inventories in the public report, and removes irrelevant
secondary-device calls. Add a dated ADR-0063 amendment; retain its earlier
decision and completed NLC history. Synthetic native-call tests establish call
selection, not physical multi-GPU compatibility.

**07: Charge retained attribute contributions once.** Track a bounded scalar
count of normalized UTF-8 bytes contributed by visible XHTML `img.alt` and, only
when the label is otherwise empty, its `title` fallback. Apply the existing
shared budget before publishing the completed label. Keep the 1,024-code-point
limit and parser checkpoints; do not allocate per-character provenance or copy
the whole label just to account for it. Collapsed whitespace needs one small
origin state: charge its one retained space only when the pending run came
entirely from attributes. If XML whitespace participates, that space is already
covered by XML decoding. Ignore leading/trailing collapsed whitespace, hidden
or non-image alt, unused title and NCX text already charged by the XML reader.
Mixed XML/attribute runs and split XML events must produce identical charges.
Do not reset/refund the shared counter between rootfile candidates. If the same
attribute is separately retained as a semantic image description, each retained
use consumes budget; XML text is still not charged again. Document this bounded
extension in ADR-0007 rather than raising the 64-MiB ceiling.

**16: Harden the mutable adapter only.** Inspect shape before CPU transfer and
flattening: allow `(N,)` and `(1,N)` with `0 < N <= MAX_AUDIO_SAMPLE_COUNT`;
reject scalar, empty, multichannel/transposed and higher-rank output. Preserve
existing dtype, finite-sample, byte-length and cancellation checks and byte-for-
byte mono output. Use shape-aware model-free doubles that reproduce flattening,
not the current double whose `reshape` simply returns itself. The pinned engine
already emits `(1,N)`. Installed v7 sources come from immutable historical Git
blobs through `packaging/chatterbox_sources.py`, not this mutable adapter.
Therefore this plan does not claim to update v7 or rebuild/publish a model
runtime solely for an unobserved shape. A future engine/package change must
carry the guard through a new package authority and its own acceptance.

**17 and 18: One bounded Qwen successor, v13.** Existing v5-v12 profiles are
occupied. Reuse v4's corpus, candidate lock, model settings and finite matrix;
create new profile/raw/summary and authority identities for changed failure and
cleanup semantics. Record close failure in an independent typed failure set,
even if a generation failure already exists or sampled residue is zero. The
summary's cleanup audit and both dependent viability conclusions must fail;
appending a diagnostic alone is insufficient. No further candidate/trial may
start after unverified close. Preserve primary and cleanup failures without
retaining exception text or inventing resource values.
If close failure prevents required trials, emit a failed, non-derivable outcome
instead of manufacturing missing records. Independently, derivation must reject
or fail a complete raw record that contains cleanup failure despite zero residue.

An outer ownership scope covers monitor start, factory, load, execution and
cancellation trials. Candidate cleanup precedes monitor shutdown. Separate
idempotent stop/join from metric validation so factory/load/measurement failure
or interruption cannot skip shutdown or mask the primary error. A still-live
thread remains owned and is reported as incomplete cleanup; do not discard its
handle or call that PASS. Normal measurements still cover cancellation trials.
Incomplete runs have a failed tool outcome, never fabricated complete evidence.

Route new official execution explicitly to v13 and reject retired v4 official
execution before model/preflight acquisition. Preserve v4 result validation and
derivation byte semantics, historical hashes and rejected results; legacy raw
derivation may still perform its existing owned cleanup. Use distinct v13 raw
paths and receipt identities. Version selection is closed, not arbitrary profile
loading. CPU admission for a future v13 measurement must reference that version's
own qualifying GPU result, never the old v4 result. The successor remains
**unmeasured** until a separately requested hardware evaluation; deterministic
tests use synthetic admission/results and confer no model viability claim.

**22: Acknowledge cleanup in handoff v2.** Replace the race with a private
native-runner/observer exchange. After verified service cleanup, retain 50 ms
of minimum quiescence, emit a versioned cleanup-ready event with phase and
monotonic sequence, then wait for its matching acknowledgement before restarting
or completing the final phase. The observer takes fresh zero-child/RAM/dedicated-
and-shared-VRAM samples while the runner is held, and acknowledges only success.
Nonzero/unknown observations fail; do not add retries or a longer resource grace
period to make them pass. Require exactly four unique successful boundaries.
Reject wrong/replayed/out-of-order acknowledgement, EOF, oversized records and
timeout; retain one outstanding acknowledgement at most. Failure triggers owned
cleanup, not a restart. Avoid unbounded stdin readers on both sides.

Freeze new v2 profile/result/authority identities before any official run; keep
matrix order and timed operation definitions, excluding observer waiting from
the next operation's timing. The acknowledgement pipe is Python-to-maintainer-
Rust only: M007 Rust-to-TTS service framing remains unchanged. A versioned private
host entrypoint and initial handshake gate service launch; CLI/native version
mismatch fails before starting TTS. Preserve v1 validation/evidence
but do not issue new v1 receipts from modified tooling. Model-free delayed-reader
and subprocess checks validate synchronization; they do not re-certify old
hardware measurements or create a v2 performance result.

Review the system diagram at closeout. Product process topology is unchanged;
document the new maintainer acknowledgement flow wherever that flow is shown.
Review narration terminology/M005 for U4 without rewriting frozen history.
Document U8's receipt in maintained release guidance, U10/U15's new execution
and legacy derivation routes in benchmark guidance, and U12/U13's policy changes
in the maintained ADRs. Never label planned tools or unmeasured results complete.

## 7. Milestones

### M0: Freeze execution scope and coverage map

**Status: Complete.** The source, case, unit, ownership and gate maps are recorded. After implementation is authorized, re-read this plan
and current HEAD/worktree; preserve unrelated work. Resolve path ownership and
record source/test/configuration identities before edits. Recheck the 23
correction/policy cases, the bounded hardening case and the withdrawn case
separately. Confirm v13/v2 version availability and freeze new authority and
protocol limits before implementation tests; never overwrite an occupied name.

Map each assertion below to existing tests before adding anything. Retrieve
original receipts before considering reruns; missing proof is not PASS. Record
RUN, REUSE-CANDIDATE or NOT-APPLICABLE with dependencies and exact commands.
Inspect relevant locks/tool versions, browser/driver readiness and cached
runtime payload identities without downloading or rebuilding by default.

Acceptance: closed case/unit/path and gate maps; reproducible input for each
candidate; no product edit or old PASS accepted without its prerequisite proof.
Do not run a whole-repository pre-change suite.

### M1: Reproduce and minimally correct owned units

**Status: Complete locally.** All 15 units have independent approval. Use one writer, sequentially. Suggested order is
U11, U7, U15, U9, U10, U8, U4/U13/U5, U2/U3, U1, U12/U6, U14; an owner
dependency can justify a recorded reorder. U7 precedes U15 because they share
batch lifecycle helpers. U10 alone owns the handoff caller of 11. U1, U6, U10,
U12 and U15 require particular review attention. Source changes
remain provisionally implemented until all applicable integration gates pass.

For each unit run only its new focused regressions against unchanged production
code, capture the intended failure, make the smallest correction, and rerun the
same selection. A fixture failure is not a defect reproduction. If the trigger
cannot be reached, stop that correction and record the narrower conclusion.
For 16, a rejected synthetic shape proves the defensive contract, not a current
engine failure. For successor tools, first reproduce the legacy race/lifetime/
accounting failure with model-free inputs, then exercise the new version;
missing imports or schemas are not RED evidence for the original defect.

The missing behavioral assertions are:

| Unit | Minimum new assertions and preserved controls |
| --- | --- |
| U1 | Recover→load/warm→Cancel; Pause before started with positive paused frames versus zero/stale/ended; first and successor createBuffer failure without unhandled rejection; A→B→C during successful/failed/delayed backend cleanup with both TTS/non-TTS diagnoses; Quick/refill/prepared exact threshold and one-frame neighbors, mixed active/future rates. Keep terminal recovery, explicit Play, no autoplay, finite FIFO/context disposal and heard-position controls. |
| U2 | Real ReaderPublication under StrictMode with initial interior restore, detach/reconnect, one settlement and Play at the settled position; cancellation superseded by navigation/unmount must not revive. Keep canonical checkpoint and focus behavior. |
| U3 | Saved Aiden EN→ES→EN converges before Play; cached/fresh mismatch, explicit Piper choice and rapid language changes cannot resurrect stale preference or autoplay. Exercise real Settings/coordinator boundaries, not only the selection helper. |
| U4 | Decimal and signed right endpoints, inverse endpoints, both separator spacings and ES/EN through the public preparation boundary. Isolated accepted Celsius/prose dashes still expand; legacy v1, source ranges, bounded work and lookahead remain unchanged. |
| U5 | ANIM/ANMF before VP8X, contradictory flags, truncated chunks and normal static WebP. Assert rejection before decoder invocation and preserve valid static/raster bounds; no claim about an exploit in a browser decoder. |
| U6 | Actual Windows intermediate junction to an in-root sibling and an outside root; sentinels preserved, no partial earlier deletion, root/leaf link controls, normal removal and retry. Validate the complete owned chain before the first destructive operation, not one path at a time after earlier deletes. |
| U7 | Deterministically coordinated batch receive+cancel with exactly one verified teardown, stale owner unable to terminate/consume successor, pre-dispatch cancellation and retry; initial clock/probe failure leaves the controller reusable with no publication. Use bounded barriers and real synthetic child ownership where needed, no model. |
| U8 | Missing/foreign/tampered/incomplete lifecycle receipt rejected; correct matching receipt accepted only after producer cleanup; legacy alias cannot assert PASS. Async bind error on either reservation reaches existing restoration, preserves backup on uncertain cleanup, leaves no owned server/driver. Synthetic files/processes only in unit tests. |
| U9 | Actual PowerShell predicate accepts the canonical effective rule and rejects partial profile/port/protocol/address/interface/service constraints, unavailable store and query error without changing firewall. Reader rejects malformed/partial/extra trailing data after stopped, accepts fragmented clean stopped/EOF, retains protocolRejected and bounds. |
| U10 | Silent/live/flooding child and retained reader reach a fixed watchdog with bounded queue/records; delayed observation beyond 50 ms cannot encounter a successor before acknowledgement. Test the real private pipe exchange with a disposable child, four distinct receipts, wrong/replayed acknowledgements, unknown/nonzero samples, EOF, timeout and cleanup after interruption. Rust tests exercise native gating, not only a Python reimplementation. Version mismatch fails before service launch. Preserve v1 fixture validation, timed operation boundaries, primary failures and the reused effective-firewall predicate through its real caller. |
| U11 | Historical unchanged local deletion still passes; staged modification plus local deletion fails; staged deletion, staged-new local deletion, neighbor paths, mode changes and read errors retain their intended behavior. Use isolated temporary Git repositories. |
| U12 | Native-call seam with valid ordinal 0 and a secondary ordinal that would fail proves no secondary call is made. Invalid/unknown ordinal 0 plus healthy ordinal 1 remains rejected. Preserve init/count bounds, unavailable CUDA, unknown free memory, LUID mapping, context release and DirectML controls. A normal current-host probe is not multi-GPU evidence. |
| U13 | Exact shared byte limit and one-byte overflow with multibyte alt/title; used versus eclipsed title; hidden/non-image alt; leading/trailing and mixed XML/attribute whitespace, split XML events, NCX and a navigation document also projected as spine content. Exercise the public shared-rootfile budget, normal labels, cancellation/checkpoints and existing label bounds without multiplying whole ingestion runs. |
| U14 | Valid `(N,)`/`(1,N)` yield identical PCM; reject scalar, empty, two channels, transposed channel axis, higher rank and oversized N before transfer/reshape. Retain finite-sample/payload boundaries and prove installed-v7 source resolution still uses its frozen blobs. No GPU/model is needed for these checks. |
| U15 | Close raises with zero residue and otherwise passing metrics: typed cleanup failure survives and both dependent conclusions fail. Preserve simultaneous primary failure; no next trial starts with uncertain ownership. Factory/load/controller/monitor failure and interruption always signal/join or explicitly retain/report the live monitor. Test normal cancellation-window coverage, failed metric validation, partial start and idempotent teardown. Exercise v13 CLI/derivation/schema/CPU-admission isolation and unchanged v4 historical derivation; use model-free candidates and bounded real threads/processes. |

Acceptance: each retained correction has correctly attributed RED/GREEN receipts
and a bounded diff. No unit acceptance claims cover pending integration/cleanup.

### M2: Combined current-state validation

**Status: Complete.** Current G0–G10 command and restoration receipts and the G11 documentary checks are recorded and independently accepted. Original execution strategy: freeze final overlapping production/test inputs, build
current EPUB exports once, and run the selected suites in section 8. Reuse each
successful gate within this batch until one of its consumed inputs changes.
Run format/lint/types and deterministic tests before expensive preparation.

Check the existing core identity before final Rust/Clippy, because Rust embeds
its manifest. If that check proves regeneration necessary, first finish cheap
focused checks, use the existing `package:piper-core:write-manifest` command,
then run final Rust/Clippy and build. Do not accept a native test result against
an older embedded manifest and subsequently rebuild it silently.

After cheap gates, verify/reuse unchanged Piper and Chatterbox payloads, build
each required native feature variant once, and execute the selected current
browser/native/installed checks serially. A release-locked installer and a
development executable are distinct artifacts; never reuse one as the other.
If a runner embeds a build, use its existing documented leaf only after proving
the same current build prerequisite. Do not modify a runner merely to save a
build or pretend an aggregate command ran when only leaves ran.

Acceptance: required gates pass or have independently approved original-result
reuse, failed attempts remain recorded, and all host mutations are restored.

### M3: Independent acceptance and documentation closeout

**Status: Complete.** [DCR-G12-R2-ASTRA-20261110-01](../evidence/deep-chat-audit/review-G12-R2.md) approved the integrated snapshot after the ADR-0063 history correction. The plan is archived and all dispositions and supporting receipts are linked below. Original acceptance strategy: freeze code/tests/docs and supply one `change_reviewer`
with the exact patch, full HEAD/path/blob/content identities, case decisions,
RED/GREEN and final host receipts, reuse proofs and restoration evidence.
Pause writing and Git mutations during review. Resolve actionable findings,
rerun only invalidated gates and obtain a new immutable APPROVE for the exact
current patch. Missing evidence/reviewer is BLOCKED, not acceptance.

Record all 25 dispositions, remaining uncertainty and actual commands. Review
the system diagram and maintained behavior docs. Archive only after all retained
correction/policy cases, the mutable-adapter hardening and required acceptance
are complete. Record 02 as withdrawn and v13/v2 as unmeasured unless actual new
hardware evidence exists. State that installed v7 was not changed by 16. This
does not mean every historical concern was a current product bug. Future
implementation Git delivery needs its own authorization.

## 8. Testing and benchmark strategy

### Historical evidence inspected during planning

These are original reported results, not new tests on this branch. Local raw
CCF and EBC result/input JSON files were found and inspected during planning.
Public summaries alone do not establish current environment or artifact equality.

| Evidence | Recorded checks/results | Reuse decision for this plan |
| --- | --- | --- |
| [RCF-R3](../evidence/revalidated-chat-findings/review-R3.md), [commands](../evidence/revalidated-chat-findings/validation-commands.md) | EPUB 516, desktop 632/18 suites, Python 126; Rust 165/164; ten Chromium journeys, six-rate Piper and exact optional admission. R1/R2 preparation-ownership findings required renewed backend evidence. | Reuse assertions/fixtures and verified payloads. Changed playback, reader, batch and removal responsibilities invalidate their behavioral results. Keep old failures and resolved ownership controls. |
| [CAF ledger](../evidence/chat-audit-minimal-follow-up/execution-ledger.md), [commands](../evidence/chat-audit-minimal-follow-up/validation-commands.md), [R2](../evidence/chat-audit-minimal-follow-up/review-R2.md) | Shared 56, EPUB 455, selected desktop 595, Python 147, Node 52, Rust 173/172, three browser journeys. Aggregate desktop failures and targeted repairs are retained separately. | The real firewall classifier, restore/checkpoint and direct-audio clock assertions are reusable test assets. New host predicates and changed owners need fresh tests; no aggregate failure is converted to PASS. |
| [CCF-R2](../evidence/confirmed-chat-findings/review-CCF-R2-20261104.md), [ledger](../evidence/confirmed-chat-findings/execution-ledger.md), [commands](../evidence/confirmed-chat-findings/validation-commands.md) | Shared 33; EPUB 309 plus resource follow-up; desktop 567 plus 77 backend/worklet controls; Python 75; Node 120 from unchanged 78 plus renewed Windows 42; Rust 176/175; selected browser/reflow, Piper six rates and reader corrections, optional admission. | DCR-09/06/14/19 touch gaps outside those assertions. Refresh affected groups. Shared behavior is outside scope; if its gate becomes necessary, U8's root package.json change and tool/environment identity must be assessed too. Running its approximately 1-second leaf is preferable to a costly or incomplete reuse proof. |
| [EBC-R2](../evidence/epub-budget-cancellation-reflow/review-EBC-R2-20261106.md), [commands](../evidence/epub-budget-cancellation-reflow/validation-commands.md) | R2-G2: 174 EPUB tests; R2-G3: 115 desktop tests; one Chromium canonical-passage journey; static checks; packaged startup; 31 evidence tests. Node 24.18.0/pnpm 11.15.1, 799 non-Markdown identities and five artifact identities were checked in that review. | Reuse ingestion fixtures/assertions. Even an unchanged ingestion test may import changed narration preparation, so the whole G2 receipt is not pre-approved and cannot be split into invented independent PASS receipts. Reader/native/evidence results are invalidated by U1/U2/U5/U6/U11. Different recorded Node versions are not automatically equivalent. |
| [V7 preparation and integration](../completed/chatterbox-msgpack-security-refresh.md), preparation review `CB-V7-PREPARATION-R2-ASTRA-20261027` | S3 packaged msgpack probe: six arms with zero retained bytes and four legitimate controls; S4/S5 retained runtime/namespace security controls; exact archive/parts/installed-content checks. | Unchanged component-security results and frozen artifact authority are reuse candidates for that exact payload/probe/lock/environment closure. They do not accept U6's changed native removal or establish new advisory coverage, live download, inference or installer success. Verify the original local receipts before reuse; no broad security/model campaign is selected solely by this plan. |
| [PR #307 follow-up](../evidence/epub-budget-cancellation-reflow/ci-follow-up.md) | Windows sharing-violation reproduction; eight focused controls, supervisor 44 default/43 release, format/Clippy. | Retain the real blocked-stdin and error/deadline controls in current native checks. Old supervisor PASS does not accept changed removal or a newly built executable. |

Original local receipt roots are
`tmp/evidence/revalidated-chat-findings/20261103-01/`,
`tmp/evidence/chat-audit-minimal-follow-up/20261103-01/`,
`tmp/evidence/confirmed-chat-findings/20261104-01/` and
`tmp/evidence/epub-budget-cancellation-reflow/20261106-01/`.
Do not edit them or copy private host inventories into committed Markdown.

The expanded scope also invalidates EBC's changed TOC/budget responsibility,
native probe/handoff behavior and official-batch lifecycle/accounting results.
Reuse their fixtures and prepared inputs where proven identical, not their
old PASS for those changes. New profile/schema identities cannot inherit a
historical evaluation result, even if model weights and the corpus are unchanged.

Useful original costs: CCF G2-shared ~1.08 s; G2-epub ~41.52 s;
G3-desktop-final ~5.34 s; G4-python ~7.18 s; G4-node ~62.28 s;
G5/G7 Rust ~28.41 s; core regeneration ~60.99 s versus check ~7.29 s;
desktop build ~33.22 s; six-rate Piper ~111.87 s; successful reader-corrections
retry ~144.36 s after a retained 330.74-s failure; optional admission ~726.71 s.
These are planning observations, not current duration guarantees.

### Exact reuse rules and savings

1. **Results:** retrieve the immutable original command/result/input manifests
   and review ID; prove all consumed sources, imports, fixtures, discovered
   directory membership, config/locks, tools, generated exports, artifacts and
   relevant host state remain identical. Include HEAD when stamping/discovery
   consumes it. The independent reviewer records the proof in a new report.
   Unknown inputs, stale environments, missing receipts or changed harnesses
   require a current run. An unrelated omitted gate is NOT APPLICABLE, not REUSE.
2. **Prepared artifacts:** reuse locked dependencies, synthetic fixtures,
   model/runtime downloads and unchanged Piper/Chatterbox payloads after exact
   manifests and full input verification. This does not reuse runtime PASS.
   U14 changes a mutable service adapter but installed Chatterbox v7 resolves
   historical source blobs. Verify every actual builder closure, including
   Piper's, before declaring an archive reusable; never assume module names
   prove exclusion. Do not rebuild frozen Chatterbox payloads for this guard.
3. **Within this batch:** a focused GREEN can supply its exact assertions in the
   final report while unchanged, but does not replace missing owner integration.
   Run one final combined selected group after its last relevant edit. Later
   doc-only changes may retain runtime evidence with an explicit input proof.
4. **Avoid repetition:** no full pre-change suite, full model matrix, Qwen v4
   evaluation, handoff-v1 measurement replay, dependency refresh or benchmark
   campaign by default. No full `check` plus `check:portable` duplication. If
   either aggregate becomes required, map all its exclusive leaves to actual
   receipts and preserve CI requirements; never claim an aggregate was executed
   from selected leaf results. Do not spend longer proving reuse of a cheap
   necessary leaf than running it once.

### Selected gates

Every test/validation/build command runs in normal local PowerShell outside the
managed sandbox. Use repository-pinned pnpm 11.15.1 through the existing offline
Corepack setup and a Node version allowed by package.json; record actual versions.
Commands below are configured scripts or their existing runner leaves with
supported selectors. New DCR selectors name tests to be added, not tests that
already exist. Record each exit independently and stop dependent work on failure.

| Gate | Invariant / timing | Existing command or selection; invalidation |
| --- | --- | --- |
| G0 | Current workspace exports before consumers | `pnpm.cmd build:packages` once after U4/U13; rebuild only if EPUB/shared/build inputs change. A verified identical shared output can be reused. |
| G1 | Actual missing behavior before/after each unit | Select new `DCR-`/`dcr_` cases in the existing Vitest/pytest/Node/Rust runners below. Keep failed assertions and fixture errors distinct. No broad pre-change rerun. |
| G2 | Mutable narration, source ranges, TOC and shared resource bounds | Combined EPUB command below after final U4/U13 and current exports. Changes to its transitive preparation/ingestion closure invalidate it. |
| G3 | UI, player, settings, persistence and raster ownership | Combined desktop command below after U1-U5. Shared files/tests make this one final group, not five repeated suites. |
| G4 | Tool ownership/accounting, shape validation and real PowerShell/Node boundary | Selected Python and Node commands below after U7-U10/U14/U15. Synthetic processes, real bounded monitor threads, streams/rules and temporary roots; no model/firewall mutation/real installer in unit tests. |
| G5 | Native containment/removal, default CUDA and handoff gating in both feature modes | `pnpm.cmd test:rust` once after U6/U10/U12 and current embedded core authority. Keep actual ordinal-selection tests plus the existing production Windows probe smoke test; preserve junction and supervisor controls. This is not physical multi-GPU certification. Ignored tests remain ignored, not passing host evidence. |
| G6 | Browser event ordering, StrictMode placement, real worklet and settings | Selected Playwright command below once after final exports/source. Add three cohesive DCR journeys: initial restore/language settlement; output receipt/Pause/Stop/recovery cancellation; A→B→C verified close. Add a small WebP rejection assertion to existing raster coverage if needed. Do not use the full browser matrix. |
| G7 | Current format/lint/types | Configured TS, Python and Rust commands below once after their final inputs. Global scanners are invalidated by any relevant discovered-file change; scoped follow-up checks need an explicit coverage proof. |
| G8 | Current artifact and packaged WebView2 playback | `pnpm.cmd package:piper-core:check`; `pnpm.cmd build:desktop`; then existing startup/Piper leaves below on that exact binary. Reuse payloads, not the old executable. Renew if frontend/native/imported artifact inputs change. |
| G9 | Exact optional cleanup/admission and restoration | `pnpm.cmd test:chatterbox:v7:local-admission` once for U6 using verified local artifacts. This is package admission, not a hardware-profile probe, model inference, a new download or proof of installed-v7 hardening. Its old ~12-minute PASS cannot accept changed removal. U12 is covered by G5, not by relabeling this receipt. |
| G10 | Lifecycle receipt producer bound to final installer | `pnpm.cmd package:windows:verified-core`, then `pnpm.cmd package:windows:lifecycle` once, with owned recovery journal and exact NSIS identity. Capture the new receipt only after cleanup. Synthetic consumer tests cover matching/mismatching paired receipts; do not claim a current full Chatterbox journey or public-release PASS. |
| G11 | Evidence/index behavior and docs | `pnpm.cmd test:evidence` once after U11, then `pnpm.cmd check:evidence`, `git diff --check` and changed-link inspection on final docs/patch. Repeat the guard on the final index if future staging is authorized; no need to rerun unchanged synthetic tests for that staging. |
| G12 | Independent acceptance | Current immutable `change_reviewer` APPROVE covering the exact patch, actual/reused gate evidence and complete host restoration. Any patch drift requires a new assessment and only affected reruns. |

G2:

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/navigation/navigation-document.test.ts src/security/processing-budget.test.ts src/public/open-epub-publication.test.ts
```

G3 (retain the named owner controls; add a suite only for an uncovered changed
responsibility, or remove one only with an explicit dependency argument):

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/images/raster-image-policy.test.ts src/reader/images/raster-image-source.test.ts src/settings/narration-settings-actions.test.ts src/tts/hardware-profile-compatibility.test.ts src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/pcm-playback.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts
```

G4:

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_benchmark_batch_execution.py services/tts/tests/test_benchmark_batch_matrix.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_service_handoff_cli.py services/tts/tests/test_service_handoff_authority.py services/tts/tests/test_chatterbox_adapter.py services/tts/tests/test_chatterbox_sources.py
node --test apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs
```

Extend the existing CLI/official suites with the successor regressions. Once
created, append planned `services/tts/tests/test_benchmark_v13_authority.py` and
`services/tts/tests/test_service_handoff_v2_authority.py` to that same Python run;
these files do not exist yet. Their model-free positive/negative schema tests
also verify unchanged v4/v1 historical hashes and derivation/validation. This
does not execute or redefine a historical hardware evaluation. If U8 needs a
new receipt helper, exercise its actual PowerShell implementation from the
existing Windows Node suite, not a separately implemented JS imitation.

G6 uses the existing Playwright runner. Windows `--%` preserves the regex pipe
from cmd wrappers; verify selected names/counts so an empty collection cannot
pass. DCR cases are planned additions to those existing files.

```powershell
pnpm.cmd --% --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep "DCR-|CCF-C02|MPA-01/03|MPA-02|RIA-03|MAF-07"
```

G7, from the repository root:

```powershell
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
```

Shared schema generation/tests/types are not required merely because this plan
has a local close-result type. If shared contracts actually change, stop and
replan their public compatibility scope rather than silently expanding the patch.

G8 existing leaves after the one current default-feature build:

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-playback-speeds
```

These retain current packaged raster/reader and direct/WSOLA/six-rate integration.
Use synthetic regressions for the new interleavings; an ordinary host journey
alone does not reproduce them. Add an existing exact pending-start or
reader-corrections selector only if the final patch touches its dispatched
ownership/geometry/completion invariant or current coverage is insufficient;
record the existing command and reason before running it. No new narrower host
flag is assumed to exist. Default startup and TTS selectors may be combined only
if inspection proves the existing runner executes both complete invariant sets.

U9 changes maintainer predicates/framing, not model output. Its actual
PowerShell synthetic-rule checks and real synthetic framed-subprocess tests
are the required acceptance; do not rerun all Piper/Chatterbox ES/EN candidate
benchmarks merely to observe a healthy shutdown. U10/U15 use disposable children,
controlled measurements and actual monitor/pipe ownership to verify the changed
boundaries. Existing Qwen v4 and handoff-v1 results remain historical; their
numbers cannot be copied into v13/v2. No new full model matrix is required to
accept tool correctness or U14's shape guard. Hardware/performance validation
of the successors remains explicitly NOT RUN and is required before making
any new corresponding measurement claim. A future requested hardware run must
freeze its authority first and use separately identified output paths.

### Receipts, recovery and retry limits

For every gate retain command/cwd, start/end/duration, exit, selected/skipped
counts, expected invariant, input/build/environment identities and cleanup.
Capture complete discovered membership before execution; missing original
identity cannot be reconstructed later as if recorded at run time.

Before installer/native mutations, journal owned resources and original state,
using PID plus creation time and executable identity for process ownership.
Preserve user data, rules and installs; use existing refusal/backup/restore paths
and disposable roots. Verify restoration on success, failure and interruption.
Never delete a backup just because a test failed. Unverified cleanup blocks
acceptance. Keep host-specific inventories/digests private and content-free
public summaries under the evidence policy.

Distinguish defect, fixture, preparation/environment and cleanup failure. Allow
one infrastructure retry only after a concrete changed condition, and at most
two source-correction review loops for the same contract before replanning.
Never repeat expensive stages until green. Observe a verified running job
instead of launching a duplicate; record stage/progress/watchdog and diagnose
a stall before cancellation using existing ownership rules.

## 9. Risks and rollback

- Recovery UI must not spend or renew a restart allowance; Stop still invalidates
  identity before cleanup. A diagnostic string is insufficient proof of close.
- Positive current output confirms render accounting, not physical audibility.
  Do not accept obsolete activation/unit receipts or advance on zero output.
- Reader retries must not resurrect superseded navigation or overwrite a precise
  bookmark. Fresh language probing must not erase a newer explicit choice.
- Range recognition must remain bounded and preserve prose dashes. WebP changes
  should reject contradictory animation evidence without rejecting valid static
  files or weakening dimensions/pixel admission.
- Batch cancellation must stay responsive; a lock around blocking receive would
  introduce a deadlock. Teardown must target the captured process, not a successor.
- Native removal must preflight the entire managed chain/set before deletion.
  A canonical in-root path alone is not proof that the package owns that path.
- Receipt changes cannot manufacture lifecycle success, overwrite historical
  evidence, skip cleanup, or silently attest signing/publication readiness.
- Default-only CUDA probing must not admit an invalid ordinal 0 or weaken the
  global report guard. Retained TOC attributes must neither bypass the shared
  budget nor double-charge XML, hidden text or unused fallbacks.
- New v13/v2 identities prevent changed cleanup semantics from being presented
  as old official results. Reject cross-version inputs/receipts before launch;
  no historical GPU result grants CPU admission under the new authority.
- Handoff acknowledgement must not introduce a deadlock or unbounded queue.
  Cleanup failure must stop subsequent work; a lost thread handle or a swallowed
  error is not successful teardown even when measured residue happens to be zero.
- U14 hardens mutable code only. Keep installed-v7 provenance explicit and do
  not claim its frozen module was patched or that a new runtime was validated.

Rollback is a reviewed reversal of this plan's exact patch, preserving any
unrelated edits; no reset/clean is authorized. Generated artifacts are rebuilt
only through existing commands after restoring source inputs. Retain old
receipts and backups until restoration has been verified. Stop and revise the
plan if a correction requires a new model, installed package authority, algorithm
or runtime/public contract beyond the explicitly scoped v13/v2 maintainer-tool
and lifecycle-receipt contracts.

## 10. Progress log

- 2026-11-09: Execution authorized by the pasted instruction. Found a clean
  checkout on main at the production baseline; switched to the existing planning
  branch at exact documentation commit d375ecc without production drift.
  Started one implementation worker on U11 and one reusable Astra high reviewer.
  Per-unit local reviews precede dependent work; final integrated acceptance is
  still required. No implementation Git delivery is authorized.

- 2026-11-09: U11 reproduced two evidence-index bypasses, then passed 34
  tests and the current evidence guard. DCR-25 passed local review
  [DCR-U11-R1-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U11-R1.md).
  [Host receipt](../evidence/deep-chat-audit/u11-dcr-25-execution.md).
- 2026-11-09: U7 reproduced four model-free worker ownership and controller
  lifetime failures. The final local selection passed all 44 tests, including
  concurrent cancellation, stale response suppression, and exact cleanup retry.
  [Host receipt](../evidence/deep-chat-audit/u7-dcr-08-13-execution.md).
  DCR-08 and DCR-13 passed local review
  [DCR-U7-R2-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U7-R2.md).
  R2 supersedes [withdrawn R1](../evidence/deep-chat-audit/review-U7-R1-withdrawn.md)
  after a report-only transcription error. The patch did not change.
- 2026-11-09: Confirmed the planned v13 and handoff-v2 authority paths are
  unoccupied. U15 reproduced legacy v4 close-error loss despite zero sampled
  residue and the live monitor left behind by factory or load failure.
  The model-free successor selection passed 34 tests. Scoped Ruff, mypy and
  Prettier checks passed.
  [Host receipt](../evidence/deep-chat-audit/u15-dcr-17-18-execution.md).
- 2026-11-09: [U15 R1](../evidence/deep-chat-audit/review-U15-R1.md) requested
  retention of the adapter's primary diagnostic and complete GPU schema
  validation before v13 CPU admission. Both findings reproduced. The revised
  patch passed 36 model-free tests and scoped Python static checks.
  [Revision 2 receipt](../evidence/deep-chat-audit/u15-dcr-17-18-execution-r2.md).
  [U15 R2](../evidence/deep-chat-audit/review-U15-R2.md) locally approved
  DCR-17 and DCR-18. V13 remains unmeasured.
- 2026-11-09: U9 reproduced partial effective firewall admission and three
  invalid shutdown stdout tails. Both owner suites passed all 74 tests after
  the correction, including the real synthetic PowerShell and pipe controls.
  [Host receipt](../evidence/deep-chat-audit/u9-dcr-11-12-execution.md).
  [U9 R1](../evidence/deep-chat-audit/review-U9-R1.md) locally approved the two
  JS callers of DCR-11 and DCR-12.
- 2026-11-09: U10 reproduced the handoff watchdog gap, the unacknowledged
  native restart and the Python handoff firewall gap. V2 passed 38 Python
  tests and six selected native tests, including the disposable four-boundary
  pipe exchange. Scoped Python, Rust and JSON static checks passed. No
  hardware evaluation ran.
  [Host receipt](../evidence/deep-chat-audit/u10-dcr-11-21-22-execution.md).
- 2026-11-09: [U10 R1](../evidence/deep-chat-audit/review-U10-R1.md) found the
  offline v2 validator accepted a relabeled historical v1 result. The
  rejection regression reproduced. The revised authority checks the
  execution commit and passed all 38 affected Python tests.
  [Revision 2 receipt](../evidence/deep-chat-audit/u10-dcr-11-21-22-execution-r2.md).
  [U10 R2](../evidence/deep-chat-audit/review-U10-R2.md) locally approved
  DCR-21, DCR-22 and the final DCR-11 caller. V2 remains unmeasured.
- 2026-11-09: U8 reproduced a status-only lifecycle evidence promotion and
  uncaught bind failures from either ordinary journey port reservation. The
  correction verifies the lifecycle receipt against the installer and waits
  for both reservation owners to settle before restoration.
  The final 16 affected host tests passed, including the real synthetic
  PowerShell roundtrip and both asynchronous reservation failures.
  [Host receipt](../evidence/deep-chat-audit/u8-dcr-05-14-execution.md).
  [U8 R1](../evidence/deep-chat-audit/review-U8-R1.md) locally approved
  DCR-05 and DCR-14. Exact-installer G10 remains pending.
- 2026-11-09: U4 reproduced nine mutable Celsius range expansions and
  preserved the four passing inverse controls. Public preparation loads the
  package's compiled exports, so the first candidate's public selection used
  stale output. A scoped configured EPUB build refreshed it and all 13
  focused cases passed. U13 will invalidate the EPUB export before final G0.
  [Host receipt](../evidence/deep-chat-audit/u4-dcr-09-execution.md).
  [U4 R1](../evidence/deep-chat-audit/review-U4-R1.md) locally approved DCR-09.
- 2026-11-09: U13 reproduced six TOC attribute undercounts, including both
  renditions in a public shared-budget fixture. Seven focused cases, 50
  navigation/budget controls and scoped EPUB type checking passed.
  [Host receipt](../evidence/deep-chat-audit/u13-dcr-07-execution.md).
  Astra locally approved the exact U13 patch in [DCR-U13-R1-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U13-R1.md).

- 2026-11-09: Revalidated 25 static cases, prior individual reports and related
  current source. Preserved case 02's withdrawal and the policy/defensive limits.
- 2026-11-09: U5 reproduced four early WebP-marker admission failures.
  [Host evidence](../evidence/deep-chat-audit/u5-dcr-15-execution.md) records
  58 raster tests, one Chromium journey, and the G0 export rebuild.
  [DCR-U5-R1-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U5-R1.md)
  locally approved the exact patch and binds the receipt-status supplement.
- 2026-11-09: U2 reproduced a missing mounted StrictMode settlement.
  [Host evidence](../evidence/deep-chat-audit/u2-dcr-03-execution.md) records
  three focused and 67 reader/restorer passes. [DCR-U2-R1-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U2-R1.md) approved the exact local patch.
- 2026-11-09: U3 reproduced the lost saved Aiden selection in Chromium.
  [Host evidence](../evidence/deep-chat-audit/u3-dcr-23-execution.md) records
  the repaired restore/language journey and 280 selected owner tests.
  [DCR-U3-R1-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U3-R1.md) approved the exact local patch.
- 2026-11-09: U1 reproduced all five behavioral boundaries on unchanged
  production. [Host evidence](../evidence/deep-chat-audit/u1-dcr-01-06-10-20-24-execution.md)
  records the 19 current focused cases, owner tests and both Chromium journeys.
  [DCR-U1-R1-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U1-R1.md) approved all five local cases.
- 2026-11-09: U12 reproduced the secondary CUDA query on the unchanged
  enumeration through an instrumented native-call seam. [Host evidence](../evidence/deep-chat-audit/u12-dcr-04-execution.md)
  records three focused and 28 native host-profile passes. [DCR-U12-R1-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U12-R1.md) approved the exact local patch.
- 2026-11-09: U6 reproduced premature deletion or redirection through three
  actual Windows junction fixtures. [Host evidence](../evidence/deep-chat-audit/u6-dcr-19-execution.md)
  records 76 current owner passes including repaired junction retry controls.
  [DCR-U6-R1-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U6-R1.md) approved the exact local patch.
- 2026-11-09: U14 reproduced seven pre-transfer shape-admission failures
  on the mutable adapter with synthetic tensors. [Host evidence](../evidence/deep-chat-audit/u14-dcr-16-execution.md)
  records nine focused and 71 owner/provenance passes. [DCR-U14-R1-ASTRA-20261109-01](../evidence/deep-chat-audit/review-U14-R1.md) approved the exact local patch.
- 2026-11-09: M2 rebuilt workspace exports with the full base TypeScript
  configuration and compiler bound. The earlier U5 export receipt lacked
  those original identities. EPUB, desktop, Python, Node and Chromium
  combined gates passed on current inputs. Initial Clippy found U12's test
  module ahead of later production items. [The bounded R2 receipt](../evidence/deep-chat-audit/u12-dcr-04-execution-r2.md)
  and [Astra R2 approval](../evidence/deep-chat-audit/review-U12-R2.md) bind
  the test-only relocation and renewed Rust tests, formatting and lint.
- 2026-11-09: Paused safely at user request. The already-started exact Piper
  leaf exited 1 at the availability wait and its owner cleanup was verified.
  No later gate started. [The execution ledger](../evidence/deep-chat-audit/execution-ledger.md)
  records the matching-driver startup pass, unresolved timeout and remaining gates.
- 2026-11-09: Resumed on user instruction. All 114 pause-manifest paths,
  HEAD, empty index and normal-host inventory matched. The default executable
  was finding an ignored adjacent Piper package whose manifest differed from
  its embedded authority. The native loader rejects that package before it
  can consider the configured development interpreter. The retry journals
  and temporarily holds the exact stale generated folder, then restores it.
- 2026-11-09: Read current planning/review/reuse requirements, prior CAF/CCF/RCF/
  EBC command/acceptance records, and available original CCF/EBC receipts.
  Recorded concrete reuse candidates and invalidation boundaries; no historical
  result has been accepted as current execution evidence.
- 2026-11-09: Found that DCR-22's cleanup delay is explicitly frozen by handoff
  v1. The initial plan deferred it and selected 18 corrections; the decision
  below supersedes that initial scope without changing historical authority.
- 2026-11-09: Created the planning branch and drafted this plan plus active-index
  entry. No production/test/configuration file changed and no product tests,
  benchmarks, builds, installer or model command ran.
- 2026-11-09: Committed the initial planning documents as `3e7b1c9`. The user
  then delegated decisions for the seven omitted cases. Rechecked their actual
  callers, policies, packaging provenance and frozen-version constraints.
- 2026-11-09: Included default-only CUDA, retained TOC attribute accounting,
  mutable shape hardening, Qwen v13 and handoff v2 tooling. Kept 02 withdrawn.
  Expanded 11 to its same faulty handoff predicate and 17 through final viability
  derivation. The revised map has 23 correction/policy cases plus one hardening;
  hardware re-evaluation and installed-v7 changes remain outside scope.
- 2026-11-09: Grouped 17/18 into U15 and 21/22 into U10; extended the existing
  combined EPUB/Python/Rust gates. No product tests or implementation ran during
  this decision pass. Prior runtime PASS remains historical, not current proof.

## 11. Discoveries and decisions

- Keep the same 25 IDs; the signed Celsius endpoint and inverse replacement
  admission are extensions of 09/20, not inflated independent findings.
- DCR-02 preserves CAF R4.1. The delegated decisions for 04/07 are explicit
  amendments to maintained policies, with the constraints in section 6.
- DCR-16 has no current engine trigger and is intentionally preventive. It is
  included in mutable code, with no misleading installed-v7 completion claim.
- Frozen authorities require versioning, not exclusion from this ExecPlan.
  U15's v13 and U10's v2 are implementation scope; old authorities/results stay
  immutable and new hardware outcomes stay unmeasured. Increasing a sleep or
  merely adding a cleanup diagnostic would not solve the relevant boundary.
- The handoff firewall predicate is another instance of 11. Reuse its existing
  corrected Python owner instead of introducing another independent predicate.
- Prepared payload reuse is the main available cost reduction. Current behavior
  tests on changed owners remain necessary; cheap unchanged unrelated suites
  are omitted by scope rather than described as recycled acceptance.
- No whole-repository baseline or repeated aggregate checks are planned.
  One final selected group covers overlapping edits, with targeted reruns after
  review only when consumed inputs change. Preserve all required host boundaries.
- This documentation-only planning patch has no implemented behavior or contract
  effect and is exempt from behavioral `change_reviewer` acceptance. Future
  corrections require that independent review with actual host evidence.

## 12. Final validation results

**Implementation: COMPLETE. Independent integrated acceptance approved.**

All 15 units are locally approved. The [execution ledger](../evidence/deep-chat-audit/execution-ledger.md)
records all 25 dispositions, exact host results, preserved failures and
restoration evidence. The renewed G8 startup and Piper commands passed
under the independently approved harness. G9 exact local admission passed
with separate verified wrapper recovery. G10 verified-core build and the
exact-installer lifecycle passed, and independent recovery restored the
original profile objects after the initial wrapper could not. Final G11
receipts bind the approved candidate. [G12 R2](../evidence/deep-chat-audit/review-G12-R2.md)
accepted all 25 dispositions. DCR-02 remains withdrawn with its checkpoint
controls preserved. DCR-16 is mutable-adapter hardening and does not change
installed Chatterbox v7. G9 did not perform inference. Qwen v13 and handoff v2
remain unmeasured on real hardware. Synthetic CUDA tests do not establish
physical multi-GPU compatibility. The installer remains unsigned-local, and
antivirus, publication and shell pin or jump-list restoration are outside the
verified results. The earlier Piper cleanup failure's initiating cause
remains unproven.


Planning-only documentation validation of the revised plan on 2026-11-09 used
normal local PowerShell outside the sandbox: `node scripts/check-evidence.mjs`
(the configured `check:evidence` leaf) passed; `git diff --check` passed; relative-
link inspection found all 33 local targets. Structural inspection confirmed
the 25 unique case rows and 12 required sections. Final staged whitespace,
exact two-path scope and evidence checks are required before the authorized
local documentation commit.

## Authorized validation closeout

The user authorized a supplemental G8 runner correction and one new exact
Piper execution after independent approval. The three owned files are
`native-startup-smoke.mjs`, `native-smoke/resource-observation.mjs` and
`native-smoke.node-test.mjs`. This work repairs the validation harness and
does not change the 25 case dispositions. Renew native startup evidence
because it uses the same cleanup path. Retain every prior failure and use
the verified default executable only with matching build/runtime inputs.
The [supplemental execution receipt](../evidence/deep-chat-audit/g8-cleanup-execution.md)
binds the model-free checks and exact review inputs.

The user also authorized one G10 lifecycle invocation with the pre-run host
state recorded privately and backed up for exact restoration, including on
failure. The user accepted possible Start/taskbar unpinning.
The receipt had to match the exact installer and the lifecycle cleanup had
to pass before G10 acceptance. The subsequent G12 R2 approval includes
both the canonical result and the separate profile recovery.

### Safe pause after renewed G8

The user requested a safe pause while the authorized Piper operation was
already active. Its bounded cleanup finished and the wrapper exited 0.
Independent host observation matched the pre-run inventory. No later
operation started. The G10 lifecycle authorization remains available on
resume. Its recovery wrapper is preparation only, and the pre-run host state
was unchanged. Finish its read-only preflight and verify
the installer and recovery journal before one canonical lifecycle run.
Then refresh G11 on the actual integration snapshot and request G12 from
the coordinator. Preserve both prior G8 failures and the initial G10 build
failure alongside their passing successors.

### Resumed G10 and integration freeze

The normal-host checkpoint and all 119 paused path identities matched.
The existing exact installer and release-locked executable were reused.
Only three independently reviewed native-smoke harness files differ
from the original build input inventory, and the installer build does
not consume those files.

The canonical lifecycle exited 0 and emitted an exact-installer receipt
covering six cases. The outer restoration wrapper exited 1 because
installer-generated state occupied a restoration destination and pre-run
metadata differed. A separate ownership-checked recovery restored the
pre-run host state exactly. The failure, successful command and
verified recovery remain distinct in the [execution ledger](../evidence/deep-chat-audit/execution-ledger.md).
The current profile's Start/taskbar pin and jump-list history were
outside the exact restoration proof.

G11 evidence and the closed worktree manifest were retained for G12.
Source, tests and documentation were frozen until the independent verdict.

### G12 documentation correction

[G12 R1](../evidence/deep-chat-audit/review-G12-R1.md) found one documentation
gap. ADR-0063 now preserves the October 26 enumeration decision and records
the ordinal-0-only policy and current DCR-04 validation in a November 9
amendment. The completed narration-logic plan remains the original decision's
validation record. No runtime, test or completed-plan file changed for this
revision. The G11 guard, whitespace and changed-link receipts are refreshed
for revision 2. Runtime reuse depends on the recorded input, tool and artifact
comparison. G12 R2 subsequently approved the revised patch.
