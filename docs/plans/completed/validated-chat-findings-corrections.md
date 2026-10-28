# Correct all validated chat findings with minimal changes

Status: **Completed M0-M4; implementation accepted by CHAT-FINDINGS-R3-ASTRA-20261027.** Created and completed on 2026-10-27.

Planning base: `bd2cbb9f17e104f8c42e2e388219e718aca791fe` on `main`.
Working branch: `codex/chatterbox-runtime-correctness`.

This replaces the narrower plan introduced by documentation commit `6eed9b4`.
The existing branch is retained; its name does not restrict this plan's scope.
The scope correction follows the user's explicit clarification that every valid
finding in this chat must be addressed, not only Chatterbox/CUDA.

The 2026-10-27 execution request authorizes minimal corrections, regression tests,
documentation and necessary local-host validation on the existing branch. It does
not authorize staging, commits, push, PR, merge, publication, model downloads or
new package versions. The initial HEAD is
`5f67bd69c805a59e0699d5ee103ff84255e0472d`; index and worktree were clean.
The [execution ledger](../evidence/validated-chat-findings-corrections.md) records
scope, commands, evidence identities, reuse decisions and outstanding gates.

## Goal

Resolve **all 12 unique findings with static support** from the three general
reviews, their explicit revalidation, and the focused Chatterbox/CUDA review in
this chat. Preserve the qualifications from revalidation. Track the two remaining
concurrency candidates separately: reproduce a reachable failure before fixing
them, or close them with concrete counterevidence. Also address the two package
source/validation risks without turning them into unnecessary runtime rewrites.

Use focused changes in the existing owners, one regression group per affected
boundary and one combined acceptance batch. Do not run a full campaign per bug.

Prefer **zero new optional-runtime versions**: preserve the exact published v7
payload, dependency lock, models, numerical behavior and generation settings.
Correct desktop admission/child startup and accurately describe effective
inference precision. EPUB, playback and Piper packager corrections must not
silently become reasons to rebuild either inference payload. A new runtime is a
conditional fallback, not the default deliverable.

## User-visible outcome

Books accepted by the parser open when multiple spine entries share a supported
fallback. Valid empty/case-equivalent language attributes work; explicitly hidden
root content is omitted. Narration preserves ambiguous compound numbers and
stable source locations instead of expanding a suffix of a larger expression.

Restoring the window does not stop an otherwise healthy loaded session merely
because its own model consumed the memory needed at startup. Recovery retains
episode interruption metrics, and failed playback exposes only actions its
remaining owners can perform. A failed Piper package promotion/recovery retains
the only surviving backup across retries.

Chatterbox is offered only for the architecture its installed service accepts.
Unsupported or unknown architectures are rejected before download or activation;
existing optional data remains removable. On an otherwise supported Windows
computer, startup resolves the packaged Visual C++ dependency without depending
on developer tools or an incidental system redistributable. Existing Spanish and
English narration, cancellation, restart and memory-only audio remain intact.

Documentation distinguishes the legacy profile name and BF16 hardware capability
from the actual model parameter/inference precision. This plan does not optimize
or change the voice by introducing BF16 casts.

## Current state

All fourteen findings are implemented, including both concurrency candidates
confirmed during execution. R1 review corrections and final host revalidation
pass; independent final acceptance is APPROVE. The execution ledger is the
current evidence inventory. The following planning baseline is retained for
provenance and does not describe the current execution status.

Planning source base is `bd2cbb9`; `6eed9b4` changed only documentation. The scope
correction re-read the chat's original reports and revalidation, relevant current
code, previous plans and retained receipts. No regression, model or clean-host
execution took place. "Valid" below means static evidence supports the described
defect; it does not mean a new runtime reproduction already passed.

The general revalidation's numbering is retained as F01-F12. The focused review
repeated F01 and added F13/F14; count F01 only once. The initial plan's CRC-01,
CRC-02 and CRC-03 correspond to F13, F01 and F14. Its CRC-04/05 are R01/R02.

### Complete finding ledger

| ID | Finding and evidence | Minimal intended disposition |
| --- | --- | --- |
| F01, valid, P1 | `windows_probe.rs::cuda_precisions_for_compute_capability` reports BF16 for major >= 8; native/renderer admission uses that fact. The frozen adapter requires exactly compute capability `(12, 0)` and `sm_120`. | Restrict both admission paths to the actual default visible CUDA device and exact supported architecture. Preserve the adapter and Torch/CUDA versions. |
| F02, valid with qualification, P2 | `host_profile_detection/windows_probe.rs::adapter_memory` reports DXGI `Budget - CurrentUsage` as available dedicated memory. This is process-budget headroom, not proof of free device memory for the TTS child. An actual out-of-memory failure has not been reproduced. | Correct the provenance/meaning of the available-memory fact and its admission consumers. Use a documented provider-appropriate probe for the same default device; otherwise report unknown rather than manufacture free memory. Do not lower thresholds to hide the mismatch. |
| F03, valid, P2 | `xhtml-projector.ts` chooses the first spine entry for a path; `open-epub-publication.ts` projects each supported manifest document once; `locator-index.ts` requires a projection for every accepted spine entry. Distinct entries sharing an XHTML fallback fail with `internal-failure`. | Bind the projection/index to each accepted spine occurrence while preserving resource identity, order, stable locators and bounded processing. Do not silently drop later entries or reject previously supported fallback input as the fix. |
| F04, valid, P2 | `narration-bilingual-normalizer.ts::matchesLexicalForm` applies attached-numeric-syntax protection only to `number`. It can expand `25 %` in `0.25 %` and `14:30` in `12:14:30`. | Extend conservative whole-expression boundary protection to affected percentage/time lexical forms in the mutable normalizer. Preserve ambiguous complete expressions, supported standalone expansions, source text and exact locator ranges. |
| F05, valid with corrected trigger, P2 | `release_core.py::atomic_stage` deletes `.previous` at the start of the next attempt. When earlier promotion and restoration both failed, that backup can be the sole surviving package. | Recover or retain the backup before a retry can destroy it; preserve it if restoration remains blocked. Use tiny real filesystem fixtures with injected move failures. No Piper runtime rebuild is necessary for this packager-only fix. |
| F06, valid under the stated condition, P2 | `hardware-profile-matcher.ts` reapplies the full free-RAM start requirement; compatibility reconciliation in `product-narration-coordinator.ts::checkAvailability` can stop an active scheduler after the loaded model consumed that RAM. This is not a failure on every window restoration. | Distinguish admission for a new allocation from continuation of the same admitted, healthy session. Preserve genuine configuration/provider/fatal-resource containment and explicit start/restart checks. |
| F07, valid, P2 | `xhtml-projector.ts::deriveContext` rejects empty language and compares `lang`/`xml:lang` case-sensitively. | Accept explicitly unknown language, compare equivalent tags ASCII case-insensitively, and preserve the distinction between missing/inherited and explicitly unknown context through narration. Keep malformed controls/whitespace and actual conflicts rejected. |
| F08, confirmed in execution, P2 | The actual native Busy/start locking order permits an old pending-start shutdown to terminate a replacement. D6-F08-red-native-child preserves IPC order and reproduces the damage. | Bind pending-start shutdown to an additive bounded request identity allocated before dispatch. Final real-child green passes; no TTS wire protocol change. |
| F09, confirmed in execution, P2 | A real worklet can queue `ended` and then a Pause failure for A; FIFO delivery of `ended` installs B's handler before the failure. The real MessageChannel reproduction failed B. | Add unit identity to failed events and reject mismatches. Real current-unit failure remains effective; Node-worker and bundled-browser controls pass. |
| F10, valid, P2 | Coordinator snapshots read `playerObservation?.underrunCount ?? 0`; releasing the player loses its count. Restart also resets buffering/playback time. Recovery policy requires interruption history to survive recovery. | Retain bounded aggregate counters at the recovery-episode owner; snapshot before release, accumulate deltas without double counting and reset only at the documented new-episode boundary. |
| F11, valid, P2 | `xhtml-projector.ts::consumeStart` gives the root `omitted: false`, bypassing `hidden`/`aria-hidden` checks used for descendants. | Apply root omission while still validating document structure, budgets and cancellation. Do not turn a valid hidden chapter into a malformed-document error or narrate its descendants. |
| F12, valid, P3 | `product-narration-coordinator.ts::#stateFromActiveOwners` changes only `phase` to `failed`; inherited `canPause`/`canResume` survive player removal and drive dead controls. | Derive terminal actions from surviving owners; remove false pause/resume capability while retaining the intended explicit recovery action. Cover playing and paused failures. |
| F13, valid dependency-resolution gap, P1 | Packaged `torch/lib/c10.dll` imports `MSVCP140.dll`. The exact-name package copy is under `runtime/Lib/site-packages/sklearn/.libs/`, outside Torch's registered directories. No installer prerequisite supplies it. Failure on clean Windows is not yet reproduced. | Resolve the existing verified private DLL in the Chatterbox child before Torch import. Confirm the transitive chain; preserve v7 and avoid a machine-wide redistributable by default. |
| F14, valid declaration/load mismatch, P2 | The BF16-labeled profile's packaged T3 constructs `LlamaModel(config)`, loads weights and moves to CUDA without explicit BF16 conversion/autocast. Static tracing indicates FP32; live dtype has not been observed. | Observe effective dtype, then correct current explanatory metadata/documentation. Preserve arithmetic, profile IDs, historical receipts and manifests; correct the hypothesis if observation differs. |

### Release risks retained from the focused review

| ID | Existing boundary | Action |
| --- | --- | --- |
| R01, source-selection risk | `packaging/chatterbox_sources.py::resolve_runtime_sources` intentionally supplies frozen v3 modules for v7. Editing the current adapter does not change the distributed service. | Keep the fixes outside the immutable package; inspect existing source-selection guards and extend only demonstrated coverage gaps. Any successor must explicitly select its corrected source closure. |
| R02, coverage gap | `check-local` verifies identities, not native dependency resolution; the historical exact-local replay starts the Python smoke script directly. | Add loader/provenance evidence through the real production startup path. Hash acceptance and direct-Python smoke do not prove native launcher correctness. |

External semantics rechecked during planning: [Microsoft's DXGI memory fields](https://learn.microsoft.com/en-us/windows/win32/api/dxgi1_4/ns-dxgi1_4-dxgi_query_video_memory_info)
describe application budget/usage; the [HTML language rules](https://html.spec.whatwg.org/multipage/dom.html#attr-lang)
allow empty language and compare paired tags ASCII case-insensitively.

The exact existing package has archive SHA-256
`39dc073e01a5f02ce95b44e23b1024c3062ad1394fce3c917ec113fa45881aaf`
and runtime-manifest SHA-256
`48b392d82e9937e369170fd5c816b7a4ad766009f8816739441dddbd076c5d8a`.
Its runtime archive is 5,031,363,541 bytes; acquisition including six separately
distributed models is 8,240,315,465 bytes. CUDA **12.8** is the toolkit/runtime
version in Torch `2.9.1+cu128`; **12.0** is the GPU compute capability, not a
request to downgrade CUDA.

## Scope and non-goals

This is one coordinated bug-fix batch for F01-F07, F10-F14 and R01/R02, plus
bounded confirmation of F08/F09. Every finding reported in this chat is mapped
above; F08/F09 become implementation requirements only if validated. Findings
from other chats/completed plans are context, not additional work by association.
No general refactor, new engine, broader GPU support, automatic fallback,
transport repair, voice/rate matrix, new model,
quantization or on-device pip environment is included.

The primary path must leave v7 parts, runtime/model files, frozen source
identities, requirements locks, publication records and historical evidence
unchanged. Do not edit completed plans or generated files manually. Preserve
user installations, reader data and unrelated worktree changes.

If private DLL resolution cannot be made reliable with existing manifest-owned
files, stop that implementation path and record the exact missing dependency.
Revise this plan around one explicit prerequisite policy or one successor runtime
before any expensive build. Do not repeatedly rebuild v7, silently create v8,
publish assets, or add a global redistributable installation as an incidental fix.

## Relevant files and documentation

- Instructions: `AGENTS.md`, `.agents/PLANS.md`,
  `docs/development/agentic-change-review.md`, `docs/development/testing.md`,
  `docs/development/evidence-retention.md` and the evidence-reuse rules in
  `.agents/skills/validate-safe-refactor/references/validation-policy.md`.
  This is behavioral work; the refactor campaign workflow is not adopted.
- Requirements/architecture: `docs/product/mvp.md`,
  `docs/architecture/overview.md`, `docs/architecture/system-diagram.md`,
  `docs/architecture/tts-support-matrix-v2.md`, `docs/user/windows-release.md`,
  ADR-0007, ADR-0012, ADR-0019, ADR-0028, ADR-0046, ADR-0063 and ADR-0064.
  Read completed M005 and its completed roadmap status before changing the
  safe-document-to-narration boundary; preserve its historical claims.
- EPUB: `packages/epub/src/document/xhtml-projector.ts`,
  `public/open-epub-publication.ts`, `locator/locator-index.ts`,
  `narration/narration-bilingual-normalizer.ts`, their existing focused tests and
  `integration/{ingestion,narration-preparation}-matrix.test.ts`.
- Narration state: `apps/desktop/src/tts/product-narration-coordinator.ts`,
  `hardware-profile-compatibility.ts`, `hardware-compatibility-check-binding.ts`,
  `ProductNarrationControls.tsx`, `operational-recovery.ts` and affected tests.
  Conditional owners: `process-client.ts`,
  `playback-backends/{web-audio-pcm-playback,incremental-wsola-v3-worklet}.ts`.
- Piper packager: `services/tts/src/voxleaf_tts/release_core.py` and
  `services/tts/tests/test_release_core.py`; inspect the already corrected
  Chatterbox promotion tests as a reference, without extracting a new framework.
- Admission: `apps/desktop/src-tauri/src/host_profile_detection.rs`, its
  `windows_probe.rs` and `tests.rs`; `tts_optional_chatterbox.rs` and its tests;
  `apps/desktop/src/tts/hardware-profile-{authority,registry,matcher,compatibility}.ts`,
  `host-profile-client.ts`, `OptionalChatterboxControls.tsx` and affected tests.
- If needed to carry the architecture fact: the existing shared host-report
  schema, decoder and fixtures under `packages/shared`, its generated outputs,
  and the existing contract generator. Do not expand the TTS wire protocol.
- Child startup: `apps/desktop/src-tauri/src/tts_service_supervisor.rs`,
  `tts_service_supervisor/tests.rs` and `host_diagnostics.rs`.
- Packaging safeguards: `services/tts/src/voxleaf_tts/release_chatterbox.py`,
  `packaging/chatterbox_sources.py`, `tests/test_chatterbox_sources.py`,
  `tests/test_release_chatterbox.py`; changes here need a demonstrated gap.
- Diagnostics: existing `scripts/test-chatterbox-runtime-smoke.py`, dependency
  security probes, native supervisor host diagnostic and `package.json`.
  Prefer a narrow extension of an existing owner to a new orchestration layer.
- Historical evidence: [v7 completed plan](../completed/chatterbox-msgpack-security-refresh.md),
  [v6 completed plan](../completed/chatterbox-filelock-setuptools-security-refresh.md)
  and ignored `services/tts/release/optional/chatterbox/dist/v7/evidence/`;
  [narration correction evidence](../completed/narration-logic-corrections.md),
  its [independent review](../evidence/narration-logic-corrections-review.md),
  ignored `tmp/evidence/narration-logic-corrections/`, and the
  [earlier lifecycle/EPUB acceptance](../completed/confirmed-logic-bugfixes.md).

Freeze the actual edited path list at execution start. New helper/test paths must
have a concrete responsibility and be added to that list before writing.

## Architecture and constraints

Keep local inference, one child tree, typed controls, bounded buffers and
identity-bound cancellation. No EPUB text, PCM, private paths or raw logs enter
tracked evidence. The ordinary service's stdout remains exclusively framed
protocol data; diagnostic metadata belongs in the bounded test harness.

### Cohesive implementation units

| Unit | Findings | Existing owner and correction boundary |
| --- | --- | --- |
| U1: EPUB projection | F03/F07/F11 | Projector plus its public projection/index callers. Preserve per-spine occurrence identity, navigation, source offsets, document budgets and cancellation. An empty language must remain explicitly unknown through source projection; simply dropping it would incorrectly restore inherited/default language. Hidden roots still require well-formed structure validation. |
| U2: narration boundaries | F04, plus F07 integration | Mutable bilingual normalizer and existing source-to-segment tests. Protect full percentage/time expressions without adding a general numeric parser. Preserve accepted ES/EN standalone forms, code/foreign-language behavior and historical frozen normalizers/corpora under ADR-0063. |
| U3: active-session state | F06/F10/F12 | Compatibility/coordinator and existing controls. Keep start admission separate from continuation of the identical healthy service/profile/language. Store only bounded cumulative episode metrics; preserve real failures, cleanup, owner invalidation and explicit recovery limits. Terminal controls must reflect actual remaining capabilities. |
| U4: hardware admission | F01/F02 | Existing Windows probe, native gate, typed report and renderer matcher. Keep default-device identity and shared facts consistent. An unavailable measurement stays unknown; do not equate process budget, total memory or a guessed reservation with free device memory. |
| U5: Piper retry safety | F05 | `release_core.py::atomic_stage` and its tests. Restore/retain the sole backup before destructive cleanup. Follow the existing Chatterbox recovery principle without changing either payload, dependency resolution or installer. |
| U6: packaged Chatterbox startup | F13/F14/R01/R02 | Existing native launcher and narrow diagnostics; current explanatory docs/metadata. Resolve the private dependency, observe actual dtype, and preserve immutable v7 sources. |
| U7: conditional ownership | F08/F09 only if confirmed | Pending-start/shutdown and worklet/message ownership respectively. Establish an actually reachable ordering, then fix only that owner boundary. No change to WSOLA signal arithmetic, general process orchestration or public TTS protocol is planned. |

Freeze the actual path allowlist and coupled tests for each unit before writing.
U1/U2 and U3/U4 share integration concerns; accept them as one final batch rather
than running separate browser/model campaigns for every row. F08/F09 must have an
explicit disposition before expensive final host preparation: reproduced and
included, disproved by control flow/order evidence, or unresolved and honestly
reported. Do not promote a failed attempt to reproduce into proof of absence.

For F02, choose a documented device-memory measurement at M0 using the existing
native probe ownership and the same CUDA ordinal/LUID association. Account for
any driver context lifetime and cleanup; avoid subprocess/model loading just to
read hardware. An unconditional unknown fallback is honest diagnostic behavior,
but is not complete supported-host acceptance if it disables all Chatterbox
hosts. Do not introduce an NVML/toolkit/package dependency without documenting
its purpose and alternatives. A memory reading remains an observation, not a
reservation or guarantee against later resource pressure.

For F06, no start/restart may reuse a running-session exemption after its owner
was stopped, replaced or failed. Genuine hardware/profile invalidation still
contains the session. Do not estimate model usage and add it back to RAM, or
disable compatibility reconciliation wholesale. F10's episode totals must survive
failure and its permitted explicit restart, without retaining PCM or unbounded
history; new book/user episode resets remain intentional and tested.

For F13, prefer a fixed, native-owned Chatterbox-only bootstrap at the existing
`ExactRuntime::command` boundary. Use absolute, already verified package paths;
register/preload the exact private DLL before importing Torch and retain any DLL
directory handle for the child lifetime. Confirm its transitive dependencies and
actual loaded-module origin. Do not depend on global PATH changes, load a DLL in
the parent and assume inheritance, copy files into the immutable runtime, or let
renderer input select executable Python or arbitrary directories. Keep Piper and
Qwen command construction unchanged. A cold child is essential to avoid a
previously loaded system DLL hiding the defect.

For F01, retain the selected CUDA device's actual major/minor values rather
than reconstructing them from BF16 support. Carry the smallest necessary fact
through the existing typed host-report path if the renderer needs it; document
any additive contract change, regenerate outputs and cover old/missing-field
behavior explicitly. Keep generic hardware facts truthful: do not claim that an
8.x GPU lacks BF16 just to reject it for this specific profile. The renderer and
native pre-network/start checks must agree; cleanup must remain available.

For F14, distinguish required hardware capability from actual dtype. Preserve
the legacy `...cuda-bf16-default-v4` identifier and persisted selections. Record
effective parameter and relevant activation/autocast observations without
tensors or text. If observation contradicts the static FP32 expectation, correct
the finding and current explanation rather than changing arithmetic to fit it.
Do not rewrite frozen benchmark records. A numerical change is outside this
minimal path and invalidates the quality/performance reuse decision.

Record durable changes in an appropriately scoped ADR or amendment: truthful
hardware-memory/admission semantics, current numeric boundaries, and private DLL
resolution. Review the system diagram and M005 boundary/terminology; update only
current labels/contracts or actual dependencies. Do not rewrite completed plans
or claim new TTS functionality from a narration-preparation correction.

## Milestones

### M0 — Freeze scope, baseline and reuse decisions

Status: **Complete: scope/design and focused red evidence recorded in the ledger.** Inspect drift from the planning base and preserve any
new user changes. Resolve original receipts and their before/after manifests.
Create a gate ledger with every F/R ID, input identities, commands, environment,
status and invalidation rules. Resolve F08/F09 through source-order analysis and
the smallest controlled regressions before selecting their implementation scope.
Select regressions for the 12 supported findings in existing owners and obtain
focused red evidence before fixing behavior; do not run a fresh full baseline.

Use cheap PE/source inspection to enumerate the DLL chain and lookup paths. Check
the packaged MSVCP exports/imports against the exact Torch binaries before choosing
the bootstrap. Freeze the narrow architecture-contract design and clarify the
precision terminology and F02's device-memory source. Missing proof is a pending
item, never a presumed PASS. Record the count/disposition of all 14 findings;
the two duplicate Chatterbox architecture reports remain one F01.

### M1 — Apply the smallest corrections and permanent regressions

Status: **Complete: U1-U7 implemented, including both confirmed candidates.** Implement U1-U6 with the regression/acceptance cases below,
and U7 only for confirmed candidates. Use existing ownership; do not refactor the
whole projector, coordinator, probe or package framework. Cover R01/R02 through
existing guards and the real-startup diagnostic. Register any missing focused
command before use. Do not assemble an archive for desktop or packager-control
changes. Complete inexpensive corrections and all harness changes before GPU work.

Minimum regression expectations, grouped so shared work is done once:

- U1/U2: two distinct spine items with the same fallback open and resolve their
  own locators, navigation and narration ranges; empty/case-equivalent language
  works with nested inheritance/override; invalid conflicts remain rejected;
  hidden/ARIA-hidden roots yield no visible/narrated descendants without skipping
  structural checks. Preserve `0.25 %`, `12:14:30` and adjacent compound forms,
  while valid standalone percentages/times still expand in current ES/EN routes.
  Include the existing source-map, cancellation, budgets and frozen controls.
- U3: restoration/recheck after a successful load keeps the same healthy owner
  when only its startup headroom was consumed. New starts, real invalidation,
  replacement and explicit recovery stay guarded. Fail after at least one
  underrun, restart once, then verify monotonic episode totals without double
  counting and deliberate new-episode reset. Playing/paused synthesis failures
  remove dead Pause/Resume capabilities in coordinator and mounted controls.
- U5: use real tiny directory moves with injected promotion and restore failures;
  repeat a blocked retry, verify the sole marker survives, then successful recovery
  and cleanup. Preserve an unrelated sibling. No real package/installer is built.
- U7: test actual pending-start/IPC locks and MessagePort FIFO/lifecycle constraints,
  not arbitrary callback order alone. If confirmed, retain valid current-owner
  shutdown/failure, late previous-owner rejection, cancellation and cleanup controls.

U4/U6 additionally require exact private DLL origin and missing/invalid input;
unchanged non-Chatterbox command paths; CUDA 8.x/9.x rejection, 12.0 acceptance
subject to resources, unknown/unsupported capability rejection, default-device
selection, and rejection before any download callback. Cover renderer/native
agreement, truthful available-memory facts, retained-data removal and historical
source selection. Test only new or changed invariants; do not duplicate existing
suites under new names.

### M2 — Run fast gates, then freeze executable sources

Status: **Complete: foundation leaves and grouped browser coverage recorded.** Run affected format/lint/types and focused regressions
in normal local PowerShell. Generate contracts only through the registered
generator if the schema changes. Refresh shared/EPUB build outputs before desktop
tests consume their `dist` exports; do not accept stale compiled fixtures. Run
the grouped browser cases before models. Freeze production, tests, harness and
relevant documentation before host work; avoid the historical R7-to-R8 rerun caused by a
late test-file annotation. Record the exact source manifest and candidate build.
Complete the foundation leaves needed for that final build before M3, preferably
the remaining deterministic foundation as well. M4 then closes the ledger/review;
it is not a reason to rebuild an already verified executable after model gates.

### M3 — Validate packaged integration and real startup once

Status: **Complete: final pinned F08/loader/Piper/ES/EN gates, integrity and cleanup pass.** Check short writable scratch paths, tool versions,
existing package/model hashes, driver, GPU capability, free resources and owned
process cleanup before inference. Reuse verified local artifacts; do not download
models or reconstruct the three-part ZIP for a launcher-only change.

Reuse a final matching build for one existing Piper EN packaged WebView2 arm,
covering the changed engine-neutral reader/session path. Do not enable its
six-rate sweep by default; fresh focused signal/browser evidence covers changed
worklet ownership if F09 is confirmed. Preserve the historical six-rate results
as historical evidence, not current acceptance of modified code.

Before Chatterbox inference run a fresh-process DLL/import/provenance probe
without models or GPU work.
Prove private MSVCP selection even on a developer host with a system copy; include
a controlled negative case. A cleared PATH alone is insufficient because System32
is still searched. Do not rename/remove system DLLs or uninstall host software.

Then run one sequential ES/EN acceptance session through the actual production
launcher and supervisor, using v7 and the exact six models. Cover handshake,
load/warm, bounded finite PCM, health, in-flight cancellation, child termination
and explicit restart. Record effective dtype in this session or a bounded
non-inference probe; do not add an entire voice benchmark merely to observe it.
Require zero unauthorized network attempts and zero persisted audio. Verify
runtime integrity and cleanup afterward. Reuse the prepared tree and build across
the two arms; never run model arms or native linking concurrently. Cover F01/F02
on the actual supported device and F06's loaded-owner reconciliation through the
combined UI/native evidence. Use the corrected synthetic preparation examples
where a harness accepts them; no broad pronunciation/quality claim follows.

The existing direct-Python smoke and `exact_local.rs` replay do not exercise
`ExactRuntime::command`. Extend the existing native diagnostic/test owner with a
narrow opt-in entry point that does, including release-locked behavior and a
disposable data root. Register its command during M1; it does not exist yet and
must not be represented as a previously passing check. Keep receipt-only dtype
instrumentation out of ordinary product controls and the public service protocol.

The target is one CPU reader arm plus two sequential GPU language arms, with
no separate full portfolio run. If an existing combined runner can cover the
same current invariants in one arm, record that mapping instead of repeating it.
Missing cases require only their smallest additional scenario, not all models.

### M4 — Integration and independent acceptance

Status: **Complete: CHAT-FINDINGS-R3-ASTRA-20261027 APPROVE, including scoped evidence reuse.** Complete the applicable foundation graph once. Prefer
an explicitly recorded equivalent set of existing `pnpm.cmd check` leaves:
credit M2's passing gates whose complete inputs still match, then execute only
uncovered or invalidated leaves. Use the aggregate when establishing equivalence
would cost more than running it; do not repeat all fast gates merely because
this is the final milestone. Preserve both Rust feature configurations and all
affected generated contract consumers. Reuse an already built binary only for
the identical build configuration and inputs; a default executable is not a
release-locked build. Do not run both full `check` and `check:portable` by default.

Delegate the exact final patch and gate ledger to `change_reviewer` (GPT-6 Astra
high) under `docs/development/agentic-change-review.md`. The reviewer does not
execute tests. Require a new APPROVE report that explicitly accepts each reuse
decision; historical approvals do not transfer. Missing evidence/reviewer remains
BLOCKED. Correct only actionable issues and rerun affected gates. Archive the plan
only after all required outcomes, cleanup and independent review are complete.
Later implementation commits/push/publication require their own user authorization.
The final ledger must account for all F01-F14 and R01/R02: 12 supported defects
corrected, candidate fixes only when confirmed, and evidence for any rejection.
An unresolved F08/F09 remains explicitly pending and prevents claiming that all
findings have been disposed of; it does not justify a speculative production fix.

## Testing and benchmark strategy

All future tests and validation commands run in normal local PowerShell outside
the managed sandbox. Planning only read code and retained receipts, compared
selected identities and edited documentation; it executed none of the tests below.

### Earlier EPUB, narration and lifecycle evidence

The completed narration-logic plan records the earlier fixes and their own
acceptance. They are not the new findings in this chat. This scope correction
inspected that plan/review, raw `I1.log`, `B1-R02.log`, `H1-R02.log`,
`H2-R03-result.json`, executable identity and selected source manifests under
`tmp/evidence/narration-logic-corrections/`.

| Prior gate | Retained outcome | Reuse decision for this batch |
| --- | --- | --- |
| NLC focused F1/F2/F3a/F3b/F4 | Closeout records 47/92/17/17/124 passing respectively: worklet, coordinator/persistence, native default-device and normalization regressions. | Existing tests/fixtures are useful regression owners. Their old PASS cannot prove new percentage/time, recovery or memory-provenance behavior. Rerun the affected groups; do not recreate equivalent harnesses. |
| NLC I1 | Raw log and closeout show `pnpm.cmd check` success; shared/EPUB/desktop 209/680/837, Node 100, Rust 120/119 with two intentional ignores each, Python 645. | Historical baseline. It predates follow-up coordinator edits and later v7 integration. Use the newer v7 CI baseline where relevant; neither accepts new code. Do not repeat a full failing baseline. |
| NLC B1-R02 | Raw browser log: 1/1 passed in 23.9 s, real bundled worklet tail plus manual save/reopen. | Reuse the existing spec and synthetic EPUB/PCM seams. Current grouped browser cases must cover the new EPUB/session behavior and F09 if confirmed. |
| NLC H1-R02 | Raw native log: Piper EN passed; six rates, cancellation 188 ms, 0 external requests and 0 persisted audio; five contexts closed. | Original measurement/unchanged model reference only. One current CPU reader arm covers the changed owner/preparation path; no automatic six-rate/model portfolio repeat. |
| NLC H2-R03 | Original result: exit 0, 403.89 s, Chatterbox ES using v6; before/after executable SHA-256 `4c60a4ee9829983b6f6340c0df50def6513bc0723e93561b43e9dddbe614ecd8`. | Not v7 launcher acceptance and not the first I1 executable (`e1369b...`). Keep the prior missing-runtime failure and its separately authorized installation history. New v7/native evidence is required. |
| Earlier CLB acceptance | Completed plan/review records full check, browser 10/10, native and four supported-profile reader arms for the earlier five defects. | Historical adjacent coverage only; it does not validate F08/F09's proposed orderings. No reuse approval is inferred from a completed plan title. |

Selected comparisons against the NLC integrated manifest matched the current
native host detector, worklet, mutable normalizer and normalizer test; the
coordinator differed. This is partial inspection of an earlier checkpoint, not
full closure proof or evidence that a previously accepted defect returned. Use
the final review's appropriate identities for any proposed reuse and include
imports, compiled workspace outputs, runner, native binary and environment.

### Previous Chatterbox v7 execution evidence inspected during planning

The receipt directory is `services/tts/release/optional/chatterbox/dist/v7/evidence`.
Each named result has accompanying logs, environment and before/after source
manifests. Public summaries omit their machine-specific paths.

| Original evidence | Recorded result | What it actually establishes |
| --- | --- | --- |
| `C1-retained-package` | `package:chatterbox-optional:v7:check-local`, exit 0; about 227 s | Retained runtime, ZIP, parts and receipt matched at that checkpoint. |
| `S3-packaged` | msgpack 1.2.3 probe, exit 0; six security arms and four legitimate controls | The exact packaged msgpack behavior exercised, not all advisory variants. |
| `S4-runtime`, `S5-previous` | Exit 0; 3 security + 2 legitimate controls, and 5 rejected namespaces + 4 legitimate controls respectively | The specific existing certifi/Pillow and filelock/setuptools controls. |
| `S6-short-path` | Dependency probe exit 0, seven cases, zero network | Same bytes passed under a short path. Its original long-path failure remains recorded. |
| `P1-es`, `P2-en` | Exit 0; 3.96/3.24 s PCM; cancellation 406/297 ms; load/warm 31.032/20.594 s | Direct adapter smoke on that host. No full quality/performance or clean-host DLL claim. |
| `R8-exact-final-admission` | Exit 0, 1 test, 766.58 s; ES/EN 4.20/3.28 s PCM, cancellation 407/344 ms, zero network/audio files | Nine local artifacts, reassembly/extraction, rediscovery, direct Python smoke, integrity and removal. Supersedes R7's earlier test identity. |
| `N2-native-startup`, `R9-windows-consumer` | Exit 0; native startup and 22 Windows consumer tests | Original native reader/fake-service path and compiled NSIS/lifecycle controls. |
| `I14-release-rust` | Exit 0, 125 passed, 3 intentional opt-ins ignored | Original release-feature Rust suite; ignored tests were not passes. |
| `CI-final-ad9d5b0.json` and v7 closeout | Four hosted checks recorded as successful | Historical complete foundation/audit acceptance. Planning HEAD and `ad9d5b0991d04a56b12e6957346c893b114a5ff2` have identical Git tree `de50bf782cdf3933d206e8e28f1aeb348f10f96e`; this does not pre-approve later code. |

Planning compared the five security/smoke script hashes, v7 source manifest and
lock against S3/S4/S5/S6/R8 execution-time snapshots. The selected files match
before, after and the planning worktree; R8's test source also matches. This is
partial input proof, not a complete environment/transitive-dependency reuse grant.
The recorded environment was PowerShell 7.6.5, Node 24.20.0, pnpm 11.15.1,
uv 0.11.29 and Python 3.12.10. Refresh relevant environment evidence at execution.

### Reuse and rerun matrix

| Gate or asset | Decision for the primary path | Invalidation / required action |
| --- | --- | --- |
| Published v7 runtime, three parts and six models | **Reuse artifacts.** Keep immutable identities; one integrity pass over the inputs actually consumed is sufficient for preparation. | Changed/missing bytes require diagnosis. A filename, mtime or size alone is insufficient. Do not repeatedly hash unrelated archives when testing an already verified tree. |
| S3/S4/S5 security receipts | **Reuse candidates**, only for their unchanged library-specific invariants. | Require original receipts, full consumed input/runner/library identity and relevant environment proof. Changed probe/library or unknown assumptions require only the affected small probe again. |
| S6 dependency-import receipt | **Conditional reuse for unchanged library controls.** Rerun only affected cases when their actual consumed inputs or environment change. | It imports Transformers/Torch directly and does not run the native bootstrap. Old success with a system DLL cannot prove the new private loading environment; the fresh production-loader probe must supply that evidence. Do not add another standalone import run if the new probe covers the same invariant. |
| P1/P2 and R8 inference/cancellation timings | **Historical only.** Fresh production-launcher ES/EN evidence is mandatory. | Do not report old timings as current measurements or use direct Python smoke to accept native startup. |
| R8's complete 13-minute acquisition replay | **Do not rerun by default; do not claim its whole PASS for the new native binary.** Its immutable artifact evidence and historical extraction coverage remain references. | Rerun the configured replay once if acquisition, reassembly, extraction, promotion, removal, runtime layout or artifact identity changes, or if focused replacement coverage cannot establish independence. Admission-before-network changes receive focused current tests. |
| Old broad voice, all-rate, quality, throughput and physical multi-GPU matrices | **No automatic full repeat.** Current text/ownership changes receive the deterministic ES/EN, browser, CPU and GPU checks below; old results keep their original corpus/implementation limits. | A model, arithmetic/dtype, Torch/CUDA, generation/DSP, work-buffer bound or observed performance regression requires a revised targeted benchmark/quality matrix. New normalization output is not covered by old pronunciation/timing claims. Synthetic GPU cases are not physical multi-GPU evidence. |
| Native startup, host-report contracts and affected renderer/native tests | **Run current affected checks.** | Their implementation or process environment changes. Historical CI cannot replace these. |
| EPUB projection/locator/normalization, coordinator, controls and any confirmed concurrency correction | **Run current grouped regressions plus the focused browser selection.** | These boundaries are now explicitly in scope. Earlier NLC/CLB checks cannot establish the new behaviors. Preserve current frozen-authority tests rather than changing expected historical output. |
| Piper runtime/models and packager retry | **Reuse immutable payload; run current small packager failure/retry tests.** | F05 changes staging control, not generated package contents. Rebuild only if a later change actually alters payload selection/manifest/recipe; no installer campaign by default. |
| Existing browser/model harnesses and synthetic fixtures | **Reuse code/fixtures, not old PASS.** | Refresh dependent shared/EPUB outputs and app binary before execution. New-case coverage must be demonstrated with current implementation. |
| Installer lifecycle/NSIS campaign | **Not required if installer and ownership behavior stay unchanged.** Existing deterministic consumer tests remain in foundation coverage. | Adding a redistributable installer, new prerequisite flow, NSIS change or installed layout change requires fresh relevant installer acceptance. |
| Full live HTTP acquisition | **Not required for these fixes.** | V6 read timeouts remain unresolved; no V7 complete-delivery claim. Run only under separately scoped transport work, not to diagnose DLL/GPU errors. |
| Historical foundation/CI | **Baseline only for edited dependency closures.** | Execute final relevant leaves once after freeze. Required future hosted checks are not waived; current authorization includes no push. |

Reuse requires the original command/outcome/input snapshot, unchanged transitive
inputs and tested artifact bytes, matching relevant environment and the same
invariant. Record dependency comparisons and the original gate IDs in the new
independent report. Never regenerate old identities to renew a prior approval.
When proving reuse would cost more than rerunning a small deterministic probe,
run that probe once instead. Artifact reuse does not imply measurement reuse.

### Commands and execution order

The runners/commands below already exist in repository configuration; their
future new-case selections are not claimed to have run or exist today. Working
directory is the repository root unless stated otherwise. Before a focused
desktop group, use `pnpm.cmd build:packages` only if its shared/EPUB compiled
inputs are missing or stale. Run a new regression's narrow name filter for red
evidence, then its relevant existing group after repair. Do not append Vitest
filters to the desktop `test` wrapper, which also chains Node suites.

| Focused group | Existing command / runner selection | Findings and acceptance |
| --- | --- | --- |
| D1 EPUB | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/locator/locator-index.test.ts src/public/open-epub-publication.test.ts src/integration/ingestion-matrix.test.ts src/security/processing-budget.test.ts` | F03/F07/F11: public opening, per-occurrence locators, language inheritance, root omission, safe structure and bounded work. |
| D2 narration | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-source-projector.test.ts src/narration/narration-prepared-segment.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts` | F04/F07 plus F03/F11 integration: current ES/EN routes, literal preservation, exact source maps, cancellation and historical frozen controls. |
| D3 session/UI | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/hardware-profile-matcher.test.ts src/tts/hardware-profile-compatibility.test.ts src/tts/hardware-compatibility-check-binding.test.ts src/tts/ProductNarrationControls.test.tsx` | F01/F02 renderer side and F06/F10/F12 owner/metrics/action semantics. Group the coordinator changes into one post-fix run. |
| D4 native | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml host_profile_detection::tests`; same command with `--features release-locked-runtime`; corresponding existing `tts_service_supervisor::tests` and affected `tts_optional_chatterbox::tests` selections | F01/F02/F13 and F08 if confirmed. First red evidence can use one configuration; final acceptance preserves both configurations. Freeze exact selections at M0 and credit equivalent coverage in final foundation instead of redundant whole-suite executions. |
| D5 packager | `uv run --project services/tts --locked pytest services/tts/tests/test_release_core.py` | F05: actual tiny directory moves, failed promotion/restore, repeated blocked retry, successful recovery and sibling preservation. This is a focused leaf of the configured Python runner, not a package build. |
| D6 candidate confirmation | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/process-client.test.ts src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/tts/pcm-playback.test.ts`, with supported case filters | F08/F09 only. Combine with D4's supervisor ordering where needed. If confirmed, retain a permanent regression and run the affected group after repair; otherwise record why the proposed harmful order is unreachable or remains unconfirmed. |
| B1 mounted reader | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep CHAT-AUDIT` | Planned new label in the existing spec, added in M1. One invocation covers new EPUB/locator/hidden-language wiring and failure/recovery controls with synthetic data. Include real bundled worklet ordering if F09 is confirmed; synthetic service events do not prove model inference. |
| H-CPU | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | One existing packaged WebView2 reader arm for U1-U3. Reuse the final matching app build and admitted Piper core. Do not add `--exercise-playback-speeds` unless changed DSP/observations justify it. The stable profile ID is not a request to install an old Piper runtime. |

| Phase | Existing command / configured leaf | Selection and acceptance |
| --- | --- | --- |
| New regression red/green | The two Cargo leaves of `pnpm.cmd test:rust`; the `vitest run` leaf in `packages/shared/package.json` and `apps/desktop/package.json` | These are existing configured runners, not a new named command. Freeze exact supported test filters and working directories in M0. Cover the changed boundary in both Rust configurations; desktop's wrapper appends Node tests and must not be assumed to forward Vitest filters correctly. |
| Contract generation, if needed | `pnpm.cmd --filter @voxleaf/shared generate`; `pnpm.cmd --filter @voxleaf/shared generate:check` | Generated output matches the coordinated host-report change; frozen packaged modules stay byte-identical. |
| Fast quality | `pnpm.cmd format:check:rust`, `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:rust`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript`; `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`, `pnpm.cmd typecheck:python` | Run before costly preparation. F05 makes the existing Python leaves relevant; include shared schema/decoder checks when U4 changes the typed report. |
| Existing source guards | `pnpm.cmd test:chatterbox:v7:preparation` with a supported focused pytest selection; `pnpm.cmd package:chatterbox-optional:v7:check-source` | Current source-selection regression preserves v7 and historical authority. No lock generation/build. |
| Conditional dependency-security probe | `pnpm.cmd test:chatterbox:dependency-security` | Only for affected controls that cannot be reused or covered by the new loader probe. Use the exact verified interpreter and short scratch root; this command alone does not exercise the native bootstrap. |
| Fresh loader/native ES/EN | Existing `ExactRuntime::command` / supervisor diagnostic extended with a narrow registered opt-in command in M1 | Command is **pending implementation/registration**, not an available command today. Capture DLL origin, dtype, native protocol, cancellation/restart, privacy and cleanup on frozen inputs. |
| Final foundation | Existing leaves of `pnpm.cmd check`, or the aggregate if more economical | Map every required leaf to a current or independently approved reused receipt, preserving arguments, build dependencies and both Rust variants. Credit unchanged M2 gates; execute only remaining/invalidated leaves. Do not claim the aggregate ran if only leaves ran. |
| Conditional artifact replay | `pnpm.cmd test:chatterbox:v7:local-admission` | Only on the explicit invalidation conditions above; local verified inputs, no HTTP. |

One focused browser invocation, one fresh loader probe, one CPU reader arm and
one sequential ES/EN GPU session are the minimum integration/host targets, not
promises that an unexpected failure may be ignored. The new browser cases and
native opt-in must exist and cover their listed invariants before being accepted.
Avoid separate direct-adapter, full replay and broad portfolio runs proving the
same invariant. Reuse the final build across host gates; skip a second build only
when its arguments/features/resources and input identities truly match. Pure
documentation edits after freezing require documentation checks/review, not
another GPU session when they are not consumed inputs.

## Risks and rollback

- Shared fallback projection must not duplicate global identities, lose a spine
  occurrence or amplify memory/work beyond existing budgets. Include bounded
  repetition controls rather than relaxing resource limits to make it open.
- Unknown language and hidden roots cross ingestion/narration boundaries. Preserve
  source text, deliberate unknown context and validation of omitted structure.
- Session continuation must not grant admission to a new model, conceal genuine
  failure or create automatic retry. Metrics retain bounded totals, not old audio
  or event histories. New episodes must not inherit old counts accidentally.
- Tiny Piper fixtures must exercise actual moves/retries, never the user's only
  installed package. A backup is recovery input until safely superseded.
- An existing MSVCP file may have an incompatible export/version or another
  unresolved dependency. Resolve this in the cheap closure/import stage. Do not
  patch binaries, use an arbitrary machine copy or weaken hash verification.
- A new CUDA fact can affect generated contracts and callers. Missing/unknown
  values must conservatively block only Chatterbox; preserve CPU availability,
  default ordinal behavior and removal. Review contract changes explicitly.
- Correcting a precision label must not become a numerical optimization. A real
  BF16 change requires replanning and new quality/memory evidence.
- Historical receipt environment coverage may be insufficient. Mark that reuse
  candidate unresolved and rerun its affected gate; do not discard other valid
  receipts or restart an entire campaign automatically.
- Long-path failures already occurred. Use short isolated host paths; if a drive
  alias is necessary, journal ownership and remove it in verified cleanup.
- Preserve processes, firewall rules, caches and user installations. Journal any
  owned host mutation and verify restoration after success, failure or interruption.

Keep pre-change sources and untouched v7 artifacts as rollback points. Revert
only task-owned source changes if the minimal approach is rejected. A failed
stage gets at most one infrastructure retry with a concrete changed condition;
a second failure stops that stage for diagnosis/replanning. Preserve failed
receipts. Do not reset retry counts by changing a run name or rebuilding blindly.

## Progress log

- 2026-10-27: M0-M4 complete. R1 review found two bounded regressions; both were
  reproduced, corrected and independently cleared in R2. Fresh final native
  byte-bound F08/loader/Piper/ES/EN and cleanup gates pass. R3 APPROVE accepts the
  complete implementation and scoped foundation reuse. Archive and maintained
  link updates follow; the exact archive/link review is retained separately in
  `tmp/evidence/validated-chat-findings/review-R4.txt`, outside its own manifest.

- 2026-10-27: Execution authorized at planning HEAD `5f67bd6`, with clean index
  and worktree. The execution ledger freezes units, input snapshots and commands.
  Focused host red evidence reproduced F03/F04/F05/F06/F07/F10/F11/F12 and the
  hardware/loader gaps. F08 and F09 were subsequently confirmed with real native
  child/lock order and real processor/MessagePort FIFO; both now require fixes.
  Fourteen unique F findings and R01/R02 remain the final acceptance inventory.
  Applied bounded corrections, generated the additive host-report field through
  the registered generator, added pending-start IPC request ownership, and added
  native loader/supervisor diagnostics. No package/model build/download or Git
  mutation occurred. M2 integrated checks are in progress; M3/M4 are pending.

- 2026-10-27: Planning-only request received. Clean `main`/index observed at the
  recorded base; branch `codex/chatterbox-runtime-correctness` created.
- 2026-10-27: Read v7 closeout and original C1/S3/S4/S5/S6/P1/P2/R8/N2/R9/I14
  receipts, selected logs and before/after input manifests. Compared selected
  source hashes and confirmed the final-CI tree equals the planning base tree.
  No tests, runtime imports, GPU work or package builds executed.
- 2026-10-27: Initial Chatterbox-only plan/indexes committed as `6eed9b4`.
  All implementation/execution milestones remained not started.
- 2026-10-27: User clarified that the plan must cover all valid findings in this
  chat. Recovered all three searches, the 12-item revalidation and focused review.
  Renamed/expanded this plan to 12 supported defects, two conditional candidates
  and two release risks, with explicit deduplication and source/test ownership.
  Inspected NLC/CLB historical records and selected retained NLC logs/identities;
  broadened minimal fresh gates without scheduling new inference-package builds.
  This is still documentation-only planning; no tests or implementation ran.

## Discoveries and decisions

- The initial plan incorrectly excluded earlier EPUB/narration/Piper findings.
  This scope correction includes every report in the chat and preserves the
  revalidation's qualifications instead of treating all 14 as confirmed bugs.
- Existing Chatterbox backup-retry safeguards do not repair Piper's separate
  `atomic_stage`; its small packager correction is independent of model payloads.
- NLC's first I1 and final R02/H2 executable identities differ; its coordinator
  also changed after I1. Historical counts/approvals cannot be transferred merely
  because the same test or plan name appears in the new batch.
- Prefer resolving an already distributed DLL in the existing child boundary
  over changing a 5-GB archive. This is a planned solution, not validated yet.
- Prefer accurately describing existing arithmetic over silently applying BF16.
  Keep CUDA 12.8 and the exact `(12, 0)` architecture requirement distinct.
- R8 executes `python.exe` plus the smoke script directly at
  `tts_optional_chatterbox/tests/exact_local.rs:106`; its success cannot establish
  behavior of a modified native launcher. Its direct adapter cancellation also
  does not replace a current in-flight supervised cancellation check.
- S3/S4/S5 probe inputs inspected during planning match their old manifests;
  complete reuse remains subject to the execution ledger and independent review.
- The original final integration review was
  `CB-V7-INTEGRATION-R2-ASTRA-20261027`; it approved its own exact patch only.
  R1 required a second expensive replay after a late test change. Freeze test and
  harness sources before the costly stage to avoid repeating that pattern.
- The primary path has zero optional package builds, zero model downloads and
  no full HTTP transfer. A fallback that changes payload or installer behavior
  must revise both the implementation boundary and required gates first.

## Final validation results

**Completed and independently accepted.** All fourteen unique
findings are implemented, including the two candidates confirmed with real
ownership/order reproductions. R01 source-selection guards and historical v2
identity correction pass; R02's production-command loader control passes.
The [execution ledger](../evidence/validated-chat-findings-corrections.md) owns
exact commands, input snapshots, retained failures and proposed evidence reuse.

M0-M3 are complete. Both Rust configurations, the equivalent TypeScript/Python
foundation graph, builds, evidence checks and four grouped browser outcomes are
covered. Cold private-loader, Piper EN WebView2 and native sequential Chatterbox
ES/EN arms pass. Runtime/model integrity, zero audio persistence and owned cleanup
are verified. M4's exact independent review is APPROVE. No fresh installer
or full acquisition result is claimed.

Review `CHAT-FINDINGS-R1-ASTRA-20261027` requested two corrections: read-only
cleanup metrics and provider-local unknown CUDA free memory. Both are now fixed;
four new desktop controls and a native control pass. Current desktop suite is
867 cases; native suites are 132/131 with six opt-ins ignored each. Current
browser four-case matrix and default app build pass. The changed linked native
executable invalidates initial loader/GPU acceptance for final bytes. Freeze the
produced executables, perform bounded code review, then run the same loader,
Piper EN, F08 and ES/EN opt-ins on final identities; preserve initial receipts.

`CHAT-FINDINGS-R2-ASTRA-20261027` resolved both code findings with no remaining
code/coverage issue and required only final host receipts. Those now pass:
`R1-D6-F08`, `R1-H-LOAD`, `R1-H-CPU`, `R1-H-GPU` and `R1-H-cleanup`.
The same frozen release-locked test binary performed loader and bilingual work;
all three final executable hashes remain unchanged. Piper EN starts in 5,717 ms
with 23,359 ms lead and cancels in 557 ms. Chatterbox ES/EN cancels in 240/219 ms,
with FP32 observations, zero guarded network/audio writes, runtime/model hashes
verified and no owned process/scratch left. No further code change followed.

`CHAT-FINDINGS-R3-ASTRA-20261027` is the independent implementation APPROVE,
including each retained evidence group. Its exact manifest, patch and report
are retained under the ignored evidence directory. No acceptance-blocking
uncertainty remains within the requested scope. Host results cover the recorded
machine/profile scenarios; physical multi-GPU, a new clean-Windows installation,
full live HTTP delivery, installers and broad rate sweeps are not newly claimed.

All changes remain unstaged and uncommitted on the existing branch/HEAD.
No Git mutation, model download or new optional package version occurred.
