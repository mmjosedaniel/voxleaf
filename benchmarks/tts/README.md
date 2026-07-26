# Local TTS feasibility artifacts

This directory contains reviewable, content-safe authority and summaries for
roadmap Milestone 6. It is not a production TTS service boundary.

## Authority

- `candidates-v1.json` freezes candidate identities, roles, artifacts, licenses,
  acquisition boundaries, and isolated uv projects before measurements.
- `candidates-v2.json` freezes the separate Qwen3-TTS 12Hz 1.7B CustomVoice
  candidate identity, exact local runtime, pre-admission gate,
  first-attempt/no-retry policy, and the exclusion of Whisper and VAD/energy
  from `v3`. `candidates-v3.json` is the byte-frozen correction that selects
  the `v2` screen authority without mutating that base identity.
- `customvoice-spanish-screen-v2.json` is the active pre-audio authority. It
  freezes all nine built-in speakers, three synthetic Spanish cases, one
  instruction, identical generation settings, applicable-case scoring,
  blind presentation, deterministic selection, and disposable-audio bounds.
- `customvoice-spanish-screen-v1.json` and its result schema remain immutable
  abandoned authority. Its generated raw session was deleted before any
  scorecard or result after the evaluator exposed missing numeric-expression
  scoring.
- `schemas/customvoice-spanish-screen-result-v2.schema.json` is the active
  closed content-safe result shape.
- `customvoice-spanish-screen-result-v2.json` is the schema-valid
  content-safe intake result. It selects Serena with zero meaning-changing
  defects; it contains no sample IDs, scorecard, audio, text, or path.
- `profile-v3.json` freezes the complete Serena candidate identity,
  prototype stop gate, inherited official gates, exclusions, privacy rules,
  and invalidation authority before any prototype or official result.
- `incremental-cancellation-prototype-v1.json` freezes the development-only
  prototype topology before results: complete-segment delivery, one resident
  spawned worker, explicit input/output/queue ceilings, identity-first stale
  rejection, bounded worker termination, five ordered trials, and no audio
  persistence. Its strict safe-result shape is
  `schemas/incremental-cancellation-prototype-result-v1.schema.json`.
- `corpus-v1.json` freezes the repository-authored prepared-text corpus and
  performance order.
- `schemas/summary-v2.schema.json` is the current private benchmark-summary
  schema. It reuses unchanged closed definitions from the retained historical
  `summary-v1.schema.json` through an offline schema registry.
- `fixtures/` contains synthetic validation fixtures, not candidate results.
- [`selection-v2.md`](selection-v2.md) is the accepted content-free decision
  matrix. It rejects both exact evaluated profiles and links ADR-0013.
- [`docs/architecture/tts-feasibility-profile-v3.md`](../../docs/architecture/tts-feasibility-profile-v3.md)
  is the active blocker-resolution authority for the selected Serena
  development candidate. `v2` remains the completed first-cycle authority and
  supplies the inherited balanced measurement rules; `v1` remains historical.

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
    qwen3_1_7b_customvoice_cuda/
    qwen3_0_6b_cuda/
    supertonic3_cpu/
```

Installing either project is explicit and does not change
`services/tts/pyproject.toml`, `services/tts/uv.lock`, the root install, or root
CI:

```powershell
uv sync --project services/tts/benchmarks/candidates/qwen3_0_6b_cuda --locked
uv sync --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --locked
uv sync --project services/tts/benchmarks/candidates/supertonic3_cpu --locked
```

Model acquisition is a separate networked operation and must target an ignored
directory. Official benchmark execution later consumes only local paths with
offline controls enabled.

Remove a rejected candidate by deleting only its directory under
`services/tts/benchmarks/candidates/`. Keep its content-free manifest entry and
summary so the decision remains reviewable.

## Frozen CustomVoice Spanish speaker screen

The 1.7B CustomVoice environment and screen are development-only. Acquisition
is the only networked phase and must precede the offline firewall/preflight
phase:

```powershell
uv sync --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --locked
uv run --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --locked hf download Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice --revision 0c0e3051f131929182e2c023b9537f8b1c68adfe --local-dir models/qwen3_1_7b_customvoice_cuda
```

Before generation, create the documented application-scoped outbound
firewall rule for this candidate's exact `.venv\Scripts\python.exe`, disable
sleep while on AC power, close material background load, and commit every
authority change. Then run from a clean native Windows checkout:

```powershell
$candidatePython = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
$sessionId = [guid]::NewGuid().ToString("N")
$generate = @{
  screenOptIn = $true
  sessionId = $sessionId
  artifactRoot = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
  candidatePython = $candidatePython
  expectedCommitSha = (git rev-parse HEAD).Trim()
  sleepDisabled = $true
  backgroundLoadAcceptable = $true
  thermalStateAcceptable = $true
}
$generate | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:screen:generate
```

Open only the generated ignored
`benchmarks/results/raw/customvoice-spanish-screen-v2/<session-id>/evaluate.html`.
The page contains 27 opaque randomized samples and downloads one completed
scorecard after every field is filled. Submit that exact JSON without editing
the authority:

```powershell
$scorecard = Get-Content "<completed-scorecard.json>" -Raw | ConvertFrom-Json -AsHashtable
$submit = @{
  screenOptIn = $true
  sessionId = $sessionId
  scorecard = $scorecard
}
$submit | ConvertTo-Json -Depth 20 -Compress | pnpm.cmd benchmark:tts:screen:submit
```

Only the schema-valid content-free selection result may be promoted. Audio,
the randomization key, scorecard, and local paths remain in ignored raw
storage. After promotion and validation, delete the exact session with:

```powershell
@{ screenOptIn = $true; sessionId = $sessionId } |
  ConvertTo-Json -Compress |
  pnpm.cmd benchmark:tts:screen:cleanup
```

The screen selects an intake speaker only. It does not approve production
quality, pass `v3`, or change ADR-0013 by itself.

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

The evaluated Qwen and Supertonic public APIs expose complete waveforms. The
benchmark records this honestly and rejects an end-of-output frame as evidence
of a mid-generation cancellation boundary. Worker termination is benchmark
feasibility evidence only, not a production cancellation design.

Milestone 3 adds explicit root commands. `benchmark:tts:preflight` verifies
the clean revision, exact artifacts, host headroom, offline controls, and exact
candidate-interpreter firewall rule without loading a model.
`benchmark:tts:measure` repeats that preflight, launches the exact candidate
interpreter, and either runs one disposable non-comparable pilot or the frozen
official protocol. Private paths enter only through bounded standard input.

Official execution records bounded content-free nanosecond/sample/resource
observations under the ignored raw session directory. It does not retain
waveform samples. A raw session is not a reviewable summary and is never
eligible for selection until the quality, audit, schema, arithmetic, privacy,
and gate promotion steps pass. The balanced role fails closed unless both the
one-second PID-tagged Windows WDDM dedicated-memory counter and the isolated
Qwen worker's PyTorch allocator high-water mark are available and positive.
The authoritative peak is their maximum. RAM remains sampled every 50
milliseconds; PIDs, counter instances, paths, and unrelated process values
never enter raw or reviewable output.

## Disposable blinded quality session

The five `benchmark:tts:quality:*` commands implement the manual listening
boundary. They are explicit native-Windows commands outside CI. They never run
unless `qualityOptIn` is the JSON boolean `true`, repeat the exact official
preflight for each candidate, and write only below the ignored
`benchmarks/results/raw/quality-v2/<session-id>/` directory.

Use one caller-created 32-character lowercase hexadecimal session ID for both
candidates. Run `quality:generate` once per candidate while that candidate's
exact interpreter firewall rule is active. A generation failure removes the
whole session instead of retaining a partial comparison. After both candidates
produce the same 12 frozen cases, `quality:finalize` converts the staging names
to opaque random IDs, creates an independently randomized evaluator page and
scorecard for each evaluator, and removes the identity-bearing staging tree.

Each evaluator page reveals only case IDs, instructions, opaque audio names,
and the frozen seven scoring dimensions. It contains no narration text,
privacy canary, candidate, engine, model, voice, path, or prior result. Its
exported completed scorecard is submitted through
`benchmark:tts:quality:submit`; `quality:aggregate` applies the frozen
per-case median and dimension-mean arithmetic. Fewer than three evaluators
remain explicitly ineligible for summary promotion even though the limited
aggregate can be inspected. `quality:cleanup` removes the exact session and
all generated audio after the result is recorded.

The audio boundary is mono 16-bit PCM WAV using the same bounded conversion for
both candidates. Each file is capped at 120 seconds and the whole session at
512 MiB. Audio is temporary benchmark evidence only: never commit, attach,
copy into documentation, or treat it as the product's future audio format.
