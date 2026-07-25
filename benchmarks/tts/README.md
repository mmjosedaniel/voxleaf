# Local TTS feasibility artifacts

This directory contains reviewable, content-safe authority and summaries for
roadmap Milestone 6. It is not a production TTS service boundary.

## Authority

- `candidates-v1.json` freezes candidate identities, roles, artifacts, licenses,
  acquisition boundaries, and isolated uv projects before measurements.
- `corpus-v1.json` freezes the repository-authored prepared-text corpus and
  performance order.
- `schemas/summary-v1.schema.json` is the private benchmark-summary schema.
- `fixtures/` contains synthetic validation fixtures, not candidate results.
- [`docs/architecture/tts-feasibility-profile-v1.md`](../../docs/architecture/tts-feasibility-profile-v1.md)
  freezes the procedure, gates, listening rubric, and invalidation rules.

Raw measurements, model files, generated audio, listening-session metadata,
and profiling output belong below `benchmarks/results/raw/`, which is ignored.
Nothing below that path is a reviewable result.

Every raw run uses a content-free directory such as
`benchmarks/results/raw/<candidate-id>/<session-id>/`. A normal completion,
rejection, timeout, cancellation, or interrupted setup must delete that exact
session directory after its allowlisted summary has been validated. Never move
audio or text-bearing diagnostics outside the ignored raw tree. Before
removing a session on Windows, resolve its absolute path and verify that it is
strictly below the repository's `benchmarks/results/raw/` directory; then use
`Remove-Item -LiteralPath <verified-session-path> -Recurse -Force`.

The corpus contains only repository-authored synthetic prepared narration
input. Its canaries are metadata and must never enter an engine request. Tests
enforce exact Unicode-code-point and UTF-8-byte counts, byte stability, fixed
order, Milestone 5 limits, ignored raw output, and the absence of tracked
books, model artifacts, generated audio, private paths, corpus text, or
canaries from reviewable summaries.

## Candidate isolation

Candidate libraries are locked in independent projects:

```text
services/tts/benchmarks/candidates/
    qwen3_0_6b_cuda/
    supertonic3_cpu/
```

Installing either project is explicit and does not change
`services/tts/pyproject.toml`, `services/tts/uv.lock`, the root install, or root
CI:

```powershell
uv sync --project services/tts/benchmarks/candidates/qwen3_0_6b_cuda --locked
uv sync --project services/tts/benchmarks/candidates/supertonic3_cpu --locked
```

Model acquisition is a separate networked operation and must target an ignored
directory. Official benchmark execution later consumes only local paths with
offline controls enabled.

Remove a rejected candidate by deleting only its directory under
`services/tts/benchmarks/candidates/`. Keep its content-free manifest entry and
summary so the decision remains reviewable.

## Implemented model-free benchmark boundary

`services/tts/benchmarks/` now contains the private candidate-neutral harness,
summary promotion gate, two thin candidate adapters, and a spawn-isolated
worker supervisor. Default tests use deterministic fakes and mocked candidate
libraries; they do not import an installed candidate stack, acquire or load
weights, use audio devices, or require CUDA.

Each real adapter validates the manifest-selected revision, voice, provider,
precision, offline controls, and local artifact hashes before importing its
candidate library. Sensitive requests cross the spawned-worker boundary only
through a private pipe, never through OS command-line arguments or environment
variables. Only bounded `AudioChunk` metadata returns. Child diagnostics are
captured and discarded, timeouts and worker errors become fixed codes, and
forced cancellation terminates the worker process tree and discards every
later frame by request identity.

The selected Qwen and Supertonic public APIs expose complete waveforms. The
benchmark records this honestly and rejects an end-of-output frame as evidence
of a mid-generation cancellation boundary. Worker termination is benchmark
feasibility evidence only, not a production cancellation design.

There is intentionally no root TTS benchmark command yet. Milestone 2 supplies
the bounded execution boundary, but artifact acquisition, host preflight,
offline network enforcement, hardware measurement, and official result
promotion belong to later tasks in the active plan. Adding a runnable command
before those pieces exist would create an incomplete and non-authoritative
measurement path.
