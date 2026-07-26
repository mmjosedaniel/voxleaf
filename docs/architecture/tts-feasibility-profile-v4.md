# Local TTS short-segment batch profile v4

## Status and authority

This is the accepted pre-result authority for Milestone 6.2's development-only
short-segment/shared-model batch experiment. It was frozen on 2026-07-26
before the v4 runner, pilot, official hardware result, listening result, or
selection record existed.

The normative machine-readable authority is
[`profile-v4.json`](../../benchmarks/tts/profile-v4.json). Its byte identity
binds the candidate, corpus, schemas, exact host, two placement profiles,
execution order, memory stop, gates, privacy rules, and invalidation policy.
[`corpus-v4.json`](../../benchmarks/tts/corpus-v4.json) freezes the only
permitted synthetic input, normalized narration text, unit order, and pairing.

This profile does not change failed `profile-v3`, ADR-0013, or ADR-0014. It
does not select a production engine, implement playback, authorize a CPU
fallback, or claim continuous narration or general hardware support.

## Exact candidate and inputs

Both batch sizes reuse the exact v3 candidate:

- `qwen-tts==0.1.1`;
- Qwen3-TTS 12Hz 1.7B CustomVoice at revision
  `0c0e3051f131929182e2c023b9537f8b1c68adfe`;
- the two frozen artifact hashes totaling 4,515,695,644 bytes;
- Serena, Spanish, and the unchanged neutral audiobook instruction;
- PyTorch and Torchaudio `2.9.1+cu128`, CUDA, bfloat16, and SDPA; and
- the unchanged sampling settings and zero-retry, first-attempt policy.

The corpus contains eight repository-authored Spanish semantic units in four
fixed consecutive pairs. It binds the implemented `narration-v1`
normalization documentation and code by hash. Three cases exercise accepted
number, percentage, currency, date, time, ampersand, and temperature
expansions. Only each unit's frozen `narrationText` reaches the candidate.
Observed audio duration cannot rewrite, replace, reorder, or re-pair an
official input.

## Placement profiles and memory stop

`qwen3-serena-v4-full-gpu` is always evaluated first. The model and speech
tokenizer remain on `cuda:0`.

`qwen3-serena-v4-speech-tokenizer-cpu` is a separate conditional identity. It
may run only after batch-two full-GPU execution records one of the four frozen
memory stop codes. It loads the exact model on CUDA, moves only
`model.speech_tokenizer.model` to CPU, updates the tokenizer wrapper device,
and releases unused CUDA cache. All other model parameters must remain on
CUDA; disk/meta placement, implicit fallback, an offload directory, and shared
GPU memory are forbidden. A speed, standard-gate, or quality failure does not
admit this arm.

The accepted v3 preflight had 8,174,698,496 free VRAM. V4 reserves
536,870,912 bytes and therefore caps its engineering peak at
7,637,827,584 bytes. It also requires at least 536,870,912 bytes of observed
free dedicated VRAM and zero shared-GPU-memory use. The existing standard
balanced gate remains the stricter 6,442,450,944-byte peak. Crossing either
engineering safety boundary, using shared memory, or encountering CUDA OOM
stops full-GPU work before conditional CPU admission is considered.

## Execution and playback simulation

One model remains resident per placement identity. One excluded warm-up uses
the first pair as two batch-one calls and one batch-two call. Each placement
then runs three predeclared passes with alternating batch order. The measured
matrix contains exactly:

- 24 batch-one calls and 24 batch-one units;
- 12 batch-two calls and 24 batch-two units;
- at least 180 seconds of valid media per batch size; and
- five ordered cancellation trials.

The same candidate, corpus, pair order, generation settings, first attempts,
clock, timeouts, and memory sampling apply to both batch sizes. A missing
unit, swapped result, hidden retry, changed pair, or stale identity invalidates
the result.

The content-free playback simulation consumes the first-attempt completion
timeline in source order. It starts at approximately 15 seconds of playable
audio, or only when a shorter remaining range is complete. It retains at most
one active batch, two queued complete units, and 40 playable seconds. It
records startup, depth, underruns, buffering, retained work, and stale output;
it neither persists nor concatenates waveform containers.

## Separate conclusions

The final result must report three non-substitutable conclusions:

1. **Standard viability** applies the unchanged balanced machine gates,
   including warm first audio at most 3 seconds, 15 seconds of media at most
   12 seconds (or shorter completion at most 5 seconds), request RTF at most
   0.8, total sustained RTF at most 0.75, standard memory ceilings, zero
   first-attempt failures, and every safety/cancellation/audit gate.
2. **Scheduling sustainability** additionally requires batch-two aggregate
   RTF strictly below 1.0, 8–20-second units, at least 180 seconds of media,
   no missing/reordered/stale units, and at most 5 seconds of buffering per
   media minute.
3. **Constrained-demo usefulness** requires scheduling sustainability plus
   the frozen one-maintainer Spanish quality gates.

Every conclusion is conjunctive. An average, retry, later quality waiver, or
result from the other placement profile cannot rescue a failed gate. A
scheduling pass does not promote or rewrite failed v3, hide preparation delay,
or authorize production selection.

## Quality, privacy, and result authority

Quality is admitted only after a valid scheduling-machine result with no
safety, ordering, privacy, or cleanup failure. One fluent Spanish maintainer
scores randomized output for intelligibility, number/symbol normalization,
join boundaries, prosody, and accent. This focused MVP review is not the v3
three-person panel.

The private raw and content-safe summary schemas are closed and reject unknown
fields. Reviewable evidence has no narration text, canary, audio, waveform,
model/user path, command line, environment value, exception, scorecard,
randomization key, or private identity. An official result must name a clean
execution commit whose recorded authority commit is a strict ancestor. The
raw journal, audio, scorecard, and randomization key are deleted only after a
schema-valid safe summary is derived.

The model-free validator in
`services/tts/benchmarks/v4_authority.py` verifies the byte-frozen authority,
corpus arithmetic and pairing, placement identities, memory boundary,
conjunctive gates, raw ordering, first-attempt accounting, conditional CPU
admission, schema closure, and privacy exclusions without importing Qwen or
requiring a GPU.
