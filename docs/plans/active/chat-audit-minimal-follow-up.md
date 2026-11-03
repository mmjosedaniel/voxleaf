# Minimal follow-up to the eight chat audit rounds

Status: **Planned; implementation and acceptance have not started.**
Created: 2026-11-03. Case prefix: `CAF`.
Planning base: `7820db65e372eee6987954935ab3f79202765f1a` (`main`, after #304).
Planning branch: `codex/chat-audit-minimal-follow-up-plan`.

The current authorization covers this ExecPlan, its indexes, a branch and a local
commit. It does **not** authorize executing the plan, changing runtime code,
running its tests, pushing, opening a PR, merging or publishing. Later execution
requires the user's instruction. Commands below are future work, not run results.

## 1. Goal

Correct the remaining demonstrated defects from this chat with the smallest
cohesive changes, preserving previously accepted behavior. Retain an explicit
disposition for every original finding, including those withdrawn or narrowed
after reading earlier ExecPlans, the 34 case-agent reports and related code.

The original nine reports comprise rounds 1-8 with two fourth-round reports.
This document calls the second fourth-round report `R4b` to avoid duplicate IDs.
There are 34 original cases: **25 retained defects, one partially valid case
(R8.1), five documented-policy limitations, two unproved contract/capacity risks,
and one conditional audio-clock case**. The first 26 have bounded corrections
below. R7.3 has a verification gate before any production edit. The additional
open-signal candidate N1 is tracked separately, not counted as a confirmed bug.

No claim of zero regression risk is possible. The plan instead identifies the
invariants each correction must preserve and the smallest useful acceptance
evidence. A previous green suite does not disprove a newly identified gap.

## 2. User-visible outcome

- Supported publications obey the same resource budgets during candidate
  selection and release archive ownership on close. Current narration modes
  preserve unsupported numeric compounds and malformed language contexts.
- Reader focus, restored visible position and a late narrator agree with what
  the reader can actually see. Failed Settings actions explain their outcome;
  reinstalling the selected optional voice refreshes availability in the same book.
- A late response cannot stop a replacement service. Verified cleanup can be
  acknowledged again after a lost reply without terminating another owner.
- Optional-package retries preserve the sole recoverable backup and reclaim
  owned staging before measuring disk space. Release tooling reports signature
  and network-isolation evidence truthfully.

Existing limits, terminal recovery policy, frozen evaluation behavior and model
support remain. No new EPUB feature, automatic recovery, model or performance
guarantee is promised by this plan.

## 3. Current state

Planning inspection found a clean worktree and index at the base above. The
findings were rechecked statically; no reproduction or runtime acceptance was
executed for this plan. “Retained” below means the code supports the described
failure path, not that it has been observed in a released user installation.

Much of the surrounding code has already been corrected. Relevant antecedents
are the completed [RCF plan](../completed/revalidated-chat-findings-minimal-corrections.md),
[RAF plan](../completed/residual-audit-corrections.md),
[SPM plan](../completed/settings-packaging-minimal-corrections.md),
[NSL plan](../completed/narration-settings-lifecycle-corrections.md),
[RIA plan](../completed/reader-image-audibility-minimal-corrections.md),
[BNC plan](../completed/narration-boundary-navigation-corrections.md),
[R8 plan](../completed/eight-revalidated-findings-minimal-corrections.md),
[NCC plan](../completed/narration-chatterbox-correctness.md),
[VUC plan](../completed/visible-locator-unicode-compound-corrections.md) and
[service readability plan](../completed/services-function-readability.md).
These records explain prior intent and tests; none accepts an unimplemented fix.

The [roadmap](../roadmap.md) marks M005 complete. Its
[completed plan](../completed/M005-narration-text-preparation.md) owns bounded,
source-mapped preparation, not present-day TTS/playback acceptance. In particular,
`narration-normalizer.ts` is frozen v1 evaluation authority. The mutable bilingual
normalizer serves current Piper/Chatterbox preparation; only that current route
is in scope for R3.2/R8.3. Legacy examples remain a documented limitation.

### Case register: retained corrections

Paths in this register are relative to the repository. Symbols and scenarios,
rather than line numbers, identify the owning behavior at the planning base.
`U1`-`U7` refer to the implementation units in section 7.

| Case / unit | Validated failure and earlier treatment | Minimal correction and regression boundary |
| --- | --- | --- |
| R1.1 / U5 | `services/tts/src/voxleaf_tts/adapters/piper.py` materializes the synthesis iterator as a tuple before the collector enforces its PCM cap. SFR-PIPER deliberately preserved this during a behavior-preserving refactor; current adapter tests do not prove bounded iteration. This is not proof of infinite generation or an observed OOM. | Collect incrementally and stop/close the iterator at the existing bound. Preserve waveform conversion, resampling, cancellation, exceptions and both voices. Prove that a later sentinel chunk is never requested after rejection; account for the already-produced chunk. |
| R1.2 / U1 | `packages/epub/src/public/open-epub-publication.ts` projects a rejected-layout rootfile but skips `createRasterResourceCatalog`, so its resource declarations escape the shared 32 MiB raster budget. RCF-03 addressed other admission work; the ZIP's 64 MiB limit is a different bound. | Apply the same metadata-only resource admission before discarding a candidate. Share existing accounting; do not decode images or count a candidate twice. Fixed-layout-first/reflowable-second fixtures must respect exact-limit and plus-one behavior. |
| R1.3 / U4 | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` snapshot discovery misses staging-only residue after a new manager starts; the UI reports Absent and hides removal. RCF-13 intentionally made polling read-only. | Include owned residual staging in idle cleanup state under existing admission/operation locks. Polling must remain read-only; a valid active install must not be demoted or deleted. |
| R1.4 / U3 | `OptionalChatterboxControls.tsx` awaits removal with `finally` but no owned rejection feedback when the Settings Stop barrier rejects. NSL-01/RCF-05 correctly require containment first. | Catch the rejection at the action owner and show fixed accessible feedback. Preserve Stop-before-remove, no native removal or refresh after failure, retry clearing, and stale-owner suppression. |
| R1.5 / U6 | `scripts/build-windows-release.ps1` labels every unsigned-mode result other than `Valid` as unsigned-local, including invalid or indeterminate signatures. M011 release tests did not exercise this classification. No incorrectly released artifact was demonstrated. | Require `NotSigned` for both artifacts in unsigned mode and `Valid` for both in signed mode. Reject all other combinations before writing checksums/evidence. Exercise the real classification function with synthetic signature results; do not sign or publish an installer. |
| R2.1 / U2 | `apps/desktop/src/tts/process-client.ts` lets an old cancel's `invalid-state` catch call shutdown on the current instance. The coordinator's timed-out cancellation, verified Stop, explicit Settings recheck and subsequent Play permit a same-client replacement before that rejection arrives. #226's same-instance fallback remains necessary. | Bind the fallback to the captured request/invalidation/service owner and recheck after awaits. Preserve valid same-instance containment. The separate claim that an old successful acknowledgement kills B was refuted: the existing foreign-instance guard covers it. |
| R2.3 / U1 | `archive/archive-inventory.ts` retains the zip reader and entry map after close. A caller retaining the closed handle can retain the input bytes; `resource/opened-publication.ts` already waits for resource shutdown. M003's close contract supplies the intended release boundary. | Clear both private ownership references only after pending readers settle. Keep immutable metadata and idempotent close. Do not zero caller-owned bytes or use nondeterministic GC timing as the oracle. No growing desktop leak was measured. |
| R2.4 / U2 | `process-client.ts` contains an invoke rejection but lets a `validateAudio` exception leave the active request and generating state behind. | Route malformed audio through the same owned failure transition, wipe rejected PCM, and preserve the instance identity needed for explicit shutdown. Avoid an independent competing cleanup path. |
| R2.5 / U3 | `reader/ReaderPublication.tsx` loses focus when internal Close/backdrop removes the TOC. A selected destination that is rejected or never settles has the same gap. R8-04 proved opening/already-open focus, not these exits. | Restore the trigger without scrolling on manual dismissal or failed navigation. Keep successful navigation's destination focus and the existing toolbar-close behavior. Test keyboard, backdrop, failure, and successful destination separately. |
| R3.1 / U3 | Optional removal/reinstall does not refresh the selected Chatterbox profile's availability for the current book. Clicking its already-selected radio manually works; prior installed-host evidence opened a new session. NSL/RCF ownership rules still apply. | Notify the current App/settings owner once when a current operation transitions to installed; refresh only the selected relevant profile. Do not autoplay, refresh on every poll, or publish to a replacement owner. |
| R3.2 / U1 | `narration-bilingual-normalizer.ts` admits extra percent suffixes on forms such as `14:30%` and `$12.50%`; prior RAF-12/BNC-03/VUC compound guards do not cover all these suffixes. The frozen v1 path also has examples but is outside mutable scope. | Add the missing conservative compound boundary in current modes. Keep valid percentages, times, currency, ordinary trailing punctuation, source spans, code preservation and segmentation. Do not edit frozen v1 or its corpus. |
| R3.4 / U1 | `navigation/navigation-document.ts` includes `alt` from arbitrary descendants, including spans/foreign elements; this changes labels and can trigger the 1,024-character cap. RCF-15 corrected other descendant behavior. | Admit alt only from allowed XHTML images at any supported descendant depth, after hidden/forbidden filtering. Preserve current ARIA/title fallback and label bounds. |
| R3.5 / U6 | `services/tts/benchmarks/preflight.py` accepts a matching outbound block without proving its effective policy store/profile. Disabled relevant firewall profiles can still produce a true result. Existing `FixedNetworkProbe` tests bypass the real probe. The separate adapter-layout host already checks profile/service state. | Query effective policy and required enabled profiles; reject unavailable/ambiguous/filter-mismatched state using content-free reasons. Exercise the actual probe's subprocess/result interpretation. Preserve loopback and do not mutate firewall policy or rerun model benchmarks merely to test this gate. |
| R4.1 / U3 | Initial block-start fallback in `ReaderPublication.tsx` can publish the saved interior locator although actual placement is the block start. The reflow tracker and later narrator inherit that mismatch. RCF-09/VCA-09/MAF-07 addressed related placement, not this distinction. | Publish the actual fallback locator to the visual owner and narrator while retaining the exact saved request separately for valid restoration. Do not persist temporary fallback over a precise checkpoint. Test immediate and late narrator attachment plus an exact range visible near the viewport bottom. |
| R4.2 / U5 | Shared `contracts/locator.ts`, Rust `tts_protocol_contract.rs` and current Python `protocol.py` disagree on range identity/order/progression checks. Additionally Rust's `char::is_control` rejects C1 identifiers that the current TS/schema/Python identifier rule accepts. Normal TS-originated traffic masks much of this. | Make real boundary decoders enforce the existing shared semantic rules, including document/index consistency and optional progression. Align Rust identifiers with the current C0/DEL restriction, rather than silently tightening the schema. Preserve legal cross-document/equal ranges. No wire-shape change, generated-file hand edit or frozen Chatterbox-module rewrite. |
| R4.3 / U6 | `services/tts/src/voxleaf_tts/release_core.py::_recover_outputs` restores an early backup before discovering a later target/backup conflict. SPM-03/RAF-11 strengthened promotion; the conflicting recovery set remains. | Inspect the entire bounded output set before any recovery rename. Preserve sole backups, conflict errors and the distinction between build and explicit write-manifest. Fault-inject tiny real filesystem outputs; do not rebuild a real package solely for this recovery case. |
| R4.4 / U3 | The three narration preference repositories parse the existing value during write before enforcing the read-side 256-byte limit. The output is bounded, but the prior parse is not. No UI freeze has been measured. | Before parse or full UTF-8 encoding, reject obviously over-limit code-unit length; encode only the bounded remainder. Apply the same cheap guard on reads. Preserve unknown/future values. An over-limit write **and Reset** return over-limit and visible failure without overwrite; bounded malformed values remain explicitly repairable. Do not silently introduce a destructive recovery API. |
| R4b.2 / U3 | `adaptive-preparation-presentation.ts` labels a total that includes active plus selected audio as though it belongs only to the selected target. The scheduler's arithmetic is already correct; MPA-03/RCF-20 cover neighboring presentation. | Correct only the mixed-state description to available listening time. Preserve arithmetic, target thresholds, readiness and action availability. Extend the existing coordinator suite's `loadedAudioStatusText` scenarios. |
| R4b.3 / U6 | `apps/desktop/scripts/native-webdriver-client.mjs::isReady` treats a valid status response with `ready: false` as ready. Existing coverage supplies only true. | Require the boolean value to be true, retaining polling deadline and error behavior. A true status still does not guarantee session creation; keep that failure path. |
| R5.1 / U2 | Native supervisor successful shutdown branches and successful cancellation remove the session without retaining the verified receipt. If the reply is lost, an exact retry returns invalid-state and the client can remain stopping. RAF-15 added receipts for other contained failures. | Record one bounded verified-termination receipt under the session-slot lock, with start and service identities, in every successful terminal path. A retry may acknowledge only that owner and cannot affect a successor. Failed termination remains failed; never equate generic invalid-state with successful cleanup. |
| R5.2 / U2 | `tts_service_supervisor.rs` retains a rejected-start receipt after successful reuse and can create a conflicting receipt by rejecting a start with the active request ID. Shutdown consults rejected history first. Normal UUID callers reduce exposure; native replay still violates identity ownership. | Reject reuse of an active or retained request identity at admission without replacing its receipt. Keep bounded history. Do not merely reorder shutdown checks: a stale request must never acquire the replacement child. Exercise both request ID and service ID matching. |
| R5.3 / U6 | `native-webdriver-client.mjs::closeSession` clears its ID before DELETE, so transport failure loses retry ownership. Outer native cleanup still kills owned processes; permanent leakage was not proved. | Retain a private cleanup identity until DELETE succeeds or a structured invalid-session response proves absence. Prevent normal requests/new-session takeover while cleanup is pending; coalesce closes. Preserve SAF-13's independent cancellation channel and outer process cleanup. |
| R6.2 / U3 | `App.tsx` and `reader-position-save-coordinator.ts` ignore appearance write rejection, including the repository's 1,024-code-unit over-limit protection. The restore coordinator caches ready by default, so a later book can report ready although nothing was saved. SPM-02 addressed narration feedback; SAC-15 protected future state. | Propagate the real current write outcome through direct and queued saves, including the restore cache; retain temporary usable appearance and accurate feedback, and suppress stale completion. Preserve future-version protection and retry. Test before/after book open and a deferred failure across replacement. |
| R8.1 / U4 | Partially valid: optional promotion deletes an existing backup before the staging-to-active rename when only the backup survives. A later rename failure can lose that last recovery copy. Automatic activation of backup was intentionally excluded by CLB-05/RCF-13; NCC-05's Python-builder restoration policy is not native authority. | Preserve the sole backup until safe commit, or reject this state with a fixed recoverable error while preserving it. Do not auto-activate it or add a durable recovery journal. Test crash-like backup-only state plus rename/rollback failure and preserve known active installations. |
| R8.2 / U4 | Native optional download checks free space before removing its own stale staging, so a retry can be rejected despite reclaimable capacity. Host CPU/RAM/VRAM admission does not perform this disk check. | After admission, canonical-root/ownership checks and operation locking, clean owned staging, then measure free space. Keep active/backup roots intact, fail on cleanup error, and do not start transfer if still short. Use injected free-space exact-boundary observations, not a real full disk. |
| R8.3 / U1 | Current language checks accept malformed singleton structures (`es-x`, `en-u-x-a`, repeated `u`), some of which survive XHTML source projection and trigger normalization. Valid `es-x-a`/`en-u-ca-x-a` must remain usable. | Add a bounded structural extension/private-use validator for the current normalizer with nonempty payloads and unique extension singletons. Preserve existing supported/unsupported-language policy; no IANA lookup, dependency, automatic language detection or frozen-v1 edit. |

### Case register: preserved, conditional and deferred

| Case | Disposition and reason | Explicit boundary / reopening criterion |
| --- | --- | --- |
| R2.2 | **Defer contract risk.** ZIP readers alias caller bytes across awaits; mutating public input could change lazy resources or identity. The API has no selected snapshot-ownership guarantee and desktop ingress supplies a dedicated buffer. | Do not add a second up-to-100-MiB snapshot without a product/API decision and memory budget. A future plan must choose transfer/immutable-caller/snapshot semantics, then demonstrate the real caller. Not marked fixed here. |
| R3.3 | **Defer capacity risk.** Optional tree stamping/verification/bytecode cleanup lacks explicit entry/depth caps. The accepted package has about 13,092 files, plus directories; no harmful admitted latency/stack case was measured. | Do not impose an arbitrary cap on valid packages or change process-local locking. Reopen with a bounded adversarial tree, observed failure, package-aware limits and cancellation requirements. Multiple simultaneous app instances remain outside the existing supported ownership policy. |
| R4b.1 | **Preserve policy.** Next traverses known prepared boundaries; M009 and the synchronization authority do not promise an immediate unprepared successor. RCF-06 deliberately made Previous adjacent, not Next. | No navigation feature expansion. If later approved, derive real segment edges; sorted historical overlapping ranges are not an adjacency oracle. |
| R6.1 | **Preserve policy.** A local JPG item without the supported XHTML fallback remains a broken reference under M003/R8-07. | No new inert non-XHTML spine-document support. |
| R6.3 | **Preserve policy.** Reversed ordered lists were explicitly excluded from RCF-07. | No reversed-list feature in a defect follow-up. |
| R7.1 | **Preserve terminal recovery policy.** Protocol failure, cancellation timeout and cleanup failure receive zero automatic recovery attempts under `hardware-profile-recovery-authority-v1.md`. Current tests deliberately retain the contained failed episode. | Do not clear the episode just because another containment attempt returned success. Existing explicit profile/recheck/new-episode actions retain authority. The earlier generic “Play remains disabled” bug claim is withdrawn. |
| R7.2 | **Preserve bounded fallback policy.** M004/ADR-0010 allow an unavailable placeholder when the raster queue is saturated; automatic retry is not promised. Live-image/source/pixel capacity is independently bounded. | No automatic retry scheduler or larger limits. |
| R7.3 / U7 | **Verify first.** The 1x Web Audio backend captures frames before asynchronous suspend and reanchors after resume. A clock that advances while suspend is pending may lose interval accounting. Current fakes settle immediately. RIA's WSOLA fix is a different path. | First demonstrate the interval with deferred suspend/resume and actual source-start clock semantics. If no valid failure remains, record a reasoned SKIP and make no production edit. If confirmed, correct only 1x timing; preserve audible confirmation, ownership tokens, ended clamp and Stop/rate-change races. No claim of lost PCM or measured physical-audibility drift. |
| N1, additional | **Defer API ambiguity.** The original open AbortSignal remains attached to later resource operations, so aborting it after successful open can disable raster reads. Desktop session code discards that controller; ordinary UI exposure is unproved. | Choose operation-only versus publication-lifetime cancellation semantics before any change. Do not silently detach a lifecycle guard or call this a confirmed desktop defect. |

## 4. Scope and non-goals

Implementation consists of seven cohesive units, then one combined acceptance
batch. Unit boundaries are ownership boundaries, not a license to refactor
whole files. Prefer existing helpers and result types. Add a private helper only
where needed to express a shared invariant or exercise real production behavior.
Keep regression controls in the existing suites. Do not rewrite completed plans,
frozen authorities, generated code, historical receipts or unrelated code.

No dependency/model upgrade, new persisted schema, new wire field, automatic
recovery, new EPUB support, raised queue limits, installer publication, broad
clean-code campaign or blanket performance benchmark belongs to this plan.
The pure-copy/public-signal/capacity questions above remain explicit deferred work.
R3.2/R8.3 do not claim to fix the historical v1 normalizer.

## 5. Relevant files and documentation

Read the owners and existing tests named in the register before editing. Additional
coupled boundaries are `apps/desktop/src/tts/product-narration-coordinator.ts`,
`src/settings/narration-settings-actions.ts`, `src/settings/ReaderSettingsDialog.tsx`,
`src/tts/HardwareCompatibilityControls.tsx`, `src/reader/reader-reflow-restoration.ts`,
`src/persistence/reader-position-restore-coordinator.ts`,
`src/persistence/reader-position-save-coordinator.ts`,
`src/tts/playback-backends/web-audio-pcm-playback.ts`, `src/tts/adaptive-preparation-presentation.ts`
(all under `apps/desktop`), and `packages/epub/src/resource/opened-publication.ts`.

Required authorities:

- [Documentation index](../../README.md), [MVP](../../product/mvp.md),
  [reader/settings requirements](../../product/reader-settings-and-playback-controls.md),
  [architecture overview](../../architecture/overview.md) and
  [canonical diagram](../../architecture/system-diagram.md).
- [ADR-0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md),
  [ADR-0010](../../architecture/decisions/ADR-0010-bounded-raster-image-decode.md),
  [ADR-0046](../../architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md),
  [ADR-0060](../../architecture/decisions/ADR-0060-primary-publication-start.md),
  [ADR-0064](../../architecture/decisions/ADR-0064-admit-msgpack-chatterbox-v7.md),
  [ADR-0065](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md).
- [TTS service organization](../../development/tts-service-organization.md),
  [testing](../../development/testing.md),
  [evidence retention](../../development/evidence-retention.md),
  [independent change review](../../development/agentic-change-review.md),
  [plan rules](../../../.agents/PLANS.md).

Future documentation updates should describe actual corrected behavior in the
current requirements/overview and a new concise evidence ledger at
`docs/plans/evidence/chat-audit-minimal-follow-up/`. Add a new ADR only if a durable
decision changes beyond the preserved policies. Review the diagram and M005
boundary; update the diagram only for an actual architectural change. This plan
does not itself change product implementation status in the roadmap.

## 6. Architecture and constraints

EPUB content stays local. Current inference remains local and PCM ephemeral by
default. No book text, paths, private host inventory, generated audio, models or
secrets enter tracked evidence. Use repository-authored synthetic fixtures.

Keep cancellation and identity at the current owner: archive close waits for
readers, Settings waits for verified Stop, client fallbacks validate the captured
instance, and native receipts acknowledge only an already contained owner. Every
new retained state must have a fixed bound; no replay-history map or retry loop.

Preserve visible/narration/heard/persisted location distinctions. A fallback
display locator is not permission to overwrite the exact saved checkpoint.
Normalization preserves canonical source mapping and all existing preparation
work/segment bounds. Playback lead describes playable audio, never a fixed
wall-clock wait. This work does not change buffering targets or measurement policy.

Chatterbox v7 packages use nine frozen v3 modules from the authority commit
`998c7b24cda7e969e9ed0344f348506bf38af3b0`. Current Python protocol edits must not
replace those modules or regenerate an optional package. Native boundary checks
protect the desktop. Piper does consume current mutable modules, so R1.1/R4.2
invalidate its old runtime package; regenerate it once after those edits settle.

## 7. Milestones

### M0: Establish execution inputs and directed cases — not started

When execution is authorized, record actual HEAD, existing user changes,
allowlisted paths and installed tools. Reconcile drift from the planning base.
Retrieve the original receipts described below before proposing reuse. Capture
source/test/config/lock/fixture membership and relevant environment **before**
edits; do not manufacture baseline evidence retrospectively.

Add the smallest meaningful regressions for retained cases, grouped by owner.
Run each new directed case once against unchanged production where feasible;
record the actual failing assertion, rather than treating an import/setup error
as a reproduction. A broad baseline run is unnecessary when it adds no relevant
evidence; a known historical PASS is context, not a fabricated current baseline.
Investigate a candidate that fails to reproduce before changing its production path.

### M1: Implement bounded units — not started

| Unit | Cases / responsibility | Minimum acceptance observations |
| --- | --- | --- |
| U1: EPUB admission and current normalization | R1.2, R2.3, R3.2, R3.4, R8.3 | Public multi-root admission, exact budget, reader closure after pending work, metadata retained after close, image-only alt, invalid/valid language structures, compound preservation and unchanged source ranges in current profiles. Frozen v1 stays byte-identical. |
| U2: Service identity and containment | R2.1, R2.4, R5.1, R5.2 | Deferred old cancel rejection after Stop/recheck/Play B; malformed audio; lost shutdown/cancel acknowledgement; rejected-start replay; active-owner collision; successor survival; failed termination stays blocked. Exercise typed-client/coordinator integration plus native slot ownership, not just isolated boolean helpers. |
| U3: Reader and settings feedback | R1.4, R2.5, R3.1, R4.1, R4.4, R4b.2, R6.2 | Real mounted owners, failed Stop before optional removal, retry and stale callbacks, same-book reinstall, manual/rejected/successful TOC exits, precise versus fallback position, bounded preference reads/writes/Reset, appearance write failure and current listening-time copy. |
| U4: Optional package lifecycle | R1.3, R8.1, R8.2 | New-manager staging-only snapshot, read-only poll, cleanup failure, backup-only failed promotion, healthy active install, canceled operation, exact free-space thresholds after cleanup; no deletion outside the admitted owned staging root. |
| U5: Current protocol and Piper bounds | R1.1, R4.2 | Incremental cap/cancellation/error controls; TS/Rust/current-Python decode parity for valid and invalid locator/identifier vectors; unchanged serialized shape and frozen Chatterbox sources; packaged Piper ES/EN offline smokes later in G7. |
| U6: Maintainer tools and driver | R1.5, R3.5, R4.3, R4b.3, R5.3 | Real PowerShell classification exercised without build/sign; real preflight parser with controlled effective-policy/profile output; tiny filesystem recovery conflict before any rename; WebDriver ready=false/true, transient DELETE failure, structured absence, retry ownership and cancellation channel. |
| U7: Conditional 1x clock | R7.3 only if demonstrated | Deferred async clock reproduction, exact expected consumed interval, one source-start anchor, audible activation, ended clamp, stale callbacks, Stop/resume/rate replacement. No DSP edit or new speed profile. A documented SKIP is valid when the hypothesized failure is disproved. |

Work sequentially within shared owners; do not let separate units concurrently
edit App, the client, the native supervisor or the same tests. The scope is bug
correction, not the systematic-refactor workflow. No per-unit broad full suite,
mandatory duplicate build or implementation commit is required. Future Git
actions still need the user's authorization independently of execution permission.

### M2: Freeze and validate the combined patch — not started

Finish focused regressions and current documentation before expensive preparation.
Run the deduplicated gate groups below once on their final consumed inputs. Use
one package export preparation, one Piper regeneration and one final app build
where input stability permits. Configured build hooks remain mandatory; do not
bypass them merely to claim fewer builds. A later relevant fix invalidates the
affected group and its dependent artifacts, not every unrelated gate.

Before native work, verify tool/model/package readiness, available resources,
owned-process identities and restoration paths. Do not start downloads or a long
model campaign to discover a missing prerequisite. Keep timeout and cleanup
evidence for each stage. If an ignored native gate builds/relinks an executable,
capture the executable that actually runs; never reuse a pre-link hash.

### M3: Independent acceptance and closeout — not started

Delegate read-only review to `change_reviewer` (GPT-6 Astra high) following the
repository review policy. The reviewer inspects the exact current code, documentation,
executed receipts and any proposed reuse; it neither edits nor runs tests.
Resolve actionable findings, renew invalidated gates, and obtain approval bound
to the actual final patch. Missing required evidence or reviewer availability
blocks implementation acceptance. This documentation-only planning commit is
exempt and must not claim that runtime review has occurred.

Record every case as corrected, preserved, deferred or verified-SKIP. Archive
the plan and update indexes only after implementation acceptance. Deferred cases
must remain visible as unresolved decisions/risks, not “all 34 bugs fixed.”

## 8. Testing and benchmark strategy

### Historical evidence inspected and what can be reused

These are recorded prior outcomes, not tests run for this plan:

| Prior evidence | Recorded outcome | Reuse decision for this plan |
| --- | --- | --- |
| [RCF execution ledger](../evidence/revalidated-chat-findings/execution-ledger.md), [commands](../evidence/revalidated-chat-findings/validation-commands.md), [R3 approval](../evidence/revalidated-chat-findings/review-R3.md) | EPUB G2: 516 tests/13 suites; final desktop G3: 632/18; native G4: 165 default and 164 release-locked, eight ignored each; Python G5: 126/four suites; final Chromium: ten journeys. | Reuse fixtures and scenario knowledge. EPUB/desktop/native inputs will change: repeat selected affected suites, not these aggregate PASS claims. G5 covers Chatterbox builders/sources/benchmark isolation, not the new Piper/protocol/preflight cases. Unchanged unconsumed areas are omitted by scope, not relabeled accepted by reuse. |
| RCF final G8 and G9 | R3 current six-rate Piper EN passed on binary `fad859144f391967886da3acf44657b2d2ef63087aed45a4cfce9df3d6ea121e`; optional exact local admission passed without inference; resource/process restoration recorded. Earlier R1/R2 rate-owner failures were corrected before R3. | Reuse host harnesses, restoration design and package identity references. Neither the native measurement nor admission PASS accepts changed native/renderer code. Rerun one current Piper arm and current optional admission; do not repeat the six-rate matrix unless affected rate/WSOLA responsibilities demand it. |
| [SPM ledger](../evidence/settings-packaging-minimal-corrections/execution-ledger.md), SPM-R2 approval | Final desktop F1: 355 tests; packaging: 136; six Chromium cases; final Piper EN binary `86aee8fcd5aa92db9a496efd8bbee8dd6bd6178821748bccf69fbe890a3db679`; full restoration. | Reuse small real-filesystem fault fixtures and rejected/partial Settings cases. Production recovery/settings changes invalidate the corresponding PASS. The first desktop/native revision was superseded, not equivalent acceptance. |
| [RAF ledger](../evidence/residual-audit-corrections/execution-ledger.md) and [commands](../evidence/residual-audit-corrections/validation-commands.md), RAF-R2 approval | Final desktop: 604 tests; supervisor 39/38 and optional 65/65 in the two native variants; current Piper EN and frozen F08 replacement race passed after R1's rejected-start correction; resources restored. | Preserve rejected-start/contained-failure controls and F08 harness. R5 changes exactly that owner, so fresh native tests/F08 are required. Timing values are historical host observations only. |
| RCF `core-artifact-reuse.json` and SPM core inventories | Previous Piper artifact reuse proved 2,024 members and a 26-input runtime/source closure. | Old payload reuse is invalid once current Piper/protocol modules change. Reuse already verified model/dependency inputs as preparation where unchanged, then regenerate/check the current core once. |
| Frozen Chatterbox v7 authority and prior installed/source inventories | V7 uses frozen v3 service modules and fixed dependency/model authorities, separately from current mutable Python. | Candidate for **artifact reuse** after full current membership/size/hash/authority verification. No optional package rebuild, download or broad inference benchmark is justified by these native lifecycle fixes alone. Current native admission still runs. |

The original RCF local evidence directory is
`tmp/evidence/revalidated-chat-findings/20261103-01/`. Planning verified the
following retained manifest files exist and still have these SHA-256 values:

| Original file | SHA-256 |
| --- | --- |
| `R3-envelope.json` | `3323A3B1D880825B12018AFC295471A3235E5DAAF1F45D74ACBA2946AA3A2629` |
| `R3-reviewed-identities.json` | `FF695829D310607B1ADBD7083F25DB43C82FA8C5535FC3988024070E1BA81E4D` |
| `R3-all-source-identities.json` | `1C0876FBCEA7B9610E6D9DDB7A09AAC90DB160E6696BD005BCFC7BE012224B50` |
| `R3-evidence-equivalence.json` | `9083590520D7E9F68EA94778DEB9BF6C2DB36F5FA2B31EC5A0B815A96C763C9E` |

Those manifests bind the prior working patch based on
`887c5898d0712cf4053e845bbf286e8dadd3cf80`; they are not a certificate for current
HEAD. Their historical 58 reviewed paths/1,531 source inputs and installed-input
comparisons must not be silently refreshed. Raw receipts live in ignored local
storage and may be unavailable in another checkout. Missing originals mean no
reuse claim. Do not commit raw manifests containing absolute private paths.

Behavioral evidence reuse requires the original immutable result and command,
matching complete transitive source/test/fixture/generated/config/lock inputs,
membership including added/deleted files, identical relevant installed tools and
environment, the same invariant, and suitable host-state freshness. Record an
explicit per-gate comparison and reviewer decision. A narrow current hash, clean
Git status, elapsed time or previous reviewer approval alone is insufficient.
The evidence principles in the
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
apply; its refactor-specific per-unit workflow is not imposed on this bug plan.

**No historical behavioral PASS is pre-approved as acceptance for a changed
owner in this plan.** The principal savings are artifact reuse, directed
regressions, affected-suite grouping, omission of unrelated responsibilities and
one final expensive preparation per stable set of inputs. Within execution,
already accepted unchanged gates can be retained after a later unrelated fix
only with the same complete equivalence proof.

### Gate order and minimal grouping

All future test/validation commands run from repository root in normal local
PowerShell **outside the managed automation sandbox**. Use repository-selected
tools/locks. Record exact command, timestamps, exit, environment, consumed inputs,
artifacts and cleanup. Do not run a root `check` on top of the complete selected
groups solely to duplicate their work. Expected success below is not an actual result.

| Gate | When / invariant | Dependencies, invalidation and expected evidence |
| --- | --- | --- |
| G0 | Before edits: readiness/input capture; after source settles: package exports once | Git/source membership, lock/tool identity and actual available native artifacts. `build:packages` is preparation, invalidated by shared/EPUB build inputs. No broad baseline suite. |
| G1 | Fast static checks before package/native preparation | TS/Python/Rust format, lint, affected typechecks, shared generated parity. Changes to relevant source/config/locks require the applicable leaf again. All applicable commands pass. |
| G2 | One affected shared/EPUB deterministic group after U1/U5 | Real public admission, lifetime, current normalization/source mapping and contract decoders; original synthetic fixtures plus new cases. Shared export/config drift invalidates dependent consumers. |
| G3 | One affected desktop group after U2/U3/U7 | Identity races, Settings/appearance ownership, position/focus and presentation; include the existing PCM backend suite if U7 changes that owner. Reuse test fixtures, never old runtime verdicts. |
| G4 | One Python group and one Node group after U5/U6 | Adapter/protocol/service, preflight, real core recovery, WebDriver/release classification. Python imports/config/locks and actual PowerShell helper are inputs. No models or real firewall modifications for deterministic tests. |
| G5 | Native tests in default and release-locked variants after U2/U4/U5 | Decoder, session-slot receipts, failed termination and optional filesystem/admission logic. Both Cargo variants are material; ignored exact-host tests are not counted as passing here. |
| G6 | One Chromium invocation after final renderer/shared/EPUB inputs | Add three `CAF-` journeys to the existing smoke file: TOC/fallback/late narrator; removal failure/retry/same-book reinstall with owner replacement; preference/appearance rejection including Reset. Use existing mocks for native failures; do not claim native proof. |
| G7 | Once after all current Piper/protocol/builder changes | Regenerate Piper with existing write-manifest builder, which already runs offline ES/EN smokes, then verify core. Preserve backups on failure. Hash current source/package; no duplicate standalone bilingual model benchmark. |
| G8 | Once after G1-G7 and native readiness | Current app build, one current Piper EN 1x host arm, fresh F08 owner race and current optional local admission without inference. R7.3's real backend observations belong here if corrected. Each consumed executable/package/host input must match the receipt and cleanup proof. |
| G9 | Final documentation and independent acceptance | Evidence/diff guards, exact patch identities and reviewer approval; all required cleanup complete. Later relevant edits renew affected groups and review. |

### Existing commands selected for execution

These are existing configured runners and their supported filters. New tests go
in the listed existing suites. A changed ownership boundary may require adding
a directly coupled suite; record the reason instead of widening to the entire
repository by default. During red/green development, use the same runner's
supported case selector. The final groups include complete selected suites so
old regression controls still execute once.

G0/G1 (run each applicable leaf once; package preparation precedes consumers):

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/shared generate:check
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
```

G2 (shared and EPUB groups):

```powershell
pnpm.cmd --filter @voxleaf/shared exec vitest run src/primitives/identifiers.test.ts src/contracts/locator.test.ts src/contracts/narration-segment.test.ts src/contracts/tts-protocol-control.test.ts src/contracts/serialized-conformance.test.ts
pnpm.cmd --filter @voxleaf/epub exec vitest run src/archive/archive-inventory.test.ts src/public/open-epub-publication.test.ts src/resource/opened-publication.test.ts src/navigation/navigation-document.test.ts src/document/xhtml-projector.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source-projector.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
```

G3 (one desktop group):

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/HardwareCompatibilityControls.test.tsx src/tts/process-client.test.ts src/tts/product-narration-coordinator.test.ts src/persistence/narration-language-preference.test.ts src/persistence/narration-start-preference.test.ts src/persistence/narration-playback-preference.test.ts src/persistence/reader-position-save-coordinator.test.ts src/persistence/reader-position-restore-coordinator.test.ts
```

If U7 requires a correction, append `src/tts/pcm-playback.test.ts` to that same
final invocation. If U7 is disproved and the backend/cleanup path remains unchanged,
retain its directed investigation result without repeating the entire PCM suite.
U2's malformed-audio cleanup is covered at its actual client/coordinator owner.

G4/G5:

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_piper_adapter.py services/tts/tests/test_protocol.py services/tts/tests/test_service.py services/tts/tests/test_benchmark_preflight.py services/tts/tests/test_release_core.py
node --test apps/desktop/scripts/native-webdriver-client.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs
pnpm.cmd test:rust
```

G6 uses the configured browser runner directly after G0, avoiding the root
wrapper's redundant package build while retaining Playwright's configured hooks:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep CAF-
```

G7/G8 (sequential native work with restoration; not parallel against shared roots):

```powershell
pnpm.cmd package:piper-core:write-manifest
pnpm.cmd package:piper-core:check
pnpm.cmd build:desktop
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement -- --exact --ignored --nocapture --test-threads=1
pnpm.cmd test:chatterbox:v7:local-admission
```

Use the existing native resource-journal procedure: capture the exact original
tree and owned process PID/creation-time/executable, stage only verified resources,
restore in `finally`, compare complete before/after inventories and verify no
new owned scratch/processes remain. Do not kill by name or remove pre-existing
scratch. The optional local-admission gate uses already verified local v7 assets
and its required runtime/scratch/models environment from testing.md; it does not
download or run inference. RCF's original gate took about twelve minutes, so run
it only after cheap gates and all optional native edits settle.

If startup/loader routing or frozen optional-runtime dependencies unexpectedly
change, this minimum is no longer sufficient: amend scope and require the
existing `test:chatterbox:v7:native-loader` / `test:chatterbox:v7:native-startup`
as appropriate. Likewise, actual WSOLA/rate ownership changes require the existing
six-rate host option. Do not silently use a broader campaign or claim unchanged
support when its consumed path changed. R1.5 uses the actual PowerShell policy
under synthetic statuses; no real certificate, signing, installer rebuild or
release publication is required for that policy correction alone.

G9:

```powershell
pnpm.cmd check:evidence
git diff --check
```

Broad Qwen/GPU matrices, optional downloads/repackaging, security/dependency
campaigns, physical-listening reviews, full installer journeys, repeated whole
EPUB/Python/TS aggregates and new performance benchmarks are excluded because
their responsibilities are unchanged. This is a scope decision, not recycled
PASS evidence. Required native cleanup and meaningful regression tests cannot
be removed just to minimize a count.

## 9. Risks and rollback

- Overbroad fixes could undo earlier containment, future-version protection,
  source mapping or backup policy. Use the explicit preservation controls in the
  register; treat a policy change as a scope decision, not an incidental fix.
- A new stricter decoder can reject legitimate traffic. Use common valid/invalid
  vectors at the actual TS/Rust/current-Python decoders, preserving the published
  identifier rule and optional fields. Frozen optional service modules remain fixed.
- Incremental Piper collection changes generator consumption and failure timing.
  Prove early stop/closure and unchanged legal output, then use the builder's
  existing real ES/EN smokes plus one current native arm.
- Source ownership release must occur after all readers settle. Avoid alias
  mutation, use-after-close and loss of metadata; do not expand R2.3 into R2.2's
  unresolved copy policy.
- Over-limit preference protection intentionally blocks Reset of an unreadable
  value as well as writes, with feedback. Do not disguise it as a successful
  reset or erase possibly newer data. A future destructive repair flow is separate.
- Native staging cleanup and backup retention must stay inside verified roots
  under existing operation ownership. Keep any sole recovery copy. This does not
  promise power-loss atomicity or concurrent multi-instance support.

Keep each unit's diff separable for a targeted rollback without reverting other
work. Restoring code is distinct from restoring host artifacts/resources; journal
the latter before mutation. Do not delete old receipts or overwrite them with a
later result. Preserve product failures and setup failures with their distinction.
Allow at most one infrastructure retry per failing stage after a written concrete
hypothesis and correction; no retry-until-green, changed timeout to hide a defect,
or discarded aggregate failure. A real fix requires new affected evidence and
review. Missing prerequisites or failed restoration block acceptance.

## 10. Progress log

- 2026-11-03: Reconciled all 34 original cases, their prior agent investigations,
  the deeper static revalidation and the additional N1 candidate. Separated 26
  bounded corrections from five preserved policies, two deferred risks and one
  verification-first timing claim. No implementation or tests executed.
- 2026-11-03: Read relevant completed plans/receipts, checked retained RCF manifest
  hashes, inspected current runners and frozen-source boundaries, and selected
  affected gate groups. No old behavioral PASS pre-approved for changed owners.
- 2026-11-03: Created the planning branch and drafted this ExecPlan and indexes.
  Implementation milestones M0-M3 remain not started.

## 11. Discoveries and decisions

1. Similarity to a previous fix is not proof of duplicate resolution: several
   retained cases concern failure/retry/replacement variants missing from older
   tests. Conversely five findings contradicted intentional product limits.
2. R2.1 retains only the delayed rejection race. Existing success-ack identity
   guards refute the broader original claim. R8.1 retains backup preservation,
   explicitly excluding automatic restoration/activation.
3. R7.1 is an accepted terminal recovery rule; R7.3 remains conditional. Neither
   justifies a speculative recovery or DSP rewrite.
4. Current normalizer changes must leave frozen v1 bytes/corpus unchanged.
   Current Python fixes do not authorize changes to frozen Chatterbox modules.
5. Previously recorded test counts, model timings and review approvals are
   historical. Verified receipt-file hashes establish retrievability, not
   equivalence of today's full environment or a future patch.
6. Minimize meaningful validation by affected responsibility and stable inputs,
   not by turning omitted checks into reused PASS. Native receipts are fresh
   where the native owner changes; reusable model/package preparation is separate.

## 12. Final validation results

**Implementation: NOT STARTED.** No production/test source changes, test runs,
builds, model execution or native host mutation have been performed for this
ExecPlan. All runtime gate outcomes and independent implementation review are
pending. The planning commit will contain only this document and its two indexes.

Planning-only verification:

- Local PowerShell inspection found 34 unique original case IDs, all 12 required
  sections, no missing Markdown targets, and no missing referenced Vitest suites.
- `git diff --cached --check`: PASS; only this plan and its two indexes are staged.
- `pnpm.cmd check:evidence`: PASS outside the sandbox with repository-selected
  pnpm 11.15.1 through the existing offline Corepack shim. The first invocation
  was rejected before the guard ran because the fallback PATH supplied pnpm
  11.25.0. One corrected environment retry succeeded; nothing was installed and
  network access was disabled. This was a documentation guard, not a product test.

These checks cannot serve as behavioral acceptance. Creating the branch and
local commit does not authorize executing or publishing the plan.
