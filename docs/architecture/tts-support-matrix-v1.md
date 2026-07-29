# Local TTS support matrix v1

## Status

Accepted on 2026-07-29 as the M010 support, selection, and recovery closeout.
This document records product support after evaluation and integration; it
does not change any byte-frozen benchmark authority or result.

`supported`, `development-only`, and `unsupported` describe VoxLeaf product
admission. They do not mean that an engine, model, voice, or installer is
already distributed. M011 still owns release packaging, notices, source-offer
mechanics, signing, updates, and final installer validation.

## Final profile matrix

| Exact profile | Role | Product state | Evidence-backed decision |
| --- | --- | --- | --- |
| Piper 1.4.2 / ONNX Runtime CPU / `es_ES-davefx-medium` (`piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1`) | CPU fallback | **Supported** | Every frozen v6 machine, quality, offline, privacy, cleanup, license, and packaging gate passed. It is the only automatically recommendable profile when the host matcher and exact-runtime gate pass. |
| Qwen3-TTS 1.7B CustomVoice / Serena / CUDA bfloat16 (`qwen3-tts-1-7b-customvoice-cuda-bf16-v1`) | Development demo | **Development-only** | The exact native-gated profile may be selected on a compatible configured development host. Its standard evaluation failed startup, throughput, zero-failure, and cancellation gates, and the integrated packaged matrix still fails the depletion synchronization assertion. It is never automatically recommended. |
| Qwen3-TTS 0.6B CustomVoice / Aiden / CUDA bfloat16 (`qwen3-tts-0-6b-customvoice-cuda-bf16-v1`) | Standard | **Unsupported** | The frozen v2 evaluation failed startup, throughput, cancellation, and complete-quality gates. It is listed for truthful evidence but cannot be selected. |
| Supertonic 3 / F1 / ONNX Runtime CPU (`supertonic-3-onnx-cpu-f1-es-v1`) | CPU fallback | **Unsupported** | The frozen v2 evaluation failed startup, cancellation, and complete-quality gates. It is listed for truthful evidence but cannot be selected. |

VoxLeaf therefore has one supported speed-focused CPU fallback but still has
no supported standard GPU profile. Qwen/Serena is an optional constrained
development path, not a production, real-time, or general-hardware claim.

## Admitted host margins

The matcher applies the fixed formulas in
[`hardware-profile-recovery-authority-v1.md`](hardware-profile-recovery-authority-v1.md).
Values below are exact integer MiB requirements derived from the immutable
measured registry.

| Profile | Measured evidence | Matching requirement |
| --- | --- | --- |
| Piper/davefx | 393 MiB peak RAM; 166 MiB artifacts; zero dedicated VRAM | Windows x86_64, CPU float32 provider, at least 2,441 MiB available RAM, 6,537 MiB total RAM, and 2,214 MiB available application-volume storage |
| Qwen/Serena development demo | 4,426 MiB peak RAM; 5,996 MiB peak dedicated VRAM; 9,297 MiB artifacts | Windows x86_64, CUDA bfloat16 on a discrete GPU, at least 6,474 MiB available RAM, 10,570 MiB total RAM, 7,196 MiB total dedicated VRAM, 6,508 MiB currently available dedicated VRAM, and 11,345 MiB available application-volume storage |

The Qwen available-VRAM value is the narrow development-only exception in
[`qwen-development-vram-admission-v1.md`](qwen-development-vram-admission-v1.md):
the measured peak plus a frozen 512-MiB reserve. Its generic total-VRAM
requirement and every supported-profile margin remain unchanged. Unknown,
partial, ambiguous, stale, or insufficient host facts fail closed.

## Selection and fallback policy

- Piper is recommended only when its evidence, host match, and native runtime
  configuration all pass.
- A compatible user may explicitly select Piper. “Fallback” describes its
  role; VoxLeaf does not silently switch engines after a failure.
- Qwen/Serena appears only when the native development gate, exact isolated
  runtime, local artifacts, and host requirements pass. It remains an explicit
  development choice.
- Unsupported entries are visible as evidence-backed unavailable choices and
  are never selectable or recommended.
- Changing profile invalidates current work, releases playback and preparation,
  contains the existing child, verifies zero ownership, and only then permits
  one new service tree. VoxLeaf runs at most one active synthesis request and
  queues none inside the service.

## Recovery policy

Recovery is desktop-local, explicit, identity-first, and bounded:

1. Replace session/generation identity before cleanup.
2. Stop and release playback, preparation, queued work, and the supervised
   service tree.
3. Verify zero retained/discarded audio units and zero scheduler/service
   ownership.
4. Preserve the latest heard stable EPUB checkpoint.
5. Expose at most one fixed recovery action for the closed failure episode.

Provider unavailability offers profile selection/recheck. Model load, warm,
service crash, resource exhaustion, and playback failure may offer one explicit
restart or rebuild after verified cleanup. Protocol failure, cancellation
timeout, cleanup failure, and repeated recovery remain contained with no retry.
Every automatic-attempt count is zero. A mid-segment restart resumes from the
segment start; stale audio is never reused.

## Runtime, license, offline, and packaging boundary

The admitted runtimes remain isolated from the base service graph:

- Piper uses the locked `piper_1_4_2_cpu` candidate project with
  `piper-tts==1.4.2`, ONNX Runtime CPU, frozen local voice artifacts, exact
  hashes, and an interpreter-bound outbound firewall block. Piper and its
  bundled phonemizer are GPL-3.0-or-later; the evaluated davefx voice data is
  CC0.
- Qwen uses the locked `qwen3_1_7b_customvoice_cuda` candidate project with
  `qwen-tts==0.1.1`, PyTorch/Torchaudio 2.9.1 CUDA 12.8, frozen local model
  artifacts, and its own interpreter-bound outbound firewall block. The
  evaluated candidate/model boundary is Apache-2.0.

Neither runtime is added to `services/tts/uv.lock`. Exact-host tests prove
offline execution after artifact preparation and no generated-audio
persistence. M011 must decide distribution topology and fulfill Piper notices,
corresponding-source or written-offer obligations, voice provenance, installer
size, signing, and update behavior before a distributable MVP may be claimed.

## Evidence

- [`selection-v6.md`](../../benchmarks/tts/selection-v6.md) and
  [`cpu-fallback-result-v6.json`](../../benchmarks/tts/cpu-fallback-result-v6.json)
  are the frozen passing Piper decision and content-safe result.
- [`selection-v3.md`](../../benchmarks/tts/selection-v3.md),
  [`selection-v5.md`](../../benchmarks/tts/selection-v5.md), and
  [ADR-0015](decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md)
  retain Qwen/Serena's failed standard result and constrained development
  exception.
- [ADR-0019](decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md)
  freezes matching and recovery authority.
- [ADR-0020](decisions/ADR-0020-admit-piper-cpu-fallback.md) admits Piper.
- [ADR-0022](decisions/ADR-0022-qwen-development-vram-admission.md) records the
  narrow development-only available-VRAM correction.
- [ADR-0023](decisions/ADR-0023-final-m010-support-and-recovery.md) accepts this
  final product matrix without editing the historical authorities above.
