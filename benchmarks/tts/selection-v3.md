# Local TTS profile selection v3

## Status

Accepted on 2026-07-26 as the content-free Milestone 6.1 selection record.

The frozen standard feasibility result is **failed** and
`qwen3-tts-1-7b-customvoice-cuda-bf16-v1` is **not selected as a passing
balanced or production profile**.

Separately, [ADR-0014](../../docs/architecture/decisions/ADR-0014-constrained-qwen-development-demo.md)
permits that exact identity only as a bounded development-demo input. This
exception does not modify or promote the failed result.

This record applies the conjunctive gates in the accepted
[`tts-feasibility-profile-v3`](../../docs/architecture/tts-feasibility-profile-v3.md)
and machine-readable [`profile-v3.json`](profile-v3.json) to the content-free
results retained in the
[Milestone 6.1 ExecPlan](../../docs/plans/active/M006-001-local-tts-profile-blocker-resolution.md).
The private raw journal, generated audio, scorecard, and randomization data were
deleted after the allowlisted aggregates below were derived.

## Exact evaluated identity

The decision applies only to:

- candidate ID `qwen3-tts-1-7b-customvoice-cuda-bf16-v1`;
- `qwen-tts==0.1.1`, PyTorch and Torchaudio `2.9.1+cu128`, CUDA, bfloat16,
  and SDPA on native Windows x86-64 with CPython 3.12.10;
- model `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` at revision
  `0c0e3051f131929182e2c023b9537f8b1c68adfe`;
- main model artifact SHA-256
  `38b1d5971bdbd982b561cccec982669a53b0537c3cf5e9bd4778ed07bb2f5137`
  and speech-tokenizer artifact SHA-256
  `836b7b357f5ea43e889936a3709af68dfe3751881acefe4ecf0dbd30ba571258`;
- built-in CustomVoice speaker `Serena`, language `Spanish`, and the exact
  neutral audiobook instruction frozen in `profile-v3.json`;
- batch size one and every generation setting frozen in `profile-v3.json`;
  and
- one resident model per complete candidate/speaker/instruction/settings
  identity, zero automatic retries, and first-attempt-authoritative failure
  accounting.

The official run was measured only on the named maintainer host: Windows
`10.0.26200`, an Intel Core Ultra 7 255HX, an NVIDIA GeForce RTX 5060 Laptop
GPU with 8,546,942,976 bytes of device VRAM, and NVIDIA driver `577.05`.
These observations establish no general hardware requirement or support claim.

## Standard feasibility decision

The prototype stop gate passed before the official matrix. It proved ordered
complete-segment delivery, one queued unit, identity-first stale rejection,
bounded worker termination, zero stale publication, and cleanup. It did not
prove native waveform streaming or cooperative cancellation inside the Qwen
generation call.

The official machine matrix then completed every frozen first-attempt count:
5 cold loads, 24 warm generations, 12 sustained generations covering 254.8
seconds of media, and 5 cancellation trials. There were no retries.

| Frozen gate | Required | Measured | Result |
| --- | ---: | ---: | --- |
| Process-cold load p95 | at most 60 s | 26.6606755 s | Pass |
| Warm first-produced-audio p95 | at most 3 s | 67.6685348 s | **Fail** |
| Warm time to 15 s of media p95 | at most 12 s | 68.0576463 s | **Fail** |
| Warm shorter-complete p95 | at most 5 s | 11.8231507 s | **Fail** |
| Warm request RTF p95 | at most 0.80 | 1.8274885634328357 | **Fail** |
| Sustained request RTF p95 | at most 0.80 | 1.5041296794871795 | **Fail** |
| Total sustained RTF | at most 0.75 | 1.4521558253532183 | **Fail** |
| Peak process-tree RAM | at most 12 GiB | 4,640,518,144 bytes | Pass |
| Peak dual-source VRAM | at most 6 GiB | 6,286,802,944 bytes | Pass |
| Failed or timed-out observations | exactly 0 | 3 failed mid-generation cancellation trials | **Fail** |
| Independent fluent-Spanish quality panel | at least 3 | 1 completed evaluator | **Fail** |
| Meaning-changing defects | exactly 0 | 3 | **Fail** |

The `before-dispatch` and `accepted-before-audio` cancellation trials passed by
worker termination with zero stale output. The `after-first-audio`,
`after-five-media-seconds`, and `near-hard-mid-generation` trials failed
because the complete-waveform call exposed no cooperative mid-generation
boundary.

The one-maintainer quality result is descriptive and non-promotable. Its
overall mean was 4.266666666666667/5, intelligibility 4.5, Spanish
pronunciation 4.0, punctuation/dialogue 4.666666666666667, numeric expressions
4.0, foreign names 4.2, naturalness 4.166666666666667, and artifact freedom
4.333333333333333. It cannot satisfy the immutable three-person panel or
zero-defect gates.

Exact offline synthesis after setup, artifact verification, RAM, VRAM,
licensing, packaging measurement, raw-session cleanup, and final process/GPU
cleanup passed. The engine, model, and embedded Serena voice are Apache-2.0.
The measured model plus isolated environment occupied 9,747,862,094 bytes and
remains a high packaging risk rather than an approved distribution payload.

Decision: **no passing standard balanced or production profile is selected**.
[ADR-0013](../../docs/architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md)
therefore remains authoritative for standard viability.

## Constrained development-demo decision

The maintainer accepts Serena's audible quality for a near-term demonstration.
ADR-0014 permits the exact evaluated identity only when a later implementation:

- uses verified local artifacts under the frozen offline identity;
- keeps one resident model, batch size one, one queued narration unit, and
  bounded in-memory audio;
- consumes existing normalized locator-linked narration segments without
  logging or persisting text or audio;
- publishes only complete valid bounded units;
- begins playback when the normal approximately 15 seconds of playable audio
  lead is ready, without a fixed wall-clock timer;
- exposes explicit preparation or buffering and makes no real-time,
  uninterrupted, full-chapter, or continuous-playback claim;
- invalidates the complete work identity before worker termination on pause,
  seek, replacement, setting change, close, or cancellation; and
- limits the demonstration to a bounded prepared excerpt.

The measured first-attempt failures remain visible and no retry policy is
approved by this selection. The actual capability is complete-waveform
generation with segment-level publication and process-termination
cancellation, not native streaming or cooperative mid-call cancellation.

Decision: **the exact Serena identity is retained only as a constrained
development-demo input**.

## Consequences and follow-up

- Milestone 7 may plan a development-only vertical demo under ADR-0014.
- Production Milestone 7 completion remains blocked; no production engine,
  dependency, transport, installer payload, or general hardware profile is
  selected.
- Failed `v3` cannot be repaired by buffering, the descriptive quality result,
  a retry, or the demo exception.
- Planned Milestone 6.2 owns the separate pre-result `v4` investigation of
  shorter semantic units, shared-model batch size two, bounded playback
  simulation, and conditional targeted CPU placement.
- Any candidate, model revision, artifact, runtime, speaker, instruction,
  generation setting, batch size, lifecycle, retry, measurement, quality, or
  privacy change requires a new frozen profile before affected results.
