# Reader settings and playback controls

## Status

Approved product direction for roadmap Milestone 10.2. Milestone 1 froze
the exact
[`reader settings and playback authority v1`](../architecture/reader-settings-playback-authority-v1.md)
and [ADR-0033](../architecture/decisions/ADR-0033-freeze-reader-settings-and-pitch-preserving-playback-authority.md)
before production results. Milestone 2 then selected no pitch-preserving
backend: WSOLA exceeded the frozen CPU gate and packaged WebView2 rejected the
media-element path under the unchanged CSP. [ADR-0034](../architecture/decisions/ADR-0034-retain-fixed-speed-after-playback-backend-evaluation.md)
therefore retains `1.00x`.

The maintainer subsequently approved a separate reduced-range, fee-free v2
evaluation through
[ADR-0035](../architecture/decisions/ADR-0035-reopen-reduced-range-fee-free-playback-evaluation.md).
That decision does not rewrite the v1 result. Milestone 2A froze the separate
[v2 authority](../architecture/reader-settings-playback-authority-v2.md) and
[ADR-0036](../architecture/decisions/ADR-0036-freeze-reduced-range-fee-free-playback-authority-v2.md)
before candidate implementation or measurement. Milestone 2B then selected no
backend: the media path exceeded the frozen contention RAM limit and
incremental WSOLA exceeded frozen contention start latency. Signalsmith failed
before its first Chromium trial. [ADR-0037](../architecture/decisions/ADR-0037-retain-fixed-speed-after-reduced-range-evaluation.md)
retains `1.00x` and removes every experimental dependency, adapter, runner, and
prospective CSP change.

ADR-0038 subsequently authorized a separate boundary-deferred v3 without
rewriting either result. Milestone 2C froze the immutable
[v3 authority](../architecture/reader-settings-playback-authority-v3.md) and
[ADR-0039](../architecture/decisions/ADR-0039-freeze-boundary-deferred-playback-authority-v3.md)
before candidate implementation or measurement. It fixes exactly media and a
new repository WSOLA candidate, a 1,000 ms p95 first activation, a smaller
250 ms p95 recurring handoff, 200 MiB additional process RAM, lifecycle-neutral
speed selection, and zero material time-stretch ownership after settled
`1.00x`.

Milestone 2D executed that authority without changing its gates.
[ADR-0040](../architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md)
selects the repository-owned incremental WSOLA v3 backend after both
candidates passed the complete machine and listening sequence. WSOLA had the
smaller contention footprint and stronger listening result, requires no
dependency or CSP expansion, and Milestone 5 now integrates that exact source.

Milestone 3 now implements the English-fallback and bounded narration-
preference subset under
[`bilingual-narration-authority-v2`](../architecture/bilingual-narration-authority-v2.md).
Valid saved Spanish or English survives upgrade; missing, invalid, unavailable,
over-limit, future-version, or explicitly reset state uses English. Quick or
Prepared mode and its closed Prepared target are now separately persisted and
hydrated before their controls become actionable. Reset first uses the same
identity-safe stop/cleanup path as direct language/profile selection. Volume
remains session-only and reader appearance keeps its existing owner.

Milestone 4 now implements the reader-first presentation subset. The ready
application has one fixed compact app bar, compact publication and narration
chrome, one publication scroll viewport, a collapsible contents overlay, and
an accessible five-section Settings drawer/sheet. Reader appearance,
language/profile, Quick/Prepared startup, compatibility detail, recheck, and
reset are presented in Settings while retaining their existing domain owners.
Opening or closing Settings is lifecycle-neutral, and the synthetic raster
probe is development-only.

Milestone 5 implements the six-value compact playback selector, a separate
bounded content-free playback-preference envelope, selected/pending/active
boundary state, effective-listening-duration scheduling, and the exact
repository WSOLA backend. A speed-only change keeps the active unit immutable,
preserves TTS and queued source PCM, and applies the newest selection when the
next complete unit starts. Source frames and bytes remain the memory and
progress authority; returning to `1.00x` releases the stretcher after the final
slowed unit settles.

The local automated portfolio validation in this document passes and
[`M010-002-reader-settings-and-playback-controls.md`](../plans/completed/M010-002-reader-settings-and-playback-controls.md)
records the exact results. Current runtime behavior
includes the Milestone 3 preference behavior, Milestone 4 reader/Settings
shell, and Milestone 5 non-default playback integration. Milestone 6's six-arm
exact-host resource, lifecycle, privacy, and repository matrices pass. The
maintainer confirms the full admitted rate range, and pull request #170 passes
the required Ubuntu and Windows checks.

This document replaces the ignored pre-M011 design discussion as the durable
product scope. It does not change the completed M005 narration-preparation
boundary, protocol v1, TTS model input, generated audio, support decisions, or
release-distribution status.

## Implemented M011 lifecycle-feedback addendum

M011 Milestone 6A additively closes release-facing gaps discovered after the
completed M010.2 Settings shell reached the installed Chatterbox validation
journey. Focused desktop regressions and the packaged development-host lifecycle
matrix now cover this behavior. That implementation is not evidence that the
optional package is ready for end users: 6A itself did not reopen the M010.2
reader layout, playback-rate authority, TTS protocol v1, one-child ownership,
hardware gates, or the then-withheld Chatterbox release state. M011 Milestone
6B later enables ordinary acquisition behind those unchanged live gates.

### Stable Settings transitions

A language/profile change may temporarily disable affected controls, but it
must keep the Settings structure, current values, and relevant optional-package
management visible. An accessible polite status names only a phase the desktop
can prove, such as stopping narration, checking installed package state, or
applying the profile. Non-byte work uses an indeterminate treatment; a
percentage or fixed completion estimate must not be invented.

The first M011 closeout does not add a profile-selection Cancel action. By the
time a selection is pending, narration identity may already be invalidated and
the persisted preference or recovery state may be changing. Cancellation is
eligible only after a separate rollback contract proves restoration of the
prior profile, preference, identities, service ownership, and recovery episode.
A failed selection instead leaves a stable actionable error and the safest
valid profile state.

### First-Play startup feedback

The compact narration bar remains mounted from Play intent through audible
output and exposes the most specific content-free phase available at the
existing boundaries: installed-package verification, starting and loading the
local service/model, narration preparation, first-audio generation, buffering,
then playing. If service start and model load cannot be distinguished without a
protocol change, the UI combines them truthfully rather than inferring a false
subphase. Cold-load variability is not presented as a fixed timer or progress
percentage.

While no audio owns playback and the existing identity-first Stop path can
safely contain the pending start, its user-facing action is **Cancel start** (or
equivalent). Cancellation makes the pending work stale before teardown,
terminates or contains the supervised child as applicable, releases retained
audio/work, and cannot emit stale audio. Once playback begins, the action
returns to **Stop**.

### Optional-package management and uninstall

Chatterbox package state is distinct from profile selection. When application-
owned optional-package data exists, Settings exposes installed state, measured
storage, active/inactive status, and a discoverable **Remove Chatterbox** action.
Removal affects only the exact optional runtime, model, removable cache, and
staging roots after contained service cleanup; it does not delete preferences,
reading progress, Piper, the desktop application, or EPUBs.

Download cancellation states before confirmation that it deletes the current
operation's incomplete staging and partial files, retains no resumable partial
state, and never removes a verified installed package. Determinate progress is
reserved for bounded byte transfer; verification and removal use truthful
indeterminate phase text.

The Windows uninstall journey presents optional-package data separately from
ordinary preferences/recovery state.
[ADR-0047](../architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md)
selects optional Chatterbox removal by default and preference/recovery retention
by default; the UI explains the consequence of each independent choice. Silent
uninstall preserves both classes unless an explicit bounded option is supplied.
Destructive choices remain limited to exact VoxLeaf-owned roots. Retaining
optional data intentionally means its in-product management becomes available
only after reinstalling the same product identity; VoxLeaf does not leave a
second model-manager executable after uninstall.

## M011 ordinary acquisition disclosure

Milestone 6B changes only Chatterbox's ordinary acquisition presentation.
Chatterbox
stays visible as an optional quality profile, but **Review Chatterbox download**
and **Download Chatterbox** become actionable only after the bounded compatibility
presentation passes and native code repeats the same gate before network access.
An unsupported or unknown requirement remains visible with a concise reason and
recheck route while Piper stays available.

The Settings card and confirmation must let a user make the performance/quality
trade-off before acquiring several gigabytes:

- Chatterbox is the generally more natural and expressive option compared with
  Piper; that is qualitative positioning, not a promise that every listener will
  prefer it.
- Show exact authority-backed transfer, installed, peak temporary, and minimum
  free-space values: `8,231,893,387` download bytes, `8,228,503,309` installed
  bytes, `13,254,834,850` temporary bytes, and a 20-GB preflight, with readable
  decimal/GiB equivalents. Keep storage separate
  from runtime RAM/VRAM: installation does not permanently reserve memory, but
  model load and inference consume GPU, VRAM, RAM, and CPU.
- State that initial startup can exceed one minute and may temporarily make the
  computer less responsive. Do not say the application is disabled: the visual
  reader remains usable while narration/model controls show a truthful loading
  phase.
- Use indeterminate feedback for verification and service/model load, with no
  fabricated percentage, countdown, or universal timing promise. Retain
  Milestone 6A's **Cancel start**, **Stop**, download-cancellation cleanup, and
  independent **Remove Chatterbox** behavior.

The first-Play presentation includes representative-host observations only when
labelled as observations rather than compatibility guarantees: Spanish/English
command-to-audible were `43.815`/`33.375` seconds, RAM peaks
`4,928,229,376`/`4,414,746,624` bytes, and VRAM peaks `3,707`/`3,671` MiB,
with zero underruns. These values do not replace the live hardware gate.

## Goal

Make VoxLeaf's portfolio-facing reader feel like a reading application rather
than a collection of development controls. The book remains the dominant
surface, frequent playback actions stay immediately available, and durable or
setup-oriented choices move behind one accessible Settings entry point.

The same milestone also adds engine-neutral, pitch-preserving listening-speed
control without changing model generation or persisting generated audio.

## Approved information architecture

### Fixed application bar

The empty reader uses a compact application bar and welcome region outside the
publication scroll viewport:

- compact VoxLeaf identity;
- one custom-styled **Open a book** action backed by the capability-free native
  file picker; and
- privacy-oriented introductory copy plus visible opening/failure status only
  when action is required.

The ready reader keeps the same mounted Open a book action, compact VoxLeaf
identity, and Settings. It does not expose Replace EPUB, Close EPUB, the native
selected-file placeholder, or routine compatibility/lifecycle summaries in
the bar. Settings and compatibility detail appear only after a readable
publication is ready. Opening another book and exiting the application retain
their existing bounded cleanup ownership.

The full measured compatibility matrix, large branding, and reader
preferences must not displace the book from the normal reading workspace.
The manual synthetic raster probe is not product UI; real raster safety remains
covered through the packaged synthetic-EPUB path and deterministic owner tests.

### Reader workspace

The ready application has three stable regions:

1. a fixed compact application bar;
2. compact publication metadata and narration controls; and
3. one publication-owned scroll viewport.

The reader viewport remains the only large normal scroll region. Passive
scrolling continues to inspect the publication without replacing narration.
The exact audible range, active narration locator, heard checkpoint, and
explicit paragraph leaf remain governed by completed M009 and M009.1
authority.

A table-of-contents panel may be collapsible on wide windows and an overlay on
narrow windows. It must not create a second publication scroll owner or infer
narration position from sidebar selection or viewport position.

### Compact narration bar

The compact narration bar keeps these frequent controls and states directly
available:

- Play, Pause, Resume, and Stop as applicable;
- loaded playable duration as text, never as book-completion progress;
- short lifecycle state such as Preparing, Playing, Buffering, or Stopped;
- current startup policy as compact context;
- playback speed;
- volume; and
- a disclosure for less-frequent narration detail and recovery.

Long diagnostic or recovery explanations must not move the primary controls
unpredictably. One concise action-oriented message stays visible; technical
detail remains in the disclosure or Settings.

### Settings surface

Settings is available before and after opening a publication. On wide windows
it is a right-side drawer. On narrow windows it becomes a full-width
dialog-like sheet with the same semantic contract.

The first version contains:

1. **Reading**
   - text size;
   - line spacing; and
   - content width.
2. **Appearance**
   - system, light, or dark theme.
3. **Narration**
   - language;
   - voice/engine profile;
   - Quick start or Prepared playback; and
   - the 1-, 2-, 5-, or 10-minute Prepared audio target.
4. **Device compatibility**
   - concise selected-profile result;
   - Check compatibility again; and
   - collapsible measured-profile reasons.
5. **About**
   - application identity/version; and
   - a short local-processing and privacy statement.

Playback speed is intentionally not duplicated in Settings. Volume remains an
active-player control and is not persisted by this milestone.

Opening or closing Settings must not detect hardware, load or restart a model,
stop playback, alter generation identity, mutate a preference, or move the
logical reading locator. A language or profile selection remains an explicit
identity-changing action and must preserve the existing stop, cleanup,
compatibility, and explicit-restart lifecycle.

## Language and profile behavior

### English default

English becomes the default narration language only for:

- a first run with no saved narration-language preference;
- an explicit narration-settings reset; and
- malformed, unsupported-version, over-limit, unavailable, or otherwise
  invalid current-version preference state.

A valid saved Spanish or English choice must be preserved during upgrade.
Opening a different EPUB does not reset language. VoxLeaf still does not infer
book language, translate text, or switch languages automatically.

The implemented
[`bilingual-narration-authority-v2`](../architecture/bilingual-narration-authority-v2.md)
additively supersedes the historical Spanish fallback without rewriting its
frozen v1 evidence.

### Language-specific profiles

Only profiles declared for the selected language may be presented as
selectable:

| Language | Profiles when their existing gates pass              |
| -------- | ---------------------------------------------------- |
| English  | Piper/joe, Chatterbox bilingual, Qwen3-TTS/Aiden     |
| Spanish  | Piper/davefx, Chatterbox bilingual, Qwen3-TTS/Serena |

Piper and Chatterbox retain their completed M010.1 support states. Qwen
remains development-only. A compatible Qwen profile may appear with an
explicit `Development` label only when the existing development gate is
enabled. This milestone must not promote Qwen to supported, weaken host or
runtime checks, or imply general 8-GB GPU support.

Unavailable profiles may remain visible with one concise reason and a route to
Device compatibility details. Internal profile identifiers, paths, process
arguments, raw host facts, model errors, and book-derived text stay out of the
normal UI.

## Playback-speed target and evaluation history

The fixed choices and v2 evidence below remain historical. ADR-0038 separately
authorized the completed result-blind v3 comparison with boundary-deferred
activation. ADR-0040 selects repository WSOLA, and Milestone 5 implements that
selection without rewriting the earlier results.

### Fixed choices

The frozen comparison evaluated exactly:

`1.00x`, `0.95x`, `0.90x`, `0.85x`, `0.80x`, and `0.75x`.

Production exposes exactly those six values in the compact narration bar and
persists the latest valid selection in its own bounded content-free envelope.
The v1/v2 results remain historical.

### Playback boundary

Speed is applied after synthesis to in-memory playback. Piper, Chatterbox,
Qwen, and future engines receive unchanged prepared text and generate
unchanged source PCM. Changing speed:

- does not regenerate audio;
- does not invalidate session or generation identity;
- does not restart or reconfigure the TTS service;
- preserves queued PCM and existing source-frame memory accounting; and
- applies consistently across admitted engines.

The selected product integration must preserve pitch across its admitted range.
Directly enabling `AudioBufferSourceNode.playbackRate` is insufficient because
it changes rendered sample rate and pitch. Milestone 10.2 must freeze and
validate a bounded in-memory time-stretch mechanism before product admission.
Any production dependency requires purpose, alternative, license,
distribution, memory, cancellation, and platform review.

The retained repository WSOLA path must render on the same 24,000 Hz clock as
the protocol PCM and the evaluated WSOLA window/hop configuration. It must not
silently inherit a device-default 48,000 Hz `AudioContext`: doing so consumes
24,000 Hz input twice as quickly and can make a selected slowdown sound faster.
This clock requirement adds no resampled PCM copy or second queue.

The completed v2 comparison was intentionally limited to:

- `HTMLMediaElement.preservesPitch` with one bounded in-memory WAV and the
  narrowly reviewed `media-src 'self' blob:` policy;
- one exact locked Signalsmith Stretch Web Audio WASM/AudioWorklet package
  after its package, source, transitive-dependency, and distribution audit; and
- a materially optimized incremental repository-owned WSOLA implementation.

A candidate is eligible only when it is built into the platform,
repository-owned, or uses a permissive fee-free licence such as MIT, BSD, ISC,
0BSD, or Apache-2.0. VoxLeaf will not buy a licence or accept royalties,
subscriptions, commercial exceptions, copyleft/source-availability duties, or
unknown distribution terms for this feature. SoundTouch, FFmpeg, Rubber Band,
and model-specific speaking-rate controls are outside this comparison because
they add licence/distribution complexity or change the wrong pipeline
boundary.

The media candidate could add only `media-src 'self' blob:` to the candidate
test policy. It did not pass every gate, so the production CSP remains
unchanged.

### Approved v3 boundary-deferred behavior

VoxLeaf retains complete source-PCM units in one bounded FIFO and plays one
unit at a time. A v3 speed selection therefore takes effect
at the next generated-unit boundary rather than modifying the unit already
being heard:

- the current unit keeps the rate with which it started;
- the newest valid pending selection wins if the user changes it more than
  once before the boundary;
- the selected and active audible values remain distinguishable until the
  next unit begins;
- TTS generation continues and existing queued source PCM remains valid;
- speed alone does not cancel or restart the model, replace generation
  identity, regenerate audio, release the queue, or alter narration text; and
- the next queued unit adopts the pending value before playback starts.

Entering a non-default value may initialize one stretcher while the current
unit continues. V3 permits at most 1,000 ms p95 for that first activation and
at most 200 MiB additional process RAM under local-inference contention. The
one-second allowance is not a recurring inter-unit pause: the same bounded
backend must be reused or prepared so successor units do not repeatedly pay
the full activation cost.

At `1.00x`, the time-stretch path is bypassed and must release its stretcher,
object URL, transformed copy, and work queue after the preceding slowed unit
settles. VoxLeaf retains only the existing source-PCM FIFO; it must not retain
a second pre-stretched audio queue.

These values are not a retroactive reinterpretation of the 128 MiB and 250 ms
v2 gates. Milestone 2C froze the exact candidates, 250 ms p95 recurring-unit
handoff gate, listening rules, and executable authority before Milestone 2D
implemented or measured candidates. Milestone 2D selected repository WSOLA
with `605.4 ms` p95 first activation and `10.1 ms` p95 recurring handoff under
exact Piper contention, `24.715 MiB` additional process RAM, and a passing
bilingual listening result. The unselected media path and its candidate-only
CSP were removed.

### Progress and timing

Audible progress remains authoritative in source sample frames. Under the v3
direction, the active unit never changes rate: it completes under its immutable
active value, and the successor starts at the newest pending value.
Highlighting and heard-position persistence must never advance beyond source
frames actually consumed.

Two duration meanings remain separate:

- **source media duration** is remaining source frames divided by source sample
  rate and continues to govern PCM memory ceilings;
- **effective listening duration** is source media duration divided by current
  playback rate and governs promises about how long the available lead lasts.

Quick-start, Prepared, low-water, and underrun decisions use effective
listening duration. The UI may say
`30 sec ready at 0.75x` to avoid confusing effective listening time with
stored media duration. Slower consumption may give inference more time to
advance, but it does not improve or change model RTF and must not be reported
as such.

Existing semantic transition pauses remain interruptible wall-clock timers.
They do not scale with playback rate unless a later listening evaluation and
authority explicitly changes that rule.

## Persistence

Milestone 10.2 adds or revises only bounded, content-free preferences:

- narration language;
- narration profile ID through its existing repository;
- playback speed; and
- Quick/Prepared startup plus Prepared target.

Reader appearance continues to use the existing bounded reader-preference
repository. Startup choices require a separate versioned narration-start
preference rather than silent insertion into the reader-position envelope.
Playback speed likewise needs explicit ownership and migration even though the
shared historical reading-state schema permits a positive rate.

No preference may contain an EPUB path, book identity, book text, locator
prose, generated audio, model path, raw host report, or failure detail.

## Responsive and accessibility requirements

Initial layout targets are:

- `>= 1200 px`: optional 240-280 px contents sidebar and 380-420 px Settings
  drawer;
- `800-1199 px`: contents overlay and 340-380 px Settings drawer; and
- `< 800 px`: one reading column, full-width Settings sheet, and compact
  player actions that wrap without horizontal scrolling.

The authority milestone may adjust these exact breakpoints before
implementation if repository-authored browser evidence shows a better bounded
choice.

Required interaction behavior:

- dialog semantics, visible title/Close action, focus containment, Escape, and
  focus restoration to the Settings button;
- visible keyboard focus and at least 44-by-44 CSS-pixel primary pointer
  targets;
- DOM reading order matching visual order;
- no nested focus traps between Settings and contents overlays;
- meaningful state not communicated by color alone;
- forced-colors and reduced-motion support;
- restrained live-region announcements that do not announce every buffer
  update; and
- unchanged paragraph-leaf keyboard, pointer, and touch behavior.

## Developer-only interface

The synthetic raster safety probe and raw diagnostics are not normal reader
features. They remain available only through an explicit development gate or
test harness. Production-facing Settings exposes bounded compatibility
reasons, not developer telemetry.

## Scope deferred beyond M010.2

- a native operating-system File/View/Settings menu;
- configurable keyboard shortcuts;
- persisted default volume;
- additional fonts or themes;
- resizable panels;
- settings import/export;
- voice cloning or personal reference audio;
- automatic language detection, translation, or mixed-language switching;
- automatic engine failover or retry; and
- changing Qwen's development-only support state.

## Acceptance summary

M010.2 is complete only when deterministic, Chromium, packaged WebView2, and
exact-host evidence prove:

- the reader remains the dominant and sole large scroll surface;
- Settings is accessible and lifecycle-neutral when merely opened;
- every moved control retains its existing domain behavior;
- English is the correct fallback without overwriting valid saved language;
- profile visibility remains language-, support-, development-, host-, and
  runtime-gated;
- exactly the six approved values are accepted, and every admitted speed
  preserves pitch and correct source-frame progress;
- a speed-only change is applied at the next complete-unit boundary without
  cancelling TTS, replacing identity, or discarding queued PCM;
- first non-default activation remains within 1,000 ms p95 and 200 MiB
  additional process RAM, while `1.00x` bypasses and releases time stretching;
- any selected backend is fee-free, permissively distributable, and passes the
  frozen CPU, RAM, work-memory, browser, packaged-host, lifecycle, privacy, and
  listening gates;
- effective lead, startup, low-water, and underrun semantics are truthful;
- pause, resume, stop, seek, profile/language replacement, recovery, book
  replacement, and exit remain identity-safe at non-`1.0x` rates;
- PCM, queues, work, and persistence remain bounded; and
- no private EPUB, generated audio, model artifact, secret, or private host
  detail enters the repository or diagnostics.
