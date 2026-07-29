# Piper narration preparation profile v1

## Status

Accepted on 2026-07-29 as the corrective, result-blind product preparation
authority for exact Piper 1.4.2 / `es_ES-davefx-medium`. The profile was frozen
after a synthetic reproduction identified the integration discrepancy and
before corrective product execution.

Superseded for product dispatch on 2026-07-29 by
[`narration-piper-v2`](piper-narration-preparation-profile-v2.md) after exact
synthetic evaluation proved that compact written forms can exceed the
20-second waveform boundary while remaining below v1's code-point limit. V1
remains immutable historical authority and a decodable compatibility profile.

This profile does not change protocol v1, the generic `narration-v1` profile,
EPUB normalization, source-range semantics, cancellation, persistence, or the
admitted Piper engine identity.

## Problem boundary

Protocol v1 admits at most 480,000 mono sample frames at 24 kHz, or exactly 20
seconds, in one complete audio unit. Generic `narration-v1` was intentionally
model-neutral and permits 320 narration code points as its target and 640 as
its hard maximum. Those text bounds do not guarantee that a complete Piper
waveform fits the protocol audio-unit ceiling.

A content-free synthetic reproduction measured 17.694 seconds for 320 Spanish
code points, 21.769 seconds for 400, and 35.260 seconds for 640 with the exact
admitted voice and synthesis settings. The production adapter correctly
rejected the synthetic 400-code-point waveform rather than publishing an
oversized unit. A real EPUB can therefore prepare one valid generic segment,
play earlier units, and then stop when a later complete Piper waveform exceeds
the protocol ceiling.

The corrective profile must prevent that known integration mismatch without:

- truncating or omitting spoken text;
- changing protocol v1 or its 20-second hard maximum;
- estimating duration from private book text at runtime;
- weakening stable locator ranges or paragraph-level navigation;
- adding automatic retry, persistence, or a second worker; or
- changing segmentation for Qwen or other profiles.

## Accepted `narration-piper-v1` segment policy

The source-window, normalization, protected-token, traversal, work,
cancellation, aggregate-retention, and public batch limits remain exactly those
of `narration-v1`. Only the block-local segment-selection dimensions are
narrower:

| Dimension                  | Target | Hard maximum | Unit                |
| -------------------------- | -----: | -----------: | ------------------- |
| Source span per segment    |    240 |          320 | Unicode code points |
| Narration text per segment |    200 |          256 | Unicode code points |
| Narration text per segment |    800 |        1,024 | UTF-8 bytes         |
| Sentences per segment      |      2 |            6 | sentences           |

The 256-code-point narration hard maximum preserves the already accepted
protected-token ceiling. The 200-code-point target provides deterministic
headroom below the failing generic case and keeps ordinary exact-voice units
within the intended short-segment operating range. Code-point and byte limits
remain admission authorities; measured duration is validation evidence, not a
private runtime sizing oracle.

## Product selection and failure behavior

The desktop product coordinator requests `narration-piper-v1` only when the
active executable profile is
`piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1`. Every other profile continues to
request `narration-v1`.

The EPUB package performs the narrower packing while it still owns normalized
source mapping, so every emitted segment retains its exact canonical
`LocatorRangeV1`. The TTS adapter receives an ordinary unchanged
`NarrationSegmentV1`; no model path, text, duration estimate, or new profile
field crosses the process boundary.

If an admitted 256-code-point segment nevertheless produces more than 20
seconds because of unusual pronunciation or pauses, the existing adapter still
fails closed and publishes no partial audio. That residual case must be
measured and handled by a separately versioned decision; it must not be hidden
by truncation or a protocol bypass.

## Validation

Corrective implementation must prove:

- the public request decoder accepts only `narration-v1` and
  `narration-piper-v1`;
- identical source input produces smaller Piper segments with ordered exact
  locator ranges and unchanged text when concatenated;
- every Piper segment respects the four frozen dimensions;
- the desktop selects the Piper profile only for the admitted Piper engine;
- Qwen and model-free tests retain `narration-v1`;
- the synthetic case that previously exceeded 20 seconds completes through the
  exact adapter without audio truncation;
- cancellation, bounded retention, highlighting, navigation, and privacy tests
  remain green; and
- exact-host Piper playback advances beyond the first prepared unit without a
  service failure.
