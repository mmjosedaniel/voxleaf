# Local bilingual TTS evaluation profile v7

## Status and authority

This is the result-blind M010.1 authority. The normative machine-readable
files are:

- [`profile-v7.json`](../../benchmarks/tts/profile-v7.json);
- [`candidates-v7.json`](../../benchmarks/tts/candidates-v7.json);
- [`corpus-v7.json`](../../benchmarks/tts/corpus-v7.json);
- [`normalization-corpus-v2.json`](../../benchmarks/tts/normalization-corpus-v2.json);
- the private raw
  [`bilingual-raw-v7`](../../benchmarks/tts/schemas/bilingual-raw-v7.schema.json)
  schema; and
- the content-safe
  [`bilingual-summary-v7`](../../benchmarks/tts/schemas/bilingual-summary-v7.schema.json)
  schema.

They are committed before any v7 waveform, private evaluator form, machine
observation, or selection result. Every result must name this authority commit
and a strict descendant execution commit.

## Exact intake decisions

### Piper English baseline

Piper 1.4.2 / `en_US-joe-medium` / ONNX Runtime CPU is admitted to the
separate English baseline evaluation. The exact voice repository revision,
model/config/card SHA-256 digests, reused isolated lock, CC0 dataset
provenance, 22,050-Hz mono output, generation settings, and GPL packaging
boundary are frozen in the candidate manifest.

This is not evidence inherited from Piper Spanish. English quality,
pronunciation, performance, and exact profile support must pass independently.

### Chatterbox Multilingual V3

Chatterbox 0.1.7 with exact Multilingual V3 weights and the official bundled
`conds.pt` conditioning is admitted to the first bounded screen. No personal
reference audio is used. The screen uses explicit `es` or `en`, the exact
locked environment, the PerTh watermark, and the frozen upstream generation
settings.

The upstream artifact is MIT-licensed, but it does not publish a human
identity for the bundled conditioning. Evaluation may describe it only as the
official bundled default; no identity or release-provenance claim is allowed.
M011 must review notices and watermark behavior if it survives.

### MOSS-TTS-Nano 100M ONNX

MOSS-TTS-Nano 100M plus MOSS-Audio-Tokenizer-Nano ONNX CPU is admitted to the
second bounded screen with the official built-in `Ava` audio-token preset.
The exact source, TTS, codec, manifest, major artifact, dependency-lock,
48-kHz stereo, CPU-thread, sampling, and normalization-disable identities are
frozen.

The official repositories are Apache-2.0 and describe the preset as built in,
but do not publish a human identity. The evaluation makes no identity claim.
Any later distribution requires an M011 notice and provenance review.

### Fun-CosyVoice3

The exact conditional Fun-CosyVoice3 intake is rejected before environment
locking or execution. Its documented general zero-shot path requires
reference audio, and this intake did not establish an exact redistributable
non-personal default voice. V7 forbids personal reference audio, voice
enrollment, or manufacturing a substitute after authority.

## Execution and stop policy

Acquisition is an explicit networked setup step. Result-bearing execution uses
verified local artifacts, disables runtime downloads, and binds an outbound
firewall block to the exact candidate interpreter. One model is loaded at a
time. Automatic retries, profile switching within a session, reference audio,
and concurrent model processes are forbidden.

Piper English runs first as the baseline. Chatterbox then receives the first
new-engine screen and MOSS the second. A candidate stops immediately on a
licensing/provenance failure, mandatory network use, host preflight failure,
load failure, invalid audio, wrong-language output, hallucination, repetition,
meaning change, first-attempt failure, unsafe memory, cancellation/cleanup
failure, or privacy failure.

At most one new-engine survivor may receive the full bilingual matrix. No
survivor is a valid outcome.

## Performance, cancellation, and quality gates

All gates in `profile-v7.json` are conjunctive. The complete evaluation keeps
the established zero-first-attempt-failure policy, 30-second cold-load p95,
7-second first-audio p95, 1.10 warm/sustained p95 RTF, 1.08 total sustained
RTF, 512-MiB GPU reserve, 4-GiB CPU model-tree RAM ceiling, and 4-GiB available
system RAM floor.

Each evaluated language runs the four frozen cancellation races. Identity is
invalidated first; no stale unit may be published or played; cleanup must
leave zero worker processes.

One fluent evaluator per evaluated language reviews blinded randomized
synthetic samples. Overall, intelligibility, and naturalness means must each
be at least 3.25; every rubric dimension must be at least 2.75; meaning-changing
defects and wrong-language outputs must be zero. A missing fluent evaluator
blocks that language; machine metrics cannot substitute.

## Privacy and repository boundary

Only bounded content-free summaries may be committed. Source/narration text,
canaries, waveforms, weights, environments, raw forms, evaluator identity,
private paths, commands, environment values, raw errors, and private host
identity stay outside Git. Raw sessions and generated audio are deleted after
safe derivation.

The authority validators verify byte hashes, closed candidate and corpus
identity, JSON Schemas, content safety, exact authority commit, and strict Git
ancestry. A result that predates or diverges from the authority fails closed.
