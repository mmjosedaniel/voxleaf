# Local TTS feasibility profile v11

## Status

Frozen before Chatterbox RTX 50 compatibility implementation and results on
2026-07-29.

## Purpose

Profile v11 is a candidate-specific, experimental successor to the v10
Chatterbox configuration. It preserves both the valid v9 MOSS evidence and
the v10 Chatterbox configuration stop.

V10 proved that exact Torch 2.6.0+cu124 cannot execute CUDA work on the exact
RTX 5060 Laptop GPU: the host reports CUDA capability 12.0 (`sm_120`), while
that frozen Torch build supplies kernels only through `sm_90`. No Chatterbox
inference, audio, performance, or quality result was produced, and no
candidate rejection was recorded.

V11 tests a separate, exact Torch 2.9.1+cu128 compatibility override. It does
not reinterpret or modify v10.

## Frozen identity

- Candidate:
  `chatterbox-multilingual-v3-cuda-bf16-default-v4`
- Source revision:
  `5de7a54aa4e5e2baadb0182dde554908b48b85c2`
- Model revision:
  `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18`
- T3 checkpoint: V3
- Runtime: Python 3.12, Torch/Torchaudio 2.9.1+cu128, CUDA, BF16
- Dependency policy: explicit bounded compatibility override
- Required CUDA capability: 12.0 (`sm_120`)
- Languages: Spanish and English
- Reference audio: forbidden
- Native output: 24 kHz mono
- Support intent: experimental compatibility only

The six exact model artifact hashes and generation settings remain inherited
unchanged from the v7/v9 identity. The environment lock is:

`services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/uv.lock`

## Host and execution conditions

- Windows x86-64
- at least 8 logical processors
- at least 24,576 MiB total RAM
- at least 8,000 MiB reported dedicated VRAM
- at least 6,144 MiB free dedicated VRAM at preflight
- CUDA capability 12.0
- AC power, acceptable thermal/background state, and sleep disabled
- `HF_HUB_OFFLINE=1` and `TRANSFORMERS_OFFLINE=1`
- exact v11 candidate interpreter blocked from outbound access
- one loaded model at a time

## Interpretation

The bounded screen measures five warm Spanish and five warm English cases,
four cancellation trials per language, first-audio latency, RTF, process RAM,
dedicated VRAM, cleanup, privacy, and optional private quality evidence.

The preferred standard target remains warm p95 RTF at or below 1.1. Exceeding
that value is an observation, not an automatic rejection from VoxLeaf's
bounded adaptive-prebuffer MVP path.

A dependency/API incompatibility under the explicit override is likewise an
experimental observation, not a Chatterbox rejection. Every result remains
`pending-maintainer-decision`; only the maintainer may accept, defer, or
reject the exact profile after reviewing machine and private listening
evidence.
