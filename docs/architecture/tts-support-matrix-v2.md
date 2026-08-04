# Local TTS support and integration matrix v2

## Status

Accepted on 2026-07-30 as the M010.1 Milestone 5 evaluation and integration
routing matrix, then reconciled with the completed Milestone 6 runtime
integration and passing local Milestone 7 packaged matrix. It layers new
evidence-backed profiles over the historical M010
runtime matrix without claiming that locally configured development
environments are packaged or distributed.

`supported` means currently implemented and validated in the application on
representative hardware, with compatibility determined by the profile's
published host and runtime requirements rather than by an exhaustive test of
every computer.
`development-only` means implemented and exact-host validated behind an
explicit developer gate, but neither automatically recommended nor presented
as production support. `deferred` and `unsupported` remain non-selectable.

## Current matrix

| Exact profile                                                                | Language            | Current state              | Next boundary                                                                                                                                           |
| ---------------------------------------------------------------------------- | ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Piper 1.4.2 / davefx / ONNX CPU                                              | Spanish             | **Supported**              | Packaged Windows x64 CPU profile; no discrete GPU requirement. M011 Milestone 7 records local/portfolio GO from automated/package evidence and representative use on the independent older 16-GB-RAM computer. |
| Piper 1.4.2 / joe / ONNX CPU                                                 | English             | **Supported**              | Packaged language-matched Windows x64 CPU profile; no discrete GPU requirement. The same requirements-based M011 GO applies. |
| Chatterbox Multilingual V3 / bundled default conditioning / CUDA bfloat16 v4 | Spanish and English | **Supported when the published gate passes** | ADR-0044 requires Windows x64/CUDA bfloat16, 5,632 MiB total and 4,668 MiB free VRAM, 24,576 MiB total and 4,096 MiB currently available RAM, and eight logical processors; the evaluated 8-GB GPU class remains recommended. Installed representative-host Spanish/English arms pass. The ordinary manifest remains withheld, so runtime support does not imply that this build exposes Download. |
| Qwen3-TTS 1.7B CustomVoice / Serena / CUDA bfloat16 v8                       | Spanish             | **Development-only**       | Keep constrained buffering and require the exact Qwen developer gate and measured host.                                                                 |
| Qwen3-TTS 1.7B CustomVoice / Aiden / CUDA bfloat16 v8                        | English             | **Development-only**       | Keep constrained buffering and require the exact Qwen developer gate and measured host.                                                                 |
| MOSS-TTS-Nano 100M ONNX / Ava                                                | Spanish and English | **Deferred, not rejected** | Future separately frozen dialogue/punctuation and voice/accent investigation.                                                                           |
| Qwen3-TTS 0.6B CustomVoice / Aiden                                           | Historical profile  | **Unsupported**            | Preserve historical rejection; do not confuse it with the implemented 1.7B Aiden v8 profile.                                                            |
| Supertonic 3 / F1                                                            | Spanish             | **Unsupported**            | Preserve historical rejection.                                                                                                                          |

## Invariants

- Run local inference only and retain generated audio only in bounded memory.
- Load at most one model process at a time.
- Replace work identity before language/profile changes and verify cleanup
  before starting the replacement.
- Never silently fail over between engines.
- Keep Qwen's slower-than-real-time profiles behind constrained buffering.
- Do not add voice cloning.
- Do not infer redistribution permission from successful local evaluation.

The historical
[`tts-support-matrix-v1.md`](tts-support-matrix-v1.md) remains the record of
M010's original runtime closeout. This v2 matrix is the current executable
M010.1 overlay. M010.1 Milestone 7's six packaged bilingual portfolio journeys pass
locally; pull request #159 passed required Ubuntu/Windows checks and merged the
plan closeout. M010.2 may reorganize presentation and playback controls but
must not change this matrix. M011 keeps Piper in the core and treats Chatterbox
as a separately gated optional package; it remains responsible for
distribution, licensing fulfillment, acquisition/removal, installers, and
production support claims. A process-lifetime verification receipt may avoid
repeating complete Chatterbox tree hashing within one application run, but it
is not persisted and does not change this support decision: every application
process must verify the exact installed authority before first use. M011's
installed representative-host Spanish/English, offline, privacy, cancellation,
and lifecycle evidence supports compatible-host Chatterbox under
[`mvp-release-authority-v2`](mvp-release-authority-v2.md). The ordinary manifest
still leaves Chatterbox Download withheld, and trusted public signing remains a
separate externally authorized release channel.
The receipt is a performance optimization, not same-user tamper protection;
full hash verification occurs when each application process first creates it.
