# Architecture overview

## Status

Mixed implementation status. The Milestone 3 secure EPUB ingestion boundary and framework-independent document model are implemented and validated. The desktop connects its capability-free local-file selection/read boundary to a UI-independent publication-session owner, presents one accessible idle/opening/ready/empty/failure/closing lifecycle surface, contains presentation failures, and renders the active spine document's supported text plus bounded static raster images through an exhaustive application-owned semantic React reader. Its continuous responsive layout, closed display preferences, bounded incremental large-chapter policy, passive logical-position tracking, viewport/preference reflow preservation, versioned bounded local reader-state repository, lifecycle-aware save coordinator, and exact/nearest-valid open restoration are implemented without publisher styling. A user can open, read, navigate, adjust the visual reader without losing the active logical passage, and explicitly close a supported publication; validated position and preference changes are saved locally on the approved bounded lifecycle and restored after exact-file reselection. Milestone 4 documentation, packaged-native file-open matrix, final validation, and pull-request CI are complete. Narration preparation, TTS integration, buffering, and playback require their own implementation evidence. The Python area remains a foundation only.

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
├── Versioned bounded Web Storage repository [implemented]
├── Semantic React text/static-raster renderer [implemented]
├── Reader navigation and in-memory logical-position/reflow coordinator [implemented]
├── Audio player and bounded playback buffer [planned]
└── Local TTS process client [planned]

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

[ADR-0008](decisions/ADR-0008-visual-reader-architecture.md) accepts a direct application-DOM reader built from the closed `@voxleaf/epub` semantic model. The implemented initial mode is continuous vertical scrolling over one active spine document. The desktop coordinator owns the active document/locator, explicit table-of-contents, internal-link and previous/next navigation, the closed current display preferences and pre-change preference-reflow intents, package-normalized passive visible-location updates from the application reading line, bounded capture/restore transactions across viewport and preference reflow, saved-position restoration before ready settlement, and content-free save intents routed to the application-owned persistence coordinator. Leaf presentation components do not own publication lifecycle or storage. Publisher HTML/CSS/scripts/URLs do not cross into the renderer, and no iframe or browser route/history integration is part of the initial reader.

The visual position is a normalized `ReadingLocatorV1` sampled at an application-owned reading line. A browser caret/range supplies the Unicode-code-point offset when safe, with deterministic block-start fallback. Explicit navigation may move focus to a destination heading/reader region, while passive scrolling, reflow, and initial restoration do not steal focus.

File ingress is resolved by ADR-0009, ADR-0010 resolves the bounded static-raster boundary, and ADR-0011 resolves the bounded Web Storage, save-lifecycle, and restore policy now implemented behind the asynchronous desktop repository plus application-owned save and restore coordinators. Playwright Chromium supplies deterministic layout evidence while native WebView2 remains a separate Windows matrix. The desktop publication lifecycle, semantic text/image renderer, navigation, closed display preferences, large-chapter scheduler, semantic DOM range mapper, active visual-locator tracker, reflow restorer, versioned reader-state repository, bounded save scheduler, and exact/nearest-valid open restoration are implemented.

The visual tracker measures registered application elements at a fixed reading line, maps safe browser caret geometry through the semantic range mapper, and normalizes candidates through `OpenedPublication.resolveLocator`. Task 4.3 adds a publication-scoped reflow transaction: it captures and re-normalizes the current locator, suspends passive sampling, coalesces superseding preference/viewport changes, waits for two stable animation frames without a fixed delay, and aligns the exact range or block-start fallback to the 24-pixel reading line. Missing DOM targets stop after twelve frames; explicit navigation, root replacement, and close cancel stale work. A resize notification received while a transaction is active does not replace that transaction because each frame already remeasures current viewport geometry; this preserves the original preference/restoration settlement reason under WebView2. Successful restoration seeds the tracker and resumes without an immediate line-start sample that could replace the preserved code-point merely because wrapping changed. The transaction never changes focus, storage, URLs/history, or publication content. Task 4.5 observes only its content-free settled result: passive changes use a trailing 500 ms save, explicit navigation and settled preference reflow use an immediate coalesced save, and replacement/close/hidden/`pagehide` flush the latest already validated locator. Task 4.6 reads global preferences once per application owner and the position for each ready exact-byte identity, delegates exact or nearest-valid recovery to `OpenedPublication.resolveLocator`, activates the resolved spine document, and holds the restore state busy until the destination range is materialized and aligned. Missing, malformed, unsupported, oversized, unavailable, wrong-identity, or unresolved state starts at the first canonical locator with fixed content-free status; recovered state is rewritten only after visual settlement. Startup restoration does not move focus. Synchronization with narration remains later work.

The desktop application and TTS inference should run in separate local processes.

Reasons:

- Python has the strongest ecosystem for candidate models.
- A process boundary isolates model failures and GPU memory.
- The desktop UI should remain responsive during inference.
- The service can expose explicit cancellation and health state.

The protocol may use Tauri IPC, standard input/output, a local socket, or loopback WebSocket. The final choice requires an ADR after a small prototype.

## Core data flow

The public EPUB package currently implements the in-memory validation, parsing, semantic projection, resource-descriptor, locator, and target-resolution portions of this flow. The desktop file-open coordinator passes one bounded local-file read to the publication-session module, which owns cancellation, replacement, late-result rejection, and publication cleanup. A separate application lifecycle controller exposes only immutable idle/opening/ready/empty/failure/closing states, clears the prior publication reference before non-ready states, and maps zero located blocks to the recoverable empty state. In ready state, the restore coordinator first reads validated app-global display preferences and exact-identity position state. The production reader activates the exact/recovered spine document or first canonical located block, lazily renders its admitted local static raster images, materializes and aligns a restored semantic range before settlement, can replace the document through package-resolved TOC, internal-link, and chapter-step navigation, applies validated preferences through application-owned CSS, maintains content-free located-block/DOM-range associations, updates its canonical in-memory locator from settled passive viewport geometry, and restores that locator after viewport or preference reflow. The application save coordinator accepts only locators that resolve exactly back to themselves through the active publication, bounds passive writes with a trailing timer, coalesces immediate position/preference saves, serializes each latest-only write stream, and flushes before close/replacement and on hidden/`pagehide` lifecycle signals without awaiting storage before publication cleanup. The repository atomically replaces validated bounded envelopes; narration preparation, synthesis, buffering, and playback remain planned.

1. **Implemented:** Validate the selected EPUB as an untrusted archive.
2. **Implemented:** Parse metadata, navigation, and spine order.
3. **Implemented:** Resolve the saved logical reading locator, or use the beginning of a new book.
4. **Implemented:** Select the already-sanitized semantic spine document for application-owned rendering.
5. **Implemented:** Reconstruct the visible passage from the locator and current scrolling layout.
6. **Planned:** Derive narration text from the same logical location while retaining paragraph and dialogue boundaries.
7. **Planned:** Create bounded chunks tagged with their source locators.
8. **Planned:** Attach chunks to a unique reading session.
9. **Planned:** Generate approximately 15 seconds of playable audio, then start playback immediately when that media-duration threshold is met.
10. **Planned:** Generate later audio while the player consumes buffered frames and the renderer keeps the narrated passage visible.
11. **Planned:** Discard played frames and stale session work.
12. **Implemented for reader state:** Persist the logical reading locator, not a rendered page number or generated audio. Generated-audio persistence remains prohibited future behavior unless a separate product/privacy decision approves it.

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
- `apps/desktop` declares `@voxleaf/epub` and `@voxleaf/shared` directly. The publication-session module owns the EPUB opener; reader modules consume only public semantic/publication types and package resolution operations; persistence modules consume shared locator/state types and the strict shared persisted-state decoder.
- EPUB parsing must not depend on the desktop framework.
- `@voxleaf/epub` consumes shared book and locator contracts only through the public `@voxleaf/shared` workspace package boundary; `@voxleaf/shared` has no reverse EPUB dependency.
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

Schema-family versions govern persisted or cross-process payload shapes and remain separate from the future process transport version. Runtime decoding occurs at persistence and process trust boundaries before data can affect domain or playback state. Transport selection remains deferred until its planned prototype and ADR.

The implemented book v1 boundary validates raw input against its canonical Draft 2020-12 schema with offline-registered references, then constructs branded domain values and checks relationships that the schema cannot express directly. Validation errors distinguish malformed input from unsupported versions without including book metadata or raw values.

The implemented locator v1 boundary identifies an opaque book, spine item, versioned `element-id` anchor, structural anchor index, and Unicode-code-point text offset. Optional progression is recovery metadata rather than the position authority. Locator ranges order positions by spine index, anchor index, and text offset and reject cross-book ranges. The package-internal EPUB resolver validates these fields against sanitized semantic content and returns a canonical index-derived locator; the desktop persists only canonical exact-book values and uses that same resolver for exact or nearest-valid application restoration.

The implemented persisted-reading-state v1 boundary stores one opaque book identity, its authoritative logical locator, and a closed minimal preferences object. The decoder requires the root and locator book identities to match. Preferences may retain an opaque local voice identifier and a positive requested playback-rate multiplier; later capability and reader layers decide which values are available. The contract contains no storage path, book prose, generated audio, model data, rendered page authority, display settings, timestamps, or persistence-engine behavior. ADR-0011 keeps display preferences in a separate app-local envelope and assigns storage/migration ownership to the desktop without changing this shared contract.

The implemented reading-session v1 boundary binds a book identity to one opaque session ID and its active opaque generation ID. Future work envelopes carry that session/generation identity and use a pure classifier to accept only the active pair; a replaced or absent session yields `stale-session`, while an earlier generation in the same session yields `stale-generation`. A cancellation intent identifies the generation to request cancellation for, but does not itself accept or reject late work: replacing the active pair remains the deterministic stale-result safeguard.

The implemented narration-segment v1 boundary joins one stable segment ID, zero-based sequence, book identity, source locator range, and session/generation work identity with sensitive narration text. Its decoder verifies that the claimed book identity matches the locator range and rejects invalid range order or unsupported nested versions. Narration text is process-local sensitive data: it must not enter errors, metrics, persisted state, or debug snapshots. The contract intentionally does not choose text normalization, language, prosody, or chunk-sizing rules; later EPUB and scheduling work will supply those policies.

The implemented operational-error v1 boundary carries only a stable machine-readable code, its fixed category, and fixed `recoverable` or `fatal` severity. The decoder rejects inconsistent code/category/severity combinations. It intentionally has no free-form message, details, stack, path, content, audio, or implementation-data field; presentation layers must map known codes to safe localized messages. V1 codes and fields are closed, so unknown values fail rather than being interpreted or retained, and any future addition requires a new schema-family version.

The implemented capability-report v1 boundary requires explicit `supported`, `unsupported`, or `unknown` status for local speech generation, streaming generation, generation cancellation, generic hardware acceleration, and CPU fallback. `unknown` is not support. The report identifies no engine, model, device, vendor, path, benchmark, or hardware profile and therefore makes no specific compatibility or performance claim. Its closed required feature set follows the same explicit-version policy: future features require a new report version rather than silent field acceptance.

The implemented audio-frame v1 boundary describes payload-free in-memory frame metadata with frame, session, generation, and narration-segment identities; monotonic sequence; positive sample rate, per-channel sample-frame count, and channel count; and an explicit end-of-segment marker. Duration is derived from sample count divided by sample rate. Public helpers return conservative whole milliseconds using exact integer arithmetic, sum samples before truncating once, and reject unsafe duration overflow. Contiguous single-segment runs reject duplicate frame IDs, sequence gaps or reversals, identity or format changes, and frames after the segment-end marker. The contract selects no codec, payload representation, audio API, player, or buffer policy.

The implemented buffer-status v1 boundary is a payload-free snapshot for one session and generation. It carries contiguous playable duration, nonnegative ordered low-water/target/maximum duration thresholds, an underrun count, and only the currently justified `empty`, `buffering`, `ready`, `playing`, and `paused` states. It rejects duration above the configured maximum and state/depth contradictions. A zero-depth exhausted buffer is represented as `buffering`, as required by the MVP; no end-of-stream state, fixed wall-clock wait, queue, ring buffer, startup gate, or playback behavior is selected by this contract.
