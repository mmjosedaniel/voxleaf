# Reader position and image lifecycle minimal corrections

Status: complete, 2026-11-10. M0-M3 implementation, current host checks and
independent review passed on the planning branch. Review RPI-CR-R1-20261110
returned APPROVE with no actionable findings.
Implementation commits, push and PR are not authorized. Initial implementation
HEAD is `26f92365eed3d30cbcb57eb2867b848d3beb28c4`, with clean index/worktree.
The preceding investigation was static. Current implementation evidence is in
the [execution ledger](../evidence/reader-position-and-image-lifecycle/execution-ledger.md).
Historical PASS results are not acceptance evidence for these changes.

Planning base: `2e464daacaeaca2a53c83d8f63d1b00ea2b27840` on `main`, with a
clean worktree and index. Planning branch: `codex/reader-position-image-execplan`.
This work spans M004's visual reader/persistence and M009/M010.2's existing
visible-passage, heard-checkpoint and appearance interactions. It is a bounded
follow-up, not a new roadmap milestone.

## Goal

Prevent presentation-only placement from replacing an authoritative saved
reading position, and let supported images load as the reader moves through a
chapter larger than the live-image budget. Correct the shared ownership paths
with the smallest cohesive changes, then verify complete user journeys and
their resource invariants instead of repeatedly repairing isolated symptoms.

Completion means the named acceptance cases below pass on the current patch,
with independent review. It does not mean that all future static reviews or
all possible EPUB/browser combinations are guaranteed to produce no findings.

## User-visible outcome

- Opening at a saved interior text offset, temporarily placing the beginning of
  its block, changing appearance, closing and reopening preserves the complete
  canonical checkpoint. Play still starts from the actually settled visible
  passage, subject to the existing paused/active narration rules.
- A real subsequent manual scroll, explicit navigation or confirmed heard
  checkpoint can update progress through its existing admission rules. The fix
  must not freeze the original saved position indefinitely.
- In a chapter with more than eight supported images, scrolling to a later image
  loads it when it fits the released capacity. Returning to an evicted earlier
  image reloads it. Readers need not leave the chapter to recover capacity.
- Unsupported, malformed, animated and individually over-limit images retain
  the safe accessible fallback. More images simultaneously visible than the
  safety budgets allow may still show placeholders until capacity is available.

## Current state and initial classification

The table records the planning baseline. M0 reproduced RPI-01 with controlled
missing range geometry and RPI-02 in ordinary Chromium before production edits.
M1/M2 implement the corrections below; M3 acceptance and cleanup are complete.

| Case | Current evidence and classification | Missing protection or coverage |
| --- | --- | --- |
| RPI-01: fallback followed by appearance | `ReaderPublication.tsx` publishes block-start visual placement when the saved interior range cannot be placed. `reader-navigation.ts::setPreference` uses that active visual locator. Preference settlement reaches `App.tsx::handleSettledLocatorChange` and `reader-position-save-coordinator.ts::scheduleReflow`, which can admit it as the next saved position when narration is inactive. This is a statically supported composition defect; no new runtime reproduction is claimed. | Preserve the authoritative checkpoint through the complete fallback, appearance, lifecycle flush and reopen sequence, while retaining actual visible placement for narration. |
| RPI-02: image capacity through a long chapter | `SemanticRasterImage.tsx` disconnects its observer after first visibility and keeps a loaded source until cleanup/error. `PublicationRasterImageLoader` separately caps active-plus-queued requests at eight and collapses capacity rejection into `unavailable`. The source manager independently caps live sources and aggregate pixels. This is the existing bounded fallback policy, not evidence that earlier image-format fixes regressed. | Release eligible offscreen sources and retry transient pressure on a real capacity/visibility change, without weakening limits or creating an unbounded scheduler. |

Keep these historical distinctions explicit:

- The broad claim that initial recovery never saves was withdrawn. App already
  saves the package-resolved recovered canonical locator after successful
  visual settlement. DCR-02 in the
  [completed deep audit](../completed/deep-chat-audit-minimal-corrections.md)
  correctly protects a precise checkpoint from temporary visual fallback.
- The CAF-CI mounted test in `ReaderPublication.test.tsx` covers initial block
  fallback without a save. The App recovered-position test covers canonical
  recovery after a controlled settlement. Extend them through appearance and
  actual persistence rather than replacing those controls.
- CAF R7.2 in the [completed chat audit](../completed/chat-audit-minimal-follow-up.md)
  deliberately retains unavailable images on saturation. This plan proposes a
  narrow change to that lifecycle policy. Preserve the original historical record.
- JPEG density/orientation, WebP rejection and EPUB resource-read cancellation
  corrections remain regression controls. They address different causes.
- C15's late-scroll/fractional-geometry case remains modeled-only in the
  [EPUB follow-up](../completed/epub-budget-cancellation-and-reflow-follow-up.md).
  Check that interaction when changing layout ownership, but do not relabel it
  as a reproduced production defect or expand into a general reflow rewrite.

## Scope and non-goals

Two implementation units, executed in order, followed by one combined acceptance
milestone. RPI-01 has priority because it can replace persisted progress.

| Unit | Expected production edits | Direct coverage and support |
| --- | --- | --- |
| RPI-01 | `apps/desktop/src/App.tsx`, `apps/desktop/src/reader/ReaderPublication.tsx`, `apps/desktop/src/persistence/reader-position-save-coordinator.ts` | Existing App, ReaderPublication and save-coordinator tests. Change `reader-navigation.ts`, `reader-reflow-restoration.ts`, `active-visual-locator.ts` or desktop-local callback types only where the reproduction demonstrates that ownership/provenance must cross that boundary. |
| RPI-02 | `apps/desktop/src/reader/images/SemanticRasterImage.tsx`, `publication-raster-image-loader.ts` and their tests | `raster-image-source.ts` only for required capacity/release notification or closed result handling, preserving manager safety. Minimal reader viewport wiring and `apps/desktop/src/styles/reader.css` for stable placeholder geometry. Keep scheduler policy in the loader, not React rendering. |
| Integration | Existing browser restoration/image suites, synthetic fixtures and native reader smoke | Add the missing journeys to these harnesses. Reuse current image-format and performance fixtures. Document the exact paths added or changed before editing them. |

No new persistence backend/schema, shared or EPUB public contract, parsing or
normalization change, TTS service/model/DSP change, dependency, lockfile, CSP or
native capability change. No image-byte cache, higher capacity limits, chapter
virtualization, generic resource framework, broad refactor or silent test removal.
No installer/signing, acquisition, GPU/model-quality or full TTS matrix campaign
is needed for this desktop-only scope.

The original planning commit changed only this file and the active-plan index.
Future implementation records any necessary scope expansion and affected gates
before editing additional responsibilities.

## Relevant files and documentation

Production owners and existing tests are under the exact directories in the
scope table. Also inspect:

- `apps/desktop/src/persistence/reader-position-restore-coordinator.ts` and
  `narration-position-save-bridge.ts` for canonical recovery and heard ownership.
- `apps/desktop/src/reader/reader-reflow-restoration.test.ts`,
  `active-visual-locator.test.ts`, and `images/raster-image-source.test.ts`.
- `apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts`,
  `active-visual-locator.smoke.spec.ts` and
  `reader-performance.benchmark.spec.ts`, plus the existing production image
  journeys and `apps/desktop/tests/fixtures/`.
- `apps/desktop/scripts/native-startup-smoke.mjs`,
  `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` and the existing
  native harness tests. Extend their disposable synthetic-profile flows.
- Root and desktop `package.json`, Playwright configuration and
  `docs/architecture/performance-budget.md` before choosing filters or gates.

Requirements and authority:
[documentation index](../../README.md), [MVP](../../product/mvp.md),
[reader settings](../../product/reader-settings-and-playback-controls.md),
[roadmap](../roadmap.md), [overview](../../architecture/overview.md),
[system diagram](../../architecture/system-diagram.md),
[ADR-0010](../../architecture/decisions/ADR-0010-bounded-raster-image-decode.md),
[ADR-0011](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md),
[ADR-0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
[ADR-0070](../../architecture/decisions/ADR-0070-explicit-placement-and-recovery-boundaries.md),
[testing](../../development/testing.md),
[independent review](../../development/agentic-change-review.md), and
[evidence retention](../../development/evidence-retention.md).

## Architecture and constraints

### RPI-01: retain existing owners and separate admission from placement

The save coordinator already holds the latest admitted logical checkpoint.
Reuse it as persistence authority. The reader owns actual visual placement and
the narration coordinator owns active/heard state. Do not add a second storage
owner or equate every package-valid visual locator with new user progress.

| Event | Position authority |
| --- | --- |
| Initial exact restoration | Preserve the saved canonical locator even when visual placement falls back. |
| Package recovery of an invalid saved locator | Admit the package-resolved canonical replacement once successful initial settlement occurs, as today. A temporary DOM fallback is not package recovery. |
| Appearance/viewport/image layout | Preserve or flush an already admitted checkpoint. Do not admit the presentation result as a new position. Global display preferences still persist normally. |
| Real manual reading scroll while narration rules allow it | Admit the normalized new position through existing passive debounce and latest-only writes. |
| Explicit navigation | Admit the settled selected destination through existing navigation and narration rules. |
| Confirmed heard checkpoint | Preserve the existing segment/session validation and heard-position precedence. |
| Hidden/pagehide/close/replacement | Flush only the latest admitted checkpoint for that publication. Retired callbacks cannot write for a replacement owner. |

Start with the narrow `scheduleReflow`/App boundary: reflow may flush a pending
legitimate save, but cannot replace its locator with the presentation locator.
Preserve the existing 500 ms passive debounce, immediate navigation saves,
canonical recovery, serialized writes, storage-failure handling and future-version
protection. Do not merely remove a callback if that would lose a pending manual
save or narration's visible-placement notification.

Carry a small desktop-local typed origin/placement distinction only where needed
between callbacks. Existing initial-restoration and navigation revisions remain
the cancellation authority. Use existing sampling suspension and transaction
ownership to keep programmatic placement/layout observations out of passive
saves. If the integrated case exposes a delayed notification, address its actual
origin at that boundary, not with a fixed timeout, offset-zero rejection, or a
permanent "do not save" flag. Genuine user movement during/after reflow must
supersede stale layout work. Preserve late narrator attachment and StrictMode
ref detach/reattach behavior.

### RPI-02: recycle bounded image ownership near the reader viewport

Replace one-way visibility with enter/leave eligibility for the actual reader
viewport and a small fixed retention margin, starting from the current 256 px
policy. Release/abort work outside that region. Under pressure, actual visible
images take priority over prefetched/offscreen images; never evict a visible
source merely to prefetch another. Keep deterministic ordering when the visible
set itself exceeds capacity. Capacity becomes reusable without leaving the chapter.

Keep policy and queue ownership in `PublicationRasterImageLoader`. The component
reports eligibility, renders the closed result and closes its occurrence handle;
the loader owns and releases that occurrence's decoded source.
The existing source manager remains the final predecode and live-budget guard.
Do not add a competing generic cache or a second scheduler.

- Keep eight active-plus-queued loads, one active browser decode, eight live
  sources and 16,777,216 aggregate live decoded pixels. Preserve the existing
  per-resource bytes, dimensions, frames, physical-pixel and orientation checks.
- Distinguish transient queue/live-budget pressure from permanent invalid,
  unsupported, over-limit or decode-failed outcomes in desktop-local results.
  Closed/cancelled owners cannot retry. Preserve fixed content-free UI messages.
- Retry only still-eligible occurrences after a relevant capacity or visibility
  transition. Coalesce notifications, permit one outstanding request per
  occurrence, and never retry unchanged pressure in a timer/microtask loop.
  Account separately for queue slots and live-source/pixel release.
- A waiting occurrence must not retain encoded bytes, a decoded source or a
  rejected promise queue. Eligibility/subscription/geometry records belong only
  to the bounded mounted chapter and are removed on unmount/replacement. Document
  their bound from current semantic/node limits; do not accumulate visited IDs.
- Preserve a decoded image's layout footprint while evicted, using bounded
  numeric dimensions/ratio that also responds to content-width changes. Remove
  the DOM source when releasing it. Re-entering can reacquire bytes locally.
  Eviction/reload must not jump the reading passage or manufacture saved progress.
- Abort obsolete queued/active work; reject stale completions; release late
  successful handles exactly once. Close/replacement must leave no listeners,
  scheduled callbacks, pending loads or owned object URLs. Cover StrictMode and
  repeated occurrences of the same resource without cross-occurrence release.
- Keep missing/failed observer support on a bounded fallback, with no perpetual
  retry. Preserve semantic alternative text, decorative empty-alt behavior,
  safe local Blob sources and zero external requests.

The progress guarantee is conditional: a still-visible valid image must be
admitted once eligible capacity is available. An image set that exceeds the
simultaneous pixel/source budgets is not promised simultaneous full display.

### Documentation and privacy

During implementation, add a short ADR with the next available number to record
viewport recycling and retryable capacity, linking the prior ADR-0010 policy.
Clarify ADR-0011's reflow-save wording to mean saving the existing logical
checkpoint after layout, never replacing it with visual fallback. Update only
the affected product, overview and testing paragraphs. Keep completed plans and
historical evidence unchanged. Review the system diagram; update it only if
actual ownership/data-flow topology changes. No new process or storage edge is
expected. Record why no diagram edit is necessary when it still matches.

Use repository-authored synthetic EPUBs only. Do not persist image bytes, EPUB
text, paths, object URLs, geometry or generated audio. Diagnostics and committed
receipts contain only fixed case IDs, outcomes, counts and code identities.

## Milestones

### M0: establish targeted regressions and freeze the small patch boundary

After implementation is requested, recheck HEAD/worktree and read current owning
code. Add the RPI-01 composition test using the real reader/save integration and
existing controllable geometry, plus the RPI-02 sequential capacity journey.
Observe the expected failures before their production edits. For RPI-01, record
separately whether ordinary Chromium/WebView2 geometry reaches the fallback or
whether that leg requires a controlled missing-range observation. Do not mock
away save admission or assert only a callback invocation.

Record each acceptance ID, test path/name, command, host result and source identity
in `docs/plans/evidence/reader-position-and-image-lifecycle/execution-ledger.md`
when execution begins. Confirm fixed limits and document any extra files needed.
If evidence contradicts a claimed cause, correct the plan before changing code.

Status: complete. Validation: four expected RPI-01 failures (each appearance
option changed saved offset 3 to 0) and the expected ninth-image failure in real
Chromium, both before production edits. The ledger distinguishes controlled
geometry from natural browser behavior and records corrected harness setup.

### M1: protect canonical progress through presentation changes

Implement RPI-01 at the existing admission boundary, with the least callback/type
change needed. Complete P1-P5 below, including pending-save and post-fix manual
scroll controls. Preserve actual visible settlement, Play gating and paused/heard
state. Run the affected deterministic checks before preparing browser/native work.

Status: complete. `scheduleReflow()` takes no
locator and expedites only already admitted progress. Reader/narrator visual
settlement is unchanged. Combined C1 testing additionally requires the visual
tracker to ignore unchanged settled geometry after a late image notification.
The full desktop suite includes canonical recovery,
legitimate offset zero, pending passive saves, heard precedence and ownership.

### M2: recycle image capacity with stable placement

Implement RPI-02 in the existing component/loader/manager responsibilities and
only the required CSS/viewport wiring. Complete I1-I5 below. Add no generalized
cache or scheduler abstraction. Run deterministic limits/cancellation checks
before browser/native preparation. Document the changed capacity policy.

Status: complete; deterministic and host checks pass. The existing loader watches
occurrences, prioritizes visible demand, retires outside sources, distinguishes
queue/live pressure and retries on capacity changes. The component retains
numeric geometry and observes both the actual viewport and its 256 px margin.
Source-manager guards and all four safety budgets are unchanged.

### M3: combined user journeys, host acceptance and independent review

Run the integrated browser/native and reader performance gates on the combined
patch. Exercise C1 below so image recycling cannot reintroduce position loss.
Review scope, product documentation and the system diagram. Supply exact diff,
base/HEAD, changed/supporting file identities and host results to the mandated
read-only `change_reviewer` role (GPT-6 Astra high). Pause source/Git writes during
review, resolve findings, rerun affected gates and obtain APPROVE for the current
patch. Missing host evidence or unavailable reviewer means implementation
acceptance is blocked, not complete.

Archive the plan and update active/completed/documentation indexes only after
required gates and cleanup pass. This planning request does not authorize future
implementation commits, push, PR, merge or publication.

Status: complete. Independent review RPI-CR-R1-20261110 is APPROVE without
findings. Current host results are
1,246 Vitest plus 223 Node tests, 68 Chromium cases, packaged WebView2, both
reader benchmarks, format/lint/types and evidence retention. The ledger binds
results to current code inputs; no historical runtime result is reused.

## Testing and benchmark strategy

### Acceptance cases

| ID | Required observable result |
| --- | --- |
| P1 | Exact saved interior locator -> initial block fallback -> each appearance option and viewport reflow -> hidden/pagehide/close -> reopen same bytes. The complete saved locator remains equal, not merely the same paragraph. Play receives the actual settled visible locator and cannot start before settlement. |
| P2 | Invalid saved locator -> canonical package recovery -> temporary visual fallback. No rewrite before settlement; afterward save the recovered canonical locator, not temporary block start. Reopen resolves that checkpoint normally. Unavailable/superseded placement cannot save it. |
| P3 | Real manual movement after fallback, and movement with a pending passive save followed by appearance, persist the new canonical position. Unchanged values deduplicate, debounce stays bounded, and a valid offset zero is accepted. Explicit TOC/link/chapter navigation and close/reopen remain correct. |
| P4 | Narration active, paused with manual inspection, stopped and naturally completed retain existing heard-checkpoint/Resume/Play precedence. Appearance, image layout and stale callbacks cannot advance unheard progress. Late source attachment and StrictMode replay settle once for the current owner. |
| P5 | Rapid preference changes, user input during placement, delayed layout/scroll notifications, chapter/book replacement and storage failure preserve ownership and remain usable. Keep modeled notification evidence distinct from natural browser occurrence, including C15. |
| I1 | A synthetic chapter with at least twelve supported images separated by enough prose exercises sequential scroll to image nine and twelve, then back to image one. Each becomes ready when visible and fitting capacity. Assert actual local decode, release/reload and stable surrounding passage. |
| I2 | Exercise queue saturation separately from live-count and aggregate-pixel saturation. Keep a target eligible while capacity is occupied, then free capacity without re-entering it; the target loads automatically. Assert visible-over-prefetch priority, deterministic over-capacity fallback and no starvation once capacity fits. |
| I3 | Exact/max-plus-one limits, invalid/animated/oversized resources, decode failure and JPEG density/PNG orientation controls retain their outcomes. Permanent rejection does not cause retry loops or relax predecode checks. |
| I4 | Rapid enter/leave, slow read/decode, cancellation, error, repeated resource occurrences, StrictMode, chapter/book replacement and close leave no stale presentation or ownership leak. URLs are revoked once, bytes cleared, one decode retained, queues bounded and all listeners removed on teardown. |
| I5 | Evicted geometry survives width/text-scale changes and reload without collapse; empty-alt images stay decorative and meaningful alt remains accessible. Missing observer support is bounded. More than eight simultaneously visible images never breach source/pixel limits or cycle indefinitely. |
| C1 | Save an interior passage in the multi-image chapter, change appearance while nearby images release/reload, close/reopen, then navigate manually and reopen again. Both the preserved checkpoint and the subsequent intentional checkpoint are correct, with zero external requests and no leaked image ownership. |

### Existing command gates

Implementation execution is authorized. Run validation in normal
local Windows PowerShell outside the managed sandbox, from the repository root.
The commands below exist in current package configuration. Recheck them before
execution; do not append file filters to the desktop `test` script, whose Vitest
and Node stages are chained. Record any focused invocation precisely if using
the repository's documented direct-run pattern.

| Gate | Command | Timing and evidence |
| --- | --- | --- |
| Package preparation | `pnpm.cmd build:packages` | Once when required outputs are missing/stale, before desktop tests. No dependency reinstall or native build just for planning. |
| Desktop regression suites | `pnpm.cmd --filter @voxleaf/desktop test` | Expected before-fix case failures at M0; affected unit checks during M1/M2; one final run after both changes. Covers existing Vitest and Node harness tests. |
| Static integration | `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript` | After final source edits and before expensive native preparation. Fix relevant failures and record unrelated blockers. |
| Production Chromium | `pnpm.cmd test:browser` | After adding P1/P3/I1/I2/C1 journeys to existing suites. Real range/layout and Blob decode supplement deterministic injection. |
| Packaged WebView2 | `pnpm.cmd test:native-startup` | Extend existing synthetic restart/reselection and image paths for the same critical cases. Prove actual process restart, CSP/local decode, lifecycle cleanup and zero external requests. |
| Reader resource/latency gates | `pnpm.cmd benchmark:reader`, `pnpm.cmd benchmark:reader:native` | Required after image-lifetime/renderer changes under `docs/development/testing.md`. Retain current thresholds and six-cycle cleanup checks; add only missing resource observations. |
| Evidence retention | `pnpm.cmd check:evidence` | Once receipts and final documentation are ready. Keep artifacts within repository retention policy. |
| Independent acceptance | `change_reviewer`, per linked workflow | Exact combined patch and attributed host evidence. This is a review gate, not a shell command or replacement for tests. |

Check required Node/pnpm/browser/driver availability cheaply before downloads or
native builds. `pnpm.cmd test:browser:install` is conditional preparation only
if the pinned Chromium is missing. Use the existing disposable native profile
and owned-process cleanup; never clear the user's actual reader storage.

The reader benchmarks measure host-specific performance and resource ownership;
deterministic suites prove limits and ordering. Neither proves physical audibility
or new TTS quality. No real-model evaluation is necessary unless implementation
expands into narration execution, in which case document the smallest additional
gate before that expansion. Normal repository CI remains required by its workflow
if a later PR is authorized; no CI result is claimed by this local plan commit.

Do not rerun passing expensive checks without a changed input or unresolved
concern. Any reused current-task evidence must identify unchanged relevant source,
tests, built artifact, toolchain and host inputs; new reader/image changes
invalidate the affected browser/native evidence. Preserve initial failures and
cleanup outcomes. Missing evidence remains pending rather than inferred from
older plans.

## Risks and rollback

- Overprotecting the initial locator can disable normal progress. P3 and real
  manual movement after every presentation transition are mandatory controls.
- Disabling a reflow save can drop an already pending legitimate update. Keep
  admitted pending state and lifecycle flushes; test appearance before debounce.
- Retry broadcasts can create a read/decode storm or leak waiting registrations.
  Use bounded/coalesced ownership and test repeated pressure with unchanged
  capacity, followed by one real release.
- Eviction can collapse layout, cause scroll anchoring or churn visible images.
  Preserve geometry and prioritize actual visibility; C1 blocks acceptance if
  this changes progress or causes oscillation.
- JSDOM cannot establish natural range placement or browser decode. Retain
  deterministic ordering tests and complementary Chromium/WebView2 evidence,
  labeling injected observations explicitly.
- Revert only this task's implementation paths through an authorized follow-up
  if acceptance fails. No schema migration or data rewrite is planned. Reverting
  RPI-02 restores bounded unavailable-on-saturation behavior; it does not require
  deleting reading state. Do not reset unrelated work, restore historical
  checkpoints over new user progress or rewrite completed evidence.

## Progress log

- [x] 2026-11-10: Rechecked clean planning base, current save/image owners,
  historical dispositions, relevant requirements and configured commands.
- [x] 2026-11-10: Created the focused planning branch and this ExecPlan with its
  active-index entry. No runtime/test code changed and no tests executed.
- [x] M0: Reproduce and record the targeted missing sequences.
- [x] M1: Implement RPI-01; deterministic regression checks pass.
- [x] M2: Implement RPI-02; deterministic regression checks pass.
- [x] M3: Complete combined host gates, cleanup, documentation and independent
  approval, then archive after RPI-CR-R1-20261110. The separate documentary
  closure review is retained with the [closeout record](../evidence/reader-position-and-image-lifecycle/closeout.md).

## Discoveries and decisions

- Reuse persistence authority already present in the save coordinator; do not
  build another canonical-position store merely to separate it from presentation.
- RPI-01 is the fallback-plus-appearance composition, not the withdrawn initial
  recovery claim. Do not save every initial visual callback as a shortcut.
- RPI-02 deliberately extends a previously documented capacity policy. Safety
  limits stay fixed; liveness comes from release and bounded eligibility retry.
- Both fixes meet at layout and passive sampling, so their combined journey is
  an acceptance requirement rather than two isolated green unit suites.
- Store the invariant/event tables and permanent regressions near their owners
  so future reviews can trace admission and capacity decisions. Do not silence
  static diagnostics or mark cases fixed solely to stop repeated findings.
- pnpm 11.15.1 is available through the existing Corepack cache. A task-local
  ignored shim also fixes nested command resolution; global pnpm remains intact.
- RPI-01 changes the save coordinator and its App caller. C1 additionally
  reproduced offset 100 becoming 85 after real image decode without movement.
  Active-visual tracking now retains a settled locator while measured placement
  is unchanged, within the existing one-pixel tolerance. The guard expires on
  actual displacement and never freezes valid offset-zero progress. No new
  locator-provenance contract or reflow-engine change was necessary.
- Additional integration paths are the new synthetic fixture `.mjs`/`.d.mts`
  and browser `reader-image-lifecycle.smoke.spec.ts`. Native coverage extends
  the existing startup and reader-scenarios files. The package-reader matrix's
  visibility test adapter adopts the new three-state callback.
- Waiting image registrations contain metadata only and are bounded by the
  mounted chapter's existing 80,000 admitted-node ceiling. No visited-ID cache
  or encoded-byte cache is added. ADR-0071 records the lifecycle decision.
- The canonical system diagram still matches: publication/session ownership,
  the safe-document boundary, local decoding, persistence and TTS topology are
  unchanged. No diagram edge or process change is needed.

## Final validation results

Implementation, host validation and independent acceptance are complete. See
the [execution ledger](../evidence/reader-position-and-image-lifecycle/execution-ledger.md)
for exact commands, counts, initial failures, resource observations and input
identities. Both runtime fixes and the combined image-layout guard pass current
desktop, Chromium, WebView2 and benchmark gates. No prior PASS is reused.
Independent [RPI-CR-R1-20261110](../evidence/reader-position-and-image-lifecycle/review-report-01.md)
approved the exact implementation patch with no findings. The final documentary
closure and identity recheck are recorded in the linked closeout receipt. The
plan was archived only after its implementation acceptance gates passed.

Historical planning checks on 2026-11-10, from normal local PowerShell outside the
sandbox: `pnpm.cmd check:evidence` stopped before executing the checker because
installed pnpm `11.25.0` differs from required `11.15.1`. Running the exact script
defined by that command, `node scripts/check-evidence.mjs`, passed. No toolchain
or dependency was changed during planning. Implementation resolved this
prerequisite with the task-local 11.15.1 shim; the original direct documentation
check remains planning evidence only.

The planning commit contains only this ExecPlan and its active-index entry.
Implementation remains uncommitted as requested; no push or PR is authorized.
