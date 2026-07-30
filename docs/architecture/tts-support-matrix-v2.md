# Local TTS support and integration matrix v2

## Status

Accepted on 2026-07-30 as the M010.1 Milestone 5 evaluation and integration
routing matrix. It layers new evidence-backed admissions over the historical
M010 runtime matrix without claiming that pending profiles are already
implemented or distributed.

`supported` means currently implemented and validated in the application.
`admitted-pending-integration` means Milestone 6 is authorized to implement
the exact profile. `development-only` remains an explicitly gated,
non-production path.

## Current matrix

| Exact profile                                                                | Language            | State after Milestone 5                               | Next boundary                                                                                                     |
| ---------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Piper 1.4.2 / davefx / ONNX CPU                                              | Spanish             | **Supported**                                         | Retain as the lightweight CPU fallback; M011 owns distribution obligations.                                       |
| Piper 1.4.2 / joe / ONNX CPU                                                 | English             | **Admitted pending integration**                      | Add and prove the exact English registry/service path in Milestone 6.                                             |
| Chatterbox Multilingual V3 / bundled default conditioning / CUDA bfloat16 v4 | Spanish and English | **Admitted pending integration**                      | Add one exact bilingual engine path, disclose heavy cold load/RAM, and prove both languages in Milestone 6.       |
| Qwen3-TTS 1.7B CustomVoice / Serena / CUDA bfloat16 v8                       | Spanish             | **Development-only; retained for integration update** | Keep the existing constrained-buffer engine and validate explicit Spanish selection in Milestone 6.               |
| Qwen3-TTS 1.7B CustomVoice / Aiden / CUDA bfloat16 v8                        | English             | **Admitted pending integration**                      | Reuse the existing Qwen adapter with the Aiden English profile and validate constrained buffering in Milestone 6. |
| MOSS-TTS-Nano 100M ONNX / Ava                                                | Spanish and English | **Deferred, not rejected**                            | Future separately frozen dialogue/punctuation and voice/accent investigation.                                     |
| Qwen3-TTS 0.6B CustomVoice / Aiden                                           | Historical profile  | **Unsupported**                                       | Preserve historical rejection; do not confuse it with admitted 1.7B Aiden v8.                                     |
| Supertonic 3 / F1                                                            | Spanish             | **Unsupported**                                       | Preserve historical rejection.                                                                                    |

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
M010's implemented runtime closeout. This v2 matrix becomes the current
M010.1 decision overlay; Milestone 6 must update implementation state after
exact integration validation.
