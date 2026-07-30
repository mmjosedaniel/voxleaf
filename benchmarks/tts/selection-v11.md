# M010.1 corrective candidate-screen routing v11

## Status

Accepted on 2026-07-30 as the content-safe M010.1 Milestone 4 routing
decision.

This decision selects the next evaluation work. It does not admit a new
supported profile, change the runtime registry, or claim performance on
hardware that VoxLeaf has not measured.

## Evidence

| Exact profile | Exact-host machine evidence | Maintainer quality evidence | Routing |
| --- | --- | --- | --- |
| Qwen3-TTS 1.7B CustomVoice / Serena / Spanish | Existing v8 control: 15.887-second first-audio p95, 1.439 warm p95 RTF, 4.64 GB peak process-tree RAM, 4.83 GB peak dedicated VRAM; complete-waveform cancellation limitation | A new result-neutral private review is still required | Retain as an existing-engine, hardware-dependent constrained-buffer candidate |
| Qwen3-TTS 1.7B CustomVoice / Aiden / English | Existing v8 control: 11.947-second first-audio p95, 1.454 warm p95 RTF, 4.65 GB peak process-tree RAM, 4.79 GB peak dedicated VRAM; complete-waveform cancellation limitation | A new result-neutral private review is still required | Retain as an existing-engine, hardware-dependent constrained-buffer candidate |
| MOSS-TTS-Nano 100M ONNX / Ava / bilingual | 10/10 generations and 8/8 cancellation trials passed; Spanish 5.065-second first-audio p95 and 0.496 warm p95 RTF; English 3.905-second first-audio p95 and 0.425 warm p95 RTF; 1.92 GB peak process-tree RAM and zero VRAM | Means: intelligibility 5.0, naturalness 4.4, prosody 4.5, pronunciation 5.0, language stability 5.0, usefulness 5.0. The maintainer later identified dialogue-tail omission in both languages and did not prefer the accent. | Defer without rejection pending dialogue/punctuation investigation |
| Chatterbox Multilingual V3 / bundled default conditioning / bilingual | 10/10 generations and 8/8 cancellation trials passed; Spanish 3.923-second first-audio p95 and 0.646 warm p95 RTF; English 4.227-second first-audio p95 and 0.650 warm p95 RTF; 5.24 GB peak process-tree RAM and 3.77 GB peak dedicated VRAM | Means: intelligibility 5.0, naturalness 5.0, prosody 4.7, pronunciation 4.3, language stability 5.0, usefulness 5.0; zero marked meaning defects or wrong-language outputs. The maintainer described the voice as very good, with cross-language accent limitations. | Advance as the sole new-engine full-matrix survivor |

The MOSS scorecard recorded zero meaning-changing defects. The later
maintainer observation is not retroactively written into that immutable
scorecard: the output remained understandable, but the dialogue case omitted
the text after the opening question in both languages. That reproducible
coverage concern controls the deferral.

## Decision

- Advance exact Chatterbox profile
  `chatterbox-multilingual-v3-cuda-bf16-default-v4` to the next frozen full
  bilingual matrix. It is not yet admitted or supported.
- Defer exact MOSS profile `moss-tts-nano-100m-onnx-cpu-ava-v2`. Do not reject
  it. A later authority may investigate dialogue punctuation, complete-sentence
  coverage, and alternative voice/accent choices before another product
  decision.
- Retain exact Qwen/Serena Spanish and Qwen/Aiden English as independent
  existing-engine candidates for the constrained buffered path. Their
  approximately 1.44 RTF on this laptop is capacity evidence, not a rejection
  gate. A more capable compatible GPU may improve performance, but VoxLeaf
  must measure that host rather than extrapolate support.
- Qwen does not consume the one-new-engine allowance because its engine and
  Serena development path already exist in VoxLeaf. Serena and Aiden still
  require independent language-specific quality decisions before their
  M010.1 runtime availability can change.
- Preserve the one-loaded-model, bounded-buffer, identity-first cancellation,
  local-only inference, and no-generated-audio-persistence constraints.
- Do not add voice cloning. The evaluated Chatterbox path uses only its bundled
  default conditioning.
- Do not add a model-specific speaking-speed control. The evaluated
  Chatterbox API has no native rate parameter, and VoxLeaf's product playback
  rate remains 1.0x until a separate engine-neutral, pitch-preserving design is
  approved.

## Privacy and retention

The two downloaded evaluator scorecards, blinded maps, generated waveforms,
and complete ignored v9/v11 raw sessions were validated and then deleted.
Only the schema-valid content-safe
[`moss-bilingual-screen-result-v9.json`](moss-bilingual-screen-result-v9.json)
and
[`chatterbox-bilingual-screen-result-v11.json`](chatterbox-bilingual-screen-result-v11.json)
remain.

## Next authority boundary

Before generating more result-bearing audio, Milestone 5 must freeze a new
numbered authority that:

1. runs the complete bilingual Chatterbox matrix without changing the v11
   screen evidence;
2. collects independent result-neutral private quality evidence for
   Qwen/Serena Spanish and Qwen/Aiden English;
3. reports Qwen's measured RTF as constrained-buffer capacity evidence rather
   than an automatic rejection;
4. preserves separate voice/language decisions; and
5. asks the maintainer before admitting, deferring, or rejecting any exact
   profile.
