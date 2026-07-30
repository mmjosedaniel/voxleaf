# Local corrective bilingual TTS evaluation profile v12

## Status

Frozen before v12 implementation and result-bearing execution on 2026-07-30.

## Purpose

V12 is the corrective full-evaluation authority selected by M010.1 Milestone 5. It preserves the historical v8 Qwen controls, v9 MOSS screen, and v11
Chatterbox screen byte-for-byte. It authorizes:

- one complete Spanish/English matrix for exact Chatterbox profile
  `chatterbox-multilingual-v3-cuda-bf16-default-v4`;
- one new private, language-specific quality review for exact Qwen/Serena
  Spanish; and
- one separate new private, language-specific quality review for exact
  Qwen/Aiden English.

This authority does not admit, reject, defer, integrate, or distribute any
profile. Those decisions follow only after the maintainer sees the frozen
evidence.

## Normative inputs

- [`profile-v12.json`](../../benchmarks/tts/profile-v12.json)
- [`candidates-v12.json`](../../benchmarks/tts/candidates-v12.json)
- unchanged [`corpus-v7.json`](../../benchmarks/tts/corpus-v7.json)
- private
  [`bilingual-full-raw-v12`](../../benchmarks/tts/schemas/bilingual-full-raw-v12.schema.json)
  schema
- content-safe
  [`bilingual-full-summary-v12`](../../benchmarks/tts/schemas/bilingual-full-summary-v12.schema.json)
  schema
- content-safe
  [`quality-control-summary-v12`](../../benchmarks/tts/schemas/quality-control-summary-v12.schema.json)
  schema
- exact Chatterbox v11 and Qwen v8 dependency locks
- unchanged content-safe v8, v9, and v11 result files named by the v12
  manifest

Every v12 result must identify a reachable authority commit whose complete
authority tree matches these hashes and a distinct execution commit that
strictly descends from it.

## Chatterbox full matrix

The exact v11 model, bundled default conditioning, Torch 2.9.1+cu128
compatibility override, CUDA BF16 provider, artifact hashes, offline controls,
and RTX 5060 host conditions remain unchanged.

The full matrix loads five cold model instances, then loads one measured model
and executes:

- two warm passes over all five synthetic cases in each language;
- three sustained complete-corpus passes in each language;
- four cancellation boundaries in each language;
- bounded process-tree RAM, dedicated VRAM, and minimum available system RAM
  sampling;
- cleanup, privacy, offline, artifact, and network-isolation audits; and
- five new randomized private listening samples per language.

The result therefore expects 20 warm attempts, 30 sustained attempts, and
eight cancellation trials. Waveforms and raw observations remain ignored and
are deleted after guarded content-safe derivation.

## Qwen quality controls

V12 does not rerun or reinterpret the v8 Qwen machine screens. Their exact
startup, RTF, memory, and complete-waveform cancellation results remain
capacity evidence for the bounded constrained-buffer path.

V12 generates five new private samples for each exact language/voice identity:

- Serena with explicit Spanish; and
- Aiden with explicit English.

The profiles are loaded and reviewed separately. Neither result can admit the
other voice or language. The preferred `RTF <= 1.1` standard target remains
advisory for this constrained path.

## Quality and decision boundary

One fluent evaluator per active language scores intelligibility, naturalness,
prosody, pronunciation, language stability, and overall usefulness from one
to five and marks meaning-changing or wrong-language output. Machine metrics
cannot replace a missing review.

Thresholds are frozen observations, not automatic candidate decisions.
Before admission, deferral, retention, or rejection, the maintainer receives
all failures and limitations. Result files remain
`pending-maintainer-decision`; the later ADR owns the decision.

## Privacy and retention

Inference is local and the exact candidate interpreter must be blocked from
outbound access. Reference audio, runtime downloads, remote inference, and
automatic retries are forbidden. No book text is used.

Only synthetic repository text may enter the ignored private session. Git may
retain bounded counts, timings, resource measurements, hashes, aggregate
scores, closed limitations, and decision state. It must not retain generated
audio, raw forms, sample maps, model weights, environments, private paths,
commands, environment values, host identity, or raw exceptions.
