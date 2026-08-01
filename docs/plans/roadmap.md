# VoxLeaf development roadmap

## Status and purpose

VoxLeaf is pre-alpha. Milestones 1 through 10.2, M008.1, and M009.1 are
complete. M010 records the final support/recovery decision. Privacy-safe host
detection, immutable measured matching, bounded preference and compatibility
UI, pre-start enforcement, and identity-safe one-attempt recovery are
implemented. The passing v6 evaluation selects exact Piper/davefx as the
speed-focused CPU fallback. Exact Qwen/Serena remains development-only.
Milestone 6 now integrates both through one service tree and explicit profile
selection. Piper alone uses the frozen locator-safe,
spoken-expansion-aware `narration-piper-v2` preparation limits; its corrective
ordinary-prose, compact-form, zero-sentence-boundary fragment, and content-safe
packaged private-book matrices pass.
Product playback additionally requires the native exact-profile
runtime-configuration gate during availability resolution and immediately
before child start; hardware compatibility alone no longer enables Play.
Qwen's outbound-blocked service lifecycle passes. ADR-0022 retains the
`7,196`-MiB total-VRAM rule while replacing only its native-gated
development-only available-VRAM threshold with `6,508` MiB. The packaged host
now offers and executes Qwen when that reserve is available; its broader
matrix later stops at the depletion synchronization assertion, so it remains
development-only rather than supported. M010's historical v1 matrix makes
Piper/davefx its sole supported profile; completed M010.1 layers the bilingual v2
matrix described below without enabling automatic failover. Runtime/model
distribution and license fulfillment remain M011 work. Replacement
Ubuntu/Windows closeout checks pass and M010 is archived.

M009.1 exact-host use also exposed and corrected one additional reader defect:
passive viewport scrolling must not replace active narration. The
visible-passage target and narration locator are now separate; only explicit
leaf, visible-passage, passage-boundary, and chapter actions trigger
identity-first replacement.

M008.1 is complete. Its frozen authority and deterministic desktop code
schedule one bounded semantic delay between already-buffered generated units.
It changes no normalization, protocol, audio payload, buffer threshold, or
engine. Full portable, authoritative Windows, privacy/repository, bounded
clean-runner stabilization, and replacement Ubuntu/Windows validation pass.

M010.1 is complete. Milestones 1 through 5 freeze and execute the
bilingual authority and admit exact Piper/joe English, Chatterbox
Spanish/English, Qwen/Serena Spanish, and Qwen/Aiden English. Milestone 6 now
integrates those language-bound profiles through one native-owned service
tree: both Piper voices and Chatterbox are supported when their exact
configuration and host requirements pass, while both Qwen voices remain
explicitly gated development-only constrained-buffer profiles. MOSS remains
deferred without rejection. Milestone 7's six packaged portfolio journeys,
final exact-host metrics, privacy, bounded synchronization, and cleanup
validation pass locally. Pull request #159 subsequently passed the required
Ubuntu and Windows checks and merged the closeout.

M010.2 is complete. Its architecture
authority and result-blind comparison were frozen before results, then neither
eligible backend passed every machine and packaged-host gate. ADR-0034 retains
`1.00x`. Milestone 3 implements bounded language/start preferences, preserves
valid saved Spanish/English, defaults safe fallback/reset state to English,
hydrates before use, and resets through identity-first cleanup. ADR-0035
authorizes and ADR-0036
froze a separate fee-free v2 comparison for six exact rates ending at
`0.75x` without rewriting v1. ADR-0037 records that no v2 candidate survived
local-inference contention, removes every experiment, and retains `1.00x`.
ADR-0038 now authorizes a separate boundary-deferred v3 with a 1,000 ms p95
first-activation ceiling, 200 MiB additional-process-RAM ceiling, no TTS/queue
invalidation, and `1.00x` bypass. ADR-0039 and the immutable v3 authority freeze
exactly media and repository WSOLA, selected/pending/active state, a 250 ms p95
recurring handoff, lifecycle, resource, listening, licence/CSP, and strict
lineage rules. ADR-0040 selects repository WSOLA after both candidates passed
the complete v3 matrix; no dependency or CSP expansion remains. Milestone 5
integrates the six exact boundary-deferred rates, separate bounded playback
preference, and effective listening lead without restarting TTS or discarding
queued source PCM.
Milestone 4 implements the fixed app bar, compact publication/narration chrome,
sole reader viewport, contents overlay, and accessible Settings drawer/sheet
without changing reader, preference, compatibility, or narration ownership.
The sequential six-arm packaged matrix, browser/native-startup, portable, and
complete Windows repository checks pass outside the sandbox. Renewed maintainer
listening confirms correct slowdown across every admitted rate, and pull
request #170 passes the required Ubuntu and Windows checks. M011 is now in
progress. Milestone 1 freezes the exact result-blind release authority; its
detailed
[`M011 ExecPlan`](active/M011-package-validate-and-release-mvp.md) scopes the
core distributable candidate to Windows x64 and the measured Piper
Spanish/English CPU family. It now adds supported Chatterbox Spanish/English
as a separately gated optional GPU quality download rather than embedding its
approximately 8.02-GiB developer footprint in the core installer. The plan
separates Piper-core readiness, optional-Chatterbox readiness, and signed
public publication so one failed or externally blocked gate cannot create a
false claim for another. M011 Milestone 4A preserves a fail-closed native
optional lifecycle with acquisition withheld. Milestone 4B now freezes and
implements the split acquisition: six exact model-data files come from the
official revision-pinned `ResembleAI/chatterbox` Hugging Face repository, while
a reproducible reviewed runtime is divided into three bounded GitHub Release
assets. The deterministic controller, measurements, and hostile-input tests
pass; availability remains withheld until an authorized maintainer publishes
those assets and the clean-user online/offline GPU matrix passes.

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
    -> 8.1. Boundary-aware audio transitions
    -> 9. Synchronized reading and narration
    -> 9.1. Reader experience stabilization
    -> 10. Hardware profiles, fallback, and resilience
    -> 10.1. Bilingual narration and candidate screening
    -> 10.2. Reader settings and playback controls
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
adaptive low-buffer wait, `1.0x` playback, and the simultaneous 30-minute ceiling. The
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

## Milestone 8.1: Add boundary-aware audio transitions

**Status:** Complete. The frozen
[`playback-transition-pause-policy-v1.md`](../architecture/playback-transition-pause-policy-v1.md),
[ADR-0021](../architecture/decisions/ADR-0021-boundary-aware-audio-transitions.md),
and deterministic desktop implementation exist. Focused policy, scheduler,
player, coordinator, controls, full desktop tests, and desktop typechecking
pass. Full portable, authoritative Windows, privacy/repository, relative
documentation-link, bounded clean-runner stabilization, and replacement
Ubuntu/Windows validation also pass.
Follow
[`M008-001-boundary-aware-audio-transitions.md`](completed/M008-001-boundary-aware-audio-transitions.md).

### Goal

Prevent independently generated sentences and paragraphs from sounding joined
without changing prepared text, model input, generated waveforms, or the
bounded M008 queue.

### Expected outcome

- The completed prepared segment's closed semantic boundary reduces to one
  bounded numeric delay; a terminal ellipsis has an explicit override.
- Hard/token size splits remain continuous.
- At most one interruptible timer delays an already-buffered successor.
- Real buffering replaces rather than compounds the delay, and final
  completion has no trailing pause.
- Pause freezes the remaining timer; stop, navigation, profile/book
  replacement, failure, and close cancel it before stale audio can start.
- Intentional transition time remains content-free and separate from audible
  playback, adaptive low-buffer waits, and involuntary buffering.

### Dependencies

Completed M005 owns canonical boundary reasons. Completed M008 owns the
buffer/player and retains its zero-default adaptive low-buffer wait. Completed
M009 owns audible start/completion projection. M008.1 changes no package,
process, protocol, persistence, or model boundary.

### Major risks and unknowns

- Excessive values can sound theatrical; later tuning requires a versioned
  decision and listening evidence.
- Timer callbacks must not start stale audio after identity invalidation.
- Transition time must never enter playable-lead or RTF arithmetic.
- Optional human listening may assess rhythm, but deterministic lifecycle and
  privacy correctness cannot depend on a private EPUB.

## Milestone 9: Integrate synchronized reading and narration

**Status:** Complete as of 2026-07-27 and amended by completed M009.1 exact-host
stabilization. All seven original ExecPlan milestones pass. ADR-0017 and the
synchronization authority select segment-level source ranges, CSS Custom
Highlight decoration, focus-safe following, explicit identity-first navigation,
stable-segment previous/next movement, and non-skipping persistence
checkpoints. Chromium and packaged WebView2 prove
the mechanism without publication mutation, focus/selection loss, URL changes,
runtime errors, or external requests. The bounded scheduler/player path now
retains immutable source ranges while units are eligible and publishes exact
start/completion plus 250 ms played-frame observations outside React
snapshots. The reader now consumes exact transitions through one bounded
Custom Highlight projection and follows outside the 24-pixel comfort region
without focus, selection, URL, DOM, or passive-tracker feedback side effects.
The coordinator now invalidates identity before cleanup for explicit targets,
preserves active or paused intent, and routes leaf, chapter, visible-passage,
and stable prepared-segment actions through the reader's canonical focus
policy. M009.1 separates ordinary viewport inspection from narration so it
cannot cancel or restart active work. It retains at most 64 recent structural
ranges and exposes no prose, PCM, or work identity in React state.
The persistence bridge now saves exact audible starts, advances only on
matching completion, flushes bounded interruption/lifecycle checkpoints, and
prevents visual or reflow updates from skipping unheard content. The exact-host
synchronized matrix passes with late programmatic samples suppressed and
genuine user intent preserved. The complete diff passes repository/privacy
review, and pull request #133 passed the required Ubuntu portable and Windows
native foundation jobs. See
[`M009-synchronized-reading-and-narration.md`](completed/M009-synchronized-reading-and-narration.md)
for implementation and closeout evidence.

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

## Milestone 9.1: Stabilize the synchronized reader experience

**Status:** Complete as of 2026-07-28. Follow
[`M009-001-reader-experience-stabilization.md`](completed/M009-001-reader-experience-stabilization.md).
Milestone 1 freezes the result-blind
[`reader-experience-authority-v1`](../architecture/reader-experience-authority-v1.md)
and [ADR-0018](../architecture/decisions/ADR-0018-reader-experience-stabilization.md).
It distinguishes accepted range registration from paint-aware perceivability
and selects one reader scroll owner, compact narration, text-only loaded
duration, and a bounded leaf before production implementation. Milestone 2
repairs the proven same-chapter DOM-materialization gap and passed clean-host
validation. Milestone 3 implements the fixed ready-publication shell, sole
reader scroll root, compact/collapsible narration, and exact
loaded/target/estimate text without a progress bar. Completed M009 remains the
synchronization authority and evidence baseline. Milestone 4
implements one retargeted locator-backed leaf with canonical block-start,
identity-first replacement, and bounded preview/preparing/audible/checkpoint
state; desktop and Chromium leaf evidence passes, and the packaged native
regression smoke remains green. Milestone 5's corrected private-EPUB
interaction and amended exact-host matrix pass. Milestone 6 repository,
privacy, portable, release-packaged, and required Ubuntu/Windows closeout pass;
pull request #142 merged the completed implementation and evidence.

### Goal

Make the implemented constrained narration demo visibly coherent and
reader-first before M010 adds compatibility and recovery state.

### Expected outcome

- A repository-authored failing/perceivability proof reconciles the observed
  missing highlight with the previously passing M009 synthetic evidence.
- The active audible segment remains honestly highlighted at whole-segment
  granularity and follows without moving focus or selection.
- One dedicated reader viewport owns EPUB scrolling while compact book and
  narration controls remain available.
- A bounded application-owned leaf starts narration from a canonical paragraph
  locator and reinforces preview, preparing, audible, and saved-checkpoint
  states without making ordinary paragraph text interactive. Passive viewport
  inspection and eligible pointer hover retarget that leaf as a preview; only
  explicit activation replaces narration.
- The detailed narration panel can collapse without hiding buffering, failure,
  or required actions.
- Preparation shows exact loaded playable duration and target as text without
  a growing bar that resembles book or playback progress.
- Existing M005, M007, M008, and M009 authorities, bounds, privacy, and
  cancellation behavior remain unchanged.

### Dependencies

Completed M004 supplies the visual reader, stable locator, reflow, and one
continuous semantic layout. Completed M008 supplies content-free preparation
state and controls. Completed M009 supplies exact segment transitions, range
mapping, identity-first navigation, following, and non-skipping persistence.
M009.1 is complete, so M010 may add compatibility and recovery UI to the
stabilized application shell.

### Major risks and unknowns

- The private-EPUB observation may depend on structure or styling not covered
  by current synthetic fixtures; no private content may enter committed tests.
- Changing the scroll owner can regress locator sampling, restoration,
  automatic following, or keyboard behavior.
- Per-paragraph controls can create unbounded DOM/tab-order state unless the
  implementation uses one bounded contextual or roving leaf.
- A paragraph marker can imply timing more precise than the exact segment
  authority; the text-range highlight remains authoritative.

### Sequencing decision for the discussed refinements

- **Before M010:** implement only M009.1's visible-highlight reconciliation,
  dedicated reader viewport, bounded paragraph leaf, compact/collapsible
  narration surface, and text-only loaded-duration status. These are blocking
  reader-experience defects or shell decisions that M010 recovery UI would
  otherwise have to rework.
- **During M010:** bind every admitted profile to its complete generation
  configuration or canonical hash. Do not expose a free-form temperature
  control. This keeps a possible future natural/stable choice measurable,
  reproducible, and identity-safe.
- **M010.2 before M011:** implement the separately approved reader-first shell,
  accessible Settings, English fallback, bounded narration preferences, and
  engine-neutral pitch-preserving playback speed only if the separately frozen
  fee-free v2 admits a backend. Keep the completed M009.1
  scroll/leaf/highlight authority and M008.1 wall-clock transition pauses.
- **Still deferred:** a natural-versus-stable generation profile, changed
  quick-start target, rate-scaled transition pauses, clearer reopen/resume
  choices, and approximate book/chapter progress require separate authority.
- **After the MVP:** consider a full native application menu bar, expanded
  table-of-contents shell, voice-cloning controls, advanced pause rules, and
  automatic retry. They are useful refinements but do not block the current
  reader, resilience, or packaging sequence.

## Milestone 10: Add hardware profiles, fallback, and operational resilience

**Status:** Complete. Follow
[`M010-hardware-profiles-fallback-and-operational-resilience.md`](completed/M010-hardware-profiles-fallback-and-operational-resilience.md).
The canonical privacy-safe host compatibility report, profile/evidence shape,
matching/preference rules, fixed resource margins, failure taxonomy, and
identity-first explicit recovery authority are frozen by
[`hardware-profile-recovery-authority-v1.md`](../architecture/hardware-profile-recovery-authority-v1.md)
and ADR-0019. The narrow
[`qwen-development-vram-admission-v1`](../architecture/qwen-development-vram-admission-v1.md)
authority and
[`ADR-0022`](../architecture/decisions/ADR-0022-qwen-development-vram-admission.md)
later supersede only the available-VRAM formula for a native-gated
development-only entry. The native Windows detector gathers only those bounded facts
through reviewed direct APIs and the desktop decodes them through the
canonical contract; non-Windows builds return unavailable. The product now
matches the immutable four-entry executable registry, retains only a bounded
profile-ID preference, rechecks before model-child start, and exposes closed
compatibility states. Milestone 4 adds bounded recovery with identity-first
cleanup, one explicit restart, latest-heard resume, and terminal containment.
Milestone 5 passes every frozen Piper v6 gate and selects exact Piper/davefx
as the supported speed-focused CPU fallback. Milestone 6 adds the exact Piper
adapter, bounded native-rate conversion, profile-aware native start, explicit
settings choice, and the two-profile resilience runner without regressing the
Qwen development demo. Piper-only locator-safe preparation corrects the
reproduced oversized-unit failure without truncation or a protocol change.
The desktop also skips punctuation-only Piper units after a private,
content-safe reproduction proved that the exact phonemizer emits no waveform
for them; no silence is inserted and locator continuation remains intact. The
adaptive scheduler also accepts valid non-empty narration fragments with zero
recognized sentence boundaries, matching the existing M005 non-negative
measurement contract while retaining positive code-point/byte requirements.
The
separate native configuration-admission correction fails closed before child
start when the selected exact runtime is not configured, and configured Piper
passes the corrective packaged arm. Qwen passes offline service validation,
the corrective packaged compatibility boundary, and actual inference through
the later depletion stage; that broader synchronization assertion does not
pass. The final
[`tts-support-matrix-v1`](../architecture/tts-support-matrix-v1.md) and
[`ADR-0023`](../architecture/decisions/ADR-0023-final-m010-support-and-recovery.md)
record Piper as the sole supported CPU fallback, Qwen/Serena as
development-only, the remaining profiles as unsupported, zero automatic
failover, exact admitted margins, and M011 distribution obligations. Local
closeout validation and replacement required Ubuntu/Windows checks pass.

### Goal

Make the integrated reader usable across documented supported hardware and recover gracefully when acceleration or models are unavailable.

### Expected outcome

- VoxLeaf detects relevant OS, CPU, RAM, GPU, VRAM, CUDA, ONNX providers, and supported precision without sending telemetry.
- The UI recommends a measured engine profile while retaining user control and avoiding unsafe memory use.
- CPU-compatible fallback, model-load failure recovery, service restart, cancellation timeout, and degraded buffering behavior are tested.
- The initial recovery path permits one explicit user-triggered restart only
  after identity-first cleanup; automatic segment retry remains unapproved.
- Production VAD/energy monitoring remains outside M010 unless a separate
  authority first justifies its false-positive, latency, memory, dependency,
  licensing, and quality costs.
- Long sessions keep memory, queues, GPU work, logs, and persisted state bounded.
- Diagnostics and benchmark summaries contain no book text, narration, secrets, or unnecessary private paths.

### Dependencies

Milestone 6 defines the evaluation authority and retains the no-standard-profile
decision. Completed M007-M009 provide the constrained integrated
lifecycle, identity-first cancellation, bounded playback, synchronized
navigation, heard-position recovery authority, and observable metrics needed
to test compatibility and recovery. Completed M009.1 supplies the stabilized
reader shell, visible segment projection, and locator-backed paragraph action
that M010 recovery exercises. The Piper fallback completed a result-blind
frozen v6 cycle and passed measured evidence before product admission.

### Major risks and unknowns

- Hardware detection APIs may be incomplete or platform-specific.
- Automatic recommendations can be harmful without conservative memory margins and measured evidence.
- Recovery must not duplicate service processes, leak model memory, replay stale audio, or lose reading progress.
- The accepted buffer policy may require tuning by hardware profile without becoming unbounded or hiding poor sustained RTF.

## Milestone 10.1: Add bilingual narration and screen naturalness candidates

**Status:** Complete as of 2026-07-30. Pull request #159 passed the required
Ubuntu and Windows checks and merged the closeout. Follow
[`M010-001-bilingual-narration-and-candidate-screening.md`](completed/M010-001-bilingual-narration-and-candidate-screening.md).
This bounded pre-M011 follow-up responds to an explicit product need for
English narration and a stronger portfolio demonstration. It does not reopen
M010's completed Spanish Piper support decision.

Milestones 1 and 1A record the explicit language lifecycle, additive bilingual
normalization, exact candidate revisions/artifacts/locks, synthetic corpora,
closed result schemas, quality/resource/privacy gates, and result-ordering
validators in
[`bilingual-narration-authority-v1`](../architecture/bilingual-narration-authority-v1.md),
[`narration-normalization-v2`](../architecture/narration-normalization-v2.md),
[`tts-feasibility-profile-v7`](../architecture/tts-feasibility-profile-v7.md),
[`tts-feasibility-profile-v8`](../architecture/tts-feasibility-profile-v8.md),
[ADR-0024](../architecture/decisions/ADR-0024-freeze-bilingual-v7-authority.md),
and [ADR-0025](../architecture/decisions/ADR-0025-supersede-v7-with-local-qwen-bilingual-v8-authority.md).
CosyVoice is rejected from this v8 cycle before an environment lock because
its reviewed general path did not supply an exact non-personal default voice.
Milestone 2 implements the model-free selection and preparation boundary but
does not itself admit an English product profile. Milestone 3 independently
admits exact Piper 1.4.2 / `en_US-joe-medium` after all machine, performance,
memory, cancellation, quality, privacy, offline, and cleanup gates pass.
Corrective Milestone 5 admits exact Chatterbox for both Spanish
and English after its complete bilingual machine/cancellation matrix and
private quality review pass. It retains Qwen/Serena Spanish and admits
Qwen/Aiden English as independent hardware-dependent constrained-buffer
configurations of the existing Qwen engine. Qwen's approximately 1.44 RTF
on this laptop is capacity evidence, not an automatic blocker or a claim
about stronger compatible GPUs. MOSS remains deferred without rejection.
Milestone 6 implements the exact language/profile registry, adapters, native
configuration and host gates, compatibility selection, recovery mapping, and
sequential exact-host service proof. Protocol v1 and one-child ownership remain
unchanged. Milestone 7 validates six packaged language/profile EPUB journeys.
Piper and Chatterbox sustain one minute without underruns; the development-only
Qwen controls each deplete once and refill safely. All arms prove bounded
ownership, cancellation, synchronization, cleanup, zero generated-audio
persistence, and zero external requests.

### Goal

Add explicit Spanish/English narration through versioned, locator-preserving
preparation; measure an exact Piper English baseline and exact Qwen
Serena/Spanish plus Aiden/English controls; and screen a small candidate set
for more natural speech without weakening privacy, cancellation, bounded
memory, or support-evidence rules.

### Expected outcome

- The user explicitly chooses Spanish or English; VoxLeaf does not infer a
  book's language or silently send text under the wrong engine language.
- Existing `narration-v1` and `narration-piper-v2` behavior remains immutable.
  Any bilingual normalization change uses newly frozen, versioned authority.
- Exact Piper 1.4.2 with one independently reviewed English voice is measured
  as the low-risk bilingual baseline.
- Exact local Qwen 1.7B CustomVoice / Serena / Spanish and Qwen 1.7B
  CustomVoice / native-English Aiden / English are evaluated independently.
  Shared weights establish identity only; results are not shared.
- Chatterbox Multilingual V3 and MOSS-TTS-Nano ONNX were screened
  sequentially. Chatterbox then passed the frozen v12 full bilingual matrix
  and is admitted for both languages; MOSS is deferred without rejection.
  CosyVoice is not executed in v8 because exact intake did not establish a
  non-personal default voice path.
- At most one passing new engine is integrated. A failed screen produces an
  honest no-winner record and does not delay M011 indefinitely.
- Language/profile changes replace work identity before cleanup, never reuse
  stale audio, and retain only bounded non-content preference state.

### Dependencies

Completed M005 owns canonical normalization, semantic segmentation, and stable
locator mapping. Completed M007-M010 own the protocol, service supervision,
bounded player, synchronization, support registry, compatibility gates, and
recovery behavior. M010.1 may extend those boundaries only through frozen
versioned contracts and a new decision record.

### Major risks and unknowns

- Voice/model licenses may permit code use while blocking redistribution of
  exact weights, reference audio, or a default voice.
- Naturalness claims are language- and voice-specific; upstream family
  benchmarks cannot substitute for exact VoxLeaf evidence.
- A multilingual model may fit upstream hardware but fail this Windows host,
  offline operation, startup, sustained RTF, cancellation, memory, or
  long-form correctness gates.
- A one-development-day target is a timebox for bounded screening, not an
  acceptance shortcut or delivery guarantee.

## Milestone 10.2: Add reader settings and pitch-preserving playback controls

**Status:** Complete. ADR-0034 selected no
pitch-preserving backend for v1. ADR-0035 authorizes and ADR-0036 freezes the
reduced-range, fee-free v2 comparison; ADR-0037 also selects no v2 backend
after inference contention. ADR-0038 authorizes a separate boundary-deferred
v3 without rewriting those results; ADR-0039 froze its architecture and
executable authority before candidate work. ADR-0040 selects repository WSOLA
after the complete frozen comparison. Follow
[`M010-002-reader-settings-and-playback-controls.md`](completed/M010-002-reader-settings-and-playback-controls.md)
and the approved
[`reader settings and playback controls`](../product/reader-settings-and-playback-controls.md)
product requirements.

This bounded portfolio-facing follow-up runs before M011. It does not change
the completed M010.1 language/profile support matrix, TTS generation,
normalization, protocol, or runtime/model distribution boundary.

Milestone 1 freezes
[`reader settings and playback authority v1`](../architecture/reader-settings-playback-authority-v1.md)
and
[`ADR-0033`](../architecture/decisions/ADR-0033-freeze-reader-settings-and-pitch-preserving-playback-authority.md).
Milestone 2A separately freezes
[`reader settings and playback authority v2`](../architecture/reader-settings-playback-authority-v2.md)
and
[`ADR-0036`](../architecture/decisions/ADR-0036-freeze-reduced-range-fee-free-playback-authority-v2.md)
before the Milestone 2B comparison.
The current runtime preserves valid saved Spanish/English, defaults safe
fallback/reset state to English, and persists the closed Quick/Prepared start
choice under bilingual authority v2. Milestone 4 implements the fixed compact
app bar, compact publication/narration chrome, sole reader viewport,
collapsible contents overlay, and accessible Settings drawer/sheet while
retaining existing domain ownership. Milestone 5 integrates only the selected
v3 WSOLA backend with six exact values, next-unit activation, content-free
preference ownership, and effective-listening-duration scheduling. Milestone 6
passes its sequential six-arm packaged matrix and repository validation. The
maintainer confirms the complete admitted range slows in the intended direction
and remains usable, and pull request #170 passes both required checks.

### Goal

Make the book the dominant application surface, collect durable/setup-oriented
choices in one accessible Settings experience, default missing/invalid/reset
narration language to English without overwriting valid saved choices, and
admit a bounded fee-free six-value playback backend only if the separate v3
comparison passes; otherwise preserve honest fixed-`1.00x` playback.

### Expected outcome

- One fixed compact app bar exposes a stable styled Open a book action; the
  ready state adds Settings, while empty-state compatibility, Replace/Close,
  native filename placeholders, and manual raster diagnostics stay out of the
  product chrome under ADR-0041.
- Compact metadata and narration controls remain outside the sole publication
  scroll viewport.
- A right-side Settings drawer on wide windows and full-width dialog-like
  sheet on narrow windows owns reader appearance, language/profile, startup
  policy, and compatibility detail.
- English is the fallback only when no valid language preference exists or the
  user explicitly resets Narration settings.
- Piper, Chatterbox, and development-only Qwen remain language- and
  gate-correct; M010.2 does not change support status.
- Quick/Prepared startup and Prepared target use bounded versioned
  content-free preference ownership; volume remains session-only.
- If v3 admits a backend, the compact narration bar exposes the six frozen
  rates and applies a pending choice at the next generated-unit boundary
  without restarting TTS or discarding queued PCM. Otherwise it retains fixed
  `1.00x` with no misleading selector or persisted speed preference.
- Source sample frames remain memory/progress and lead authority.
- Semantic generated-unit pauses remain unchanged wall-clock timers.
- Synthetic raster and raw diagnostics leave the normal product surface and
  remain development/test gated.

### Dependencies

Completed M005 owns canonical narration preparation. Completed M008/M008.1
own bounded source PCM, startup/refill ceilings, and semantic transition
timers. Completed M009/M009.1 own audible source ranges, highlighting, heard
persistence, one reader scroll owner, and paragraph leaves. Completed
M010/M010.1 own compatibility, recovery, bilingual profile identities, support
states, and one-child supervision. M010.2 may compose these boundaries only
through newly frozen authority and regression evidence.

### Major risks and unknowns

- A pitch-preserving time stretcher may distort speech or consume too much CPU
  or memory beside local inference.
- Direct Web Audio playback-rate changes alter pitch and are not an acceptable
  shortcut.
- Mid-unit rate changes can corrupt highlighting or heard checkpoints unless
  progress settles in source frames before the new rate applies.
- Effective listening lead must not increase retained source-frame/byte
  ceilings.
- Moving controls can duplicate domain ownership, trigger model lifecycle
  work when Settings opens, or regress locator preservation and accessibility.
- A valid saved Spanish preference must not be overwritten by the English
  fallback migration.
- Any production dependency must pass exact package/source/transitive licence
  and M011 distribution review. The speed feature may use only platform,
  repository-owned, or permissive fee-free code; it must not require a
  purchase, royalty, subscription, commercial exception, copyleft/source
  availability, or ambiguous licence.

## Milestone 11: Package, validate, and release the MVP

**Status:** In progress. Milestones 1 through 3 and the fail-closed Milestone 4A
foundation completed on 2026-08-01. Milestone 4B's deterministic authority and
implementation are complete, but its external publication and clean-host gates
remain blocked. Milestone 1 froze
[`mvp-release-authority-v1`](../architecture/mvp-release-authority-v1.md) and
accepted
[ADR-0042](../architecture/decisions/ADR-0042-freeze-mvp-release-authority.md)
before dependency or package results. Milestone 2 then closed a 15-entry
private Piper core lock, a separately gated 79-package Chatterbox lock,
repository-owned release audits, bounded dependency-update intake, and an
exact 400-component release inventory. Milestone 3 implements the deterministic
private CPython/Piper core, both frozen voices, complete notices and exact
Piper/espeak source fulfillment, bilingual offline smoke, measurements, and
native fixed-manifest verification. M010.2 is complete. The repository can
build a release executable and the standalone core payload for validation.
Milestone 4A also implements native-owned withheld/download/install/remove
controls and deterministic source/archive checks for optional Chatterbox, but
end-user acquisition remains disabled. Milestone 4B freezes and implements
official-source acquisition for exactly six model-data files from full
Hugging Face revision `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18`, with
per-file size/SHA-256 verification and no model-repository code execution. It
also reproducibly builds and splits the exact reviewed runtime. The three
runtime parts still require authorized publication and clean-host validation;
Hugging Face weights alone are not a complete installation. Installer bundling, enabled
optional acquisition, signing, updater policy, and complete-MVP validation are
not implemented.

The remaining M011 execution order is explicit:

```text
completed 1 -> completed 2 -> completed 3 -> completed 4A
    -> 4B deterministic implementation complete; publication/clean host blocked
    -> 5 Windows package/signing path
    -> 6 clean-host matrix
    -> 7 release decision and closeout
```

### Goal

Produce a documented Windows x64 installation and demonstrate that the
complete MVP meets its functional, privacy, accessibility, dependency,
licence, integrity, reliability, and performance criteria. Keep Piper
Spanish/English in the portfolio-sized core and provide Chatterbox only as an
explicit verified optional GPU quality package.

### Expected outcome

- A normal Windows user can install VoxLeaf without a repository checkout,
  developer shell, manual firewall rule, or separately installed build tools;
  open a safe EPUB; read visually; restore progress; and listen through an
  included local Spanish or English voice.
- The core distributable profile family is Piper davefx/Spanish plus Piper
  joe/English. Chatterbox Spanish/English is offered as an optional download
  only after its exact minimal dependency, advisory, licence, artifact, size,
  hardware, integrity, removal, and clean-host gates independently pass. Qwen
  remains development-only and outside the first distributable product.
- Selecting compatible but absent Chatterbox opens an accessible confirmation
  with measured download, storage, hardware, startup, and licence information.
  Decline/cancel performs no network request or profile change. Verification
  and installation complete before a separate explicit activation action.
- Chatterbox model acquisition requests only six allowlisted data files from
  the official `ResembleAI/chatterbox` repository at one full immutable
  revision. It never resolves `main`, downloads a repository snapshot, executes
  Hub code, or trusts transport metadata instead of the frozen per-file hashes.
  Runtime acquisition is separately closed and verified.
- Production packaging includes the desktop shell, local service, exact
  minimal private embedded Python/Piper runtime, both exact voices,
  notices/provenance, and one native-owned fixed-manifest Chatterbox acquisition
  boundary with no silent runtime download.
- Exact shipped JavaScript, Rust, Python, native, model, and voice components
  are inventoried and audited. Unused release packages are removed, known
  high/critical reachable vulnerabilities block release, and audit blind
  spots are recorded instead of being reported as clean.
- Piper/phonemizer GPL obligations, applicable source mechanics, voice
  provenance/model cards, CC0 terms, the root MIT licence, and other included
  notices are fulfilled before distribution.
- Unit, integration, hostile-EPUB, end-to-end, accessibility, security,
  dependency, build, packaging, and hardware-specific performance checks are
  documented and pass at the applicable levels.
- A sustained reading test covers playback, buffering, page and chapter transitions, pause, seek, resume, cancellation, service failure, and restoration.
- Privacy review confirms that normal reading requires no remote service and persists no generated narration.
- Install, repair/reinstall, manual version replacement, uninstall, and
  application-owned cleanup pass on a clean normal-user Windows host without
  discovering or deleting user books.
- A compatible clean GPU host proves Chatterbox absent/declined, bounded
  multi-file download, revision/file/hash/size failure, cancellation, verified install, explicit
  activation, offline Spanish/English narration, restart, removal, and Piper
  operation after removal. Core and optional results are reported separately.
- Supported, development-only, excluded, and unsupported profiles/hardware,
  known limitations, benchmark results, setup, troubleshooting, recovery,
  checksums, and audit limitations are documented honestly.
- A portfolio-ready local MVP may close without a certificate after the
  preceding gates pass. Offering a general public installer additionally
  requires protected external signing credentials, signature verification,
  checksums, and documented SmartScreen/antivirus observation.

### Dependencies

All earlier milestones. The detailed implementation authority is
[`M011-package-validate-and-release-mvp.md`](active/M011-package-validate-and-release-mvp.md),
and the proportional security boundary is
[`release-security-and-distribution.md`](../development/release-security-and-distribution.md).
The frozen result-blind package, threat, optional-profile, cleanup, licence,
integrity, and claim authority is
[`mvp-release-authority-v1`](../architecture/mvp-release-authority-v1.md).
Milestone 4B accepted additive authority and ADR-0043 before implementation;
they supersede only the historical single-archive acquisition shape.

### Major risks and unknowns

- Installer size, code signing, antivirus behavior, WebView and native
  dependencies, Python embedding, model/voice acquisition, and GPU runtime
  compatibility.
- Candidate environments currently contain known advisories and packages not
  used by their exact adapters. Copying a benchmark environment into a release
  would enlarge both vulnerability and licence surface.
- The deterministic Chatterbox v2 result measures 5,022,941,463 runtime-
  download bytes, 5,019,513,881 runtime-installed bytes, 3,208,951,924 model-
  download bytes, and a calculated 13,254,834,850-byte staging peak. These are
  local reproducible-package facts, not clean-host acquisition or release-
  availability proof.
- Direct official Hugging Face acquisition removes the need for VoxLeaf to
  republish model weights. The reviewed runtime now has an immutable measured
  three-part identity, but an authorized maintainer must publish those exact
  parts before clean-host acquisition can run; until then Chatterbox stays
  withheld.
- Hugging Face transport may use redirects, cache metadata, and content-addressed
  storage. The implementation must constrain that external interaction while
  treating full revision, filename, size, and repository SHA-256 as authority;
  an unreviewed mirror or mutable fallback is not acceptable.
- The current service child has application-level containment but ordinary
  user filesystem/network authority; it must not be advertised as sandboxed.
- Piper's GPL/phonemizer and voice-provenance obligations may block or narrow
  the frozen bundled core unless corresponding-source, notice, and exact
  provenance mechanics are fulfilled. A topology change requires a new ADR.
- Hardware-specific benchmarks may expose an unsupported default model or buffer policy.
- Accessibility and long-session failures are expensive to fix if postponed until final packaging.
- Portfolio or release claims must reflect validated behavior rather than the intended architecture.
- Automatic updates, AppContainer, external penetration testing, formal
  reproducible-build guarantees, cross-platform packaging, and bundling every
  engine are deliberately deferred unless new evidence makes one essential to
  the first MVP.

## Post-MVP local TTS candidate backlog

**Status:** Mostly deferred and unscheduled. M010.1 promotes the explicit
English baseline, exact local Qwen Serena/Spanish and Aiden/English controls,
plus bounded Chatterbox Multilingual V3 and MOSS-TTS-Nano ONNX screens into
pre-M011 work. Its preserved v7/v8 intake rejects CosyVoice before execution;
any future reconsideration requires new authority. All other candidates remain
post-MVP and require separate newly frozen authority.

Retain Piper/davefx and Piper/joe as the language-matched CPU profiles.
M010.1 now implements Chatterbox Spanish/English as a supported exact GPU
profile and Qwen/Serena Spanish plus Qwen/Aiden English as optional
GPU-dependent development profiles. MOSS returns to targeted future
investigation unless a new authority schedules it. After release, screen the
remaining candidates in this order:

1. Pocket TTS Spanish as a balanced streaming CPU challenger, conditional on
   exact model/voice license and redistribution review.
2. Chatterbox Latin American Spanish as a separate regional quality candidate,
   conditional on a redistributable preset voice and measured hardware fit.
3. Kokoro as a separate English quality/efficiency candidate only after its
   earlier immutable-bundle and bundled-phonemizer license blockers are
   resolved.
4. Additional Piper Spanish or English voices as independently licensed and
   measured voice profiles; the passing davefx result cannot be inherited.

Supertonic remains rejected by existing VoxLeaf evidence. MeloTTS and
KittenTTS remain unprioritized, and Sherpa-ONNX is only a possible runtime
study rather than a model candidate. Follow the complete
[post-MVP TTS candidate backlog](../product/post-mvp-tts-candidate-backlog.md)
for intake boundaries, sources, and the future engine-specific text-adaptation
decision gate. Canonical locator-preserving normalization remains shared; do
not add a common adapter-preprocessor abstraction until multiple admitted
engines demonstrate distinct requirements.

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
   frontier buffering, and zero default adaptive low-buffer wait are recorded,
   and the
   required Ubuntu and Windows pull-request checks passed.
   Completed M008.1 separately records and validates the semantic
   generated-unit transition policy.
7. **Interaction gate:** satisfied by completed M009 and M009.1 through the
   frozen 500 ms
   passive settlement, identity-first chapter/visible-passage/stable-boundary
   path, paused-intent preservation, accessible controls, and exact
   segment-boundary non-skipping persistence plus exact-host synchronized
   highlight/follow/navigation evidence plus passing repository, privacy, and
   required pull-request validation, plus the fixed reader viewport, compact
   narration surface, bounded paragraph leaf, and passive-scroll isolation.
8. **Reader/settings/playback-control gate:** M010.2 Milestone 1 freezes the
   new shell, Settings, English fallback, preference ownership, original
   pitch-preserving rate set, source/effective-duration arithmetic, and v1
   backend comparison before results. Milestone 2 selects no backend and
   retains M008's accepted `1.0x` policy. ADR-0035 authorizes a distinct v2 for
   six exact rates ending at `0.75x`, fee-free permissive candidates, and a
   narrowly bounded media CSP review. Milestone 2A froze that authority in
   ADR-0036 before Milestone 2B measured candidates. ADR-0037 selects none
   after inference contention and closes v2. ADR-0038 authorizes a new
   boundary-deferred v3 with 1,000 ms first-activation and 200 MiB additional
   RAM limits. Milestone 2C froze its exact architecture/executable authority
   and 250 ms recurring handoff before Milestone 2D measured candidates.
   ADR-0040 selects repository WSOLA after every v3 gate passed. Milestone 5
   integrates that exact backend, and Milestone 6 closes automated, human,
   privacy, repository, and pull-request validation.
9. **Release gate:** define supported hardware and wall-clock startup
   expectations from measured results before release.

Durable decisions belong in architecture decision records. Temporary implementation detail belongs in the active ExecPlan. Benchmark results and discovered constraints should update later milestones rather than forcing the project to follow an obsolete roadmap.

## Relationship to existing plans

[`completed/M004-reflowable-visual-reader-and-position-restoration.md`](completed/M004-reflowable-visual-reader-and-position-restoration.md), [`completed/M005-narration-text-preparation.md`](completed/M005-narration-text-preparation.md), [`completed/M006-local-tts-feasibility-and-engine-profiles.md`](completed/M006-local-tts-feasibility-and-engine-profiles.md), [`completed/M006-001-local-tts-profile-blocker-resolution.md`](completed/M006-001-local-tts-profile-blocker-resolution.md), [`completed/M006-002-qwen-short-segment-batch-feasibility.md`](completed/M006-002-qwen-short-segment-batch-feasibility.md), [`completed/M007-local-tts-service-and-process-protocol.md`](completed/M007-local-tts-service-and-process-protocol.md), and [`completed/M008-bounded-adaptive-prebuffering.md`](completed/M008-bounded-adaptive-prebuffering.md) record the implementation authority and validation evidence for Milestones 4 through 8. Milestone 6 supplies development evidence and a no-viable-profile decision; Milestone 6.1 retains the standard blocker; Milestone 6.2 records the rejected CPU/dual-worker alternatives plus ADR-0015's exact one-GPU constrained-demo exception; M007 implements that constrained service boundary; and M008 implements the bounded exact-development caller/player path. None selects production TTS.

[`completed/M007-local-tts-service-and-process-protocol.md`](completed/M007-local-tts-service-and-process-protocol.md)
records the completed constrained local service, protocol, native supervision,
exact Qwen/Serena adapter, complete-unit delivery, and cancellation
containment. It does not implement playback, promote the candidate to a
standard profile, or approve model/runtime distribution.

[`completed/M008-bounded-adaptive-prebuffering.md`](completed/M008-bounded-adaptive-prebuffering.md) records the exact authority, scheduler, payload-owning FIFO, Web Audio player, estimates/wait decisions, pause continuation, controls, exact-development coordinator, measured packaged playback, final demo policy, and repository/privacy/CI validation. The standard blocker remains.

[`completed/M009-synchronized-reading-and-narration.md`](completed/M009-synchronized-reading-and-narration.md)
records the completed segment-level audible progress, highlighting,
focus-safe following, synchronized navigation, heard-position persistence,
exact-host validation, and repository/CI closeout.

[`completed/M009-001-reader-experience-stabilization.md`](completed/M009-001-reader-experience-stabilization.md)
records the completed highlight repair, dedicated reader scroll owner,
compact/collapsible narration surface, truthful loaded-duration presentation,
locator-backed paragraph leaf, passive-scroll isolation, exact-host evidence,
and repository/CI closeout. It does not reopen M009 timing authority or change
M005 segmentation, M007 protocol, M008 buffer policy, or the TTS profile.

[`completed/M008-001-boundary-aware-audio-transitions.md`](completed/M008-001-boundary-aware-audio-transitions.md)
records the completed engine-neutral boundary transition policy,
deterministic timer ownership, clean-runner stabilization, and passing
replacement validation.

[`completed/M010-hardware-profiles-fallback-and-operational-resilience.md`](completed/M010-hardware-profiles-fallback-and-operational-resilience.md)
records privacy-safe host detection, evidence-backed profile matching, exact
Piper fallback admission and integration, identity-safe recovery, final
support decisions, and passing replacement closeout checks.

[`completed/M010-001-bilingual-narration-and-candidate-screening.md`](completed/M010-001-bilingual-narration-and-candidate-screening.md)
is the completed M010.1 implementation authority. Milestones 1 through 5 freeze and
execute the bilingual evidence path. Milestone 6 implements exact Piper
Spanish/English, Chatterbox Spanish/English, and development-only Qwen
Serena/Spanish plus Aiden/English bindings with one service tree and unchanged
protocol v1. Milestone 7's local packaged portfolio journeys, final
measurements, and privacy/repository validation pass. Pull request #159 passed
the required Ubuntu/Windows checks and merged the closeout.

[`completed/M010-002-reader-settings-and-playback-controls.md`](completed/M010-002-reader-settings-and-playback-controls.md)
records the completed pre-M011 reader-first shell, accessible Settings, English
fallback, bounded preference, pitch-preserving playback, timing semantics,
portfolio validation, maintainer all-rate confirmation, and passing required
checks.

[`active/synchronized-reader-and-startup-buffer.md`](active/synchronized-reader-and-startup-buffer.md)
is retained only as broad historical context and is superseded by completed
M009/M009.1 for synchronization and reader stabilization. It does not
supersede completed authority or turn the failed `v3` profile into a standard
production selection.

Milestones 1 through 10.2, M008.1, and M009.1 are complete, with their evidence
retained under [`completed/`](completed/). ADR-0037 closes v2 with no backend;
ADR-0039 freezes the separate boundary-deferred v3, and ADR-0040 selects
repository WSOLA. The bounded preference runtime, reader-first Settings shell,
and non-default boundary-deferred playback integration are implemented. The
maintainer all-rate journey and required PR checks pass; M011 Milestones 1-3
and the fail-closed Milestones 4A-4B deterministic foundation are complete.
Milestone 4B freezes and implements official revision-pinned Hugging Face model
data plus separately verified split-runtime delivery, but external publication
and optional clean-host evidence remain blocked.

## MVP completion boundary

The roadmap is complete only when Milestone 11 validates the complete user journey and the definition of done in `AGENTS.md`. Finishing scaffolding, one EPUB parser, one TTS prototype, or one successful playback demonstration is progress, not completion of VoxLeaf.
