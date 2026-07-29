# ADR-0023: Final M010 support and recovery decision

## Status

Accepted on 2026-07-29.

## Context

M010 froze result-blind host matching and recovery authority, evaluated an
additional CPU candidate, integrated admitted profiles through one supervised
service tree, and ran deterministic and exact-host resilience validation. The
repository now needs one durable product-level statement that distinguishes
support from development evidence and from future installer distribution.

The historical benchmark authorities, result records, ADR-0013, ADR-0015,
ADR-0019, ADR-0020, and ADR-0022 remain immutable evidence. Editing one of
those records after results would weaken its authority.

## Decision

Accept
[`tts-support-matrix-v1.md`](../tts-support-matrix-v1.md) as the final M010
product support matrix.

- Exact Piper 1.4.2 / ONNX Runtime CPU / `es_ES-davefx-medium` is the sole
  `supported` CPU fallback and the only profile VoxLeaf may recommend
  automatically when host compatibility and native runtime configuration
  pass.
- “Fallback” is a measured role and explicit user choice. VoxLeaf performs no
  automatic engine failover.
- Exact Qwen3-TTS 1.7B CustomVoice / Serena remains `development-only`, behind
  its native gate, exact isolated runtime, and frozen host margins. It is not
  recommended automatically and does not establish standard, production,
  real-time, uninterrupted, or general-hardware support.
- Qwen3-TTS 0.6B CustomVoice / Aiden and Supertonic 3 / F1 remain
  `unsupported` and unselectable.
- VoxLeaf still has no supported standard GPU profile.
- Operational recovery remains identity-first, cleanup-verified, explicit,
  limited to one admitted action per episode, and free of automatic retry,
  concurrent fallback, stale-audio reuse, or a second service tree.
- M011 owns runtime/model distribution, installer creation, signing, updates,
  and fulfillment of Piper GPL-3.0-or-later, bundled-phonemizer, CC0 voice
  provenance, source/offer, and notice obligations. M010 technical support is
  not a claim that a distributable installer already exists.

This ADR records the resulting support status. It does not modify any frozen
evaluation value, shared contract, protocol version, buffer policy, narration
text, persistence shape, or model generation configuration.

## Consequences

The MVP can proceed to packaging with a measured CPU path that is faster than
real time on the reference host. Users retain an explicit engine choice, and
incompatible or unconfigured profiles fail before child start.

Naturalness remains a known tradeoff: the admitted Piper voice is
speed-focused, while the higher-quality Qwen development path remains slower
than real time and does not pass complete resilience. Future engines or voices
require a new frozen evaluation rather than an unsupported registry edit.

Release work must carry a larger compliance and distribution burden for Piper.
If M011 cannot fulfill that boundary, it must not ship Piper and must revise
the release decision explicitly; it may not silently claim support through
development-only Qwen.

## Alternatives considered

- **Promote Qwen/Serena to supported.** Rejected because its frozen standard
  and integrated depletion evidence still fail required gates.
- **Treat Piper as an automatic failover.** Rejected because switching engines
  without explicit identity-first replacement and user-visible policy could
  duplicate work, replay stale audio, or hide failure.
- **Keep all profiles unsupported until installers exist.** Rejected because
  support admission and distribution are separate gates. Piper's technical
  product path is implemented and validated, while this ADR keeps M011's
  distribution obligations explicit.
- **Edit ADR-0020 or prior selection records.** Rejected because those files
  are frozen historical evidence and their byte identity is enforced.
