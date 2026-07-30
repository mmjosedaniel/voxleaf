# Local TTS feasibility profile v10

## Status

Frozen before corrected Chatterbox CUDA v10 implementation and results on
2026-07-29.

## Purpose

Profile v10 is a candidate-specific successor to the Chatterbox portion of v9.
It does not supersede or alter the valid v9 MOSS authority or evidence.

The v9 Chatterbox interpreter resolved `torch 2.6.0+cpu`, so it stopped at the
CUDA provider check before model loading. V10 corrects only that dependency
identity by using exact CUDA 12.4 Torch/Torchaudio wheels in a new environment.
The stop was neither a model result nor a candidate rejection.

## Frozen identity

- Candidate:
  `chatterbox-multilingual-v3-cuda-bf16-default-v3`
- Source revision:
  `5de7a54aa4e5e2baadb0182dde554908b48b85c2`
- Model revision:
  `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18`
- T3 checkpoint: V3
- Runtime: Python 3.12, Torch/Torchaudio 2.6.0+cu124, CUDA, BF16
- Languages: Spanish and English
- Reference audio: forbidden
- Native output: 24 kHz mono

The six exact model artifact hashes and generation settings remain inherited
unchanged from the v7/v9 identity. The environment lock is:

`services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v3/uv.lock`

## Host and execution conditions

- Windows x86-64
- at least 8 logical processors
- at least 24,576 MiB total RAM
- at least 8,000 MiB reported dedicated VRAM
- at least 6,144 MiB free dedicated VRAM at preflight
- AC power, acceptable thermal/background state, and sleep disabled
- `HF_HUB_OFFLINE=1` and `TRANSFORMERS_OFFLINE=1`
- exact candidate interpreter blocked from outbound access
- one loaded model at a time

## Interpretation

The bounded screen measures five warm Spanish and five warm English cases,
four cancellation trials per language, first-audio latency, RTF, process RAM,
dedicated VRAM, cleanup, privacy, and optional private quality evidence.

The preferred standard target remains warm p95 RTF at or below 1.1. Exceeding
that value is an observation, not an automatic rejection from VoxLeaf's
bounded adaptive-prebuffer MVP path.

Every result remains `pending-maintainer-decision`. The maintainer must review
machine and private listening evidence before VoxLeaf can accept, defer, or
reject this exact profile.
