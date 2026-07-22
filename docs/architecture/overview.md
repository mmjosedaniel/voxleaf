# Architecture overview

## Status

Proposed. Component choices must be confirmed through implementation and benchmarks.

## Context

VoxLeaf must read EPUB files and synthesize speech locally while beginning playback before an entire chapter is generated. The application therefore needs explicit boundaries between document processing, scheduling, inference, buffering, and playback.

## Planned components

```text
Desktop application
├── Book library and file selection
├── Reader UI and navigation
├── Reading-session coordinator
├── Audio player and bounded playback buffer
└── Local TTS process client

EPUB package
├── Archive validation
├── Metadata and table-of-contents extraction
├── Spine traversal
├── Content sanitization
├── Text normalization
└── Semantic chunking

Local TTS service
├── Model lifecycle
├── Inference queue
├── Cancellation
├── Audio framing
└── Performance metrics
```

## Candidate process model

The desktop reader boundary includes a sanitized reflowable EPUB renderer, navigation, logical reading-location persistence, restoration, and synchronization with the active narrated segment. Pagination is derived from the current viewport and typography; it is not the durable source of position.

The desktop application and TTS inference should run in separate local processes.

Reasons:

- Python has the strongest ecosystem for candidate models.
- A process boundary isolates model failures and GPU memory.
- The desktop UI should remain responsive during inference.
- The service can expose explicit cancellation and health state.

The protocol may use Tauri IPC, standard input/output, a local socket, or loopback WebSocket. The final choice requires an ADR after a small prototype.

## Core data flow

1. Validate the selected EPUB as an untrusted archive.
2. Parse metadata, navigation, and spine order.
3. Resolve the saved logical reading locator, or use the beginning of a new book.
4. Extract and sanitize the selected spine content for safe visual rendering.
5. Reconstruct the visible page from the locator and current layout.
6. Derive narration text from the same logical location while retaining paragraph and dialogue boundaries.
7. Create bounded chunks tagged with their source locators.
8. Attach chunks to a unique reading session.
9. Generate approximately 15 seconds of playable audio, then start playback immediately when that media-duration threshold is met.
10. Generate later audio while the player consumes buffered frames and the renderer keeps the narrated passage visible.
11. Discard played frames and stale session work.
12. Persist the logical reading locator, not a rendered page number or generated audio.

## Required invariants

- Audio from an inactive reading session is never played.
- The visible reading location, narration start, highlighting, and saved progress refer to the same logical EPUB position.
- Reflow does not change the logical reading position.
- The initial 15-second target represents buffered playable audio, never a fixed startup timer.
- Book text is never written to logs.
- The generation queue and audio buffer are bounded.
- Network access is not required for normal reading.
- Cancelled work cannot later re-enter the active playback queue.
- Generated audio is not persisted unless a future explicit feature and privacy review permit it.

## Dependency direction

- UI components depend on application-level reading APIs, not directly on EPUB or TTS implementations.
- EPUB parsing must not depend on the desktop framework.
- `@voxleaf/epub` consumes shared book and locator contracts only through the public `@voxleaf/shared` workspace package boundary; `@voxleaf/shared` has no reverse EPUB dependency.
- Pagination belongs to the renderer, while logical locator creation and resolution remain framework-independent.
- Shared protocol types must not depend on either process implementation.
- TTS model adapters implement an internal interface so benchmarking does not leak model-specific details through the application.

## Secure EPUB ingestion boundary

[ADR-0007](decisions/ADR-0007-secure-epub-ingestion-boundary.md) establishes the accepted Milestone 3 support profile and the single authority for archive, XML, graph, content, resource, and processing limits. Ingestion accepts bounded in-memory EPUB bytes, validates the ZIP/OCF structure before interpreting publication data, resolves only case-sensitive virtual in-container paths, and never extracts to disk or performs network access.

The initial profile accepts EPUB 3 reflowable XHTML with EPUB navigation and supported local raster resources. EPUB 2/NCX-only, fixed-layout-only, protected, remotely dependent, active, SVG-dependent, and media-dependent publications remain explicit unsupported inputs unless safe supported fallbacks preserve the required reading path. XHTML is projected into immutable allowlisted semantic values; publisher HTML, live DOM nodes, CSS, executable SVG, and scripts never cross the ingestion boundary.

`@voxleaf/shared` continues to own serialized book, locator, and operational-error contracts. `@voxleaf/epub` owns package relationships, immutable semantic nodes, detailed navigation, bounded resource handles, locator indexes, and fixed EPUB detail codes. Exact EPUB bytes define the book's `sha256` identity; source-derived or generated structural anchors contain no prose or host path. Expected failures and diagnostics remain content-free, and the EPUB package performs no logging.

The ADR deliberately does not select archive or XML libraries. Low-level candidates must prove they can enforce the accepted boundary before becoming production dependencies.

## Shared contract authority

[ADR-0006](decisions/ADR-0006-json-schema-contract-authority.md) establishes checked-in JSON Schema Draft 2020-12 documents under `packages/shared` as the authority for serialized contract families. TypeScript wire DTOs are generated from those schemas, while Python and any future Rust consumer must validate or derive from the same schemas rather than maintain an independent authoritative model.

Schema-family versions govern persisted or cross-process payload shapes and remain separate from the future process transport version. Runtime decoding occurs at persistence and process trust boundaries before data can affect domain or playback state. Transport selection remains deferred until its planned prototype and ADR.

The implemented book v1 boundary validates raw input against its canonical Draft 2020-12 schema with offline-registered references, then constructs branded domain values and checks relationships that the schema cannot express directly. Validation errors distinguish malformed input from unsupported versions without including book metadata or raw values.

The implemented locator v1 boundary identifies an opaque book, spine item, versioned `element-id` anchor, structural anchor index, and Unicode-code-point text offset. Optional progression is recovery metadata rather than the position authority. Locator ranges order positions by spine index, anchor index, and text offset and reject cross-book ranges; resolving those fields against sanitized EPUB content remains a later ingestion responsibility.

The implemented persisted-reading-state v1 boundary stores one opaque book identity, its authoritative logical locator, and a closed minimal preferences object. The decoder requires the root and locator book identities to match. Preferences may retain an opaque local voice identifier and a positive requested playback-rate multiplier; later capability and reader layers decide which values are available. The contract contains no storage path, book prose, generated audio, model data, rendered page authority, display settings, timestamps, or persistence-engine behavior.

The implemented reading-session v1 boundary binds a book identity to one opaque session ID and its active opaque generation ID. Future work envelopes carry that session/generation identity and use a pure classifier to accept only the active pair; a replaced or absent session yields `stale-session`, while an earlier generation in the same session yields `stale-generation`. A cancellation intent identifies the generation to request cancellation for, but does not itself accept or reject late work: replacing the active pair remains the deterministic stale-result safeguard.

The implemented narration-segment v1 boundary joins one stable segment ID, zero-based sequence, book identity, source locator range, and session/generation work identity with sensitive narration text. Its decoder verifies that the claimed book identity matches the locator range and rejects invalid range order or unsupported nested versions. Narration text is process-local sensitive data: it must not enter errors, metrics, persisted state, or debug snapshots. The contract intentionally does not choose text normalization, language, prosody, or chunk-sizing rules; later EPUB and scheduling work will supply those policies.

The implemented operational-error v1 boundary carries only a stable machine-readable code, its fixed category, and fixed `recoverable` or `fatal` severity. The decoder rejects inconsistent code/category/severity combinations. It intentionally has no free-form message, details, stack, path, content, audio, or implementation-data field; presentation layers must map known codes to safe localized messages. V1 codes and fields are closed, so unknown values fail rather than being interpreted or retained, and any future addition requires a new schema-family version.

The implemented capability-report v1 boundary requires explicit `supported`, `unsupported`, or `unknown` status for local speech generation, streaming generation, generation cancellation, generic hardware acceleration, and CPU fallback. `unknown` is not support. The report identifies no engine, model, device, vendor, path, benchmark, or hardware profile and therefore makes no specific compatibility or performance claim. Its closed required feature set follows the same explicit-version policy: future features require a new report version rather than silent field acceptance.

The implemented audio-frame v1 boundary describes payload-free in-memory frame metadata with frame, session, generation, and narration-segment identities; monotonic sequence; positive sample rate, per-channel sample-frame count, and channel count; and an explicit end-of-segment marker. Duration is derived from sample count divided by sample rate. Public helpers return conservative whole milliseconds using exact integer arithmetic, sum samples before truncating once, and reject unsafe duration overflow. Contiguous single-segment runs reject duplicate frame IDs, sequence gaps or reversals, identity or format changes, and frames after the segment-end marker. The contract selects no codec, payload representation, audio API, player, or buffer policy.

The implemented buffer-status v1 boundary is a payload-free snapshot for one session and generation. It carries contiguous playable duration, nonnegative ordered low-water/target/maximum duration thresholds, an underrun count, and only the currently justified `empty`, `buffering`, `ready`, `playing`, and `paused` states. It rejects duration above the configured maximum and state/depth contradictions. A zero-depth exhausted buffer is represented as `buffering`, as required by the MVP; no end-of-stream state, fixed wall-clock wait, queue, ring buffer, startup gate, or playback behavior is selected by this contract.
