# Reader settings and playback controls

## Status

Approved product direction for roadmap Milestone 10.2. The behavior in this
document is not implemented until
[`M010-002-reader-settings-and-playback-controls.md`](../plans/active/M010-002-reader-settings-and-playback-controls.md)
records passing implementation and validation. Current runtime behavior
remains the completed M010.1 interface, Spanish fallback for missing or invalid
language preference, and `1.0x` playback.

This document replaces the ignored pre-M011 design discussion as the durable
product scope. It does not change the completed M005 narration-preparation
boundary, protocol v1, TTS model input, generated audio, support decisions, or
release-distribution status.

## Goal

Make VoxLeaf's portfolio-facing reader feel like a reading application rather
than a collection of development controls. The book remains the dominant
surface, frequent playback actions stay immediately available, and durable or
setup-oriented choices move behind one accessible Settings entry point.

The same milestone also adds engine-neutral, pitch-preserving listening-speed
control without changing model generation or persisting generated audio.

## Approved information architecture

### Fixed application bar

The ready reader uses a compact application bar outside the publication scroll
viewport:

- compact VoxLeaf identity;
- Open EPUB or Replace EPUB;
- one short compatibility status;
- Settings; and
- Close EPUB while a publication is open.

The full measured compatibility matrix, large branding, and reader
preferences must not displace the book from the normal reading workspace.

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

The implementation must update the frozen bilingual product authority through
a new version or amendment before changing the current Spanish fallback.

### Language-specific profiles

Only profiles declared for the selected language may be presented as
selectable:

| Language | Profiles when their existing gates pass |
| --- | --- |
| English | Piper/joe, Chatterbox bilingual, Qwen3-TTS/Aiden |
| Spanish | Piper/davefx, Chatterbox bilingual, Qwen3-TTS/Serena |

Piper and Chatterbox retain their completed M010.1 support states. Qwen
remains development-only. A compatible Qwen profile may appear with an
explicit `Development` label only when the existing development gate is
enabled. This milestone must not promote Qwen to supported, weaken host or
runtime checks, or imply general 8-GB GPU support.

Unavailable profiles may remain visible with one concise reason and a route to
Device compatibility details. Internal profile identifiers, paths, process
arguments, raw host facts, model errors, and book-derived text stay out of the
normal UI.

## Playback-speed authority target

### Fixed choices

The compact narration bar offers exactly:

`1.00x`, `0.95x`, `0.90x`, `0.85x`, `0.80x`, `0.75x`, `0.70x`, `0.65x`,
`0.60x`, `0.55x`, and `0.50x`.

The default is `1.00x`. The last valid selection is a bounded, versioned
global narration preference. Unknown, malformed, non-finite, or unlisted
values fail closed to `1.00x`.

### Playback boundary

Speed is applied after synthesis to in-memory playback. Piper, Chatterbox,
Qwen, and future engines receive unchanged prepared text and generate
unchanged source PCM. Changing speed:

- does not regenerate audio;
- does not invalidate session or generation identity;
- does not restart or reconfigure the TTS service;
- preserves queued PCM and existing source-frame memory accounting; and
- applies consistently across admitted engines.

The implementation must preserve pitch across the full admitted range.
Directly enabling `AudioBufferSourceNode.playbackRate` is insufficient because
it changes rendered sample rate and pitch. Milestone 10.2 must freeze and
validate a bounded in-memory time-stretch mechanism before product admission.
Any production dependency requires purpose, alternative, license,
distribution, memory, cancellation, and platform review.

### Progress and timing

Audible progress remains authoritative in source sample frames. If the rate
changes during an active unit, the player first settles progress at the old
rate, then applies the new rate. Highlighting and heard-position persistence
must never advance beyond source frames actually consumed.

Two duration meanings remain separate:

- **source media duration** is remaining source frames divided by source sample
  rate and continues to govern PCM memory ceilings;
- **effective listening duration** is source media duration divided by current
  playback rate and governs promises about how long the available lead lasts.

Quick-start, Prepared, low-water, and underrun decisions use effective
listening duration after the new authority is implemented. The UI may say
`30 sec ready at 0.50x` to avoid confusing effective listening time with
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
- every admitted speed preserves pitch and correct source-frame progress;
- effective lead, startup, low-water, and underrun semantics are truthful;
- pause, resume, stop, seek, profile/language replacement, recovery, book
  replacement, and exit remain identity-safe at non-`1.0x` rates;
- PCM, queues, work, and persistence remain bounded; and
- no private EPUB, generated audio, model artifact, secret, or private host
  detail enters the repository or diagnostics.
