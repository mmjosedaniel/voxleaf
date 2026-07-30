# M010.1 corrective full-evaluation selection v12

## Status

Accepted on 2026-07-30 as the content-safe M010.1 Milestone 5 profile
admission decision.

This decision authorizes Milestone 6 integration. It does not claim that the
new profiles are already selectable, distributed, or generally supported.

## Evidence

| Exact profile                                                                                                                 | Machine evidence                                                                                                                                                                                                                                                                                             | Maintainer quality evidence                                                                                                                                                                                                                  | Decision                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Chatterbox Multilingual V3 / bundled default conditioning / CUDA bfloat16 (`chatterbox-multilingual-v3-cuda-bf16-default-v4`) | Complete bilingual matrix: 5/5 cold loads, 20/20 warm attempts, 30/30 sustained attempts, and 8/8 cancellation trials. Spanish total sustained RTF 0.523 and English 0.537. Peak process-tree RAM 4.88 GiB and peak dedicated VRAM 3.56 GiB. Offline, privacy, bounded-retention, and cleanup audits passed. | Spanish means: intelligibility 5.0, naturalness 4.0, prosody 4.2, pronunciation 4.4, language stability 4.6, usefulness 5.0. English means: 5.0, 4.2, 4.0, 4.8, 5.0, and 5.0. Zero meaning-changing defects and zero wrong-language outputs. | Admit the exact profile for both Spanish and English integration.                                                                     |
| Qwen3-TTS 1.7B CustomVoice / Serena / Spanish (`qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8`)                           | Preserved v8 capacity evidence: 15.887-second first-audio p95, 1.439 warm p95 RTF, 4.64 GB peak process-tree RAM, and 4.83 GB peak dedicated VRAM. Complete-waveform cancellation remains a limitation.                                                                                                      | Means: intelligibility 4.8, naturalness 4.6, prosody 4.4, pronunciation 4.6, language stability 4.8, usefulness 4.8. Zero meaning-changing defects and zero wrong-language outputs.                                                          | Retain the existing Spanish configuration as a selectable hardware-dependent constrained-buffer profile after Milestone 6 validation. |
| Qwen3-TTS 1.7B CustomVoice / Aiden / English (`qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8`)                             | Preserved v8 capacity evidence: 11.947-second first-audio p95, 1.454 warm p95 RTF, 4.65 GB peak process-tree RAM, and 4.79 GB peak dedicated VRAM. Complete-waveform cancellation remains a limitation.                                                                                                      | Every dimension mean is 5.0. Zero meaning-changing defects and zero wrong-language outputs. The maintainer described the voice as “really good.”                                                                                             | Admit Aiden as the English configuration of the existing Qwen engine for hardware-dependent constrained-buffer integration.           |

Chatterbox exceeded the preferred 30-second cold-load target and preferred
4-GiB process-tree RAM target. Those are explicit startup and host-fit
limitations, not failures under the frozen corrective authority. Once loaded,
its bilingual sustained generation remained faster than real time on the
measured host.

## Decision

- Integrate exact Chatterbox v4 in both Spanish and English. It consumes the
  one-new-engine allowance.
- Keep one Chatterbox model loaded at a time and select the requested language
  through the existing engine-neutral bilingual boundary.
- Retain Qwen/Serena for Spanish and add Qwen/Aiden for English through the
  existing Qwen engine. Aiden is a profile/voice/language configuration, not a
  second engine implementation.
- Keep both Qwen profiles hardware-dependent and behind the accepted bounded
  constrained-buffer behavior. Their approximately 1.44 RTF on this laptop is
  not an automatic rejection and is not a general-hardware claim.
- Keep Piper/davefx Spanish and the admitted Piper/joe English profile as the
  lightweight CPU paths. Piper remains the only currently supported runtime
  until Milestone 6 integrates and validates the additional profiles.
- Reject none of the v12 profiles. MOSS remains deferred without rejection
  under `selection-v11.md`.
- Do not add voice cloning, automatic engine failover, generated-audio
  persistence, or concurrent loaded model processes.

## Privacy and retention

The three downloaded scorecards, 20 generated waveforms, blinded maps, and all
v12 raw session files were schema-validated and deleted. Only these
content-safe summaries remain:

- [`chatterbox-bilingual-full-result-v12.json`](chatterbox-bilingual-full-result-v12.json)
- [`qwen-serena-spanish-quality-result-v12.json`](qwen-serena-spanish-quality-result-v12.json)
- [`qwen-aiden-english-quality-result-v12.json`](qwen-aiden-english-quality-result-v12.json)

## Integration boundary

Milestone 6 must add exact registry entries, native configuration gates,
profile/language routing, recovery mapping, deterministic tests, exact-host
proof, and identity-first cleanup before any newly admitted profile is called
runtime-supported. M011 still owns model/runtime/voice distribution,
third-party notices, installer size, signing, and final release validation.
