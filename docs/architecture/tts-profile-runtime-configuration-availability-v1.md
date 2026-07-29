# TTS profile runtime-configuration availability v1

## Status

Accepted on 2026-07-29 as the corrective, result-blind authority for checking
whether an otherwise compatible local narration profile is actually configured
before VoxLeaf enables product playback. It was frozen after the Piper startup
failure was classified with content-free state and before implementation.

This authority does not change hardware matching, profile support state, Qwen
VRAM admission, model identity, protocol v1, narration text, audio buffering,
or recovery limits.

## Reproduced discrepancy

The compatibility surface could truthfully establish that the exact
Piper/davefx profile matched the host while the process had not inherited its
three native-only runtime variables. It then described Piper as compatible and
enabled Play. Native service start failed before handshake with the fixed
content-free state:

- product failure `tts-service-failed`;
- recovery code `model-load-failed`;
- service state `stopped`; and
- zero playable audio.

The exact offline Piper lifecycle passes when the same interpreter and model
root are configured, so the discrepancy is configuration admission before
child start, not EPUB text, segmentation, model quality, or hardware
compatibility.

## Accepted boundary

Hardware compatibility and executable runtime configuration remain separate
facts:

- hardware compatibility continues to report whether the immutable measured
  profile fits the privacy-safe host report;
- product narration availability additionally requires a native affirmative
  configuration result for the selected exact profile; and
- a profile may therefore be hardware-compatible while product narration is
  unavailable because its local runtime is not configured.

The native boundary accepts one closed profile identifier and returns only a
boolean. It may validate the existing environment gate, exact interpreter,
candidate lock, service dependencies, and absolute model-root directory using
the same `ExactRuntime` construction used immediately before child start. It
must not return environment values, paths, raw errors, host identity, model
contents, book text, or dynamic diagnostics.

The desktop checks this boolean:

1. during selected-profile availability resolution; and
2. again immediately before starting the service child.

If configuration is unavailable, product narration remains unavailable, Play
is disabled, and no child, generation identity, recovery episode, or audio
owner is created. The existing compatibility recheck may repeat the bounded
check. A positive result is not a model-load guarantee: the existing
identity-first containment remains authoritative for later load, warm,
synthesis, protocol, or playback failures.

## Validation

Corrective implementation must prove:

- unknown profile identifiers fail closed;
- missing or invalid Piper configuration returns only `false`;
- valid exact Piper configuration returns only `true`;
- the typed desktop client sends only the selected bounded profile ID;
- product availability remains unavailable and starts no child when hardware
  matches but configuration does not;
- configuration is rechecked before child start;
- configured Piper still passes its exact offline lifecycle and packaged
  product path; and
- portable, native, privacy, and generated-artifact validation remain green.
