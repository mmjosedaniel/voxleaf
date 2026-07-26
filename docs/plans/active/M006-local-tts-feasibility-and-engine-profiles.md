# Milestone 6: Prove local TTS feasibility and select engine profiles

## Goal

Complete roadmap Milestone 6 by evaluating local text-to-speech candidates with one reproducible, privacy-safe protocol and either:

1. select a measured balanced profile and a measured CPU-compatible profile through an accepted architecture decision; or
2. record that one or both roles have no viable candidate, identify the failed gates, and revise the roadmap before any production TTS integration begins.

This milestone produces benchmark evidence and durable selection decisions. It does not implement the production TTS service, desktop/process transport, audio queue, playback, or synchronized narration.

## User-visible outcome

There is no new user-visible speech or playback behavior in this milestone.

When the milestone is complete, contributors can state only that named engine/model/voice profiles were measured on explicitly documented hardware under a reproducible local benchmark. The selected profiles, if any, give Milestone 7 a justified integration target and give later milestones evidence for resource, cancellation, offline, licensing, packaging, and capability decisions.

The desktop must remain a visual reader. It must not expose a play button, voice picker, model picker, loading state, hardware recommendation, or support claim based solely on this benchmark work.

## Current state

At plan creation on 2026-07-25, `main` points to `096306d`, and roadmap Milestones 1 through 5 are complete. The working tree also contains an in-progress documentation reconciliation; future implementation must preserve and review those changes rather than treating this baseline as a clean implementation branch.

Repository evidence establishes the following boundary:

- `services/tts/pyproject.toml` has no production dependencies.
- `services/tts/src/voxleaf_tts/__init__.py` exposes only `service_version()`.
- The Python tests validate the dependency-free version function and cross-language conformance against checked-in shared schemas.
- No Python module loads a model, produces audio, starts a server, detects hardware, handles cancellation, or reports benchmark measurements.
- No TTS or model benchmark command exists in the root `package.json`.
- `@voxleaf/shared` implements versioned reading-session, narration-segment, audio-frame metadata, buffer-status, capability-report, and operational-error contracts plus deterministic TTS/audio fakes.
- There is no dedicated shared measurement or benchmark-report schema. `CapabilityReportV1` intentionally excludes model identity, hardware identity, benchmark results, and hardware-profile claims.
- `@voxleaf/epub` implements bounded, locator-linked `OpenedPublication.prepareNarration`, but no production desktop module calls it.
- The Milestone 5 corpus and preparation limits are test-only authorities for normalization and segmentation. They do not select a model or provide a model tokenizer.
- `.gitignore` excludes model caches, weights, generated audio, raw benchmark results, profiling artifacts, logs, books, and private user data.
- The existing `pnpm.cmd check` and `pnpm check:portable` surfaces do not download weights, require a GPU, execute a model, or run hardware benchmarks.
- The candidate names in the project brief, including Qwen3-TTS and Kokoro, are evaluation inputs only. No engine, model, voice, runtime provider, output format, or hardware profile is approved.
- The reader benchmark's existing reference-host results are not TTS measurements and cannot be reused as model-support evidence.

## Scope and non-goals

### Scope

- Freeze a model-independent TTS feasibility protocol before official candidate results are observed.
- Create one repository-authored synthetic Spanish-focused benchmark corpus used unchanged across candidates.
- Cover short, target-sized, hard-sized, dialogue, punctuation, abbreviation, number, date, time, currency, percentage, code, Unicode, and embedded foreign-name cases relevant to the accepted narration policy.
- Inventory candidate engine, model, voice, runtime, license, redistribution, download, offline, platform, artifact-size, and dependency constraints from authoritative sources.
- Evaluate at least one credible accelerated/balanced candidate and at least one credible CPU-compatible candidate. One candidate may qualify for both roles only if both modes are measured independently.
- Isolate candidate-specific dependencies and locks from the dependency-free service foundation until a profile is selected.
- Build a candidate-neutral benchmark harness with deterministic fake-adapter tests.
- Measure cold model load, warm-up, time to first produced audio, time to approximately 15 seconds of produced playable audio or a complete shorter sample, generated duration, real-time factor, RAM, VRAM when reliably available, output capabilities, errors, and cancellation behavior.
- Measure both short-request responsiveness and sustained sequential generation.
- Evaluate Spanish intelligibility, pronunciation, punctuation/dialogue behavior, number/date/currency handling, naturalness, and audible artifacts with a frozen scoring rubric.
- Prove official benchmark execution is local and offline after an explicit model-acquisition step.
- Produce allowlisted, content-free machine-readable summaries and human-readable reports.
- Select profiles through an ADR only after the frozen gates and reports are complete.
- Update the roadmap, canonical system diagram, performance guidance, dependency inventory, setup, testing guidance, and product claims to the evidence actually obtained.

### Non-goals

- Implementing the persistent local TTS service or its lifecycle.
- Selecting or implementing the desktop-to-TTS process transport.
- Defining production request framing, process health messages, or binary audio framing.
- Wiring `OpenedPublication.prepareNarration` into the desktop.
- Adding narration, model, voice, or playback controls to React.
- Implementing an audio queue, ring buffer, playback API, AudioWorklet, resampler, time stretcher, or OS audio integration.
- Persisting generated audio, narration text, model output, benchmark prompts, or private paths.
- Automatically detecting hardware or recommending a profile to end users.
- Claiming support for an unmeasured device, driver, operating system, provider, precision, or model variant.
- Packaging Python, model weights, GPU runtimes, or an installer.
- Changing displayed EPUB text, `narration-v1`, locator semantics, prepared-segment ranges, or the Milestone 5 normalization corpus to accommodate a model.
- Adding model-specific tokens or preprocessing to shared contracts.
- Running model or hardware benchmarks in required pull-request CI.
- Treating waveform generation as playback or calling the first produced sample audible output.
- Selecting the final production audio format or transport based only on what a benchmark adapter happens to return.

## Relevant files and documentation

### Current authority

- `AGENTS.md`
- `.agents/PLANS.md`
- `README.md`
- `docs/README.md`
- `docs/product/project-brief.md`
- `docs/product/mvp.md`
- `docs/product/glossary.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/overview.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/narration-normalization-v1.md`
- `docs/architecture/narration-preparation-limits-v1.md`
- `docs/architecture/decisions/ADR-0001-local-first-desktop.md`
- `docs/architecture/decisions/ADR-0002-in-memory-audio.md`
- `docs/architecture/decisions/ADR-0004-start-after-audio-lead.md`
- `docs/architecture/decisions/ADR-0005-engineering-workspace-and-quality-tooling.md`
- `docs/architecture/decisions/ADR-0006-json-schema-contract-authority.md`
- `docs/architecture/decisions/ADR-0012-bounded-narration-preparation.md`
- `docs/development/setup.md`
- `docs/development/testing.md`
- `docs/development/dependencies.md`
- `docs/plans/roadmap.md`
- `docs/plans/completed/M001-engineering-foundation.md`
- `docs/plans/completed/M002-shared-contracts-and-test-harness.md`
- `docs/plans/completed/M005-narration-text-preparation.md`
- `docs/plans/active/synchronized-reader-and-startup-buffer.md`

### Current code and configuration

- `package.json`
- `.gitignore`
- `.python-version`
- `.github/workflows/foundation-checks.yml`
- `services/tts/pyproject.toml`
- `services/tts/uv.lock`
- `services/tts/src/voxleaf_tts/__init__.py`
- `services/tts/tests/test_health.py`
- `services/tts/tests/test_contract_conformance.py`
- `packages/shared/schemas/capability-report/v1.schema.json`
- `packages/shared/schemas/narration-segment/v1.schema.json`
- `packages/shared/schemas/audio-frame/v1.schema.json`
- `packages/shared/schemas/operational-error/v1.schema.json`
- `packages/shared/src/testing/fake-tts-source.ts`
- `packages/epub/test-support/narration-normalization-corpus.ts`
- `packages/epub/test-support/narration-preparation-limits.ts`

### Expected implementation areas

The exact candidate identifiers and dependency layout are frozen by Milestone 1 of this plan before candidate packages are added. The implementation is expected to add or update:

- `benchmarks/tts/`: corpus manifests, candidate manifests, the frozen feasibility profile, and sanitized summary reports.
- `benchmarks/results/raw/`: ignored raw measurements, temporary listener-session metadata, and other non-reviewable run output.
- `services/tts/benchmarks/`: candidate-neutral harness code and thin candidate adapters that are not part of the production service API.
- `services/tts/tests/`: deterministic corpus, metric, report, redaction, cancellation, and fake-adapter tests.
- Candidate-specific benchmark project and lock files under a reviewed path below `services/tts/benchmarks/`, isolated from the production dependency group.
- `package.json`: explicit benchmark setup and execution commands added during implementation; no benchmark command is claimed to exist before that task completes.
- `docs/architecture/tts-feasibility-profile-v1.md`: the original frozen
  pre-result benchmark protocol, retained as superseded historical authority.
- `docs/architecture/tts-feasibility-profile-v2.md`: the approved rerun
  authority that replaces unavailable WDDM NVML process attribution with a
  Windows/PyTorch cross-checked measurement.
- `docs/architecture/decisions/ADR-0013-local-tts-engine-profiles.md`: the final profile selection or explicit no-viable-profile decision, provided `ADR-0013` remains the next free identifier when the decision is written.
- Product, architecture, development, dependency, testing, roadmap, and plan documentation named above.

Do not create a shared public benchmark schema unless a real cross-process or cross-language runtime consumer is identified. A benchmark-local schema and allowlisted serializer are sufficient for Milestone 6.

## Architecture and constraints

### Benchmark-only data flow

```text
checked-in synthetic corpus
    -> candidate-neutral bounded harness
    -> one local candidate adapter
    -> one local engine/model/voice profile
    -> bounded in-memory audio observer
    -> ignored raw measurements
    -> allowlisted content-free summary
    -> profile selection evidence
```

This is a benchmark topology, not the Milestone 7 production process topology. A benchmark may isolate an engine in a child process to contain crashes, enforce a timeout, or measure termination, but that does not select standard streams, sockets, WebSockets, Tauri IPC, or another product transport.

### Trust and privacy boundary

- Official execution occurs on the local device after an explicit networked acquisition step.
- The benchmark run must succeed with external network access unavailable. A library that silently fetches configuration, code, telemetry, voices, or weights during an official run fails the offline gate.
- Inputs are original repository-authored synthetic narration. No EPUB, copyrighted text, clipboard content, user document, or private path is admitted.
- Input text is sensitive even though it is synthetic. It may enter the local engine call but must not enter filenames, process arguments, environment variables, stdout, stderr, exceptions, reports, snapshots, analytics, or committed artifacts.
- Candidate libraries may log prompts or paths by default. The adapter must capture and bound their output, prove a canary never escapes, and publish only fixed codes. Merely asking contributors not to read a log is insufficient.
- Reports may contain stable corpus case identifiers and numeric aggregates, but never source or normalized text.
- Reports may record CPU/GPU model, total memory, operating-system version, runtime versions, and driver versions needed to reproduce results. They must exclude hostname, username, serial numbers, device UUIDs, account identifiers, absolute paths, command lines, unrelated processes, and environment dumps.
- Model weights, caches, generated audio, raw traces, and raw dependency diagnostics remain ignored and uncommitted.

### Persistence and generated audio

- Performance runs consume produced audio into duration, shape, and bounded-resource counters and then release it.
- The default benchmark path writes no audio file.
- A manual quality session may materialize audio only after explicit opt-in, inside an ignored disposable directory, with fixed content-free filenames.
- The quality workflow must delete disposable audio on normal completion and document cleanup after interruption. Generated audio is never a report attachment or Git artifact.
- No benchmark code may reuse the desktop reader-state repository or create an application persistence path.

### Bounds and cancellation

- Load one candidate profile at a time.
- Admit one bounded corpus item at a time unless a candidate's actual streaming API requires a separately documented bounded input contract.
- Place explicit timeouts on acquisition verification, model load, warm-up, inference, cancellation observation, and shutdown.
- Consume streaming output incrementally without retaining an unbounded waveform.
- When an API returns a complete waveform, record that capability honestly and bound each input so the returned allocation has a measured maximum.
- Measure cooperative engine cancellation separately from benchmark-worker termination. A process kill is not evidence that the engine supports cancellation.
- If work cannot stop promptly, retain its original benchmark identity, discard its output, measure completion or termination separately, and record `generationCancellation` as unsupported or unknown rather than supported.
- A timed-out, cancelled, crashed, or resource-exhausted case yields one fixed content-free outcome and no partial summary that could be mistaken for a successful measurement.
- The harness must restore the machine to no loaded benchmark child/model process after every case and after interruption.

### Candidate and dependency isolation

- Candidate intake assigns stable content-free candidate IDs before implementation.
- Each candidate manifest records exact engine library, model artifact, voice artifact, runtime/provider, precision, and relevant configuration.
- Exact library and transitive dependency versions are locked per candidate evaluation environment.
- Model and voice artifacts are identified by immutable revision and checksum when the upstream distribution permits it.
- Candidate-specific libraries do not enter `services/tts` production dependencies merely because they are benchmarked.
- The normal root install and root checks remain model-free, GPU-free, and free of candidate package installation.
- Candidate install scripts, native binaries, licenses, transitive packages, runtime capabilities, and known security advisories receive the same review required by `docs/development/dependencies.md`.
- Setup and model acquisition are explicit commands. Neither import nor test collection may download a model.
- Removal of a rejected candidate must be possible by deleting its isolated adapter/project/lock while retaining its content-free report and decision rationale.

### Corpus policy

The benchmark corpus is separate from the Milestone 5 normalization corpus:

- Milestone 5 remains the authority for exact text transformation and locator mapping.
- The TTS corpus consumes already-prepared synthetic text and does not test normalization correctness.
- Each case records only a stable case ID, language policy, category tags, size tier, and the synthetic text supplied to the engine.
- All candidates receive byte-for-byte equivalent text in the same performance order.
- Listener presentation order is separately randomized and blinded so candidate identity does not influence scoring.
- Size tiers include a short interactive request, representative `narration-v1` target-sized segments, admitted near-hard-sized segments, and a bounded sustained sequence.
- The corpus includes Spanish punctuation and dialogue, abbreviations and initials, cardinals/ordinals, decimal and thousands separators, valid dates and times, currencies and percentages, code, combining sequences, astral characters, and an embedded foreign name.
- Corpus integrity tests prove provenance, uniqueness, immutability, UTF-8/code-point measurements, category coverage, and absence of private/copyrighted fixtures.
- Changing a corpus text, order, scoring tag, or size tier after official candidate runs begins creates a new corpus version and invalidates direct comparison with the old version.

### Measurements and report policy

The pre-result `tts-feasibility-profile-v1` document must freeze:

- official corpus version and order;
- candidate manifest version;
- cold-start and warm-run counts;
- warm-up policy;
- sustained-run duration or generated-audio target;
- timing clock and timing boundaries;
- percentile method;
- memory/VRAM sampling method and unavailable-value behavior;
- cancellation checkpoints and timeout policy;
- quality rubric and aggregation method;
- numeric feasibility gates;
- report schema version; and
- invalid-run and rerun rules.

At minimum, official reports record:

- source revision and whether the tree was clean;
- benchmark protocol/corpus/candidate versions;
- operating system, Python, engine, runtime/provider, model, voice, and driver versions;
- CPU model and logical processor count;
- total system RAM;
- GPU model and total VRAM when relevant and reliably queryable;
- model/voice artifact sizes and immutable revisions/checksums when available;
- cold model-load duration;
- warm-up duration;
- time to first produced audio;
- time to approximately 15 seconds of contiguous produced audio, or completion time for a shorter complete case;
- generated media duration computed from samples and sample rate;
- wall-clock generation duration;
- per-case and aggregate real-time factor;
- p50 and p95 for the frozen latency and throughput dimensions;
- peak process-tree RAM and, when reliable, peak VRAM;
- native output sample rate, channel count, sample representation, streaming granularity, and whether output is complete-waveform only;
- cooperative-cancellation behavior, cancellation-request-to-stop latency, late completion, and worker-termination behavior as separate fields;
- success, timeout, cancellation, resource, and internal-failure counts;
- offline-run outcome;
- bounded quality scores and evaluator limitations;
- license identifier, redistribution status, and packaging/download constraints; and
- fixed notes for unavailable measurements or deviations.

The report serializer uses an allowlist. Arbitrary adapter dictionaries, exception strings, model objects, environment values, or library diagnostics cannot be merged into a summary.

### Feasibility and selection gates

Numeric latency, throughput, memory, cancellation, and quality thresholds are not yet accepted repository facts. Milestone 1 freezes them before official candidate execution, records their rationale, and prohibits post-result adjustment without a new protocol version and complete rerun.

Every viable selected profile must also pass these non-negotiable gates:

- local execution after explicit setup;
- offline official benchmark execution;
- no sensitive text or generated audio in committed or diagnostic output;
- exact version/artifact identity sufficient for reproduction;
- license and terms compatible with the intended use, with redistribution status explicit;
- Windows compatibility on the measured configuration;
- bounded input and output handling;
- no silent network, telemetry, or unbounded cache behavior;
- measured errors and cleanup;
- output metadata sufficient for a later audio integration decision without selecting that decision now; and
- no hardware claim beyond configurations actually measured.

The balanced role prioritizes acceptable Spanish quality while meeting the frozen responsiveness, sustained-throughput, memory, and cancellation gates on a declared accelerated configuration.

The compatibility role must be measured with acceleration disabled on a declared CPU configuration. It may use a different engine/model/voice, but it must meet its own frozen quality, throughput, memory, and operational gates. A GPU-capable candidate is not a CPU fallback merely because it can technically initialize on a CPU.

If no candidate passes a role, record no viable selection. Do not lower the gate after seeing results, label an unsupported capability as supported, or continue to Milestone 7 as though the role were solved.

### Relationship to later milestones

- Milestone 6 may produce benchmark adapters and profile evidence, not the production service.
- Milestone 7 owns the selected production engine adapter, service lifecycle, transport, runtime protocol, and cancellation/stale-result boundary.
- Milestone 8 owns the audio payload format, bounded queue, playback API, playable-duration startup gate, and underrun instrumentation.
- Milestone 9 owns desktop narration start, highlighting, following, seek, and shared reading position.
- Milestone 10 owns product hardware detection, end-user profile selection/fallback, and support policy.
- Milestone 11 owns model/runtime distribution, installer size, signing, updater policy, and complete product validation.

## Milestones

## Milestone 1: Freeze the evaluation authority before results

### Task 1.1: Inventory candidates and isolate benchmark dependencies

**Specific outcome:** A reviewed candidate matrix identifies the exact engine/model/voice/runtime combinations entering the evaluation and the uv-supported isolation layout used for each candidate without changing production dependencies.

#### Work

- Review current official documentation, release artifacts, licenses, model cards, and security/maintenance state for the project-brief candidates and credible alternatives.
- Assign stable candidate IDs and one or more intended roles without declaring a winner.
- Record exact library versions, model/voice revisions, supported providers, Python/platform requirements, artifact sizes, download sources, checksums when available, licenses, redistribution terms, offline controls, and install hooks.
- Reject candidates that require remote inference, upload text, lack a usable license, cannot be pinned sufficiently for reproduction, or cannot run locally on the Windows/Python boundary.
- Prototype the smallest uv-supported candidate isolation layout.
- Prove candidate installation does not alter the default `services/tts` production dependency set or require candidate packages in root CI.
- Update `docs/development/dependencies.md` with benchmark-only classification and removal instructions before accepting a candidate lock.

#### Validation

- Current command before candidate work:

  ```powershell
  uv sync --project services/tts --locked
  uv run --project services/tts --locked pytest services/tts
  ```

- Task-added candidate commands must use exact checked-in project paths and `--locked`.
- A clean default environment imports and tests `voxleaf_tts` without any candidate engine installed.
- Candidate installation and acquisition are separate, explicit steps.
- Lockfile review shows no unrecorded source, editable external checkout, floating Git branch, or runtime network dependency.

#### Expected result

At least one credible candidate is admitted for each role, or the plan records an early no-candidate blocker with evidence. Admission is not selection.

#### Actual result

Completed on 2026-07-25.

- `benchmarks/tts/candidates-v1.json` admits
  `qwen3-tts-0-6b-customvoice-cuda-bf16-v1` for the balanced role and
  `supertonic-3-onnx-cpu-f1-es-v1` for the compatibility role without
  selecting a winner.
- The manifest pins engine distributions, model revisions, model/voice
  checksums when published, roles, providers, precision, offline controls,
  licenses, redistribution posture, install boundaries, and known risks.
- Qwen uses the official `qwen-tts==0.1.1` package, immutable
  `Qwen3-TTS-12Hz-0.6B-CustomVoice` revision, embedded `Aiden` voice, and
  PyTorch `2.9.1+cu128` with SDPA. Optional FlashAttention is excluded.
- Supertonic uses the official `supertonic==1.3.1` package, immutable
  `Supertone/supertonic-3` revision, checksum-pinned F1 voice, Spanish mode, and
  ONNX Runtime CPU execution. Its OpenRAIL-M obligations remain explicit for
  the Task 3.4 packaging audit.
- Both locks apply a seven-day release-age cutoff. Kokoro's default Python
  profile, `kokoro-onnx` release assets, hosted Qwen APIs, XTTS v2, and an
  unspecified Piper profile are recorded as not admitted with fixed reasons.
- Candidate projects and locks live below
  `services/tts/benchmarks/candidates/`; the production service manifest and
  lock remain dependency-free and unchanged.
- `docs/development/dependencies.md` records setup isolation, removal, and the
  remaining Task 3.4 audit.
- `uv lock --check` passes for both candidate projects. The resolved direct
  graphs are `qwen-tts 0.1.1` with PyTorch/Torchaudio `2.9.1+cu128`, and
  `supertonic 1.3.1` with ONNX Runtime `1.27.0`; neither lock contains a
  Git/editable source or install-hook marker.
- Default `services/tts` sync and its three existing tests pass, and import
  probes confirm that neither candidate package is present in that default
  environment. `pnpm.cmd format:check`, JSON parsing, and `git diff --check`
  also pass at this checkpoint.

#### Status

Complete.

### Task 1.2: Create the synthetic corpus and privacy policy

**Specific outcome:** One versioned repository-authored corpus and its integrity tests provide identical safe prepared text to every candidate.

#### Work

- Create the benchmark corpus below `benchmarks/tts/`.
- Record provenance, category tags, language policy, size tier, and stable case IDs.
- Derive category coverage and size boundaries from the accepted Milestone 5 policy without importing its test-only TypeScript table at Python runtime.
- Add privacy canaries distinct from report-safe identifiers.
- Add an ignored raw-output layout and a deterministic cleanup policy.
- Add tests proving the corpus and reports never contain a private path, book fixture, or generated audio.

#### Validation

- Corpus integrity tests pass under the existing Python test command.
- Exact corpus code-point and UTF-8 measurements are deterministic.
- Repeated corpus loads are byte-for-byte stable.
- Test failure messages identify only case IDs and fixed codes.
- `git ls-files` contains no model, audio, book, cache, raw report, or private data.

#### Expected result

The same immutable corpus can be consumed by every candidate adapter without model-specific rewriting.

#### Actual result

Completed on 2026-07-25.

- `benchmarks/tts/corpus-v1.json` freezes 12 repository-authored synthetic
  Spanish cases in one candidate-independent order. It covers punctuation and
  dialogue, abbreviations and initials, cardinals and ordinals, decimals and
  thousands, dates and times, currency and percentages, code spans, a
  decomposed combining sequence, an astral character, and an embedded foreign
  name.
- Stable short, 308-code-point target, and 637-code-point near-hard cases stay
  within the implemented `narration-v1` 320/640 code-point and 1,024/2,048-byte
  boundaries. The 12-entry sustained sequence is fixed and totals 3,139 code
  points, below the 8,192-code-point batch ceiling.
- Provenance, CC0 dedication, Spanish language policy, exact code-point/UTF-8
  counts, size classes, tags, case IDs, performance order, and metadata-only
  privacy canaries are checked in with the text.
- The corpus SHA-256 is frozen in the Python integrity test. The test also
  proves canonical UTF-8/LF bytes, count accuracy, case/canary uniqueness,
  category/Unicode coverage, order and sustained-sequence validity, ignored
  raw output, forbidden tracked suffixes, and absence of corpus text, canaries,
  or private paths from reviewable benchmark artifacts.
- Failure evidence is restricted to `tts-corpus-authority:<fixed-code>:<case-id>`.
  Focused Ruff formatting/lint, strict mypy, and all three corpus tests pass.
- `benchmarks/tts/README.md` now defines the ignored per-session raw layout and
  path-verified cleanup policy for completion, rejection, timeout,
  cancellation, or interrupted setup.

#### Status

Complete.

### Task 1.3: Accept the feasibility profile and selection rubric

**Specific outcome:** `docs/architecture/tts-feasibility-profile-v1.md` freezes the benchmark procedure and numeric gates before official measurements.

#### Work

- Define timing boundaries for load, warm-up, first produced audio, 15 seconds of produced audio, shorter-complete output, and sustained generation.
- Define generated-duration and real-time-factor arithmetic from actual sample metadata.
- Define at least five independent cold-load observations and at least twenty warm generation observations per candidate/hardware profile unless a pre-result pilot justifies a stricter protocol.
- Define the sustained sequence length, cancellation trials, timeout values, and cleanup observations.
- Define p50/p95 calculation and minimum sample requirements.
- Define RAM/VRAM collection and explicit `unavailable` semantics.
- Define balanced and compatibility numeric gates.
- Define the blinded listening rubric, evaluator instructions, scoring scale, and limitations.
- Define which deviations invalidate a run and when every candidate must be rerun.
- Define the benchmark-local summary schema and privacy allowlist.
- Review the approximately 15-second lead correctly: the benchmark measures how quickly that media duration is produced; it does not add a fixed timer or implement playback.

#### Validation

- The profile is linked from this plan and the performance budget.
- A schema/fixture test rejects sensitive text, unknown fields, negative values, inconsistent media-duration arithmetic, unsupported versions, and invalid percentiles.
- The gates are committed before the first official candidate result.
- Review confirms no gate is copied from an observed winner.

#### Expected result

Official runs have one stable authority and cannot be tuned after seeing candidate rankings.

#### Actual result

Completed on 2026-07-25.

- [`tts-feasibility-profile-v1.md`](../../architecture/tts-feasibility-profile-v1.md)
  was frozen before any engine execution or official result. It fixes five
  process-cold loads, one excluded warm-up, 24 warm generations, at least 180
  seconds of sustained media, five ordered cancellation trials, monotonic
  timing boundaries, sample-derived media/RTF arithmetic, nearest-rank p50/p95,
  50 ms memory sampling, explicit `unavailable` semantics, timeouts, cleanup,
  invalidation, and all-candidate rerun rules.
- The approximately 15-second value is measured only as produced media frames.
  The protocol adds no sleep, timer, padding, playback, or fixed wall-clock
  wait, and records shorter complete output separately.
- Balanced CUDA and compatibility CPU roles have separate conjunctive latency,
  RTF, RAM/VRAM/provider, cancellation, offline, privacy, artifact, license,
  cleanup, and Spanish quality gates. Missing measurements and failed official
  observations cannot be averaged away.
- The blind rubric requires at least three fluent Spanish evaluators, a fixed
  1-5 scale, independently randomized candidate labels, seven dimensions,
  median-per-case aggregation, explicit limitations, and zero
  meaning-changing repeat/skip/truncation defects.
- `benchmarks/tts/schemas/summary-v1.schema.json` is an allowlist-only private
  Draft 2020-12 report schema. It has no text, audio, path, URL, environment,
  exception, log, prompt, or free-form note field and rejects unknown fields at
  every object boundary.
- The checked-in valid report fixture is explicitly a synthetic schema fixture,
  not a candidate result. Schema and semantic tests recompute durations, RTF,
  sustained totals, nearest-rank distributions, counts/order, cancellation,
  and role-specific RAM/VRAM behavior.
- Mutation tests reject sensitive text, unknown fields, negative values,
  unsupported versions, inconsistent duration/RTF arithmetic, and invalid
  percentiles. Focused Ruff, strict mypy, and all six benchmark-authority tests
  pass.
- The performance budget, documentation index, testing strategy, roadmap, and
  canonical system diagram now identify Milestone 6 as in progress with only
  its evaluation authority implemented. No model result, selection, runtime
  dependency, playback behavior, or hardware claim is documented.

#### Status

Complete.

## Milestone 2: Build the bounded candidate-neutral benchmark

### Task 2.1: Implement the harness, report sanitizer, and fake adapter

**Specific outcome:** A benchmark-neutral Python harness can drive a deterministic fake engine and produce a versioned content-free report without real models or hardware.

#### Work

- Define a narrow benchmark-only adapter interface for load, warm-up, generate, cancel, close, and capability observation.
- Keep the interface independent of the future process transport and shared runtime protocol.
- Use monotonic high-resolution timing.
- Compute media duration from sample count and sample rate, never from file size or wall clock.
- Add bounded observation for streaming chunks and complete waveforms.
- Add fixed timeout, cancellation, crash, resource, unavailable-measurement, and cleanup outcomes.
- Capture candidate stdout/stderr in a bounded redaction boundary and publish only fixed codes.
- Implement the report allowlist and raw-to-summary promotion gate.
- Add a deterministic fake adapter for exact timing, output, cancellation, late completion, failure, memory-sample, and cleanup tests.
- Add explicit root benchmark scripts only when their command, environment, offline behavior, and candidate dispatch are implemented. Keep them outside `pnpm.cmd check` and CI.

#### Validation

- Existing focused commands:

  ```powershell
  uv run --project services/tts --locked ruff format --check services/tts
  uv run --project services/tts --locked ruff check services/tts
  uv run --directory services/tts --locked mypy .
  uv run --project services/tts --locked pytest services/tts
  ```

- Deterministic tests use no real sleep, engine, model, audio device, network, GPU, or private data.
- Exact timing and arithmetic fixtures produce stable summaries.
- Unknown adapter fields and exception messages cannot cross the report serializer.
- Privacy canaries never appear in stdout, stderr, report JSON, report Markdown, filenames, or test snapshots.
- Cancellation and timeout leave zero fake work pending.

#### Expected result

The harness and sanitizer are trustworthy before a large third-party model stack is admitted.

#### Actual result

Completed on 2026-07-25.

- Added a private `services/tts/benchmarks` package with a typed synchronous
  adapter protocol for capability observation, load, warm-up, payload-free
  generation metadata, cancellation, and close. The package is included in
  strict mypy checks but remains outside the built `voxleaf_tts` production
  package and root export.
- The harness retains integer monotonic nanoseconds until serialization,
  derives media duration only from per-channel sample frames and sample rate,
  enforces one 640-code-point request plus explicit chunk/sample/rate/channel
  bounds, and never accepts or retains waveform payload.
- Candidate stdout and stderr are redirected into a 65,536-byte transient
  boundary. It records only counts/truncation/sensitive-value presence,
  discards captured bytes, and converts adapter exceptions to fixed codes.
- The allowlisted builder constructs every summary field explicitly. Promotion
  validates the checked-in schema, recomputes counts, order, duration, RTF,
  nearest-rank distributions, sustained totals, cancellation gates, and role
  memory constraints, rejects private paths and corpus canaries, and emits
  canonical JSON plus content-free Markdown without writing a file.
- A manual-clock fake executes all five cold observations, the excluded
  warm-up, 24 warm requests, a 180-second sustained round, and all five
  cancellation trials without sleeping, networking, hardware, candidate
  packages, models, audio devices, files, or waveform allocation.
- Focused Ruff, strict mypy over 13 source files, and the complete Python suite
  pass 14 tests. Exact/max-plus-one input and output bounds, timing arithmetic,
  diagnostic truncation, sensitive stdout/stderr, raw exception redaction,
  unknown summary fields, arithmetic drift, private paths, filename canaries,
  cancellation cleanup, and schema-valid promotion are covered.

#### Status

Complete.

### Task 2.2: Implement thin adapters for every admitted candidate

**Specific outcome:** Each candidate runs behind the same harness while retaining an isolated, exact dependency and artifact identity.

#### Work

- Implement only the minimum adapter code required for the frozen benchmark.
- Keep model-specific tokenization and preprocessing inside the adapter.
- Do not change `narration-v1` or shared narration contracts to fit a candidate.
- Map native output to benchmark-local sample metadata without selecting the production audio format.
- Report native streaming, complete-waveform, sample-rate, channel, precision, and cancellation behavior honestly.
- Suppress or contain content-bearing third-party diagnostics.
- Fail closed when an artifact revision, provider, precision, voice, or offline mode does not match the candidate manifest.
- Add deterministic adapter tests using mocked candidate libraries where practical.

#### Validation

- Each candidate project installs from its own checked-in exact lock.
- Import and manifest tests run without loading weights.
- An unavailable model/provider returns a fixed result without downloading.
- An official candidate run with network access unavailable reaches only local artifact paths.
- No model-specific package becomes a production dependency or default root-CI dependency.
- Adapter output contains no input text, raw audio, private path, or arbitrary library error.

#### Expected result

Every admitted candidate can run through the identical measurement boundary without widening product architecture.

#### Actual result

Completed on 2026-07-25.

- Added one benchmark-only adapter for each admitted profile. Neither adapter
  imports its candidate package at module import or test-collection time, and
  neither candidate dependency entered the production TTS project or root
  dependency graph.
- A fail-closed manifest loader admits only the frozen Qwen and Supertonic
  candidate IDs and maps only their exact roles, distributions, versions,
  model revisions, voices, providers, precisions, output rate, and allowlisted
  artifact checksums into typed adapter configuration.
- Local artifact verification resolves every allowlisted relative path beneath
  an absolute local root, streams SHA-256 calculation in one-MiB reads, and
  rejects missing, unreadable, escaping, or mismatched files before importing
  a candidate package. Failures contain only fixed codes.
- The Qwen adapter requires the frozen CUDA/bfloat16/SDPA profile, CUDA and
  bfloat16 availability, `HF_HUB_OFFLINE=1`,
  `TRANSFORMERS_OFFLINE=1`, and `local_files_only=True`; it invokes the frozen
  Spanish `Aiden` CustomVoice API from the verified local model directory.
- The Supertonic adapter requires the frozen ONNX Runtime CPU/float32 profile,
  CPU execution availability, `HF_HUB_OFFLINE=1`, and
  `TTS(auto_download=False, model_dir=<verified-local-root>)`; its internal
  300-code-point behavior and Spanish `F1` settings remain adapter-local.
- Both selected public APIs are reported as complete-waveform/float32 and
  yield only sample count, sample rate, channel count, request identity, and
  end-of-output metadata after releasing the waveform reference. Neither
  engine exposes cooperative cancellation through the selected API, so both
  report worker termination instead of overstating native capability.
- Five model-free adapter tests cover exact manifest loading, no-import
  missing-artifact failure, local-path-only calls, provider/runtime/profile
  matching, checksum failure redaction, candidate-specific generation
  settings, complete-waveform metadata, cleanup, and honest cancellation.
  Focused Ruff, strict mypy over 18 source files, and 10 focused tests pass.

#### Status

Complete.

### Task 2.3: Prove bounds, cancellation observation, and cleanup on real adapters

**Specific outcome:** Candidate adapters cannot leave unbounded output, stale results, or loaded child/model processes after success, cancellation, timeout, or failure.

#### Work

- Exercise short, target-sized, near-hard-sized, timeout, and cancellation cases.
- Distinguish native cooperative cancellation from worker termination.
- Track late output by benchmark request identity and discard it.
- Bound retained audio and captured diagnostics.
- Verify sequential operation does not grow model/process count.
- Verify model close and benchmark interruption release resources to the extent supported.
- Record unsupported cleanup or cancellation as a feasibility risk rather than hiding it.

#### Validation

- Exact bound tests pass and max-plus-one harness values fail content-free.
- Repeated cases retain one active candidate/model profile.
- Timeout and interruption leave no benchmark child process.
- Late output cannot enter the next case or summary.
- Raw output remains ignored and disposable.

#### Expected result

The benchmark can safely proceed to official hardware runs.

#### Actual result

Completed on 2026-07-25.

- Added a spawn-isolated candidate-neutral worker wrapper. Sensitive requests
  cross only a private multiprocessing pipe, never OS command-line arguments or
  environment variables, and the child returns one bounded `AudioChunk`
  metadata record at a time with pipe backpressure. Waveform payload never
  crosses the boundary.
- Child stdout and stderr are captured by the same 65,536-byte discard
  boundary, including request text as a privacy canary. Child exceptions and
  malformed responses collapse to the frozen failure taxonomy; arbitrary
  messages, tracebacks, paths, environment values, and adapter objects do not
  cross IPC.
- Worker-side chunk and sample-frame totals use the same 4,096-chunk and
  115,200,000-frame hard limits as the harness. The parent enforces the frozen
  load/request/termination/cleanup timeouts and converts timeout, crash,
  resource, privacy, and cleanup outcomes into fixed harness failures.
- Forced cancellation closes the pipe, terminates the exact Windows process
  tree (or POSIX process group), waits for exit, rejects every later frame by
  request identity, and automatically starts a newly loaded worker for a later
  trial. Success and close also leave no worker.
- The harness now understands fixed adapter-operation outcomes and rejects an
  end-of-output frame as evidence for `after-first-audio`,
  `after-five-media-seconds`, or `near-hard-mid-generation` cancellation. This
  prevents the admitted complete-waveform APIs from receiving false
  mid-generation cancellation credit.
- Exact candidate dispatch is spawn-safe and observes capabilities without
  importing Qwen, Supertonic, PyTorch, or ONNX Runtime in the parent. Direct
  candidate adapters retain at most one model reference and release it on
  close; Qwen additionally releases the CUDA cache through its frozen runtime.
- Four isolation tests cover worker replacement, one active profile,
  timeout, max-plus-one output, hard process cleanup, late-output isolation,
  complete-output cancellation rejection, and private-value-free
  representation. Together with the adapter and harness suites, focused Ruff,
  strict mypy over 22 source files, and 16 focused tests pass.
- No hardware/model run was performed or required for this milestone.
  Unsupported real-engine cancellation or cleanup remains a measurable
  feasibility risk for the official hardware phase rather than an
  implementation claim.
- The canonical system diagram was reviewed. This private benchmark worker
  does not change the documented production component, process, persistence,
  or runtime data-flow boundaries, so no diagram change was warranted.
- Final validation passed the complete 25-test Python suite, both exact
  candidate lock checks and install dry runs, the production sdist/wheel build
  with no benchmark or candidate code packaged, and the authoritative native
  Windows `pnpm.cmd check` including formatting, lint, TypeScript/Python type
  checks, 940 JavaScript/TypeScript/Node tests, 25 Python tests, Rust checks,
  and the release Tauri and Python builds.

#### Status

Complete.

## Milestone 3: Execute reproducible performance and quality evaluation

### Task 3.1: Record the official hardware and run preflight

**Specific outcome:** Every official run is tied to a minimal reproducible hardware/software description and a clean, offline-capable benchmark setup.

#### Work

- Record the exact source revision and require a clean tree for official results.
- Record only approved non-private hardware/software fields.
- Record power source/mode, provider, precision, driver, and acceleration state where they materially affect inference.
- Verify candidate artifacts and checksums.
- Verify free RAM, VRAM, and disk headroom before loading.
- Verify the benchmark succeeds after network access is unavailable.
- Run a non-comparable pilot only to find harness defects, not to tune selection gates.
- Delete pilot raw output before official runs.

#### Validation

- Preflight rejects dirty revisions, wrong artifacts, insufficient declared resources, unexpected network access, unsupported provider/precision, and missing offline controls.
- Summary hardware fields contain no hostname, serial, UUID, username, account, absolute path, or unrelated process information.
- The pilot is labeled non-official and cannot enter the selection matrix.

#### Expected result

Official measurements are attributable to a known, privacy-safe local configuration.

#### Actual result

Completed on 2026-07-25.

- Added a deterministic, fail-closed preflight boundary and a private-stdin
  root command. It binds an official request to one exact clean commit,
  admitted manifest profile, verified local artifact set, candidate
  interpreter, Windows x86-64/Python 3.12 host, AC power, recorded power mode,
  operator-confirmed sleep/background/thermal conditions, and role-specific
  RAM/VRAM/disk headroom.
- Offline proof is not a caller assertion. The production probe requires one
  enabled outbound-block Windows Firewall rule for the exact candidate Python
  interpreter in addition to the frozen Hugging Face/Transformers offline
  controls. Private model/interpreter paths enter only through bounded stdin
  and never enter the allowlisted receipt.
- Artifact SHA-256 verification now also returns only stable artifact ID, hash,
  and measured byte size. Pilot receipts can pass setup but are structurally
  ineligible for official execution or promotion.
- Eight focused preflight/command tests cover exact pass, non-promotable pilot,
  dirty/mismatched revision, wrong or missing artifact, offline/network
  failure, resource/power/sleep/operator gates, platform/profile rejection,
  closed input, and private-path exclusion. Focused Ruff and strict mypy over
  26 source files pass.
- The observed native host has Windows build 26200, an Intel Core Ultra 7
  255HX with 20 logical processors, 32 GB RAM, an NVIDIA GeForce RTX 5060
  Laptop GPU with 8,151 MiB VRAM and driver 577.05, ample disk, and AC power.
  This is setup evidence only, not an official candidate result.
- Both candidate environments now install from their exact locks. The Qwen
  environment occupies 5,165,928,540 bytes and reports `qwen-tts 0.1.1`,
  `torch 2.9.1+cu128`, available CUDA/bfloat16, and the expected RTX 5060.
  The Supertonic environment occupies 111,602,972 bytes and reports
  `supertonic 1.3.1`, `onnxruntime 1.27.0`, CPU device, and the package's
  source-confirmed `CPUExecutionProvider` default.
- The immutable Qwen and Supertonic snapshots were acquired into ignored
  local model storage. Their measured snapshot sizes are 2,498,444,461 and
  414,741,773 bytes respectively. Every manifest SHA-256 matches, including
  Qwen's 1,811,626,576-byte primary model, all four Supertonic ONNX files, and
  the 292,046-byte `F1` voice style. Git ignore checks cover both environments
  and both model roots.
- The prior 45-minute AC sleep setting was observed and retained for
  restoration. An administrator created the exact application-scoped
  outbound firewall rule for the Supertonic interpreter, and AC sleep was
  disabled for the official session.
- The Supertonic compatibility-profile preflight passed from clean commit
  `64e8324f9426c381dcac1d013264ba9fcb833065`. It verified the exact five
  artifacts, offline control, interpreter-specific firewall isolation, AC
  power, balanced power mode, 11,009,933,312 free RAM bytes, 8,151 MiB total
  VRAM, 7,810 MiB free VRAM, and 665,578,512,384 bytes free disk. The receipt
  contained only allowlisted content-free host and artifact fields.
- At this preflight checkpoint, no model or pilot had run. The balanced Qwen
  preflight still required replacing the temporary rule with one for its exact
  interpreter and restoring at least 12 GiB free RAM; the observed
  11,009,933,312 free bytes did not meet that frozen headroom gate.
- A later bounded CUDA allocation probe established a more fundamental
  balanced-role blocker before the Qwen model loaded. This RTX 5060 uses WDDM,
  and `nvidia-smi --query-compute-apps=pid,used_gpu_memory` returned `[N/A]`
  for the exact allocating PID. NVIDIA documents that NVML process
  `usedGpuMemory` is always unavailable under WDDM because Windows KMD owns
  memory management
  ([NVML process-info reference, retrieved 2026-07-25](https://docs.nvidia.com/deploy/nvml-api/structnvmlProcessInfo__v1__t.html)).
  The frozen profile requires reliable process-attributed NVML VRAM and
  forbids substituting zero or whole-device usage. Therefore an official Qwen
  preflight/run cannot become valid on this host even if its firewall rule and
  free-RAM conditions are changed.
- On 2026-07-25 the maintainer approved a new `v2` authority rather than
  requiring unavailable replacement hardware. The replacement measurement
  must use PyTorch's allocator high-water mark for transient CUDA allocations
  and the host's PID-tagged WDDM dedicated-memory counter as an independent
  process-attribution cross-check. The old result is not comparable to `v2`;
  every candidate must rerun.
- The approved `v2` path passed deterministic tests and a native disposable
  CUDA attribution probe. Qwen's official preflight and pilot then passed from
  clean commit `76f27d1ff41b4d4ea1e20341b9a4cd9d86b3f8ff` after the maintainer
  closed Chrome to restore the frozen RAM headroom. Supertonic's official
  preflight and pilot passed from clean commit
  `a0640fe7ff1c3bde4ceb68ba8e89cb57150adaac`. Both exact artifact sets,
  interpreters, offline controls, application-scoped firewall blocks, power
  conditions, and role-specific resource headroom were therefore proven
  before their comparable matrices.
- Final cleanup restored AC sleep to 45 minutes and removed every temporary
  benchmark firewall rule.

#### Status

Complete — both admitted `v2` profiles passed clean, exact, offline-capable
official preflight and disposable pilot validation before their complete
matrices, and host controls were restored afterward.

### Task 3.2: Run cold, warm, sustained, cancellation, and failure matrices

**Specific outcome:** Every admitted candidate has complete numeric evidence for each hardware mode and intended role.

#### Work

- Run the frozen cold-load repetitions.
- Run the frozen warm short/target/hard corpus sequence.
- Run the sustained sequential-generation sequence.
- Run cancellation trials at the frozen checkpoints.
- Run missing-artifact, unsupported-provider, timeout, and resource-failure cases.
- Capture ignored raw results first.
- Promote a summary only after schema, arithmetic, privacy, completeness, and reproducibility validation passes.
- Repeat invalid or materially deviating runs for every candidate under the protocol's rerun rule.

#### Validation

- Every candidate summary has the same required case and metric set.
- Percentiles meet the frozen minimum sample counts.
- Generated duration equals sample count divided by sample rate within the profile's exact arithmetic rule.
- First-audio and 15-second-production measurements retain distinct meanings.
- Streaming unsupported candidates do not claim a pre-completion first chunk.
- CPU-compatible runs have acceleration disabled and verified.
- Reports contain no text or audio.

#### Expected result

The repository contains comparable content-free evidence, not anecdotal console output.

#### Actual result

Completed on 2026-07-25.

- Added the closed `benchmark:tts:measure` supervisor. It repeats preflight,
  launches only the exact candidate interpreter, repeats preflight inside that
  interpreter, and accepts private paths only through bounded standard input.
- Added the disposable non-comparable pilot path and official protocol
  dispatch. Pilot execution retains no raw session. Official execution writes
  one UUID-named ignored journal containing only fixed IDs, integer
  nanoseconds, sample metadata, numeric resource observations, and fixed
  failures; waveform samples and candidate diagnostics are discarded.
- Added a dependency-free native Windows process-tree sampler that enumerates
  only numeric PID/parent-PID relationships, samples descendant working sets
  every 50 milliseconds, subtracts the pre-load baseline, and reports no
  process names, command lines, paths, or unrelated processes. CPU runs record
  VRAM as unavailable and zero GPU allocations. Balanced execution fails
  closed when the host cannot supply its required process-attributed VRAM.
- The harness now enforces the frozen 900-second sustained-phase timeout,
  journals each completed observation before later phases, runs all five
  cancellation trials even when one fails, and retains a bounded failed-run
  journal rather than erasing earlier valid numeric evidence.
- Supertonic now verifies that all four loaded ONNX sessions select exactly
  `CPUExecutionProvider`; provider availability alone is no longer accepted.
- Model-free focused validation covers the command output allowlist,
  interpreter binding, pilot lifecycle, raw bounds/privacy, memory baseline
  arithmetic, native PID-tree smoke, exact provider selection, continued
  cancellation behavior, and the existing protocol.
- The first disposable Supertonic pilot failed with the fixed
  `generation-failed` code and retained no session. Investigation found that
  the mock had modeled `TTS.synthesize` as returning a bare waveform although
  installed Supertonic 1.3.1 returns `(waveform, duration)`. The adapter and
  regression fake now match the installed public API; no gate, corpus, or
  result was changed.
- The corrected pilot passed from clean commit
  `56bd9894fd582375dd1b45e384155705f14f07cb`: the exact CPU profile loaded,
  one frozen Spanish case generated locally, the waveform was discarded, the
  worker closed, and no raw session was retained. This pilot is explicitly
  non-comparable and cannot enter a summary.
- The official Supertonic matrix ran from clean commit
  `532e2c740f463ff09ebfce9581a68462307ae7ab`. Its ignored 10,159-byte raw
  journal contains five cold loads, 24 warm generations, 12 sustained
  generations, five cancellation trials, one numeric memory observation, and
  fixed failure codes. A corpus-text/canary scan and absolute-path scan both
  returned zero findings; the directory contains no audio.
- Content-free CPU results were: cold-load p95 `1.7466072` seconds; warm
  first-produced-audio p95 `12.1117541` seconds; warm 15-seconds-of-media p95
  `13.5122745` seconds over four reaching outputs; warm shorter-complete p95
  `2.8935058` seconds over 20 shorter outputs; warm RTF p95
  `0.53917248046875`; sustained request RTF p95 `0.632854423828125`; total
  sustained RTF `0.30936313618694034` over `233.62244897959187` generated
  seconds; peak descendant RAM above baseline `668860416` bytes; unavailable
  CPU-role VRAM; and zero GPU allocations.
- The compatibility profile passes cold load, 15-second production,
  shorter-complete, warm RTF, sustained RTF, total sustained RTF, RAM, and
  zero-GPU gates. It fails warm first-audio (`12.1117541 > 5` seconds) and
  cancellation. `before-dispatch` and `accepted-before-audio` passed by worker
  termination; `after-first-audio`, `after-five-media-seconds`, and
  `near-hard-mid-generation` failed because the complete-waveform API exposed
  no valid mid-generation boundary.
- The balanced Qwen matrix did not start and no Qwen model loaded. The host's
  WDDM driver cannot supply the protocol's mandatory process-attributed NVML
  VRAM value, so substituting another metric would invalidate the frozen
  authority.
- The prior 45-minute AC sleep timeout was restored after measurement.
  Non-administrator removal of the exact temporary Supertonic firewall rule
  initially returned access denied. The administrator subsequently removed
  it, and `netsh advfirewall firewall show rule` confirmed that no matching
  rule remains.
- The first authoritative root check after candidate installation exposed
  that ESLint did not recursively ignore nested `.venv` directories and
  attempted to lint third-party candidate bundles. The root lint ignore now
  excludes every `.venv` recursively; candidate code remains isolated and
  unreviewed vendor files no longer enter repository lint scope.
- The approved `v2` implementation replaces the unavailable NVML signal with
  a dependency-free native PDH reader for
  `GPU Process Memory(*)\Dedicated Usage`. It collects at the documented
  one-second maximum frequency, aggregates only numeric instances belonging to
  the recursively discovered worker process tree, and retains no PID, LUID,
  instance name, process name, path, or unrelated-process value.
- The exact Qwen adapter resets PyTorch peak statistics immediately before
  model load and reports only `max_memory_reserved()` bytes after successful
  load, warm-up, generation, and close commands. The spawn-isolated parent
  retains the maximum across replacement workers. Balanced measurement now
  requires positive WDDM and PyTorch peaks and uses their maximum; CPU
  measurement retains explicit unavailable VRAM and zero GPU allocations.
- Raw and reviewable authorities are versioned as
  `tts-feasibility-raw-v2`, `tts-feasibility-profile-v2`, and
  `tts-feasibility-summary-v2`. The v2 schema reuses unchanged closed v1
  definitions through an offline registered resource, while the memory object
  exposes only fixed method IDs, intervals, byte peaks, and allocation count.
- Model-free validation passes Ruff, strict mypy over 31 source files, and all
  45 Python tests. A native root-environment WDDM smoke returned a valid zero
  observation for a non-GPU process; a disposable 256-MiB CUDA allocation in
  the exact Qwen environment returned `372781056` process-dedicated bytes and
  one allocating PID without loading the model.
- The authoritative native `pnpm.cmd check` passes on the v2 implementation:
  formatting, ESLint, Rustfmt, Ruff, Clippy with warnings denied, TypeScript
  and strict Python type checks, 18 shared files/175 tests, 34 EPUB files/555
  tests, 20 desktop files/204 tests, six native WebDriver-client tests, all 45
  Python tests, Cargo tests, package/desktop release builds, and Python
  distributions. The existing Vite chunk-size advisory remains informational.
- The first clean `v2` Qwen preflight setup attempt reached the operating-system
  authorization boundary before any model load. AC sleep was temporarily
  disabled, but Windows returned access denied when the non-administrator
  process attempted to create the exact Qwen interpreter firewall rule. AC
  sleep was immediately restored to 45 minutes. No pilot, official run, raw
  session, or result was created.
- After the administrator supplied the exact firewall rule, closing Chrome
  raised free RAM from 11,785,637,888 bytes to 16,777,011,200 bytes. The clean
  official Qwen preflight then passed every gate from commit
  `76f27d1ff41b4d4ea1e20341b9a4cd9d86b3f8ff`, and the disposable pilot passed
  without retaining a session.
- The official Qwen `v2` matrix completed from that same clean commit. Its
  ignored 10,419-byte journal contains five cold loads, 24 warm generations,
  12 sustained generations, five cancellation trials, the two required VRAM
  signals, and one fixed failure. It contains zero corpus-text, privacy-canary,
  private-path, and generated-audio findings.
- Content-free balanced results were: cold-load p95 `7.2040064` seconds; warm
  first-produced-audio p95 `69.3758902` seconds; warm 15-seconds-of-media p95
  `92.8405388` seconds over four reaching outputs; warm shorter-complete p95
  `11.8831504` seconds over 20 shorter outputs; warm RTF p95
  `1.44146538043478`; sustained request RTF p95 `1.4419725`; total sustained
  RTF `1.42426716080402` over `254.72` generated seconds; peak process-tree RAM
  `2,660,442,112` bytes; peak WDDM process-dedicated VRAM `4,164,468,736`
  bytes; peak PyTorch allocator-reserved VRAM `4,026,531,840` bytes; and
  authoritative peak VRAM `4,164,468,736` bytes.
- Qwen passes cold load, RAM, VRAM, GPU-allocation, and sustained-duration
  completeness. It fails warm first audio, 15-seconds-of-media production,
  shorter-complete latency, warm RTF, sustained request RTF, total sustained
  RTF, zero-failure, and cancellation. `before-dispatch` and
  `accepted-before-audio` passed by worker termination in `0.3654485` and
  `0.2840815` seconds. The three mid-generation trials failed because the
  complete-waveform API exposed no valid cancellation boundary. AC sleep was
  restored to 45 minutes after the matrix.
- The exact firewall rule was then switched to the Supertonic interpreter.
  Its clean official preflight and disposable pilot passed from commit
  `a0640fe7ff1c3bde4ceb68ba8e89cb57150adaac`.
- The official Supertonic `v2` rerun completed from that same clean commit.
  Its ignored 10,361-byte journal contains five cold loads, 24 warm
  generations, 12 sustained generations, five cancellation trials, CPU-role
  unavailable VRAM, zero GPU allocations, and one fixed failure. It contains
  zero corpus-text, privacy-canary, private-path, and generated-audio findings.
- Content-free compatibility results were: cold-load p95 `1.7851637` seconds;
  warm first-produced-audio p95 `12.1658585` seconds; warm
  15-seconds-of-media p95 `12.952202` seconds over four reaching outputs; warm
  shorter-complete p95 `2.6426412` seconds over 20 shorter outputs; warm RTF
  p95 `0.531674546833444`; sustained request RTF p95 `0.640149345703125`;
  total sustained RTF `0.307939984424547` over `233.622448979592` generated
  seconds; and peak process-tree RAM `667,475,968` bytes.
- Supertonic passes cold load, 15-seconds-of-media production,
  shorter-complete latency, warm and sustained RTF, total sustained RTF, RAM,
  zero-GPU, and sustained-duration completeness. It fails warm first audio,
  zero-failure, and cancellation. `before-dispatch` and
  `accepted-before-audio` passed by worker termination in `0.203811` and
  `1.4079207` seconds. The three mid-generation trials failed because the
  complete-waveform API exposed no valid cancellation boundary. AC sleep was
  restored to 45 minutes after the matrix.

#### Status

Complete — both admitted candidates have complete comparable `v2` performance,
memory, cancellation, cleanup, and privacy evidence. Both fail their assigned
role gates; no performance result is promotable as a selected profile.

### Task 3.3: Run the blinded Spanish quality evaluation

**Specific outcome:** Candidate quality is scored against the frozen rubric without committing or retaining generated audio.

#### Work

- Generate the frozen listener subset under exact candidate configurations.
- Randomize presentation behind content-free sample IDs.
- Use explicit temporary-audio opt-in and ignored disposable storage.
- Score intelligibility, pronunciation, dialogue/punctuation, numbers/dates/currency, naturalness, and artifacts.
- Record aggregate scores and evaluator count/limitations only.
- Delete disposable audio and the randomization key after the summary is validated.
- Treat a single-evaluator result as limited evidence and state that limitation.

#### Validation

- Candidate identity is hidden during scoring.
- Every candidate receives the same texts and listening conversion, if any.
- No score report contains text, audio, filenames derived from text, or private paths.
- Cleanup proves zero generated-audio files remain in tracked or benchmark-temporary locations.
- A failed or interrupted listening session is not partially promoted.

#### Expected result

The selection includes reproducible bounded human quality evidence rather than speed alone.

#### Actual result

Completed on 2026-07-25.

- The maintainer confirmed fluent Spanish comprehension and approved proceeding
  as the only available evaluator. The frozen schema still requires at least
  three evaluators, so this session is limited evidence, remains ineligible for
  summary promotion, and cannot establish a passing quality gate.
- Added closed `benchmark:tts:quality:generate`, `finalize`, `submit`,
  `aggregate`, and `cleanup` commands. Generation requires explicit
  `qualityOptIn: true`, repeats official preflight in the exact candidate
  interpreter, uses one caller-known ignored session, and removes the whole
  session on failure.
- Both benchmark adapters now expose their exact waveform only to the private
  quality boundary; the performance path still discards it. The quality
  boundary applies one identical mono PCM16 conversion, caps every sample at
  120 seconds and the complete session at 512 MiB, and adds no dependency or
  product audio contract.
- Finalization requires the same 12 cases from both candidates, replaces
  identity-bearing staging names with opaque random IDs, independently shuffles
  each evaluator order, emits a local scoring page containing only case IDs and
  the frozen rubric, and removes staging before evaluation.
- Submission rejects partial, reordered, unknown, out-of-range, or incomplete
  scorecards. Aggregation applies per-case medians and dimension means, marks a
  panel below three evaluators non-promotable, and cleanup deletes the exact
  path-confined session.
- Model-free validation passes Ruff, strict mypy over 34 source files, and all
  49 Python tests. The four new quality tests cover bounded two-candidate
  creation, blinding/privacy, score validation, limited aggregation, failure
  cleanup, closed input, and final cleanup without candidate packages, models,
  NumPy, or audio devices.
- The authoritative native `pnpm.cmd check` passes with the quality workflow:
  formatting, ESLint, Rustfmt, Ruff, Clippy with warnings denied, TypeScript
  and strict Python type checks, 18 shared files/175 tests, 34 EPUB files/555
  tests, 20 desktop files/204 tests, six native WebDriver-client tests, all 49
  Python tests, Cargo tests, package/desktop release builds, and Python
  distributions. The existing Vite chunk-size advisory remains informational.
- From clean implementation commit
  `8251945566dd64037b47a335bceb58e7e0d49548`, session
  `f85c4201a73441b6ae1cb0058aeb8ba6` generated all 12 Qwen and all 12
  Supertonic listening samples under the exact verified candidate
  interpreters and temporary application-scoped outbound blocks. Finalization
  emitted one independently randomized evaluator page and marked the session
  ineligible for promotion because the evaluator count is one.
- The finalized session contains exactly 24 WAV files and no staging
  directory, occupies 17,336,186 bytes against the 512 MiB cap, and its
  evaluator page contains no candidate IDs, corpus text, privacy canary, or
  private path. The temporary firewall rule is absent and AC sleep is restored
  to 45 minutes. The ignored audio remains only until the maintainer submits
  the blinded scorecard, after which aggregation and mandatory cleanup remain.
- The completed scorecard passed strict submission validation. Its limited
  aggregate gives Qwen an overall mean of `4.095238095238096` and Supertonic
  `3.288095238095238` on the frozen 1–5 scale. Qwen's dimension means are
  `4.333333333333333` intelligibility, `4.416666666666667` Spanish
  pronunciation, `4.166666666666667` punctuation/dialogue, `4.0` numeric
  expressions, `4.25` foreign names, `3.5` naturalness, and `4.0` artifact
  freedom, with four meaning-changing defects. Supertonic's corresponding
  means are `3.9166666666666665`, `3.75`, `3.8333333333333335`, `2.6`,
  `2.5`, `3.1666666666666665`, and `3.25`, with five meaning-changing
  defects.
- The aggregate is correctly marked `eligibleForPromotion: false` with
  `small-panel`, `spanish-only`, `fixed-voices-only`,
  `synthetic-corpus-only`, and `not-accessibility-certification`
  limitations. It is useful directional evidence but does not establish a
  passing quality gate.
- Required cleanup removed the entire session, including its 24 WAV files and
  randomization key, plus the downloaded scorecard copy. A recursive raw-root
  check found zero WAV files; the session and temporary firewall rule are
  absent.

#### Status

Complete — the bounded blinded session was generated, scored by the one
available fluent-Spanish evaluator, aggregated with the frozen limitations,
and deleted with zero generated audio remaining. The result is limited and
non-promotable; it is not a passing-quality claim.

### Task 3.4: Audit licensing, offline behavior, and packaging risk

**Specific outcome:** Each candidate's non-performance constraints are complete enough for a selection decision.

#### Work

- Reconfirm code, model, and voice licenses from authoritative sources.
- Record redistribution, commercial-use, attribution, notice, and modification constraints.
- Record download/acquisition terms and whether users may need a separate acceptance step.
- Record installed/cache sizes and required native runtimes.
- Record offline behavior after setup and any unavoidable network or telemetry behavior.
- Record Windows, CPU, GPU/provider, precision, and Python compatibility.
- Identify installer/runtime risks without implementing packaging.

#### Validation

- Every selection-matrix row has authoritative citations and retrieval dates.
- No report claims redistribution rights when they remain ambiguous.
- Artifact size is measured without committing the artifact.
- A candidate with unresolved license or mandatory remote behavior cannot be selected.

#### Expected result

Performance cannot conceal an unacceptable license, download, privacy, or packaging boundary.

#### Actual result

Completed on 2026-07-25. Sources were retrieved on that date. The frozen
candidate manifest remains unchanged; this post-result audit records facts for
selection without rewriting intake authority.

| Audit field | Qwen balanced candidate | Supertonic compatibility candidate |
| --- | --- | --- |
| Engine code | `qwen-tts==0.1.1`, Apache-2.0. The exact PyPI release identifies the license, Python `>=3.9`, pure-Python wheel, release date, and dependency set; the upstream repository contains the Apache-2.0 grant and redistribution conditions. Sources: [PyPI release](https://pypi.org/project/qwen-tts/0.1.1/), [release JSON](https://pypi.org/pypi/qwen-tts/0.1.1/json), [upstream license](https://github.com/QwenLM/Qwen3-TTS/blob/main/LICENSE). | `supertonic==1.3.1`, MIT. The exact PyPI release identifies the SPDX expression, Python `>=3.9`, pure-Python wheel, four core dependencies, and optional playback/server extras; the MIT grant requires retaining its copyright and permission notice. Sources: [PyPI release](https://pypi.org/project/supertonic/1.3.1/), [release JSON](https://pypi.org/pypi/supertonic/1.3.1/json), [upstream license](https://github.com/supertone-inc/supertonic-py/blob/main/LICENSE). |
| Model and voice | The exact `8f9ebcf8826db6eeb9cdd4caa09d575a7f9ce4bd` model card declares Apache-2.0. Aiden is embedded in that model, so no separately licensed voice artifact exists. Source: [revision-pinned model card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice/blob/8f9ebcf8826db6eeb9cdd4caa09d575a7f9ce4bd/README.md). | The exact `3cadd1ee6394adea1bd021217a0e650ede09a323` snapshot includes the model and F1 style under BigScience OpenRAIL-M. It grants use, modification, hosting, and distribution, including end-use applications, subject to its conditions. Sources: [revision-pinned model card](https://huggingface.co/Supertone/supertonic-3/blob/3cadd1ee6394adea1bd021217a0e650ede09a323/README.md), [revision-pinned license](https://huggingface.co/Supertone/supertonic-3/blob/3cadd1ee6394adea1bd021217a0e650ede09a323/LICENSE). |
| Redistribution and commercial use | Redistribution and commercial use are permitted. Distribution must include the Apache-2.0 license, preserve applicable notices, mark modified files, and carry any upstream `NOTICE` attribution if present. The frozen model snapshot contains no separate acceptance gate or additional voice terms. | Redistribution and charged end-use are permitted, but downstream terms must make the paragraph 5 use restrictions enforceable, notify recipients, include the license, retain notices, and mark modified files. Attachment A restricts listed harmful uses and requires machine-generated-content disclosure in its specified context. The license also asks for reasonable efforts to use the latest model. These are product-license and update-policy requirements, not optional attribution alone. |
| Acquisition and offline behavior | Networked setup is required to obtain the wheel and approximately 2.50 GB verified snapshot. Upstream documents automatic or explicit Hugging Face/ModelScope download and accepts a local directory. Official runs used the local revision with `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, and `local_files_only=true`; all phases completed while the exact interpreter was blocked outbound. No synthesis-time remote service was required. The firewall proof establishes offline operability, not the absence of blocked connection attempts. | Networked setup is required to obtain the wheel and approximately 414.7 MB snapshot. Upstream documents a first-run download, but also describes entirely on-device synthesis. Official runs instead used the verified local directory with `auto_download=false` and `HF_HUB_OFFLINE=1`; all phases completed while the exact interpreter was blocked outbound. No synthesis-time remote service was required. The firewall proof establishes offline operability, not the absence of blocked connection attempts. |
| Measured installed footprint | Model snapshot: `2,498,444,461` bytes across 27 files. Isolated environment: `5,227,411,977` bytes across 32,460 files and 88 distributions. Combined: `7,725,856,438` bytes. Its 373 `.dll`, `.pyd`, and `.exe` files occupy `4,713,151,865` bytes; the largest include PyTorch CUDA, cuBLAS, cuDNN, and cuSPARSE binaries. | Model snapshot: `414,741,773` bytes across 79 files, including the 292,046-byte F1 style. Isolated environment: `111,691,023` bytes across 2,402 files and 24 distributions. Combined: `526,432,796` bytes. Its 42 `.dll`, `.pyd`, and `.exe` files occupy `77,514,569` bytes, led by OpenBLAS and ONNX Runtime. |
| Verified platform | Windows `10.0.26200`, CPython `3.12.10`, PyTorch `2.9.1+cu128`, torchaudio `2.9.1+cu128`, CUDA/bfloat16/SDPA, NVIDIA driver `577.05`, and RTX 5060 Laptop GPU with 8,546,942,976 bytes VRAM. This is the only measured balanced configuration. | Windows `10.0.26200`, CPython `3.12.10`, `supertonic 1.3.1`, `onnxruntime 1.27.0`, CPUExecutionProvider, and float32 on the Intel Core Ultra 7 255HX. No GPU is required. This is the only measured compatibility configuration. |
| Packaging risk | High. The benchmark lock pulls a broad 88-distribution graph, approximately 4.71 GB of native executables, GPU-driver compatibility, and packages not needed by the selected inference path, including Gradio and ONNX Runtime. FlashAttention was deliberately excluded, so there is no selected local build step, but a production package would need a purpose-built reduced lock, native-DLL notice collection, driver preflight, and a separate model-acquisition/update design. | Moderate. The core wheel is pure Python and the selected lock avoids playback and server extras, but ONNX Runtime, OpenBLAS, SoundFile, Hugging Face/Xet, and their native notices still require installer review. A production package should remove acquisition-only dependencies if feasible, preserve OpenRAIL-M terms in the application flow, define update handling, and keep model storage separate from ephemeral audio. |
| Advisory check | The exact PyPI release JSON reported no known vulnerabilities for `qwen-tts==0.1.1`. This is not a transitive dependency audit and does not clear its 88-distribution graph. | The exact PyPI release JSON reported no known vulnerabilities for `supertonic==1.3.1`. This is not a transitive dependency audit and does not clear ONNX Runtime or other dependencies. |

Neither candidate has an unresolved mandatory-network boundary after explicit
setup. Qwen's Apache-2.0 terms are straightforward for packaging. Supertonic's
OpenRAIL-M terms are explicit enough for this feasibility decision but impose
material product-policy, disclosure, license-flow, and update-review work
before distribution. Those burdens do not rescue or worsen either candidate's
already failed frozen performance and cancellation gates.

#### Status

Complete — every audit row has dated authoritative sources or direct local
measurement. No production dependency or model artifact was added, and no
redistribution claim exceeds the reviewed license text.

## Milestone 4: Select profiles and record durable decisions

### Task 4.1: Apply the frozen selection matrix

**Specific outcome:** Balanced and compatibility roles are selected only from candidates that pass every applicable frozen gate.

#### Work

- Compare numeric results, quality scores, capabilities, license, artifact size, offline behavior, cancellation, cleanup, and packaging risks.
- Keep per-hardware results separate; do not average incompatible configurations.
- Document tradeoffs and rejected candidates.
- Do not convert unavailable values into zeros or favorable scores.
- If a role has no viable candidate, state that result and propose a roadmap response instead of selecting the least-bad failure.

#### Validation

- Selection can be recomputed from checked-in summaries and the frozen rubric.
- Every selected capability has direct evidence.
- Every rejected candidate has one or more fixed failed gates.
- Hardware claims name only measured configurations.

#### Expected result

The outcome is reproducible whether it selects profiles or blocks the next milestone.

#### Actual result

Completed on 2026-07-25.

- Added the content-free
  [`selection-v2`](../../../benchmarks/tts/selection-v2.md) record. It applies
  every applicable conjunctive `v2` gate to each candidate separately and
  preserves exact measured-host scope.
- Qwen is rejected for the balanced role. It fails warm first audio,
  15-seconds-of-media production, shorter-complete latency, warm and sustained
  RTF, total sustained RTF, zero-failure, mid-generation cancellation, the
  three-evaluator quality-panel minimum, and the zero-defect quality gate. Its
  cold-load, RAM, dual-signal VRAM, artifact, offline, cleanup, and license
  gates pass.
- Supertonic is rejected for the compatibility role. It fails warm first
  audio, zero-failure, mid-generation cancellation, the three-evaluator
  quality-panel minimum, and the zero-defect quality gate. Its remaining
  numeric, RAM, zero-GPU, artifact, offline, cleanup, and decision-sufficiency
  license gates pass.
- No unavailable value was converted to zero or a favorable score. The limited
  one-evaluator quality result remains explicitly non-promotable.
- Neither role has a viable candidate, so no weighted or least-bad selection
  was made. The required roadmap response is a newly frozen evaluation cycle
  for an exact candidate or materially changed engine API that credibly exposes
  incremental audio and mid-generation cancellation, followed by the complete
  protocol and at least three fluent-Spanish evaluators.

#### Status

Complete — neither candidate passes its assigned role's frozen conjunctive
matrix, and Milestone 7 has no authorized engine integration target.

### Task 4.2: Accept the engine-profile ADR

**Specific outcome:** The next available ADR records the selected balanced and CPU-compatible profiles, or records that a viable selection could not be made.

#### Work

- Record exact engine/library/model/voice/runtime/provider/precision identities.
- Record the measured configuration and report references.
- Record supported, unsupported, and unknown capabilities.
- Record license, artifact acquisition, offline, storage, and packaging consequences.
- Record model-specific preprocessing ownership inside the future service adapter.
- Record cancellation limitations and required Milestone 7 containment.
- Explicitly defer process transport, production audio format, playback, hardware auto-detection, and installer topology.
- If no profile is viable, record the failed gates and required follow-up decision.

#### Validation

- ADR claims link to checked-in reports.
- The ADR does not claim audible narration, desktop integration, universal hardware support, or completed packaging.
- Candidate dependency status in `docs/development/dependencies.md` matches the decision.
- No unselected candidate library remains a production dependency.

#### Expected result

Milestone 7 has an explicit integration input or an explicit blocker.

#### Actual result

Completed on 2026-07-25.

- Accepted
  [ADR-0013](../../architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md)
  as the next available architecture decision.
- The ADR selects neither evaluated profile and links the frozen authority,
  candidate identities, content-free selection record, measured configuration
  scope, fixed failed gates, and limited quality evidence.
- It records directly supported, unsupported, and unknown capabilities;
  offline-after-setup behavior; license and artifact consequences; high Qwen
  and moderate Supertonic packaging risk; and the unchanged zero-dependency
  production service boundary.
- It assigns future model-specific preprocessing to a future service adapter
  without changing `narration-v1`, and distinguishes benchmark worker
  termination from production cancellation.
- Process transport, production audio format, playback, hardware detection,
  acquisition/update/storage policy, and installer topology remain explicitly
  deferred. Milestone 7 receives an explicit blocker rather than an engine
  integration input.

#### Status

Complete — ADR-0013 is accepted, selects no profile, and requires a new frozen
candidate evaluation before engine integration.

### Task 4.3: Reconcile architecture, product, roadmap, and development documentation

**Specific outcome:** Documentation distinguishes implemented benchmark evidence, selected profiles, and still-deferred runtime behavior.

#### Work

- Update the canonical system diagram's status snapshot and future flow.
- Keep the Python TTS runtime foundation/deferred unless Milestone 7 implements it.
- Mark only the feasibility harness and profile decision implemented.
- Update the roadmap and this plan with the exact selection or blocker.
- Update the project brief's candidate table.
- Update performance-budget evidence and wall-clock targets only with accepted measurements.
- Update setup with explicit candidate acquisition and offline benchmark commands.
- Update testing with deterministic versus hardware/manual boundaries.
- Update dependency inventory with exact selected/rejected package status.
- Update glossary terms only if evidence introduces a durable new term.
- Preserve the approximately 15-second playable-audio-lead rule as a future playback policy.

#### Validation

- Relative Markdown links resolve.
- Mermaid nodes, arrows, prose, and statuses agree.
- Search finds no claim that TTS service, desktop integration, audio buffering, playback, synchronization, hardware detection, or packaging is implemented.
- Reports and docs contain no corpus text, audio, private paths, or unsupported hardware claims.

#### Expected result

The repository communicates exactly what Milestone 6 proved and nothing more.

#### Actual result

Pending.

#### Status

Not started.

## Milestone 5: Close deterministic, hardware, privacy, and repository validation

### Task 5.1: Complete deterministic validation

**Specific outcome:** All model-free harness, corpus, schema, arithmetic, redaction, adapter, cleanup, and existing repository checks pass without weights or GPU hardware.

#### Validation

Run the exact focused and aggregate commands available after the task-added benchmark surface is committed. The current authoritative commands are:

```powershell
uv run --project services/tts --locked ruff format --check services/tts
uv run --project services/tts --locked ruff check services/tts
uv run --directory services/tts --locked mypy .
uv run --project services/tts --locked pytest services/tts
uv build services/tts
pnpm.cmd check:portable
pnpm.cmd check
git diff --check
```

If candidate benchmark projects have separate locks, run their exact checked-in `uv sync --project ... --locked` and import/manifest tests without loading weights. Record every exact path and outcome in this plan.

#### Expected result

Default validation remains offline at test runtime, model-free, hardware-independent, and green.

#### Actual result

Pending.

#### Status

Not started.

### Task 5.2: Complete official benchmark and quality evidence

**Specific outcome:** Every selection claim is supported by complete official reports from the frozen protocol.

#### Validation

- Run the exact task-added acquisition command in a networked terminal.
- Disconnect or block external network access.
- Run each exact task-added candidate/profile benchmark command.
- Run the explicit quality-session command and cleanup.
- Validate and promote summaries.
- Repeat the official comparison from a clean source revision according to the frozen rerun rule.
- Record exact commands, run IDs, hardware descriptions, and outcomes here without recording private paths or corpus text.

#### Expected result

Selected profiles pass their gates; failed candidates and unavailable measurements remain visible.

#### Actual result

Pending.

#### Status

Not started.

### Task 5.3: Complete CI, privacy, artifact, and scope closeout

**Specific outcome:** The final branch preserves the model-free CI boundary, contains only approved source/docs/summaries, and has successful required pull-request checks.

#### Validation

- Review `git diff --stat`, `git diff --name-only`, and `git diff --check`.
- Confirm no model, weight, generated audio, raw result, profile trace, log, book, secret, private path, cache, environment, or large binary is tracked.
- Confirm default CI does not acquire or run models and requires no GPU or secret.
- Confirm model benchmark commands remain explicit hardware-specific commands outside `pnpm.cmd check`.
- Confirm no Tauri command, capability, plugin, CSP, desktop behavior, process transport, audio player, persistence contract, or EPUB/narration public contract changed without separate authority.
- Run the authoritative Windows and portable checks.
- Require the existing pull-request CI jobs to pass on the exact final implementation head.
- Move this plan to `docs/plans/completed/` only after every task, report, ADR, documentation update, and validation result is complete.

#### Expected result

Milestone 6 is complete without pretending that the production TTS or audio path exists.

#### Actual result

Pending.

#### Status

Not started.

## Testing and benchmark strategy

### Deterministic CI tests

These tests run with the normal dependency-free service environment and remain part of the existing Python/root checks:

- corpus version, provenance, category, size, and immutability checks;
- benchmark-local report schema valid/invalid fixtures;
- code-point, UTF-8, sample-duration, latency, and RTF arithmetic;
- percentile calculation with exact minimum-sample and ordering behavior;
- fake cold-load, warm-up, streaming, complete-waveform, timeout, cancellation, late-completion, crash, resource, and unavailable-metric outcomes;
- bounded output and diagnostic capture;
- allowlisted summary serialization;
- privacy canaries across stdout, stderr, errors, JSON, Markdown, and filenames;
- raw-to-summary promotion rejection for incomplete, dirty, invalid, sensitive, or inconsistent runs;
- cleanup after success, cancellation, timeout, and interruption;
- candidate manifest parsing without importing or loading a real engine;
- default-environment proof that no candidate package, model, GPU, network, or audio device is required; and
- regression coverage for the existing Python health and shared-contract conformance tests.

Tests use injected clocks/samplers/adapters rather than real sleep or hardware. Wall-clock assertions are forbidden in deterministic suites.

### Candidate import and offline smoke tests

Each isolated candidate environment receives a narrow smoke test:

- exact lock installs;
- engine import succeeds;
- exact artifact identity validates;
- missing artifacts fail without downloading;
- provider/precision mismatch fails closed;
- one synthetic short request produces structurally valid local audio metadata;
- adapter diagnostics remain content-free;
- close releases the model/worker;
- offline execution succeeds after acquisition; and
- no product service, port, socket, desktop, or audio device is started.

These are environment-specific checks and do not join portable root CI unless they can run without candidate dependencies and weights.

### Hardware-specific performance benchmarks

Official performance runs are manual and native to the measured environment. They:

- use a clean source revision;
- use checked-in exact locks and verified local artifacts;
- run the frozen corpus and order;
- load one profile at a time;
- record cold and warm distributions separately;
- measure first produced audio separately from complete output;
- measure production of 15 seconds of media without waiting a fixed 15 seconds;
- compute generated duration from samples;
- measure sustained RTF and memory;
- exercise cancellation and failure;
- run offline;
- emit ignored raw data first; and
- promote only sanitized summaries.

CI never supplies the hardware evidence needed for a support claim.

### Manual quality evaluation

Quality evaluation is an explicit local manual procedure, not a unit test:

- candidate order is blinded;
- the same corpus/listening conversion is used;
- scores follow the frozen rubric;
- evaluator count and limitations are reported;
- audio uses disposable ignored storage only when explicitly requested;
- no audio or input text enters a report; and
- an interrupted session is discarded rather than partially scored.

### Selection evidence

A profile is selectable only when its performance, quality, capability, license, offline, resource, cancellation, cleanup, and packaging-risk fields are complete. A fast incomplete candidate does not outrank a complete viable one.

## Risks and rollback

### Large or conflicting candidate dependency graphs

**Risk:** Candidate packages may conflict, add unsigned/native code, execute install hooks, or make the default environment enormous.

**Mitigation:** Isolate exact candidate projects/locks, review transitive graphs and install behavior, and keep production/default dependencies model-free.

**Rollback:** Remove the rejected candidate project, adapter, and lock. Retain only its content-free report and rejection rationale.

### Model and voice licensing ambiguity

**Risk:** Code, model, and voice artifacts may have different terms or unclear redistribution rights.

**Mitigation:** Treat each artifact separately, cite authoritative terms, and block selection on ambiguity.

**Rollback:** Mark the candidate ineligible and remove local artifacts. Do not rewrite evidence to imply permission.

### Silent network or telemetry behavior

**Risk:** A library may fetch models/configuration or send telemetry during inference.

**Mitigation:** Separate acquisition, use exact local artifacts and offline controls, run official benchmarks without external network access, and fail closed on attempted access.

**Rollback:** Reject the candidate or revise the adapter only after a new protocol-version review.

### Sensitive text in third-party logs

**Risk:** Engines may log prompts, tokenized text, paths, or raw exceptions.

**Mitigation:** Bound and intercept diagnostics, use canaries, publish fixed codes only, and disqualify unsafe adapters.

**Rollback:** Delete raw output, remove the adapter, and retain only a content-free privacy-failure record.

### Unbounded memory or generated audio

**Risk:** Complete-waveform APIs, long cases, model caches, or retained listener files may exhaust memory/disk or violate ephemeral-audio rules.

**Mitigation:** Bound input tiers, one active profile/case, incremental discard, explicit timeouts, ignored raw paths, and mandatory cleanup.

**Rollback:** Terminate the benchmark worker, delete disposable output, and record a resource failure without partial success.

### Misleading cancellation evidence

**Risk:** Killing a benchmark process may be mistaken for cooperative engine cancellation.

**Mitigation:** Report engine cancel, late completion, stale-result discard, and worker termination separately.

**Rollback:** Downgrade capability to unsupported/unknown and carry the containment requirement into Milestone 7.

### Benchmark overfitting or gate movement

**Risk:** Thresholds, corpus, or run rules may be changed after observing a preferred result.

**Mitigation:** Commit a versioned pre-result profile and require complete reruns after any material change.

**Rollback:** Invalidate incomparable reports; never merge mixed-protocol rankings.

### Subjective quality bias

**Risk:** A single evaluator or known candidate identity may distort quality selection.

**Mitigation:** Blind candidate order, freeze the rubric, report evaluator limitations, and avoid broad quality claims.

**Rollback:** Mark quality evidence insufficient and defer selection rather than invent confidence.

### Hardware-specific conclusions

**Risk:** One fast machine may produce unsupported universal claims.

**Mitigation:** Bind each result and profile to exact measured configurations and reserve end-user detection/support policy for Milestone 10.

**Rollback:** Correct docs and ADR claims to measured scope; do not delete historical measurements.

### Model-specific preprocessing leaks into narration authority

**Risk:** A candidate may pressure the project to change displayed text, locator ranges, or general normalization.

**Mitigation:** Keep candidate preprocessing inside the benchmark/service adapter and require separate evidence plus an ADR for any future general change.

**Rollback:** Remove the adapter-specific transformation. Do not alter completed Milestone 5 evidence.

### Benchmark scaffolding becomes accidental production architecture

**Risk:** A child-process runner, temporary waveform representation, or report shape could be mistaken for the product protocol/audio format.

**Mitigation:** Keep benchmark types private, label topology explicitly, and defer runtime contracts to Milestones 7 and 8.

**Rollback:** Delete or replace benchmark-only plumbing without a public migration.

### Existing documentation worktree

**Risk:** Implementation could overwrite or misattribute the documentation reconciliation already present when this plan was created.

**Mitigation:** Inspect `git status` and overlapping diffs before every edit; preserve unrelated/user-owned changes and review the final scope.

**Rollback:** Reapply only the plan's focused changes through reviewed patches. Do not use destructive Git commands.

## Progress log

- 2026-07-25: Created the milestone-specific ExecPlan from the roadmap, current canonical architecture, product constraints, completed Milestones 1–5, Python scaffold, shared contracts/fakes, root commands, CI, ignore policy, and current source/test evidence.
- 2026-07-25: Confirmed that no TTS engine, model dependency, benchmark command, model adapter, hardware probe, generated-audio path, process transport, or production service exists.
- 2026-07-25: Confirmed that shared capability/audio/error contracts exist but no dedicated measurement contract does; this plan keeps benchmark reports private to the benchmark unless a real runtime consumer later justifies a public contract.
- 2026-07-25: Marked all implementation tasks not started. Creating this plan does not advance the canonical TTS feasibility node beyond **Approved planned**.
- 2026-07-25: Completed Task 1.1 candidate intake. Two role-specific candidates now have stable IDs, immutable upstream artifact identities, independent uv projects/locks, and explicit offline/acquisition/license risks without changing the production dependency graph.
- 2026-07-25: Completed Task 1.2. The byte-frozen synthetic Spanish corpus, deterministic performance/sustained orders, Milestone 5 size boundary checks, privacy canaries, ignored raw layout, cleanup policy, and repository artifact audits are now enforced by model-free Python tests.
- 2026-07-25: Completed Task 2.1. The private candidate-neutral harness, bounded diagnostic capture, allowlisted summary promotion, deterministic fake adapter, exact arithmetic, protocol ordering, and input/output/privacy/cancellation bounds pass all focused checks without candidate packages or hardware.
- 2026-07-25: Completed Task 2.2. Thin Qwen and Supertonic adapters now validate the frozen profile, offline controls, local artifact hashes, runtime/provider/precision/voice identity, native complete-waveform behavior, and fixed-code failure boundary in deterministic model-free tests.
- 2026-07-25: Completed Task 2.3. Spawn-isolated execution now bounds metadata and diagnostics, hard-stops worker process trees, rejects stale or falsely mid-generation complete-waveform output, restarts cleanly between forced-cancellation trials, and leaves real candidate limitations explicit for official measurement.
- 2026-07-25: Started Task 3.1 on a new branch from merged Milestone 2. The closed preflight command, privacy-safe host/artifact receipt, role headroom gates, non-promotable pilot state, and exact Windows Firewall network-isolation proof pass deterministic tests; official eligibility awaits candidate acquisition, offline controls, firewall authorization, and sufficient free balanced-role RAM.
- 2026-07-25: Completed the networked acquisition portion of Task 3.1. Both exact candidate locks installed, both immutable snapshots downloaded into ignored storage, and every manifest checksum/provider import matched. Windows denied creation of the required outbound firewall rule because the shell is not elevated; the prior AC sleep timeout was restored and no inference began.
- 2026-07-25: The administrator-created Supertonic application rule was
  verified and its official compatibility preflight passed from clean commit
  `64e8324f9426c381dcac1d013264ba9fcb833065`. No model loaded. Qwen still
  requires its exact rule and the frozen 12 GiB free-RAM headroom.
- 2026-07-25: Started Task 3.2 implementation before model execution. The
  exact-interpreter supervisor, disposable pilot, bounded raw journal,
  50-millisecond PID-tree RAM probe, sustained-phase timeout, all-trial
  cancellation journaling, and exact Supertonic loaded-provider verification
  pass model-free checks. Balanced process-attributed VRAM measurement remains
  fail-closed; at that checkpoint no pilot or official generation had run.
- 2026-07-25: The first non-comparable Supertonic pilot loaded the verified
  local CPU profile but failed generation because the adapter mock had the
  wrong installed return shape. It retained no raw session. The pre-result
  fix unpacks the actual `(waveform, duration)` pair and discards both values
  after extracting bounded sample metadata.
- 2026-07-25: The corrected Supertonic pilot passed from clean commit
  `56bd9894fd582375dd1b45e384155705f14f07cb` with no retained raw session.
  The frozen gates and corpus were unchanged, so the official CPU matrix may
  proceed from the next clean documentation checkpoint.
- 2026-07-25: The official Supertonic matrix completed from clean commit
  `532e2c740f463ff09ebfce9581a68462307ae7ab`. All numeric phases completed
  and the raw journal passed content/path scans. The profile failed the
  first-audio and cancellation gates; no summary was promoted while quality
  and audit fields remain incomplete.
- 2026-07-25: A disposable 256 MiB CUDA allocation proved that this host's
  WDDM driver reports process VRAM as `[N/A]`, matching NVIDIA's documented
  NVML limitation. Because balanced process-attributed VRAM is mandatory, the
  Qwen matrix is blocked before model load; total-device or zero substitution
  is prohibited.
- 2026-07-25: Completed Task 1.3 and Milestone 1. The pre-result measurement procedure, numeric gates, listening rubric, invalidation/rerun rules, private summary schema, synthetic valid fixture, and semantic mutation tests are frozen and linked from the performance and architecture authorities. No engine was executed and no official result exists.
- 2026-07-25: Corrected the recorded sustained-sequence total from 3,144
  to the verified 3,139 code points and froze that exact aggregate in the
  corpus authority test.
- 2026-07-25: Completed Task 2.1. The benchmark-only typed harness, exact
  sample/timing arithmetic, bounded diagnostic redaction, allowlisted
  schema/semantic promotion gate, and full-protocol deterministic fake now
  pass the 14-test Python suite plus Ruff and strict mypy. No candidate
  dependency, model, audio payload, hardware access, production service API,
  root benchmark command, or official result was added.
- 2026-07-25: Verified post-run cleanup after administrator action. The exact
  temporary Supertonic outbound firewall rule no longer exists, AC sleep is
  restored to 45 minutes, and the feature branch is clean. The Qwen run remains
  blocked independently by unavailable process-attributed NVML VRAM under
  WDDM.
- 2026-07-25: The maintainer approved replacing the blocked `v1` memory rule
  with a versioned authority instead of buying new hardware. Local inspection
  confirmed PID-tagged `GPU Process Memory` dedicated/shared counters on the
  measured WDDM host. `v2` will pair the one-second Windows process counter
  with PyTorch's in-worker allocator peak, preserve the six-GiB gate and
  privacy boundary, and require complete reruns of both admitted candidates.
- 2026-07-25: Implemented the `v2` Windows/PyTorch memory path. Native PDH
  WDDM attribution, private-pipe allocator peaks, dual-signal fail-closed
  semantics, v2 raw/summary authorities, preflight availability, and
  deterministic coverage pass 45 tests, Ruff, and strict mypy. A disposable
  exact-environment CUDA allocation proved the local WDDM counter attributes
  positive dedicated bytes to the allocating PID.
- 2026-07-25: The authoritative native `pnpm.cmd check` passed after the v2
  implementation, including all format/lint/type/test/build stages and the
  expanded 45-test Python suite.
- 2026-07-25: Attempted the clean Qwen `v2` preflight setup. Windows denied
  creation of the exact application-scoped firewall rule because the process
  is not administrator-elevated. AC sleep was restored to 45 minutes and no
  candidate execution began. The next action requires administrator
  authorization to create that one temporary rule.
- 2026-07-25: Administrator authorization succeeded. Two temporary duplicate
  Qwen rules left by the elevation retries were replaced with one exact
  interpreter-scoped outbound block, and native verification found exactly one
  matching rule. The clean official `v2` preflight passed every other check but
  failed the frozen 12-GiB balanced-role RAM-headroom gate: free RAM was
  11,785,637,888 bytes. Free VRAM was 8,189,378,560 bytes and the WDDM process
  counter was available. No model loaded, no raw session or result was created,
  and AC sleep was restored to 45 minutes. Closing active user applications is
  a required operator decision because automated termination could discard
  work or terminate the benchmark session.
- 2026-07-25: Closing Chrome restored sufficient free RAM. The clean Qwen
  official preflight and disposable pilot passed from commit
  `76f27d1ff41b4d4ea1e20341b9a4cd9d86b3f8ff`. The complete official matrix
  then produced valid content-free `v2` evidence and failed the balanced role
  on startup, throughput, zero-failure, and cancellation gates while remaining
  below the frozen RAM and VRAM ceilings. No generated audio was retained.
- 2026-07-25: The exact firewall rule was switched to Supertonic. Its clean
  `v2` preflight, disposable pilot, and complete official matrix passed setup
  from commit `a0640fe7ff1c3bde4ceb68ba8e89cb57150adaac`. The valid content-free
  CPU evidence passes every numeric compatibility gate except first-audio
  latency and fails cancellation at the same three unavailable
  complete-waveform boundaries. Task 3.2 is complete; neither candidate passes
  its assigned role.
- 2026-07-25: Post-run cleanup removed the exact temporary firewall rule,
  restored the 45-minute AC sleep timeout, and verified a clean tree at
  `7ab924a520f6a5c964e8b7d3fa92dff9377eb311`. Task 3.3 is blocked before
  audio generation because the required three-person fluent-Spanish panel is
  not yet confirmed.
- 2026-07-25: The maintainer approved proceeding as the only fluent-Spanish
  evaluator. This does not change the frozen three-evaluator gate: the resulting
  score remains limited and non-promotable. The bounded explicit-opt-in
  generation, blinding, scoring, aggregation, and cleanup workflow now passes
  49 model-free Python tests, Ruff, strict mypy, and the complete native root
  check; no listening audio has yet been generated.
- 2026-07-25: The clean one-evaluator quality session
  `f85c4201a73441b6ae1cb0058aeb8ba6` generated all 12 samples for each
  admitted candidate from commit
  `8251945566dd64037b47a335bceb58e7e0d49548`. Finalization produced one
  blinded, independently randomized 24-sample page and correctly marked it
  non-promotable. The session is 17,336,186 bytes, has no staging residue, and
  its page contains no candidate identity, corpus text, canary, or private
  path. The temporary firewall rule was removed and AC sleep restored to 45
  minutes. Manual scoring, limited aggregation, and verified audio cleanup
  remain.
- 2026-07-25: Completed Task 3.3. The submitted scorecard passed strict
  validation. Limited blinded means were `4.095238095238096` for Qwen and
  `3.288095238095238` for Supertonic, with four and five meaning-changing
  defects respectively. The one-evaluator aggregate is correctly
  non-promotable and carries all five frozen limitations. Required cleanup
  removed the complete session, randomization key, downloaded scorecard, and
  all 24 WAV files; recursive verification found zero generated audio and no
  temporary firewall rule.
- 2026-07-25: Completed Task 3.4 against revision-pinned Hugging Face
  materials, exact PyPI releases, upstream licenses, the installed locks, and
  direct filesystem measurements. Qwen is Apache-2.0 but carries a
  7,725,856,438-byte combined footprint, 88 distributions, 373 native files,
  and high CUDA/driver/installer risk. Supertonic code is MIT and its model/F1
  voice are OpenRAIL-M; its 526,432,796-byte combined footprint is smaller,
  but redistribution requires enforceable use restrictions, downstream
  notice/license flow, disclosure policy, and update review. Both exact
  profiles completed synthesis under application-scoped outbound denial, so
  neither has a mandatory synthesis-time network dependency after setup.
- 2026-07-25: Completed Task 4.1. The checked-in content-free selection record
  applies the frozen `v2` matrix without averaging hardware, replacing
  unavailable values, or allowing a weighted rescue. Qwen is rejected for the
  balanced role and Supertonic for the compatibility role. No profile is
  selected; a new pre-result authority and complete evaluation are required
  before Milestone 7 may receive an engine target.
- 2026-07-25: Completed Task 4.2. Accepted ADR-0013 records the exact rejected
  configurations, measured capabilities, licenses, offline and packaging
  consequences, future adapter ownership, cancellation limitation, unchanged
  production dependency graph, deferred runtime decisions, and explicit
  Milestone 7 blocker.

## Discoveries and decisions

- Milestone 5 is complete and provides bounded prepared narration text, but feasibility measurements should use a fixed checked-in synthetic prepared-text corpus so every candidate sees identical input and EPUB/preparation time does not contaminate inference measurements.
- The roadmap previously described Milestone 2 as supplying measurement contracts. Repository inspection found capability, audio-frame, buffer, error, primitive, and fake-test support but no dedicated measurement schema. Milestone 6 will use a benchmark-local report schema rather than silently adding model/hardware fields to `CapabilityReportV1`.
- `CapabilityReportV1` is deliberately model- and hardware-independent. Actual engine/model/voice/hardware evidence belongs in versioned benchmark reports and the selection ADR, not in that v1 runtime contract.
- Candidate names began as hypotheses. Task 1.1 admits exact Qwen3-TTS/CUDA and
  Supertonic/ONNX CPU profiles to the frozen evaluation only; admission does
  not select either profile or authorize a production dependency.
- Official model execution must be offline after explicit acquisition. A local loopback server is not required for feasibility and would prematurely couple the work to Milestone 7.
- The exact application-scoped Windows Firewall rule requires an administrator PowerShell session. Ordinary repository/tool sandbox escalation does not grant that operating-system authorization; an access-denied attempt created no rule and is a hard preflight blocker rather than permission to weaken the offline gate.
- Milestone 2 intentionally adds no root TTS benchmark command. The candidate dispatch and isolation boundary now exist, but acquisition, host/resource preflight, network-disable proof, raw-session ownership, measurement probes, and official promotion are Task 3 work; exposing a partial command would create a non-authoritative result path.
- First produced audio, complete generated output, media duration, and audible playback are different measurements. Milestone 6 can measure the first three but does not implement or claim the fourth.
- A benchmark worker process may be used for isolation and termination measurement without selecting the production process transport.
- The approximately 15-second value remains a future playable-audio lead. The feasibility harness measures the time needed to produce that amount of media; it never sleeps for 15 seconds to satisfy the rule.
- Default root checks and CI must remain model-free and hardware-independent. Official benchmarks and manual listening remain explicit, separate commands.
- Rejected-candidate evidence is valuable and remains in content-free summaries; rejected dependencies, weights, audio, and raw output do not remain in the production dependency graph or repository.
- The reviewed Kokoro Python lock pulled `espeakng-loader`, whose published
  package metadata did not declare a license while bundling native eSpeak
  assets. The profile was rejected before measurement. The separate
  `kokoro-onnx` v1.0 release bundle also does not establish the current Spanish
  voice in one immutable bundle.
- Supertonic 3 replaces Kokoro as the CPU intake because the exact Spanish
  ONNX/voice profile is reproducible and its MIT/OpenRAIL-M terms are explicit.
  This is admission to evaluation, not a production license approval.
- Process-cold is deliberately defined as a fresh worker rather than a purged
  operating-system disk cache. This makes the five observations repeatable
  without claiming physical cold-storage behavior or mutating host caches.
- Complete-waveform APIs record first produced audio at completion and declare
  that capability. They do not receive an invented streaming advantage, but
  they may still qualify if every frozen role and cancellation gate passes.
- The Qwen candidate uses SDPA rather than optional FlashAttention so admission
  does not add an unproven native build. This is a benchmark profile choice, not
  a production runtime decision.
- Windows WDDM exposes PID-tagged dedicated GPU-memory counters even when NVML
  process memory is unavailable. Microsoft documents these as VidMm-owned
  process observations that include CUDA workloads, but also states that
  Windows performance counters are not appropriate above one sample per
  second. `v2` therefore cannot merely swap the old 50-millisecond NVML sample
  for a 50-millisecond WDDM sample: it combines the one-second WDDM
  process-attribution cross-check with PyTorch's exact caching-allocator
  high-water mark and fails if either signal is unavailable or inconsistent.
- A valid failed performance run does not become a selectable profile merely
  because some numeric gates pass. Both candidates independently fail
  performance, zero-failure, and cancellation gates before the limited quality
  result is considered.
- Because the only available Spanish evaluation had one participant, no
  schema-governed official summary can be promoted. The content-free selection
  record preserves the complete recomputable gate matrix while leaving that
  missing evidence unfavorable, as the frozen authority requires.
- A benchmark worker can prove forced-termination timing without proving a
  production cancellation design. The exact complete-waveform APIs remain
  unsuitable for the selected roles until a newly frozen evaluation proves an
  incremental-audio and mid-generation cancellation boundary.

## Final validation results

### Plan-authoring validation

Completed on 2026-07-25:

- A read-only audit enumerated all Markdown files under `docs/` plus the root `README.md` and `AGENTS.md`; all relative targets in 40 files resolve.
- `pnpm.cmd format:check` passed outside the managed sandbox after the sandboxed attempt could not traverse the existing protected `services/tts/.pytest_cache`.
- `git diff --check` passed for tracked changes.
- `git diff --no-index --check -- NUL docs/plans/active/M006-local-tts-feasibility-and-engine-profiles.md` and a direct trailing-whitespace scan passed for this new untracked plan file.
- The plan-creation scope adds this ExecPlan and updates only the documentation index, active-plan index, roadmap authority, and canonical system-diagram status. It adds no runtime source, manifest, lockfile, dependency, schema, model, weight, generated audio, benchmark result, hardware claim, transport, native capability, or production behavior.

### Milestone implementation validation

Milestone 1 completed on 2026-07-25 on
`feat/m006-evaluation-authority`:

- `uv lock --check --project
  services/tts/benchmarks/candidates/qwen3_0_6b_cuda` passed, and
  `uv tree ... --locked --depth 1` reported `qwen-tts 0.1.1`, PyTorch
  `2.9.1+cu128`, and Torchaudio `2.9.1+cu128`.
- `uv lock --check --project
  services/tts/benchmarks/candidates/supertonic3_cpu` passed, and
  `uv tree ... --locked --depth 2` reported `supertonic 1.3.1` with
  Hugging Face Hub `1.24.0`, NumPy `2.5.1`, ONNX Runtime `1.27.0`, and
  SoundFile `0.14.0`.
- The default-service import probe passed: neither `qwen_tts` nor `supertonic`
  is present. `git diff origin/main -- services/tts/pyproject.toml
  services/tts/uv.lock` is empty, so the production service dependency
  baseline remains unchanged.
- `uv run --project services/tts --locked ruff check services/tts` passed.
  `uv run --project services/tts --locked mypy services/tts/src
  services/tts/tests` passed for five source files. `uv run --project
  services/tts --locked pytest -p no:cacheprovider services/tts` passed all
  nine tests, including all six benchmark-authority tests.
- `pnpm.cmd format:check` and `git diff --cached --check` passed.
- `pnpm.cmd check:portable` passed: generated contracts, formatting, lint,
  TypeScript/Python type checks, 18 shared files/175 tests, 34 EPUB files/555
  tests, 20 desktop files/204 tests, six native WebDriver-client tests, nine
  Python tests, package/desktop portable builds, and Python sdist/wheel builds.
- The authoritative native `pnpm.cmd check` passed the same deterministic
  suites plus Rustfmt, Clippy with warnings denied, Cargo tests, the release
  Tauri executable build, and Python distributions. The existing Vite
  chunk-size advisory remained informational.
- The tracked-artifact privacy test used `git check-ignore` and `git ls-files`
  against the staged checkpoint and passed. No model, book, generated audio,
  raw result, cache, private path, corpus text, or privacy canary entered a
  reviewable summary.

At that Milestone 1 checkpoint, no model was downloaded or executed, no
generated audio or official result was created, and no GPU/hardware claim was
made. The later entries above supersede that historical execution status.

### Milestone 3 validation

Completed on 2026-07-25:

- Focused model-free validation passed Ruff, strict mypy, the native
  process-tree smoke, and all 43 Python tests.
- The corrected non-comparable Supertonic pilot passed and retained no raw
  session.
- The official Supertonic matrix completed every numeric phase from clean
  commit `532e2c740f463ff09ebfce9581a68462307ae7ab`; its ignored raw journal
  passed exact count/order, corpus-text/canary, absolute-path, sample-duration,
  RTF, percentile, sustained-total, memory, and cancellation inspection.
- The first `pnpm.cmd check` reached TypeScript lint and failed because ESLint
  traversed the newly installed ignored candidate `.venv`. After adding the
  recursive ignore, the authoritative native `pnpm.cmd check` passed
  formatting, ESLint, Rustfmt, Ruff, Clippy with warnings denied, TypeScript
  and strict Python type checks, 18 shared files/175 tests, 34 EPUB files/555
  tests, 20 desktop files/204 tests, six native WebDriver-client tests, all 43
  Python tests, Cargo tests, package/desktop release builds, and Python
  distributions. The existing Vite chunk-size advisory remained
  informational.
- AC sleep was restored to its prior 45-minute value. After the initial
  non-administrator removal attempt was denied, the administrator removed the
  temporary Supertonic firewall rule and a native query confirmed that no
  matching rule remains.
- The `v2` Windows/PyTorch authority, native WDDM attribution, private worker
  peak, preflight integration, and fail-closed dual-signal semantics pass
  deterministic coverage. A disposable exact-environment CUDA allocation
  attributed 372,781,056 dedicated bytes to the allocating process.
- Both official `v2` matrices contain the frozen five cold loads, 24 warm
  generations, 12 sustained generations, and five cancellation trials. Their
  raw journals passed count/order, arithmetic, duration, text/canary,
  absolute-path, memory, cancellation, and privacy audits.
- The bounded quality session generated the same 12 cases for both candidates,
  blinded and independently randomized all 24 samples, accepted only the
  complete scorecard, marked the one-evaluator aggregate non-promotable, and
  deleted the session, randomization key, scorecard copy, and every WAV.
- The license/offline/packaging matrix uses revision-pinned model materials,
  exact PyPI releases, upstream licenses, installed-lock inspection, and
  direct local size measurements retrieved on 2026-07-25.
- The authoritative final `pnpm.cmd check` passed on implementation commit
  `7a523f518ff964ad399599f4d4fe75183c49e1a9`: Prettier, Rustfmt, Ruff,
  ESLint, Clippy with warnings denied, TypeScript and strict Python type
  checks, 18 shared files/175 tests, 34 EPUB files/555 tests, 20 desktop
  files/204 tests, six native WebDriver-client tests, all 49 Python tests,
  Cargo tests, package/desktop release builds, and Python distributions. The
  existing Vite chunk-size advisory remained informational.
- Final cleanup verification found zero generated WAV files, no quality
  session or downloaded scorecard, no benchmark firewall rule, and the
  restored 45-minute AC sleep value.

Milestone 3 is complete. The Qwen `v2` matrix is valid but fails balanced-role
startup, throughput, zero-failure, and cancellation gates; its peak RAM and
dual-signal VRAM observations pass their ceilings. The Supertonic `v2` matrix
is valid but fails compatibility first-audio, zero-failure, and cancellation
gates while passing its other numeric gates. Limited blinded quality favors
Qwen but cannot establish a passing gate, and both candidates had
meaning-changing defects. Licensing and offline operation are sufficiently
resolved for selection, with high Qwen and moderate Supertonic packaging risk.
No summary was promoted and no profile was selected; those decisions belong to
Milestone 4.

This plan must not move to `docs/plans/completed/` until every task above has an actual result, the selected profiles or explicit no-viable outcome have accepted evidence, required CI passes on the final implementation head, and the repository definition of done is satisfied.
