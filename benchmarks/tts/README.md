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
- `profile-v4.json` freezes Milestone 6.2 before implementation or results. It
  keeps the exact Serena candidate, binds the `narration-v1`-normalized
  `corpus-v4.json`, fixes batch-one/batch-two order and counts, separates
  standard/scheduling/demo conclusions, reserves 512 MiB of dedicated VRAM,
  and permits the separately identified speech-tokenizer CPU placement only
  after an exact full-GPU batch-two memory stop.
- `schemas/short-segment-batch-raw-v4.schema.json` and
  `schemas/short-segment-batch-summary-v4.schema.json` are the closed private
  journal and content-safe summary shapes.
- `short-segment-batch-result-v4.json` is the schema-valid, content-safe
  full-GPU result. The frozen zero-shared-memory rule stopped the run after
  79,691,776 bytes of shared GPU memory were observed, before reviewable audio
  or throughput evidence existed. It fails standard and scheduling conclusions
  and admits only the separately frozen targeted-CPU contingency.
- `short-segment-batch-result-v4-cpu.json` is the schema-valid, content-safe
  result of that admitted placement. It moves only the speech tokenizer to CPU,
  but reproduces the same authoritative/framework VRAM, minimum-free-VRAM, and
  shared-GPU-memory measurements before usable media. It fails standard and
  scheduling conclusions and does not admit quality review.
- [`selection-v4.md`](selection-v4.md) is the accepted content-safe decision.
  It selects neither `v4` placement, keeps unavailable performance and quality
  unavailable, and records that targeted component placement is not evidence
  for an independent CPU-only Qwen worker.
- `profile-v5.json` and `corpus-v5.json` freeze the separate independent
  GPU-primary/CPU-support hypothesis before implementation or results. The CPU
  worker is one fully separate CPU float32 model with CUDA hidden, twelve
  intra-op threads, one inter-op thread, OS-default affinity, and required
  zero dedicated/shared GPU allocation. CPU solo must pass its RTF `<= 3.2`
  screen before the same-authority GPU-solo and concurrent arms.
- `schemas/dual-worker-raw-v5.schema.json` and
  `schemas/dual-worker-summary-v5.schema.json` freeze the closed private and
  content-safe result shapes. Plan Milestone 7 now implements the
  benchmark-local controller, exact CPU/GPU adapter paths, bounded replay, and
  reviewed command surface. No `v5` pilot, official result, audio, or quality
  finding exists.
- `incremental-cancellation-prototype-v1.json` freezes the development-only
  prototype topology before results: complete-segment delivery, one resident
  spawned worker, explicit input/output/queue ceilings, identity-first stale
  rejection, bounded worker termination, five ordered trials, and no audio
  persistence. Its strict safe-result shape is
  `schemas/incremental-cancellation-prototype-result-v1.schema.json`.
- `incremental-cancellation-prototype-result-v1.json` is the schema-valid,
  content-safe exact-host result. All five frozen trials passed with zero stale
  units, bounded queues, released worker resources, and no raw session. It
  proves segment-level incremental delivery plus process-termination
  cancellation, not native waveform streaming or cooperative model
  cancellation.
- `corpus-v1.json` freezes the repository-authored prepared-text corpus and
  performance order.
- `schemas/summary-v3.schema.json` is the current blocker-resolution
  benchmark-summary schema. It binds the exact profile/configuration, lock,
  selected-screen result, instruction, and generation-setting fingerprints
  while excluding the instruction itself. The retained `summary-v2` and
  `summary-v1` schemas remain the completed first-cycle authority.
- `fixtures/` contains synthetic validation fixtures, not candidate results.
- [`selection-v2.md`](selection-v2.md) is the accepted content-free decision
  matrix. It rejects both exact evaluated profiles and links ADR-0013.
- [`selection-v3.md`](selection-v3.md) is the accepted content-free Milestone
  6.1 decision record. It preserves the failed standard Serena `v3` result and
  separately records ADR-0014's exact constrained development-demo exception.
- [`docs/architecture/tts-feasibility-profile-v3.md`](../../docs/architecture/tts-feasibility-profile-v3.md)
  is the active blocker-resolution authority for the selected Serena
  development candidate. `v2` remains the completed first-cycle authority and
  supplies the inherited balanced measurement rules; `v1` remains historical.
- [`docs/architecture/tts-feasibility-profile-v4.md`](../../docs/architecture/tts-feasibility-profile-v4.md)
  explains the frozen short-unit/shared-model batch authority. The committed
  full-GPU result stops on its exact shared-memory rule and does not supersede
  the failed v3 decision.
- [`docs/architecture/tts-feasibility-profile-v5.md`](../../docs/architecture/tts-feasibility-profile-v5.md)
  explains the frozen independent GPU-primary/CPU-support authority, exact arm
  order, dispatch, CPU-zero-GPU checks, RAM/commit gates, simultaneous
  five-minute bounds, and non-promotable standard conclusion.

Raw measurements, model files, generated audio, listening-session metadata,
and profiling output belong below `benchmarks/results/raw/`, which is ignored.
Nothing below that path is a reviewable result.

Milestone 6.1's explicit `benchmark:tts:prototype` command runs only from the
exact isolated Qwen candidate interpreter. It accepts one bounded JSON request
through standard input, repeats official local/offline/firewall preflight,
holds one exact model/configuration resident per trial, transfers at most one
complete bounded segment waveform through memory, releases it before the next
dispatch, and invalidates identity before any forced worker termination. Its
standard output is a strict content-safe result; candidate output, input text,
paths, exceptions, and waveform bytes remain transient and are never written
to the repository or raw storage.

The accepted exact-host run used clean implementation commit `1cc4fd2`,
delivered and released two complete bounded segment waveforms, retained at
most one queued segment and one published unit, and published zero stale units
across every cancellation race. Peak measured process-tree RAM was
4,689,559,552 bytes; authoritative PyTorch peak reserved VRAM was
5,440,012,288 bytes. Cold load was 8.367 seconds and first produced segment
audio after dispatch was 5.210 seconds. That first-audio observation is
informational here: the prototype is a topology stop gate, while the unchanged
official 3-second warm first-audio gate belongs to the later full evaluation.

After satisfying the same native-Windows firewall, offline-model,
sleep/background-load, and clean-commit preconditions as the speaker screen,
run the prototype by piping its private paths through standard input:

```powershell
$env:HF_HUB_OFFLINE = "1"
$env:TRANSFORMERS_OFFLINE = "1"
$candidatePython = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
$prototype = @{
  prototypeOptIn = $true
  artifactRoot = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
  candidatePython = $candidatePython
  expectedCommitSha = (git rev-parse HEAD).Trim()
  sleepDisabled = $true
  backgroundLoadAcceptable = $true
  thermalStateAcceptable = $true
}
$prototype | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:prototype
```

Do not redirect this private input to a tracked file. The command performs no
download, creates no raw session, writes no waveform, and emits only its
closed content-safe result.

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
summary promotion gate, thin adapters for the retained first-cycle candidates
and the exact `v3` Serena candidate, and a spawn-isolated worker supervisor.
Default tests use deterministic fakes and mocked candidate libraries; they do
not import an installed candidate stack, acquire or load weights, use audio
devices, or require CUDA.

Each real adapter validates the authority-selected revision, voice, provider,
precision, offline controls, and local artifact hashes before importing its
candidate library. The `v3` loader additionally verifies every authority hash,
the complete model/speaker/instruction/settings identity, screen order and
outcome, batch size one, zero-retry policy, and exact isolated interpreter.
Sensitive requests cross the spawned-worker boundary only through a private
pipe, never through OS command-line arguments or environment variables. Only
bounded `AudioChunk` metadata returns. Child diagnostics are captured and
discarded, timeouts and worker errors become fixed codes, and forced
cancellation terminates the worker process tree and discards every later frame
by request identity.

The model-free `v4_authority` validator is also implemented. It byte-verifies
the new profile, corpus, and schemas; recomputes corpus size and placement
identities; enforces exact pairing/first attempts; rejects result-before-
authority, unapproved CPU placement, non-conjunctive pass claims, and private
content. Milestone 2 separately implements the candidate-neutral one/two-unit
boundary, exact frozen request matrix, ordered whole-batch invalidation,
content-free playback simulation, deterministic failure candidates, and the
Qwen native list call behind the existing spawned-worker boundary.

The result-blind `v5_authority` validator and model-free mechanics are
implemented. The validator byte-verifies the new profile, corpus, and schemas;
recomputes both complete worker identities; rejects CPU
CUDA/dedicated/shared-GPU use, missing, duplicate, or reordered occurrences,
hidden retries, authority drift, retention overruns, private content, and a
sustainability pass at aggregate RTF `>= 1.0`; and verifies that an eventual
authority commit contains the exact frozen bytes and strictly precedes
execution. The controller keeps one active unit per worker, makes
head-of-line delay observable, rejects stale completion, and replays the
15/300-second, 40-unit, 28,800,000-byte, and two-active-unit bounds with exact
rational arithmetic.

The evaluated Qwen and Supertonic public APIs expose complete waveforms. The
benchmark records this honestly and rejects an end-of-output frame as evidence
of a mid-generation cancellation boundary. Worker termination is benchmark
feasibility evidence only, not a production cancellation design.

`benchmark:tts:preflight` verifies
the clean revision, exact artifacts, host headroom, offline controls, and exact
candidate-interpreter firewall rule without loading a model.
`benchmark:tts:measure` repeats that preflight, launches the exact candidate
interpreter, and either runs one disposable non-comparable pilot or the frozen
official protocol. Private paths enter only through bounded standard input.

Milestone 6.2 adds `benchmark:tts:batch`. It repeats the exact authority, host,
clean-tree, artifact, offline, firewall, power, sleep, background-load,
thermal, RAM, and 8,174,698,496-byte free-VRAM preflight; invokes Qwen with
one list containing one or two unchanged narration units through the isolated
candidate interpreter; and discards waveform payloads. Milestone 3 executed it
from a clean committed checkpoint. Future runs require their own admitted
ExecPlan milestone and must not overwrite the committed full-GPU result.

The disposable pilot runs only the three frozen excluded warm-up calls and
emits a non-promotable content-safe mechanics receipt:

```powershell
$candidatePython = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
$batchPilot = @{
  batchOptIn = $true
  resultPurpose = "disposable-pilot"
  placementProfileId = "qwen3-serena-v4-full-gpu"
  artifactRoot = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
  candidatePython = $candidatePython
  expectedCommitSha = (git rev-parse HEAD).Trim()
  sleepDisabled = $true
  backgroundLoadAcceptable = $true
  thermalStateAcceptable = $true
}
$batchPilot | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:batch
```

The receipt is not a frozen v4 raw result, summary, quality admission, or
selection. Never redirect the private input to a tracked file.

After the pilot succeeds, use a new opaque session ID for the official run
from the same clean committed checkpoint:

```powershell
$sessionId = [guid]::NewGuid().ToString("N")
$batchOfficial = @{
  batchOptIn = $true
  resultPurpose = "official"
  placementProfileId = "qwen3-serena-v4-full-gpu"
  sessionId = $sessionId
  artifactRoot = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
  candidatePython = $candidatePython
  expectedCommitSha = (git rev-parse HEAD).Trim()
  sleepDisabled = $true
  backgroundLoadAcceptable = $true
  thermalStateAcceptable = $true
}
$batchOfficial | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:batch
```

The separately frozen targeted-CPU identity is official-only; it has no
disposable pilot and is allowed only when the repository's exact committed
full-GPU result supplies the admitted memory stop and hash. On an ExecPlan
milestone that explicitly admits the arm, use a new session ID and replace only
the placement identity:

```powershell
$sessionId = [guid]::NewGuid().ToString("N")
$batchCpuOfficial = @{
  batchOptIn = $true
  resultPurpose = "official"
  placementProfileId = "qwen3-serena-v4-speech-tokenizer-cpu"
  sessionId = $sessionId
  artifactRoot = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
  candidatePython = $candidatePython
  expectedCommitSha = (git rev-parse HEAD).Trim()
  sleepDisabled = $true
  backgroundLoadAcceptable = $true
  thermalStateAcceptable = $true
}
$batchCpuOfficial | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:batch
```

Official execution records bounded content-free nanosecond/sample/resource
observations below the ignored
`benchmarks/results/raw/short-segment-batch-v4/<session-id>/` directory. It
does not retain waveform samples. A raw session is not reviewable evidence.
Derive and validate the allowlisted summary in the base development
environment; successful derivation deletes the exact ignored session before
emitting the summary:

```powershell
$derive = @{
  batchOptIn = $true
  sessionId = $sessionId
}
$derive | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:batch:derive
```

The official run fails closed unless the 50-millisecond process-tree RAM
sampler, one-second PID-tagged WDDM dedicated/shared counters, live free-VRAM
probe, and isolated Qwen worker's PyTorch allocator high-water mark are all
available. The authoritative peak is the maximum of dedicated WDDM and
PyTorch reserved bytes. PIDs, counter instances, paths, input text, and
unrelated process values never enter raw or reviewable output. A summary
remains machine evidence only until later playback/quality and decision
milestones interpret it.

Milestone 7 adds `benchmark:tts:dual-worker` for the separately frozen `v5`
mechanics. Its private JSON enters only through standard input. The command
admits a CPU-solo pilot first, then official arms in the frozen CPU-solo,
GPU-solo, concurrent sequence. Later arms require the content-safe prior
summary hashes in their input. The exact CPU process hides CUDA before PyTorch
import, uses CPU float32 with twelve/one threads, and rejects CUDA, disk, meta,
or implicit placement. The GPU process uses `cuda:0` BF16 with four/one
threads. Each process owns at most one blocking complete-waveform call.

Milestone 8 adds private raw evidence, cancellation, memory/commit, cleanup,
and safe-summary derivation. The hardware command still emits only a
non-promotable receipt. Official raw stays under the ignored
`benchmarks/results/raw/dual-worker-v5/<session-id>/` boundary. Run the base
environment derivation with the same arm and session; it validates authority
and schema, deletes the exact raw session only after successful derivation,
and emits the content-safe summary. A failed derivation retains ignored raw
for content-free diagnosis and never emits a result.

Both positive commands require `HF_HUB_OFFLINE=1` and
`TRANSFORMERS_OFFLINE=1`, the exact outbound firewall block, AC power, disabled
sleep, accepted background/thermal conditions, a clean committed checkpoint,
and the frozen resource headroom. Later arms also require SHA-256 hashes of the
already committed prior safe summaries. Never place valid private command
input in a tracked file.

The no-model invalid-input smokes are safe:

```powershell
"{}" | pnpm.cmd benchmark:tts:dual-worker
"{}" | pnpm.cmd benchmark:tts:dual-worker:derive
```

Each returns only `{"status":"fail","failureCode":"input"}`. Neither loads Qwen
or PyTorch.

## Disposable blinded quality session

The five `benchmark:tts:quality:*` commands implement the manual listening
boundary. They are explicit native-Windows commands outside CI. They never run
unless `qualityOptIn` is the JSON boolean `true`, repeat the exact official
preflight for each candidate, and write only below the ignored
`benchmarks/results/raw/quality-v2/<session-id>/` directory.

For the retained `v2` comparison, use one caller-created 32-character
lowercase hexadecimal session ID for both candidates and run
`quality:generate` once per candidate. For `v3`, the authority binds a
single-candidate session to the exact configuration fingerprint and one
generation produces all 12 samples. A generation failure removes the whole
session instead of retaining partial evidence. Once the authority-required
candidate set is complete, `quality:finalize` converts staging names to opaque
random IDs, creates an independently randomized evaluator page and scorecard
for each evaluator, and removes the identity-bearing staging tree.

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
