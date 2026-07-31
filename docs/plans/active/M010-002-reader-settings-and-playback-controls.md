# M010.2 — Reader settings and pitch-preserving playback controls

## Goal

Reorganize VoxLeaf's implemented reader and narration controls into a
portfolio-ready reader-first shell, make English the safe default for new or
invalid narration-language state without overwriting valid saved choices, and
add engine-neutral pitch-preserving playback speeds from `1.00x` through
`0.75x`.

This focused follow-up runs before M011 packaging. It must preserve completed
M005-M010.1 narration, identity, buffering, synchronization, support,
recovery, privacy, and bounded-memory authority. It does not reopen engine
selection or model generation.

## User-visible outcome

After this plan passes:

- the publication is the dominant application surface;
- a fixed compact application bar exposes Open/Replace EPUB, concise
  compatibility, Settings, and Close EPUB;
- publication metadata and narration controls remain outside the sole reader
  scroll viewport;
- an accessible Settings drawer/sheet owns reader appearance, narration
  language/profile, startup policy, and compatibility detail;
- first run, explicit reset, and invalid current preference state default to
  English while valid saved Spanish or English remains unchanged;
- applicable Piper, Chatterbox, and gated Qwen profiles remain visible under
  their existing language, support, development, host, and runtime rules;
- the compact narration bar exposes playback speed values `1.00x`, `0.95x`,
  `0.90x`, `0.85x`, `0.80x`, and `0.75x`;
- speed changes preserve pitch, queued audio, identities, highlighting, and
  heard-position persistence without regenerating speech; and
- loaded-audio status truthfully distinguishes source media duration from
  effective listening duration at the selected speed.

The synthetic raster probe and raw diagnostics no longer appear in the normal
portfolio interface. They remain available only through an explicit
development/test gate.

## Current state

M010.1 is complete. Pull request #159 passed the required Ubuntu and Windows
checks and merged on 2026-07-30. The product implements explicit Spanish and
English selection, supported Piper language profiles, supported bilingual
Chatterbox, and development-only Qwen Serena/Spanish plus Aiden/English behind
the existing development and compatibility gates.

The ready desktop currently spreads configuration across several surfaces:

- `App.tsx` renders a large brand/file-open header, a top-right
  `HardwareCompatibilityControls` disclosure, publication metadata, narration,
  and the reader;
- `ReaderPublication.tsx` renders `ReaderPreferencesControls` inside the
  publication viewport;
- `AdaptivePreparationControls.tsx` renders Quick/Prepared startup, target,
  volume, and a disabled fixed-speed selector inside narration detail;
- `HardwareCompatibilityControls.tsx` renders language, profile,
  compatibility reasons, and recheck; and
- the empty application exposes the synthetic raster safety probe.

Completed M009.1 already provides one publication scroll owner, compact and
collapsible narration, visible segment highlighting, passive-scroll isolation,
and a bounded icon-only paragraph leaf. The refactor must reuse those domain
controllers rather than moving reader or narration logic into presentation
components.

Playback is fixed by
[`adaptive-buffer-authority-v1`](../../architecture/adaptive-buffer-authority-v1.md):

- `PcmPlaybackRequest.playbackRate` and player observations are literal `1`;
- `requestFrom` always sends `1`;
- `setPlaybackRate` rejects every non-default rate;
- the Web Audio backend assigns that rate to
  `AudioBufferSourceNode.playbackRate`; and
- heard progress is derived for normal-speed source-frame consumption.

Directly enabling that Web Audio parameter would lower pitch as playback
slows. The admitted product feature therefore requires a new bounded
pitch-preserving playback mechanism and source-frame progress accounting.

The persisted narration-language repository currently falls back to Spanish
through `DEFAULT_NARRATION_LANGUAGE_V1`. Valid saved Spanish/English choices
are already bounded and versioned. Quick/Prepared mode and Prepared target are
currently coordinator-session state. Volume remains active-player state.

The shared historical persisted-reading-state schema permits a positive
`playbackRate`, but current desktop reading-state persistence does not own the
new global narration-speed behavior. This plan must choose explicit bounded
desktop preference ownership rather than silently repurposing that schema.

Milestone 1 is complete. The frozen
[`reader settings and playback authority v1`](../../architecture/reader-settings-playback-authority-v1.md),
accepted
[`ADR-0033`](../../architecture/decisions/ADR-0033-freeze-reader-settings-and-pitch-preserving-playback-authority.md),
and executable desktop constants now close the shell, responsive, Settings,
language/profile presentation, preference, rate, arithmetic, backend,
resource, privacy, and validation inputs before production implementation.
The current runtime remains unchanged: Spanish fallback and `1.0x`.

Milestone 2 is also complete. Neither frozen eligible playback backend passed
every machine and required-host gate, so
[`ADR-0034`](../../architecture/decisions/ADR-0034-retain-fixed-speed-after-playback-backend-evaluation.md)
retains the implemented `1.00x` player. No listening gate was opened and every
experimental adapter was removed. Milestones 3-4 can be implemented
independently.

The maintainer has now made the required follow-up decision. Accepted
[`ADR-0035`](../../architecture/decisions/ADR-0035-reopen-reduced-range-fee-free-playback-evaluation.md)
reduces the future product range to six exact values ending at `0.75x`,
prohibits any candidate that requires a paid licence or non-permissive
distribution path, and authorizes a new result-blind v2 comparison without
rewriting v1. Milestone 2A is complete: the separate
[`reader settings and playback authority v2`](../../architecture/reader-settings-playback-authority-v2.md),
matching executable desktop constants/tests, and
[`ADR-0036`](../../architecture/decisions/ADR-0036-freeze-reduced-range-fee-free-playback-authority-v2.md)
were committed before candidate implementation or results. Milestone 2B is
next. Runtime remains `1.00x`.

## Scope and non-goals

### In scope

- Freeze the M010.2 product, interaction, persistence, timing, accessibility,
  and validation authority before production results.
- Freeze comparison and acceptance criteria for a bounded pitch-preserving
  in-memory time-stretch backend.
- Freeze and execute a separate reduced-range v2 comparison without changing
  the completed v1 result.
- Implement a fixed compact app bar and reader-first ready layout.
- Implement an accessible right-side Settings drawer on wide windows and
  full-width dialog-like sheet on narrow windows.
- Move existing reader appearance controls, language/profile controls,
  Quick/Prepared startup, Prepared target, compatibility recheck, and measured
  reasons into their approved Settings sections without duplicating domain
  logic.
- Keep Play/Pause/Resume/Stop, loaded duration, short lifecycle/recovery
  status, playback speed, volume, and narration disclosure in the compact
  narration bar.
- Make English the default for missing, invalid, unavailable, over-limit,
  unsupported-version, and explicitly reset narration-language state while
  preserving every valid saved Spanish or English choice.
- Persist Quick/Prepared startup and Prepared target in a separate bounded,
  versioned content-free narration-start preference.
- Persist playback speed in a separate bounded, versioned, content-free
  global narration-playback preference.
- Preserve current profile-language bindings and show development-only Qwen
  only when the existing development gate permits it.
- Implement pitch-preserving playback at every approved fixed rate.
- Correct audible source-frame progress, mid-unit rate changes, effective
  listening lead, startup, low-water, underrun, and status calculations.
- Preserve M008.1 transition pauses as unchanged wall-clock timers.
- Gate the synthetic raster probe and raw diagnostics behind explicit
  development/test state.
- Validate responsive layout, accessibility, lifecycle neutrality, identity
  replacement, synchronization, bounded resources, privacy, and exact-host
  listening.
- Reconcile product, architecture, setup/troubleshooting, roadmap, ADR, and
  system-diagram documentation with actual results.

### Non-goals

- Changing TTS model inputs, sampling controls, speaking-rate parameters,
  normalization, semantic segmentation, engine-specific preparation, or
  protocol v1.
- Admitting a new engine, voice, language, hardware class, or Qwen support
  state.
- Automatic language detection, translation, mixed-language switching,
  engine failover, or retry.
- A native operating-system File/View/Settings menu.
- Persisted default volume.
- Additional themes, fonts, resizable panels, settings import/export, or
  configurable keyboard shortcuts.
- Voice cloning, personal reference audio, or audiobook export.
- Persisting generated audio.
- M011 installer, runtime/model distribution, signing, updater, or license
  fulfillment.
- A paid, royalty-bearing, subscription, commercial-exception, copyleft, or
  unknown-licence playback dependency.

## Relevant files and documentation

### Current product and roadmap authority

- `docs/product/reader-settings-and-playback-controls.md`
- `docs/product/mvp.md`
- `docs/product/project-brief.md`
- `docs/plans/roadmap.md`
- `docs/README.md`
- `docs/plans/completed/M010-001-bilingual-narration-and-candidate-screening.md`

### Completed boundaries that must remain valid

- `docs/plans/completed/M005-narration-text-preparation.md`
- `docs/plans/completed/M008-bounded-adaptive-prebuffering.md`
- `docs/plans/completed/M008-001-boundary-aware-audio-transitions.md`
- `docs/plans/completed/M009-synchronized-reading-and-narration.md`
- `docs/plans/completed/M009-001-reader-experience-stabilization.md`
- `docs/plans/completed/M010-hardware-profiles-fallback-and-operational-resilience.md`
- `docs/architecture/adaptive-buffer-authority-v1.md`
- `docs/architecture/playback-transition-pause-policy-v1.md`
- `docs/architecture/synchronization-authority-v1.md`
- `docs/architecture/reader-experience-authority-v1.md`
- `docs/architecture/bilingual-narration-authority-v1.md`
- `docs/architecture/tts-support-matrix-v2.md`
- `docs/architecture/decisions/ADR-0002-in-memory-audio.md`
- `docs/architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md`
- `docs/architecture/decisions/ADR-0018-reader-experience-stabilization.md`
- `docs/architecture/decisions/ADR-0021-boundary-aware-audio-transitions.md`
- `docs/architecture/decisions/ADR-0031-admit-chatterbox-bilingual-and-qwen-language-profiles.md`
- `docs/architecture/decisions/ADR-0033-freeze-reader-settings-and-pitch-preserving-playback-authority.md`
- `docs/architecture/decisions/ADR-0034-retain-fixed-speed-after-playback-backend-evaluation.md`
- `docs/architecture/decisions/ADR-0035-reopen-reduced-range-fee-free-playback-evaluation.md`
- `docs/architecture/reader-settings-playback-authority-v2.md`
- `docs/architecture/decisions/ADR-0036-freeze-reduced-range-fee-free-playback-authority-v2.md`

### Likely implementation surfaces

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx`
- `apps/desktop/src/styles.css`
- `apps/desktop/src/reader/ReaderPublication.tsx`
- `apps/desktop/src/reader/ReaderPublication.test.tsx`
- `apps/desktop/src/reader/ReaderPreferences.tsx`
- `apps/desktop/src/reader/ParagraphLeaf.tsx`
- `apps/desktop/src/reader/reader-experience-authority.ts`
- `apps/desktop/src/reader/reader-experience-authority.test.ts`
- `apps/desktop/src/tts/ProductNarrationControls.tsx`
- `apps/desktop/src/tts/ProductNarrationControls.test.tsx`
- `apps/desktop/src/tts/AdaptivePreparationControls.tsx`
- `apps/desktop/src/tts/AdaptivePreparationControls.test.tsx`
- `apps/desktop/src/tts/HardwareCompatibilityControls.tsx`
- `apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx`
- `apps/desktop/src/tts/pcm-playback.ts`
- `apps/desktop/src/tts/pcm-playback.test.ts`
- `apps/desktop/src/tts/adaptive-buffer-authority.ts`
- `apps/desktop/src/tts/adaptive-buffer-authority.test.ts`
- `apps/desktop/src/tts/adaptive-buffer-scheduler.ts`
- `apps/desktop/src/tts/adaptive-buffer-scheduler.test.ts`
- `apps/desktop/src/tts/adaptive-preparation.ts`
- `apps/desktop/src/tts/adaptive-preparation.test.ts`
- `apps/desktop/src/tts/product-narration-coordinator.ts`
- `apps/desktop/src/tts/product-narration-coordinator.test.ts`
- `apps/desktop/src/tts/narration-language.ts`
- `apps/desktop/src/tts/narration-profile-language-registry.ts`
- `apps/desktop/src/tts/hardware-profile-compatibility.ts`
- `apps/desktop/src/persistence/narration-language-preference.ts`
- `apps/desktop/src/persistence/narration-language-preference.test.ts`
- new bounded narration-start and narration-playback preference modules
- `apps/desktop/tests/reader.spec.ts`
- `apps/desktop/scripts/native-startup-smoke.mjs`
- `apps/desktop/scripts/native-webdriver-client.node-test.mjs`

Generated shared validators must not be edited manually. A shared-contract
change is allowed only if the authority proves that an application-local
bounded contract is insufficient and the normal generation command is used.

## Architecture and constraints

### Product and domain ownership

Presentation may move, but ownership does not:

- EPUB rendering and locator-preserving reflow remain reader-owned.
- Reader preference validation and update behavior remain outside `App`.
- Language/profile compatibility remains compatibility-coordinator-owned.
- Language or profile changes remain identity-changing coordinator actions.
- Playback/startup choices remain narration-coordinator inputs.
- PCM, prepared text, work identity, and host reports remain outside React
  state.
- Settings contains views and callbacks, not inference, file, or protocol
  logic.

Opening Settings is lifecycle-neutral. Only an explicit changed control may
invoke its existing domain operation.

### Scroll, navigation, and synchronization

One publication viewport remains the sole large scroll owner. Application
bars, metadata, narration, Settings, and table of contents cannot become
publication position authority.

Passive wheel, touch, pointer, keyboard, resize, appearance preview, drawer
open/close, or sidebar open/close must preserve active narration, highlight,
play intent, and heard checkpoint. Explicit paragraph leaf, visible-passage,
stable passage, or chapter actions retain the completed identity-first
replacement path.

### Preference and migration rules

Every new preference is:

- bounded;
- versioned;
- content-free;
- independently validated;
- forward-version rejecting;
- safely defaulted; and
- tested under unavailable storage.

Valid existing narration language survives migration. The new English default
applies only when no valid value exists or the user explicitly resets
Narration settings.

The narration-start preference admits exactly:

- Quick start; or
- Prepared playback plus 1, 2, 5, or 10 minutes.

The future v2 narration-playback preference admits exactly the six approved
rates: 100%, 95%, 90%, 85%, 80%, and 75%.
No free-form number is accepted.

### Pitch-preserving backend gate

Milestone 1 and Milestone 2 are completed v1 authority and evidence. They
remain immutable and select no backend. Milestone 2A must freeze a separate v2
comparison before Milestone 2B implements or measures a candidate.

The v2 candidate set is limited to:

- `HTMLMediaElement.preservesPitch` with one bounded in-memory WAV and the
  exact candidate-specific `media-src 'self' blob:` CSP;
- one exact locked Signalsmith Stretch Web Audio WASM/AudioWorklet dependency
  after permissive package/source/transitive licence review; and
- one materially optimized incremental repository-owned WSOLA implementation,
  not the rejected v1 JavaScript prototype.

Every candidate must use platform functionality, repository-owned code, or a
reviewed fee-free permissive licence. No purchase, subscription, royalty,
paid seat, commercial exception, copyleft, source-availability, or unknown
licence is admitted. A candidate passes only when it satisfies:

- pitch and deterministic behavior at every non-default rate from `0.95x`
  through `0.75x`;
- intelligibility and naturalness at `1.00x`, `0.85x`, and `0.75x`;
- deterministic source-frame progress and mid-unit rate change;
- bounded active-unit and work-buffer memory;
- prompt pause, stop, seek, invalidation, and teardown;
- no generated-audio persistence;
- Windows WebView2 support;
- acceptable CPU/RAM impact while local inference runs;
- no external network or wider native capability;
- for the media candidate only, no CSP change beyond
  `media-src 'self' blob:` and no change to `connect-src`;
- dependency purpose and alternatives documented; and
- license and M011 distribution obligations unambiguous.

If no v2 mechanism passes, fail closed to implemented `1.00x` and continue the
reader/Settings scope without a speed selector. Do not tune the gates after
results or enable pitch-shifting playback as a substitute.

### Source duration and effective lead

Source sample frames remain the memory and release authority:

```text
sourceDurationMs = floor(remainingSourceFrames * 1000 / 24000)
```

Effective listening lead at rate `r` is derived without inflating stored PCM:

```text
effectiveListeningDurationMs =
  floor(remainingSourceFrames * 1000 / (24000 * r))
```

The v2 authority must specify integer/rational arithmetic for all six
rates so scheduling does not depend on floating-point drift. Exact threshold
and one-source-frame-before cases are required.

The simultaneous 43,200,000-source-frame, 172,800,000-byte, 256-unit, and
metadata ceilings do not increase. Slower playback extends listening time but
does not authorize additional retained source audio. At the minimum `0.75x`,
30 minutes of retained source audio represents at most 40 minutes of effective
listening time.

### Audible progress

The playback backend reports source frames consumed. At a rate change:

1. settle the active unit's consumed source frames under the prior rate;
2. publish any due bounded progress observation;
3. apply the new rate to the remaining source frames;
4. preserve the same session, generation, segment, sequence, and source range;
   and
5. continue without replaying or skipping source frames.

Pause freezes source-frame consumption. Semantic transition pauses remain
wall-clock timers and retain their existing freeze/cancel lifecycle.

### Privacy and process boundaries

No change may add:

- external requests;
- book text, prepared text, PCM, or host facts to React state;
- generated audio or text to persistence;
- a second TTS process;
- automatic retry/failover;
- a broad shell or filesystem capability;
- a new process protocol field; or
- a supported Qwen claim.

## Milestones

### Milestone 1: Freeze reader settings and playback authority

#### Work

1. Create an architecture authority that freezes:
   - fixed/scrolling region ownership;
   - Settings sections and drawer/sheet semantics;
   - compact narration bar contents;
   - exact responsive targets;
   - English fallback and migration rules;
   - Qwen development visibility;
   - startup and playback preference contracts;
   - exact speed set and default;
   - source/effective-duration arithmetic;
   - progress and mid-unit rate-change semantics;
   - unchanged transition-pause timing;
   - privacy/resource bounds; and
   - deterministic, browser, packaged, exact-host, and listening gates.
2. Add executable desktop constants and exhaustive result-blind tests.
3. Create an ADR accepting the authority and recording why speed belongs
   after synthesis.
4. Freeze pitch-preserving backend comparison inputs and gates before trying
   alternative implementations.
5. Confirm the authority changes no M005 normalization, TTS request, protocol,
   profile support, or model output.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd check:portable`
- `git diff --check`

Expected result: authority and tests freeze every input before production
backend or UI results exist.

Actual result: Passed. The pre-change desktop baseline passed 44 Vitest files
with 433 tests plus 11 native helper tests. After freezing the authority,
`pnpm.cmd --filter @voxleaf/desktop test` passed 45 Vitest files with 454 tests
plus the same 11 native helper tests, and desktop type checking passed.
`pnpm.cmd check:portable` passed TypeScript/Python formatting and linting,
generated-contract verification, TypeScript/Python type checking, 20 shared
files/209 tests, 34 EPUB files/580 tests, 45 desktop files/454 tests plus 11
native helper tests, 347 Python tests, both package builds, the desktop
production build, and the Python source/wheel build. `git diff --check`
passed. The run retained one content-free pytest cache-write warning and the
existing Vite Custom Highlight and chunk-size warnings.

#### Status

Complete.

### Milestone 2: Select and prove the bounded pitch-preserving backend

#### Work

1. Implement minimal synthetic-PCM adapters for only the frozen alternatives.
2. Measure pitch stability, source-frame accounting, latency, CPU/RAM, active
   work memory, pause/resume, rate change, stop, and teardown without a model
   or private EPUB.
3. Validate Windows Chromium/WebView2 availability and required worklet/CSP
   behavior without widening capabilities.
4. Review dependency purpose, alternatives, lock, license, and M011
   distribution impact before adding any production package.
5. Select exactly one passing backend or record that none passes. Do not tune
   gates after listening.
6. Delete experimental audio and unselected implementation artifacts.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `git diff --check`

Expected result: one bounded pitch-preserving backend passes every frozen
machine and listening gate, or the plan stops honestly without enabling
non-`1.00x` playback.

Actual result: Passed with no backend selected, which is one of the two frozen
valid outcomes. Repository AudioWorklet WSOLA passed the signal and lifecycle
gates in Chromium and packaged WebView2: maximum pitch deviation was 7.859
cents, duration error and source-frame drift were zero, packaged backend start
p95 was 90.9 ms, rate settlement was 0.3 ms, and bounded work memory was
3,843,840 bytes. It failed the resource gate. Chromium measured approximately
129.664 MiB additional RAM and 84.907 CPU percentage points; packaged WebView2
measured 47.926 MiB additional RAM and 114.279 CPU percentage points. The CPU
limit is 20 percentage points and was not changed after results.

`HTMLMediaElement.preservesPitch` with an in-memory WAV copy passed Chromium
signal, lifecycle, and resource gates at approximately 33.773 MiB additional
RAM and 2.041 CPU percentage points. Packaged WebView2 exposed the API but
rejected the `blob:` media source under the unchanged Tauri CSP with the fixed
content-safe outcome `media-trial-play-not-supported`. PCM16 adaptation
confirmed the rejection was not specific to float32 WAV encoding. Expanding
`media-src` was outside the frozen authority. The direct
`AudioBufferSourceNode.playbackRate` negative control shifted pitch by up to
1,200 cents and failed as expected.

No candidate reached the listening gate, so no speech, model, or maintainer
listening was required. The comparison added no dependency, had no license or
M011 distribution obligation, made zero external requests, and persisted zero
generated-audio bytes. The synthetic adapters, WAVs, worklet, browser hooks,
and exact-host runner were deleted after recording these content-free results.
The runtime remains `1.00x`.

After cleanup, `pnpm.cmd --filter @voxleaf/desktop test` passed 45 Vitest
files/454 tests plus 11 native helper tests, desktop type checking passed, and
`pnpm.cmd check:portable` passed formatting, linting, generated contracts,
TypeScript/Python types, 20 shared files/209 tests, 34 EPUB files/580 tests,
45 desktop files/454 tests plus 11 helpers, 347 Python tests, and all portable
builds. `pnpm.cmd test:browser` reported all six browser tests passed, but its
Windows Playwright/Vite wrapper did not exit and the command timed out after
the result. `pnpm.cmd test:native-startup` built the release executable and
then stopped at the host's pre-existing `webdriver-session-not-created`
bridge failure. The candidate-required packaged WebView2 proof instead passed
through the direct content-safe DevTools runner described above. All 594
relative Markdown links across 101 documents resolve; changed-document
privacy and prohibited-artifact scans report zero findings; and `git diff
--check` passes.

#### Status

Complete.

### Milestone 2A: Freeze reduced-range fee-free v2 authority

#### Work

1. Create `reader-settings-playback-authority-v2.md` and matching executable
   desktop constants/tests without changing v1 bytes or completed results.
2. Freeze exactly `1.00x`, `0.95x`, `0.90x`, `0.85x`, `0.80x`, and `0.75x`;
   reject every other persisted or runtime value.
3. Freeze only the three ADR-0035 candidates and exact version/package/source
   identities before candidate implementation:
   - `HTMLMediaElement.preservesPitch` plus an in-memory WAV;
   - Signalsmith Stretch Web Audio WASM/AudioWorklet; and
   - an optimized incremental repository-owned WSOLA.
4. Freeze a licence manifest requiring platform, repository-owned, or
   permissive fee-free code. Reject paid, royalty, subscription,
   commercial-exception, copyleft, source-availability, and unknown licences.
5. Freeze the candidate-specific CSP delta as exactly
   `media-src 'self' blob:`. Preserve `connect-src`; prohibit `data:`, remote
   media, wildcards, and new native capabilities.
6. Freeze one active object URL, one active stretcher, bounded unit/work
   memory, source-frame accounting, prompt lifecycle, zero external requests,
   zero persisted audio, and deterministic revocation/cleanup.
7. Retain the v1 CPU, RAM, work-memory, pitch, duration, drift, latency,
   cancellation, Chromium, packaged WebView2, and privacy limits.
8. Freeze deterministic evaluation at all five non-default rates and
   repository-authored Spanish/English listening at `1.00x`, `0.85x`, and
   `0.75x`.
9. Add an ADR accepting v2 authority before any result-bearing commit.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd check:portable`
- `git diff --check`

Expected result: the reduced rates, three candidates, exact CSP, licence
eligibility, unchanged resource/privacy limits, and pass/fail gates are
result-blind and executable before candidate code or measurements exist.

Actual result: Complete. Commit `abf99d6` freezes the separate v2 architecture
and executable authority before any candidate implementation or result. The
closed set contains exactly six rates from `1.00x` through `0.75x`; rejects
the old `0.70x`-through-`0.50x` values; and retains exact rational
source/effective-duration arithmetic.

Only three candidate identities are admitted: the named host media APIs and
one bounded in-memory WAV; published `signalsmith-stretch@1.3.2` pinned to its
registry integrity, tarball, repository, Git head, entry points, declared
dependency state, size, and file count; and new repository-owned incremental
WSOLA v2 source paths whose implementation commit must be a strict descendant
of the authority commit. The rejected v1 WSOLA prototype cannot be relabelled.

The licence manifest admits only host APIs, repository-owned MIT code, or
exact reviewed fee-free permissive code. Signalsmith's published MIT metadata
is frozen, but its package/source/transitive/shipped-artifact audit remains a
mandatory Milestone 2B pre-install stop. Paid, royalty, subscription,
paid-seat, commercial-exception, copyleft, source-availability, unknown, or
ambiguous terms fail closed.

The media-only prospective CSP delta is exactly
`media-src 'self' blob:`. Executable tests read the current Tauri config and
prove it remains unchanged, including the existing `connect-src`; remote,
`data:`, wildcard media and native capability changes are prohibited. One
object URL, one stretcher, one candidate at a time, existing source/unit/work
bounds, deterministic lifecycle cleanup, zero external requests, and zero
persisted audio are frozen. All v1 machine, required-host, bilingual input,
and privacy gates remain unchanged. Deterministic rates are the five
non-default values; listening rates are `1.00x`, `0.85x`, and `0.75x`.

Before documentation reconciliation, all 468 desktop Vitest tests plus 11
native helper tests and desktop type checking passed. The final portable,
link, privacy, artifact, and diff checks are recorded in the progress log.
No package, CSP, preference, runtime, model, protocol, or native capability
changed.

#### Status

Complete.

### Milestone 2B: Execute the reduced-range fee-free comparison

#### Work

1. Implement the smallest synthetic adapters necessary for the three frozen
   v2 candidates; do not integrate them into product playback.
2. Complete the exact Signalsmith package/source/transitive licence and lock
   audit before installation. Stop if any distribution right is ambiguous or
   requires payment, copyleft, source availability, or a commercial exception.
3. Measure every candidate sequentially at the frozen rates with synthetic
   PCM, including pitch, duration, source-frame drift, start/rate/lifecycle
   latency, CPU, RAM, work memory, and cleanup.
4. For the media candidate, test the exact CSP delta in Chromium and packaged
   WebView2; prove zero external requests, one bounded object URL, and
   revocation across every invalidating lifecycle.
5. Measure candidates beside the applicable local inference profiles without
   running more than one TTS child or more than one stretcher.
6. Advance only machine-passing candidates to ephemeral repository-authored
   Spanish/English listening at `1.00x`, `0.85x`, and `0.75x`.
7. Select exactly one candidate or none without changing gates after results.
8. Retain the CSP/dependency only when its candidate is selected. Delete
   unselected code, packages, WAVs, generated speech, temporary licence
   material, and experimental runners.
9. Record one durable content-free selection ADR and update Milestones 3, 5,
   and 6 with actual dependencies.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `git diff --check`

Expected result: one fee-free pitch-preserving backend passes every frozen v2
gate for the six-value range, or VoxLeaf honestly retains `1.00x` and proceeds
without a speed selector.

Actual result: In progress. The mandatory pre-install Signalsmith audit passed
before the exact package was added to the candidate-only comparison tree.
The published tarball matches the frozen integrity, four-file manifest, and
dependency-free metadata. Its frozen source commit is MIT; the compiled
`signalsmith-linear` source is also MIT and has no shipped runtime dependency.
The tarball omits the licence text, so selection would require carrying both
upstream MIT notices and a final M011 distribution review. Synthetic
Chromium/WebView2 adapters, bounded runners, and the materially new
incremental WSOLA source are implemented for a strict-descendant checkpoint;
no measurement in the working tree is authoritative until that checkpoint is
committed and the frozen matrix is repeated. Checkpoint `f2e5fed` is that
strict descendant. The official Chromium arm then passed the media and
incremental-WSOLA candidates and rejected Signalsmith before its first trial.
Media measured 0.348 cents maximum pitch deviation, 0.042 ms maximum duration
error, zero source-frame drift, 5.7 ms start p95, 1,536,044 bytes maximum work,
116.949 MiB additional RAM, and no measured CPU increase. Incremental WSOLA
measured the same maximum pitch deviation, zero duration error/frame drift,
99.9 ms start p95, 803,840 bytes maximum work, 12.449 MiB additional RAM, and
2.750 CPU percentage points. Both retained bounded cleanup with zero external
requests and zero persisted audio bytes. Only these two Chromium passers
advance to packaged WebView2.

#### Status

In progress.

### Milestone 3: Implement bounded settings preferences and English fallback

#### Work

1. Amend/version bilingual product authority for English fallback.
2. Change the application fallback to English for missing/invalid/unavailable
   language state and explicit reset only.
3. Preserve every valid saved Spanish or English preference.
4. Add separate versioned narration-start and narration-playback preference
   repositories with closed values, limits, migrations, and unavailable-store
   behavior. Create the playback preference and expose its selector only if
   Milestone 2B admits a backend; otherwise keep the runtime fixed at `1.00x`.
5. Hydrate preferences before the corresponding controls become actionable
   without starting a model.
6. Keep volume session-only and reader appearance in its existing repository.
7. Verify reset behavior cannot change a running identity without the same
   explicit stop/cleanup path used by direct selection.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `git diff --check`

Expected result: bounded preference tests cover every valid/default/malformed/
future/unavailable case and existing Spanish selections survive upgrade.

Actual result: Not run.

#### Status

Not started.

### Milestone 4: Implement the reader-first shell and accessible Settings

#### Work

1. Refactor the ready application into fixed app bar, compact
   publication/narration region, and sole reader scroll viewport.
2. Move reader preference controls visually into Settings while reusing the
   existing reader-owned reflow/locator update callbacks.
3. Move language/profile, startup mode/target, recheck, and compatibility
   detail into the approved sections.
4. Keep a concise compatibility result in the app bar.
5. Implement wide drawer and narrow full-width sheet semantics, focus
   containment, Escape, focus restore, and no nested trap.
6. Make the table of contents collapsible/overlay without creating another
   reading-position authority.
7. Gate the raster probe and developer diagnostics.
8. Preserve normal-reader display at light, dark, forced-colors, reduced
   motion, and narrow/wide sizes.
9. Prove that opening/closing Settings does not detect, load, stop, replace, or
   mutate narration and does not move the reading locator.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `git diff --check`

Expected result: deterministic, browser, and packaged tests prove the fixed
reader shell, accessible Settings, responsive behavior, and unchanged
lifecycle ownership.

Actual result: Not run.

#### Status

Not started.

### Milestone 5: Integrate speed into playback, scheduling, and synchronization

#### Work

1. Replace literal-`1` playback types with the closed rate type.
2. Integrate the selected pitch-preserving backend into the sole active-unit
   playback boundary.
3. Implement old-rate settlement and source-frame continuation for mid-unit
   changes.
4. Keep pause/resume, transition timers, volume, stop, seek, replacement,
   failure, cleanup, and release ownership correct at every rate.
5. Add effective-listening-lead arithmetic to startup, prepared, low-water,
   refill, and underrun decisions while leaving source-frame/byte ceilings
   unchanged.
6. Expose the canonical selector in the compact narration bar and remove the
   disabled duplicate from details.
7. Report loaded duration truthfully, including the selected rate when the
   displayed amount is effective listening time.
8. Verify rate changes never call preparation, synthesis, service restart,
   profile replacement, or generation invalidation.
9. Verify audible highlighting and persisted heard locator follow consumed
   source frames across pauses and rate changes.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `git diff --check`

Expected result: every approved rate, threshold edge, mid-unit change,
navigation/lifecycle action, progress projection, and release path passes
without changed model input or unbounded retention.

Actual result: Not run. ADR-0035 supplies the follow-up product decision, but
this milestone still depends on Milestones 2A-2B freezing and admitting one
v2 backend. If no v2 candidate passes, omit the speed selector and retain
`1.00x`; do not block the reader-first Settings work.

#### Status

Blocked until Milestone 2B records one admitted backend.

### Milestone 6: Validate the portfolio reader and close the plan

#### Work

1. Run repository-authored Spanish and English EPUB journeys across applicable
   Piper, Chatterbox, and gated Qwen profile presentation without running two
   model children simultaneously.
2. Validate Settings before/after open; first-run English; preserved Spanish;
   profile/language replacement; quick/prepared restoration; speed
   restoration; and development-only visibility.
3. Run `1.00x`, `0.85x`, and `0.75x` exact-host listening journeys
   for pitch, intelligibility, start, progress, highlight, leaf navigation,
   pause/resume, buffering, rate change, stop, recovery, book replacement, and
   exit.
4. Measure content-free CPU/RAM impact, playable/effective lead, underruns,
   progress drift, cancellation latency, cleanup, and retained source
   frames/bytes/units.
5. Confirm zero external requests and zero generated-audio persistence.
6. Run privacy, artifact, link, and scope scans.
7. Reconcile authority, ADR, product docs, architecture overview, system
   diagram, roadmap, setup, troubleshooting, and this ExecPlan with actual
   results.
8. Run all repository checks and required Ubuntu/Windows pull-request checks.
9. Move the plan to `completed/` only after all required checks pass.

#### Validation

- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `pnpm.cmd check`
- `git diff --check`

Expected result: the portfolio-facing reader, Settings, English fallback, and
pitch-preserving speeds pass deterministic, browser, packaged, exact-host,
privacy, bounded-resource, and required pull-request validation.

Actual result: Not run. The reduced-range closeout depends on the Milestone 2B
decision. If one backend is admitted, Milestones 5-6 validate all six exact
rates plus the three frozen listening rates. If none is admitted, closeout
must validate the reader/Settings outcome honestly without a speed selector.

#### Status

Blocked until Milestone 2B records the v2 result and closes the applicable
Milestone 5-6 path.

## Testing and benchmark strategy

### Deterministic tests

Cover:

- every exact speed and invalid rate;
- rational source/effective-duration arithmetic;
- exact threshold and one-source-frame-before cases;
- old-rate settlement during a unit;
- pause/resume and transition-pause timing;
- scheduler lead and underrun behavior;
- no regeneration or identity replacement on speed change;
- exact release/cleanup ownership;
- every preference read/write/migration/default case;
- existing valid Spanish/English retention;
- Settings lifecycle neutrality;
- language/profile/development visibility;
- responsive and accessibility state; and
- unchanged leaf/highlight/passive-scroll behavior.

Synthetic PCM uses generated tones/noise with no human or book content.

### Browser and packaged validation

Extend existing Playwright and native startup scenarios rather than adding an
unreviewed test harness. Cover wide, compact, and narrow layouts; keyboard
dialog behavior; forced colors; reduced motion; sole scroll ownership;
preference restoration; source-frame progress; and no external requests.

### Exact-host evidence

Exact-host listening is required because deterministic tone tests cannot prove
natural voice quality. Use repository-authored synthetic Spanish and English
text only. Record content-free rate, engine/profile ID, timing, drift,
underrun, CPU/RAM, cancellation, and cleanup observations. Do not retain
waveforms, EPUBs, prepared text, screenshots containing private books, raw
host identity, model paths, or process arguments.

Qwen remains optional development-only and does not need a support-state
reevaluation. The plan validates that presentation and playback-rate handling
are engine-neutral, not that Qwen becomes real-time.

### Repository commands

Use only commands already defined by repository configuration:

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `pnpm.cmd check`
- `git diff --check`

## Risks and rollback

- **Pitch-preserving output sounds distorted at low rates.** Freeze listening
  gates first. Do not admit a rate/backend that fails. Keep product playback
  at `1.00x` rather than silently pitch-shifting.
- **Time stretching consumes too much CPU or memory beside inference.** Bound
  active work to the current unit, measure exact-host concurrency, and stop if
  the backend causes unsafe resource growth or materially worsens generation.
- **WebView2 lacks required worklet behavior.** Prove the packaged host before
  integration. Do not widen native capabilities as a workaround without new
  authority.
- **Source progress drifts after rate change.** Source frames, not wall time,
  remain authoritative; every old-rate transition must settle before the new
  rate is applied.
- **Effective lead accidentally expands PCM retention.** Keep all memory
  ceilings in source frames/bytes. Effective duration changes thresholds and
  display only.
- **Settings refactor duplicates domain state.** Reuse current reader,
  compatibility, persistence, and narration coordinators; keep Settings
  presentation-only.
- **Opening Settings interrupts narration.** Add negative-effect tests for
  detection, model lifecycle, identity, playback, locator, and persistence.
- **English default overwrites a user's Spanish choice.** Preserve every valid
  saved value and test upgrade separately from missing/invalid/reset state.
- **Focus or responsive overlays regress reading.** Freeze one dialog contract,
  one publication scroll owner, focus return, and no nested traps.
- **Scope delays M011.** Keep native menus, volume persistence, extra themes,
  shortcuts, and engine changes out. Complete milestones sequentially and
  stop on the first genuine hardware, licensing, or product-decision blocker.
- **A candidate creates a paid or ambiguous distribution obligation.** Audit
  the exact package, source, transitive dependencies, and shipped artifacts
  before installation. Reject it rather than buying a licence or weakening
  the fee-free permissive gate.

Rollback is additive:

- preference readers fail closed to documented defaults;
- UI components can retain the prior domain coordinators;
- no shared book state or generated audio requires migration;
- the player can remain `1.00x` if the new backend is not admitted; and
- completed M005-M010.1 authority and model/profile decisions remain
  unchanged.

Do not rewrite accepted historical authority to make a result pass.

## Progress log

- **2026-07-30:** Created the M010.2 product specification and this ExecPlan
  after M010.1 pull request #159 passed Ubuntu/Windows checks and merged.
  Converted the approved ignored design discussion into tracked requirements:
  reader-first fixed shell, accessible Settings, English fallback with valid
  preference preservation, language-specific profile visibility, bar-only
  playback speed, pitch preservation, source/effective-duration separation,
  bounded persistence, and pre-M011 sequencing. No production code,
  dependency, preference schema, authority, or runtime behavior changed.
- **2026-07-30:** Validated this documentation checkpoint with
  `pnpm.cmd check:portable`: formatting, linting, TypeScript/Python type
  checks, 1,580 tests, the desktop production build, and Python package build
  pass. Relative links in all 13 changed Markdown files and
  `git diff --check` pass. The run retains one content-free pytest cache-write
  warning plus existing Vite highlight/chunk-size warnings.
- **2026-07-30:** An attempted current-status edit to historical bilingual
  authority caused the v8-v12 hash verifiers to fail closed. Restored that
  hashed authority byte-for-byte. A later source inspection confirmed that
  the ExecPlan itself is not a benchmark hash input, so M010.1 was moved to
  `completed/` and all references were reconciled. All 347 Python tests then
  passed.
- **2026-07-30:** Completed Milestone 1 on
  `feat/m010-002-freeze-reader-settings-playback-authority`. Added executable
  authority and 21 result-blind desktop tests, froze the architecture
  authority and ADR-0033, and reconciled product, architecture, system
  diagram, roadmap, testing, and ExecPlan status. The frozen comparison admits
  only repository AudioWorklet WSOLA and HTMLMediaElement `preservesPitch`
  with an in-memory WAV copy; direct AudioBufferSource rate control remains a
  pitch-changing negative control. Focused desktop tests/type checking and
  the complete portable gate pass. All 589 relative Markdown links across 100
  documents resolve; the 14-file branch has zero private-path/email/key
  pattern findings and zero prohibited book/audio/model artifact paths; and
  `git diff --check` passes. No production runtime, preference, protocol,
  support, model, dependency, or native-capability behavior changed.
- **2026-07-30:** Completed Milestone 2 on
  `feat/m010-002-prove-pitch-preserving-backend`. A result-blind synthetic PCM
  harness measured both eligible candidates and the negative control in
  Chromium, then a direct content-safe DevTools connection measured the
  packaged application on the installed Windows WebView2 after the existing
  Tauri WebDriver bridge could not create a session on this host. WSOLA passed
  pitch, timing, frame, work-memory, and lifecycle gates but failed the frozen
  CPU gate in both Chromium and WebView2. The media-element candidate passed
  Chromium but packaged WebView2 rejected its in-memory `blob:` WAV under the
  unchanged CSP. No candidate reached listening. ADR-0034 retains `1.00x`;
  all experimental implementation/audio artifacts were deleted and no
  dependency or runtime behavior remains.
- **2026-07-30:** Recorded the maintainer's reduced-range follow-up in
  ADR-0035 without changing the completed v1 evidence. The future range is
  exactly `1.00x`, `0.95x`, `0.90x`, `0.85x`, `0.80x`, and `0.75x`.
  Milestones 2A-2B will freeze and then compare the narrowly admitted media,
  Signalsmith Stretch, and optimized repository WSOLA candidates. Every
  candidate must be built-in, repository-owned, or permissively licensed with
  no purchase, royalty, subscription, commercial exception, copyleft,
  source-availability, or unknown distribution obligation. Runtime remains
  `1.00x`; no dependency or CSP change has been made.
- **2026-07-30:** Reconciled the product requirements, roadmap, documentation
  index, architecture overview/system diagram, setup/testing guidance, and
  this ExecPlan with the v2 decision. `pnpm.cmd check:portable` passed
  formatting, linting, generated-contract verification, TypeScript/Python
  types, 20 shared files/209 tests, 34 EPUB files/580 tests, 45 desktop
  files/454 tests plus 11 native helper tests, 347 Python tests, and all
  portable builds. All 600 relative Markdown links resolve; the 14 changed
  Markdown files have zero private-path/email/key findings and zero prohibited
  artifact paths; and `git diff --check` passes. The run retained the existing
  content-free pytest cache-write warning and Vite highlight/chunk-size
  warnings.
- **2026-07-30:** Completed Milestone 2A on
  `feat/m010-002-freeze-reduced-range-v2-authority`. Authority checkpoint
  `abf99d6` adds a separate architecture v2, executable constants and 14
  result-blind tests, and ADR-0036 without changing immutable v1. It freezes
  six rates, exact media/Signalsmith 1.3.2/new repository WSOLA identities,
  fee-free licence rules, the media-only CSP delta, inherited v1 gates,
  bounded lifecycle cleanup, and strict commit lineage. Published package
  metadata reports MIT and no declared dependencies; the complete
  package/source/transitive/shipped-artifact audit remains a Milestone 2B
  pre-install requirement. No dependency, CSP, candidate, result, runtime, or
  native capability was added. `pnpm.cmd check:portable` passed formatting,
  linting, generated-contract verification, TypeScript/Python types, 20 shared
  files/209 tests, 34 EPUB files/580 tests, 46 desktop files/468 tests plus 11
  native helpers, 347 Python tests, and all portable builds. All 361 relative
  links across 13 changed Markdown documents resolve; the branch diff has zero
  private-path/email/key findings and zero prohibited book/audio/model
  artifact paths; and `git diff --check` passes. The run retains the existing
  content-free pytest cache-write warning and Vite highlight/chunk-size
  warnings.
- **2026-07-30:** Began Milestone 2B on
  `feat/m010-002-execute-reduced-range-v2-comparison`. Before installation,
  the exact `signalsmith-stretch@1.3.2` registry tarball matched the frozen
  SHA-512 integrity, 96,347-byte archive, four-file/232,286-byte unpacked
  manifest, dependency-free package metadata, and source commit
  `222093b4cc13ddb4d07c826bc3c1559326091731`. The upstream source licence is
  MIT. Its compiled `signalsmith-linear` source is tag `0.1.2`, commit
  `fa5dbc0abfbd161e9a9cc10a7b418fa9dfc83a45`, also MIT, with no shipped
  production dependency. The npm tarball does not include either licence
  text; if selected, VoxLeaf must ship both notices and complete M011
  distribution review. No purchase, royalty, subscription, copyleft,
  source-availability, commercial exception, or ambiguous right was found.
  The exact package was then installed candidate-only. A bounded Chromium
  runner, exact media-only packaged CSP runner, in-memory WAV adapter,
  self-hosted Signalsmith worklet module, and new incremental repository WSOLA
  adapter were implemented for the strict-descendant implementation
  checkpoint. Pre-checkpoint exploratory output is explicitly
  non-authoritative.
- **2026-07-30:** Committed the result-blind implementation checkpoint as
  `f2e5fed`, a strict descendant of authority commit `abf99d6`, then ran the
  official frozen Chromium arm. The exact media candidate passed every
  signal, lifecycle, privacy, and resource gate: 0.348 cents maximum pitch
  deviation, 0.042 ms maximum duration error, zero source-frame drift, 5.7 ms
  start p95, 1,536,044 bytes maximum work, 116.949 MiB additional RAM, and no
  measured CPU increase. Incremental WSOLA also passed: 0.348 cents maximum
  pitch deviation, zero duration error/frame drift, 99.9 ms start p95,
  803,840 bytes maximum work, 12.449 MiB additional RAM, and 2.750 CPU
  percentage points. Signalsmith failed closed before its first trial and did
  not advance. The arm made zero external requests and persisted zero audio
  bytes. The packaged runner was narrowed to the two machine-passing Chromium
  candidates without changing any frozen gate.

## Discoveries and decisions

- The current ready interface has one correct reader scroll owner, but reader
  preferences are still rendered inside it and setup controls are distributed
  across the header, compatibility panel, and narration detail.
- The top application control is an application bar, not a native
  operating-system menu bar.
- Playback speed belongs in the compact narration bar because it is a frequent
  listening control. It must not be duplicated in Settings.
- Speed belongs after synthesis so one implementation applies to every engine
  and rate changes do not regenerate audio.
- Direct `AudioBufferSourceNode.playbackRate` changes pitch and is not accepted
  as the product solution for the full range.
- Slower playback may improve wall-clock buffer endurance but does not improve
  model RTF.
- Source frames/bytes remain memory authority; effective listening duration
  becomes startup/low-water/underrun authority.
- Existing semantic transition pauses remain wall-clock timers.
- English is the future fallback only for missing/invalid/reset state; valid
  Spanish and English preferences remain authoritative.
- Qwen/Aiden and Qwen/Serena remain visible only through their existing
  language binding and development gate. M010.2 does not change support.
- Signalsmith's exact package and source are fee-free MIT, including the
  compiled `signalsmith-linear` source, but the published npm tarball omits
  both licence texts. Selection would therefore retain an explicit notice
  obligation; rejection must remove the package and its experimental code.
- Quick/Prepared startup and target should become a separate bounded
  narration-start preference. Volume remains session-only.
- The ignored concept images remain discussion artifacts and are not
  committed as implementation evidence.
- The v8-v12 benchmark chain hashes historical bilingual authority, not the
  M010.1 ExecPlan. The authority must remain byte-identical; the completed
  plan belongs under `docs/plans/completed/`.
- Exact playback rates are persisted and calculated as integer percentages,
  not floating-point preference values. This closes the value set and gives
  deterministic rational source/effective-duration arithmetic.
- The exact responsive targets are now 400 CSS pixels for the wide Settings
  drawer, 360 CSS pixels for the compact drawer, 260 CSS pixels for the
  optional wide contents panel, and a full-width sheet below 800 CSS pixels.
- No current Web playback mechanism is assumed acceptable. Milestone 2 must
  apply the frozen tone, impulse, speech, pitch, drift, latency, memory, CPU,
  browser, packaged-host, and fluent-listening gates without tuning them
  after results.
- Repository WSOLA is technically correct but not resource-admissible: its
  packaged WebView2 signal/lifecycle result passed while CPU increased by
  approximately 114.279 percentage points against the frozen 20-point limit.
- `HTMLMediaElement.preservesPitch` is efficient and accurate in production
  Chromium, but the packaged Tauri CSP does not authorize its in-memory
  `blob:` media source. PCM16 and float32 WAV inputs produce the same closed
  packaged-host rejection, so encoding is not the blocker.
- A Web API being present is not evidence that its complete data path is
  admitted by the packaged security policy. Capability detection and an
  exact-host operation must both pass.
- The existing CSP may be reconsidered only through new result-blind
  authority. It was not widened to make the observed media candidate pass.
- Because no machine-admissible candidate exists, the listening gate is not
  applicable and the product remains `1.00x`.
- The 43,200,000-source-frame ceiling remains resource authority at every
  rate. Effective listening duration changes threshold meaning only and can
  reach 3,600,000 milliseconds at `0.50x` without retaining more PCM.
- That `0.50x` calculation belongs to the completed v1 comparison. Under
  ADR-0035, the future minimum is `0.75x`, so 30 minutes of retained source
  audio represents at most 40 minutes (2,400,000 milliseconds) of effective
  listening time.
- The published package name is `signalsmith-stretch`, not the initially
  considered scoped spelling. Version 1.3.2 publishes MIT metadata, exact
  integrity and Git-head identity, four files, and no declared dependency,
  optional-dependency, or peer-dependency entries. This narrows identity but
  does not replace the Milestone 2B shipped-artifact and distribution audit.
- Freezing a prospective CSP string does not authorize it at runtime. The
  current Tauri CSP remains byte-identical; only a machine-passing media
  candidate may retain the exact `media-src 'self' blob:` delta.

## Final validation results

M010.2 Milestones 1-2A are complete. Milestone 1 validation added 21
result-blind authority tests and passed the complete portable gate. Milestone
2 produced the closed Chromium and packaged WebView2 evidence recorded above,
selected no backend, removed all experimental adapters, and added no
dependency, capability, persisted audio, or external request. Milestone 2A
then committed the separate executable v2 authority before implementation or
results, retaining immutable v1 evidence and current `1.00x` runtime.

The full plan remains active. ADR-0035 supplies the reduced-range product
decision and ADR-0036 freezes its v2 authority; Milestone 2B is next.
Milestones 3-4 have not run and remain independent of the backend result.
Milestone 5 depends on Milestone 2B admitting one backend. No M010.2 Settings,
preference migration, English runtime fallback, time-stretch backend,
effective-lead scheduling, or non-`1.00x` runtime behavior is claimed.
Current production behavior remains the completed M010.1 interface, Spanish
fallback, and `1.0x`.
