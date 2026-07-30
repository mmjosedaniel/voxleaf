# ADR-0034: Retain fixed speed after playback-backend evaluation

Status: Accepted
Date: 2026-07-30

## Context

ADR-0033 froze two eligible pitch-preserving playback candidates, one
pitch-changing negative control, deterministic inputs, required Chromium and
packaged WebView2 hosts, and machine/listening gates before implementation.
It also required VoxLeaf to retain `1.00x` if neither eligible candidate
passed every gate.

M010.2 Milestone 2 evaluated the candidates with generated 24-kHz mono
synthetic PCM only. It changed no TTS request, narration text, model output,
protocol, generated-audio persistence, or native capability.

## Decision

Do not select a pitch-preserving backend from the frozen comparison. Retain
the current `1.00x` Web Audio player and do not expose non-default playback
rates.

Repository AudioWorklet WSOLA preserved pitch and source-frame accounting in
Chromium and packaged WebView2, but exceeded the frozen 20-percentage-point CPU
limit by a large margin. The packaged run measured approximately 114.279
additional CPU percentage points. The smaller Chromium RAM overage was not
used to justify changing the frozen resource gates.

`HTMLMediaElement.preservesPitch` passed Chromium signal, lifecycle, and
resource gates. Packaged WebView2 exposed the property but could not play its
in-memory `blob:` WAV under the unchanged Tauri CSP. Adding `blob:` to
`media-src` would widen the frozen security boundary and was not authorized.
PCM16 adaptation produced the same closed rejection, so float32 WAV encoding
was not the cause.

The direct `AudioBufferSourceNode.playbackRate` control shifted pitch and
remains rejected. No eligible candidate reached the listening gate.

All experimental implementation artifacts were removed after measurement.
No production dependency was added, so there is no new package lock, license,
or M011 distribution obligation.

## Consequences

M010.2 Milestones 3-4 may still implement bounded preferences, English
fallback, the reader-first shell, and Settings because those changes do not
depend on a time stretcher. Milestone 5 cannot implement the frozen
eleven-speed feature, and Milestone 6 cannot close the full original plan,
without an explicit maintainer decision.

The next decision must choose one of these paths:

1. reduce M010.2 to the reader/Settings work and keep `1.00x`; or
2. create new result-blind authority for a different reviewed backend or a
   narrowly justified CSP change.

Neither path may reinterpret the Milestone 2 evidence or silently relax its
frozen gates.

## Alternatives considered

- Relaxing the CPU or RAM gate after observing WSOLA was rejected because the
  gate was frozen specifically to prevent result-driven acceptance.
- Adding `blob:` to packaged `media-src` during the experiment was rejected
  because the authority required validation without widening capabilities.
- Enabling direct playback-rate control was rejected because its 1,200-cent
  pitch shift violates the product requirement.
- Running listening evaluation despite a failed machine/host gate was
  rejected because listening is conditional on machine admission.
