# M010.2 — Reader settings and pitch-preserving playback controls

## Goal

Reorganize VoxLeaf's implemented reader and narration controls into a
portfolio-ready reader-first shell, make English the safe default for new or
invalid narration-language state without overwriting valid saved choices, and
add engine-neutral pitch-preserving playback speeds from `1.00x` through
`0.50x`.

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
  `0.90x`, `0.85x`, `0.80x`, `0.75x`, `0.70x`, `0.65x`, `0.60x`, `0.55x`,
  and `0.50x`;
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

## Scope and non-goals

### In scope

- Freeze the M010.2 product, interaction, persistence, timing, accessibility,
  and validation authority before production results.
- Freeze comparison and acceptance criteria for a bounded pitch-preserving
  in-memory time-stretch backend.
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

## Relevant files and documentation

### Current product and roadmap authority

- `docs/product/reader-settings-and-playback-controls.md`
- `docs/product/mvp.md`
- `docs/product/project-brief.md`
- `docs/plans/roadmap.md`
- `docs/README.md`
- `docs/plans/active/M010-001-bilingual-narration-and-candidate-screening.md`
  (completed but retained byte-frozen at its authority path)

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

The narration-playback preference admits exactly the eleven approved rates.
No free-form number is accepted.

### Pitch-preserving backend gate

Milestone 1 freezes a backend comparison before implementation. Milestone 2
may select an `AudioWorklet` time-domain time stretcher, another bounded
in-memory browser mechanism, or a reviewed production dependency only when it
passes all frozen gates:

- pitch and intelligibility at `0.75x`, `0.60x`, and `0.50x`;
- deterministic source-frame progress and mid-unit rate change;
- bounded active-unit and work-buffer memory;
- prompt pause, stop, seek, invalidation, and teardown;
- no generated-audio persistence;
- Windows WebView2 support;
- acceptable CPU/RAM impact while local inference runs;
- no network or wider native capability;
- dependency purpose and alternatives documented; and
- license and M011 distribution obligations unambiguous.

If no mechanism passes, fail closed to implemented `1.00x`, record M010.2 as
blocked or reduced only through an explicit maintainer decision, and do not
enable pitch-shifting playback as a substitute.

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

The frozen authority must specify integer/rational arithmetic for all eleven
rates so scheduling does not depend on floating-point drift. Exact threshold
and one-source-frame-before cases are required.

The simultaneous 43,200,000-source-frame, 172,800,000-byte, 256-unit, and
metadata ceilings do not increase. Slower playback extends listening time but
does not authorize additional retained source audio.

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

Actual result: Not run.

#### Status

Not started.

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

Actual result: Not run.

#### Status

Not started.

### Milestone 3: Implement bounded settings preferences and English fallback

#### Work

1. Amend/version bilingual product authority for English fallback.
2. Change the application fallback to English for missing/invalid/unavailable
   language state and explicit reset only.
3. Preserve every valid saved Spanish or English preference.
4. Add separate versioned narration-start and narration-playback preference
   repositories with closed values, limits, migrations, and unavailable-store
   behavior.
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

Actual result: Not run.

#### Status

Not started.

### Milestone 6: Validate the portfolio reader and close the plan

#### Work

1. Run repository-authored Spanish and English EPUB journeys across applicable
   Piper, Chatterbox, and gated Qwen profile presentation without running two
   model children simultaneously.
2. Validate Settings before/after open; first-run English; preserved Spanish;
   profile/language replacement; quick/prepared restoration; speed
   restoration; and development-only visibility.
3. Run `1.00x`, `0.75x`, `0.60x`, and `0.50x` exact-host listening journeys
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

Actual result: Not run.

#### Status

Not started.

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
  authority and the completed M010.1 ExecPlan byte-for-byte, retained the
  plan at its frozen active path, and documented current completion only in
  non-frozen indexes, roadmap, product, and architecture status surfaces. All
  347 Python tests then passed.

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
- Quick/Prepared startup and target should become a separate bounded
  narration-start preference. Volume remains session-only.
- The ignored concept images remain discussion artifacts and are not
  committed as implementation evidence.
- The v8-v12 benchmark chain hashes historical bilingual authority, and the
  completed M010.1 plan is retained at its frozen active path. Neither may be
  rewritten or moved merely to refresh status text.

## Final validation results

M010.2 implementation validation has not run because implementation has not
started. The documentation/plan-creation checkpoint passes
`pnpm.cmd check:portable`, changed-file relative-link validation, and
`git diff --check`. No M010.2 runtime or product-support claim exists yet.
