# Architecture overview

## Status

Mixed implementation status. Roadmap Milestones 1 through 10, M008.1, and
M009.1 are complete. The secure EPUB boundary, visual reader, bounded restoration,
locator-linked narration preparation, M007 service, exact-development M008
coordinator/player path, M009 segment-level synchronization, and M009.1 reader
stabilization are implemented and validated within their documented scopes.
M009.1 implements the
[`reader-experience-authority-v1`](reader-experience-authority-v1.md): stronger
paint-aware evidence, the same-spine materialization repair, one dedicated
reader scroll owner, a fixed compact shell, collapsible narration detail,
exact loaded/target/estimate text without a progress bar, one retargeted
contextual paragraph leaf, and passive-scroll isolation. Its private-EPUB,
exact-host, repository/privacy, portable, packaged, and required Ubuntu/Windows
validation pass; pull request #142 merged the closeout.

M008.1 is complete. It adds boundary-aware scheduled separation between
already-buffered generated units without changing M008 thresholds or the TTS
service/protocol. Its bounded synchronization-probe stabilization and
replacement Ubuntu/Windows checks pass.

M010 is complete. Milestones 1-4 implement the
privacy-safe native host report, immutable measured registry, fail-closed
matching and preference, compatibility UI, pre-start checks, and identity-safe
explicit recovery. Milestone 5 passes every frozen Piper v6 gate and selects
exact Piper/davefx as the supported speed-focused CPU fallback. Milestone 6
adds Piper as the fourth executable profile, its exact isolated service
adapter, profile-aware native supervision, explicit settings selection, the
admitted-profile resilience runner, Piper-only spoken-expansion-aware
narration, nonspoken-unit omission, and scheduler acceptance of valid
non-empty fragments with zero recognized sentence boundaries while retaining
Qwen/Serena as development-only. The packaged Piper adaptive and content-safe
private-book arms pass on the exact host. Qwen passes its outbound-blocked
service lifecycle. ADR-0022 retains `7,196` MiB total VRAM while using its
measured `5,996`-MiB peak plus a frozen `512`-MiB reserve for currently
available VRAM only when native-gated and development-only. The packaged host
now offers and executes Qwen; its broader matrix later stops at the depletion
synchronization assertion. Raw host reports remain transient, non-Windows
detection remains unavailable, and
[`tts-support-matrix-v1`](tts-support-matrix-v1.md) now makes Piper the sole
supported and automatically recommendable profile when compatible and
configured while retaining explicit selection and zero automatic failover.
Replacement Ubuntu/Windows checks pass. M011 still owns production
distribution and Piper's GPL/CC0 packaging obligations.

M010.1 Milestone 1 froze historical result-blind v7 explicit
Spanish/English product, versioned locator-safe normalization, exact
candidate, synthetic corpus, schema, and evaluation authority. Before any v7
result, Milestone 1A preserved v7 and froze layered v8 authority for exact
local Qwen/Serena Spanish and Qwen/Aiden English controls. V8 reuses the same
corpora, gates, stop conditions, and existing Qwen lock and excludes remote
cloud inference, voice cloning, voice design, and a second English Qwen voice.
Milestone 2 implements the model-free product boundary: a closed bilingual
preparation profile, bounded language preference, accessible explicit
selection, exact profile/language admission, and identity-first cancellation
and cleanup. Milestone 3 independently admits exact Piper 1.4.2 /
`en_US-joe-medium` after its frozen v8 CPU, cancellation, quality, privacy,
offline, and cleanup gates all pass. This result is not runtime integration:
Spanish Piper remains the only supported playable profile and the existing
M010 runtime matrix remains authoritative until M010.1 Milestone 6 adds and
proves new registry/service paths. Corrective Milestone 5 now admits exact
Chatterbox for both Spanish and English integration, retains Qwen/Serena
Spanish, and admits Qwen/Aiden as the English configuration of the existing
Qwen engine. Chatterbox passed the complete bilingual matrix at about
0.52-0.54 total sustained RTF but retains a greater-than-30-second cold-load
and 4.88-GiB process-RAM limitation. Both Qwen profiles retain their
approximately 1.44 RTF hardware-dependent constrained-buffer interpretation.
MOSS remains deferred without rejection. These admissions authorize
Milestone 6 work but change no runtime component or process edge yet.

M009.1 exact-host use additionally exposed that the original automatic passive-
scroll seek conflicted with reader inspection. The implemented correction keeps
the visible-passage target separate from the active narration locator: passive
scrolling preserves generation, playback, highlight, and play intent while the
single contextual leaf defaults to the inspected visual-line paragraph.
Pointer hover temporarily projects it beside the exact eligible block. Both
paths are preview-only; explicit leaf, visible-passage, passage-boundary, and
chapter actions retain identity-first replacement. The corrected private-EPUB
interaction and amended exact-host matrix pass.

M007 is complete. Its six milestones implement the accepted protocol v1,
closed generated contracts, bounded model-free Python service, native
persistent-child supervision, typed desktop client, and exact one-GPU
Qwen/Serena adapter. Frozen exact-host evidence proves complete-unit delivery,
identity-first cancellation, bounded native ownership, clean reload, and zero
external connections without authorizing a standard production profile.

M008 is also complete. Its frozen
[`adaptive-buffer-authority-v1`](adaptive-buffer-authority-v1.md) uses a
10-second low-water warning, 15-second quick start, one-minute refill,
explicit 1-, 2-, 5-, or 10-minute prepared-playback targets, and exact
43,200,000-frame/172,800,000-byte/256-unit simultaneous maxima. The 30-minute
value is a capacity ceiling, not a startup wait, real-time claim, or
uninterrupted-playback guarantee. The exact-development product coordinator
starts from the active narration locator, prepares a bounded batch, dispatches one
M007 synthesis at a time, transfers each complete unit into the sole-owner
FIFO, and plays it through Web Audio. Quick/prepared controls expose only
content-free state. The final exact-host run measured 41.312 seconds to audible
quick playback, 19.49 buffering seconds per playback minute, 24 ms
cancellation, and zero external requests. M009 Milestone 2 now retains
immutable source ranges beside eligible FIFO units and publishes exact
start/completion plus bounded played-frame observations through a content-free
coordinator subscription. M009 Milestone 3 connects that subscription to one
reader-owned semantic source-range projection. It registers the production
Custom Highlight, follows only outside the frozen comfort region, suspends
passive visual sampling across incremental and chapter rendering, preserves
focus and selection, and clears on stop/failure/cleanup. M009 Milestone 4
invalidates work identity before playback/preparation/queue/synthesis cleanup
for explicit navigation, preserves active versus paused intent, and routes
chapter, leaf, visible-passage, and stable prepared-boundary actions through
canonical reader placement. M009.1 exact-host validation keeps passive
viewport inspection outside that replacement path. At most 64 recent structural
ranges are retained outside React state; no narration text, PCM, or work
identity enters the snapshot. Milestone 5 connects exact audible starts and
matching completions to the existing bounded position repository, suppresses
visual saves while narration owns position, flushes interruption and lifecycle
checkpoints, and prevents reflow from regressing the last heard locator.
Production distribution and cross-platform/general-population support remain
unimplemented; the implemented matcher currently makes exact evidence-backed
Windows host decisions only.

M008.1 overlays one engine-neutral playback transition on that unchanged
buffer authority. The coordinator reduces the completed prepared segment's
semantic boundary and terminal-ellipsis suffix to one bounded numeric delay;
the scheduler retains that number with the matching audio unit, and the player
schedules at most one interruptible timer before an already-buffered
successor. Hard/token splits remain gapless. Real buffering replaces the
intended pause, final completion has no delay, and no silent PCM, narration
text, or new protocol field is created. Pause freezes the remainder, while
stop, navigation, profile/book replacement, failure, and close cancel it
before stale work can start. Audible range projection advances only when the
next audio unit actually starts.

M009 Milestone 1 implements the closed desktop-local transition table and
noncollapsed semantic range helper documented by the frozen
[`synchronization-authority-v1`](synchronization-authority-v1.md) and
[ADR-0017](decisions/ADR-0017-segment-level-reader-narration-synchronization.md).
The production Chromium and packaged WebView2 proofs select CSS Custom
Highlight decoration, a 24-pixel comfort region, focus-preserving instant
following, 250 ms maximum observation cadence, and non-skipping segment
checkpoints. M009.1 amends the interaction row after exact-host use exposed
unexpected passive-scroll restarts: viewport inspection now preserves active
narration, while explicit targets retain the original invalidation order.
Milestones 2 through 5 connect the coordinator, scheduler, player, reader
projection, user-navigation, and bounded persistence paths.

[`system-diagram.md`](system-diagram.md) is the canonical visual map and status legend. This overview owns the accompanying architectural rationale, invariants, and detailed implemented-boundary notes.

## Context

VoxLeaf must read EPUB files and synthesize speech locally while beginning playback before an entire chapter is generated. The application therefore needs explicit boundaries between document processing, scheduling, inference, buffering, and playback.

## Component boundaries

```text
Desktop application
|-- Capability-free local file selection/read/open [implemented]
|-- Bounded static-raster preflight/source lifecycle [implemented]
|-- Cancellable publication-session lifecycle [implemented]
|-- Accessible visual reader, navigation, reflow, and restoration [implemented]
|-- Versioned bounded Web Storage repository [implemented]
|-- Model-free binary TTS transport probe [M007 Milestone 1; implemented]
|-- Native persistent-child TTS supervisor [M007 Milestones 3-6; implemented]
|-- Typed TTS process client and one-unit memory sink
|   [M007 Milestone 3; consumed by exact-demo coordinator]
|-- Adaptive buffer/UX authority [M008 Milestone 1; frozen]
|-- Adaptive scheduler, payload FIFO, and low-level Web Audio player
|   [M008 Milestones 2-3; exact-demo path connected]
|-- Boundary-aware buffered-unit transition policy and timer
|   [M008.1 complete; replacement Ubuntu/Windows CI passed]
|-- Content-free preparation estimates, optional wait decisions, and controls
|   [M008 Milestone 4; mounted only for exact native configuration]
|-- Product narration coordinator [M008 Milestone 5; exact demo implemented]
|-- Reader/narration projection, following, navigation, and heard persistence
|   [M009 Milestones 1-7 complete and exact-host validated]
|-- Reader experience stabilization [M009.1 complete and validated]
|-- Privacy-safe host detector and typed report boundary
|   [M010 Milestones 1-2 implemented; Windows direct APIs, no support claim]
|-- Measured profile registry, matching, preference, UI, and pre-start check
|   [M010 Milestones 3 and 6; Piper supported, Qwen development-only]
|-- Identity-safe recovery controller
|   [M010 Milestone 4 complete; one explicit verified-cleanup restart]
|-- Piper/davefx CPU-fallback runtime
|   [M010 complete; integrated and exact-host Piper arm validated]
`-- Explicit bilingual narration, local Qwen controls, and candidate screen
    [M010.1 Milestones 2-4; preparation/selection implemented,
     Piper English admitted, Chatterbox advanced, Qwen retained]

EPUB package
|-- Archive/package/navigation validation [implemented]
|-- Immutable safe semantic projection [implemented]
|-- Lazy bounded raster access [implemented]
|-- Deterministic locator creation/resolution [implemented]
|-- Exhaustive narration source projection [implemented: Milestone 5 Task 2.1]
|-- Code-point narration source tokens [implemented: Milestone 5 Task 2.2]
|-- Bounded source windows, continuation, cancellation, and close
|   [implemented: Milestone 5 Task 2.3]
|-- Whitespace, punctuation, symbol, and Spanish lexical/numeric normalization
|   [implemented: Milestone 5 Tasks 3.1-3.4]
|-- Sentence, dialogue-turn, clause, and protected-token boundary scanning
|   [implemented: Milestone 5 Task 4.1]
|-- Profile-bounded block-local semantic-unit packing
|   [implemented: Milestone 5 Task 4.2]
|-- Oversized-token, retention, work, and cancellation hardening
|   [implemented: Milestone 5 Task 4.3]
|-- Canonical locator-linked prepared segments
|   [implemented: Milestone 5 Task 4.4]
|-- Public bounded preparation batches and closed outcomes
|   [implemented: Milestone 5 Task 5.1]
|-- Public synthetic EPUB-to-segment integration matrix
|   [validated: Milestone 5 Task 5.2]
`-- Deterministic narration resource proof
    [validated: Milestone 5 Task 5.3]

Local TTS service
|-- Canonical protocol control contracts and offline validators
|   [M007 Milestone 2; implemented across TypeScript, Python, and Rust tests]
|-- Bounded model-free Python service and deterministic fake engine
|   [M007 Milestone 2; implemented, no model or device]
|-- Rust-owned model-free standard-stream child and binary WebView probe
|   [M007 Milestone 1; implemented and packaged-validated]
|-- Native supervisor, typed client, process-tree containment, and one-unit sink
|   [M007 Milestone 3; implemented and packaged-validated with a Rust fake child]
|-- Exact Qwen/Serena one-GPU adapter and native-only activation
|   [M007 Milestones 4-6; exact-host handoff and closeout validated]
|-- Exact Piper/davefx CPU adapter and native-only activation
|   [M010 Milestone 6; executable integration and packaged arm validated]
|-- Candidate-neutral feasibility harness and no-profile decision
|   [implemented development evidence; not production runtime]
|-- Shared-model v4 and independent dual-worker v5 benchmark
|   [completed development evidence; both scheduling alternatives rejected]
|-- One-GPU constrained engine, service, process protocol, inference,
|   cancellation, and complete-unit framing
|   [M007 Milestones 1-6 implemented, measured, and validated]
`-- Adaptive demo scheduler, bounded playback, product coordinator, and controls
    [M008 Milestones 1-5 implemented for the exact development host]
```

## Approved desktop reader and candidate process model

[ADR-0008](decisions/ADR-0008-visual-reader-architecture.md) accepts a direct application-DOM reader built from the closed `@voxleaf/epub` semantic model. The implemented initial mode is continuous vertical scrolling over one active spine document. The desktop coordinator owns the active document/locator, explicit table-of-contents, internal-link and previous/next navigation, the closed current display preferences and pre-change preference-reflow intents, package-normalized passive visible-location updates from the application reading line, bounded capture/restore transactions across viewport and preference reflow, saved-position restoration before ready settlement, and content-free save intents routed to the application-owned persistence coordinator. Leaf presentation components do not own publication lifecycle or storage. Publisher HTML/CSS/scripts/URLs do not cross into the renderer, and no iframe or browser route/history integration is part of the initial reader.

The visual position is a normalized `ReadingLocatorV1` sampled at an application-owned reading line. A browser caret/range supplies the Unicode-code-point offset when safe, with deterministic block-start fallback. Explicit navigation may move focus to a destination heading/reader region, while passive scrolling, reflow, and initial restoration do not steal focus.

File ingress is resolved by ADR-0009, ADR-0010 resolves the bounded static-raster boundary, and ADR-0011 resolves the bounded Web Storage, save-lifecycle, and restore policy now implemented behind the asynchronous desktop repository plus application-owned save and restore coordinators. Playwright Chromium supplies deterministic layout evidence while native WebView2 remains a separate Windows matrix. The desktop publication lifecycle, semantic text/image renderer, navigation, closed display preferences, large-chapter scheduler, semantic DOM range mapper, active visual-locator tracker, reflow restorer, versioned reader-state repository, bounded save scheduler, and exact/nearest-valid open restoration are implemented.

The visual tracker measures registered application elements at a fixed reading line, maps safe browser caret geometry through the semantic range mapper, and normalizes candidates through `OpenedPublication.resolveLocator`. Task 4.3 adds a publication-scoped reflow transaction: it captures and re-normalizes the current locator, suspends passive sampling, coalesces superseding preference/viewport changes, waits for two stable animation frames without a fixed delay, and aligns the exact range or block-start fallback to the 24-pixel reading line. Missing DOM targets stop after twelve frames; explicit navigation, root replacement, and close cancel stale work. A resize notification received while a transaction is active does not replace that transaction because each frame already remeasures current viewport geometry; this preserves the original preference/restoration settlement reason under WebView2. Successful restoration seeds the tracker and resumes without an immediate line-start sample that could replace the preserved code-point merely because wrapping changed. The transaction never changes focus, storage, URLs/history, or publication content. Task 4.5 observes only its content-free settled result: passive changes use a trailing 500 ms save, explicit navigation and settled preference reflow use an immediate coalesced save, and replacement/close/hidden/`pagehide` flush the latest already validated locator. Task 4.6 reads global preferences once per application owner and the position for each ready exact-byte identity, delegates exact or nearest-valid recovery to `OpenedPublication.resolveLocator`, activates the resolved spine document, and holds the restore state busy until the destination range is materialized and aligned. Missing, malformed, unsupported, oversized, unavailable, wrong-identity, or unresolved state starts at the first canonical locator with fixed content-free status; recovered state is rewritten only after visual settlement. Startup restoration does not move focus. This paragraph describes the completed M004 reader boundary; M009 Milestones 1-6 now layer segment highlighting, focus-safe following, synchronized user navigation, heard-position persistence, and exact-host proof over it without changing that reader model.

The ready-publication application now uses one fixed-height shell. Compact
application, publication, and narration chrome remains stable while exactly
one dedicated EPUB viewport owns reading scroll. Normal no-book, loading,
empty, and error states retain responsive page behavior. Narration detail
defaults closed, but playback actions, phase, exact loaded duration,
low-water/buffering, failure, and recovery state remain on the compact surface.
Exact loaded/target/estimate text replaces the preparation `<progress>`
element. Locator sampling, reflow/restoration, segment following, and packaged
proof geometry all use the same reader root. M009.1 Milestone 2's
same-chapter materialization repair retains the exact segment text range as
audible authority, one Custom Highlight, focus-safe following, and existing
lifecycle cleanup. Milestone 4 adds one retargeted application-owned contextual
leaf anchored through existing structural registration. It canonicalizes the
eligible block start, replaces obsolete narration identity before settled
placement, and projects bounded preview, preparing, audible, and checkpoint
state without adding publication buttons, text interactivity, timing
authority, or persistence. The one projected leaf follows the active visual
block by default and temporarily follows the exact eligible pointer-hovered
block. Retained preparing, audible, or checkpoint styling applies only when
that state matches the projected block, so passive inspection exposes an
actionable preview while narration continues unchanged. Completed focus,
selection, cancellation, restoration, persistence, memory, and privacy
invariants remain binding.

The desktop application and TTS inference should run in separate local processes.

Reasons:

- Python has the strongest ecosystem for candidate models.
- A process boundary isolates model failures and GPU memory.
- The desktop UI should remain responsive during inference.
- The service can expose explicit cancellation and health state.

M007 Milestone 1 implemented the result-blind native prototype and selects a
Rust-owned child process over redirected standard input and output. A local
socket and loopback WebSocket were evaluated and rejected
for this boundary because they add listener exposure and endpoint/authentication
ownership without improving the one-child topology. The frozen framing,
allocation bounds, backpressure, local exposure, supervision, and crash
behavior are defined by
[`tts-service-protocol-v1.md`](tts-service-protocol-v1.md) and accepted
[ADR-0016](decisions/ADR-0016-rust-owned-stdio-tts-protocol.md). The packaged
WebView binary-delivery smoke passes.

M007 Milestone 2 implements the corresponding closed control envelope and
fixtures under `@voxleaf/shared`. The generator emits the standalone
TypeScript predicate and an offline Python schema registry from the same
canonical schemas, while Rust consumes the same fixtures in test-only
conformance checks. The Python service validates every frame and message
before state changes, accepts one synthesis and no queued work, emits metadata
before one exact raw PCM record, suppresses late output after identity
invalidation, and returns only fixed content-free failures. Its fake engine
proves the lifecycle without importing or loading Qwen, Torch, CUDA, a model,
or an audio device. This is protocol/service evidence, not native supervision
or real inference.

M007 Milestone 4 adds a common internal engine boundary plus the exact
development-only Qwen/Serena adapter without importing benchmark command or
result behavior. Rust activates it only when the three frozen native-only
configuration keys resolve to the reviewed isolated interpreter and local
artifact root. The candidate lock remains byte-identical; Qwen, Torch,
Torchaudio, and NumPy remain outside the base service dependency graph. The
adapter verifies exact runtime ownership, revision receipts, artifact hashes
and sizes, CUDA bfloat16 support, the frozen load and benchmark-generation
parameters, and the complete waveform before publication. The product call
adds one narrower safety constraint: its 250-codec-token ceiling matches
protocol v1's existing 480,000-sample/20-second unit maximum without rewriting
the historical benchmark authority. The first reviewed exact-host command
passes valid delivery, busy rejection, identity-first process-tree
termination with zero returned stale audio, explicit reload, another valid
delivery, and shutdown. This is not product playback or general hardware
evidence.

M007 Milestone 5 freezes and executes a content-safe nine-case matrix through
that same release supervisor and adapter. Cold neutral and warm Spanish
generation, blocked-consumer backpressure, invalidation before dispatch and
after completion, accepted and mid-generation cancellation, child crash, and
application exit all pass on the exact host without retry. Native handoff p95
is about 0.234 ms, termination p95 about 5.70 ms, and restart plus prepare p95
about 16.61 seconds. Peak descendants use about 4.71 GB RAM, 5.14 GB dedicated
GPU memory, and 81.8 MB shared GPU memory; every intermediate and final cleanup
checkpoint returns those measures to zero. This evidence does not select a
production profile or prove sustainable playback.

M007 Milestone 6 reviews the complete implementation against ADR-0016 and the
frozen protocol authority. The decision remains Rust-owned standard streams,
one bounded optimized binary response, one active synthesis, no service queue,
and identity-first worker-termination containment. The dependency, native
permission, privacy, artifact, historical-authority, and documentation audits
introduce no wider runtime surface. Local portable, native, packaged, and
exact-host validation plus the required pull-request CI pass, and the ExecPlan
is archived.

## Core data flow

The public EPUB package implements the in-memory validation, parsing, semantic projection, resource-descriptor, locator, target-resolution, and bounded narration-preparation portions of this flow. The desktop file-open and reader coordinators own publication lifecycle, safe rendering, navigation, restoration, and the active visual locator. Under exact native development configuration, the M008 application coordinator branches from that immutable safe model, calls `prepareNarration` from the active locator, attaches ephemeral work identities, dispatches one segment through M007, transfers each validated complete unit into the bounded FIFO, and drives the Web Audio player. Sensitive prepared text is retained only by the bounded preparation/synthesis path and dropped when settled; PCM stays outside React state and is released after playback or invalidation. The default model-free runtime exposes no user-facing narration path.

The historical Milestone 5 description above ends at prepared text. M008
Milestone 5 now connects that immutable safe model to an exact-development-only
audible path: an application coordinator prepares from the active visual
locator, dispatches one segment through M007, transfers each validated complete
unit into the bounded FIFO, and drives the Web Audio player. Sensitive text and
PCM remain outside React state. M008 by itself does not supply synchronized
highlighting; M009 Milestones 2-3 now project eligible source ranges into one
reader-owned segment highlight and focus-safe follow. Milestone 4 adds
identity-first explicit chapter, visible-passage, leaf, and stable-boundary
navigation while retaining active/paused intent. M009.1 exact-host validation
later separates passive viewport inspection from those narration actions.
Milestone 5 adds exact
segment-boundary persistence and non-skipping lifecycle restoration. This
still does not supply a standard profile, uninterrupted output, general
hardware support, or distribution.

1. **Implemented:** Validate the selected EPUB as an untrusted archive.
2. **Implemented:** Parse metadata, navigation, and spine order.
3. **Implemented:** Resolve the saved logical reading locator, or use the beginning of a new book.
4. **Implemented:** Select the already-sanitized semantic spine document for application-owned rendering.
5. **Implemented:** Reconstruct the visible passage from the locator and current scrolling layout.
6. **Implemented — Milestone 5:** Exhaustively project narratable source units and structural boundaries from immutable located safe semantics, map every source position to an immutable locator-valid Unicode-code-point span, consume that mapping through bounded canonical source windows with close-linked cancellation/continuation, normalize the accepted neutral/Spanish forms, scan deterministic source-offset sentence/dialogue/clause/protected-token boundaries, pack cancellable block-local stable source-offset segments under the accepted profile with fixed oversized-token behavior, and finalize immutable canonical locator-linked prepared segments without changing the displayed representation.
7. **Implemented — Milestone 5:** Emit bounded public prepared-segment batches with stable locator ranges and deterministic resource evidence.
8. **Implemented — Milestone 7:** The model-free Rust probe proves the selected parent/child frame boundary and a narrow binary Tauri response. Canonical shared control schemas and the bounded Python service prove strict narration input, lifecycle, complete-unit audio framing, cancellation, and failure behavior. The native shell owns one persistent child, framed read/write bounds, state/timeouts, process-tree termination, zero automatic restart, application-exit cleanup, and narrow Tauri commands. The typed desktop client validates control order and identity, retains one binary unit outside React state, and zeroes released or stale bytes. Native-only configuration selects the implemented exact Qwen/Serena adapter.
9. **Constrained exact-host product path implemented — Milestone 8:** Milestones 1-4 implement the frozen authority, scheduler, sole-owner FIFO, Web Audio player, content-free estimator/wait decisions, and accessible controls. Milestone 5 adds the application coordinator, active-locator preparation, one-at-a-time M007 dispatch, mounted exact-development controls, stale-first cancellation, and packaged quick/prepared hardware evidence. The matrix observes real depletion and buffering instead of treating the worker as real-time.
10. **Policy closed; synchronization authority amended — Milestones 8-9 and M009.1:** Milestone 6 retains the frozen quick/prepared/refill defaults and zero adaptive low-buffer wait from measured evidence without promoting the profile. M009 Milestone 1 selects honest segment-level timing, CSS Custom Highlight decoration, and focus-safe following. M009.1 exact-host evidence supersedes automatic passive-scroll seeking: only explicit navigation actions replace narration.
11. **Implemented through exact-host synchronized validation — Milestones 8-9:** Played units release exactly once; stop, explicit locator replacement, close, and failure invalidate eligibility before bounded cleanup. M009 Milestone 2 carries immutable source ranges only with eligible FIFO ownership and emits identity-keyed start, bounded progress, and completion observations without text or PCM. Milestone 3 maps the active half-open range through the existing semantic DOM boundary, owns one production Custom Highlight, follows without focus or selection changes, and suppresses passive tracker feedback across incremental and chapter rendering. Milestone 4 implements identity-first explicit seeks, stable prepared-boundary movement, canonical reader placement, active/paused intent preservation, and fixed accessible actions. M009.1 keeps passive wheel/touch/pointer/key viewport inspection independent from that path. Milestone 5 persists exact audible starts, matching completions, and latest-heard lifecycle checkpoints while rejecting periodic, stale, passive-visual, or reflow advancement.
12. **Implemented for reader state:** Persist the authoritative logical reading locator—heard while narration owns position, otherwise visual—not a rendered page number or generated audio. Generated-audio persistence remains prohibited future behavior unless a separate product/privacy decision approves it.

## Implemented narration-preparation boundary

The completed [Milestone 5 ExecPlan](../plans/completed/M005-narration-text-preparation.md) retains the implementation and validation authority for text preparation, [ADR-0012](decisions/ADR-0012-bounded-narration-preparation.md) fixes its durable public and lifecycle boundary, the test-only [`narration-v1` corpus policy](narration-normalization-v1.md) fixes the first neutral/Spanish exact examples and preservation decisions, and the test-only [`narration-v1` limits profile](narration-preparation-limits-v1.md) fixes model-independent chunk, batch, work, retention, checkpoint, and yield bounds. Task 2.1 implements the first package-internal source-traversal layer: it emits frozen located heading/paragraph leaves, text/line-break/raster-placeholder source units, and quote/list/list-item boundaries; preserves inherited language, direction, inline-container, quote, list, and source-order context; and verifies source code-point totals against locator-index authority. Task 2.2 adds the package-internal token mapper: each text code point, line break, and raster placeholder carries an ordered half-open offset span within its located leaf, while full `LocatorRangeV1` endpoints are constructed and revalidated on demand. Task 2.3 adds bounded package-internal source windows, canonical continuation, deterministic work checkpoints/yields, one-active-operation ownership, no-partial-result failures, and close-linked cancellation. Tasks 3.1-3.4 add and validate frozen block-local normalized streams whose nonempty text and typed omissions retain every original token span. Task 4.1 adds immutable source-offset sentence, dialogue-turn, clause, and protected-token boundaries without locale-dependent segmentation or an untracked string reparse. Tasks 4.2-4.3 pack those units into stable immutable block-local source-offset segments under all accepted per-segment, retained-state, work, checkpoint, and yield ceilings, with deterministic oversized-token splitting or fixed limit failure. Task 4.4 finalizes that bounded output into immutable `SensitiveNarrationTextV1` plus canonical half-open `LocatorRangeV1`, the accepted boundary reason, content-free measurements, completion, and one exact continuation without generating work identity. Tasks 5.1-5.3 implement and validate the public boundary:

- preserve displayed `SensitivePublicationText` unchanged and create a separate sensitive, ephemeral narration representation;
- pack deterministic semantic units with explicit neutral and representative Spanish cases;
- target 320 narration code points / 1,024 UTF-8 bytes per segment and eight segments per batch while enforcing independent hard ceilings of 640 code points / 2,048 bytes per segment, 16 segments, and 8,192 code points / 24,576 bytes per batch;
- expose `OpenedPublication.prepareNarration(request)` with the closed package-local `narration-v1` profile, caller default language `und` or `es`, a positive bounded segment count, and optional caller cancellation;
- return frozen `batch`, `complete`, `cancelled`, `invalid-request`, `invalid-start`, `operation-active`, `resource-limit-exceeded`, or `internal-failure` outcomes with no partial sensitive result;
- permit one active narration preparation independently of the existing raster-read slot, while publication close aborts and awaits both before archive release;
- retain a stable source `LocatorRangeV1` for every nonempty prepared segment so later seeking, highlighting, cancellation, and progress can refer to the same logical publication positions; and
- keep model-specific preprocessing, TTS requests, inference, audio, timing, highlighting, and synchronized playback outside Milestone 5.

The package-local `PreparedNarrationSegment` contains `SensitiveNarrationTextV1`, one block-local half-open `LocatorRangeV1`, a closed boundary reason, and content-free source/narration code-point, UTF-8-byte, and sentence measurements. It has no segment, session, generation, model, voice, timing, or audio identity. Later coordination code attaches the identities needed by `NarrationSegmentV1`; Milestone 5 does not change or duplicate the shared schema.

The operation structurally normalizes an untrusted start locator and reports exact/recovered resolution plus its relation to stable segmentation. A request inside a segment returns that complete segment first and reports `inside-segment`; a request in an unspoken gap reports `before-next-segment`; a request at a segment start reports `at-segment-start`; and an exhausted source reports `publication-end`. This preserves stable segmentation while leaving Milestone 9 free to use, skip, or otherwise interpret the containing segment for a particular playback interaction. A nonterminal batch continues from the final segment's end locator; changing the requested batch count cannot change segment text or ranges.

Narration text is local sensitive data. It must not be persisted, logged, placed in metrics or analytics, copied into snapshots or errors, or used as a locator anchor. The accepted test-only corpus contains frozen synthetic-sensitive source/expected values for whitespace, line breaks, hyphenation, punctuation, abbreviations, numbers, dates, times, currency, percentages, symbols, code, Unicode, effective-language transitions, malformed input, and foreign names. It records exact transforms plus ambiguous/unsupported preservation and protected boundaries; production owns separate closed policy tables and does not import the test corpus at runtime. Corpus tests may assert short exact strings where text transformation is the behavior under review, but diagnostics and benchmark summaries remain content-free.

The accepted limits evidence publishes only measurements and content-free outcomes; an internal test helper compares independently rebuilt narration bytes and source ranges without returning them. It separately accounts for Unicode code points, UTF-8 bytes, sentences, protected tokens, parser lookahead, traversal depth, normalization expansion, work, retained intermediate state, and one lookahead segment. Cancellation is targeted every 512 work units and required by 1,024; deterministic yielding is targeted every 4,096 units and required by 8,192. Exact hard maxima pass, and max-plus-one observations produce one fixed content-free failure without a partial result. Task 2.3 enforces the source inspection, traversal-depth, retained source token/event, checkpoint, yield, cancellation, and close subset. Tasks 3.2-3.3 enforce the accepted hard maximum of 16 output code points per source code point for closed Spanish symbol and lexical expansions, Task 3.3 enforces the 128-code-point parser-lookahead ceiling, Task 4.1 enforces the 256-code-point protected-token ceiling, and Tasks 4.2-4.3 enforce the per-segment source/code-point/UTF-8-byte/sentence dimensions, the 17-entry retained-segment ceiling, the 8,832-code-point/26,624-byte retained narration ceilings, bounded temporary scan indexes, and checkpointed/yielding cancellable packing. Task 4.4 keeps the same 17-entry bound while validating canonical locator-linked prepared output. Task 5.1 production-enforces the 1-16 requested segment count plus the independent 8,192-code-point, 24,576-byte, and 64-sentence public batch totals, retaining at most one lookahead segment before publishing a frozen result.

## Required invariants

- Audio from an inactive reading session is never played.
- The visible reading location, narration start, highlighting, and saved progress refer to the same logical EPUB position.
- Reflow does not change the logical reading position.
- The initial 15-second target represents buffered playable audio, never a fixed startup timer.
- Explicit prepared playback is distinct from quick start and exposes its
  target, exact loaded duration, and estimate without a progress bar.
- Playback-only pause may continue bounded same-identity generation; explicit stop and invalidating actions still cancel obsolete work.
- Book text is never written to logs.
- Derived narration text is not written to logs, analytics, persisted progress, benchmark summaries, or content-bearing diagnostics.
- The generation queue and audio buffer are bounded.
- The constrained demo's simultaneous playable-audio ceiling is exactly 43,200,000 24-kHz mono sample frames, 172,800,000 logical payload bytes, 256 complete units/metadata entries, one prepared batch, 16 retained prepared segments, and one active synthesis with zero service-queued synthesis.
- Network access is not required for normal reading.
- Cancelled work cannot later re-enter the active playback queue.
- Generated audio is not persisted unless a future explicit feature and privacy review permit it.

## Dependency direction

- UI components depend on application-level reading APIs, not directly on EPUB or TTS implementations.
- `apps/desktop` declares `@voxleaf/epub` and `@voxleaf/shared` directly. The publication-session module owns the EPUB opener; reader modules consume only public semantic/publication types and package resolution operations; persistence modules consume shared locator/state types and the strict shared persisted-state decoder.
- EPUB parsing must not depend on the desktop framework.
- `@voxleaf/epub` consumes shared book and locator contracts only through the public `@voxleaf/shared` workspace package boundary; `@voxleaf/shared` has no reverse EPUB dependency.
- ADR-0012 keeps narration preparation framework-independent beside the semantic/locator owner in `@voxleaf/epub` and accepts `OpenedPublication.prepareNarration` as the sole public preparation operation.
- Scrolling layout and semantic-to-DOM position mapping belong to the desktop reader. Logical locator creation plus locator and semantic-target resolution are implemented framework-independent operations in `@voxleaf/epub`.
- Shared protocol types must not depend on either process implementation.
- Future TTS model adapters must implement an internal interface so benchmarking does not leak model-specific details through the application.

## Visual reader boundary

[ADR-0008](decisions/ADR-0008-visual-reader-architecture.md) establishes the approved semantic-renderer boundary. Task 2.4 implements its surrounding lifecycle state and presentation-error containment, Task 3.1 implements the exhaustive application-owned semantic text renderer, and Task 3.2 implements explicit navigation:

- React constructs repository-owned semantic HTML directly in the application DOM from closed immutable semantic values.
- The desktop does not reconstruct publisher HTML, use raw-HTML APIs, expose publisher fragments as DOM IDs/browser URLs, or activate external links.
- One coordinator owns active document/locator state and routes table-of-contents, internal-link, previous/next, and direct-locator navigation.
- `@voxleaf/epub` owns semantic target-to-locator matching through a closed public resolution operation; non-spine/empty/invalid targets remain unavailable rather than receiving fabricated locators.
- The initial reader uses continuous vertical scrolling and persists no rendered page, pixel, percentage, DOM path, or text quotation as position authority.
- A structural locator plus Unicode-code-point offset represents the active passage; browser caret geometry may refine the offset, with deterministic block-start fallback.
- Explicit navigation has a predictable focus destination, while passive scroll/reflow/restoration does not move focus.
- Reader navigation remains application state rather than browser routes/history.
- Task 3.6 renders chapters incrementally in browser-yielding batches of at most 250 semantic blocks; more than 10,000 semantic blocks or 80,000 projected live DOM nodes produces `chapter-too-large` before partial rendering and preserves the last valid locator.

`apps/desktop` contains the local-file open UI/coordinator, raster safety/lifecycle implementation, publication-session and six-state reader lifecycle owners, semantic renderer, bounded large-chapter scheduler, navigation coordinator, semantic DOM range mapper, active visual-locator tracker, bounded reflow restorer, closed reader-preference controls, versioned reader-state repository, lifecycle-aware save coordinator, open restore coordinator, browser smokes, and separate Windows-only Chromium/WebView2 benchmark paths. Ready state alone exposes the active `OpenedPublication`; non-ready states and unmount drop it before presentation. The renderer admits only application-owned semantics and bounded local raster sources, the mapper/tracker/restorer hold only content-free structural associations and transient geometry, and every owner releases callbacks, frames, registrations, timers, lifecycle listeners, and image resources on replacement or close. Explicit navigation owns destination focus, while passive tracking, reflow, and startup restoration do not move focus. Application-owned skip/return links move keyboard focus between the table of contents and reader without mutating the browser URL. Leaf reader components do not access storage directly. Application CSS maps closed tokens to one responsive continuous layout. Package resolution, local publication lifecycle, semantic rendering/navigation, closed preferences, large-chapter enforcement, semantic range mapping, passive normalized tracking, viewport/preference reflow preservation, bounded persistence, the approved save lifecycle, exact/nearest-valid open restoration, and the real-browser/native interaction/performance/resource matrices are implemented.

## Local file-ingress boundary

[ADR-0009](decisions/ADR-0009-capability-free-local-file-ingress.md) accepts the implemented Task 1.2 WebView boundary. An application-owned file input reads at most 100 MiB through abortable `FileReader` into transient in-memory bytes. A replacement selection or unmount aborts the active read, request identity rejects stale completion, a post-read length check defends the preflight assumption, and the input is cleared for same-file reselection. Fixed UI states contain no filename, path, bytes, MIME claim, or raw browser error.

The Task 1.2 release probe passed in native Windows WebView2 while the Tauri shell retained zero commands, plugins, and capabilities and the then-current CSP. ADR-0010 later added only the image-specific Blob allowance described below. Tasks 2.2-2.3 now connect successful bounded bytes to the publication session and `openEpubPublication`; a replacement selection invalidates prior work immediately, picker cancellation preserves the prior ready/idle view, validated title/authors appear only after success, and fixed states cover read, invalid, unsupported, exhausted, cancelled, and internal outcomes. Task 2.4 layers the closed accessible lifecycle surface, zero-locator empty recovery, explicit close, stale-view clearing, and fixed renderer-failure containment over that boundary. The implementation still retains no path or MIME claim and adds no native capability. The checked-in packaged WebView2 matrix uses disposable synthetic files to prove same-file reselection, picker cancellation, ready-publication replacement, stale active-read cancellation, exact 100-MiB admission, max-plus-one rejection, recovery, input clearing, and filename privacy. Cancellation timing is made deterministic by replacing exactly one WebView `FileReader` with a test-controlled pending reader; the replacement and both size-boundary cases use the native WebView implementation.

## Raster image decode boundary

[ADR-0010](decisions/ADR-0010-bounded-raster-image-decode.md) accepts a desktop-owned predecode parser and object-URL source manager for the four static raster types already admitted by ADR-0007. Before browser decode, it enforces 8,192-pixel width/height limits, 16,777,216 decoded pixels, one static frame, and fixed malformed/over-limit outcomes. One manager permits one concurrent decode, eight live sources, and 16,777,216 aggregate live pixels.

Only a preflighted application-created Blob may become a `blob:` URL. Browser-observed dimensions must match preflight metadata. Release/close revokes URLs exactly once; close aborts and awaits active work. The committed CSP permits only self scripts/styles plus self/blob images and adds no network origin or `unsafe-eval`. Task 3.3 integrates this boundary without changing the `@voxleaf/epub` public contract: one publication-scoped loader accepts only opaque catalog IDs, serializes package reads and manager preparation, caps active-plus-queued work at eight, clears returned byte copies, and creates no cache. `IntersectionObserver` starts component work near the viewport; missing support falls back to the same bounded path. Semantic alt text is used when present, fixed application text covers missing alt/failure, and component/reader cleanup aborts stale operations and releases every ready handle. The production Chromium smoke proves real Blob rendering, chapter-change revocation/reload, unchanged browser URL, and zero non-loopback requests. The packaged WebView2 smoke proves the same repository-authored PNG decodes under CSP and disappears on close with zero page/console errors or external requests.

## Reading-state persistence boundary

[ADR-0011](decisions/ADR-0011-bounded-web-storage-reader-state.md) accepts the packaged WebView's `window.localStorage` behind a replaceable asynchronous desktop repository. Exactly two fixed `voxleaf.reader.` keys hold one positions envelope and one global display-preference envelope. The positions value is bounded to 128 exact-byte book identities and 262,144 UTF-16 code units with deterministic most-recent eviction; the preferences value is bounded to 1,024 code units and contains only closed text-scale, line-spacing, content-width, and theme tokens.

The implemented desktop repository owns outer-envelope decoding, bounded Web Storage access, exact-identity lookup, deterministic most-recent replacement/eviction, and independent version/migration dispatch for positions and display preferences. It revalidates typed write inputs, performs at most one synchronous bounded read and one atomic fixed-key replacement inside each asynchronous operation, and returns only fixed content-free statuses. `@voxleaf/shared` continues to own strict decoding of nested `PersistedReadingStateV1`; `@voxleaf/epub` owns locator resolution; the reader coordinator owns the active normalized locator and restoration sequence. Leaf components do not access storage. Display preferences remain app-local and do not change shared v1.

Passive position updates use a trailing 500 ms debounce, while explicit navigation, settled preference reflow, book replacement/close, hidden-document, and `pagehide` lifecycles request coalesced immediate saves of the latest validated locator. Failures are content-free and nonfatal. Unsupported envelope versions are preserved without coercion, overwrite, eviction, or deletion; future migrations are explicit validate-transform-validate replacements. Exact-byte identity allows restoration after app restart and exact-file reselection, while a byte-modified EPUB starts fresh.

The application now reads validated global preferences before mounting the ready reader and resolves saved state only for the selected exact-byte identity. An exact locator remains unchanged; package-owned recovery supplies the nearest canonical locator; and all non-readable repository states fall back safely without coercing or deleting future-version data. The reader materializes the target document and aligns the mapped range before settlement, suppresses passive sampling during that transaction, never moves focus, and saves a recovered canonical locator only after settlement. The packaged Windows startup smoke now performs navigation/save, complete application closure, restart with the same disposable profile, exact-file reselection, restoration, and close. This integration adds no dependency, native command, plugin, capability, path contract, or shared-schema change.

## Secure EPUB ingestion boundary

[ADR-0007](decisions/ADR-0007-secure-epub-ingestion-boundary.md) establishes the accepted Milestone 3 support profile and the single authority for archive, XML, graph, content, resource, and processing limits. Ingestion accepts bounded in-memory EPUB bytes, validates the ZIP/OCF structure before interpreting publication data, resolves only case-sensitive virtual in-container paths, and never extracts to disk or performs network access.

The initial profile accepts EPUB 3 reflowable XHTML with EPUB navigation and supported local raster resources. Its bounded compatibility policy validates and ignores legacy EPUB 2 `meta name/content` values inside an otherwise supported EPUB 3 package and permits only the inert HTML doctype in XHTML content/navigation; it still performs no DTD/entity processing and rejects all package/container, external, internal-subset, and non-HTML doctypes. EPUB 2/NCX-only, fixed-layout-only, protected, remotely dependent, active, SVG-dependent, and media-dependent publications remain explicit unsupported inputs unless safe supported fallbacks preserve the required reading path. XHTML is projected into immutable allowlisted semantic values; publisher HTML, live DOM nodes, CSS, executable SVG, and scripts never cross the ingestion boundary.

`@voxleaf/shared` continues to own serialized book, locator, and operational-error contracts. `@voxleaf/epub` owns package relationships, immutable semantic nodes, detailed navigation, bounded resource handles, locator and semantic-target indexes, and fixed EPUB detail codes. The desktop now consumes those detailed navigation and target-resolution values without moving package matching into React or changing a serialized contract. Exact EPUB bytes define the book's `sha256` identity; source-derived or generated structural anchors contain no prose or host path. Expected failures and diagnostics remain content-free, and the EPUB package performs no logging.

The public `@voxleaf/epub` root exposes `openEpubPublication` plus the framework-independent publication/result types. The opener accepts only in-memory bytes and an optional abort signal, runs the validated archive, package, navigation, semantic, resource-catalog, locator-index, and target-index stages, and returns a frozen discriminated result instead of throwing an expected ingestion failure. Success retains the archive only behind an explicit opened-publication lifecycle and exposes immutable semantic documents, detailed navigation, lazy path-free raster descriptors, deterministic block locators, structural locator resolution, semantic-target resolution, and idempotent close. Failure contains only one closed EPUB detail code and its canonical `OperationalErrorV1`; it has no message, stack, cause, path, URL, markup, prose, bytes, or raw rejected value. The package performs no logging.

The closed block, inline, navigation, and raster-resource values contain no publisher HTML, DOM objects, paths, URLs, or eager resource bytes. The locator index preserves only shared-v1-valid unique source IDs, generates deterministic collision-free replacements, binds every start locator to exact book identity and spine identity, and counts legal text offsets by Unicode code point. The locator resolver requires full identity for exact results, rejects another book, and recovers through matching-spine anchor/offset adjustment, nearest non-empty spine, or book start with fixed content-free reasons. The separate package-private target index retains unique addressable source-fragment matches without exposing them in results; unresolved fragments recover only to the same spine document start, while invalid, unknown, non-spine, and empty targets remain unavailable. The desktop connects the selection/read boundary to its package-level publication session and consumes these values for safe metadata, semantic text/static-image rendering, explicit navigation, validated content-free position saves, and exact/nearest-valid restoration before the ready reader settles.

The implemented boundary uses exactly pinned `@zip.js/zip.js@2.8.30` and `saxes@6.0.0` behind package-internal adapters. The ZIP adapter imports the pure-JavaScript core, disables workers and native compression streams, and uses only in-memory readers/writers. The XML adapter emits bounded namespace-aware events without a DOM or resolver. Neither dependency is part of the public EPUB API, and no renderer-oriented EPUB framework has been added. Selection evidence, licenses, alternatives, and transitive impact are recorded in [`development/dependencies.md`](../development/dependencies.md).

## Shared contract authority

[ADR-0006](decisions/ADR-0006-json-schema-contract-authority.md) establishes checked-in JSON Schema Draft 2020-12 documents under `packages/shared` as the authority for serialized contract families. TypeScript wire DTOs are generated from those schemas, while Python and any future Rust consumer must validate or derive from the same schemas rather than maintain an independent authoritative model.

The same deterministic generator now emits committed typed standalone validators for every root contract family. Ajv is development-only: it compiles the canonical schemas during generation and independently checks serialized fixtures during tests, while production decoders import only the generated type guards. Generation rejects unexpected runtime helpers and dynamic code, fixture conformance compares generated and freshly compiled results, and the desktop build rejects any Ajv module or runtime code-generation expression before producing an asset.

Schema-family versions govern persisted or cross-process payload shapes and remain separate from process transport version 1. Runtime decoding occurs at persistence and process trust boundaries before data can affect domain or playback state. M007 Milestone 1 selects the Rust-owned standard-stream transport and freezes its framing and limits in [`tts-service-protocol-v1.md`](tts-service-protocol-v1.md). Milestone 2 adds the closed canonical control schema and fixtures, a generated standalone TypeScript predicate, a generated offline Python schema registry, and Rust/Python/TypeScript conformance evidence from that one authority. Milestone 3 implements the native supervisor and typed renderer boundary without exposing a shell API: Rust validates every child frame and work identity before one optimized binary response, and TypeScript independently validates the active scope, finite PCM, exact bounds, and one-unit ownership. Milestone 4 connects the same boundary to the exact service-owned Qwen/Serena adapter while preserving the model-free default and isolated candidate lock. Milestone 5 validates the frozen nine-case handoff through the release supervisor, including bounded complete-unit delivery, backpressure, invalidation, cancellation, crash, exit cleanup, and closed RAM/VRAM/network evidence. Milestone 6 audits and retains that accepted protocol without a version or dependency change. The packaged WebView binary-response gate passes through Tauri's internal-only `ipc:`/`ipc.localhost` CSP boundary.

The implemented book v1 boundary validates raw input against its canonical Draft 2020-12 schema with offline-registered references, then constructs branded domain values and checks relationships that the schema cannot express directly. Validation errors distinguish malformed input from unsupported versions without including book metadata or raw values.

The implemented locator v1 boundary identifies an opaque book, spine item, versioned `element-id` anchor, structural anchor index, and Unicode-code-point text offset. Optional progression is recovery metadata rather than the position authority. Locator ranges order positions by spine index, anchor index, and text offset and reject cross-book ranges. The package-internal EPUB resolver validates these fields against sanitized semantic content and returns a canonical index-derived locator; the desktop persists only canonical exact-book values and uses that same resolver for exact or nearest-valid application restoration.

The implemented persisted-reading-state v1 boundary stores one opaque book identity, its authoritative logical locator, and a closed minimal preferences object. The decoder requires the root and locator book identities to match. Preferences may retain an opaque local voice identifier and a positive requested playback-rate multiplier; later capability and reader layers decide which values are available. The contract contains no storage path, book prose, generated audio, model data, rendered page authority, display settings, timestamps, or persistence-engine behavior. ADR-0011 keeps display preferences in a separate app-local envelope and assigns storage/migration ownership to the desktop without changing this shared contract.

The implemented reading-session v1 boundary binds a book identity to one opaque session ID and its active opaque generation ID. Future work envelopes carry that session/generation identity and use a pure classifier to accept only the active pair; a replaced or absent session yields `stale-session`, while an earlier generation in the same session yields `stale-generation`. A cancellation intent identifies the generation to request cancellation for, but does not itself accept or reject late work: replacing the active pair remains the deterministic stale-result safeguard.

The implemented narration-segment v1 boundary joins one stable segment ID, zero-based sequence, book identity, source locator range, and session/generation work identity with sensitive narration text. Its decoder verifies that the claimed book identity matches the locator range and rejects invalid range order or unsupported nested versions. Narration text is process-local sensitive data: it must not enter errors, metrics, persisted state, or debug snapshots. The shared contract intentionally does not choose text normalization, language, prosody, or chunk-sizing rules. `@voxleaf/epub` now owns the package-local `narration-v1` preparation policy and emits compatible prepared text/ranges; later scheduling work must attach session, generation, segment, and sequence identity without widening that policy into the shared schema.

The implemented operational-error v1 boundary carries only a stable machine-readable code, its fixed category, and fixed `recoverable` or `fatal` severity. The decoder rejects inconsistent code/category/severity combinations. It intentionally has no free-form message, details, stack, path, content, audio, or implementation-data field; presentation layers must map known codes to safe localized messages. V1 codes and fields are closed, so unknown values fail rather than being interpreted or retained, and any future addition requires a new schema-family version.

The implemented capability-report v1 boundary requires explicit `supported`, `unsupported`, or `unknown` status for local speech generation, streaming generation, generation cancellation, generic hardware acceleration, and CPU fallback. `unknown` is not support. The report identifies no engine, model, device, vendor, path, benchmark, or hardware profile and therefore makes no specific compatibility or performance claim. Its closed required feature set follows the same explicit-version policy: future features require a new report version rather than silent field acceptance.

M010 Milestone 1 adds a separate
`HostProfileCompatibilityReportV1` contract without changing capability report
v1 or TTS protocol v1. The new report carries only closed operating-system,
architecture, logical-processor, MiB memory/storage, provider, device-class,
and precision facts plus explicit complete/partial/denied/unavailable and
known/unknown states. The schema, fixtures, generated TypeScript validator,
runtime decoder, embedded offline Python registry, and Rust authority audit
are implemented. Raw adapter/provider output, identity, paths, timestamps,
recommendations, and support claims are excluded, and the report cannot be
persisted. The adjacent executable desktop authority freezes registry/evidence
shape, fixed capacity margins, deterministic matching and preference reuse,
failure/recovery tables, zero automatic attempts, observation/diagnostic
bounds, and M009 latest-heard resume semantics.

M010 Milestone 2 implements the narrow native producer and desktop consumer of
that report. One injected native port owns the probe and permits one concurrent
run. On Windows, direct `GetNativeSystemInfo`,
`GetActiveProcessorCount`, `GlobalMemoryStatusEx`,
`GetDiskFreeSpaceExW`, DXGI/D3D12/DirectML, and CUDA driver queries produce
only bounded normalized facts. Adapter LUIDs exist only transiently to join
provider capability to identity-free DXGI memory/class facts. The renderer has
no shell/process/OS/HTTP capability; it receives the closed report through one
Tauri command and independently decodes it with the canonical shared
contract. Raw names, IDs, errors, paths, environment, timestamps, and
recommendations never cross the boundary, and the detector performs no
network, model, audio, or persistence operation. Unsupported non-Windows
builds report unavailable rather than implying support.
Milestone 6 corrects one normalization edge discovered on the exact host:
an unusable discarded adapter no longer downgrades an otherwise complete,
known selected provider. Unknown memory on the selected provider, no usable
provider, or ambiguous candidates still produces a partial fail-closed report.

M010 Milestone 3 consumes the report without retaining it. The immutable
registry initially bound exact historical engine/model/voice/runtime/configuration
identity and evidence hashes for Qwen/Serena, Qwen/Aiden, and Supertonic/F1.
The matcher applies the frozen fixed RAM, VRAM, and storage margins in
deterministic profile-ID order and fails closed on incomplete facts, invalid
evidence, resource/provider mismatch, or ambiguity. Rejected entries remain
`unsupported`; only exact Qwen/Serena may become `development-only`, and only
when the native development gate also passes. The desktop persists at most the
versioned bounded profile ID, re-probes at application start, explicit recheck,
OS resume, and immediately before child start, and exposes only closed
content-free states and reasons. Milestone 6 atomically adds the exact
Piper/davefx fourth entry as `supported`, so a compatible host may recommend
it while Qwen/Serena remains explicitly selectable only as
`development-only`. Switching profiles invalidates and releases the active
narration before the native service configuration changes; it never creates a
second service tree or starts narration implicitly.

M010 Milestone 4 implements the frozen desktop-local recovery authority
without changing shared schemas, protocol v1, native commands, Python service
behavior, dependencies, buffer limits, or persisted reader state. A pure
controller retains only the closed failure code, recovery phase, profile ID,
bounded sequence, and at most eight frozen diagnostics. Operational failure
replaces the active session/generation identity before aborting preparation,
invalidating playback, releasing queued units, terminating the supervised
service, and verifying zero client, scheduler, and player ownership. Only
then can the compact narration surface expose one explicit restart. A fresh
run receives new identities and resumes from the latest in-memory heard
checkpoint; a mid-segment failure replays that segment from its start.
Protocol rejection, cancellation timeout, cleanup failure, and a failed or
repeated recovery remain contained or unavailable. Compatibility recheck or
explicit profile selection starts a new episode but never starts narration.
There is no automatic retry, duplicate worker, or stale-audio reuse.

M010 Milestone 5 evaluates Piper 1.4.2 / `es_ES-davefx-medium` through the
isolated ONNX Runtime CPU boundary. The passing content-safe v6 result records
total sustained RTF 0.0251, about 392 MiB measured peak process-tree RAM, five
passing termination-backed cancellation races, overall Spanish quality
4.621/5, zero meaning-changing defects, and passing offline/privacy/cleanup
gates. `selection-v6` and ADR-0020 admit the exact profile as the
speed-focused CPU fallback.

M010 Milestone 6 implements that selected runtime without changing protocol
v1. The native supervisor accepts one bounded profile ID and starts exactly
one verified isolated Qwen or Piper service tree. `PiperTtsEngine` verifies the
frozen Piper, ONNX Runtime, voice artifacts, CPU provider, and offline
configuration before load. It converts each complete native 22,050-Hz mono
waveform inside the adapter to one bounded 24,000-Hz mono float32 protocol
unit; text, PCM, paths, and environment values remain outside diagnostics and
persistence. Product preparation selects the frozen
[`narration-piper-v2`](piper-narration-preparation-profile-v2.md) profile only
for Piper. It preserves v1's 200/256 narration-code-point target/hard bounds
and every locator, byte, sentence, work, retention, cancellation, and privacy
rule, then adds a 120/160 process-local spoken-expansion-unit target/hard
bound. This protects ordinary prose plus compact numbers, currencies,
acronyms, Roman numerals, ordinals, and letter sequences without rewriting
text. Before protocol dispatch, the desktop omits only Piper units that have
no Unicode letter, number, currency, or accepted spoken symbol because the
exact phonemizer emits no waveform for punctuation-only input. No silence is
inserted, locator continuation is preserved, and Qwen and other callers retain
`narration-v1`; unusual potentially spoken or oversized output still fails
closed. The exact-host Piper service and corrective
ordinary-prose and expansion-heavy packaged adaptive matrices pass
load, synthesis, backpressure, cancellation, reload, quick/prepared playback,
navigation replacement, cleanup, zero GPU use, and zero generated-audio
persistence. The Qwen service-only arm also passes under its exact
interpreter-bound outbound block. The corrected packaged path admits the exact
development profile at `7,196` MiB total and `6,508` MiB currently available
VRAM, selects it, and executes actual inference through the later depletion
stage. The depletion synchronization assertion then fails, so Qwen remains a
development-only option with no complete resilience or support claim.

The corrective
[`tts-profile-runtime-configuration-availability-v1`](tts-profile-runtime-configuration-availability-v1.md)
boundary keeps hardware fit separate from executable configuration. After
hardware admits the selected profile, the typed client sends only its bounded
profile ID to native supervision and receives one boolean derived from the
same exact-runtime construction used before child start. The check runs during
product availability resolution and again immediately before start. Missing or
invalid configuration disables Play without creating a child or recovery
episode; paths, environment values, model data, and raw errors never cross the
native boundary. Configured Piper passes the release-packaged reader matrix
through this gate.

M010 Milestone 7 accepts
[`tts-support-matrix-v1`](tts-support-matrix-v1.md) and ADR-0023 without
editing byte-frozen evaluation records. Piper/davefx is the sole `supported`
CPU fallback and the only automatically recommendable profile when its
matcher and runtime-configuration gates pass. Qwen/Serena remains an explicit
native-gated `development-only` choice; Qwen/Aiden and Supertonic/F1 remain
unselectable `unsupported` evidence. Fallback never means automatic engine
failover. Recovery stays identity-first, cleanup-verified, limited to one
explicit action, and constrained to one service tree. M011 owns distribution,
including Piper GPL/phonemizer notices, corresponding-source or written-offer
mechanics, CC0 voice provenance, installer size, signing, and updates.

The implemented audio-frame v1 boundary describes payload-free in-memory frame metadata with frame, session, generation, and narration-segment identities; monotonic sequence; positive sample rate, per-channel sample-frame count, and channel count; and an explicit end-of-segment marker. Duration is derived from sample count divided by sample rate. Public helpers return conservative whole milliseconds using exact integer arithmetic, sum samples before truncating once, and reject unsafe duration overflow. Contiguous single-segment runs reject duplicate frame IDs, sequence gaps or reversals, identity or format changes, and frames after the segment-end marker. The contract selects no codec, payload representation, audio API, player, or buffer policy.

The implemented buffer-status v1 boundary is a payload-free snapshot for one session and generation. It carries contiguous playable duration, nonnegative ordered low-water/target/maximum duration thresholds, an underrun count, and only the currently justified `empty`, `buffering`, `ready`, `playing`, and `paused` states. It rejects duration above the configured maximum and state/depth contradictions. A zero-depth exhausted buffer is represented as `buffering`, as required by the MVP; no end-of-stream state, fixed wall-clock wait, queue, ring buffer, startup gate, or playback behavior is selected by this contract.

M008 Milestone 3 implements the separate desktop-local payload boundary. The
adaptive scheduler accepts sole ownership from `takeAudioUnit()`, retains
complete units FIFO outside React, validates the frozen finite 24-kHz mono
float32 little-endian format, and accounts remaining playable frames
separately from whole retained-unit memory. The low-level player uses one
dedicated Web Audio context, one gain node, and at most one transient active
device buffer. Played payloads release once; invalidation makes every old unit
ineligible synchronously and releases at most four discarded originals per
scheduled cleanup turn. Milestone 5 connects this boundary to publication
preparation, M007 synthesis, mounted controls, and the audio device only under
the exact native development gate. It remains independent of the shared
reading position.

M008 Milestone 4 implements the adjacent content-free presentation boundary.
`AdaptivePreparationEstimator` retains at most eight completed elapsed-time
and accepted-sample-frame pairs, clears them on identity replacement, and
includes the measured stopped-service restart/prepare cost only after current
production evidence exists. `AdaptiveBoundaryWaitCoordinator` admits only the
frozen 0/1/2/3-second choices at an eligible positive-low-lead paragraph or
chapter boundary and makes interruption/counting explicit; the exact-host
matrix did not justify changing the `0` default before Milestone 6 policy
closeout. `AdaptivePreparationControls` receives
only content-free state and native callbacks, exposes quick/prepared targets,
exact loaded/target status, estimates, low/buffering/planned-wait distinctions,
pause/resume/stop, 5% volume steps, and a disabled `1.0x`-only speed selector.
It owns no narration text, audio, identity, service call, or player.
`ProductNarrationControls` adds the implemented compact persistent surface and
collapsible detail without changing that boundary. Milestone 5 mounts it as
the content-free view of `ProductNarrationCoordinator` only when the exact
development service is available.

M008 Milestone 5's coordinator remains outside React state and owns at most one
prepared batch, one active synthesis, the scheduler, and the player. It starts
from the active narration locator, attaches ephemeral identities, transfers
sole complete-unit ownership, and drops prepared references after each request.
Explicit locator replacement and lifecycle transitions make work stale before
cancellation. Passive viewport changes update only the visible-passage target;
they cannot cancel, restart, or replace active narration.
The exact-host matrix measured audible quick/prepared flows, one underrun and
truthful buffering, 160 ms cancellation, bounded RAM/VRAM, and zero external
requests. It retains the standard-profile blocker.

M008 Milestone 6 retains quick start as the default interaction and one minute
as both the initial prepared selection and refill/resume target. It keeps the
10-second low-water warning, `0` ms adaptive low-buffer wait, `1.0x` playback,
100% default volume, and exact simultaneous resource ceilings. M008.1 later
adds the distinct semantic generated-unit transition described above without
revising those M008 values.
