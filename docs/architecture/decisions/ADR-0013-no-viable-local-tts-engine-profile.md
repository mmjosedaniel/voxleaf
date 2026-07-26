# ADR-0013: Select no local TTS engine profile from the v2 evaluation

## Status

Accepted.

## Context

Milestone 6 must provide Milestone 7 with either measured balanced and
CPU-compatible local TTS profiles or an explicit blocker. Candidate admission,
one successful synthesis demonstration, or favorable average quality cannot
select a profile. The accepted
[`tts-feasibility-profile-v2`](../tts-feasibility-profile-v2.md) makes every
performance, resource, cancellation, offline, privacy, artifact, license,
cleanup, and quality gate conjunctive.

The content-free
[`selection-v2`](../../../benchmarks/tts/selection-v2.md) record applies that
authority to two exact profiles:

- balanced:
  `qwen3-tts-0-6b-customvoice-cuda-bf16-v1`, using
  `qwen-tts==0.1.1`,
  `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice@8f9ebcf8826db6eeb9cdd4caa09d575a7f9ce4bd`,
  embedded Aiden voice, PyTorch and Torchaudio `2.9.1+cu128`, CUDA,
  bfloat16, and SDPA; and
- compatibility:
  `supertonic-3-onnx-cpu-f1-es-v1`, using `supertonic==1.3.1`,
  `Supertone/supertonic-3@3cadd1ee6394adea1bd021217a0e650ede09a323`,
  F1 voice, Spanish mode, ONNX Runtime `1.27.0`
  `CPUExecutionProvider`, float32, eight steps, speed `1.05`, and a
  300-code-point engine chunk limit.

Both official `v2` performance matrices are valid. The available blinded
Spanish evaluation had one fluent evaluator rather than the frozen minimum of
three, so it is limited evidence and cannot produce a passing or promotable
quality result. That missing evidence remains unfavorable; it is not replaced
with zero, an estimate, or the single-evaluator mean.

## Decision

### Select neither evaluated profile

No balanced profile and no compatibility profile is selected.

The exact Qwen profile fails warm first-produced-audio latency, time to produce
15 seconds of media, shorter-complete latency, warm request RTF, sustained
request RTF, total sustained RTF, zero-failure, mid-generation cancellation,
minimum quality-panel size, and zero-defect quality gates. Its cold load,
process RAM, dual-signal process VRAM, artifact, offline, cleanup, and license
gates pass.

The exact Supertonic profile fails warm first-produced-audio latency,
zero-failure, mid-generation cancellation, minimum quality-panel size, and
zero-defect quality gates. Its remaining numeric, process RAM, zero-GPU,
artifact, offline, cleanup, and decision-sufficiency license gates pass.

These are rejections of the exact measured configurations, not universal
claims about either model family, another voice, another API, another runtime,
or another hardware configuration.

### Record only the capabilities directly proved

Both exact profiles proved local complete-waveform synthesis after explicit
networked acquisition and then completed synthesis while their exact
interpreters were blocked outbound. Neither proved audible playback,
incremental audio delivery, or usable mid-generation cancellation.

For the Qwen profile:

- local generation, exact-host CUDA acceleration, and offline-after-setup
  operation are supported by direct evidence;
- streaming generation and mid-generation cancellation are unsupported by the
  evaluated complete-waveform API boundary; and
- CPU fallback is unknown because it was not evaluated.

For the Supertonic profile:

- local generation, exact-host CPU execution without GPU allocation, and
  offline-after-setup operation are supported by direct evidence;
- streaming generation and mid-generation cancellation are unsupported by the
  evaluated complete-waveform API boundary; and
- hardware acceleration is unknown because it was not evaluated.

Worker-process termination made the pre-dispatch and accepted-before-audio
cancellation trials bounded. It did not create a valid mid-generation
cancellation boundary and does not select a production process topology.

### Add no production dependency or model artifact

The production `services/tts` package retains zero runtime dependencies.
Neither candidate library, isolated lock, model, voice artifact, generated
audio file, raw journal, or benchmark waveform becomes part of the production
application or normal CI.

Qwen engine and model licensing are Apache-2.0. Its measured model plus
isolated environment occupies 7,725,856,438 bytes and has high packaging risk,
including a large CUDA/native graph and driver coupling.

Supertonic engine code is MIT; its model and F1 voice are BigScience
OpenRAIL-M. Its measured model plus isolated environment occupies 526,432,796
bytes and has moderate packaging risk. Distribution would still require
enforceable use restrictions, downstream license and notice flow,
machine-generated-content disclosure policy, modified-file notices where
applicable, and model-update review.

These licenses are sufficiently clear for rejection. This ADR does not approve
redistribution, installer contents, or production acquisition for either
candidate.

### Block engine integration and require a new evaluation authority

Milestone 7 has no engine/profile integration input and remains blocked. The
next engine decision must:

1. admit an exact candidate or materially changed engine API with a credible
   incremental-audio and mid-generation cancellation boundary;
2. freeze a new feasibility profile version before observing results;
3. execute the complete performance, resource, quality, offline, licensing,
   cleanup, privacy, and packaging protocol, including at least three
   fluent-Spanish evaluators; and
4. accept a superseding ADR only if every applicable gate passes.

A future model adapter owns model-specific tokenization, phonemization,
parameter mapping, or other required preprocessing inside the TTS service. It
must consume the existing ephemeral prepared narration text and must not
change `narration-v1`, displayed EPUB text, or stable source ranges to rescue a
model.

### Keep later runtime decisions deferred

This decision does not select or implement:

- desktop-to-service transport, process supervision, request/event framing, or
  installer topology;
- a production model acquisition, update, storage, hardware-detection,
  recommendation, or fallback policy;
- a production audio sample format, frame size, queue, backpressure, playable
  buffer, playback API, or speed-control mechanism;
- command-to-audible startup, underrun behavior, reader synchronization,
  highlighting, seeking, or progress policy; or
- production engine cancellation containment.

The approximately 15-second rule remains a future playable-audio lead, not a
fixed wall-clock delay and not permission to overlook failed generation
latency.

## Consequences

- Milestone 6 produces a durable, reproducible no-viable-profile decision
  without weakening its pre-result authority.
- Milestone 7 cannot integrate Qwen, Supertonic, or a different engine until a
  new evaluation cycle supplies a passing profile and superseding ADR.
- The production dependency graph, local-first privacy boundary, in-memory
  audio policy, and current public contracts remain unchanged.
- The failed profiles remain useful bounded evidence for future intake and
  avoid repeating the same exact configurations without a material change.
- A future evaluation costs additional benchmark and listening work, but that
  cost is preferable to building the service around an engine that already
  fails startup, cancellation, or complete quality gates.
- Hardware claims remain limited to the two named measured configurations.
  Neither rejection establishes universal hardware support or impossibility.

## Alternatives considered

### Select Qwen as the balanced profile because its limited quality was higher

Rejected. The single-evaluator result is not promotable, includes four
meaning-changing defects, and cannot compensate for multiple latency,
throughput, cancellation, and zero-failure gate failures.

### Select Supertonic as the compatibility profile because most numeric gates pass

Rejected. Warm first-produced audio is more than twice the frozen limit, all
three mid-generation cancellation trials fail, and the limited quality result
has five meaning-changing defects. Passing throughput and footprint gates
cannot compensate for conjunctive failures.

### Treat worker termination as production cancellation

Rejected. It bounds some benchmark trials but does not prove an incremental
output boundary, cooperative model cancellation, stale-frame containment, or
acceptable production restart behavior.

### Lower gates or select the least-bad candidate

Rejected. Changing gates after observing results would invalidate the
candidate-neutral authority. A weighted score is explicitly prohibited.

### Add both candidates as optional production dependencies

Rejected. Neither profile is viable, and adding roughly 7.73 GB and 0.53 GB
benchmark environments would create unsupported packaging, update, license,
and hardware behavior without an authorized runtime target.

### Continue Milestone 7 with only a transport prototype

Rejected as the Milestone 7 implementation path. Transport, framing, and
process topology must be designed around real engine output and cancellation
behavior. A separately scoped, model-free investigation may inform a future
plan but cannot claim engine integration or unblock Milestone 7.
