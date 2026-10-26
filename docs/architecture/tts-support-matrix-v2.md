# Local TTS support and integration matrix v2

V6 integration is accepted under the revised evidence boundary in the
[completed security refresh](../plans/completed/chatterbox-filelock-setuptools-security-refresh.md):
exact local artifact admission, current installed/runtime gates and scoped reuse.
Full live acquisition failed twice; its cause remains unresolved. No complete
v6 live-delivery pass is claimed.

## Status

Accepted on 2026-07-30 as the M010.1 Milestone 5 evaluation and integration
routing matrix, then reconciled with the completed Milestone 6 runtime
integration and passing local Milestone 7 packaged matrix. It layers new
evidence-backed profiles over the historical M010
runtime matrix without claiming that locally configured development
environments are packaged or distributed.

`supported` means currently implemented and validated in the application on
representative hardware, with compatibility determined by the profile's
published host and runtime requirements rather than by an exhaustive test of
every computer.
`development-only` means implemented and exact-host validated behind an
explicit developer gate, but neither automatically recommended nor presented
as production support. `deferred` and `unsupported` remain non-selectable.

## Current matrix

### Profile identity and executable versions

Profile IDs identify stable engine/voice selections, not installed dependency
versions. Under [ADR-0053](decisions/ADR-0053-refresh-piper-onnxruntime.md) and
[ADR-0054](decisions/ADR-0054-refresh-piper-engine-and-phonemizer.md), Piper keeps
`piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1` and
`piper-1-4-2-onnx-cpu-en-us-joe-medium-v1`. Current packaged and native
development execution uses Piper **1.8.0** and ONNX Runtime **1.31.0**, bound by
the [core source manifest](../../services/tts/release/core/source-manifest-v1.json),
current core lock and [ADR-0055](decisions/ADR-0055-onnx-131-offline-runtime.md).
Frozen v6/v8 measurements still describe Piper 1.4.2/ONNX Runtime 1.27.0;
their scores and performance do not validate the refreshed executable bytes.

Likewise, `chatterbox-multilingual-v3-cuda-bf16-default-v4` remains the stable
Chatterbox profile ID. Its `v3` model and `v4` profile labels do not select a
runtime package. The accepted integration admits **voxleaf-chatterbox-v6** under
[ADR-0062](decisions/ADR-0062-admit-filelock-setuptools-chatterbox-v6.md), using the
[v6 acquisition manifest](../../services/tts/release/optional/chatterbox/optional-package-manifest-v6.json).
Package v4 remains a separate unpublished/unadmitted local candidate, and
installed package v2/v3/v5 data is cleanup-only. These executable updates do not
change the support decisions or host gates below.

| Profile / current engine                                                                | Language            | Current state                                | Next boundary                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------- | ------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Piper 1.8.0 / davefx / ONNX Runtime 1.31.0 CPU                                              | Spanish             | **Supported**                                | Packaged Windows x64 CPU profile; no discrete GPU requirement. M011's renewed Milestone 7 record accepts local/portfolio GO from exact-artifact lifecycle/package evidence and representative use on the independent older 16-GB-RAM computer.                                                                                                                                                                                                     |
| Piper 1.8.0 / joe / ONNX Runtime 1.31.0 CPU                                                 | English             | **Supported**                                | Packaged language-matched Windows x64 CPU profile; no discrete GPU requirement. The same requirements-based M011 GO applies.                                                                                                                                                                                                                                                                                                                       |
| Chatterbox Multilingual V3 / bundled default conditioning / CUDA bfloat16 v4 | Spanish and English | **Supported when the published gate passes** | ADR-0044 requires Windows x64/CUDA bfloat16, 5,632 MiB total and 4,668 MiB free VRAM, 24,576 MiB total and 4,096 MiB currently available RAM, and eight logical processors; the evaluated 8-GB GPU class remains recommended. Installed representative-host Spanish/English arms pass. The ordinary manifest is `downloadable` only after renderer presentation plus native pre-network recheck of that gate; the optional payload is not bundled. |
| Qwen3-TTS 1.7B CustomVoice / Serena / CUDA bfloat16 v8                       | Spanish             | **Development-only**                         | Keep constrained buffering and require the exact Qwen developer gate and measured host.                                                                                                                                                                                                                                                                                                                                                            |
| Qwen3-TTS 1.7B CustomVoice / Aiden / CUDA bfloat16 v8                        | English             | **Development-only**                         | Keep constrained buffering and require the exact Qwen developer gate and measured host.                                                                                                                                                                                                                                                                                                                                                            |
| MOSS-TTS-Nano 100M ONNX / Ava                                                | Spanish and English | **Deferred, not rejected**                   | Future separately frozen dialogue/punctuation and voice/accent investigation.                                                                                                                                                                                                                                                                                                                                                                      |
| Qwen3-TTS 0.6B CustomVoice / Aiden                                           | Historical profile  | **Unsupported**                              | Preserve historical rejection; do not confuse it with the implemented 1.7B Aiden v8 profile.                                                                                                                                                                                                                                                                                                                                                       |
| Supertonic 3 / F1                                                            | Spanish             | **Unsupported**                              | Preserve historical rejection.                                                                                                                                                                                                                                                                                                                                                                                                                     |

## Invariants

- Run local inference only and retain generated audio only in bounded memory.
- Load at most one model process at a time.
- Replace work identity before language/profile changes and verify cleanup
  before starting the replacement.
- Never silently fail over between engines.
- Keep Qwen's slower-than-real-time profiles behind constrained buffering.
- Do not add voice cloning.
- Do not infer redistribution permission from successful local evaluation.

The historical
[`tts-support-matrix-v1.md`](tts-support-matrix-v1.md) remains the record of
M010's original runtime closeout. This v2 matrix is the current executable
M010.1 overlay. M010.1 Milestone 7's six packaged bilingual portfolio journeys pass
locally; pull request #159 passed required Ubuntu/Windows checks and merged the
plan closeout. M010.2 may reorganize presentation and playback controls but
must not change this matrix. M011 keeps Piper in the core and treats Chatterbox
as a separately gated optional package; it remains responsible for
distribution, licensing fulfillment, acquisition/removal, installers, and
production support claims. A process-lifetime verification receipt may avoid
repeating complete Chatterbox tree hashing within one application run, but it
is not persisted and does not change this support decision: every application
process must verify the exact installed authority before first use. M011's
installed representative-host Spanish/English, offline, privacy, cancellation,
and lifecycle evidence supports compatible-host Chatterbox under
[`mvp-release-authority-v2`](mvp-release-authority-v2.md). Under
[ADR-0050](decisions/ADR-0050-promote-ordinary-chatterbox-acquisition-and-retire-validation-overlay.md),
the ordinary manifest exposes Download only after renderer presentation and a
native pre-network recheck of the same live gate. The release-locked runtime
accepts only the packaged Piper core or a verified installed Chatterbox
profile; repository and environment fallbacks are compiled out. This does not
change the support state or gate, and Chatterbox still has materially higher
storage, startup, RAM/VRAM, GPU, and CPU costs. Trusted public signing remains
a separate externally authorized release channel.
The receipt is a performance optimization, not same-user tamper protection;
full hash verification occurs when each application process first creates it.
