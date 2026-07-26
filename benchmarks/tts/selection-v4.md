# Local TTS short-segment batch selection v4

## Status

Accepted on 2026-07-26 as the content-safe Milestone 6.2 `v4` decision
record.

Neither `qwen3-serena-v4-full-gpu` nor
`qwen3-serena-v4-speech-tokenizer-cpu` is selected as a passing standard,
sustainable-scheduling, or constrained-demo profile.

This record applies the conjunctive rules in the frozen
[`tts-feasibility-profile-v4`](../../docs/architecture/tts-feasibility-profile-v4.md)
and machine-readable [`profile-v4.json`](profile-v4.json) to the two committed,
schema-valid content-safe results:

- [`short-segment-batch-result-v4.json`](short-segment-batch-result-v4.json),
  SHA-256
  `9ce8141fa5987878ab29bf472f6f16dc3a6370dd4ffcc1141b30964914c62e32`;
  and
- [`short-segment-batch-result-v4-cpu.json`](short-segment-batch-result-v4-cpu.json),
  SHA-256
  `d3766ae87bdebc806210d04d974081b6f79f976bf9793a184c4d021273f85234`.

The private raw journals and generated media were removed after those safe
summaries were derived.

## Exact evaluated identities

Both results apply only to the frozen Qwen3-TTS 12Hz 1.7B
CustomVoice/Serena candidate, model revision, artifacts, runtime, instruction,
generation settings, corpus, reference host, offline controls, and
first-attempt-only policy in `profile-v4.json`.

The full-GPU identity loaded the complete candidate on `cuda:0`. The
targeted-component identity also loaded the complete candidate on CUDA first,
then moved only `model.speech_tokenizer.model` and its wrapper device to CPU.
It is not a complete CPU-only Qwen worker, a CPU fallback, generic model
offload, or a second independent producer.

The observations are exact-host development evidence. They establish no
general hardware requirement or support claim.

## Machine evidence

| Observation | Full GPU | Targeted speech-tokenizer CPU |
| --- | ---: | ---: |
| Cold-load p95 | 9.6984155 s | 9.8610702 s |
| Measured first attempts | 36 | 36 |
| Failed or timed-out first attempts | 36 | 36 |
| Peak process-tree RAM | 4,633,399,296 bytes | 4,591,538,176 bytes |
| Peak authoritative VRAM | 4,432,904,192 bytes | 4,432,904,192 bytes |
| Peak framework-reserved VRAM | 4,311,744,512 bytes | 4,311,744,512 bytes |
| Minimum free dedicated VRAM | 3,757,047,808 bytes | 3,757,047,808 bytes |
| Peak shared GPU memory | 79,691,776 bytes | 79,691,776 bytes |
| Usable measured media | unavailable | unavailable |
| Aggregate RTF | unavailable | unavailable |
| Playback simulation | unavailable | unavailable |
| Quality review | not admitted | not admitted |

Both arms stopped on the frozen `shared-gpu-memory` safety rule before usable
media. Zero-valued aggregate, playback, and duration fields in the closed
summaries represent the absence of admitted media; they are not zero-time or
zero-RTF performance measurements.

The targeted-component result reproduced the full-GPU VRAM and shared-memory
observations. It therefore proves neither a capacity reduction nor a
throughput improvement.

## Separate conclusions

### Standard viability

**Fail for both placement identities.**

Both results fail the frozen zero-first-attempt-failure, required-audit,
cancellation, and startup-media gates. Cold load and the recorded numerical
RAM/VRAM values cannot rescue those failures.

### Scheduling sustainability

**Fail for both placement identities.**

Neither result contains valid unit durations, minimum measured media,
aggregate RTF, ordered playback, underrun, or cancellation-under-generation
evidence. A sustainable result cannot be inferred from a safe stop, a
zero-valued placeholder, or historical `v3` measurements.

### Constrained-demo usefulness

**Not evaluated for both placement identities.**

The frozen quality workflow was not admitted because no valid scheduling
machine result or reviewable audio exists. No quality score or audible
judgment is inferred.

ADR-0014's separate permission for the exact batch-one `v3` Serena identity
remains the only accepted constrained development-demo exception. This `v4`
decision neither removes nor expands it.

## Decision and follow-up

- Select neither `v4` placement.
- Do not run the unadmitted `v4` playback or listening milestone.
- Do not treat targeted component placement as evidence for a complete
  CPU-only worker.
- Preserve every `v4` authority, schema, result, and conclusion unchanged.
- Evaluate the independent GPU-primary/CPU-support hypothesis only under a
  separately versioned, result-blind `v5` authority frozen before any new
  waveform is generated or heard.
- Keep production Milestone 7 blocked. No production dependency, transport,
  player, installer payload, CPU fallback, or continuous-playback claim is
  selected by this record.

