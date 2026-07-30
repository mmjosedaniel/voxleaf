# Local TTS support and integration matrix v2

## Status

Accepted on 2026-07-30 as the M010.1 Milestone 5 evaluation and integration
routing matrix, then reconciled with the completed Milestone 6 runtime
integration and passing local Milestone 7 packaged matrix. It layers new
evidence-backed profiles over the historical M010
runtime matrix without claiming that locally configured development
environments are packaged or distributed.

`supported` means currently implemented and validated in the application.
`development-only` means implemented and exact-host validated behind an
explicit developer gate, but neither automatically recommended nor presented
as production support. `deferred` and `unsupported` remain non-selectable.

## Current matrix

| Exact profile                                                                | Language            | Current state              | Next boundary                                                                                                 |
| ---------------------------------------------------------------------------- | ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Piper 1.4.2 / davefx / ONNX CPU                                              | Spanish             | **Supported**              | Retain as a lightweight CPU profile; M011 owns packaging and distribution obligations.                        |
| Piper 1.4.2 / joe / ONNX CPU                                                 | English             | **Supported**              | Retain as the language-matched lightweight CPU profile; M011 owns packaging and distribution obligations.     |
| Chatterbox Multilingual V3 / bundled default conditioning / CUDA bfloat16 v4 | Spanish and English | **Supported**              | Nominal 8-GB GPU class (7,680 MiB DXGI floor), at least 6,144 MiB free; disclose measured cold-load/RAM cost. |
| Qwen3-TTS 1.7B CustomVoice / Serena / CUDA bfloat16 v8                       | Spanish             | **Development-only**       | Keep constrained buffering and require the exact Qwen developer gate and measured host.                       |
| Qwen3-TTS 1.7B CustomVoice / Aiden / CUDA bfloat16 v8                        | English             | **Development-only**       | Keep constrained buffering and require the exact Qwen developer gate and measured host.                       |
| MOSS-TTS-Nano 100M ONNX / Ava                                                | Spanish and English | **Deferred, not rejected** | Future separately frozen dialogue/punctuation and voice/accent investigation.                                 |
| Qwen3-TTS 0.6B CustomVoice / Aiden                                           | Historical profile  | **Unsupported**            | Preserve historical rejection; do not confuse it with the implemented 1.7B Aiden v8 profile.                  |
| Supertonic 3 / F1                                                            | Spanish             | **Unsupported**            | Preserve historical rejection.                                                                                |

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
M010.1 overlay. Milestone 7's six packaged bilingual portfolio journeys pass
locally; required pull-request checks still gate plan archival. M011 remains
responsible for distribution, licensing fulfillment, installers, and
production support claims.
