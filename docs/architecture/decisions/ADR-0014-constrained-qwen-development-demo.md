# ADR-0014: Permit a constrained Qwen development demo

## Status

Accepted.

## Context

The exact
`qwen3-tts-1-7b-customvoice-cuda-bf16-v1` evaluation completed on the
maintainer's Windows/RTX 5060 Laptop host. Cold load, RAM, VRAM, offline,
artifact, license, packaging, and cleanup gates passed. The frozen `v3`
evaluation nevertheless failed startup, throughput, zero-failure, and three
mid-generation cancellation gates:

- warm first-audio p95 was 67.6685348 seconds;
- total sustained RTF was 1.4521558253532183, so one minute of audio required
  about 87 seconds of generation; and
- the complete-waveform API provided no valid after-first-audio,
  after-five-media-seconds, or near-hard mid-generation cancellation point.

One fluent Spanish maintainer completed the blinded quality exercise. The
limited overall mean was 4.266666666666667/5 with understandable accent
variation, number/symbol pronunciation as the main concern, and three
meaning-changing defects. The maintainer explicitly accepts this audible
quality for a near-term development demo and does not require two additional
evaluators for that demo decision.

The three-person requirement in `tts-feasibility-profile-v3` was frozen before
results. It cannot be changed afterward or satisfied by duplicating one
person's score. ADR-0013 therefore remains correct: no standard passing local
TTS profile exists.

## Decision

Permit the exact Qwen 1.7B CustomVoice/Serena configuration as a
**development-demo-only constrained profile**. This is an explicit product
exception, not a passing `v3` result and not a general production or hardware
profile.

A later implementation may use this profile only when it:

- loads only the verified local artifacts under the frozen offline identity;
- keeps one resident model, batch size one, one queued narration unit, and
  bounded in-memory audio;
- consumes the existing normalized, locator-linked narration segments without
  logging or persisting their text or generated audio;
- publishes only a complete valid bounded unit and starts playback as soon as
  the normal approximately 15 seconds of playable lead is available, without a
  fixed wall-clock timer;
- shows an explicit preparing or buffering state and makes no uninterrupted,
  real-time, or full-chapter claim;
- invalidates the full work identity before terminating the worker on pause,
  seek, replacement, settings change, close, or cancellation; and
- limits demonstrations to a bounded prepared excerpt whose audio can remain
  in memory for the session.

One fluent Spanish maintainer is sufficient for future MVP
development-demo-quality feedback. A future standard feasibility profile may
choose the same smaller panel only if it freezes that rule before new results.
This decision does not alter the historical `v1`, `v2`, or `v3` authorities.

Milestone 5 of the active blocker-resolution plan must record the exact
constrained selection and failed standard gates. Milestone 7 may then plan a
development-only vertical demo path around the measured complete-waveform
boundary. Production graduation still requires new evidence or a separately
approved change to the normal performance, buffering, cancellation, hardware,
and packaging acceptance criteria.

## Consequences

- VoxLeaf can pursue a credible local narrated demo without evaluating another
  engine first.
- Audible quality and existing Spanish narration normalization can be reused,
  including closed expansions for supported numbers, dates, times, currency,
  percentages, and symbols.
- The demo must disclose preparation and buffering. At the measured RTF, an
  indefinitely long on-the-fly stream falls behind by about 27 seconds per
  minute; buffering cannot convert it into real-time synthesis.
- Mid-generation cancellation remains process termination plus stale-identity
  rejection. Partial audio from a terminated unit is never playable.
- No production dependency, installer payload, model download, persisted
  audio, general hardware support, or continuous-playback claim is approved by
  this ADR.
- ADR-0013 continues to block claiming a viable standard profile. This ADR
  supersedes only its blanket prohibition on using the exact Qwen candidate in
  a clearly bounded development demo.

## Alternatives considered

### Evaluate another engine before the demo

Rejected for the near-term demo. It would delay visible progress while the
exact Qwen configuration is already installed, offline-capable, measured, and
audibly accepted by the maintainer.

### Claim that upstream streaming support makes the measured profile real-time

Rejected. The evaluated `qwen-tts==0.1.1` CustomVoice call returned complete
waveforms, and the direct measurements remain authoritative for this adapter.

### Lower or rewrite `profile-v3`

Rejected. Its requirements were frozen before results. Editing them afterward
would invalidate the evaluation rather than approve the demo honestly.

### Persist generated audio to hide generation time

Rejected. It conflicts with the privacy-first default and is unnecessary for a
bounded in-memory demonstration.
