# Local bilingual TTS evaluation profile v8

## Status and authority

This is the result-blind M010.1 authority that supersedes v7 before any v7
result existed. Historical v7 files remain byte-frozen and valid as intake
history; no threshold, corpus case, normalization rule, quality rubric, or
stop condition was changed after listening to output.

The normative machine-readable files are:

- [`profile-v8.json`](../../benchmarks/tts/profile-v8.json);
- [`candidates-v8.json`](../../benchmarks/tts/candidates-v8.json);
- the unchanged [`corpus-v7.json`](../../benchmarks/tts/corpus-v7.json);
- the unchanged
  [`normalization-corpus-v2.json`](../../benchmarks/tts/normalization-corpus-v2.json);
- the private
  [`bilingual-raw-v8`](../../benchmarks/tts/schemas/bilingual-raw-v8.schema.json)
  schema; and
- the content-safe
  [`bilingual-summary-v8`](../../benchmarks/tts/schemas/bilingual-summary-v8.schema.json)
  schema.

Every v8 result must name an authority commit containing the exact v7 base and
v8 amendment and an execution commit that strictly descends from it. After a
pull-request merge, execution must use a reachable merged commit whose tree
passes the authority validator; an unmerged branch checkpoint is not assumed
to remain an ancestor after squash merging.

## Why v8 supersedes v7

V7 froze Piper English, Chatterbox, and MOSS candidates, but it omitted the
already integrated local Qwen 1.7B family from the bilingual comparison. The
Qwen documentation confirms that the exact CustomVoice checkpoint supports
Spanish and English and includes nine built-in voices. It recommends a
speaker's native language for best quality, identifies Aiden and Ryan as
English-native, and permits every built-in speaker to use every supported
model language.

V8 therefore adds two separate exact profile identities before any result:

- Qwen3-TTS 12Hz 1.7B CustomVoice / Serena / Spanish; and
- Qwen3-TTS 12Hz 1.7B CustomVoice / Aiden / English.

Serena retains VoxLeaf's existing Spanish development configuration so v8 can
measure it under the bilingual corpus without inheriting a support claim.
Aiden is the single bounded English Qwen voice because it is documented as a
native English, sunny American male voice with a clear midrange. Ryan remains
deferred rather than expanding v8 after results.

Primary upstream references:

- [Qwen CustomVoice model card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice);
- [Qwen3-TTS official repository](https://github.com/QwenLM/Qwen3-TTS); and
- [Qwen3-TTS release article](https://qwen.ai/blog?id=qwen3tts-0115).

These sources establish intake identity and documented capability, not
VoxLeaf quality, performance, support, or distribution fitness.

## Exact Qwen boundary

Both profiles use:

- `qwen-tts==0.1.1` and the existing isolated lock;
- `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` at revision
  `0c0e3051f131929182e2c023b9537f8b1c68adfe`;
- the frozen model and speech-tokenizer artifact hashes;
- Windows x86_64, Python 3.12, PyTorch CUDA, bfloat16, and SDPA;
- batch size one and the existing sampling/token settings;
- explicit `Spanish` or `English`, never automatic language selection;
- exact local snapshot resolution with Hugging Face and Transformers offline;
- an outbound firewall block bound to the exact candidate interpreter;
- 24-kHz mono float32 complete-waveform output; and
- `narration-bilingual-v2` canonical text.

No personal reference audio, voice clone prompt, voice design, runtime
download, remote inference, or automatic retry is permitted. Shared model
artifacts establish only artifact identity. Serena evidence cannot admit
Aiden, Spanish evidence cannot admit English, and old 0.6B Aiden evidence
cannot decide the new 1.7B identity.

## Cloud API exclusion

Alibaba Cloud's real-time TTS guide describes remote WebSocket/API-key
services and a separate cloud voice catalog. That path is useful upstream
product documentation but violates VoxLeaf's local-inference and no-upload
requirements. Cloud-only voices and latency claims are not candidates,
artifacts, or evidence in v8.

## Execution and selection policy

Execution remains sequential and loads one model at a time:

1. Piper English baseline;
2. Qwen/Serena Spanish existing-engine control;
3. Qwen/Aiden English existing-engine control;
4. Chatterbox bilingual screen; and
5. MOSS bilingual screen.

Each Qwen profile first receives its single-language control screen. A failed
Qwen profile stops without affecting the other exact identity. A passing
profile must still complete its language-specific full matrix before a
support decision. The two Qwen profiles do not consume v7's allowance of at
most one new-engine full-matrix survivor because Qwen is already an integrated
development engine; they also receive no preference over a passing new engine.

The v7 machine, performance, memory, cancellation, evaluator, privacy,
repository, and cleanup gates remain unchanged and conjunctive. V8 changes
candidate coverage and result schemas only.

## Product and support boundary

This authority adds no UI option, English normalization implementation,
runtime adapter, registry entry, supported profile, or automatic fallback.
Current narration remains Spanish-only. Piper/davefx remains the sole
supported profile and Qwen/Serena remains development-only until later M010.1
milestones produce and accept exact evidence.

Qwen/Aiden is evaluation-only and unsupported. It becomes selectable only
after bilingual product implementation, exact v8 evaluation, an accepted
support decision, registry/service integration, exact-host product proof,
privacy validation, and repository validation.

## Privacy and repository boundary

Only bounded content-free summaries may be committed. Source or narration
text, canaries, waveforms, weights, environments, raw evaluator forms,
evaluator identity, private paths, commands, environment values, raw errors,
and private host identity remain outside Git. Raw v8 sessions and generated
audio are deleted after content-safe derivation.

The v8 validator loads and revalidates the complete v7 base, verifies all v8
bytes and the reused Qwen lock, rejects candidate/language/stage substitution,
rejects private content, verifies the complete authority tree, and requires
strict Git ancestry.
