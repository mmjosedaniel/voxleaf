# Reader placement, JPEG density and audible-start minimal corrections

Status: planning only, 2026-11-01. No implementation milestone has started.
The user authorizes this ExecPlan, a dedicated branch and a local documentation
commit only. Execution, runtime tests, implementation, push and PR publication
are not authorized by this request.

Planning base: `f2870ffedb3f27b610b4d5608ba90503ea0b3da5` on `main`, initially
clean. Plan branch: `codex/reader-image-audibility-plan`.
This is a cross-milestone correction of M004, M008/M008.1, M009 and M010.2,
not a new roadmap milestone.

## Goal

Correct the three statically revalidated defects from the four-pass chat audit
with the smallest cohesive patch. Include their demonstrated related paths;
do not turn possible consequences or risks of a bad fix into extra bug tickets.
Minimize repeated validation by using existing fixtures, selecting affected
suites, combining final checks and retaining only evidence whose inputs remain
provably equivalent.

## User-visible outcome

- An unreadable oversized chapter cannot enable Play merely because its
  narration coordinator attaches after the reader. Returning to a readable
  chapter enables normal explicit playback from the current visible passage.
- A supported local JPEG whose EXIF density changes browser intrinsic dimensions
  renders without a false decode-mismatch. Physical pixel limits, orientation,
  cancellation, local failure placeholders and URL ownership remain intact.
- Highlighting, heard-position persistence and command-to-audible metrics wait
  for evidence that the current audio unit has begun rendering. Startup failure,
  delayed resume or a stale acknowledgement cannot advance heard state.
  Playback duration excludes waiting for the device to start or resume.

## Current state

The audit was static: no test, browser reproduction or hardware benchmark was
executed for these findings. Existing test source and historical receipts were
inspected during planning; historical successes do not reproduce these defects.

| ID | Evidence and trigger at the planning base | Scope and qualification |
| --- | --- | --- |
| RIA-01 / P2 | `App.tsx` creates the narrator only after `narrationHandoff` becomes ready, but can render the reader earlier. `handleNavigationSettlement` drops notifications while the narrator is absent. `ReaderPublication.tsx` sends initial oversized unavailability only at navigation revision zero; late attachment replays a visible locator only for renderable content. `ProductNarrationCoordinator` initializes placement availability to true. | Initial oversized restoration and navigation to an oversized chapter during the old owner's cleanup are the same lost-state defect. In the latter case, `ReaderNavigationCoordinator.commitResolution` preserves the previous active locator, so unexpected Play can start from an earlier location rather than the oversized target. |
| RIA-02 / P2 | `raster-image-source.ts` observes `Image.naturalWidth/naturalHeight` and requires equality with `raster-image-policy.ts` dimensions taken from JPEG SOF and EXIF orientation. Chromium can derive density-corrected intrinsic dimensions from EXIF resolution plus PixelX/YDimension. | Conditional JPEG decoder disagreement, not every image declaring DPI. For example, physical 600x400 with the recognized 144-DPI / 300x200 EXIF combination has different intrinsic dimensions. This example is analytical, not a fixture executed in this task. |
| RIA-03 / P2 | `AdaptivePcmPlayer.#startCurrentUnit` publishes `segment-started` after the synchronous backend handle is returned. Both Web Audio paths return before asynchronous start/resume settles; the WSOLA backend ignores its existing `started` message. The product coordinator and persistence bridge treat the event as heard authority. | A newly targeted segment can become the saved/heard start before rendering. This does not prove premature segment completion or skipped words. |
| RIA-03a, same cause | `#updateMetrics` infers audible playback from scheduler state plus `activeSequence`, which currently means an allocated handle. `resume()` also ticks before device resumption is confirmed. `recover()` uses `latestHeardLocator`. | Fix startup metrics, resume duration and recovery's inherited checkpoint with RIA-03. Delaying only the event leaves metrics wrong. |
| RIA-C1, candidate only | WSOLA counts source frames from `AudioContext.currentTime` captured before posting arm/start, and ignores start/pause/resume acknowledgements. | Prove whether a controlled delay produces pre-render or paused consumption. At minimum, RIA-03 must keep pre-start progress zero. Correct additional clock drift only if reproduced within the same backend state; otherwise record the candidate as unconfirmed. Keep the existing last-frame clamp and authoritative ended callback. |

The final chat analysis also identified **conditional correction risks**, not
independent present defects: defaulting placement to false without replaying
positive state; replaying only revision zero; removing decoder agreement;
charging natural rather than physical pixels; losing orientation; accepting
late audio acknowledgements; and misordering very short start/end events.
They are preservation criteria below. No additional image-resource leak was
confirmed. Do not generalize JPEG density behavior to PNG or WebP.

Browser behavior references inspected in the audit:
[Chromium EXIF density handling](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/platform/image-decoders/image_decoder.cc),
[Chromium image intrinsic dimensions](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/html/html_image_element.cc),
and [Web Audio resume](https://www.w3.org/TR/webaudio-1.0/#dom-audiocontext-resume).
These support the static rationale; current Chromium/WebView2 fixtures must prove
the actual product boundary. A render acknowledgement is not a microphone
measurement or a guarantee about physical speaker latency.

## Scope and non-goals

One integration batch, with three bounded implementation responsibilities:

1. RIA-01: replay current reader placement availability to a newly attached
   narrator through the existing boundary. Prefer a change confined to
   `ReaderPublication.tsx`; retain App's readable-during-handoff behavior.
2. RIA-02: reconcile JPEG intrinsic dimensions within the existing bounded
   metadata/decode comparison; retain physical allocation accounting.
3. RIA-03: make one desktop-local confirmed rendering state authoritative for
   event publication, frame accounting and metrics, including resume/invalidation.
   Preserve the existing synchronous backend allocation API and ownership model.

Expected production paths, all under `apps/desktop/src/`:

- `reader/ReaderPublication.tsx`.
- `reader/images/raster-image-policy.ts` and `raster-image-source.ts`.
- `tts/pcm-playback-contracts.ts`, `pcm-playback.ts`,
  `playback-backends/web-audio-pcm-playback.ts`, and
  `product-narration-coordinator.ts`.
- `tts/playback-backends/incremental-wsola-v3-worklet.ts` only for the minimum
  rendering/activation acknowledgement required by RIA-03; no DSP rewrite.

Tests extend existing files: `App.test.tsx`, `ReaderPublication.test.tsx`,
the two raster policy/source suites, `pcm-playback.test.ts`,
`product-narration-coordinator.test.ts`, worklet tests when the message behavior
changes, and the existing persistence bridge suite where needed for the joined
real-player/save boundary. Reuse current fakes; add controllable readiness,
not a new parallel harness.

Browser/fixture changes are limited to
`apps/desktop/tests/browser/foundation.smoke.spec.ts`,
`reader-narration-bugfixes.smoke.spec.ts`,
`apps/desktop/tests/fixtures/jpeg-fixture.ts` and
`oriented-raster-epub-fixture.mjs`. Extend the existing native image assertions
in `apps/desktop/scripts/native-startup-smoke.mjs` for density cases; retain its
current modes, orchestration and cleanup. Add a focused existing harness test
only if this assertion/fixture wiring has a concrete uncovered failure mode.

Implementation documentation may amend the image-dimension explanation in
`docs/architecture/decisions/ADR-0010-bounded-raster-image-decode.md` and
`docs/architecture/overview.md`, and describe the selected regression commands
in `docs/development/testing.md`. Review the canonical system diagram; update
it only if the actual component/data-flow boundary changes. Do not rewrite
frozen synchronization authority or completed plans to disguise a defect.

No EPUB normalization/segmentation or locator-range changes, shared schema,
service protocol, Rust/Python runtime, model/profile, queue-policy, six-rate
policy, DSP algorithm, dependency, lockfile, CSP or persistence-schema changes.
No general EXIF library, second image decode, image cache, extra PCM queue,
new startup timer, installer/signing run, model-quality campaign or broad
refactor. Record any necessary scope expansion and its affected gates before
editing that additional responsibility.

This planning commit changes only this file and the active-plan index.

## Relevant files and documentation

Read the current implementations and their callers before editing, especially:

- `App.tsx`: handoff, ready-reader props, optional placement callback and save
  coordinator; `reader/reader-navigation.ts`: oversized state and retained locator.
- `ReaderPublication.tsx`: callback refs, initial restoration, source attachment,
  navigation revision, visible settlement and highlight subscriptions.
- `reader/images/publication-raster-image-loader.ts` and
  `reader/images/SemanticRasterImage.tsx`: source ownership, cancellation and presentation.
- `tts/ProductNarrationControls.tsx`: canStart, start/cancel display and metrics;
  `reader/segment-highlight-controller.ts`: start/completion and Resume follow.
- `persistence/narration-position-save-bridge.ts` and
  `reader-position-save-coordinator.ts`: exact-boundary saves, matching completion,
  protected heard state and interruption flush.
- `tts/playback-backends/incremental-wsola-v3.ts`: current worklet ownership,
  disposal and error containment; `tts/adaptive-buffer-scheduler.ts`: existing
  frame accounting and FIFO ownership, not a planned production edit.
- Existing browser real-worklet controls: MPA-01/03, MPA-02, CHAT-AUDIT ended/Pause,
  NLC tail/completion, NCC final counter/completion; existing RAC-01, PSC-03 and
  VUC-01 reader/handoff/visible-position journeys.

Requirements: [documentation index](../../README.md),
[MVP](../../product/mvp.md), [reader/playback controls](../../product/reader-settings-and-playback-controls.md),
[roadmap](../roadmap.md), [overview](../../architecture/overview.md),
[system diagram](../../architecture/system-diagram.md),
[ADR-0010](../../architecture/decisions/ADR-0010-bounded-raster-image-decode.md),
[ADR-0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
[ADR-0040](../../architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md),
[synchronization authority](../../architecture/synchronization-authority-v1.md),
[testing](../../development/testing.md),
[independent change review](../../development/agentic-change-review.md) and
[evidence retention](../../development/evidence-retention.md).

Use the complete-input/host-proof principles of the
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
for evidence decisions. This is a bug-fix batch, not a refactor campaign:
its auditor/worker protocol and mandatory per-unit refactor baselines do not apply.

## Architecture and constraints

### RIA-01: replay state without manufacturing navigation

Use the existing attachment synchronization point and current callback refs to
replay the reader's current availability whenever the narration source changes.
Cover both readable and oversized content, irrespective of navigation revision.
Keep the existing live navigation notification path.

Do not call the broader `notifySettlement` helper merely to replay availability:
its readable branch also invokes `onSettledLocatorChange`, which can schedule a
position save or settle navigation. Do not remount the reader, reset its locator,
trigger a seek or hide it behind old narrator cleanup. Preserve initial
restoration settlement and late-source visible-locator synchronization. Keep
defaults unchanged unless the complete positive-state lifecycle proves a
different default necessary. Duplicate StrictMode attachment must be harmless.

### RIA-02: separate intrinsic dimensions from physical allocation

Retain `HTMLImageElement.decode()` and one preflighted Blob/URL decode. Extend
the existing bounded JPEG EXIF inspection only enough to derive the supported
density-corrected intrinsic size separately from SOF physical dimensions and
orientation. Keep the public ready source's existing physical/oriented sizing
semantics unless the real-browser proof requires an explicitly documented change.

The expected intrinsic pair belongs to the internal metadata/decode contract;
it must not replace raw width/height in predecode ceilings or live pixel charges.
Apply orientation consistently after density correction for decoder agreement.
Do not remove equality checks or accept arbitrary smaller decoder dimensions.

Bound all reads to the current APP1 segment. Read only required resolution,
unit and PixelX/YDimension fields, following at most the required EXIF sub-IFD;
no recursive directory traversal, thumbnail decoding or general metadata cache.
Validate offsets, scalar counts/types, rational denominators and finite positive
values. Preserve existing malformed-orientation rejection and the accepted
behavior of images without a recognized density combination. Establish exact
rounding and fallback behavior with the real decoder before implementing it.
PNG's shared IFD0 orientation behavior must remain unchanged.

### RIA-03: one confirmed rendering authority

Add the smallest explicit typed state at the existing backend handle/player
observation seam that distinguishes allocated/scheduled work from confirmed
rendering. Keep `activeSequence` as ownership identity if consumers need it;
do not continue using its presence as the audible predicate.

At direct rate, combine successful device resumption with evidence that the
scheduled source has started on the audio clock. A returned handle or a context
state flag alone is insufficient. At slow rates, consume the existing per-unit
worklet start evidence; adjust its emission only if necessary to acknowledge
actual processing for the current activation. Resume needs fresh confirmation,
not a replay of a once-true start flag. Reuse the existing synchronization path;
do not introduce polling loops, a second audio graph or fixed startup delay.

Install active-unit ownership before consuming readiness. Publish exactly one
segment start per unit, before any progress/completion for it; repeated resume
must not save the segment start again. Support units which start and finish
before the next tick. Preserve the exact completion callback and last-frame
clamp, transition pauses, paused-end behavior, bounded queues and zero-volume
source consumption.

Guard every acknowledgement and failed resume by current handle, sequence and
activation/invalidation state. Sequence alone cannot distinguish pause/resume
cycles of the same unit. Stop, seek, book/profile replacement, close and failure
must make obsolete callbacks inert, including callbacks delivered after a new
unit owns the backend. Pause before first confirmation must remain paused;
a delayed old confirmation cannot revive playback.

Drive command-to-audible and playback-duration accounting from this same state.
Keep preparation, genuine buffering, intentional transition waits and device
start/resume waits distinct; do not fabricate underruns. Failure before confirmed
start retains the prior heard checkpoint, including recovery and persistence.
Periodic progress remains non-persistent. Do not claim physical speaker timing.

## Milestones

All execution milestones below are **Not started** and require a later execution
instruction. Documentation-only checks before this planning commit do not
execute these milestones.

### M0: freeze scope and reusable inputs

Re-read actual HEAD and relevant callers/tests. Capture a clean task allowlist,
current tool/installed-library/browser identities and the consumed-input graph.
Classify every gate as EJECUTAR, REUTILIZAR CON PRUEBA, NO APLICA or BLOQUEADO.
Resolve any drift from the planning base without editing historical receipts.

Reuse package exports only after complete source/config/tool and output
membership/hash proof. Inspect native readiness cheaply before costly work:
driver/WebView compatibility, current Piper EN core/voice integrity, writable
scratch, disk and pre-existing process/resource inventories. Do not install,
regenerate or download tools/models by default.

Expected result: exact scope and available inputs documented; no inferred PASS.

### M1: add only discriminating regressions

Use the `RIA-` prefix for new cases. Before production edits, run only the new
tests necessary to expose each cause, plus the real JPEG decoder experiment.

| Area | New proof and existing controls to retain |
| --- | --- |
| Placement | Delayed narrator attachment after initial oversized placement; normal-to-oversized navigation before attachment; later readable navigation enables Play at its actual locator. Assert no synthetic save/seek, no service start for unavailable placement, and no duplicate attachment side effects. Use existing delayed-close App/reader fixtures. |
| JPEG | Real decoded density pair and oriented density case; plain JPEG and existing PNG/JPEG orientations remain controls. Unit tables cover absent/inconsistent density, both byte orders, malformed/bounded offsets and rationals, false dimension agreement, raw max-plus-one budgets despite smaller intrinsic size, cancellation and exactly-once release. Reuse tiny repository-authored images. |
| Audio | Controlled pending/rejected direct resume and deferred WSOLA processing: no start/highlight/checkpoint/latency before confirmation; one start afterward. Preserve prior heard target through failure/recovery. Resume adds no waiting time or duplicate start/save. Late success/failure after stop, replacement or another activation is ignored. Exercise short start/end ordering and the existing ended/Pause control. |
| RIA-C1 | Advance the context clock while worklet processing is deliberately withheld, and across pause/resume. Compare reported consumption with confirmed worklet progress. Retain the last-frame/ended invariant. Record whether additional drift is reproduced; do not assert skipped text without evidence. |

A red result counts only when the intended assertion fails after its preconditions
pass. A selector matching zero tests or a fixture/type failure is not reproduction.
If a main finding is disproved by current code/browser evidence, revise its scope
and record why; do not force a patch to satisfy the old hypothesis.

### M2: implement the three cohesive fixes

Apply RIA-01, RIA-02 and RIA-03 only at the boundaries above. Avoid changing save,
highlight, scheduler or service implementations when correcting the producer
state already restores their contracts. Update affected fakes to model explicit
render readiness; never make the fake conceal the delay under test.

Run one combined affected-suite pass on the final source/test patch and one
filtered browser invocation, followed by relevant static checks. The new red
tests are included in those final suites; do not repeat them separately merely
to obtain another green receipt. Renew only gates invalidated by later changes.

### M3: current native proof, independent review and closeout

Build one current executable after fast checks pass. Run the two existing native
modes against it: the image/non-model route and one Piper EN route with playback
speeds. They are separate because adaptive mode returns before the image block;
a Piper PASS cannot substitute for JPEG WebView2 proof. Do not refactor the
runner to combine modes merely to reduce invocation count.

Verify full resource/process/scratch restoration after both modes. Freeze final
source, documentation and content-safe evidence; obtain the required
`change_reviewer` approval for that exact patch and its host receipts. Missing
evidence or reviewer availability blocks implementation acceptance. Preserve
eligible individual receipts across documentation-only corrections, with a new
immutable review assessment where required.

Only after implementation acceptance move the plan to completed and update
indexes. Git mutation/publication for implementation requires its own applicable
authorization; this request authorizes only the planning branch and commit.

## Testing and benchmark strategy

### Historical evidence inspected and reuse decisions

Original result/input JSONs and relevant logs are retrievable in the ignored
locations below. During planning, their input-manifest digests were checked and
recorded entries compared with current files. These are **planning inspections**,
not current environment acceptance or retroactively complete receipts.

| Prior evidence | Recorded result and current inspection | Decision |
| --- | --- | --- |
| [VUC ledger](../evidence/visible-locator-unicode-compound-corrections/execution-ledger.md), VUC-R1-20261101, `G4-reader` | 50/50 across ReaderPublication, highlight and save bridge. Original result hash `32eaecc4aac84a27b72a6316b1f0e54598b411b95f1eb596260e0ae02d1c4711`; input digest matches. Of 1,504 recorded entries, eight now differ: six Markdown, the browser fixture and a local capture wrapper. | Possible pre-edit background only after full dependency/installed-environment proof; not acceptance after RIA-01/03. Reuse source tests, run the affected final suites once. Retrieve the immutable original capture wrapper if needed; do not renew its old identity. |
| VUC `G5-browser-artifact-bound` | Four browser cases passed: VUC-01, RAC-07, PSC-03 and R7-04. Original result hash `dd5b290d6c398080e687dd354d9872fa0bbfda0bacc11c306b323e79c024217b`. | Reuse fixtures/assertions and corrected viewport handling. Changed renderer/backend invalidates runtime acceptance. Select directly affected controls, not every historical browser case. |
| [R8 ledger](../evidence/eight-revalidated-findings/execution-ledger.md), R8-R1-20261101, `G3-Desktop-final` / `G6-Browser-final` | 399 desktop and ten browser cases passed, including PNG orientation. Result hashes `45238d0693f80a0f259828eac754e64341d0eb99b84196331c46202648f2c948` and `994e034309818f5e1c65f97658df077f6f3907410916d4b6c8bf4e9095891254`. Desktop input digest matches, but 22/1,497 recorded entries differ, including reader and EPUB production inputs. | Do not recycle the aggregate PASS. Reuse JPEG/PNG fixtures, deferred handoff and negative dimension controls. Renew only affected suites and selected browser/native image assertions. |
| [MPA ledger](../evidence/minimal-playback-audit-corrections/execution-ledger.md), `G3-combined` | 214/214 across worklet, PCM player, coordinator and controls. Result hash `31eb8d2458f5a1ed8929f1cfb5552dccbc57159e41a5c093c3911c6e0cb300fe`; input digest matches, but 49/1,482 recorded entries differ. It recorded Node 24.18.0; the later VUC/R8 runs recorded 24.20.0. | No current baseline/final PASS. Reuse existing worklet lifecycle, processor-error and rate-transition tests as controls; the new delayed-render behavior needs fresh proof. |
| VUC `G5-browser-artifact-bound-exports.json` / `G8-Piper-exports.json` | All 251 generated shared/EPUB files match current hashes; complete dist membership also matches. The older `G0-current-exports.json` differs in the normalizer JS and tsbuildinfo and must not be substituted. | REUTILIZAR CON PRUEBA for preparation: package production/config/locks are outside planned scope, but prove build inputs and installed toolchain at execution. Keep configured build hooks. These files are artifacts, not a behavior result. |
| VUC `G7-core-bound`, `G7-build`, `G8-Piper`; R8 native image result | Core integrity, executable and native arms passed with documented cleanup. VUC used 2,023 staged payload files, six closed contexts, zero persisted audio and zero external requests. VUC's Piper run did not exercise its optional six-rate mode. | Reuse existing verified core/voice payloads, installed drivers and caches only after current integrity/readiness proof. New renderer/backend and image assertions require a current build and both selected native modes. Do not regenerate weights/core or accept old startup timings for the corrected metric. |
| [PSC ledger](../evidence/minimal-playback-state-corrections/execution-ledger.md), PSC-R2-20261031 | Final coverage 210 unit cases and four browser controls, plus a six-rate Piper EN arm. R1 rejected incomplete partial-result evidence; separately renewed reader/browser receipts supplied acceptance. | Reuse the assertion coverage and evidence lessons. Never extract green subtests from a failed aggregate as a new PASS or reconstruct missing execution-time identities. |
| Unchanged EPUB/shared, Rust/Python, quality/listening, optional-model and installer results | Historical results cover responsibilities outside this patch. | NO APLICA for new execution under this allowlist, not recycled acceptance. Expand only if actual responsibilities change or later CI/publication requires it. |

Raw evidence roots: `tmp/evidence/visible-locator-unicode-compound-corrections/run-01/`,
`tmp/evidence/eight-revalidated-findings/run-01/`,
`tmp/evidence/minimal-playback-audit-corrections/` and
`tmp/evidence/minimal-playback-state-corrections/`.
Keep private inventories and raw logs local. New execution should use a distinct
`tmp/evidence/reader-image-audibility-corrections/run-01/` and a concise tracked
ledger only after execution begins.

No historical behavioral result is pre-approved for final acceptance. Evidence
reuse requires the original immutable host receipt, every consumed source/test/
fixture/config/lock/generated input, complete discovered membership, installed
tool/library/browser identities and relevant environment to match. Record what
changed and why a retained gate does not consume it. Unknown proof means rerun
the affected gate, not all repository matrices. Prepared artifacts and historical
measurements are separate reuse decisions.

### Minimal execution gates

All commands below are **planned**, not executed. Run them from the repository
root in normal local PowerShell **outside the managed automation sandbox**.
Use repository-pinned pnpm and installed tools; capture receipts before mutation.
Each result must include exit status, selected count, input/environment identities
and cleanup where applicable.

| Gate / timing | Command or exact selection below | Coverage and invalidation |
| --- | --- | --- |
| G0 preparation | `pnpm.cmd build:packages` only if current package exports/build inputs cannot be proven. Keep existing browser/Tauri preparation hooks. | Shared/EPUB sources, build config, tools and complete generated membership. Preparation only. No package production edit is planned. |
| G1 red, before production edits | New-case unit and browser selectors below. | All three causes; real density observation and RIA-C1 classification. One intended pre-fix failure per cause, retaining inexpensive inline controls. |
| G2 final affected desktop suites | Combined Vitest command below, once after final relevant edits. | Reader/App attachment, image bounds/lifecycle, actual player/worklet, metrics/recovery, controls, highlight and persistence consumers. Changed consumed production/test/fake inputs invalidate their gates. |
| G3 final selected Chromium | Filtered browser command below. | Real JPEG intrinsic size, actual rendering/start, worklet lifetime/error/ended races and visible/heard position. Captured renderer bytes, exports, fixture/spec/config and browser inputs are mandatory. |
| G4 static before native preparation | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/desktop typecheck`. Run and record separately. | Current TS/TSX/MJS, hook and fixture types, discovered membership, config/locks/tools. No unrelated package/Python/Rust static sweep. |
| G5 native harness, after its image assertion/fixture update | `node --test apps/desktop/scripts/native-smoke.node-test.mjs` | Existing leaf of `test:native-smoke-harness`, with G0 prerequisites satisfied. Covers current runner/fixture imports; preserve supervisor/cleanup tests. No new runner flags. |
| G6 native preparation, after fast gates | `pnpm.cmd package:piper-core:check`, then `pnpm.cmd build:desktop` once. | Current core integrity and changed renderer/executable; preserve resources and record artifact/tool/WebView identities. Build is preparation, not behavioral acceptance. |
| G7 native, same G6 executable | Both commands below. | Current JPEG WebView2 path plus one Piper EN direct/slow six-rate integrated path, start/resume, synchronization, interruption and cleanup. Native artifact/runner/voice/browser/environment changes invalidate the corresponding result. |
| G8 closeout | `pnpm.cmd check:evidence`, `git diff --check`, local Markdown-link/consistency inspection, then independent `change_reviewer`. | Current documentation, exact patch identities, all applicable host receipts, original failures and verified restoration. No runtime approval while evidence is missing. |

Planned G1 unit selection; prefixes are to be added in M1, not existing tests:

~~~powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/images/raster-image-policy.test.ts src/reader/images/raster-image-source.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts src/persistence/narration-position-save-bridge.test.ts -t RIA-
pnpm.cmd --% test:browser foundation.smoke.spec.ts reader-narration-bugfixes.smoke.spec.ts --grep "RIA-02|RIA-03"
~~~

G2 combines new regressions and the directly affected existing controls. These
are selected files, not the full desktop/repository test graph:

~~~powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/images/raster-image-policy.test.ts src/reader/images/raster-image-source.test.ts src/tts/pcm-playback.test.ts src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/reader/segment-highlight-controller.test.tsx src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts
~~~

G3 runs one filtered browser invocation. RIA-02/03 are the new discriminating
cases; existing cases preserve orientation, readable late handoff, visible Play,
worklet reuse/failure, pause/end ordering and exact completion. Do not add
repeat-each or a full browser sweep; verify the selected names/count:

~~~powershell
pnpm.cmd --% test:browser foundation.smoke.spec.ts reader-narration-bugfixes.smoke.spec.ts --grep "RIA-02|RIA-03|SAC-09/SAC-13/R8-01|RAC-01 delayed handoff|PSC-03|VUC-01|MPA-01/03|MPA-02|CHAT-AUDIT real bundled worklet|NLC real worklet|NCC final device counter"
~~~

G7 uses existing script modes and the explicit current Piper EN profile:

~~~powershell
node apps/desktop/scripts/native-startup-smoke.mjs
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-playback-speeds
~~~

Extend the existing native image fixture/assertions to include the density pair
and its oriented control without weakening PNG/JPEG checks. The model-free route
includes its existing protocol/lifecycle probes; retain them. The six-rate
option shares one Piper run and covers both direct and WSOLA paths; do not run
another language/model portfolio. A successful unavailable-profile branch is
not acceptance for this required playable Piper arm.

There is no blanket pre-edit green baseline: targeted red proofs establish the
new failures, and the combined final suites provide controls. Do not rerun G1
separately after G2/G3 passes. Shared static/browser/native gates run on the
combined patch once; later renewals need a concrete invalidation reason.
Root `check`/`check:portable`, full desktop/browser matrices, standalone DSP
evaluation/listening, GPU/Chatterbox/Qwen, installers and performance campaigns
are NO APLICA under unchanged responsibilities. Required future CI is not waived.

### Native preparation, receipts and bounded failures

Reuse intact payloads and caches after current integrity checks; do not rebuild
model packages just because the renderer changed. Keep the existing runner's
timeout, stage reporting, current process ownership and cleanup behavior.
Before temporary resource staging, journal original complete membership/hashes,
task-owned backup paths, intended restoration and verification. Restore in
`finally`; preserve pre-existing processes, scratch and personal state.

Record PID plus creation time and executable for owned processes, before/after
resource membership/hashes, zero newly retained audio/worklets/contexts, zero
persisted generated audio and zero external content requests. Missing restoration
proof blocks acceptance. Use only an already inspected preservation wrapper with
retrievable original identity; do not invent a large temporary test runner.

Classify failures as expected red, product, environment/preparation or
harness/cleanup. Preserve the original receipt. Permit at most one infrastructure
retry per failed stage with a concrete changed condition; another failure needs
diagnosis and an explicit plan revision. A live process without progress is not
a reason to launch duplicate work. Capture generated renderer/executable bytes
at the run itself, rather than trying to reconstruct missing proof later.

## Risks and rollback

- A placement replay routed through the save/navigation callback can overwrite a
  protected heard location or settle unrelated work. Assert absence of those effects.
- EXIF presentation dimensions must never lower physical allocation charges.
  Preserve predecode rejection, postdecode agreement, bounded directory reads,
  both byte orders, orientation, cancellation and exactly-once URL revocation.
- Promise resolution, worklet messages and ended callbacks can race with pause,
  replacement and short units. Confirm current ownership/activation, ordered
  once-only boundaries and final cleanup; no stale callback may affect a successor.
- Fixing only metrics or only start events leaves contradictory truth. They share
  the same confirmed-rendering state. Do not infer speaker audibility from a clock.
- RIA-C1 remains a bounded candidate; no scheduler/DSP rewrite or skipped-word claim
  is justified solely by its static suspicion.
- Historical timing values can reflect the premature-start defect. Preserve them
  as history; do not use them as corrected startup baselines or claim a speedup.
- Roll back only task-owned changes if abandoned. Preserve unrelated work and all
  failure evidence; never edit generated outputs or historical acceptance records.
  Rollback after committed implementation needs its own applicable Git authority.

## Progress log

- 2026-11-01: Revalidated all three roots and related variants from the chat at
  the clean planning base; distinguished current defects from hypothetical
  correction risks and the unconfirmed additional WSOLA drift candidate.
- 2026-11-01: Read current source/tests, required planning/product/architecture
  guidance, command configuration and VUC/R8/MPA/PSC evidence. Retrieved original
  result/input receipts; recorded current-file differences without accepting an
  old PASS. The latest 251 package exports match; the earlier G0 export capture
  does not. Installed environment proof remains an execution prerequisite.
- 2026-11-01: Selected one combined desktop group, one filtered Chromium pass,
  three static commands, the existing native harness leaf, one native build and
  two existing native modes. No tests, builds, model runs or implementation
  milestones executed during planning.
- 2026-11-01: Authored this documentation-only ExecPlan and active-index entry.
  Branch/commit and documentation-check outcomes are reported in the planning
  handoff; they do not mark M0-M3 as executed.
- 2026-11-01: The first planning evidence-check attempt stopped at the pnpm
  engine guard: PATH selected the automation fallback 11.25.0 instead of pinned
  11.15.1. The documentation retry used the already installed Corepack shim from
  VUC with network disabled; evidence retention passed. Its whitespace check
  then found one extra EOF blank line, removed before final document verification.

## Discoveries and decisions

- Three roots explain the confirmed cases; resume metrics and recovery are
  RIA-03 consequences, not separate cross-component projects.
- Replaying state at attachment is smaller than delaying reader mounting or
  changing App's handoff design. A positive replay must not become a saved move.
- Bounded JPEG intrinsic reconciliation preserves the current single-decode
  architecture and physical budgets; removing the comparison is not an acceptable fix.
- Existing worklet messages and player ownership provide the rendering seam.
  No service protocol or model work is necessary.
- The adaptive native mode exits before its image checks. Two existing modes
  on one build are the minimum current harness coverage without new orchestration.
- Historical fixtures and prepared artifacts are reusable inputs. No historical
  runtime PASS is accepted for changed rendering/reader behavior.
- The planning-only patch is exempt from independent behavior review under
  `agentic-change-review.md`; eventual implementation requires exact-patch
  `change_reviewer` approval. No refactor campaign roles are required.

## Final validation results

Implementation: **NOT STARTED**. G0-G8: **NOT EXECUTED for this ExecPlan**.
No implementation PASS, reproduced defect, native measurement, performance
improvement or independent implementation approval is claimed.

Planning reviewed source, test definitions and historical evidence only.
Documentation-only evidence/whitespace/link checks may run before the authorized
local planning commit and must be reported separately. The final handoff records
the actual branch, commit, those checks and the continued execution prohibition.
