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
Milestone 3 now implements the bounded preference subset: valid saved Spanish
or English survives upgrade, safe fallback/reset state uses English, and
Quick/Prepared startup is separately persisted and hydrated before use.
Milestone 4 is also complete. The ready application now uses the frozen
reader-first shell: a fixed compact app bar, compact publication and narration
chrome, one publication scroll viewport, a collapsible contents overlay, and
an accessible Settings drawer/sheet. Existing reader, compatibility, and
narration coordinators retain domain ownership. Playback remains `1.0x` until
Milestone 5 connects the selected WSOLA backend.

Milestone 2 is also complete. Neither frozen eligible playback backend passed
every machine and required-host gate, so
[`ADR-0034`](../../architecture/decisions/ADR-0034-retain-fixed-speed-after-playback-backend-evaluation.md)
retains the implemented `1.00x` player. No listening gate was opened and every
experimental adapter was removed. Milestones 3-4 can be implemented
independently.

The maintainer made the required follow-up decision. Accepted
[`ADR-0035`](../../architecture/decisions/ADR-0035-reopen-reduced-range-fee-free-playback-evaluation.md)
reduces the future product range to six exact values ending at `0.75x`,
prohibits any candidate that requires a paid licence or non-permissive
distribution path, and authorizes a new result-blind v2 comparison without
rewriting v1. Milestone 2A is complete: the separate
[`reader settings and playback authority v2`](../../architecture/reader-settings-playback-authority-v2.md),
matching executable desktop constants/tests, and
[`ADR-0036`](../../architecture/decisions/ADR-0036-freeze-reduced-range-fee-free-playback-authority-v2.md)
were committed before candidate implementation or results. Milestone 2B is
complete. The frozen v2 comparison selected no backend, and
[`ADR-0037`](../../architecture/decisions/ADR-0037-retain-fixed-speed-after-reduced-range-evaluation.md)
retains `1.00x`. Every experimental adapter, runner, dependency, and
prospective CSP change was removed.

After reviewing the complete-unit FIFO and the exact-host v2 resource results,
the maintainer accepted
[`ADR-0038`](../../architecture/decisions/ADR-0038-reopen-boundary-deferred-playback-evaluation.md).
It authorizes a separate v3 comparison in which the current audible unit keeps
its rate, the newest pending selection applies to the next unit, TTS and queued
PCM continue unchanged, first non-default activation is bounded to 1,000 ms
p95, and additional process RAM is bounded to 200 MiB. Milestone 2C is complete:
the immutable
[`v3 authority`](../../architecture/reader-settings-playback-authority-v3.md),
matching executable constants/tests, and
[`ADR-0039`](../../architecture/decisions/ADR-0039-freeze-boundary-deferred-playback-authority-v3.md)
were committed at `5991165` before candidate implementation or results.
Milestone 2D is complete. Both candidates passed the frozen machine and
listening sequence; [ADR-0040](../../architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md)
selects repository WSOLA for Milestone 5 integration. The selected source adds
no dependency or CSP change. Milestone 5 now connects that backend to product
playback at all six admitted rates. Milestone 6's sequential six-arm packaged
portfolio and repository validation pass locally; final all-rate human
listening confirmation and required pull-request checks remain open.

## Scope and non-goals

### In scope

- Freeze the M010.2 product, interaction, persistence, timing, accessibility,
  and validation authority before production results.
- Freeze comparison and acceptance criteria for a bounded pitch-preserving
  in-memory time-stretch backend.
- Freeze and execute a separate reduced-range v2 comparison without changing
  the completed v1 result.
- Freeze and execute a separate boundary-deferred v3 comparison without
  changing completed v1/v2 evidence.
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

Actual result: Complete with no backend selected. The mandatory pre-install
Signalsmith audit passed
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
advance to packaged WebView2. The first packaged attempt from the managed
automation sandbox failed before application mount with
`webdriver-session-not-created`; that observation is infrastructure-only and
is not candidate evidence. Repeating the same command from a normal local
PowerShell session created the packaged WebView2 session and reached candidate
measurement. That run then stopped before the first candidate result because
the PowerShell CPU counter serialized a decimal with the host locale while
the Node harness required invariant numeric text. The affected WebView2
result was inconclusive until the corrected outside-sandbox rerun. Execution
commit `021c4a9` then passed both candidates in packaged WebView2. Media
measured 0.348 cents maximum pitch deviation, 0.042 ms maximum duration error,
zero frame drift, 14.6 ms start p95, 1,536,044 bytes maximum work, 102.383 MiB
additional RAM, and no measured CPU increase. Incremental WSOLA measured the
same pitch deviation, zero duration error/frame drift, 168.5 ms start p95,
803,840 bytes maximum work, 19.016 MiB additional RAM, and 5.813 CPU
percentage points. Both passed lifecycle/resource gates with one active
stretcher or object URL as applicable, zero external requests, and zero
persisted audio bytes. Chromium results remain unaffected. Both candidates
advanced to the bounded inference-contention arm.

The authoritative clean contention run came from execution commit `a35f63a`
with exactly one local Piper CPU inference process and one sequential playback
candidate. The media candidate retained passing signal and lifecycle results
but failed the frozen machine gate because additional process RAM reached
180.973 MiB, above 128 MiB. Incremental WSOLA failed the signal/lifecycle and
machine gates because start p95 reached 821.6 ms, above 250 ms; it used
24.000 MiB additional RAM and 3.420 CPU percentage points. Both arms made zero
external requests and persisted zero audio bytes.

No candidate passed every frozen machine gate, so the listening gate did not
open. ADR-0037 selects none and retains `1.00x`. The exact Signalsmith
dependency, prospective media CSP, adapters, worklets, listening/contention
runners, and temporary generated speech were removed. Milestones 3-4 remain
independent; Milestone 5 is not applicable unless a future result-blind
authority admits a backend.

#### Status

Complete.

### Milestone 2C: Freeze boundary-deferred v3 authority

#### Work

1. Add a separate immutable architecture/executable authority version; do not
   modify v1, v2, or their committed results.
2. Freeze the six existing rates and the rule that the current unit's active
   rate is immutable while the latest valid pending value applies to the next
   complete queued unit.
3. Freeze speed-only lifecycle behavior: no TTS cancel/restart, identity
   replacement, prepared-text change, PCM regeneration, or queue release.
4. Freeze exactly the media and repository-owned incremental WSOLA candidates.
   Do not include Signalsmith unless its pre-trial initialization failure is
   diagnosed before the authority checkpoint.
5. Freeze a 1,000 ms p95 first non-default activation ceiling, 200 MiB
   additional-process-RAM ceiling under one local inference process, an exact
   smaller recurring-unit handoff ceiling, and zero material time-stretch
   steady-state ownership at `1.00x`.
6. Freeze latest-pending-value behavior, active/selected UI state,
   one-stretcher ownership, no duplicate transformed-audio FIFO, source-frame
   progress, effective-duration arithmetic, pause/resume, invalidation,
   privacy, listening, and cleanup gates.
7. Freeze candidate licence/CSP/distribution rules and strict
   authority-commit/result-commit lineage before implementing or measuring
   either candidate.
8. Add result-blind deterministic tests proving the authority rejects a
   mid-unit activation, a recurring one-second handoff allowance, queue
   invalidation on speed-only change, a retained stretcher at `1.00x`, and
   post-authority gate mutation.
9. Record one freeze ADR and reconcile the roadmap, product requirements,
   system diagram, and this ExecPlan.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd check:portable`
- `git diff --check`

Expected result: a new result-blind v3 authority is committed before candidate
implementation or new measurement, while production remains `1.00x`.

Actual result: Complete. Commit `5991165` adds the separate immutable
architecture and executable v3 authority plus 11 result-blind deterministic
tests before candidate implementation or results. It freezes the six existing
rates; latest-pending/immutable-active state; activation only before the first
unit or between a completed unit and its queued successor; lifecycle-neutral
speed selection; exactly media and a new repository-owned incremental WSOLA;
Signalsmith exclusion; 1,000 ms p95 first activation; 250 ms p95 recurring
handoff; 200 MiB additional process RAM under one Piper process; source-frame
accounting; effective-duration arithmetic; one-stretcher/no-duplicate-FIFO
ownership; zero settled `1.00x` time-stretch ownership; pause/resume,
invalidation, privacy, listening, cleanup, licence/CSP/distribution, and strict
result lineage.

Normal local PowerShell outside the managed sandbox passed
`pnpm.cmd --filter @voxleaf/desktop test` (47 Vitest files/479 tests plus 11
native helper tests), `pnpm.cmd --filter @voxleaf/desktop typecheck`, and
`pnpm.cmd check:portable`. The portable gate passed formatting, ESLint, Ruff,
mypy, TypeScript/Python checks, shared (20 files/209 tests), EPUB (34/580),
desktop (47/479 plus 11 helpers), TTS (347), and portable builds.
`git diff --check` passed. Only the existing content-free pytest cache-write,
CSS Custom Highlight minifier, and bundle-size warnings remained.

#### Status

Complete.

### Milestone 2D: Execute the boundary-deferred v3 comparison

#### Work

1. Reintroduce only the smallest candidate-only media and repository-WSOLA
   adapters needed by the frozen v3 authority.
2. Implement the synthetic active-rate/pending-rate transition so the current
   unit finishes unchanged and the next unit adopts the newest pending value.
3. Start or wake at most one candidate while the current unit continues;
   measure first activation separately from recurring successor-unit handoff.
4. Repeat deterministic Chromium and packaged WebView2 signal, pitch,
   source-frame, lifecycle, CSP, privacy, and cleanup arms outside the managed
   sandbox.
5. Repeat the exact-host local-inference contention arm sequentially with one
   TTS child and one stretcher, measuring first activation, recurring handoff,
   CPU, additional process RAM, work memory, and `1.00x` release.
6. Advance only complete machine passers to repository-authored
   Spanish/English listening at `1.00x`, `0.85x`, and `0.75x`.
7. Select exactly one candidate or none without changing v3 gates after
   results. Retain a dependency or CSP delta only if its candidate wins.
8. Remove every unselected adapter, runner, object URL, generated audio,
   temporary licence material, and dependency; record one durable decision ADR.
9. Update Milestones 3, 5, and 6 with the actual selected or fixed-speed path.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `pnpm.cmd check`
- `git diff --check`

Expected result: one fee-free pitch-preserving backend passes every frozen v3
gate and reaches listening, or VoxLeaf again retains `1.00x` without weakening
the authority.

Actual result: Both candidates passed every frozen Chromium, packaged
WebView2, exact Piper-contention, lifecycle, cleanup, privacy, and bilingual
listening gate. Repository WSOLA was selected because it had the stronger
listening result and much smaller contention footprint. Its exact contention
result was `605.4 ms` p95 first activation, `10.1 ms` p95 recurring handoff,
`24.715 MiB` additional process RAM, and `3.077` CPU percentage points. Its
maximum pitch deviation was `0.243` cents, work memory was `806,528` bytes,
duration error/source-frame drift were zero, and listening minima were
`5/5` intelligibility, `4/5` naturalness, and `5/5` artifacts with no
omitted/repeated words. The unselected media candidate, prospective CSP,
candidate probes/runners, evaluator, and generated WAVs were removed. The
aggregate content-safe result is
[`boundary-deferred-v3-result.json`](../../../benchmarks/playback/boundary-deferred-v3-result.json);
ADR-0040 records the durable selection. Production remains `1.00x` pending
Milestone 5.

#### Status

Complete.

### Milestone 3: Implement bounded settings preferences and English fallback

#### Work

1. Amend/version bilingual product authority for English fallback.
2. Change the application fallback to English for missing/invalid/unavailable
   language state and explicit reset only.
3. Preserve every valid saved Spanish or English preference.
4. Add one versioned narration-start preference repository with closed values,
   limits, migrations, and unavailable-store behavior. Do not create the
   playback-rate preference or selector in this milestone; Milestone 5 owns
   that state with the exact ADR-0040-selected backend.
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

Actual result: Complete. Additive
[`bilingual narration authority v2`](../../architecture/bilingual-narration-authority-v2.md)
preserves the hashed v1 evidence while making English the runtime fallback for
missing, malformed, over-limit, unavailable, future, otherwise invalid, and
explicit-reset state. Language preference v2 keeps the existing storage key,
accepts exact valid v1/v2 Spanish or English envelopes, writes only the exact
two-field v2 envelope, enforces 256 UTF-8 bytes, and preserves future versions
from overwrite.

The new narration-start v1 repository stores only Quick or Prepared plus the
closed 1-, 2-, 5-, or 10-minute target in an exact three-field, 256-byte
envelope. Missing/invalid/unavailable state defaults to Quick without a write;
future state is preserved. The product coordinator hydrates this state before
start controls become actionable and never starts a model during hydration.
Language/profile controls likewise remain disabled during compatibility
hydration. Explicit reset uses the same configuration-stop path as direct
selection before writing English/Quick, recomputing the profile, and requiring
a new Play action. Applicable profile filtering is unchanged and both Qwen
choices now carry an explicit Development label. Volume remains session-only,
reader appearance retains its existing repository, and no playback-rate
preference or selector was added.

Normal local PowerShell outside the sandbox passed the desktop suite (49
Vitest files/499 tests plus 11 native helpers), desktop type checking, all six
Playwright cases, the release-packaged WebView2 native-startup smoke, and
`pnpm.cmd check:portable`. The portable gate passed formatting, TypeScript/
Python lint and types, 20 shared files/209 tests, 34 EPUB files/580 tests, the
desktop suite, 347 Python tests, and all portable builds. `git diff --check`,
relative-link, privacy, and prohibited-artifact checks also pass. The first
browser and packaged attempts correctly exposed stale Spanish/schema-v1 test
expectations; their unchanged reruns passed after the harnesses were updated
to assert English first-run, schema-v2 retention, and reset behavior.

#### Status

Complete.

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

Actual result: Implemented in checkpoint `486f01d`. The ready application now
keeps Open/Replace, concise compatibility, Settings, and Close EPUB in one
fixed app bar. Publication metadata, compact narration, chapter controls, and
contents controls stay outside the sole publication scroll viewport. Settings
uses the frozen Reading, Appearance, Narration, Device compatibility, and About
order; it reuses the existing bounded preference, compatibility, profile,
language, startup, and reset owners. Wide windows use a right drawer, narrow
windows use a full-width modal sheet, and focus containment, Escape dismissal,
focus restoration, forced-colors, reduced-motion, and 320 px layout are
covered. The contents navigation is a bounded overlay and cannot become
locator authority. The synthetic raster probe is development-only.

Opening and closing Settings is lifecycle-neutral in deterministic tests: it
does not recheck hardware, start/stop/replace narration, change work identity,
write a preference, or move the reader locator. Host validation passes 50
desktop files/503 tests plus 11 native helpers, TypeScript typecheck, all six
Chromium smoke cases, and the packaged Tauri/WebView2 startup, narrow keyboard,
synchronization, restart/restoration, privacy, cleanup, and zero-external-
request matrix. The existing CSS Highlight and Vite chunk-size notices remain
advisory. The complete portable gate also passes: formatting, TypeScript and
Python lint/type checks, 20 shared files/209 tests, 34 EPUB files/580 tests, 50
desktop files/503 tests plus 11 native helpers, 347 Python tests, generated
contract verification, and portable web/Python builds. Pytest reported one
non-failing cache-write warning; no product artifact or test result was lost.

#### Status

Complete.

### Milestone 5: Close non-default speed integration

#### Work

1. Integrate only the exact
   `repository-incremental-audio-worklet-wsola-boundary-v3` implementation
   selected by ADR-0040. Do not reintroduce the media candidate, object-URL
   path, prospective CSP expansion, or any dependency.
2. Represent selected, pending, and active playback rates separately. Keep the
   active unit immutable and apply the newest pending value before the next
   complete queued unit starts.
3. Initialize or wake one stretcher during the remaining current unit, reuse it
   across successor units, and bypass/release it after the final slowed unit
   settles at `1.00x`.
4. Preserve TTS execution, generation identity, prepared narration, queued
   source PCM, queue limits, source-frame progress, transition pauses, and
   invalidation behavior across a speed-only change.
5. Add the bounded versioned playback-rate preference and compact selector only
   when a v3 backend is admitted.
6. Implement effective-listening-duration startup, low-water, underrun, and UI
   calculations without changing source-frame/byte memory ceilings.
7. Retain the v1/v2 authorities and ADR-0034/ADR-0037 as historical evidence.

#### Validation

- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `git diff --check`

Expected result: the selected v3 backend and six-value boundary-deferred
behavior are integrated without TTS restart or queued-audio loss.

Actual result: Implementation checkpoint `c70e3fa` connects only the selected
repository WSOLA v3 source to the existing Web Audio player. The scheduler and
player now retain separate selected, pending, and active integer-percentage
rates; keep the current unit immutable; apply the newest pending rate before
the successor starts; prepare and reuse one worklet; and release it after the
last slowed unit settles at `1.00x`. Speed-only changes preserve the active TTS
session, generation identity, prepared text, queued source PCM, source-frame
progress, transition timers, and existing source resource ceilings.

A separate schema-v1 playback preference accepts exactly `100`, `95`, `90`,
`85`, `80`, and `75`, fails safely to `100`, preserves unknown future state,
and stores no content or identity. The compact narration bar exposes the six
values and distinguishes selected, pending, and active state. Startup, refill,
low-water, and loaded-duration presentation use exact effective listening
duration; source frames/bytes continue to govern memory and audible progress.
No dependency, media/object-URL path, CSP change, model input, generated-audio
persistence, or external request was added. Deterministic desktop and browser
coverage proves the boundary transition, latest-selection behavior, TTS/queue
preservation, worklet reuse/release, exact rate options, and persisted envelope.

#### Status

Complete.

### Milestone 6: Validate the portfolio reader and close the plan

#### Work

1. Run repository-authored Spanish and English EPUB journeys across applicable
   Piper, Chatterbox, and gated Qwen profile presentation without running two
   model children simultaneously.
2. Validate Settings before/after open; first-run English; preserved Spanish;
   profile/language replacement; quick/prepared restoration; admitted speed
   presentation or truthful fixed-speed fallback; and development-only
   visibility.
3. Run exact-host listening journeys for `1.00x` and every admitted
   non-default rate, including boundary-deferred activation, latest-selection
   wins, pitch, intelligibility, start, progress, highlight, leaf navigation,
   pause/resume, buffering, stop, recovery, book replacement, and exit.
4. Measure content-free CPU/RAM impact, playable/effective lead, underruns,
   progress drift, cancellation latency, cleanup, and retained source
   frames/bytes/units under the existing source-duration authority.
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
admitted boundary-deferred speed range—or truthful fixed `1.00x` fallback—pass
deterministic, browser, packaged, exact-host, privacy, bounded-resource, and
required pull-request validation.

Actual result: The normal-local-PowerShell packaged portfolio command passed
all six sequential arms on 2026-07-31. Piper Spanish and English exercised
`1.00x`, `0.95x`, `0.90x`, `0.85x`, `0.80x`, and `0.75x`; newest-pending
selection won, first non-default activation measured 750/300 ms, and recurring
backend handoff overhead measured 0 ms p95 after excluding the existing 300 ms
semantic transition pause. Both Piper arms sustained the one-minute quick
observation without underruns and measured warm prepared RTF 0.07. Chatterbox
Spanish/English sustained it at RTF 0.83/0.85. Qwen Serena/Aiden truthfully
observed one underrun and bounded refill at RTF 2.12/2.04, preserving their
development-only constrained-buffer status. Every arm passed highlighting,
focus-safe following, leaf/chapter navigation, pause/resume, identity-first
replacement, prepared playback, cancellation, final cleanup, zero external
requests, and zero generated-audio files. Peak observed dedicated VRAM was
3,734 MiB for Chatterbox and 5,090 MiB for Qwen; Piper used zero dedicated
VRAM. The complete browser, native-startup, portable, and Windows repository
commands also pass outside the sandbox. ADR-0040 already contains fluent
Spanish/English listening at `1.00x`, `0.85x`, and `0.75x`; explicit human
portfolio confirmation at the remaining admitted rates and required PR checks
are still pending, so the plan is not archived yet.

The maintainer's subsequent product listening found that non-default values
sped playback up instead of slowing it. The portfolio matrix had proved
selection, boundary activation, and handoff timing but did not measure the
product's audible output duration. Root cause was a product-only clock
mismatch: 24,000 Hz protocol PCM and WSOLA window/hop constants were emitted
through the device-default 48,000 Hz `AudioContext`. The player now requests
the authoritative 24,000 Hz context explicitly. A regression fails when the
default factory omits that option; the correction adds no PCM copy, second
queue, dependency, CSP change, or model work. Focused playback tests, desktop
type checking, 51 files/518 desktop tests plus 12 native helpers, all six
Chromium journeys, packaged WebView2 startup, and the complete portable gate
pass outside the sandbox. The complete Windows gate also passes 209 shared,
580 EPUB, 518 desktop, 347 Python, and 41 Rust tests plus 12 native helpers and
all release builds. Renewed human rate-direction confirmation remains required
before closeout.

#### Status

Local automated validation complete; human all-rate confirmation and required
pull-request checks pending.

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

Milestone 2B did not open exact-host listening because no candidate passed its
machine gates. Milestone 2D subsequently selected repository WSOLA under its
separate authority. Milestone 6 uses repository-authored synthetic Spanish
and English text to validate the engine-neutral six-rate presentation, exercise
all six rates on the two supported Piper profiles, and run Chatterbox plus
development-only Qwen without changing their synthesis paths. Record only
content-free engine/profile ID, timing, drift, underrun, CPU/RAM,
cancellation, and cleanup observations. Do not retain waveforms, EPUBs,
prepared text, screenshots containing private books, raw host identity, model
paths, or process arguments.

Qwen remains optional development-only and does not need a support-state
reevaluation. The plan validates engine-neutral post-synthesis playback
without claiming that Qwen becomes real-time.

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
- **2026-07-30:** The first packaged v2 attempt inside the managed automation
  sandbox failed at WebDriver session creation before the application or any
  candidate ran. The same exact command from a normal local PowerShell session
  built the release executable, created the isolated packaged WebView2
  session, mounted the application, and reached the first candidate baseline.
  It then failed while parsing a locale-formatted PowerShell CPU total. The
  sandbox attempt is therefore recorded as inconclusive infrastructure
  evidence, not a candidate failure. The CPU query now emits invariant-culture
  numeric text; only the affected packaged WebView2 arm will be repeated.
  No Chromium, TTS, model, privacy, or listening result is invalidated.
- **2026-07-30:** Repeated only the affected packaged arm outside the sandbox
  from locale-safe execution commit `021c4a9`. Both Chromium passers also
  passed packaged Windows WebView2. Media measured 0.348 cents maximum pitch
  deviation, 0.042 ms maximum duration error, zero source-frame drift,
  14.6 ms start p95, 1,536,044 bytes maximum work, 102.383 MiB additional RAM,
  and no measured CPU increase. Incremental WSOLA measured 0.348 cents maximum
  pitch deviation, zero duration error/frame drift, 168.5 ms start p95,
  803,840 bytes maximum work, 19.016 MiB additional RAM, and 5.813 CPU
  percentage points. Both retained bounded lifecycle cleanup, made zero
  external requests, and persisted zero audio bytes. This closes the
  previously inconclusive WebView2 result without rerunning or changing the
  unaffected Chromium authority.
- **2026-07-30:** Added the bounded post-machine harnesses required before a
  selection. The contention runner keeps exactly one local Piper CPU inference
  process active with repository-authored v7 text while the two candidates run
  sequentially in packaged WebView2; synthesized bytes are discarded rather
  than written. This is the conservative supported CPU-profile contention arm
  and cannot create a second TTS tree or a second active stretcher. The
  listening runner generates only the four frozen Spanish/English speech
  inputs under an ignored temporary directory, blocks non-loopback browser
  requests, presents both candidates at `1.00x`, `0.85x`, and `0.75x`, accepts
  one fluent-maintainer scorecard, retains only content-free scores, and
  removes every temporary WAV and manifest when the session ends. These
  runners are candidate evaluation code and will be removed after selection.
- **2026-07-30:** The first contention execution completed both candidates,
  but an unreferenced safety-timeout defect kept the already-finished Node
  coordinator alive and made the command appear stalled. Process inspection
  proved Piper and WebView2 had closed before the coordinator was terminated;
  no child remained. Its recovered log is exploratory only because the timer
  correction was not yet committed. It indicated a media RAM failure and a
  repository-WSOLA start-latency failure under one active Piper process. The
  timeout now uses a non-retaining timer, and the result wording distinguishes
  matrix completion from candidate admission. A clean-commit repetition owns
  the authoritative contention result.
- **2026-07-30:** Repeated the complete contention arm from clean execution
  commit `a35f63a`. The process exited naturally and left no Piper, WebView2,
  Tauri driver, or release VoxLeaf process. Media failed only the frozen
  machine gate at 180.973 MiB additional RAM against 128 MiB. Incremental
  WSOLA failed at 821.6 ms start p95 against 250 ms while remaining within RAM
  and CPU limits. Both persisted zero audio bytes and made zero external
  requests. Because neither passed, the listening gate did not open.
- **2026-07-30:** ADR-0037 selected no backend and retained `1.00x`. Removed
  Signalsmith, the prospective media CSP, candidate adapters/worklets,
  evaluation globals/configuration, and every temporary runner. No generated
  speech or evaluation artifact remains. Milestones 3-4 may proceed
  independently; Milestone 5 is closed as not applicable under this
  authority.
- **2026-07-30:** After closeout, repeated the exact historical
  Signalsmith-only Chromium runner from `f2e5fed` in normal local PowerShell.
  It reproduced the same pre-trial failure outside the sandbox after the
  15-second initialization boundary, with no signal/timing result and
  85.160 MiB additional process RAM. A temporary diagnostic surfaced only the
  content-safe probe error, so future work must diagnose adapter
  initialization before reevaluation. The temporary detached worktree and all
  generated artifacts were removed.
- **2026-07-30:** Closed Milestone 2B validation. Desktop type checking,
  46 files/468 Vitest tests, and 11 native helper tests pass. The unchanged
  `pnpm.cmd test:browser` command passes all six Chromium cases and exits in
  12.5 seconds from normal local PowerShell; its managed-sandbox run displayed
  all passes but retained the Playwright/Vite coordinator until timeout, now
  documented as infrastructure-only. The outside-sandbox packaged WebView2
  startup smoke passes. `pnpm.cmd check:portable` passes 20 shared files/209
  tests, 34 EPUB files/580 tests, 46 desktop files/468 tests plus 11 helpers,
  347 Python tests, and all portable builds. Full `pnpm.cmd check` additionally
  passes Rust formatting/clippy, 41 Rust tests, and release/package builds.
  `git diff --check` passes; all 366 relative links across 13 changed Markdown
  files resolve. The 30-file final change has zero private-pattern findings
  and zero prohibited book/audio/model artifact paths, and no repository test
  process remains. The runs retain only the existing content-free pytest
  cache-write and Vite highlight/chunk-size warnings.
- **2026-07-30:** Reviewed the implemented playback owner after v2 closeout.
  It retains complete source-PCM units in one bounded FIFO, exposes one current
  playback unit, releases that unit only after its source frames are consumed,
  and starts the successor separately. ADR-0038 therefore reopens a distinct
  v3 evaluation with boundary-deferred rate activation: the current unit keeps
  its rate, the newest pending rate applies to the next unit, TTS and queued
  PCM continue unchanged, first activation is bounded to 1,000 ms p95, and
  additional process RAM is bounded to 200 MiB. Historical v1/v2 results are
  unchanged. Milestone 2C is now next.
- **2026-07-30:** Reconciled the product requirements, roadmap, architecture
  overview/system diagram, setup guidance, documentation indexes, ADR-0037,
  and this ExecPlan with ADR-0038. Outside-sandbox `git diff --check` passed;
  all 627 relative Markdown links under `docs/` resolve; and the changed
  documentation has zero private-path, private-key, GitHub-token, or API-key
  pattern findings. No runtime code, dependency, CSP, persisted preference, or
  playback behavior changed.
- **2026-07-30:** Completed Milestone 2C. Commit `5991165` freezes
  [`reader-settings-playback-authority-v3.md`](../../architecture/reader-settings-playback-authority-v3.md),
  matching executable constants and 11 result-blind tests, and
  [`ADR-0039`](../../architecture/decisions/ADR-0039-freeze-boundary-deferred-playback-authority-v3.md)
  before candidate implementation or results. V3 retains the six rates,
  permits 1,000 ms p95 only for first non-default activation, fixes recurring
  successor handoff at 250 ms p95, permits 200 MiB additional process RAM under
  one Piper process, compares exactly media and a new repository WSOLA, and
  excludes undiagnosed Signalsmith. The complete desktop, typecheck, portable,
  and whitespace gates passed in normal local PowerShell. Production remains
  `1.00x`; Milestone 2D is next.
- **2026-07-31:** Created
  `feat/m010-002-execute-boundary-v3-comparison` from merged authority commit
  `4132229`. Result-blind commit `84f4c75` added only the media and new
  repository-WSOLA v3 probes, selected/pending/active boundary transition,
  Chromium/packaged/contention runners, exact candidate-only media CSP, and
  deterministic coverage. `e605271` isolated the worklet module from the host
  loader, `d2b2471` exposed content-free packaged privacy counters, and
  `c7c39b7` closed deliberately stopped terminal waits without changing either
  candidate or a frozen gate.
- **2026-07-31:** The official normal-PowerShell Chromium, packaged WebView2,
  and one-Piper contention matrices passed for both candidates. The final
  Chromium execution at `757b956` measured media at `939.9 ms` first
  activation, `2.7 ms` recurring handoff, `145.875 MiB` additional RAM, and
  `1.584` CPU points; WSOLA measured `71 ms`, `10 ms`, `18.637 MiB`, and
  `2.487` points. Packaged WebView2 reported zero external requests,
  generated-audio files, runtime errors, and severe browser logs. Under exact
  Piper contention, media remained inside the new limit at `189.367 MiB`;
  WSOLA measured `605.4 ms` first activation, `10.1 ms` recurring handoff,
  `24.715 MiB` additional RAM, and `3.077` CPU points. Both passed.
- **2026-07-31:** Commit `757b956` opened the candidate-neutral offline
  listening gate with four repository-authored Piper cases. One fluent
  maintainer for each language scored both candidates at `1.00x`, `0.85x`,
  and `0.75x`. Media passed with minimum `4/3/3` and average
  `4.5/3.5/4.25`; repository WSOLA passed with minimum `5/4/5` and average
  `5/4/5`. Neither omitted or repeated a word. The runner recorded no
  evaluator identity and deleted every generated WAV and manifest on exit.
- **2026-07-31:** ADR-0040 selects repository WSOLA. The final tree retains
  only the selected controller/worklet and content-safe aggregate result.
  The media path, prospective CSP, candidate probes, desktop globals, browser/
  packaged/contention/listening runners, and temporary audio are removed.
  Production remains `1.00x`; Milestone 5 owns the six-rate product
  integration after Milestones 3-4.
- **2026-07-31:** Closed Milestone 2D validation in normal local PowerShell.
  The focused desktop suite passes 48 files/481 tests plus 11 native helper
  tests; all six browser cases and the packaged WebView2 native-startup smoke
  pass. `pnpm.cmd check:portable` passes formatting, linting, generated-contract
  verification, TypeScript/Python types, 20 shared files/209 tests, 34 EPUB
  files/580 tests, 48 desktop files/481 tests plus 11 helpers, 347 Python
  tests, and all portable builds. Full `pnpm.cmd check` additionally passes
  Rust formatting/clippy, 41 Rust tests, the release Tauri build, and Python
  package builds. All 655 relative links across 109 documents resolve; the
  18-path branch diff has zero private-pattern findings and zero prohibited
  book/audio/model/secret/log artifact paths; and `git diff --check` passes.
  Only the existing content-free pytest cache-write, CSS Highlight, and Vite
  chunk-size advisories remain.
- **2026-07-31:** Completed Milestone 3 on
  `feat/m010-002-bounded-settings-english-fallback`. Implementation checkpoint
  `ef46ff3` adds language preference v2, narration-start preference v1,
  pre-action hydration, language-specific filtering, explicit Development
  labels, and identity-first English/Quick reset. Deterministic, browser,
  packaged WebView2, portable, link, privacy, artifact, and whitespace checks
  pass from normal local PowerShell. No model, protocol, dependency, CSP,
  audio persistence, reader-appearance owner, playback-rate preference, or
  non-`1.00x` behavior changed.
- **2026-07-31:** Completed Milestone 4 on
  `feat/m010-002-reader-first-settings-shell`. Checkpoint `486f01d` implements
  the fixed reader-first app bar, compact publication/narration chrome, sole
  reader viewport, five-section Settings drawer/sheet, lifecycle-neutral focus
  contract, collapsible contents overlay, development-only raster probe, and
  bar-only disabled `1.00x` speed presentation pending Milestone 5. It moves
  presentation without duplicating reader reflow, compatibility, preference,
  or narration ownership.
- **2026-07-31:** Normal local PowerShell validation passes 50 desktop files/
  503 tests plus 11 native helpers, desktop TypeScript typecheck, all six
  production-Chromium smoke cases, and the packaged Tauri/WebView2 native
  lifecycle matrix. The first browser rerun exposed stale inline-control/TOC
  assumptions plus a genuine short-window reader-space regression; the final
  layout preserves a usable reading line at 800x400 and all unchanged geometry,
  focus, privacy, and synchronization assertions pass. The first native rerun
  reached final cleanup before an obsolete physical-click path failed; the
  unchanged final lifecycle assertion passes through the existing bounded DOM
  cleanup helper.
- **2026-07-31:** The first complete portable run exposed one React lint error:
  restored preferences were copied into presentation state synchronously from
  an effect. Checkpoint `c48faef` moves that reconciliation into the bounded
  asynchronous restore completion, rejects a stale completion through the
  existing active token, and preserves the same preference/restoration result.
  The unchanged complete portable gate, six Chromium cases, and packaged
  Tauri/WebView2 matrix then pass outside the sandbox.
- **2026-07-31:** Completed Milestone 5 on
  `feat/m010-002-non-default-speed-integration`. Implementation checkpoint
  `c70e3fa` adds the bounded playback preference, exact effective-lead
  scheduling, selected/pending/active boundary state, one reusable repository
  WSOLA worklet, compact six-rate selector, and identity/queue-preserving
  coordinator integration. The default `1.00x` path remains direct Web Audio;
  non-default processing owns no second FIFO and is released after the final
  slowed unit settles back to default.
- **2026-07-31:** Closed Milestone 5 validation in normal local PowerShell.
  The focused desktop suite passes 51 files/517 tests plus 11 native helpers;
  desktop TypeScript passes; all six production-Chromium journeys pass,
  including the exact selector and content-free `0.75x` persistence envelope;
  and the release Tauri/WebView2 lifecycle matrix passes with zero external
  requests. `pnpm.cmd check:portable` passes formatting, lint, generated-
  contract verification, TypeScript/Python types, 20 shared files/209 tests,
  34 EPUB files/580 tests, the same desktop/Python suites, and portable builds.
  `git diff --check` passes. The run retains only the existing non-failing
  pytest cache-write, CSS Highlight parser, and Vite chunk-size advisories.
- **2026-07-31:** Extended the existing packaged bilingual portfolio harness
  for Milestone 6. The frozen matrix remains six sequential model arms and now
  exercises all six production playback rates on Piper Spanish and English.
  The native journey verifies exact options, first activation, latest-pending
  selection, boundary-deferred application, return to direct `1.00x`, and
  content-free transition metrics without adding a second model process.
- **2026-07-31:** The first full matrix exposed a WebView2/WebDriver interaction
  race after active cancellation: the already-covered prepared checkpoint
  leaf did not receive a repeated off-screen Space key. The focused arm passed
  unchanged. Checkpoint `5206d4c` retains the earlier exact-host keyboard leaf
  proof and uses native WebDriver click for the later prepared-lifecycle
  repetition. The focused arm and then the complete six-arm matrix pass.
- **2026-07-31:** Closed Milestone 6 local automated validation in normal
  PowerShell. `pnpm.cmd test:tts:bilingual-portfolio-exact-host` passes Piper
  Spanish/English, Chatterbox Spanish/English, and Qwen Serena/Aiden in order,
  with no overlapping child, external request, persisted audio, stale
  playback, or retained cleanup unit. Piper exercises all six admitted rates;
  first activation is 750/300 ms and recurring backend overhead is 0 ms p95.
  `pnpm.cmd test:browser` passes 6/6, `pnpm.cmd test:native-startup` passes,
  `pnpm.cmd check:portable` passes, and `pnpm.cmd check` passes 209 shared,
  580 EPUB, 517 desktop, 347 Python, 41 Rust, and 12 native-helper tests plus
  all builds. Human confirmation of the intermediate portfolio rates and the
  required pull-request checks remain open.
- **2026-07-31:** Maintainer listening exposed that the integrated non-default
  speeds ran faster, despite correct selected/pending/active state. A new
  regression reproduced the omitted `AudioContext` sample-rate option. The
  product had sent fixed 24,000 Hz PCM through the host-default 48,000 Hz
  render clock, so the worklet output was consumed twice as quickly. The
  default player context now explicitly requests the authoritative 24,000 Hz
  rate; no resampled copy or additional queue is introduced. The regression,
  desktop typecheck, 51 files/518 desktop tests plus 12 native helpers, six
  Chromium journeys, packaged WebView2 startup, portable validation, and the
  complete Windows gate pass in normal local PowerShell. The earlier matrix
  remains valid for state and lifecycle evidence, but human audible-rate
  direction must be repeated.

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
- The managed automation sandbox could not create the packaged WebView2
  session, while the same command in normal local PowerShell did. That
  sandbox observation is infrastructure evidence only; the successful
  outside-sandbox rerun owns both packaged candidate results.
- Every final acceptance command now requires normal local PowerShell outside
  the managed sandbox. Sandbox output is exploratory and inconclusive until
  the unchanged command is repeated outside; it cannot pass or fail a task or
  reject a candidate.
- The outside-sandbox Signalsmith-only rerun reproduced its pre-trial
  initialization failure. Signalsmith was therefore not rejected because of
  WebView2 or sandbox session creation, although its adapter cause still needs
  diagnosis.
- Neither packaged passer remained admissible beside one local Piper process:
  media exceeded the frozen RAM delta and incremental WSOLA exceeded frozen
  start latency. The frozen ordering therefore prohibited a listening screen.
- The maintainer considers 821.6 ms WSOLA activation latency acceptable and
  180.973 MiB media-process growth potentially acceptable when non-default
  speed is opt-in and disabled at `1.00x`. Those observations do not rewrite
  v2; any renewed comparison must freeze activation-scoped latency/resource
  gates in a new authority before results.
- The current player and scheduler make boundary-deferred speed changes
  credible: complete source PCM is queued independently from the one active
  backend handle, and consuming the final source frame releases one unit before
  the successor starts. A speed-only change therefore needs no model restart,
  generation replacement, or queue invalidation.
- V3 uses separate selected, pending, and active values. The active value is
  immutable for one generated unit, the newest pending value wins, and the
  next unit adopts it. This removes mid-unit progress settlement from the
  candidate design.
- The accepted 1,000 ms p95 allowance is only for first non-default
  activation. It is not permission to insert a one-second pause between every
  generated unit. The admitted backend must be initialized while the current
  unit plays and reused for successors.
- V3 fixes ordinary recurring complete-unit handoff at 250 ms p95. The prior
  821.6 ms WSOLA observation was backend first-start latency and therefore fits
  inside the separate 1,000 ms first-activation gate; it is not evidence that a
  reused stretcher needs 821.6 ms between every pair of units. Milestone 2D must
  measure the recurring path independently.
- The accepted memory limit is 200 MiB of additional process RAM under one
  active local-inference process. Source PCM remains under the existing FIFO
  ceiling, and no second pre-stretched audio queue is permitted.
- At `1.00x`, time stretching is bypassed and must release material
  steady-state ownership after the previous slowed unit settles.
- The first packaged v3 rerun surfaced an orphaned completion timeout only
  when the final unit was deliberately stopped before `ended`. Creating an
  `ended` waiter only for units expected to complete removed the severe
  WebView2 log without changing candidate behavior or thresholds.
- Both v3 candidates pass the relaxed first-activation/RAM authority. The v2
  failures therefore reflected the earlier gates, not technical inability.
  V3 does not rewrite those historical results.
- Repository WSOLA is the narrower production candidate: compared with media
  under Piper contention it used about one-eighth the additional RAM, avoided
  object URLs and a CSP expansion, and received the stronger bilingual
  listening result.
- Reader-first at short window heights requires budgeting fixed chrome, not
  merely preventing document scrolling. Compact spacing plus a deliberate
  reading-line inset leaves the sole reader viewport usable at 800x400 without
  moving publication position authority into the app shell.
- Settings controls remain views over their existing owners. Reader appearance
  still enters the reader reflow/locator path; narration language/profile and
  reset still enter compatibility and identity-safe cleanup; opening the modal
  alone invokes none of them.
- The compatibility presentation can be split safely into a concise app-bar
  summary plus Narration and Device compatibility Settings views because all
  three subscribe to one coordinator and do not own host detection.
- Effective lead can be derived without duplicating PCM: each queued unit keeps
  its source duration, the current unit uses its immutable active rate, and
  future units use the latest selected rate. This preserves exact source-memory
  accounting while making startup and refill promises rate-correct.
- Playback preference ownership must remain separate from persisted reading
  position even though the historical shared locator envelope permits a
  positive rate. The new envelope is content-free, versioned, closed to six
  integer percentages, and can preserve unknown future state without changing
  the current session.
- The product exact-host matrix must not repeat an already-proven keyboard
  gesture merely to test a later lifecycle state. WebView2 may acknowledge an
  off-screen Space delivery without changing the control. The same journey
  keeps its earlier keyboard leaf proof and uses native WebDriver click for the
  prepared-mode lifecycle repetition.
- Product contention does not change the selected backend gates: Piper's two
  all-rate arms keep first activation below 1,000 ms and recurring backend
  overhead below 250 ms while preserving the existing semantic pause as a
  separate intentional wall-clock wait.
- State and handoff assertions alone cannot prove audible rate direction. The
  product renderer must share the protocol's 24,000 Hz clock with the
  evaluated WSOLA implementation; a device-default 48,000 Hz context can turn
  mathematically correct slowdown output into audible speedup.

## Final validation results

M010.2 Milestones 1-5 are complete. Milestone 1 validation added 21
result-blind authority tests and passed the complete portable gate. Milestone
2 produced the closed Chromium and packaged WebView2 evidence recorded above,
selected no backend, removed all experimental adapters, and added no
dependency, capability, persisted audio, or external request. Milestone 2A
then committed the separate executable v2 authority before implementation or
results, retaining immutable v1 evidence and current `1.00x` runtime.
Milestone 2B then completed the separate comparison, selected none under
ADR-0037, removed every candidate artifact, and passed deterministic,
Chromium, packaged WebView2, portable, full repository, privacy, and cleanup
validation. Milestone 2C then committed immutable v3 architecture/executable
authority and 11 result-blind tests at `5991165` before candidate
implementation or results. Normal host PowerShell passed all specified
desktop, typecheck, portable, and whitespace gates.

Milestone 2D validation also passes in normal host PowerShell: 48 desktop
files/481 tests plus 11 native helpers, all six browser cases, the packaged
WebView2 native-startup smoke, 347 Python tests, 41 Rust tests, portable and
release builds, and the complete `pnpm.cmd check` gate. All 655 relative links
across 109 documentation files resolve. The 18 changed paths contain no
private-pattern or prohibited artifact finding, and `git diff --check` passes.

Milestone 5 validation passes in normal host PowerShell: 51 desktop files/517
tests plus 11 native helpers, desktop typecheck, all six Chromium cases, the
release Tauri/WebView2 native-startup matrix, 347 Python tests, complete
portable formatting/lint/type/test/build checks, and `git diff --check`. The
browser case persists only the schema version and exact integer rate. No
private text, generated audio, model artifact, dependency, CSP expansion, or
external request is introduced.

Milestone 6 local automated validation also passes in normal host PowerShell.
The sequential packaged portfolio covers Piper Spanish/English, Chatterbox
Spanish/English, and development-only Qwen Serena/Aiden without overlapping
model children. The two Piper arms exercise every admitted rate and preserve
latest-selection, boundary, identity, source-queue, highlight, progress, and
cleanup authority. Chatterbox remains supported; both Qwen arms remain
development-only and truthfully expose
their measured depletion. Every arm reports zero external requests, zero
generated-audio files, zero retained/discarded units after cleanup, and no
stale playback. Browser, native-startup, portable, and complete Windows checks
pass outside the sandbox. ADR-0040 supplies prior bilingual human evidence at
`1.00x`, `0.85x`, and `0.75x`; the remaining intermediate-rate portfolio
listening confirmation and required pull-request checks are not yet complete.
The post-matrix product clock correction also requires renewed audible-rate
direction confirmation because the earlier matrix did not measure rendered
duration. Its regression, desktop, Chromium, packaged startup, portable, and
complete Windows checks pass outside the sandbox.

The full plan remains active. ADR-0035 supplies the reduced-range product
decision, ADR-0036 freezes its v2 authority, and ADR-0037 records the
no-selection result. ADR-0038 authorizes a separate boundary-deferred v3 with
new first-activation and RAM limits. ADR-0039 and authority commit `4132229`
freeze v3 before Milestone 2D implementation or measurement. Milestone 2D
selects repository WSOLA under ADR-0040 after every frozen machine, privacy,
lifecycle, and listening gate passed. The retained selected source adds no
dependency or CSP expansion.
Milestone 3 has implemented and validated preference migration, English
runtime fallback, closed narration-start persistence, pre-action hydration,
and identity-safe reset. Milestone 4 implements the fixed app bar, compact
reader-first shell, accessible five-section Settings drawer/sheet, collapsible
contents overlay, and development-only raster diagnostics while retaining the
existing domain owners and one reader scroll authority. Milestone 5 integrates
the exact selected backend with one bounded worklet, a separate
playback preference, six compact-bar values, immutable-current/latest-pending
activation, and effective-lead scheduling. It changes no TTS/model input,
source queue ceiling, progress authority, transition timer, dependency, CSP,
or persistence boundary. Milestone 6 is locally complete except for those two
closeout gates. Keep this ExecPlan active until both are recorded, then move it
to `completed/` without changing the frozen authority or historical results.
