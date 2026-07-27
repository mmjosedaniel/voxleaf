# VoxLeaf development roadmap

## Status and purpose

VoxLeaf is pre-alpha. Milestones 1 through 8 are complete. M008's exact-development path connects the active visual locator to bounded narration preparation, one-at-a-time M007 synthesis, the adaptive FIFO/player, and accessible controls. Its final policy selects quick mode by default, one minute as the initial prepared/refill target, 10-second low water, zero default boundary wait, `1.0x` playback, and the simultaneous 30-minute ceiling. The final packaged rerun measured 41.312 seconds to audible quick playback and 19.49 buffering seconds per playback minute. Because that exceeds the MVP target, this remains a constrained demo rather than a standard, continuous-playback, production, distribution, or general-hardware profile. Milestone 9 is in progress: its first four implementation milestones freeze and prove segment-level authority, publish bounded source-range audible progress, connect non-mutating highlight/follow behavior to the reader, and implement identity-first synchronized user navigation. Heard-position persistence remains.

Create or refine a detailed ExecPlan only when a milestone is ready to begin. Keep implementation focused on one active milestone or independently safe task at a time, update the roadmap when evidence changes the sequence, and do not mark planned behavior as implemented until its acceptance checks pass.

## Guiding constraints

Every milestone must preserve the product's defining constraints:

- EPUB contents and reading data remain local by default.
- TTS inference runs on the user's device.
- Generated narration is bounded in memory and is not persisted by default.
- Long-running generation is cancellable, and stale-session audio can never reach playback.
- Untrusted EPUB content is validated, sanitized, and isolated before rendering.
- Visual reading, narration, highlighting, and saved progress share one logical reading position.
- Performance is measured without recording book text or generated audio.
- Claims about hardware support, latency, quality, or packaging require validation.

## Milestone sequence

```text
1. Engineering foundation
    -> 2. Shared contracts and deterministic test harness
    -> 3. Secure EPUB ingestion and document model
    -> 4. Reflowable visual reader and position restoration
    -> 5. Narration text preparation
    -> 6. Local TTS feasibility and engine selection
    -> 6.1. Local TTS profile blocker resolution
    -> 6.2. Qwen short-segment batch and dual-worker feasibility
    -> 7. Local TTS service and process protocol
    -> 8. Bounded audio playback and scheduling
    -> 9. Synchronized reading and narration
    -> 10. Hardware profiles, fallback, and resilience
    -> 11. Packaging and MVP validation
```

Some prototypes may inform later milestones before their full implementation begins, but the dependency order should remain explicit. In particular, model benchmarking can start once the engineering foundation and benchmark contracts exist, while EPUB and reader work continue independently.

## Milestone 1: Establish the engineering foundation

**Status:** Complete as of 2026-07-21. Milestones 2 through 6 are also complete.

### Goal

Turn the documentation-only repository into a reproducible development workspace and resolve the minimum stack decisions needed for implementation.

### Expected outcome

- The desktop, shared package, EPUB package, and local TTS service areas exist as minimal buildable projects.
- Supported Node.js, package-manager, Rust, and Python versions are pinned and documented.
- The candidate Tauri, React, TypeScript, and Python direction is either validated and adopted or replaced through a documented decision.
- Formatting, linting, type checking, unit testing, and production-build commands exist and have been run successfully.
- Deterministic checks run in continuous integration without requiring model weights or GPU hardware.
- Windows development is documented, including how PowerShell and WSL may share the repository without mixing incompatible environments or generated artifacts.

### Dependencies

None beyond the existing product and architecture foundation.

### Early decisions and risks

- Confirm the desktop stack rather than treating candidate tools as already selected.
- Choose one JavaScript package manager and workspace strategy.
- Decide supported runtime versions and the ownership of generated files.
- Verify Windows native prerequisites, WebView availability, and the boundary between Windows desktop builds and WSL-based development.
- Keep the initial scaffold minimal so toolchain work does not prematurely lock in EPUB, transport, audio, or model dependencies.

## Milestone 2: Define shared contracts and a deterministic test harness

**Status:** Complete as of 2026-07-21.

### Goal

Establish the framework-independent language used by the reader, EPUB pipeline, TTS service, scheduler, persistence layer, and audio player.

### Expected outcome

- Typed contracts represent book identity, spine items, stable reading locators and ranges, reading sessions and generations, narration segments, framed audio metadata, buffer state in playable seconds, errors, capabilities, and persisted reading state.
- Contract serialization and versioning are explicit across process boundaries.
- Fake EPUB, TTS, clock, and audio sources enable deterministic testing without copyrighted content, model weights, special hardware, or audible playback.
- Synthetic fixtures cover representative chapters, paragraphs, dialogue, images, malformed structures, and navigation.

### Dependencies

Milestone 1 provides the workspace, test runners, and language boundaries.

### Early decisions and risks

- Avoid duplicating protocol types between TypeScript, Rust, and Python.
- Choose stable book identity without storing book prose or relying only on private absolute paths.
- Define session invalidation before any asynchronous producer can enqueue work.
- Decide how contracts evolve without silently breaking persisted state or the local protocol.

## Milestone 3: Build secure EPUB ingestion and the document model

**Status:** Complete as of 2026-07-22. Focused, root, Windows native CI, Ubuntu portable CI, privacy, and scope validation passed.

### Goal

Convert an untrusted local EPUB into a safe, ordered, framework-independent representation suitable for visual rendering and narration.

### Expected outcome

- VoxLeaf validates the archive and rejects malformed, unsupported, path-traversing, or resource-exhausting input with recoverable errors.
- Metadata, table of contents, spine order, readable XHTML, local images, and structural boundaries are extracted.
- Scripts, remote resources, hidden noise, unsafe SVG or styling, and irrelevant navigation content are removed or isolated.
- Stable reading locators resolve across sanitized content and fall back safely when an exact target is unavailable.
- Deterministic unit and integration tests use synthetic or documented public-domain fixtures.

### Dependencies

Milestone 2 supplies the book, document, locator, error, and fixture contracts.

### Major risks and unknowns

- EPUB parser and renderer libraries may differ in EPUB 2, EPUB 3, navigation, CSS, SVG, and CFI support.
- Archive bombs, malformed paths, encoded traversal, and oversized resources require explicit bounds.
- Sanitization must preserve meaningful reading structure without allowing active or remote content.
- Locator round-tripping must be prototyped before a dependency becomes difficult to replace.

## Milestone 4: Deliver the reflowable visual reader and position restoration

**Status:** Complete as of 2026-07-24. The visual reader, bounded persistence/restoration, deterministic/browser/native interaction coverage, browser/native performance-resource evidence, broader native Task 2.3 file-open matrix, repository/privacy/scope validation, and pull-request CI all pass.

### Goal

Provide a useful visual ereader before adding real speech generation.

### Expected outcome

- A user can open a valid EPUB, see title and author, navigate its table of contents, and read formatted reflowable text and local images.
- Typography, theme, viewport changes, continuous scrolling, keyboard navigation, and visible focus support comfortable reading. Pagination remains deferred by ADR-0008.
- The logical reading position survives reflow and is saved locally without storing book prose.
- Reopening a known book restores the same passage or the nearest valid location.
- Invalid files and restoration failures produce understandable recoverable states.

### Dependencies

Milestone 3 provides sanitized content and stable locators. Milestone 2 provides persistence contracts and deterministic test support. [ADR-0008](../architecture/decisions/ADR-0008-visual-reader-architecture.md) defines the approved visual-rendering, navigation, and active-position boundary.

### Retained implementation boundaries

- Preserve the implemented ADR-0008 direct semantic DOM boundary without reintroducing publisher markup, styles, URLs, DOM identifiers, rendered geometry, or prose in persisted state.
- The expanded packaged native reselection, picker/active-read cancellation, replacement, and exact/max-plus-one size-boundary matrix passes locally and in pull-request CI.
- Successful focused, browser, packaged native, benchmark, root, portable, and CI evidence is retained in the completed plan; accepted reference-host measurements are not universal hardware guarantees.
- Reconfirm that ADR-0009 file ingress, ADR-0010 raster decode/lifetime, ADR-0011 bounded persistence, the 250-block scheduler, and the 10,000-block/80,000-node fallback remain intact.
- Keep Milestone 5 narration preparation outside the completed Milestone 4 reader boundary; TTS, audio, highlighting, synchronization, and manual-navigation-during-narration policy remain owned by their later roadmap milestones.

## Milestone 5: Prepare text for natural narration

**Status:** Complete. Tasks 1.1-1.3 accept ADR-0012, the deterministic test-only neutral/Spanish corpus, and the model-independent `narration-v1` chunk/resource profile. Tasks 2.1-2.3 implement exhaustive package-internal semantic source projection, Unicode-code-point source-span tokens, bounded canonical source windows, deterministic continuation/checkpoint/yield behavior, one-active-operation ownership, and close-linked cancellation. Tasks 3.1-3.4 implement deterministic source-mapped neutral/Spanish normalization, cross-category invariants, and privacy canaries while preserving code and ambiguous or unsupported forms. Tasks 4.1-4.4 implement deterministic source-offset sentence/dialogue-turn/clause/protected-token scanning, cancellable block-local semantic packing under the accepted per-segment, retained-output, and work limits with fixed oversized-token behavior, and immutable canonical locator-linked prepared segments compatible with the unchanged shared narration contract. Task 5.1 exposes frozen bounded batches and closed content-free outcomes through `OpenedPublication.prepareNarration`; Task 5.2 proves the repository-authored public EPUB-to-segment neutral/Spanish integration matrix, source immutability, stable ranges, continuation, structural gaps, and capability isolation; and Task 5.3 proves exact deterministic work, batch, lookahead, retained-state, repeated-batch, cancellation, close, and privacy bounds without a hardware claim. Tasks 6.1-6.2 reconcile the documentation and complete focused, root, CI, privacy, artifact, and scope validation. Pull request #91 Foundation run 30161853712 passed both Ubuntu portable and Windows native jobs on exact implementation-and-evidence head `25d0f77714f0520f0a0012240093f6a16de42f4b`.

**Detailed ExecPlan:** [`completed/M005-narration-text-preparation.md`](completed/M005-narration-text-preparation.md)

### Goal

Create a deterministic narration representation and semantic segmentation pipeline without changing the displayed EPUB text.

### Expected outcome

- Normalization handles whitespace, line-break artifacts, punctuation, quotations, ellipses, abbreviations, numbers, dates, times, currency, symbols, and line-end hyphenation.
- Spanish-specific rules receive representative early coverage.
- Semantic chunks respect paragraphs, dialogue, headings, scene breaks, abbreviations, decimals, initials, and long sentences.
- Every narration segment maps back to a stable locator range for seeking, highlighting, cancellation, and progress.
- Chunk sizing is bounded and measurable rather than based on one arbitrary character limit.

### Dependencies

Milestones 2 through 4 provide the shared locator-range and narration-segment contracts, safe structured readable content, deterministic Unicode-code-point locators, and the visual reading-position boundary. The completed ExecPlan retains Milestone 5's implementation and validation authority; the older synchronized-reader plan is context only.

### Major risks and unknowns

- Over-normalization can change meaning or pronunciation.
- Segmentation that improves prosody may increase startup or seek latency.
- Model-specific preprocessing must not leak into general application contracts without evidence.
- Spanish abbreviations, dialogue, numbers, and embedded foreign names require a reproducible test corpus.

## Milestone 6: Prove local TTS feasibility and select engine profiles

**Status:** Complete. The
[Milestone 6 completed ExecPlan](completed/M006-local-tts-feasibility-and-engine-profiles.md)
records the frozen candidate-neutral harness, both exact measurements, the
limited one-evaluator Spanish result, the license/offline/packaging audit, and
the deterministic, hardware, privacy, artifact, repository, and required CI
closeout.
[ADR-0013](../architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md)
selects neither profile. No production runtime dependency or general
hardware-support claim exists.

### Goal

Use reproducible benchmarks to determine whether candidate local TTS engines can satisfy the MVP on documented hardware.

### Expected outcome

- Candidate balanced and CPU-compatible engines are benchmarked with the same safe Spanish-focused corpus.
- Results report model load, warm-up, time to first audio, generated duration, real-time factor percentiles, RAM, VRAM, cancellation behavior, errors, and output capabilities.
- Model licenses, redistribution terms, download strategy, storage requirements, supported platforms, and offline behavior are understood.
- A balanced default direction and CPU fallback are selected through documented decisions, or the project records why a candidate is not viable.
- Supported hardware claims remain limited to measured configurations.

### Dependencies

Milestone 1 supplies the isolated Python foundation. Milestone 2 supplies capability, audio, error, primitive, and deterministic fake-test support; it does not define a dedicated benchmark-report schema. Milestone 5 provides representative normalization policy and bounded prepared segments. The [completed Milestone 6 plan](completed/M006-local-tts-feasibility-and-engine-profiles.md) defines its own fixed synthetic prepared-text corpus and private benchmark-report authority so inference measurements remain comparable without changing public runtime contracts.

### Major risks and unknowns

- Neither exact evaluated profile met all frozen gates; the next candidate cycle may also fail to produce a viable production profile.
- No CPU-compatible fallback is currently selected; a different engine, voice set, or tightly bounded role may be required.
- GPU and driver compatibility may vary sharply across user machines.
- Model installation and updates must not create an accidental runtime network dependency or silently exhaust disk, RAM, or VRAM.
- Any future evaluation must freeze its authority before results and preserve the content-safe, candidate-neutral evidence boundary. Later integrated playback evidence must still validate command-to-audible startup.

## Milestone 6.1: Resolve the local TTS profile blocker

**Status:** Complete as of 2026-07-26. Milestones 1–3 selected Serena, froze
`tts-feasibility-profile-v3`, passed the exact-host development stop gate, and
extended the candidate-neutral benchmark. Milestone 4 completed the official
matrix: resource/offline/audit gates passed, while startup, throughput,
zero-failure, and three mid-generation cancellation gates failed. One fluent
maintainer accepted audible quality for a near-term demo; ADR-0014 originally
permitted only a constrained development-demo exception, and ADR-0015 now
supersedes its scheduling and buffering details. Milestone 5 is complete:
[`selection-v3`](../../benchmarks/tts/selection-v3.md) retains the failed
standard blocker and separately records that exact demo exception. Milestone 6
local deterministic, candidate-import, repository/privacy, portable, and
authoritative Windows validation passed. Pull request #104 passed both required
foundation jobs on the exact evidence commit. The
[completed blocker-resolution ExecPlan](completed/M006-001-local-tts-profile-blocker-resolution.md)
records the candidate-intake evidence, decisions, tasks, and validation
sequence. Frozen `v3` remains failed and ADR-0013 remains authoritative for
standard production viability.

### Goal

Determine whether an exact local TTS profile can pass the unchanged product
constraints on the maintainer's available hardware before production process
or protocol work begins.

### Expected outcome

- Record the MVP's built-in-default-voice direction; Base ICL/x-vector voice
  cloning and reference-audio enrollment remain out of scope.
- Freeze and execute a bounded blinded Spanish screen across the nine official
  Qwen3-TTS 12Hz 1.7B CustomVoice speakers using one fixed synthetic corpus,
  neutral audiobook instruction, settings set, and predeclared selection
  rules.
- Select exactly one built-in speaker from that screen, then freeze its
  speaker ID, neutral instruction, and complete candidate identity in
  `tts-feasibility-profile-v3` before observing official benchmark results.
- Prove an actual incremental-audio and bounded cancellation boundary through
  the exact local runtime; upstream family-level streaming or 97 ms claims are
  candidate-intake facts, not VoxLeaf evidence.
- Keep the selected model resident under a complete
  candidate/speaker/instruction/settings identity, keep the frozen candidate
  batch at one, consume `narration-v1` segments, and release each bounded audio
  unit as soon as it is valid.
- Count first attempts honestly. Automatic retries cannot rescue official
  gates; Whisper and VAD/energy analysis are excluded from `v3`.
- Keep OpenAI Whisper outside the TTS candidate set. A separately pinned local
  Whisper runtime may be considered only as an optional benchmark ASR aid and
  cannot replace fluent-Spanish human quality review.
- Preserve the failed standard result and retain the production blocker.
  ADR-0015 now permits the exact profile only as one GPU worker for a bounded
  development-demo path with no real-time or continuous-playback claim.

### Dependencies

The completed Milestone 6 harness, frozen `v2` evidence, and ADR-0013 remain
the baseline. The implemented `narration-v1` package boundary supplies bounded
locator-linked text units. Candidate execution additionally requires an exact
isolated lock, verified local artifacts, outbound blocking, an authorized
built-in-speaker result and pre-result `v3` authority.

### Major risks and unknowns

- The installed high-level Qwen API returns complete waveforms despite the
  upstream family streaming claim; usable incremental delivery and
  mid-generation cancellation are still unproven.
- The 1.7B model may fail startup, throughput, memory, artifact-size,
  packaging, reliability, or complete-panel quality gates.
- None of the nine built-in speakers is described as Spanish-native; the
  frozen screen may reject all of them.
- The 1.7B CustomVoice profile may not improve enough over the failed 0.6B
  CustomVoice/Aiden profile to justify its additional resource cost.
- A modified runtime or third-party streaming fork may be too costly to audit,
  package, secure, and maintain.
- Automatic speech recognition can estimate content consistency but cannot
  judge naturalness, prosody, speaker similarity, or audible artifacts.

## Milestone 6.2: Prove Qwen short-segment and dual-worker feasibility

**Status:** Complete as of 2026-07-26. Milestones 1 through 8 and 10 are
complete; Milestones 5 and 9 were not admitted. The
[Milestone 6.2 ExecPlan](completed/M006-002-qwen-short-segment-batch-feasibility.md)
has the byte-frozen `v4` authority, bounded mechanics, and schema-valid
full-GPU plus targeted-CPU results. Both official arms observed 79,691,776
bytes of shared GPU memory, stopped on the exact zero-shared-memory rule,
cleaned their private raw sessions, and produced no usable audio/throughput
matrix. The CPU arm reproduced the full-GPU 4,432,904,192-byte authoritative
VRAM peak, so Milestone 5 playback/quality review was not admitted.
`selection-v4` selects neither placement. Milestone 6 freezes the separately
versioned `v5` authority and model-free guards. Milestone 7 implements the
independent GPU-primary/CPU-support benchmark mechanics, exact adapter paths,
bounded replay, and reviewed command surface. Milestone 8 records passing
CPU-solo admission, a slower-than-real-time GPU baseline, and a concurrent
`resource-limit` stop. The low-load diagnostic later completed but supplied
only a 2.6% aggregate gain while substantially slowing the GPU worker.
Milestone 9 is not admitted. Milestone 10 records accepted `selection-v5` and
ADR-0015; final local validation and required PR #112 CI pass on the exact
final implementation head. This work does not change failed batch-one `v3`,
frozen `v4`, or ADR-0013.

### Goal

Determine whether the exact Qwen/Serena candidate can keep a bounded playback
simulation supplied. The completed `v4` stage tested one resident model
generating two ordered short semantic units in one shared-model batch. The
completed `v5` stage tested one full-GPU primary worker plus one separately
loaded CPU-only float32 support worker. Neither topology is accepted.

### Expected outcome

- Batch sizes one and two are measured under one frozen candidate, corpus,
  settings, host, offline, privacy, and first-attempt authority.
- Per-unit latency, aggregate batch RTF, ordered delivery, buffer drift,
  underruns, RAM, VRAM, failures, cancellation, and cleanup are reported.
- Short units preserve `narration-v1` text, semantic boundaries, identities,
  stable locator ranges, and hard limits.
- Full-GPU execution is evaluated first. A separately identified targeted
  speech-tokenizer/audio-decoder CPU placement may run only if full-GPU batch
  two reaches a predeclared memory stop condition.
- The decision distinguishes unchanged standard-profile gates, scheduling
  sustainability, and constrained-demo usefulness without making a production
  or general-hardware claim.
- The frozen `v5` authority targets approximately 8-16 seconds per complete
  semantic unit without changing `narration-v1`, verifies the CPU worker uses
  no GPU/shared GPU memory, requires CPU-solo total sustained RTF at or below
  3.2 before concurrency, and compares CPU solo, same-authority GPU solo, and
  concurrent execution.
- Ordered playback still starts at approximately 15 playable seconds. The
  experiment may retain at most 300 playable seconds, 40 completed units,
  28,800,000 bytes of 24 kHz mono float32 PCM, and one active unit per worker.
  Five minutes is a capacity ceiling, not a required startup wait or proof of
  sustainable generation.
- `selection-v5` rejects CPU-only and dual-worker product scheduling. ADR-0015
  retains one exact GPU worker only for a bounded adaptive development demo and
  delegates implementation to M008.

### Dependencies

Milestone 6.1 supplies the exact failed candidate evidence and constrained demo
decision. Milestone 5 supplies stable bounded `narration-v1` units. The
candidate-neutral benchmark, exact isolated lock, verified local artifacts,
outbound blocking, and exact reference host remain required. Milestone 2 added
the reviewed disposable-pilot command before execution; Milestone 3 owns the
clean-checkpoint `v4` hardware run. The same plan's Milestone 6 freezes the new
`v5` CPU-only and concurrent authority. Milestone 7 now supplies the separate
reviewed command and model-free mechanics; Milestone 8 performs new hardware
work.

### Major risks and unknowns

- The Qwen batch API may serialize work or gain too little throughput to reach
  aggregate RTF below one.
- Batch-two activation, cache, or decoder memory may exceed the remaining VRAM
  headroom or trigger unacceptable Windows shared-memory paging.
- Complete batch returns may delay the first ordered unit behind a straggler.
- Shorter units may create prosody or join defects.
- CPU placement normally trades speed for accelerator capacity and may fail
  device placement, RAM, or throughput gates.
- A complete CPU-only second model may fit in RAM but still be too slow, may
  use an unsupported dtype, or may reduce GPU throughput through host-memory,
  thermal, or power contention.
- Independent completion can create ordered head-of-line stalls when the CPU
  owns an earlier segment than already completed GPU work.
- A five-minute maximum remains bounded but increases speculative work and the
  amount discarded after invalidation; it cannot compensate for aggregate RTF
  at or above one.
- Evidence from one 8-GiB laptop GPU cannot establish general hardware support.

## Milestone 7: Implement the local TTS service and process protocol

**Status:** Complete as of 2026-07-27. Milestones 1-6 are complete: the deterministic
Rust-owned standard-stream and binary Tauri-response probe passes, protocol
version 1 and ADR-0016 are accepted, closed control contracts are canonical
across TypeScript, Python, and Rust, and a bounded model-free Python service
passes its fake-engine lifecycle matrix. The native shell now supervises one
persistent model-free child with bounded framed I/O, timeouts, zero automatic
restart, process-tree cleanup, narrow commands, and application-exit cleanup.
A typed desktop client validates lifecycle/identity, owns at most one complete
binary unit outside React state, and releases or zeroes stale bytes. The
packaged fake-service matrix passes normal delivery, cancellation, crash
recovery, descendant cleanup, and zero external requests. Milestone 4 adds the
exact service-owned Qwen/Serena adapter behind frozen native-only
configuration; its first reviewed exact-host run passes load/warm, bounded
delivery, busy rejection, termination with zero stale return, clean reload,
and shutdown. Milestone 5 adds a frozen, content-safe measured exact-host
matrix: complete-unit delivery, retained-unit backpressure, every required
invalidation, process-tree termination, zero stale audio, cleanup, and
explicit reload pass on the first actual matrix attempt. Delivered-unit RTF
remains above one, so no sustainable-playback or production conclusion
changes. Milestone 6 retains ADR-0016 and protocol v1 after the complete
dependency, permission, privacy, artifact, historical-authority, and
documentation audit. PR #119 passed the required Ubuntu portable and Windows
native jobs and merged the exact final head. Follow the completed
[`M007-local-tts-service-and-process-protocol.md`](completed/M007-local-tts-service-and-process-protocol.md).
ADR-0015 permits a focused Qwen/Serena demo service around complete bounded
units and identity-first worker termination. ADR-0013 still records that no
standard profile passed, so continuous playback, general hardware support,
packaging, and production graduation require later evidence.

### Goal

Run the selected TTS engines behind a secure, typed, cancellable local process boundary.

### Expected outcome

- The desktop can start, monitor, use, recover, and stop a persistent local TTS service.
- Model loading, warm-up, capabilities, synthesis, complete-unit audio delivery, cancellation, health, recoverable errors, and fatal errors use a versioned protocol.
- Audio frames and control messages preserve session, generation, segment, format, and locator identity.
- The selected built-in speaker/instruction configuration has an explicit
  in-memory owner, complete identity key, invalidation rule, and release
  lifecycle.
- The service emits each valid bounded segment/frame unit when available
  rather than accumulating a paragraph or chapter.
- The service accepts bounded work, exposes measurable lifecycle state, and never logs narration text.
- The chosen transport is restricted to the local application boundary and does not expose book contents to other processes or the network.

### Dependencies

Milestone 2 defines shared contracts. Milestone 6 supplies the evaluation
authority but its first cycle selected no viable engine. Milestone 6.2's
accepted `selection-v5` rejects CPU-only and dual-worker scheduling and retains
one exact GPU worker only for ADR-0015's constrained demo. It remains evidence
work before any continuous-playback or standard-profile claim. Milestone 1
supplies process and packaging foundations.

M008 depends on this milestone for the constrained complete-unit service
handoff, but its
model-independent scheduler and playback behavior remain separately owned.

### Major risks and unknowns

- Implement the accepted Rust-owned standard-stream authority consistently across canonical schemas, Python, Rust, and TypeScript.
- Binary framing, backpressure, service crashes, protocol upgrades, and cancellation acknowledgments must remain observable.
- Some inference calls may not be immediately interruptible; stale results still must be rejected.
- Python sidecar and model packaging may be one of the largest installer and support risks.

## Milestone 8: Build bounded audio playback and scheduling

**Status:** Complete. M008 implements the exact adaptive authority, scheduler,
sole-owner FIFO, Web Audio player, presenter, controls, and
exact-development coordinator. The final policy retains quick mode by default,
one-minute initial prepared/refill target, 10-second low water, zero default
boundary wait, `1.0x` playback, and the simultaneous 30-minute ceiling. The
packaged matrix passes bounded quick/prepared playback, cancellation, cleanup,
and privacy while recording one underrun and 19.49 buffering seconds per
playback minute. That exceeds the MVP target and retains the standard blocker.
Follow
[`M008-bounded-adaptive-prebuffering.md`](completed/M008-bounded-adaptive-prebuffering.md).

### Goal

Create a model-independent in-memory producer-consumer pipeline that starts promptly, avoids unbounded work, and reports underruns honestly.

### Expected outcome

- A low-level audio player consumes framed PCM or another validated internal format from a bounded buffer outside React state.
- Initial playback starts immediately when approximately 15 seconds of valid playable audio is ready, or when a complete shorter remaining range is ready.
- The user may explicitly request a prepared-playback target of 1, 2, 5, or 10
  playable minutes with visible progress and an estimate.
- Low, target, and maximum buffer thresholds control generation and
  backpressure, with an approximately 30-minute simultaneous playable-audio
  ceiling.
- Played, cancelled, and stale frames are discarded and never persisted.
- Each selected-profile audio unit can enter the bounded queue immediately
  without requiring paragraph/chapter joining or a persistent audio cache.
- Playback-only pause may continue bounded generation for the same active
  identity. Explicit stop and navigation, settings, book, session, or exit
  invalidation cancel obsolete work.
- Low-buffer warnings, truthful frontier buffering, and optional measurable
  one- to three-second eligible paragraph/chapter waits work with deterministic
  fake audio before real-model integration.
- Pause, resume, flush, volume, supported speed control, buffering state, and
  underrun measurements work with deterministic fake audio before real-model
  integration.

### Dependencies

Milestone 2 provides audio and session contracts. ADR-0015 and M006-002 provide
the selected constrained-demo scheduling authority. Completed Milestone 7
provides the constrained complete-unit audio handoff, but most playback
behavior should first be proven with deterministic fakes.

### Major risks and unknowns

- Validate the selected Web Audio `AudioBufferSourceNode` mechanism in the
  later packaged product path; deterministic fake-context coverage now passes.
- Preserve the selected finite 24-kHz mono float32 little-endian format, sole
  original-unit FIFO ownership, and one bounded transient active device copy.
- Define the "shorter remaining range" used by the startup gate.
- Implement the frozen 10-second low-water, 15-second quick-start, one-minute
  refill, 1/2/5/10-minute prepared targets, and simultaneous
  43,200,000-frame/172,800,000-byte/256-unit plus prepared-text/active-work
  limits without treating 30 minutes as a startup target.
- Ensure adaptive waits never hide involuntary buffering or create an
  inaccessible playback state.
- Playback speed may require time stretching rather than changing sample rate.
- Browser, WebView, native shell, and OS audio behavior may differ under load or background operation.

## Milestone 9: Integrate synchronized reading and narration

**Status:** In progress; ExecPlan Milestones 1 through 4 complete. ADR-0017 and the frozen
synchronization authority select segment-level source ranges, CSS Custom
Highlight decoration, focus-safe following, immediate passive-navigation seek
with bounded settlement, stable-segment previous/next movement, and
non-skipping persistence checkpoints. Chromium and packaged WebView2 prove
the mechanism without publication mutation, focus/selection loss, URL changes,
runtime errors, or external requests. The bounded scheduler/player path now
retains immutable source ranges while units are eligible and publishes exact
start/completion plus 250 ms played-frame observations outside React
snapshots. The reader now consumes exact transitions through one bounded
Custom Highlight projection and follows outside the 24-pixel comfort region
without focus, selection, URL, DOM, or passive-tracker feedback side effects.
The coordinator now invalidates identity before cleanup, debounces passive
visual movement for 500 ms, preserves active or paused intent, and routes
chapter, visible-passage, and stable prepared-segment actions through the
reader's canonical focus policy. It retains at most 64 recent structural
ranges and exposes no prose, PCM, or work identity in React state.
Heard-position persistence is not yet implemented. Follow
[`M009-synchronized-reading-and-narration.md`](active/M009-synchronized-reading-and-narration.md)
for implementation authority.

### Goal

Join the visual reader, narration pipeline, TTS service, and player into the core VoxLeaf experience.

### Expected outcome

- Play starts from the visible logical reading position.
- The narrated paragraph remains visible and highlighted as audio crosses paragraphs, pages, and chapters.
- Pause, resume, previous or next movement, paragraph selection, seeking, chapter changes, model changes, voice changes, book close, and session replacement preserve one coherent reading position.
- Every invalidating action cancels or supersedes obsolete work, clears invalid audio, and prevents stale playback.
- Progress is saved without model failures corrupting the last valid reading location.
- Loading, generation, buffering, playing, paused, recoverable error, and fatal error states are understandable and accessible.

### Dependencies

Milestones 4, 5, 7, and 8 provide the visual reader, locator-linked segments,
constrained exact-development TTS service, and playback pipeline. M009 does not
resolve the standard-profile blocker.

### Major risks and unknowns

- Retain the implemented identity-first seek and prove that future persistence
  callbacks cannot feed back into passive navigation.
- Cancellation is connected across UI, coordinator, transport, inference
  queue, and audio buffer for the constrained path. A future mutable model or
  voice surface must replace the coordinator instead of mutating an active
  profile.
- Segment-level timing may be sufficient for paragraph highlighting but not future word-level synchronization.
- Automatic following must not disorient keyboard or assistive-technology users.

## Milestone 10: Add hardware profiles, fallback, and operational resilience

**Status:** Deferred. Capability contracts exist, but production hardware detection, measured profiles, CPU fallback, model recovery, and support claims do not.

### Goal

Make the integrated reader usable across documented supported hardware and recover gracefully when acceleration or models are unavailable.

### Expected outcome

- VoxLeaf detects relevant OS, CPU, RAM, GPU, VRAM, CUDA, ONNX providers, and supported precision without sending telemetry.
- The UI recommends a measured engine profile while retaining user control and avoiding unsafe memory use.
- CPU-compatible fallback, model-load failure recovery, service restart, cancellation timeout, and degraded buffering behavior are tested.
- Any automatic segment retry is bounded, observable, identity-safe, and based
  on classified recoverable failures; it cannot replay stale audio or hide
  reliability metrics.
- Production VAD/energy monitoring is added only if measured false-positive,
  latency, memory, dependency, and quality evidence justifies it.
- Long sessions keep memory, queues, GPU work, logs, and persisted state bounded.
- Diagnostics and benchmark summaries contain no book text, narration, secrets, or unnecessary private paths.

### Dependencies

Milestone 6 defines the evaluation authority, but its first cycle selected no
supported profile. A future frozen cycle must supply that input before
Milestones 7 through 9 can provide the integrated lifecycle and observable
metrics required here.

### Major risks and unknowns

- Hardware detection APIs may be incomplete or platform-specific.
- Automatic recommendations can be harmful without conservative memory margins and measured evidence.
- Recovery must not duplicate service processes, leak model memory, replay stale audio, or lose reading progress.
- The accepted buffer policy may require tuning by hardware profile without becoming unbounded or hiding poor sustained RTF.

## Milestone 11: Package, validate, and release the MVP

**Status:** Deferred. The repository can build a release executable for validation, but installer bundling, signing, model/runtime distribution, updater policy, and complete-MVP validation are not implemented.

### Goal

Produce a documented Windows installation and demonstrate that the complete MVP meets its functional, privacy, accessibility, reliability, and performance criteria.

### Expected outcome

- A user can install or follow verified local setup instructions, open a safe EPUB, read visually, restore progress, and listen through a supported local voice.
- Production packaging includes the desktop shell, local service, required runtimes, and a deliberate model acquisition strategy.
- Unit, integration, end-to-end, accessibility, security, build, packaging, and hardware-specific performance checks are documented and pass at the applicable levels.
- A sustained reading test covers playback, buffering, page and chapter transitions, pause, seek, resume, cancellation, service failure, and restoration.
- Privacy review confirms that normal reading requires no remote service and persists no generated narration.
- Supported and unsupported hardware, known limitations, benchmark results, setup, troubleshooting, and recovery are documented honestly.

### Dependencies

All earlier milestones. Packaging exploration should begin during Milestones 6 and 7 because model and Python distribution risks can invalidate late assumptions.

### Major risks and unknowns

- Installer size, code signing, antivirus behavior, WebView and native dependencies, Python embedding, model downloads, and GPU runtime compatibility.
- Hardware-specific benchmarks may expose an unsupported default model or buffer policy.
- Accessibility and long-session failures are expensive to fix if postponed until final packaging.
- Portfolio or release claims must reflect validated behavior rather than the intended architecture.

## Cross-milestone decision gates

The following decisions should be made when evidence is available, not assumed silently:

1. **Desktop stack gate:** validate and adopt the desktop framework, workspace, package manager, and supported development environments during Milestone 1.
2. **EPUB gate:** validate archive limits, sanitization, rendering isolation, locator round-tripping, and dependency licensing before completing Milestone 3.
3. **Persistence gate:** ADR-0011 selects bounded WebView `localStorage`, separate versioned position/preference envelopes, save lifecycle, and desktop-owned migration; implement and validate that boundary before completing Milestone 4.
4. **TTS gate:** the completed Milestone 6 cycle and failed Milestone 6.1 `v3` matrix select no standard passing profile. Milestone 6.2 rejects CPU-only and dual-worker scheduling. ADR-0015 permits only one exact GPU worker for a bounded adaptive development demo. A production role must still pass every applicable gate or receive a separate explicit acceptance decision before production graduation.
5. **Protocol gate:** record transport, framing, backpressure, and local exposure decisions before completing Milestone 7.
6. **Audio gate:** satisfied by completed M008 and ADR-0015. The internal format,
   Web Audio mechanism, `1.0x` policy, quick/default and explicit prepared
   rules, low/target/maximum bounds, playback-only pause behavior, truthful
   frontier buffering, and zero default boundary wait are recorded, and the
   required Ubuntu and Windows pull-request checks passed.
7. **Interaction gate:** satisfied for M009 Milestone 4 by the frozen 500 ms
   passive settlement, identity-first chapter/visible-passage/stable-boundary
   path, paused-intent preservation, and accessible controls. Heard-position
   persistence remains the next Milestone 9 gate.
8. **Release gate:** define supported hardware and wall-clock startup expectations from measured results before release.

Durable decisions belong in architecture decision records. Temporary implementation detail belongs in the active ExecPlan. Benchmark results and discovered constraints should update later milestones rather than forcing the project to follow an obsolete roadmap.

## Relationship to existing plans

[`completed/M004-reflowable-visual-reader-and-position-restoration.md`](completed/M004-reflowable-visual-reader-and-position-restoration.md), [`completed/M005-narration-text-preparation.md`](completed/M005-narration-text-preparation.md), [`completed/M006-local-tts-feasibility-and-engine-profiles.md`](completed/M006-local-tts-feasibility-and-engine-profiles.md), [`completed/M006-001-local-tts-profile-blocker-resolution.md`](completed/M006-001-local-tts-profile-blocker-resolution.md), [`completed/M006-002-qwen-short-segment-batch-feasibility.md`](completed/M006-002-qwen-short-segment-batch-feasibility.md), [`completed/M007-local-tts-service-and-process-protocol.md`](completed/M007-local-tts-service-and-process-protocol.md), and [`completed/M008-bounded-adaptive-prebuffering.md`](completed/M008-bounded-adaptive-prebuffering.md) record the implementation authority and validation evidence for Milestones 4 through 8. Milestone 6 supplies development evidence and a no-viable-profile decision; Milestone 6.1 retains the standard blocker; Milestone 6.2 records the rejected CPU/dual-worker alternatives plus ADR-0015's exact one-GPU constrained-demo exception; M007 implements that constrained service boundary; and M008 implements the bounded exact-development caller/player path. None selects production TTS.

[`completed/M007-local-tts-service-and-process-protocol.md`](completed/M007-local-tts-service-and-process-protocol.md)
records the completed constrained local service, protocol, native supervision,
exact Qwen/Serena adapter, complete-unit delivery, and cancellation
containment. It does not implement playback, promote the candidate to a
standard profile, or approve model/runtime distribution.

[`completed/M008-bounded-adaptive-prebuffering.md`](completed/M008-bounded-adaptive-prebuffering.md) records the exact authority, scheduler, payload-owning FIFO, Web Audio player, estimates/wait decisions, pause continuation, controls, exact-development coordinator, measured packaged playback, final demo policy, and repository/privacy/CI validation. The standard blocker remains.

[`active/M009-synchronized-reading-and-narration.md`](active/M009-synchronized-reading-and-narration.md)
is the approved focused implementation authority for segment-level audible
progress, highlighting, focus-safe following, synchronized navigation, and
heard-position persistence. Milestones 1 through 4 are implemented and
validated; later milestones retain heard-position persistence and closeout.

[`active/synchronized-reader-and-startup-buffer.md`](active/synchronized-reader-and-startup-buffer.md)
is retained only as broad historical context and is superseded by M009 for the
remaining synchronization work. Neither active plan supersedes completed
authority or turns the failed `v3` profile into a standard production
selection.

Milestones 1 through 8 are complete, with their evidence retained under
[`completed/`](completed/).

## MVP completion boundary

The roadmap is complete only when Milestone 11 validates the complete user journey and the definition of done in `AGENTS.md`. Finishing scaffolding, one EPUB parser, one TTS prototype, or one successful playback demonstration is progress, not completion of VoxLeaf.
