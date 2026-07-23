# ADR-0008: Render the visual reader from semantic values in the application DOM

## Status

Accepted.

## Context

Roadmap Milestone 4 must turn an opened EPUB publication into an accessible reflowable reader while preserving one stable logical reading position. The decision must not weaken the security and privacy boundary established by [ADR-0007](ADR-0007-secure-epub-ingestion-boundary.md) or replace the locator authority established by [ADR-0003](ADR-0003-stable-reading-locators.md).

The implemented `@voxleaf/epub` package already projects untrusted XHTML into closed immutable semantic values. It returns headings, paragraphs, block quotes, lists, text, emphasis, strong text, code, line breaks, internal document targets, raster descriptors, located blocks, and exact/nearest locator resolution. It does not return publisher HTML, DOM nodes, CSS, scripts, event handlers, paths, activatable external URLs, or eager image bytes. Publisher source fragments are opaque matching data and are explicitly not renderer DOM identifiers.

At initial acceptance, the desktop was only a React/Vite foundation inside a Tauri shell, with no EPUB/shared-package dependency, reader, application router, file access, persistence adapter, native command, plugin, or capability. Raster decode, real-browser tooling, and reader performance limits were unresolved. ADR-0009, ADR-0010, ADR-0011, and the Task 1.5/1.6 amendments subsequently resolve those gates without making the production reader implemented.

Before implementing the reader, VoxLeaf must decide:

- whether semantic content renders directly in the application DOM, in a sandboxed iframe, or through another isolation boundary;
- whether the first reader scrolls, paginates, or supports both modes;
- which layer resolves detailed navigation/internal-link targets to locators;
- which visible passage becomes the active logical locator;
- how explicit navigation, passive scrolling, focus, keyboard behavior, and browser history interact; and
- where visual reading stops so narration and audio milestones remain separate.

## Decision

### Render closed semantic values directly in the application DOM

The desktop reader will use React to construct repository-owned semantic HTML elements directly in the application DOM from the closed `@voxleaf/epub` semantic model.

The semantic projection, not an iframe or HTML sanitizer in the desktop, remains the trust boundary. The renderer must:

- exhaustively map the closed block and inline unions to application-owned elements;
- preserve supported heading levels, paragraphs, block quotes, ordered/unordered lists, emphasis, strong text, code, line breaks, language, direction, and source order;
- use React text nodes for publication text;
- apply only application-owned classes, attributes, CSS, and bounded preference values;
- treat external-link descendants as inert content because no activatable external URL crosses ingestion; and
- treat publisher fragments only as inputs to package-owned target matching.

The reader must not use `dangerouslySetInnerHTML`, iframe `srcdoc`, `DOMParser`, reconstructed publisher HTML, publisher-controlled styles or event attributes, source fragments as DOM IDs, or publisher data as browser URLs. It must not spread untrusted semantic objects onto DOM elements.

A sandboxed iframe is not required because publisher markup, code, styles, and remote URLs do not cross the EPUB boundary. Adding an iframe would create focus, sizing, messaging, CSP, and assistive-technology boundaries without isolating executable publisher content that the model does not contain.

Raster image nodes remain application placeholders until the separate raster safety gate approves predecode limits, supported animation behavior, bounded concurrency, source representation, CSP, and release. This ADR does not approve browser image decoding or object URLs.

### Keep framework and lifecycle ownership in the desktop application

`@voxleaf/epub` remains framework-independent. It continues to own the implemented archive/content validation, semantic values, resource reads, locator indexes, and opened-publication lifecycle primitives, and it will own the approved but unimplemented detailed target matching. It does not acquire React, DOM, browser-storage, routing, Tauri, narration, TTS, or audio dependencies.

The desktop application will own one active publication session and one reader coordinator. The coordinator will own active document/locator state, explicit navigation intents, passive visible-location updates, reflow capture/restoration, and later persistence scheduling. It will call the public publication API and expose application-level state/actions to presentation components. Leaf UI components must not open/close publications, resolve publisher targets, or write persistence directly.

The semantic renderer may consume the public semantic and located-block types through the application reader boundary. It does not interpret archive paths, source markup, or package-internal sidecars.

### Use continuous vertical scrolling as the sole initial reading mode

The first reader will display one active spine document in continuous vertical scrolling mode. Native scrolling, browser zoom, viewport resizing, and application typography/content-width changes reflow that document.

Viewport pagination, columns, stable page numbers, a scrolling/pagination mode switch, and preference migration between modes are deferred. A rendered page remains only the visible portion of the scrolling viewport; it is never persisted or used as position authority.

The initial decision did not select the large-chapter batching/ceiling policy. The Task 1.6 amendment below now establishes measured rendering and memory bounds; it continues to prohibit synchronously rendering an ingestion-maximum chapter.

### Resolve semantic document targets inside `@voxleaf/epub`

The desktop must not match publisher fragments against DOM structure or infer target locators from document/block arrays. `@voxleaf/epub` will add a public, synchronous `resolveTarget(input, options?)` operation on `OpenedPublication`, implemented from the package-private document/source-ID/locator indexes.

The operation accepts an untrusted target-shaped input and optional `AbortSignal`, checks the publication lifecycle and cancellation at deterministic boundaries, and returns one frozen member of a closed `PublicationTargetResolution` union:

- `status: "exact"`, `reason: "fragment"` when a unique fragment identifies an addressable block in a spine document;
- `status: "exact"`, `reason: "document-start"` when a fragmentless spine-document target resolves to its first addressable block;
- `status: "recovered"`, `reason: "fragment-unresolved"` when a missing, duplicate, or non-addressable fragment falls back to the same spine document's first addressable block; or
- `status: "unavailable"` with `reason: "invalid-target"`, `"unknown-document"`, `"non-spine-document"`, or `"empty-document"` when no valid shared locator can represent the target.

Exact and recovered results carry the canonical `ReadingLocatorV1` and `PublicationLocatedBlock`. Unavailable results carry no publisher fragment, path, URL, prose, or fabricated locator. Target recovery never searches publication text and never jumps to another spine document. The target's document must remain the recovery boundary.

Malformed input, unknown documents, non-spine documents, and empty documents are normal closed unavailable outcomes. Caller cancellation and post-close/invariant failures continue through the package's existing fixed content-free failure boundary; raw exceptions and rejected values are not exposed. The operation adds no shared schema field or serialized contract version because semantic targets and target resolution remain in-memory `@voxleaf/epub` concepts.

Task 2.1 owns the exact TypeScript names, immutable construction, implementation, exports, tests, and any necessary ADR-0007 clarification while preserving these semantics.

### Represent the active visible passage with a structural locator and code-point offset

`ReadingLocatorV1` remains the sole position authority. The active visual locator uses the existing exact-byte book identity, spine ID/index, deterministic block anchor, and Unicode-code-point offset. It never persists a page number, `scrollTop`, pixel coordinate, viewport percentage, chapter percentage, DOM path, or text quotation as authority.

The scrolling reader will use one application-owned horizontal reading line at the start edge of the content viewport after persistent reader chrome. At a settled passive scroll/layout sample, the visible-location tracker will:

1. select the first visible addressable leaf block crossing the reading line;
2. use an approved browser caret/range API to map the point on that line to the semantic Unicode-code-point convention when the result belongs to that block;
3. fall back to the block's deterministic start locator when caret geometry is unavailable or ambiguous;
4. use the nearest visible addressable block in source order when no block crosses the line; and
5. normalize the candidate through `OpenedPublication.resolveLocator` before publishing it as active state.

Text, nested emphasis/strong/code, line breaks, and raster placeholders must follow the same code-point accounting already defined by ADR-0007. Structural block quotes/lists use offset zero while their addressable descendants own text offsets.

The exact layout inset, browser geometry adapter, observer scheduling, and real-browser test harness are implementation/evidence details, not persisted architecture. They must preserve the accepted reading-line and fallback semantics.

Before application-controlled typography/content-width changes, viewport reflow, or direct navigation, the coordinator captures and normalizes the active locator. After the target layout is committed, it reconstructs that locator's DOM range and aligns it to the reading line without smooth animation. Observer updates are suspended during programmatic restoration so transient geometry cannot replace the logical position.

### Keep navigation, focus, and history application-owned

Table-of-contents links, internal links, previous/next chapter controls, and direct locator restoration all use one reader-coordinator navigation operation. They resolve a canonical spine locator before changing the active document.

Navigation groups are labels rather than controls. A non-spine or unavailable target remains readable but inert/disabled with an accessible explanation. The reader does not fabricate a nearest spine target for it.

After an explicit user navigation, focus moves to the destination heading when one exists, otherwise to an application-owned focusable reader region. Passive scrolling, viewport reflow, and initial saved-position restoration do not move keyboard focus or an assistive-technology virtual cursor. Completion and recovery may be announced through a polite application status region without announcing publication prose.

Native Tab/Shift+Tab, Enter/Space control activation, scrolling keys, Page Up/Down, Home/End, and zoom behavior remain available. Global reader shortcuts are deferred until they have an explicit accessible interaction design and tests.

Reader navigation is internal application state. It does not call `history.pushState`, encode book identity or locators in routes/query/hash values, or use browser back/forward as chapter navigation. No router exists today. A future router integration requires a separate decision that preserves content-free URLs, publication lifecycle, focus behavior, and persistence.

### Keep Milestone 4 independent from narration and audio

This ADR defines only the visual active locator. It does not create narration segments, start TTS, control audio, highlight spoken content, follow playback, or decide how manual visual navigation interacts with active narration.

Later milestones must consume the same canonical logical locator rather than create a second visual/audio position. Roadmap Milestone 9 owns the interaction policy when passive/explicit visual navigation conflicts with narration following.

### Preserve the remaining Milestone 4 gates

This decision does not select or approve:

- local file selection, Tauri commands/plugins/capabilities, or retained file references;
- raster metadata parsing, decode limits, image source/CSP behavior, or object URLs;
- persistence technology, keyspace, display-preference schema, save debounce/lifecycle, or migration;
- real-browser/end-to-end test tooling or its dependency/CI behavior;
- reader latency, DOM-node, memory, image, or large-chapter thresholds; or
- narration, TTS, audio, highlighting, synchronization, or related dependencies.

Those choices remain assigned to later tasks in the active Milestone 4 ExecPlan or later roadmap milestones.

### Apply the Task 1.6 measured large-chapter amendment

Task 1.5 subsequently established the Playwright Chromium harness, and Task 1.6 used it on documented native Windows hardware to resolve the reader latency, live-DOM, raster, and memory gate. The accepted implementation policy is:

- render one active spine document incrementally in batches of at most 250 semantic blocks and yield to the browser between batches;
- preflight both semantic-block count and projected DOM-node count;
- admit at most 10,000 semantic blocks and 80,000 projected live DOM nodes;
- return the fixed recoverable `chapter-too-large` presentation before partial rendering at 10,001 blocks or 80,001 projected nodes, preserving the last valid locator;
- retain ADR-0010's one-concurrent-decode, eight-live-source, and 16,777,216-live-pixel raster limits; and
- defer general virtualization because the bounded incremental profile met the accepted reference gates without introducing accessibility, focus, find-in-page, or locator-restoration discontinuities.

At the exact block limit, the synthetic incremental profile produced first useful content in 9.7 ms, rendered a deep target in 587.8 ms, completed in 654.3 ms, used at most 12.8 ms of script work per batch, reflowed in 132.5 ms, retained 78,123 DOM nodes, and increased Chromium working set by 111.8 MiB. The combined exact block/eight-image profile increased working set by 174.8 MiB. The accepted reference ceilings are respectively 50 ms, 1,000 ms, 1,000 ms, 16 ms, 250 ms, 80,000 nodes, 144 MiB DOM-only working-set growth, and 208 MiB combined growth. Complete synchronous rendering is rejected because the same 10,000-block fixture occupied 124.3 ms in one script operation. The detailed host, stress cases, image results, command, limitations, and future revalidation ownership are recorded in [`performance-budget.md`](../performance-budget.md#visual-reader-reference-limits).

These are implementation acceptance gates on the documented reference host, not proof of a production reader or a universal hardware guarantee. File-open, real React commit, locator restoration, and native WebView2 timings remain owned by later implementation/performance tasks. Task 1.6 adds only test configuration, a synthetic benchmark harness, commands, and documentation; it adds no production renderer, public contract, runtime dependency, native capability, persistence, network access, or narration/audio behavior.

## Consequences

- The renderer has a narrow auditable input: closed semantic values rather than publisher markup.
- Semantic HTML, keyboard focus, screen-reader landmarks, reflow, and application styling stay in one DOM instead of crossing an iframe boundary.
- Direct DOM rendering is safe only while the EPUB semantic model remains closed and the renderer remains exhaustive; adding a new semantic node requires renderer and security review.
- Publisher styling fidelity remains intentionally limited. The application cannot reproduce CSS-derived layout/visibility that ADR-0007 discards.
- The initial reader has one interaction model and does not need pagination algorithms or mode migration.
- `@voxleaf/epub` gains one approved public in-memory operation and remains the sole owner of source-fragment matching. Task 2.1 must implement and test it before target navigation is usable.
- Non-spine documents and unresolved/ambiguous fragments may remain unavailable or recover only to the target spine document's beginning. This is safer than fabricating cross-document navigation but may make some publication notes inaccessible in the MVP.
- Code-point position reconstruction requires a tested semantic-to-DOM mapping and real-browser geometry adapter. Block-start fallback keeps restoration deterministic when caret APIs differ.
- Passive scrolling and reflow cannot steal focus; explicit navigation has one predictable focus destination.
- Browser URLs and history contain no book identity, locator, fragment, or content.
- No application behavior is implemented by accepting this ADR. The desktop remains a foundation shell until later tasks add and validate the approved boundaries.
- This decision and its amendments add no dependency, shared schema change, generated file, native permission, production application code, storage, network, TTS, or audio capability.

## Alternatives considered

### Render application-owned markup in a sandboxed iframe

Rejected for the initial reader. The semantic model contains no executable publisher markup, so an iframe would not isolate an additional publisher-code boundary. It would add cross-document focus, sizing, accessibility, selection, observation, target-navigation, and CSP complexity.

### Sanitize and render publisher HTML

Rejected because ADR-0007 deliberately prevents publisher markup from becoming trusted output. Reintroducing it would create a second sanitizer/configuration boundary, broaden attributes/styles/URL handling, and make security depend on browser HTML behavior that the semantic model currently avoids.

### Support pagination or both scrolling and pagination initially

Rejected for Milestone 4. Pagination adds viewport measurement, columns/pages, keyboard behavior, restoration timing, and preference migration before the continuous reader is proven. It also increases the temptation to treat a rendered page as durable progress.

### Persist only a block start, chapter percentage, pixel position, or page number

Rejected as the primary active position. Block-start-only loses passage precision, while percentages/pixels/pages change under reflow. The accepted locator plus code-point offset preserves structural identity and uses a deterministic block-start fallback when browser geometry cannot provide precision.

### Resolve source fragments in the desktop renderer

Rejected because publisher fragments are package-owned matching data, not DOM IDs. The desktop lacks the private source-ID sidecar and would duplicate parsing/ambiguity rules or infer from unsafe renderer details.

### Replace every semantic target with a locator during ingestion

Rejected because detailed navigation/internal links naturally identify documents/fragments, including non-spine or unavailable targets that `ReadingLocatorV1` cannot represent. A resolver preserves the model and makes availability explicit without changing shared schemas.

### Integrate reader navigation with browser routes/history

Rejected for the initial reader because no application router exists and publication/locator data must not leak into URLs. Internal coordinator state provides the required navigation without defining a premature routing contract.
