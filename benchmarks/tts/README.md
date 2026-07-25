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
