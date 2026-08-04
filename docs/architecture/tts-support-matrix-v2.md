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

| Exact profile                                                                | Language            | Current state              | Next boundary                                                                                                                                           |
| ---------------------------------------------------------------------------- | ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Piper 1.4.2 / davefx / ONNX CPU                                              | Spanish             | **Supported**              | Retain as a lightweight CPU profile. The packaged runtime exists, but M011 Milestone 7 records portfolio-release NO-GO pending formal corrected clean-host evidence for the exact installer hash. |
| Piper 1.4.2 / joe / ONNX CPU                                                 | English             | **Supported**              | Retain as the language-matched lightweight CPU profile. The packaged runtime exists, but the same M011 clean-host release gate remains. |
| Chatterbox Multilingual V3 / bundled default conditioning / CUDA bfloat16 v4 | Spanish and English | **Supported**              | Runtime support is not download availability. ADR-0044 requires 5,632 MiB total and 4,668 MiB free VRAM and recommends the evaluated 8-GB class. Installed development-host Spanish and English arms pass; M011 Milestone 7 records optional-release NO-GO and keeps the manifest withheld pending clean-host acquisition, restart, removal/reinstall, and Piper-after-removal. |
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
as a separate optional-download release gate; it remains responsible for
distribution, licensing fulfillment, acquisition/removal, installers, and
production support claims. A process-lifetime verification receipt may avoid
repeating complete Chatterbox tree hashing within one application run, but it
is not persisted and does not change this support decision: every application
process must verify the exact installed authority before first use. M011 has
development-host English narration evidence but still requires clean-host
acquisition and offline bilingual narration, restart, removal/reinstall,
Piper-after-removal, and public-signing evidence. Its Milestone 7 decision
therefore leaves Chatterbox withheld and records no end-user download claim.
The receipt is a performance optimization, not same-user tamper protection;
full hash verification occurs when each application process first creates it.
