# Reader settings and playback authority v1

## Status

Accepted and frozen before production implementation on 2026-07-30 for
M010.2 Milestone 1. The executable authority is
`apps/desktop/src/tts/reader-settings-playback-authority.ts`.

This authority does not claim that the Settings shell, English fallback,
preference migrations, or non-`1.00x` playback are implemented. The current
runtime remains the completed M010.1 interface, preserves its Spanish fallback
for missing or invalid language state, and plays at `1.00x`.

## Scope and preserved boundaries

This authority composes existing reader, playback, synchronization,
compatibility, and persistence boundaries. It changes none of:

- M005 narration normalization or semantic segmentation;
- prepared text or TTS request content;
- protocol v1;
- profile support states or model output;
- source PCM frame, byte, unit, or metadata ceilings;
- semantic transition-pause durations;
- native capabilities; or
- production dependencies.

The historical
[`bilingual-narration-authority-v1.md`](bilingual-narration-authority-v1.md)
remains byte-frozen benchmark evidence. M010.2 Milestone 3 must introduce a
new preference/product authority rather than rewrite that history.

## Reader shell and scroll ownership

The ready application has exactly these stable regions:

1. a fixed application bar;
2. compact publication metadata and narration controls; and
3. the publication reader viewport.

The publication reader viewport is the sole continuous publication scroll
owner. Nested publication scrolling is prohibited, and passive viewport
movement remains presentation-only.

The application bar contains compact VoxLeaf identity, Open/Replace EPUB, a
concise compatibility status, Settings, and Close EPUB when a publication is
open.

### Responsive targets

| Viewport width | Band | Settings | Contents |
| --- | --- | --- | --- |
| `< 800 CSS px` | narrow | full-width sheet | overlay |
| `800-1199 CSS px` | compact | 360 CSS px right drawer | overlay |
| `>= 1200 CSS px` | wide | 400 CSS px right drawer | optional persistent 260 CSS px panel |

Invalid, non-integer, zero, and negative viewport widths are rejected by the
executable selector.

## Settings authority

Settings is available with no publication and with a ready publication. Its
sections and order are:

1. **Reading:** text size, line spacing, content width.
2. **Appearance:** theme.
3. **Narration:** language, profile, startup mode, Prepared target.
4. **Device compatibility:** selected-profile result, recheck, measured
   profile reasons.
5. **About:** application identity/version and local-processing/privacy
   statement.

Playback speed exists only in the compact narration bar. Volume is
session-only.

Settings uses a labelled modal dialog contract with a visible close action,
focus containment, Escape dismissal, focus return to the Settings trigger, no
nested focus trap, and primary targets of at least 44 CSS pixels.

Opening or closing Settings is lifecycle-neutral. It must not detect hardware,
load or restart a model, stop playback, replace generation identity, mutate a
preference, or move the logical reading locator.

## Compact narration authority

The compact narration bar contains:

- Play/Pause/Resume;
- Stop;
- loaded effective listening duration as text;
- a short lifecycle state;
- startup-policy context;
- playback speed;
- volume; and
- detail/recovery disclosure.

It contains no progress element. Loaded duration is not book-completion
progress.

## Language, profile, and preference authority

English becomes the fallback only for first-run missing state, explicit
narration reset, malformed data, unsupported versions, oversize envelopes,
unavailable storage, or invalid current-version data. Every valid saved
Spanish or English preference is preserved. Automatic language detection,
translation, and automatic per-book language switching remain prohibited.

Selectable profiles retain the completed M010.1 language bindings:

| Language | Profiles |
| --- | --- |
| English | Piper/joe, Chatterbox bilingual, Qwen/Aiden |
| Spanish | Piper/davefx, Chatterbox bilingual, Qwen/Serena |

Qwen remains `development-only`. It is selectable only when the explicit
native development gate is enabled and is visibly labelled `Development`.
This authority does not change any profile's support state.

The preference envelope is versioned, bounded to 256 UTF-8 bytes,
content-free, and closed:

| Family | Version | Values/default |
| --- | --- | --- |
| `narration-language-preference-v2` | 2 | `en` or `es`; default `en`; valid v1 values preserved |
| `narration-start-preference-v1` | 1 | Quick or Prepared; targets 1, 2, 5, or 10 minutes; defaults Quick/1 minute |
| `narration-playback-preference-v1` | 1 | exact integer-percent rate; default 100 |

Future versions reject and use the safe default. Unavailable storage uses the
safe default without writing. No preference may include an EPUB path, book
identity or text, locator prose, generated audio, model path, raw host report,
or failure detail.

## Playback-rate authority

Speed is applied after synthesis at the in-memory playback boundary. Prepared
text, TTS requests, model generation, source PCM, work identity, and queued
audio remain unchanged.

The exact choices are:

| Percent | Label | Rational rate |
| --- | --- | --- |
| 100 | `1.00x` | `100/100` |
| 95 | `0.95x` | `95/100` |
| 90 | `0.90x` | `90/100` |
| 85 | `0.85x` | `85/100` |
| 80 | `0.80x` | `80/100` |
| 75 | `0.75x` | `75/100` |
| 70 | `0.70x` | `70/100` |
| 65 | `0.65x` | `65/100` |
| 60 | `0.60x` | `60/100` |
| 55 | `0.55x` | `55/100` |
| 50 | `0.50x` | `50/100` |

Pitch preservation is mandatory. Direct
`AudioBufferSourceNode.playbackRate` is a negative control only because it
changes pitch.

### Source and effective-duration arithmetic

Source sample frames remain progress, release, and memory authority. At the
fixed 24 kHz source rate:

```text
sourceMediaMs = floor(sourceFrames * 1000 / 24000)
effectiveListeningMs =
  floor(sourceFrames * 1000 * 100 / (24000 * ratePercent))
minimumSourceFrames =
  ceil(effectiveListeningMs * 24000 * ratePercent / (1000 * 100))
```

Quick-start, Prepared, low-water, refill, and underrun promises use effective
listening duration. This never expands the existing maximum of 43,200,000
source frames, logical PCM bytes, complete units, or metadata entries.

For a mid-unit rate change, the implementation must:

1. settle consumed source frames at the old rate;
2. publish any due bounded progress;
3. apply the new rate to remaining source frames;
4. preserve work and source-range identity; and
5. continue without replay or skip.

Semantic transition pauses remain interruptible wall-clock timers and do not
scale with playback speed.

## Frozen backend comparison

Milestone 2 may compare only these candidates:

| Candidate | Eligible | Dependency | Active audio-copy bound |
| --- | --- | --- | --- |
| repository AudioWorklet WSOLA v1 | yes | none | one service unit |
| HTMLMediaElement `preservesPitch` with in-memory WAV v1 | yes | none | one service unit plus one WAV copy |
| direct AudioBufferSource playback-rate control v1 | no; negative control | none | changes pitch |

An unlisted production dependency requires new authority. Licensing ambiguity
stops the work. A wider native capability is prohibited. If neither eligible
candidate passes, VoxLeaf retains `1.00x` only.

### Frozen inputs

Synthetic inputs are 24 kHz mono float32 PCM: 220, 440, and 880 Hz tones of
8 seconds and impulses every 250 ms.

Listening inputs are the repository-authored `es-v7-arrival`,
`es-v7-dialogue`, `en-v7-arrival`, and `en-v7-dialogue` cases from
`benchmarks/tts/corpus-v7.json`. Generated speech is ephemeral and must not be
committed or persisted.

Critical machine-test rates are 75%, 60%, and 50%. Listening covers 100%, 75%,
60%, and 50%.

### Machine gates

- pitch deviation: at most 20 cents;
- rendered-duration error: at most 50 ms;
- source-frame drift: zero;
- backend start p95: at most 250 ms;
- rate-change settlement p95: at most 250 ms;
- pause/stop teardown p95: at most 250 ms;
- additional work memory: at most 7,680,000 bytes;
- additional process RAM: at most 128 MiB;
- CPU increase: at most 20 percentage points;
- active time stretchers: at most one;
- external requests: zero; and
- persisted generated-audio bytes: zero.

The required product hosts are production Chromium and packaged Windows
WebView2.

### Listening gates

One fluent maintainer per language evaluates each required rate. Minimum
scores are 4/5 intelligibility, 3/5 naturalness, and 3/5 artifact quality,
with zero omitted or repeated words.

## Privacy and evidence

All deterministic evidence is model-free and content-free. Audio remains
bounded and ephemeral; narration text and PCM stay outside React state; only
one native TTS child tree and one active time stretcher may exist. Diagnostics
remain closed and content-free.

The exhaustive result-blind tests freeze every value above while asserting
that existing runtime defaults and the M005, protocol, support, model,
resource, transition, capability, and dependency boundaries remain unchanged.
