# Local TTS CPU fallback profile v6

## Status and authority

This document records the pre-result authority for M010 Milestone 5. The
normative machine-readable authority is
[`profile-v6.json`](../../benchmarks/tts/profile-v6.json), SHA-256
`f8828876715e3ceafddebf59063b3651f5a007c8bb6512cf4df11e14488b7c34`.
It was frozen before any Piper pilot, official waveform, listening score, or
selection result.

The evaluation candidate is Piper `1.4.2` with the
`es_ES-davefx-medium` voice at the exact revisions and artifact hashes in
[`candidates-v6.json`](../../benchmarks/tts/candidates-v6.json). It is a new
candidate. It does not rename or reinterpret the rejected Supertonic/F1 or
CPU-only Qwen profiles.

This authority does not select a fallback. Selection requires a later clean
execution commit, complete machine evidence, the bounded listening screen,
and a content-safe decision. Until then, the product registry remains
unchanged and `cpuFallback` remains unsupported.

## Candidate and dependency boundary

Piper runs as a separately identified local CPU process through ONNX Runtime's
`CPUExecutionProvider`. Its isolated project and lock live below
`services/tts/benchmarks/candidates/piper_1_4_2_cpu`; neither Piper nor ONNX
Runtime enters the base service lock.

The engine and its bundled phonemizer are GPL-3.0-or-later. The voice card
identifies its dataset as CC0. Benchmark use is admitted. Product distribution
is admitted only if later packaging:

- preserves Piper as a separately identified local process;
- includes applicable GPL notices and copyright information;
- provides corresponding source or a compliant written offer; and
- includes the voice model card and CC0 provenance.

The M010 evaluation may select the technical profile, but it cannot waive
these M011 packaging obligations.

## Input and execution

[`corpus-v6.json`](../../benchmarks/tts/corpus-v6.json) contains eight
repository-authored synthetic Spanish short units. They are already valid
`narration-v1` normalized inputs, including numbers, currency, date, time,
temperature, and an embedded foreign name. Only `cases[].text` reaches the
engine. Canaries never do, and candidate-specific rewriting is forbidden.

The candidate is loaded once per measured session. One excluded warm-up is
followed by five cold-load observations, two ordered warm passes
(16 generations), sustained complete passes until at least 180 seconds of
media or ten rounds, and the five inherited cancellation races. Automatic
retries and configuration switching are forbidden; the first attempt is
authoritative.

Piper natively completes one sentence before yielding its audio. The adapter
may split that completed audio into bounded metadata chunks no longer than
250 milliseconds for the existing harness. This proves bounded publication
after a native sentence completes, not token-level streaming. Mid-generation
cancellation therefore uses identity invalidation followed by worker
termination; stale output may never be published.

## Mandatory performance and safety gates

All gates are conjunctive:

- cold-load p95 at or below 30 seconds;
- first-audio p95 at or below 5 seconds;
- time to 15 media seconds p95 at or below 18 seconds, or first audio at or
  below 7 seconds for shorter outputs;
- warm and sustained p95 RTF at or below 1.10;
- total sustained RTF at or below 1.08;
- peak process-tree RAM at or below 4 GiB;
- zero GPU provider allocations and no GPU requirement;
- zero failed or timed-out first attempts;
- all five cancellation trials pass with zero stale frames;
- verified artifacts, offline execution, network isolation, content-safe
  diagnostics, bounded raw state, worker cleanup, audio deletion, scorecard
  deletion, and sleep-setting restoration all pass.

The existing 120-second load/request, 900-second sustained, 500-millisecond
cooperative acknowledgment, 2-second worker-termination, and 5-second cleanup
limits remain binding.

## Bounded quality decision

Quality is admitted only after every machine, performance, cancellation,
privacy, and cleanup gate passes. One fluent Spanish maintainer reviews the
eight randomized synthetic samples for intelligibility, normalized
numbers/symbols, prosody, accent, and overall usefulness. This is the
previously accepted MVP evaluator policy, not a population-quality claim.

Overall, intelligibility, and Spanish means must each be at least 3.25; every
dimension must be at least 2.75; and meaning-changing defects must be zero.
The first complete evaluation is authoritative. Later listening cannot rescue
a failed gate without a new profile version.

## Result authority and privacy

Private measurements must validate against
`tts-cpu-fallback-raw-v6`. The only reviewable result is a content-safe
`tts-cpu-fallback-summary-v6` file. It records the authority commit and an
execution commit for which the authority commit is a strict ancestor.

Source text, canaries, waveforms, model/user paths, command lines, environment
values, raw exception messages, private scorecards, randomization keys, and
evaluator identity are forbidden in committed evidence. Raw sessions and
generated audio remain below the ignored raw tree and are deleted after safe
derivation.

If any mandatory gate fails, `selection-v6.md` must retain CPU fallback as
unsupported and M010 stops at this hard evidence gate. Only a complete pass
may admit this exact immutable profile to the product registry.
