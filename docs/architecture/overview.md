# Architecture overview

## Status

Mixed implementation status. The Milestone 3 secure EPUB ingestion boundary and framework-independent document model are implemented and validated. The desktop now connects its capability-free local-file selection/read boundary to a UI-independent publication-session owner, presents one accessible idle/opening/ready/empty/failure/closing lifecycle surface, contains presentation failures, and retains the bounded static-raster predecode/decode source boundary. A user can open and explicitly close a supported publication but cannot render or read its semantic content yet. Rendering and the ADR-0011-approved persistence repository remain planned implementation work; narration preparation, TTS integration, buffering, and playback also require their own implementation evidence. The Python area remains a foundation only.

[`system-diagram.md`](system-diagram.md) is the canonical visual map and status legend. This overview owns the accompanying architectural rationale, invariants, and detailed implemented-boundary notes.

## Context

VoxLeaf must read EPUB files and synthesize speech locally while beginning playback before an entire chapter is generated. The application therefore needs explicit boundaries between document processing, scheduling, inference, buffering, and playback.

## Component boundaries

```text
Desktop application
├── Capability-free local file selection/read/open [implemented]
├── Bounded static-raster preflight/source lifecycle [implemented]
├── Cancellable publication-session lifecycle [implemented]
├── Accessible reader lifecycle state/error containment [implemented]
├── Versioned bounded Web Storage repository [approved, unimplemented]
├── Semantic React reader and navigation
├── Reading-session coordinator
├── Audio player and bounded playback buffer
└── Local TTS process client

EPUB package
├── Archive/package/navigation validation [implemented]
├── Immutable semantic projection [implemented]
├── Lazy bounded raster access [implemented]
├── Deterministic locator creation/resolution [implemented]
├── Narration text normalization [deferred]
└── Semantic chunking [deferred]

Local TTS service
├── Model lifecycle
├── Inference queue
├── Cancellation
├── Audio framing
└── Performance metrics
```

## Approved desktop reader and candidate process model

[ADR-0008](decisions/ADR-0008-visual-reader-architecture.md) accepts a direct application-DOM reader built from the closed `@voxleaf/epub` semantic model. The initial mode is continuous vertical scrolling over one active spine document. A desktop reader coordinator will own document navigation, the active logical locator, reflow capture/restoration, and later persistence scheduling; leaf presentation components do not own publication lifecycle or storage. Publisher HTML/CSS/scripts/URLs do not cross into the renderer, and no iframe or browser route/history integration is part of the initial reader.

The visual position is a normalized `ReadingLocatorV1` sampled at an application-owned reading line. A browser caret/range supplies the Unicode-code-point offset when safe, with deterministic block-start fallback. Explicit navigation may move focus to a destination heading/reader region, while passive scrolling, reflow, and initial restoration do not steal focus.

File ingress is resolved by ADR-0009, ADR-0010 resolves the predecode/decode/object-URL safety boundary for static raster images, and ADR-0011 resolves the bounded Web Storage, display-preference, save-lifecycle, failure, and migration policy. Playwright Chromium tooling supplies the deterministic real-browser foundation and Task 1.6 benchmark harness while native WebView2 behavior remains a separate Windows matrix. The ADR-0008 Task 1.6 amendment accepts incremental batches of at most 250 semantic blocks, a 10,000-block/80,000-DOM-node chapter ceiling, `chapter-too-large` fallback, and documented reference latency/memory gates. The desktop publication-session owner, file-selection/open integration, closed lifecycle state controller, accessible status/close surface, and fixed render-error boundary are implemented. Semantic image rendering, the reader/persistence coordinators, and reader-specific browser/native coverage remain later Milestone 4 work. Synchronization with the active narrated segment remains a later milestone.

The desktop application and TTS inference should run in separate local processes.

Reasons:

- Python has the strongest ecosystem for candidate models.
- A process boundary isolates model failures and GPU memory.
- The desktop UI should remain responsive during inference.
- The service can expose explicit cancellation and health state.

The protocol may use Tauri IPC, standard input/output, a local socket, or loopback WebSocket. The final choice requires an ADR after a small prototype.

## Core data flow

The public EPUB package currently implements the in-memory validation, parsing, semantic projection, resource-descriptor, and locator portions of this flow. The desktop file-open coordinator passes one bounded local-file read to the publication-session module, which owns cancellation, replacement, late-result rejection, and publication cleanup. A separate application lifecycle controller exposes only immutable idle/opening/ready/empty/failure/closing states, clears the prior publication reference before non-ready states, and maps zero located blocks to the recoverable empty state. The application presents only validated title/authors or fixed safe outcomes; no production presentation component consumes semantic publication content yet. Saved-position restoration, visual rendering, narration preparation, synthesis, buffering, playback, and persistence remain planned.

1. Validate the selected EPUB as an untrusted archive.
2. Parse metadata, navigation, and spine order.
3. Resolve the saved logical reading locator, or use the beginning of a new book.
4. Select the already-sanitized semantic spine document for application-owned rendering.
5. Reconstruct the visible passage from the locator and current scrolling layout.
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
- `apps/desktop` declares `@voxleaf/epub` and `@voxleaf/shared` directly; its publication-session domain module is the only current desktop caller of the EPUB opener and shared safe-error constructor.
- EPUB parsing must not depend on the desktop framework.
- `@voxleaf/epub` consumes shared book and locator contracts only through the public `@voxleaf/shared` workspace package boundary; `@voxleaf/shared` has no reverse EPUB dependency.
- Scrolling layout and semantic-to-DOM position mapping belong to the desktop reader. Logical locator creation plus locator and semantic-target resolution are implemented framework-independent operations in `@voxleaf/epub`.
- Shared protocol types must not depend on either process implementation.
- TTS model adapters implement an internal interface so benchmarking does not leak model-specific details through the application.

## Visual reader boundary

[ADR-0008](decisions/ADR-0008-visual-reader-architecture.md) establishes the approved semantic-renderer boundary. Task 2.4 implements its surrounding lifecycle state and presentation-error containment, but not semantic rendering:

- React constructs repository-owned semantic HTML directly in the application DOM from closed immutable semantic values.
- The desktop does not reconstruct publisher HTML, use raw-HTML APIs, expose publisher fragments as DOM IDs/browser URLs, or activate external links.
- One coordinator owns active document/locator state and routes table-of-contents, internal-link, previous/next, and direct-locator navigation.
- `@voxleaf/epub` owns semantic target-to-locator matching through a closed public resolution operation; non-spine/empty/invalid targets remain unavailable rather than receiving fabricated locators.
- The initial reader uses continuous vertical scrolling and persists no rendered page, pixel, percentage, DOM path, or text quotation as position authority.
- A structural locator plus Unicode-code-point offset represents the active passage; browser caret geometry may refine the offset, with deterministic block-start fallback.
- Explicit navigation has a predictable focus destination, while passive scroll/reflow/restoration does not move focus.
- Reader navigation remains application state rather than browser routes/history.
- Chapters render incrementally in browser-yielding batches of at most 250 semantic blocks; more than 10,000 semantic blocks or 80,000 projected live DOM nodes produces `chapter-too-large` before partial rendering.

This boundary does not make the semantic reader implemented. `apps/desktop` contains the local-file open UI/coordinator, ADR-0010 raster metadata/source-lifecycle implementation, publication-session owner, immutable six-state reader lifecycle controller, fixed React presentation-error boundary, Playwright browser smoke, and a Windows-only synthetic benchmark harness. Ready state is the only state that exposes the active `OpenedPublication`; opening, empty, failure, closing, and unmount cleanup drop it before presentation. The package-owned `resolveTarget` operation, desktop publication lifecycle, safe metadata presentation, empty-state recovery, and explicit close/reopen behavior are implemented, while the reader coordinator, semantic renderer, image component integration, locator/DOM mapper, navigation behavior, large-chapter enforcement, and ADR-0011 persistence modules require later tasks and tests. The reference thresholds must be revalidated against the real React/WebView2 reader; the test-only harness is not end-to-end reader evidence.

## Local file-ingress boundary

[ADR-0009](decisions/ADR-0009-capability-free-local-file-ingress.md) accepts the implemented Task 1.2 WebView boundary. An application-owned file input reads at most 100 MiB through abortable `FileReader` into transient in-memory bytes. A replacement selection or unmount aborts the active read, request identity rejects stale completion, a post-read length check defends the preflight assumption, and the input is cleared for same-file reselection. Fixed UI states contain no filename, path, bytes, MIME claim, or raw browser error.

The Task 1.2 release probe passed in native Windows WebView2 while the Tauri shell retained zero commands, plugins, and capabilities and the then-current CSP. ADR-0010 later added only the image-specific Blob allowance described below. Tasks 2.2-2.3 now connect successful bounded bytes to the publication session and `openEpubPublication`; a replacement selection invalidates prior work immediately, picker cancellation preserves the prior ready/idle view, validated title/authors appear only after success, and fixed states cover read, invalid, unsupported, exhausted, cancelled, and internal outcomes. Task 2.4 layers the closed accessible lifecycle surface, zero-locator empty recovery, explicit close, stale-view clearing, and fixed renderer-failure containment over that boundary. The implementation still retains no path or MIME claim and adds no native capability. Native release interaction must be repeated for the integrated flow before Task 2.3's evidence is complete.

## Raster image decode boundary

[ADR-0010](decisions/ADR-0010-bounded-raster-image-decode.md) accepts a desktop-owned predecode parser and object-URL source manager for the four static raster types already admitted by ADR-0007. Before browser decode, it enforces 8,192-pixel width/height limits, 16,777,216 decoded pixels, one static frame, and fixed malformed/over-limit outcomes. One manager permits one concurrent decode, eight live sources, and 16,777,216 aggregate live pixels.

Only a preflighted application-created Blob may become a `blob:` URL. Browser-observed dimensions must match preflight metadata. Release/close revokes URLs exactly once; close aborts and awaits active work. The committed CSP permits only self scripts/styles plus self/blob images and adds no network origin or `unsafe-eval`. Milestone 4 Task 2.5 replaced module-initialization Ajv compilation with self-contained generated validators, added a production-build guard against Ajv modules and runtime `eval`/`Function` construction, and proved the release WebView can mount plus open and close a repository-authored synthetic EPUB under that CSP. The implementation does not render a publication `img`, cache a resource, or change the `@voxleaf/epub` public contract; Task 3.3 owns those integrations and their accessible placeholders.

## Reading-state persistence boundary

[ADR-0011](decisions/ADR-0011-bounded-web-storage-reader-state.md) accepts the packaged WebView's `window.localStorage` behind a replaceable asynchronous desktop repository. Exactly two fixed `voxleaf.reader.` keys hold one positions envelope and one global display-preference envelope. The positions value is bounded to 128 exact-byte book identities and 262,144 UTF-16 code units with deterministic most-recent eviction; the preferences value is bounded to 1,024 code units and contains only closed text-scale, line-spacing, content-width, and theme tokens.

The desktop owns outer-envelope decoding, storage access, migration dispatch, and save scheduling. `@voxleaf/shared` continues to own strict decoding of nested `PersistedReadingStateV1`; `@voxleaf/epub` owns locator resolution; the reader coordinator owns the active normalized locator and restoration sequence. Leaf components do not access storage. Display preferences remain app-local and do not change shared v1.

Passive position updates use a trailing 500 ms debounce, while explicit navigation, settled preference reflow, book replacement/close, hidden-document, and `pagehide` lifecycles request coalesced immediate saves of the latest validated locator. Failures are content-free and nonfatal. Unsupported envelope versions are preserved without coercion, overwrite, eviction, or deletion; future migrations are explicit validate-transform-validate replacements. Exact-byte identity allows restoration after app restart and exact-file reselection, while a byte-modified EPUB starts fresh.

The current release-shell probe proved one fixed marker survived a complete Windows WebView2 application restart and was then removed. No persistence implementation remains in production source: Task 4.4 owns the repository and decoders, Task 4.5 owns save coordination, and Task 4.6 owns restoration integration.

## Secure EPUB ingestion boundary

[ADR-0007](decisions/ADR-0007-secure-epub-ingestion-boundary.md) establishes the accepted Milestone 3 support profile and the single authority for archive, XML, graph, content, resource, and processing limits. Ingestion accepts bounded in-memory EPUB bytes, validates the ZIP/OCF structure before interpreting publication data, resolves only case-sensitive virtual in-container paths, and never extracts to disk or performs network access.

The initial profile accepts EPUB 3 reflowable XHTML with EPUB navigation and supported local raster resources. Its bounded compatibility policy validates and ignores legacy EPUB 2 `meta name/content` values inside an otherwise supported EPUB 3 package and permits only the inert HTML doctype in XHTML content/navigation; it still performs no DTD/entity processing and rejects all package/container, external, internal-subset, and non-HTML doctypes. EPUB 2/NCX-only, fixed-layout-only, protected, remotely dependent, active, SVG-dependent, and media-dependent publications remain explicit unsupported inputs unless safe supported fallbacks preserve the required reading path. XHTML is projected into immutable allowlisted semantic values; publisher HTML, live DOM nodes, CSS, executable SVG, and scripts never cross the ingestion boundary.

`@voxleaf/shared` continues to own serialized book, locator, and operational-error contracts. `@voxleaf/epub` owns package relationships, immutable semantic nodes, detailed navigation, bounded resource handles, locator and semantic-target indexes, and fixed EPUB detail codes. Exact EPUB bytes define the book's `sha256` identity; source-derived or generated structural anchors contain no prose or host path. Expected failures and diagnostics remain content-free, and the EPUB package performs no logging.

The public `@voxleaf/epub` root exposes `openEpubPublication` plus the framework-independent publication/result types. The opener accepts only in-memory bytes and an optional abort signal, runs the validated archive, package, navigation, semantic, resource-catalog, locator-index, and target-index stages, and returns a frozen discriminated result instead of throwing an expected ingestion failure. Success retains the archive only behind an explicit opened-publication lifecycle and exposes immutable semantic documents, detailed navigation, lazy path-free raster descriptors, deterministic block locators, structural locator resolution, semantic-target resolution, and idempotent close. Failure contains only one closed EPUB detail code and its canonical `OperationalErrorV1`; it has no message, stack, cause, path, URL, markup, prose, bytes, or raw rejected value. The package performs no logging.

The closed block, inline, navigation, and raster-resource values contain no publisher HTML, DOM objects, paths, URLs, or eager resource bytes. The locator index preserves only shared-v1-valid unique source IDs, generates deterministic collision-free replacements, binds every start locator to exact book identity and spine identity, and counts legal text offsets by Unicode code point. The locator resolver requires full identity for exact results, rejects another book, and recovers through matching-spine anchor/offset adjustment, nearest non-empty spine, or book start with fixed content-free reasons. The separate package-private target index retains unique addressable source-fragment matches without exposing them in results; unresolved fragments recover only to the same spine document start, while invalid, unknown, non-spine, and empty targets remain unavailable. The desktop now connects the selection/read boundary to its package-level publication session and presents safe metadata/open outcomes, but saved-position persistence, semantic rendering, and application restoration do not work yet.

The implemented boundary uses exactly pinned `@zip.js/zip.js@2.8.30` and `saxes@6.0.0` behind package-internal adapters. The ZIP adapter imports the pure-JavaScript core, disables workers and native compression streams, and uses only in-memory readers/writers. The XML adapter emits bounded namespace-aware events without a DOM or resolver. Neither dependency is part of the public EPUB API, and no renderer-oriented EPUB framework has been added. Selection evidence, licenses, alternatives, and transitive impact are recorded in [`development/dependencies.md`](../development/dependencies.md).

## Shared contract authority

[ADR-0006](decisions/ADR-0006-json-schema-contract-authority.md) establishes checked-in JSON Schema Draft 2020-12 documents under `packages/shared` as the authority for serialized contract families. TypeScript wire DTOs are generated from those schemas, while Python and any future Rust consumer must validate or derive from the same schemas rather than maintain an independent authoritative model.

The same deterministic generator now emits committed typed standalone validators for every root contract family. Ajv is development-only: it compiles the canonical schemas during generation and independently checks serialized fixtures during tests, while production decoders import only the generated type guards. Generation rejects unexpected runtime helpers and dynamic code, fixture conformance compares generated and freshly compiled results, and the desktop build rejects any Ajv module or runtime code-generation expression before producing an asset.

Schema-family versions govern persisted or cross-process payload shapes and remain separate from the future process transport version. Runtime decoding occurs at persistence and process trust boundaries before data can affect domain or playback state. Transport selection remains deferred until its planned prototype and ADR.

The implemented book v1 boundary validates raw input against its canonical Draft 2020-12 schema with offline-registered references, then constructs branded domain values and checks relationships that the schema cannot express directly. Validation errors distinguish malformed input from unsupported versions without including book metadata or raw values.

The implemented locator v1 boundary identifies an opaque book, spine item, versioned `element-id` anchor, structural anchor index, and Unicode-code-point text offset. Optional progression is recovery metadata rather than the position authority. Locator ranges order positions by spine index, anchor index, and text offset and reject cross-book ranges. The package-internal EPUB resolver now validates these fields against sanitized semantic content and returns a canonical index-derived locator; persistence and application-level restoration remain later responsibilities.

The implemented persisted-reading-state v1 boundary stores one opaque book identity, its authoritative logical locator, and a closed minimal preferences object. The decoder requires the root and locator book identities to match. Preferences may retain an opaque local voice identifier and a positive requested playback-rate multiplier; later capability and reader layers decide which values are available. The contract contains no storage path, book prose, generated audio, model data, rendered page authority, display settings, timestamps, or persistence-engine behavior. ADR-0011 keeps display preferences in a separate app-local envelope and assigns storage/migration ownership to the desktop without changing this shared contract.

The implemented reading-session v1 boundary binds a book identity to one opaque session ID and its active opaque generation ID. Future work envelopes carry that session/generation identity and use a pure classifier to accept only the active pair; a replaced or absent session yields `stale-session`, while an earlier generation in the same session yields `stale-generation`. A cancellation intent identifies the generation to request cancellation for, but does not itself accept or reject late work: replacing the active pair remains the deterministic stale-result safeguard.

The implemented narration-segment v1 boundary joins one stable segment ID, zero-based sequence, book identity, source locator range, and session/generation work identity with sensitive narration text. Its decoder verifies that the claimed book identity matches the locator range and rejects invalid range order or unsupported nested versions. Narration text is process-local sensitive data: it must not enter errors, metrics, persisted state, or debug snapshots. The contract intentionally does not choose text normalization, language, prosody, or chunk-sizing rules; later EPUB and scheduling work will supply those policies.

The implemented operational-error v1 boundary carries only a stable machine-readable code, its fixed category, and fixed `recoverable` or `fatal` severity. The decoder rejects inconsistent code/category/severity combinations. It intentionally has no free-form message, details, stack, path, content, audio, or implementation-data field; presentation layers must map known codes to safe localized messages. V1 codes and fields are closed, so unknown values fail rather than being interpreted or retained, and any future addition requires a new schema-family version.

The implemented capability-report v1 boundary requires explicit `supported`, `unsupported`, or `unknown` status for local speech generation, streaming generation, generation cancellation, generic hardware acceleration, and CPU fallback. `unknown` is not support. The report identifies no engine, model, device, vendor, path, benchmark, or hardware profile and therefore makes no specific compatibility or performance claim. Its closed required feature set follows the same explicit-version policy: future features require a new report version rather than silent field acceptance.

The implemented audio-frame v1 boundary describes payload-free in-memory frame metadata with frame, session, generation, and narration-segment identities; monotonic sequence; positive sample rate, per-channel sample-frame count, and channel count; and an explicit end-of-segment marker. Duration is derived from sample count divided by sample rate. Public helpers return conservative whole milliseconds using exact integer arithmetic, sum samples before truncating once, and reject unsafe duration overflow. Contiguous single-segment runs reject duplicate frame IDs, sequence gaps or reversals, identity or format changes, and frames after the segment-end marker. The contract selects no codec, payload representation, audio API, player, or buffer policy.

The implemented buffer-status v1 boundary is a payload-free snapshot for one session and generation. It carries contiguous playable duration, nonnegative ordered low-water/target/maximum duration thresholds, an underrun count, and only the currently justified `empty`, `buffering`, `ready`, `playing`, and `paused` states. It rejects duration above the configured maximum and state/depth contradictions. A zero-depth exhausted buffer is represented as `buffering`, as required by the MVP; no end-of-stream state, fixed wall-clock wait, queue, ring buffer, startup gate, or playback behavior is selected by this contract.
