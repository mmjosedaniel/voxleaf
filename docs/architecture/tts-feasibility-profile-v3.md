# Local TTS feasibility profile v3

## Status and authority

This is the accepted evaluation authority for the Qwen3-TTS 12Hz 1.7B
CustomVoice blocker-resolution cycle. It was frozen on 2026-07-25 after the
bounded built-in-speaker intake screen selected Serena and before any
incremental/cancellation prototype result or official performance result
existed.

The identifier is `tts-feasibility-profile-v3`. The complete machine-readable
identity, hashes, gates, exclusions, and invalidation rules are in
[`profile-v3.json`](../../benchmarks/tts/profile-v3.json). That file and this
document are normative together.

This profile admits one exact candidate to the development-only prototype
gate. It does not select a production engine, supersede ADR-0013, claim general
hardware support, authorize Milestone 7, or count the one-person intake screen
as final quality approval.

The subsequently executed prototype passed its frozen stop gate on the exact
host. The historical frozen-result declaration at the end of this document
still records what was known when `v3` was accepted.

## Speaker-screen decision

The frozen
[`customvoice-spanish-screen-v2`](../../benchmarks/tts/customvoice-spanish-screen-v2.json)
tested all nine built-in speakers over three repository-authored Spanish cases
with identical generation settings and blind random order. One fluent-Spanish
intake evaluator completed every applicable score. The schema-valid
[content-safe result](../../benchmarks/tts/customvoice-spanish-screen-result-v2.json)
selected **Serena** under the predeclared eligibility and ranking rules.

Serena's intake aggregate was:

| Measure | Result |
| --- | ---: |
| Overall mean | 4.571 |
| Intelligibility | 5.000 |
| Spanish pronunciation | 4.333 |
| Punctuation/dialogue | 5.000 |
| Numeric expressions | 4.000 |
| Naturalness | 4.333 |
| Audiobook suitability | 4.667 |
| Artifact freedom | 4.667 |
| Meaning-changing defects | 0 |

The intake limitations remain explicit: one evaluator, Spanish only,
synthetic corpus only, built-in speakers only, and no production-quality
approval. The original `screen-v1` authority is historical and immutable. Its
raw audio was deleted without a scorecard or result after the evaluator
exposed missing applicable numeric scoring; the corrected `v2` authority was
committed before replacement audio.

## Exact candidate identity

The only candidate admitted by this profile is:

- candidate ID `qwen3-tts-1-7b-customvoice-cuda-bf16-v1`;
- `qwen-tts==0.1.1`;
- model `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` at revision
  `0c0e3051f131929182e2c023b9537f8b1c68adfe`;
- the two exact major artifact hashes in `profile-v3.json`;
- the isolated `qwen3_1_7b_customvoice_cuda` uv lock;
- native Windows x86-64, Python 3.12, PyTorch/Torchaudio `2.9.1+cu128`,
  CUDA, bfloat16, and SDPA;
- built-in speaker `Serena`;
- language `Spanish`;
- the exact neutral Spanish audiobook instruction in `profile-v3.json`; and
- batch one with the exact frozen sampling parameters.

Base ICL cloning, x-vector-only cloning, VoiceDesign, reference audio,
reference transcripts, clone prompts, speaker switching, instruction
switching, FlashAttention, and any different model/runtime/settings identity
are configuration mismatches.

## Execution and reliability rules

Use one resident model instance only for the complete frozen identity and one
bounded session. Consume existing `narration-v1` segments without
candidate-specific rewriting. Retain no paragraph, chapter, or unbounded
waveform collection.

The first attempt is authoritative. Automatic retries are zero. A separately
labeled diagnostic retry may investigate a failure but cannot replace an
official observation, affect a percentile, or make a gate pass.

Whisper and VAD/energy analysis are excluded from `v3`. No ASR transcript,
automatic repair, trimming, fade, silence classifier, or auxiliary dependency
may affect timing, quality, selection, or promotion.

## Pre-admission prototype stop gate

Before the full official matrix, the exact candidate topology must prove all
of the following:

1. bounded `narration-v1` segment input;
2. delivery of each valid audio unit before advancing to the next segment;
3. after-first-audio cancellation or bounded worker termination;
4. zero stale frames after cancellation or identity replacement;
5. explicit RAM, VRAM, input, output, and queue-retention bounds; and
6. verified process, memory, and raw-session cleanup after cancellation.

The public Qwen API returning a complete waveform is not incremental-streaming
evidence. Segment-at-a-time delivery may satisfy boundedness but does not by
itself satisfy mid-segment cancellation. If the prototype gate fails, stop the
candidate cycle before the full benchmark; do not lower a gate or reinterpret
complete output as streaming.

## Prototype result

The schema-valid
[`incremental-cancellation-prototype-result-v1`](../../benchmarks/tts/incremental-cancellation-prototype-result-v1.json)
records a passing exact-host result from clean implementation commit
`1cc4fd2df63d35019e9ad7747307ce0010ea4cff`.

- Two bounded complete-segment waveforms were delivered and released in
  order; peak queued segments and published units were both one.
- Every frozen cancellation race passed. Identity was invalidated before
  worker termination, zero stale units were published, all workers exited,
  and final tracked process RAM and VRAM were zero.
- Peak process-tree RAM was 4,689,559,552 bytes. The authoritative PyTorch
  peak-reserved VRAM observation was 5,440,012,288 bytes.
- Maximum worker termination was 330.301 milliseconds and maximum cleanup,
  including normal graceful cleanup, was 1.030 seconds.
- Cold load was 8.367 seconds. First complete segment audio after dispatch
  was produced in 5.210 seconds.
- No raw session or audio artifact was created or retained.

This proves a credible development topology based on immediate
complete-segment publication and bounded worker-process termination. It does
not prove native token/frame streaming, cooperative cancellation inside the
Qwen generation call, a production process protocol, or the official
3-second warm first-audio gate. Those performance and integration decisions
remain subject to the later frozen matrix.

## Inherited official evaluation

After the prototype passes, inherit the complete candidate-neutral corpus,
ordering, clocks, arithmetic, observation counts, timeouts, WDDM plus PyTorch
VRAM method, cancellation trials, privacy boundary, artifact validation,
license/packaging audit, cleanup rules, and balanced-role numeric gates from
[`tts-feasibility-profile-v2`](tts-feasibility-profile-v2.md). The exact
numeric values are repeated in `profile-v3.json` so this candidate cannot
silently inherit a later edit.

Final quality still requires at least three complete independently randomized
fluent-Spanish evaluations over the full frozen quality corpus. The intake
evaluator does not count toward that panel. Balanced quality requires overall,
intelligibility, Spanish-pronunciation, per-dimension, and zero-defect gates
from `profile-v3.json`; every gate is conjunctive.

## Offline, privacy, and cleanup

Networked model acquisition is setup only. Prototype and official execution
must use verified local paths, both offline environment controls,
`local_files_only=true`, and an outbound firewall block bound to the exact
candidate interpreter.

Narration text, generated audio, scorecards, randomization keys, raw journals,
paths, exceptions, and environment values cannot enter reviewable evidence.
Generated audio may exist only inside the bounded ignored raw session and must
be deleted after a schema-valid content-safe result is derived.

## Frozen-result declaration

At acceptance, the speaker-screen result above was known. No prototype,
performance, memory-high-water, cancellation, sustained-generation,
three-person final-quality, packaging, or production result for this exact
profile existed. Prior `v2` Qwen 0.6B/Aiden and Supertonic results remain
historical evidence for different exact profiles and cannot promote or reject
this one.

Any change listed by the machine-readable invalidation authority requires
`tts-feasibility-profile-v4` before another affected observation is accepted.
