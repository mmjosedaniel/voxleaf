# Local TTS feasibility profile v1

## Status and authority

This document is the accepted measurement and selection authority for
Milestone 6. It was frozen on 2026-07-25 before any official candidate run or
candidate result was recorded. The candidate identities are fixed by
[`candidates-v1.json`](../../benchmarks/tts/candidates-v1.json), and every
candidate consumes [`corpus-v1.json`](../../benchmarks/tts/corpus-v1.json)
without rewriting its text.

This profile evaluates local waveform generation. It does not implement or
claim playback, a production TTS service, process transport, audio buffering,
reader synchronization, or hardware support. A passing result permits an ADR
to consider one exact profile; it does not make that profile a production
dependency.

The identifier for this authority is `tts-feasibility-profile-v1`. Any
normative change requires a new identifier and invalidates all results produced
under this version.

## Preconditions

An official run is valid only when all of these conditions are true:

1. The repository commit, clean tree, candidate manifest, corpus, profile, and
   summary schema versions are recorded.
2. The exact engine lock, immutable model revision, voice artifact, runtime
   provider, precision, and candidate parameters match the candidate manifest.
3. Model acquisition has completed as a separate networked operation. Artifact
   sizes and SHA-256 values are verified before load.
4. Synthesis runs with networking disabled and with the candidate's documented
   offline controls. Any attempted connection invalidates the run.
5. No text, audio, model artifact, path, URL, command line, environment value,
   process title, or free-form exception enters a reviewable report.
6. Raw files exist only below one ignored
   `benchmarks/results/raw/<candidate-id>/<session-id>/` directory and are
   removed after the allowlisted summary passes validation.
7. The host is on AC power with automatic sleep disabled for the run. Material
   background load, thermal throttling, driver reset, or operating-system
   update activity invalidates the affected run.

Acquisition and benchmark processes are separate. Acquisition may use the
network; official measurement may not.

## Frozen execution order

Run one candidate/hardware profile at a time in this order:

1. verify the repository, lock, artifact, offline, and host preconditions;
2. collect five process-cold load observations;
3. start one fresh measurement worker, load the profile, and perform one
   unreported warm-up request;
4. collect 24 warm generations: two complete passes through
   `performanceOrder`;
5. run the fixed sustained sequence repeatedly;
6. run the five cancellation trials in their fixed order;
7. complete offline, privacy, dependency, license, and cleanup observations;
8. conduct the blinded listening evaluation from ephemeral audio; and
9. validate and retain only the content-free summary.

The warm-up uses the first performance case. It is excluded from all
percentiles and counts.

### Process-cold load

One cold observation uses a newly started child process that has not imported
the engine or initialized its provider. Timing begins immediately before the
adapter starts loading the verified local artifacts and ends only when the
adapter reports that it can accept synthesis. The worker then exits and must be
gone within the cleanup timeout.

“Process-cold” does not claim an empty operating-system disk cache. The
protocol must not purge machine caches or reboot between observations. Exactly
five valid observations are required; an invalid observation is discarded only
with a fixed reason and the complete five-observation sequence is restarted.

### Warm generation

Timing begins when the loaded adapter accepts one case and ends when it declares
that case complete. The input is the corpus `text` value and `language` only;
privacy canaries and case metadata never enter the engine.

Time to first produced audio is measured from acceptance to the first nonempty,
ordered sample range exposed by the adapter. If the public engine returns only
a complete waveform, first produced audio equals completion and the summary
must declare `complete-waveform`.

Time to 15 seconds of media is measured from acceptance until cumulative,
contiguous produced frames reach `15 × sampleRateHz` per channel. It is not a
15-second sleep or wall-clock timer. If a valid output completes with less than
15 seconds of media, record `shorter-complete` and its completion time; do not
pad, repeat, or slow the output.

### Sustained generation

Run `sustainedSequence` in its frozen order and repeat whole rounds until at
least 180 seconds of generated media have completed. At most ten rounds may be
started. Failure to reach 180 seconds within ten rounds or the sustained
timeout is a failed gate, not permission to shorten the requirement.

Requests remain sequential and use one loaded worker. Report both per-request
RTF percentiles and total sustained RTF:

```text
total sustained RTF =
  sum(accepted-to-complete wall seconds) / sum(generated media seconds)
```

No playback or artificial pacing occurs between requests.

## Timing and media arithmetic

Use a monotonic high-resolution clock. Python adapters use
`time.perf_counter_ns()` and retain integer nanoseconds until summary
serialization. Decimal seconds are derived only for the allowlisted report.

For interleaved audio, `sampleCount` means frames per channel, not the count of
scalar channel values:

```text
generated duration seconds = sampleCount / sampleRateHz
request RTF = accepted-to-complete wall seconds / generated duration seconds
```

Every successful generation has positive `sampleCount`, `sampleRateHz`,
duration, and wall time. The summary validator recomputes duration and RTF with
an absolute tolerance of `0.000001` seconds. Resampling, container duration,
text length, model tokens, or a library-reported estimate is not an arithmetic
authority.

Adapter setup, model load, and the excluded warm-up are not part of warm RTF.
Per-request internal chunk gaps are part of accepted-to-complete time.

## Percentiles and minimum samples

Sort valid observations in ascending numeric order. For `n` values, use the
nearest-rank value at one-based rank `ceil(p × n)`:

- p50 uses `ceil(0.50 × n)`;
- p95 uses `ceil(0.95 × n)`; and
- maximum is the final sorted value.

Do not interpolate. Five cold observations make cold p95 the maximum. Warm
distributions require all 24 observations. A 15-second-media distribution uses
only outputs that reach 15 seconds and reports its count; shorter outputs have
their own completion distribution. The sustained distribution requires every
completed request used to reach 180 seconds. Missing, timed-out, retried, or
failed requests fail the zero-failure gate and cannot be hidden by percentile
selection.

## Memory collection

Sample memory every 50 milliseconds from the beginning of load through worker
exit.

- RAM is the sum of working-set bytes for the measurement worker and recursively
  discovered children by numeric PID/parent-PID relationship. Record peak bytes
  above the pre-start baseline. Do not inspect or report command lines, paths,
  environment values, or window titles.
- On CUDA, VRAM is the peak allocation attributed to the exact worker PID and
  its children through NVML. Subtract the recorded pre-load baseline.
- Record `unavailable` only when the platform cannot provide a reliable
  process-attributed measurement. Never substitute zero.

RAM is mandatory for both roles. VRAM is mandatory for the balanced CUDA
profile. A CUDA result with unavailable VRAM is invalid. A compatibility CPU
profile records VRAM as `unavailable` and must also prove that no GPU execution
provider or device allocation was selected.

## Timeouts

The following wall-clock timeouts are fixed:

| Operation | Timeout |
| --- | ---: |
| One process-cold load | 120 seconds |
| One warm or sustained request | 120 seconds |
| Complete sustained phase | 900 seconds |
| Cooperative cancellation observation | 500 milliseconds |
| Forced worker termination after cancellation | 2 seconds |
| Worker/process-tree cleanup | 5 seconds |

A timeout is a failed observation. It cannot be retried within an otherwise
valid official run.

## Cancellation and cleanup

Run exactly these five trials after the sustained phase:

1. `before-dispatch`;
2. `accepted-before-audio`;
3. `after-first-audio`;
4. `after-five-media-seconds`; and
5. `near-hard-mid-generation`.

Each trial uses a new generation identity. Cancellation succeeds when either:

- the adapter acknowledges and stops production within 500 milliseconds; or
- for an engine without cooperative interruption, the isolated worker and all
  children terminate within 2 seconds.

Every trial must publish zero frames after its cancellation boundary, expose no
cancelled output to a later request, leave no child process after 5 seconds,
and remove its raw session directory. Worker termination is an acceptable
feasibility capability only when the summary identifies it; it is not evidence
of a future production cancellation design.

## Numeric selection gates

Every gate is conjunctive. A role fails if any required measurement is missing,
unavailable, timed out, arithmetically inconsistent, or above/below its bound.
No weighted score can compensate for a failed gate.

### Balanced role

The exact Windows x86-64 CUDA profile must satisfy:

| Gate | Required value |
| --- | ---: |
| Process-cold load p95 | at most 60 seconds |
| Warm first-produced-audio p95 | at most 3 seconds |
| Warm time to 15 seconds of media p95 | at most 12 seconds |
| Warm shorter-complete p95 | at most 5 seconds |
| Warm request RTF p95 | at most 0.80 |
| Sustained request RTF p95 | at most 0.80 |
| Total sustained RTF | at most 0.75 |
| Peak process-tree RAM above baseline | at most 12 GiB |
| Peak process-attributed VRAM above baseline | at most 6 GiB |
| Failed or timed-out official observations | exactly 0 |

### Compatibility role

The exact Windows x86-64 CPU profile must satisfy:

| Gate | Required value |
| --- | ---: |
| Process-cold load p95 | at most 30 seconds |
| Warm first-produced-audio p95 | at most 5 seconds |
| Warm time to 15 seconds of media p95 | at most 18 seconds |
| Warm shorter-complete p95 | at most 7 seconds |
| Warm request RTF p95 | at most 1.10 |
| Sustained request RTF p95 | at most 1.10 |
| Total sustained RTF | at most 1.08 |
| Peak process-tree RAM above baseline | at most 4 GiB |
| GPU providers or device allocations | exactly 0 |
| Failed or timed-out official observations | exactly 0 |

The compatibility RTF ceiling corresponds to no more than approximately five
seconds of production deficit per generated minute. It is an evaluation gate,
not an implemented buffering guarantee.

Both roles additionally require all cancellation, offline, privacy, artifact,
license, and cleanup gates to pass. A license status of `needs-review` or an
artifact/checksum mismatch fails selection.

## Blinded Spanish listening rubric

At least three evaluators who can fluently understand Spanish score every
candidate/case artifact. Candidate labels and order are independently
randomized for each evaluator. Evaluators receive the case ID and evaluation
instructions, not the engine/model/voice identity, benchmark ranking, or
another evaluator's score. Audio remains ephemeral in the ignored raw session
and is deleted after aggregate validation.

Use integer scores from 1 through 5:

1. unusable or meaning is materially lost;
2. major defects require effort to understand;
3. understandable with noticeable defects;
4. clear and suitable for ordinary narration; and
5. consistently natural and accurate for the case.

Score these seven dimensions:

1. intelligibility;
2. Spanish pronunciation and stress;
3. punctuation and dialogue delivery;
4. numbers, dates, times, currency, and percentages;
5. embedded foreign-name handling;
6. naturalness and prosody; and
7. freedom from audible artifacts, repeats, skips, or truncation.

Use `not-applicable` for a dimension not exercised by a case; never replace it
with a favorable score. For each applicable case/dimension, take the median of
the evaluator scores. A dimension score is the arithmetic mean of its case
medians. The overall quality score is the arithmetic mean of the seven
dimension scores.

Balanced quality requires overall at least 3.50, intelligibility and Spanish
pronunciation each at least 3.50, and every dimension at least 3.00.
Compatibility quality requires overall at least 3.25, intelligibility and
Spanish pronunciation each at least 3.25, and every dimension at least 2.75.
Any repeat, skip, truncation, or meaning-changing pronunciation affecting a
required case is also a failed zero-defect gate.

This small panel is a product-feasibility screen, not a population study,
accessibility certification, speaker-preference survey, or proof for dialects,
voices, languages, and text shapes outside this corpus.

## Summary allowlist

The private benchmark schema is
[`summary-v1.schema.json`](../../benchmarks/tts/schemas/summary-v1.schema.json).
It permits only:

- authority versions, stable IDs, commit/tree state, and report purpose;
- content-free host/runtime/provider identifiers and numeric capacities;
- artifact names, immutable revisions, hashes, and sizes;
- sample format/capability declarations;
- content-free case IDs, phases, counts, durations, RTF, percentiles, and
  memory values;
- fixed cancellation trial IDs and cleanup observations;
- aggregate quality scores and evaluator count;
- fixed audit outcomes, failed-gate codes, and limitation/note enums.

All objects reject unknown fields. There is no field for narration text,
canaries, audio, paths, URLs, exception messages, logs, prompts, model output,
environment values, or free-form notes. `unavailable` is accepted only in the
explicit memory/timing fields defined by the schema and is never equivalent to
zero.

The checked-in valid fixture is synthetic schema evidence, not an official
candidate result. Official summaries use `reportPurpose: "official-summary"`.

## Invalidation, deviations, and reruns

Invalidate the complete candidate/hardware run when any of these occurs:

- authority, corpus, candidate, lock, model, voice, runtime, provider,
  precision, parameter, adapter, driver, operating-system build, CPU, GPU, or
  memory configuration changes;
- the tree is dirty, an artifact hash differs, networking is available or
  attempted, or a privacy canary/text/audio/private path reaches a report;
- observation count, order, timeout, clock, sample metadata, arithmetic,
  percentile, memory attribution, or cleanup does not meet this profile;
- an engine applies candidate-specific rewriting to corpus text;
- raw generated audio or model output remains after summary validation; or
- material background load, sleep, thermal throttling, driver reset, worker
  leak, or measurement-tool failure affects the run.

A pre-result pilot may only make this protocol stricter and must occur before
any official summary exists. Record the reason in this document, create a new
profile version, and rerun every candidate. After the first official result,
any normative deviation—stricter or looser—requires a new profile version and
a complete rerun of every candidate so rankings remain comparable.

An invalid run produces no official summary. A failed but valid run may retain
one allowlisted summary with fixed failed-gate codes.

## Frozen-gate declaration

At acceptance of this document, no Qwen3-TTS or Supertonic model was executed,
no official audio was generated, and no candidate summary existed in the
repository. The gates above derive from VoxLeaf's local/offline, cancellation,
approximately 15-seconds-of-media startup, five-seconds-per-minute buffering,
bounded-memory, and Spanish-quality requirements. They were not copied from an
observed winner.
