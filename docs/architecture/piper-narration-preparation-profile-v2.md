# Piper narration preparation profile v2

## Status

Accepted on 2026-07-29 as the corrective pre-implementation authority for
exact Piper 1.4.2 / `es_ES-davefx-medium` spoken-expansion-aware product
preparation. It was frozen after a private reader exposed only the content-free
state of one accepted eight-second unit followed by a processing failure, and
after bounded synthetic reproduction established the failure class. No EPUB
text, path, audio, or model diagnostic was retained.

Implemented and confirmed on 2026-07-29. Deterministic package and desktop
coverage, the release-packaged exact Piper matrix, and the content-safe
private-book confirmation pass.

This profile supersedes `narration-piper-v1` for new Piper product work. It
does not change `narration-v1`, the historical v1 policy, normalization,
locator-range semantics, protocol v1, the 20-second audio-unit ceiling,
inference settings, buffering, cancellation, recovery, or persistence.

## Reproduced discrepancy

The v1 policy limits narration text to 200 code points as a target and 256 as a
hard maximum. That fixes ordinary long prose, but code-point count still does
not bound spoken expansion. The exact offline Piper voice rejected synthetic
256-code-point inputs containing repeated digit groups, acronyms, Roman
numerals, currencies, ordinals, or single-letter sentences because their
complete waveform exceeded the existing product boundary.

Direct content-free duration measurements show why one smaller raw limit would
be both unsafe and unnecessarily abrupt:

| Synthetic pattern | 160 raw code points | First raw length above 20 seconds |
| ----------------- | ------------------: | --------------------------------: |
| Ordinary Spanish  |         about 8.7 s |                     not reproduced |
| Digit groups      |        about 51.7 s |                     64 code points |
| Acronyms          |        about 15.7 s |                    224 code points |
| Roman numerals    |        about 19.7 s |                    192 code points |
| Currency groups   |        about 39.3 s |                     96 code points |
| Ordinals          |        about 20.0 s |                    192 code points |
| Letter sentences  |        about 16.4 s |                    224 code points |

The correction must account for normalized text categories before inference.
It must not inspect private prose outside the existing process-local EPUB
preparation boundary, estimate duration with a model call, truncate speech,
retry failed synthesis automatically, or persist text-derived diagnostics.

## Accepted `narration-piper-v2` policy

All v1 source, narration-code-point, UTF-8, sentence, aggregate, work,
cancellation, and locator bounds remain. V2 adds one deterministic
process-local measurement named a **Piper speech-expansion unit**:

| Normalized code point                              | Units |
| -------------------------------------------------- | ----: |
| ASCII digit `0` through `9`                        |     4 |
| Unicode currency symbol or `%`, `‰`, `º`, `ª`, `°` |     3 |
| Unicode uppercase letter                          |     2 |
| Every other normalized code point                  |     1 |

The expansion-unit target is 120 and the hard maximum is 160. Candidate
selection must satisfy this dimension together with every unchanged v1
dimension. Measurement occurs while `@voxleaf/epub` already owns normalized
source-mapped units. It is never returned to the renderer, TTS process,
metrics, diagnostics, or persisted state.

Protected tokens remain indivisible. A single protected token above the hard
maximum fails preparation with the existing content-free resource outcome
before model inference; it is not split, rewritten, or omitted.

At the 160-unit hard boundary, the exact voice produced the following bounded
synthetic results before implementation:

| Synthetic pattern | Code points admitted | Audio duration |
| ----------------- | -------------------: | -------------: |
| Ordinary Spanish  |                  153 |        8.336 s |
| Phoneme-heavy     |                  156 |        8.649 s |
| Digit groups      |                   42 |       17.694 s |
| Acronyms          |                   90 |        9.207 s |
| Roman numerals    |                   87 |       10.971 s |
| Currency groups   |                   59 |       14.838 s |
| Ordinals          |                   75 |        9.485 s |
| Letter sentences  |                  120 |       12.678 s |

These measurements justify the deterministic budget for the reproduced class;
they are not a universal duration predictor. The adapter retains fail-closed
enforcement for any unusual output that still exceeds protocol v1.

## Product selection

The desktop requests `narration-piper-v2` only for
`piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1`. Other engines continue to use
`narration-v1`. `narration-piper-v1` remains decodable only for historical
tests and callers; product dispatch no longer selects it.

Piper may return no waveform for a source-mapped unit containing punctuation
but no speakable content. The desktop therefore omits a Piper unit only when
it contains no Unicode letter, number, currency symbol, or accepted spoken
symbol (`%`, `‰`, `º`, `ª`, or `°`). The omission happens after bounded
preparation and before a protocol synthesis request. It does not rewrite
displayed or prepared text, insert silence, persist content, consume a
sequence number, or alter the continuation locator. Units with any potentially
speakable content still reach Piper and retain the adapter's fail-closed
output checks. Other engines are unchanged.

## Future engine-specific text adaptation

VoxLeaf may eventually need an engine-specific text-adaptation step, but this
profile does not approve or implement a separate Piper text rewriter. Current
Piper-specific behavior is limited to bounded segment sizing and omission of
units that contain no potentially speakable content. Canonical prepared text
remains the source-mapped output owned by `@voxleaf/epub`.

Future engines must continue to share canonical normalization for whitespace,
punctuation, numbers, symbols, language context, semantic segmentation, and
stable locator ranges. An engine adapter may own only evidence-backed
requirements such as engine-specific size budgets, supported-character
handling, exact voice/language/parameter mapping, or a narrowly defined input
format. Generation parameters such as temperature are adapter configuration,
not text normalization.

Do not introduce a common `EngineTextAdapter` abstraction until at least two
integrated engines demonstrate concrete, different adaptation requirements.
Any future text rewrite requires newly frozen rules and tests proving
determinism, bounded expansion, cancellation, source-range traceability,
meaning preservation, pronunciation benefit, privacy, and unchanged displayed
EPUB text. The post-MVP evaluation boundary is recorded in the
[local TTS candidate backlog](../product/post-mvp-tts-candidate-backlog.md#engine-specific-text-adaptation-boundary).

## Validation

Implementation must prove:

- the request decoder accepts v2 without weakening rejection of unknown
  profiles;
- generic and historical v1 segmentation remain unchanged;
- every v2 segment satisfies both the unchanged v1 dimensions and the new
  160-unit hard maximum;
- ordinary Spanish, digit, acronym, Roman, currency, ordinal, and
  single-letter synthetic fixtures remain ordered, text-complete, and
  locator-contiguous;
- exact Piper produces complete sub-20-second units for the bounded synthetic
  regression matrix;
- product dispatch selects v2 only for Piper;
- punctuation-only Piper units create no synthesis request, while the next
  speakable locator-linked unit remains ordered and selectable;
- cancellation, work, retention, privacy, protocol, and generated-artifact
  bounds remain unchanged;
- the release-packaged Piper matrix, portable checks, and native checks pass;
  and
- the private reader case is considered closed only after the user confirms
  that the same book advances beyond the former second-unit failure.

## Implementation results

`@voxleaf/epub` measures speech-expansion units during its existing bounded
normalized-unit scan and uses the additional target/hard dimension only when
the request profile is `narration-piper-v2`. The value never appears in public
segment measurements. Generic `narration-v1` and historical
`narration-piper-v1` policies retain their prior behavior, and the desktop
selects v2 only for the admitted Piper profile.

All 559 EPUB tests and all 402 desktop tests pass. The release-packaged exact
Piper regression uses a synthetic expansion-heavy sentence and completed
60.010 seconds of stable playback with zero underruns, 18 synchronized
transitions, zero GPU allocation, zero external requests, zero generated-audio
files, and zero retained or discarded units after cleanup. Quick playback
became audible in 3,114 ms with 21.524 seconds prepared; prepared playback
became audible in 4,772 ms with 62.496 seconds prepared. This closes the
synthetic reproduced class without changing protocol, inference settings,
normalization, or audio persistence.

A later content-safe in-memory probe over the user-provided ignored EPUB
prepared the complete publication as 5,722 segments in 358 bounded requests.
Preparation succeeded, so EPUB parsing and v2 sizing were not the remaining
failure. Exact Piper produced no chunks for a two-code-point punctuation-only
unit; the prior desktop path treated that valid no-speech outcome as a
processing failure. With the dispatch omission above, the first 64 prepared
units omitted four punctuation-only units and all 60 speakable units
synthesized successfully. The probe emitted only counts, durations, and fixed
outcomes and retained no book text, path, or audio.

The rebuilt packaged confirmation subsequently proved that preparation and
Piper synthesis were healthy across the private publication but exposed a
desktop-only contract mismatch at the next 16-unit batch. A valid non-empty
fragment reported `sentenceCount: 0`, as allowed by the existing M005
non-negative `Index` measurement, while the adaptive scheduler incorrectly
required a positive value. Removing only that false scheduler restriction
retains positive code-point/byte requirements and all v2 bounds. Before the
correction, 16 units and 27.257 playable seconds were accepted before
preparation failed with the service still `ready`; afterward, the packaged run
accepted 27 units, buffered 60.837 seconds, remained `playing` with no failure,
kept the service `ready`, and started through the paragraph leaf. No book text,
path, or audio was retained or printed. The private-book confirmation passes.
