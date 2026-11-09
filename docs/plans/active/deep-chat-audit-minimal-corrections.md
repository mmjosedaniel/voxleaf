# Deep chat audit: minimal corrections and evidence reuse

Status: **Planning only. Implementation and test execution have not started.**

Planning date: 2026-11-09. Inspected source baseline:
`75deb2c9bda2f34dfa72fbd947a0fbf05fd3542a` (`main`). Planning branch:
`codex/deep-chat-audit-execplan`.

The current authorization covers this plan, its active-index entry, branch
creation and one local documentation commit. It explicitly excludes executing
the plan. Future implementation requires a new instruction; that instruction
does not automatically authorize implementation commits, push, PR, merge,
publication, signing or new benchmark/model promotion.

This plan spans M003-M011 and therefore has a descriptive filename, following
[PLANS.md](../../../.agents/PLANS.md). Case numbers below preserve the 25-case
order from five static searches and their individual investigations. `DCR-09`
means case 09 in this plan, not a similarly numbered case in CCF, CAF or EBC.

## 1. Goal

Correct the supported remaining failures with the smallest changes at their
existing owners. Preserve successful earlier corrections, explicit product
policies and frozen evaluation authorities. Establish a failing regression
before each production correction, then reuse that regression for acceptance.

The initial implementation scope contains **18 correction candidates**:
01, 03, 05, 06, 08-15, 19-21 and 23-25. Case 02 is withdrawn; 04 and 07 preserve
existing policy pending a separate design decision; 16-18 and 22 are deferred
as described below. Every candidate is static until reproduced on the execution
checkout. A disproved candidate receives an evidence-backed no-change decision.
Do not force a patch or claim that all 25 cases were bugs or were fixed.

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
| DCR-04 | Failure reading a secondary CUDA ordinal discards valid ordinal-0 facts, makes the report partial and can block CPU admission too. | **PRESERVE POLICY.** NLC-04/ADR-0063 retains every ordinal or fails closed. A future default-ordinal-only proposal must amend that decision and retain failure of ordinal 0; no GPU-selection change here. |
| DCR-05 | The evidence alias supplies a lifecycle PASS constant; `createPackageEvidence` promotes it without a lifecycle receipt bound to that installer. | M011 recorded manually paired runs; that procedure is not enforced by the alias. U8 binds an actual successful lifecycle receipt, retaining the separate Chatterbox journey and signature requirements. Historical receipts are not declared false. |
| DCR-06 | Pause changes activation before queued `started` arrives; a later `paused` receipt has positive output frames but rendering is false, so partial start/checkpoint publication is lost. | RIA-03, CCF-C20, CLB-02 and CAF R7.3 cover different render/end/clock paths. U1 consumes positive current-unit output evidence once without restarting the paused clock or inferring physical speaker audibility. |
| DCR-07 | EPUB3 TOC retained image alt/title fallback does not charge the shared decoded-text counter. | **PRESERVE SCOPE.** EBC C13/ADR-0007 charges admitted semantic image descriptions. TOC labels have independent limits. Define retained TOC attribute accounting before extending the budget; avoid double-charging XML text and eclipsed titles. |
| DCR-08 | Blocking batch receive lacks streaming's generation identity and can tear down the same Process concurrently with Cancel. | RCF-22 corrected streaming ownership. U7 extends concrete attempt ownership to batch cancellation and idempotent teardown without holding a lock across blocking receive. |
| DCR-09 | `20 °C – 25,5 °C` and `20 °C – −5 °C` can expand the first endpoint because the right-neighbor recognizer accepts digits only. | CCF-C18 protects integer ranges and separators. U4 preserves the whole unsupported decimal/signed range, source mapping and bounded lookahead; no new number expansion. |
| DCR-10 | After PCM acceptance, synchronous sink failure enters a catch that calls `failActiveSynthesis` with no active synthesis; `invalid-state` masks the error and a derived finally promise rejects unobserved. | MPA handles processor/preparation failures. U1 routes the typed sink failure to playback containment and settles only an owned active action. A later tick may already clean up, so do not assert an inevitable leak. |
| DCR-11 | Bilingual and adapter-layout host firewall predicates accept partial restrictions rather than proving the effective unrestricted outbound block. | CAF R3.5 corrected Python preflight only. U9 checks effective store, profiles/service and rule filters using the actual PowerShell boundary, without modifying user firewall rules. |
| DCR-12 | The adapter host accepts `stopped` plus process close/code 0 despite trailing malformed/partial/extra stdout records. | Service-layout and cleanup fixes did not validate terminal reader state. U9 requires clean final framing after stdio close while preserving queued `protocolRejected` delivery on the malformed-input route. |
| DCR-13 | Batch controller marks itself active before initial clock/resource reads outside finally; an exception leaves it permanently busy. | Existing batch evaluation history does not fix controller lifetime. U7 protects acquisition and measurements while preserving the original exception and unrelated identity ownership. |
| DCR-14 | Loopback reservation has no error handler; an asynchronous bind error can terminate Node after backup/install, bypassing restoration. | SAF-01/RAC-03/CCF-C04 cover other spawn/restoration paths. U8 fixes only reservation/listener ownership and propagates failure into the existing finalizer. |
| DCR-15 | An early ANIM/ANMF marker sets animated=true, then a later VP8X can overwrite it with false and admit malformed input as static. | U5 makes animation evidence monotonic or rejects the contradictory order. This proves predecode rejection only, not an animation exploit accepted by the real decoder. |
| DCR-16 | Chatterbox flattens before checking dimensionality, so hypothetical multichannel output could become concatenated mono. | **DEFER.** The pinned engine returns valid `(1,N)` mono; no admitted multichannel trigger was found. At the next runtime change, validate `(N,)`/`(1,N)` before flattening and reject other shapes. Frozen packaged modules need a versioned successor. |
| DCR-17 | Official Qwen v4 stores a close failure in terminal_code after its last consumer, omitting it if residue is zero. | **DEFER TO A NEW EVALUATION VERSION.** Its profile freezes failure/cleanup/conclusion accounting. Record explicit close failure and fail the relevant audit in a successor; preserve rejected historical v4 results. |
| DCR-18 | Official Qwen v4 starts its monitor before candidate factory/load but stops it only on normal completion. | **DEFER WITH DCR-17.** A successor must stop/join after candidate cleanup on every path without replacing the primary error with measurement validation. This is a daemon lifetime inside the historical CLI, not a demonstrated app leak. |
| DCR-19 | Removal rejects root/leaf reparse points but follows an intermediate managed ancestor redirected to a sibling within the root. Containment alone does not prove ownership. | VCA-02 and later removal work protect other links/cleanup states. U6 checks every owned ancestor before mutation. Do not extend the claim to promotion, which already checks its parent. |
| DCR-20 | Replacement during pending containment can reject verified cleanup because the original TTS diagnostic survives; the sticky barrier blocks later books. Conversely, a non-TTS diagnostic can let App accept failed backend cleanup with zero unit counters. | VCA-05, CAF R7.1 and CCF-C07 remain necessary. U1 gives App an explicit idempotent verified-close outcome, independent of failure text, covering both directions. |
| DCR-21 | Handoff CLI waits in its process/reader/queue loop without an overall deadline; the later wait(timeout=5) cannot bound that loop. | MAF-05 strengthened finally but does not make the loop exit. U10 adds a monotonic outer watchdog and bounded draining, retaining owned cleanup and primary failure. |
| DCR-22 | Native handoff emits cleanup, sleeps 50 ms and restarts without observer acknowledgement; late sampling can count the successor as residue. | **DEFER TO A VERSIONED MEASUREMENT FOLLOW-UP.** The 50-ms cleanup delay is explicitly frozen in service-handoff-profile-v1.measurementAuthority, whose invalidation rules require a new version. A successor should use bounded phase-correlated acknowledgement; do not silently replace v1 timing or certify its old receipt again. |
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
| U10 | 21; high tool cleanup | `services/tts/benchmarks/service_handoff_cli.py` and `test_service_handoff_cli.py`; unchanged authority tests as controls. Rust handoff runner/profile/schema/results remain unchanged because 22 is deferred. |
| U11 | 25; low/medium tooling | `scripts/check-evidence.mjs`, `scripts/check-evidence.test.mjs`, and the exact exemption description in `docs/development/evidence-retention.md`. |

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
downloads, performance/quality campaigns and publication. Planned follow-ups
16-18/22 must get separate version/scope decisions before changing those owners.

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

U10's watchdog must bound both outer waiting and inner queue draining and must
not reset on every output line. Derive a conservative execution bound from the
existing finite matrix/timeouts, outside measured successful-case intervals;
do not change matrix order, delays, measurements or accepted historical results.
Keep primary failure and bounded owned process/reader/sampler cleanup. A timeout
without verified cleanup remains failed, never a successful benchmark receipt.

Review the system diagram at closeout. The intended owner/process topology is
unchanged; update it only if implementation actually changes a documented
boundary. Review narration terminology/M005 for U4 without rewriting frozen
history. U8's new evidence contract belongs in maintained release documentation.

## 7. Milestones

### M0: Freeze execution scope and coverage map

**Status: Not started.** After implementation is authorized, re-read this plan
and current HEAD/worktree; preserve unrelated work. Resolve path ownership and
record source/test/configuration identities before edits. Verify all 18 triggers
are still reachable and retain the seven no-change/versioned dispositions.

Map each assertion below to existing tests before adding anything. Retrieve
original receipts before considering reruns; missing proof is not PASS. Record
RUN, REUSE-CANDIDATE or NOT-APPLICABLE with dependencies and exact commands.
Inspect relevant locks/tool versions, browser/driver readiness and cached
runtime payload identities without downloading or rebuilding by default.

Acceptance: closed case/unit/path and gate maps; reproducible input for each
candidate; no product edit or old PASS accepted without its prerequisite proof.
Do not run a whole-repository pre-change suite.

### M1: Reproduce and minimally correct owned units

**Status: Not started.** Use one writer, sequentially. Suggested order is
U11, U7, U9, U10, U8, U4/U5, U2/U3, U1, U6; an owner dependency can justify a
recorded reorder. U1 and U6 require the highest review attention. Source changes
remain provisionally implemented until all applicable integration gates pass.

For each unit run only its new focused regressions against unchanged production
code, capture the intended failure, make the smallest correction, and rerun the
same selection. A fixture failure is not a defect reproduction. If the trigger
cannot be reached, stop that correction and record the narrower conclusion.

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
| U10 | A silent live child, continuously produced lines and a retained output reader reach one fixed watchdog; failure/interruption releases owned child/samplers or reports incomplete cleanup. Preserve valid event/matrix derivation and primary exception. Use a disposable synthetic subprocess and controlled samplers. |
| U11 | Historical unchanged local deletion still passes; staged modification plus local deletion fails; staged deletion, staged-new local deletion, neighbor paths, mode changes and read errors retain their intended behavior. Use isolated temporary Git repositories. |

Acceptance: each retained correction has correctly attributed RED/GREEN receipts
and a bounded diff. No unit acceptance claims cover pending integration/cleanup.

### M2: Combined current-state validation

**Status: Not started.** Freeze final overlapping production/test inputs, build
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

**Status: Not started.** Freeze code/tests/docs and supply one `change_reviewer`
with the exact patch, full HEAD/path/blob/content identities, case decisions,
RED/GREEN and final host receipts, reuse proofs and restoration evidence.
Pause writing and Git mutations during review. Resolve actionable findings,
rerun only invalidated gates and obtain a new immutable APPROVE for the exact
current patch. Missing evidence/reviewer is BLOCKED, not acceptance.

Record all 25 dispositions, remaining uncertainty and actual commands. Review
the system diagram and maintained behavior docs. Archive only after the 18-case
scope and required acceptance are complete; preserve deferred cases explicitly
and link any separately approved successor plan. This does not mean every
historical concern is fixed. Future Git delivery needs its own authorization.

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
   No current Python packaged service module is planned to change; benchmark
   modules are separate. Verify that fact against the actual builder closure.
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
| G0 | Current workspace exports before consumers | `pnpm.cmd build:packages` once after U4; rebuild only if EPUB/shared/build inputs change. A verified identical shared output can be reused. |
| G1 | Actual missing behavior before/after each unit | Select new `DCR-`/`dcr_` cases in the existing Vitest/pytest/Node/Rust runners below. Keep failed assertions and fixture errors distinct. No broad pre-change rerun. |
| G2 | Mutable narration, source ranges and resource bounds | Combined EPUB command below after final U4 and current exports. Changes to its transitive preparation closure invalidate it. |
| G3 | UI, player, settings, persistence and raster ownership | Combined desktop command below after U1-U5. Shared files/tests make this one final group, not five repeated suites. |
| G4 | Tool ownership and real PowerShell/Node boundary | Selected Python and Node commands below after U7-U10. Synthetic processes, streams/rules and temporary roots; no model/firewall mutation/real installer in unit tests. |
| G5 | Native containment/removal in both feature modes | `pnpm.cmd test:rust` once after U6 and current embedded core authority. Preserve Windows junction and supervisor controls; ignored tests remain ignored, not passing host evidence. |
| G6 | Browser event ordering, StrictMode placement, real worklet and settings | Selected Playwright command below once after final exports/source. Add three cohesive DCR journeys: initial restore/language settlement; output receipt/Pause/Stop/recovery cancellation; A→B→C verified close. Add a small WebP rejection assertion to existing raster coverage if needed. Do not use the full browser matrix. |
| G7 | Current format/lint/types | Configured TS, Python and Rust commands below once after their final inputs. Global scanners are invalidated by any relevant discovered-file change; scoped follow-up checks need an explicit coverage proof. |
| G8 | Current artifact and packaged WebView2 playback | `pnpm.cmd package:piper-core:check`; `pnpm.cmd build:desktop`; then existing startup/Piper leaves below on that exact binary. Reuse payloads, not the old executable. Renew if frontend/native/imported artifact inputs change. |
| G9 | Exact optional cleanup/admission and restoration | `pnpm.cmd test:chatterbox:v7:local-admission` once for U6 using verified local artifacts. This is not model inference or a new download. Its old ~12-minute PASS cannot accept changed removal. |
| G10 | Lifecycle receipt producer bound to final installer | `pnpm.cmd package:windows:verified-core`, then `pnpm.cmd package:windows:lifecycle` once, with owned recovery journal and exact NSIS identity. Capture the new receipt only after cleanup. Synthetic consumer tests cover matching/mismatching paired receipts; do not claim a current full Chatterbox journey or public-release PASS. |
| G11 | Evidence/index behavior and docs | `pnpm.cmd test:evidence` once after U11, then `pnpm.cmd check:evidence`, `git diff --check` and changed-link inspection on final docs/patch. Repeat the guard on the final index if future staging is authorized; no need to rerun unchanged synthetic tests for that staging. |
| G12 | Independent acceptance | Current immutable `change_reviewer` APPROVE covering the exact patch, actual/reused gate evidence and complete host restoration. Any patch drift requires a new assessment and only affected reruns. |

G2:

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
```

G3 (retain the named owner controls; add a suite only for an uncovered changed
responsibility, or remove one only with an explicit dependency argument):

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/images/raster-image-policy.test.ts src/reader/images/raster-image-source.test.ts src/settings/narration-settings-actions.test.ts src/tts/hardware-profile-compatibility.test.ts src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/pcm-playback.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts
```

G4:

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_benchmark_batch_execution.py services/tts/tests/test_benchmark_batch_matrix.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_service_handoff_cli.py services/tts/tests/test_service_handoff_authority.py
node --test apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs
```

The official-batch tests above are model-free compatibility controls for shared
batch helpers; they do not execute or redefine official v4 evaluation. If U8
needs a new receipt helper, exercise its actual PowerShell implementation from
the existing Windows Node suite, not a separately implemented JS imitation.

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
benchmarks merely to observe a healthy shutdown. U10 uses a real disposable
child plus fake measurements to test the watchdog, preserving frozen successful
measurement semantics. If implementation changes a successful measurement or
the production protocol, stop for a versioned follow-up; do not reuse v1 PASS.

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
- Frozen Qwen/handoff policies remain deferred. The discovery that handoff's
  50-ms delay is frozen prevents an in-place handshake change for DCR-22.

Rollback is a reviewed reversal of this plan's exact patch, preserving any
unrelated edits; no reset/clean is authorized. Generated artifacts are rebuilt
only through existing commands after restoring source inputs. Retain old
receipts and backups until restoration has been verified. Stop and revise the
plan if a small correction requires a new model, schema, package authority,
algorithm or broader runtime contract.

## 10. Progress log

- 2026-11-09: Revalidated 25 static cases, prior individual reports and related
  current source. Preserved case 02's withdrawal and the policy/defensive limits.
- 2026-11-09: Read current planning/review/reuse requirements, prior CAF/CCF/RCF/
  EBC command/acceptance records, and available original CCF/EBC receipts.
  Recorded concrete reuse candidates and invalidation boundaries; no historical
  result has been accepted as current execution evidence.
- 2026-11-09: Found that DCR-22's cleanup delay is explicitly frozen by handoff
  v1. Classified it as a versioned follow-up; initial scope is 18 corrections.
- 2026-11-09: Created the planning branch and drafted this plan plus active-index
  entry. No production/test/configuration file changed and no product tests,
  benchmarks, builds, installer or model command ran.

## 11. Discoveries and decisions

- Keep the same 25 IDs; the signed Celsius endpoint and inverse replacement
  admission are extensions of 09/20, not inflated independent findings.
- DCR-02 preserves CAF R4.1. DCR-04/07 require a separate requirement decision;
  existing policy is not silently converted into a bug fix.
- DCR-16 lacks a current engine trigger. DCR-17/18 belong to a frozen rejected
  evaluation; DCR-22 changes frozen measurement timing. Their successor work is
  specified in the register, not authorized as an in-place historical rewrite.
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

**Implementation: NOT STARTED. No finding is marked fixed by this plan.**

M0-M3, all RED/GREEN reproductions, current behavior checks, artifact comparisons,
builds, browser/native/installer execution and independent implementation review
remain pending. The planning investigation did not run them.

Planning-only documentation validation on 2026-11-09 used normal local
PowerShell outside the sandbox: `node scripts/check-evidence.mjs` (the configured
`check:evidence` leaf) passed; `git diff --check` passed; relative-link inspection
found no missing targets. Final staged whitespace, exact two-path scope and
evidence checks are required before the authorized local documentation commit.
No test suite or implementation milestone ran. These checks do not execute this
ExecPlan and are not runtime acceptance. A later executor must replace the
pending implementation results with exact RUN/REUSED/NOT-APPLICABLE outcomes,
immutable evidence and remaining dispositions, not historical PASS counts.
