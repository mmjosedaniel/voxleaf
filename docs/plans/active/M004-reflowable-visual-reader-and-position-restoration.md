# Deliver the reflowable visual reader and position restoration

## Goal

Complete roadmap Milestone 4 by turning the implemented, framework-independent EPUB publication model into a safe, accessible, reflowable desktop reading experience that can reopen an exact-byte-identical book at the same logical passage or the nearest valid passage.

This plan covers only visual reading, local file ingress, reader preferences, logical-position ownership, and local position persistence/restoration. It preserves the EPUB ingestion boundary from Milestone 3 and deliberately excludes narration preparation, TTS, audio playback, speech highlighting, and audio-position synchronization.

## User-visible outcome

- A user can select a supported local EPUB, see its title and authors, browse its hierarchical table of contents, and read its supported text structure and safely decoded local raster images.
- The initial reader uses one approved reflowable reading mode. The proposed default is continuous vertical scrolling; pagination is not implemented unless the decision gate below replaces that recommendation.
- The user can adjust a bounded initial set of typography and theme preferences without losing the logical reading passage.
- Keyboard and assistive-technology users can operate the open, table-of-contents, chapter, and reader-preference controls with visible focus and meaningful names.
- VoxLeaf saves a content-free `ReadingLocatorV1` locally and, after the user reselects the same exact-byte-identical book, restores that passage across book reopenings and application restarts.
- Missing, malformed, stale, or no-longer-exact saved positions recover to the nearest valid locator or book start without exposing book content.
- Invalid EPUBs, unsupported content, image failures, persistence failures, and rendering failures produce bounded, understandable, recoverable states.

## Background and current state

At plan creation on 2026-07-22, `main` is clean at `c386644` and roadmap Milestones 1 through 3 are complete.

Implemented prerequisites are:

- `apps/desktop` is a minimal React 19, Vite 8, and Tauri 2 shell with jsdom component testing. It has no reader, router, EPUB dependency, shared-contract dependency, persistence adapter, native commands, plugins, or granted Tauri capabilities.
- `packages/shared` owns versioned `BookV1`, `ReadingLocatorV1`, `LocatorRangeV1`, `PersistedReadingStateV1`, and `OperationalErrorV1` schemas and runtime decoders. `PersistedReadingStateV1` stores a book identity, authoritative locator, and optional voice/playback preferences; it does not select a storage backend or represent display preferences.
- `packages/epub` implements bounded in-memory EPUB 3 reflowable ingestion through `openEpubPublication(bytes, { signal? })`. A successful `OpenedPublication` exposes immutable metadata, semantic documents, hierarchical navigation, lazy local raster reads, located blocks, exact/nearest locator resolution, and explicit close.
- The semantic model is a closed union of headings, paragraphs, block quotes, lists, text, emphasis, strong text, code, line breaks, internal links, and raster-image references. It exposes no publisher HTML, CSS, scripts, DOM nodes, paths, or activatable external URLs.
- Book identity is SHA-256 over the exact input bytes. Every addressable semantic block has a deterministic `ReadingLocatorV1`; text offsets count Unicode code points and are independent of viewport layout.
- Milestone 3 provides deterministic in-memory EPUB builders and 360 EPUB tests covering public ingestion, semantics, resources, locators, failures, and security boundaries.

Not implemented are:

- transfer of the implemented local-file probe's successful bytes into `@voxleaf/epub` and ownership of the resulting publication session;
- ownership of an opened publication in the desktop application;
- visual semantic rendering, raster decoding, chapter navigation, reader preferences, and large-chapter rendering policy;
- an authoritative visible-position tracker or DOM-to-locator mapping;
- local storage, save lifecycle, restoration, or persisted-state migration;
- a real-browser layout/end-to-end test harness;
- product-level reader accessibility and performance evidence.

The older [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md) intentionally spans several roadmap milestones. This milestone-specific plan is the implementation authority for roadmap Milestone 4. The older plan remains context for later synchronization and audio work and must not broaden this plan's scope.

## Readiness assessment

Milestone 4 is ready to begin its decision and prototype phase. Milestone 3 provides the required safe document model, resource handle, stable locators, and deterministic fixtures, and no incomplete earlier milestone blocks planning or prototypes.

It is not ready to begin production reader rendering until the approval gates in this plan are closed. In particular:

| Prerequisite | State | Evidence or required action |
| --- | --- | --- |
| Desktop/webview foundation | Ready | React/Vite/Tauri shell builds and tests; native capabilities are empty. |
| Safe semantic content | Ready | `@voxleaf/epub` returns a closed immutable semantic model rather than publisher markup. |
| Stable position contract | Ready | ADR-0003, `ReadingLocatorV1`, located blocks, and exact/nearest resolution are implemented. |
| Deterministic EPUB fixtures | Ready | The Milestone 3 in-memory fixture builder and public ingestion matrix exist. |
| Rendering/isolation policy | Approved, not implemented | ADR-0008 selects direct React rendering of closed semantic values in the application DOM and prohibits raw publisher markup. |
| File-ingress boundary | Approved; probe implemented | ADR-0009 accepts the native-validated WebView file input and abortable bounded browser read with no Tauri command/plugin/capability. Tasks 2.2-2.3 still own publication integration. |
| Raster decode safety | Prototype and approval required | Byte signatures are validated, but pixel dimensions, frame/animation behavior, decode memory, object URLs, and CSP are unresolved. |
| Navigation-target resolution | Approved, not implemented | ADR-0008 assigns source-fragment matching to a new closed `@voxleaf/epub` target resolver; Task 2.1 must implement it. |
| Persistence and migration | Approved, not implemented | ADR-0011 selects two bounded Web Storage envelopes, app-local display preferences, a 500 ms passive-save debounce, content-free failures, exact-identity restoration, and desktop-owned migration. |
| Layout/end-to-end testing | Dependency decision required | jsdom cannot prove scrolling, browser geometry, reflow, or restoration across viewports. |
| Large-chapter policy and reader latency budgets | Measurement required | Ingestion allows far more blocks than the desktop should put in the DOM without a measured bound. |

No task may assume one of the remaining unresolved choices. The responsible gate task must record approval, alternatives, evidence, and any ADR or dependency change first. Decisions accepted by ADR-0008 may be implemented only by their assigned later tasks and are not evidence that reader behavior works.

## Scope

- Select a local EPUB in the desktop application and supply only its in-memory bytes to `@voxleaf/epub`.
- Own one active `OpenedPublication`, including cancellation, replacement, and close.
- Present title, authors, table of contents, chapter controls, and supported semantic content.
- Render only repository-owned React elements from the semantic model through an approved isolation boundary.
- Decode and display local raster images only after renderer-specific limits and lifecycle behavior are approved and tested.
- Provide one initial reflowable reading mode and a bounded initial set of reader preferences.
- Represent the visible position with `ReadingLocatorV1`, including a Unicode-code-point offset when the browser can determine it safely and a deterministic block-start fallback.
- Preserve the locator while the viewport and typography reflow.
- Persist and restore content-free reading state by exact book identity.
- Handle table-of-contents links, internal links, next/previous chapter movement, and direct locator restoration.
- Provide keyboard operation, focus management, semantic HTML, screen-reader labels/status, visible focus, reduced-motion behavior, and zoom/narrow-window support.
- Add deterministic unit, component, package-integration, real-browser layout, accessibility, security-regression, and performance coverage.
- Extend only synthetic, repository-authored fixture infrastructure needed by this milestone.
- Document accepted architecture, dependencies, limits, behavior, and validation evidence.

## Non-goals

- Narration normalization, segmentation, TTS model/service work, audio buffering/playback, speech highlighting, read-along following, or visual/audio position synchronization.
- EPUB 2/NCX, fixed-layout, DRM-protected, scripted, remote-dependent, SVG-dependent, MathML-dependent, media-overlay, or interactive publications beyond ADR-0007's implemented support profile.
- Returning or rendering publisher HTML, publisher CSS, fonts, scripts, event handlers, source DOM IDs, or external URLs.
- Pixel-perfect reproduction of publisher styling.
- Multiple reading modes in the initial implementation. Pagination is deferred if continuous scrolling is approved.
- Stable rendered page numbers, page-number persistence, or viewport-specific offsets as position authority.
- Changing to EPUB CFI. `ReadingLocatorV1` remains authoritative unless a separately approved, versioned contract decision replaces it.
- A book library, search, bookmarks, annotations, cloud synchronization, automatic path-based reopening, or persistence of full text/images.
- Custom font uploads, arbitrary colors, publisher-theme overrides, hyphenation controls, text justification controls, multi-column layout, or per-book style profiles.
- Automatic browser-history or URL-route entries for reader navigation when no application router exists.
- Opening external links. ADR-0007 intentionally removes activatable external URLs; their labels remain inert text.
- Silently changing an existing shared schema. A proven incompatible need requires an explicit new contract version and plan amendment.

## Definitions and terminology

- **Semantic document:** An immutable, sanitized, framework-independent XHTML projection returned by `@voxleaf/epub`.
- **Located block:** A semantic block paired with its deterministic start locator and legal Unicode-code-point offset range.
- **Reading locator:** `ReadingLocatorV1`, the content-free, layout-independent authority for a book position.
- **Active visual locator:** The normalized locator representing the passage at the reader's approved viewport reading line.
- **Reading line:** A fixed logical line near the top of the scroll viewport used to select the visible passage; its exact geometry must be approved and tested rather than persisted.
- **Exact restoration:** Resolution of the complete persisted book/spine/anchor/offset tuple.
- **Recovered restoration:** Resolution to a safe nearest offset, anchor, spine, or book start through `OpenedPublication.resolveLocator`.
- **Reader preferences:** Display-only choices such as text scale, line spacing, content width, and theme. They are not narration preferences.
- **Publication session:** Application ownership of one selected file's open/cancel/ready/error/close lifecycle. It is not the later TTS `ReadingSessionV1` runtime.
- **Content-free state:** Structural IDs, indices, versions, and preferences that contain no title, author, prose, markup, image bytes, path, or URL.
- **Direct target:** A detailed table-of-contents or internal-link `SemanticDocumentTarget` that must be converted to a supported spine locator before navigation.

## Relevant files and documentation

- `AGENTS.md` and `.agents/PLANS.md`
- `README.md` and `docs/README.md`
- `docs/plans/roadmap.md`
- `docs/plans/completed/M002-shared-contracts-and-test-harness.md`
- `docs/plans/completed/M003-secure-epub-ingestion-and-document-model.md`
- `docs/plans/active/synchronized-reader-and-startup-buffer.md`
- `docs/product/vision.md`, `project-brief.md`, `mvp.md`, and `glossary.md`
- `docs/architecture/system-diagram.md`, `overview.md`, and `performance-budget.md`
- ADR-0001, ADR-0003, ADR-0005, ADR-0006, and ADR-0007
- `docs/development/setup.md`, `testing.md`, `dependencies.md`, and `git-workflow.md`
- root `package.json`, `pnpm-workspace.yaml`, lockfiles, TypeScript configuration, and CI configuration
- `apps/desktop/package.json`, `src`, `vite.config.ts`, `src-tauri`, Tauri CSP/configuration, and desktop tests
- `packages/shared` book, locator, persisted-state, error, decoder, schema, fixture, and test-support areas
- `packages/epub` public opener/result/model/resource/locator areas, integration tests, and `test-support/epub-fixture.ts`

## Dependencies and prerequisites

### Completed prerequisites

- The pnpm workspace, TypeScript/Rust/Python checks, native Windows build, and portable CI are established.
- React/Vite/Tauri are accepted for the desktop foundation by ADR-0001 and ADR-0005.
- Shared contract authority and compatibility rules are accepted by ADR-0006.
- Stable structural locators are accepted by ADR-0003 and implemented by Milestone 3.
- The secure EPUB support profile, semantic model, resource policy, privacy boundary, and deferred renderer limits are accepted by ADR-0007.
- Deterministic semantic, resource, locator, malformed-input, and boundary fixtures exist.

### Prerequisite ordering

- All production rendering depends on the rendering/isolation decision.
- Raster display depends on byte-to-pixel safety limits and object-URL/CSP policy; signature validation alone is insufficient.
- Table-of-contents and internal-link activation depends on an approved target-to-locator API and implementation.
- Persistence implementation depends on the backend/envelope/migration decision.
- Restoration and reflow tests depend on a real-browser test tool; jsdom-only evidence is insufficient.
- Large-chapter rendering depends on measured DOM/memory/latency limits.
- Final closeout depends on native Windows validation because WSL/Ubuntu cannot prove Tauri/WebView persistence, file input, focus, or viewport behavior.

### Dependency policy

The preferred design adds no production renderer framework, HTML sanitizer, state-management library, router, or persistence library. React should render the existing closed semantic values, and repository-owned adapters should own position and storage behavior.

Any proposed Tauri plugin, image parser/decoder, browser automation tool, accessibility tool, or other direct dependency requires:

- a focused executable probe or test;
- exact version and lock review;
- purpose, alternatives, runtime/development classification, license, capability, network, and bundle-impact documentation;
- removal of rejected candidate code; and
- updates to `docs/development/dependencies.md` before acceptance.

## Architecture and constraints

The intended dependency and ownership flow is:

```text
local file selection
    -> caller-owned Uint8Array
    -> @voxleaf/epub openEpubPublication
    -> one application-owned OpenedPublication
    -> reader coordinator
       -> semantic React renderer
       -> navigation/locator mapper
       -> visible-location tracker
       -> versioned local position repository
```

The following invariants apply regardless of the selected implementation details:

- `@voxleaf/epub` remains independent of React, Tauri, browser storage, routing, TTS, and audio.
- `@voxleaf/shared` remains the authority for serialized locators and persisted reading state.
- The desktop owns viewport layout, focus, preferences, save timing, and storage technology.
- The application never reconstructs publisher HTML and never uses `dangerouslySetInnerHTML`, `srcdoc`, or publisher-controlled DOM IDs.
- Source fragments are matching data for the EPUB layer, not DOM IDs or URLs.
- No normal reader action performs a network request.
- The application stores no EPUB bytes, extracted prose, markup, raster bytes, Blob/object URLs, title, author, private path, or rendered page number as reading progress.
- Opening a replacement file aborts prior opening work and closes the prior publication before the replacement becomes active.
- Closing or replacing a publication revokes renderer-owned object URLs, cancels in-flight image reads, detaches observers, flushes the last valid locator when safe, and calls `OpenedPublication.close()` exactly once through an idempotent owner.
- Raw bytes and publication content stay out of React debug snapshots, errors, logs, metrics, and persisted state.
- Later narration/audio layers consume the same logical locator; they do not alter Milestone 4's renderer or persistence ownership.

## Technical decisions

### Decisions already approved

| Decision | Authority | Milestone 4 consequence |
| --- | --- | --- |
| Local-first Tauri desktop with React/Vite frontend | ADR-0001 and ADR-0005 | Build within the existing desktop shell and validate natively on Windows. |
| Logical locators, not page numbers, are position authority | ADR-0003 | Persist and restore `ReadingLocatorV1`; page/scroll geometry is transient. |
| JSON Schema and runtime decoders govern serialized contracts | ADR-0006 | Decode all storage input; do not hand-accept malformed local JSON. |
| EPUB input becomes a closed semantic model | ADR-0007 | Render semantic values, not publisher markup. |
| Publisher styles/fonts/scripts/remote resources are removed | ADR-0007 | Reader styling is application-owned; CSS-derived visibility remains a documented limitation. |
| External links expose only inert labels | ADR-0007 | No external-link activation or URL persistence is possible in this milestone. |
| Exact-byte SHA-256 identifies a book | ADR-0007 | A byte change creates a different persistence key and never silently inherits prior state. |
| Raster bytes are lazy, bounded, and signature checked but not decode-safe | ADR-0007 | Image display remains blocked until a renderer-specific decision is accepted. |
| Direct semantic DOM rendering, continuous scrolling, target resolution, and active visual locator behavior | ADR-0008 | Implement the accepted visual-reader boundary without treating it as current application behavior. |

### Decision status and explicit approval gates

Items accepted by ADR-0008 are implementation inputs, not completed features. Every item still marked **Approval required** must be accepted in the responsible gate task before dependent production work begins.

#### M4-D1: Rendering and isolation boundary — Accepted by ADR-0008

Options:

1. Render repository-owned React elements directly in the application DOM from closed semantic values.
2. Serialize application-owned markup into a sandboxed iframe.
3. Reintroduce sanitized publisher HTML into an iframe or application DOM.

Decision: option 1. ADR-0008 requires exhaustive application-owned React elements in the application DOM, prohibits raw/reconstructed publisher HTML and publisher-controlled DOM attributes/URLs, and keeps raster rendering blocked on M4-D4. A sandboxed iframe is rejected because executable publisher markup does not cross ADR-0007's semantic boundary and the extra document would add focus/accessibility/messaging complexity.

#### M4-D2: Local file ingress — Accepted by ADR-0009

Options:

1. Use an application-owned `<input type="file" accept=".epub,application/epub+zip">`, read `File.arrayBuffer()`, and pass a copied `Uint8Array` to `openEpubPublication`.
2. Add official Tauri dialog/filesystem plugins and narrowly scoped capabilities.
3. Add repository-owned Rust dialog/read commands.

Decision: option 1, using `FileReader.readAsArrayBuffer` rather than the uncancellable `File.arrayBuffer()` promise. ADR-0009 accepts the application-owned file input after native WebView2 proved selection, cancellation, same-file reselection, exactly 100 MiB, maximum plus one, fixed content-free states, cleared input, and no rendered filename. Replacement or unmount aborts the active browser read and request identity rejects stale completion. No Tauri path contract, plugin, Rust command, filesystem capability, dependency, CSP change, or persistence is added. Tasks 2.2-2.3 own publication-session and opener integration.

#### M4-D3: Initial reading mode — Accepted by ADR-0008

Decision: continuous vertical scrolling only over one active spine document. It preserves native keyboard/assistive-technology behavior and avoids making unstable page geometry authoritative. Pagination, multiple columns, stable page numbers, and mode migration are deferred.

#### M4-D4: Raster decode and object-URL safety — Accepted by ADR-0010

Options:

1. Render only an alternative-text placeholder in Milestone 4.
2. Add a narrow metadata parser that rejects dimensions, decoded pixels, animation/frame counts, and formats beyond accepted limits before browser decode.
3. Decode first with browser APIs and reject after observing dimensions.

Decision: option 2. ADR-0010 accepts a dependency-free desktop metadata gate for GIF, JPEG, PNG/APNG, and WebP followed by application-created Blob URL decode. The immutable maxima are 8,192 pixels on either axis, 16,777,216 decoded pixels, one static frame, one concurrent decode, eight live sources, and 16,777,216 aggregate live pixels. Animation is placeholder-only. Browser-observed dimensions must match preflight metadata; fixed failure/cancellation/capacity outcomes revoke rejected URLs, while ready URLs are released idempotently by handle or manager close. CSP adds only `img-src 'self' blob:` and no network origin. Task 3.3 owns publication-image integration and accessible fallback presentation.

#### M4-D5: Navigation target to locator — Accepted by ADR-0008

The public model exposes `SemanticDocumentTarget { documentId, fragment? }`, while `OpenedPublication` exposes only locator-to-block resolution. Application code cannot safely match a source fragment itself because fragments are not DOM IDs and package-internal source-ID sidecars are not public.

Options:

1. Add an `OpenedPublication.resolveTarget(...)` operation that returns a spine locator or a fixed content-free unavailable result.
2. Replace each public target with a locator during ingestion.
3. Let the desktop infer targets from documents and located blocks.

Decision: option 1. ADR-0008 approves an `OpenedPublication.resolveTarget(input, options?)` operation with closed exact/recovered/unavailable outcomes. Unique addressable fragments and fragmentless spine targets resolve exactly; unresolved fragments recover only to the same document start; invalid, unknown, non-spine, and empty targets are unavailable. The operation returns no publisher fragment/path/URL/prose and does not change a shared schema. Task 2.1 owns exact TypeScript names and implementation while preserving the ADR semantics.

#### M4-D6: Authoritative visible-location sampling — Accepted by ADR-0008

Decision: use the existing structural locator plus a Unicode-code-point offset at an application-owned reading line at the start edge of the content viewport. Prefer the first visible addressable leaf block crossing the line, use safe caret geometry to refine its offset, fall back to block start, and normalize through `resolveLocator`. Pixel geometry, scroll offsets, rendered pages, percentages, DOM paths, and text quotations are never position authority. Passive sampling/reflow/restoration does not move focus.

#### M4-D7: Persistence backend, envelope, and migration — Accepted by ADR-0011

Options were Web Storage, IndexedDB, an official Tauri store/plugin, or a repository-owned native file store. ADR-0011 accepts a small asynchronous desktop repository backed initially by packaged-WebView `localStorage`. Native release evidence proved a fixed marker survived a full process restart. The boundary adds no native command, capability, dependency, or path contract; IndexedDB/native storage remains a future option only after a measured requirement exceeds the small bounded dataset.

The accepted `voxleaf.reader.` namespace has exactly two fixed keys. The positions envelope holds at most 128 unique exact-byte states and 262,144 UTF-16 code units in deterministic most-recent order; the preferences envelope is limited to 1,024 code units. Unsupported envelope versions are preserved and write-disabled for the older application. Future migrations are explicit decode-transform-validate atomic replacements owned by the desktop, while nested shared contracts remain `@voxleaf/shared`'s authority.

#### M4-D8: Save lifecycle — Accepted by ADR-0011

Use a trailing 500 ms debounce for passive scroll-derived locator changes, with immediate coalesced saves after table-of-contents, internal-link, chapter, direct-locator, and settled preference-reflow navigation. Attempt to flush the last validated locator on book replacement/close, hidden-document transition, and `pagehide`; do not rely on asynchronous `beforeunload`. A failed write never delays navigation or publication closure and never changes the active in-memory locator.

Task 4.5 must prove the exact 499/500 ms boundary, supersession, coalescing, lifecycle flush, and no per-scroll-event write with deterministic fake clocks.

#### M4-D9: Reader preference ownership — Accepted by ADR-0011

Global display preferences use a separate closed app-local `ReaderPreferencesV1` envelope with four bounded tokens: text scale, line spacing, content width, and light/dark/system theme. Per-book position remains nested `PersistedReadingStateV1`; its existing voice/playback fields are unchanged. Typeface switching, custom colors/fonts, margins, alignment, hyphenation, pagination, per-book style profiles, narration settings, and model settings are deferred.

#### M4-D10: Large-chapter rendering — Measurement and approval required

Options are rendering a complete chapter, incremental batches with an explicit reader-side ceiling, or window virtualization. Recommend one spine document at a time, incremental rendering to first useful/target content, and an evidence-based hard live-DOM/semantic-block ceiling with a recoverable `chapter-too-large` presentation. General virtualization is deferred unless the prototype proves it is required and accessibility, find-in-page, focus, target restoration, and screen-reader continuity can be preserved.

No arbitrary production ceiling may be selected from this plan. Task 1.6 must measure synthetic small/representative/long chapters and record the accepted count, node, latency, and memory bounds.

#### M4-D11: Real-browser and native test tooling — Accepted by Task 1.5

Use exact `@playwright/test` `1.61.1` against the built Vite application for deterministic Chromium layout/reflow evidence plus the focused native Windows WebView smoke matrix for target-runtime behavior. jsdom remains appropriate for pure/component behavior but cannot prove geometry. Playwright selects Chrome for Testing `149.0.7827.55` / revision `1228` on Windows. Browser acquisition is the explicit networked `pnpm.cmd test:browser:install` command; ordinary `pnpm.cmd test:browser` runs offline against the default per-user cache and never downloads or updates browsers. The authoritative Windows CI job performs the explicit matching install and smoke without restoring a browser cache; Ubuntu portable CI does not install a browser. The dependency and browser binaries are test-only and do not enter the desktop production bundle. Vitest browser mode remains an unused alternative; Tauri/WebDriver is reserved for native behavior not proved by Chromium.

#### M4-D12: Reader performance thresholds — Product/architecture approval required

No approved numeric reader latency budget exists. Measure file-selection-to-ready, chapter-navigation-to-content, restoration-to-settled-position, preference-change reflow, long-chapter batch latency, live DOM nodes, and peak memory on documented Windows hardware. Task 1.6 must recommend and obtain approval for explicit thresholds before final performance acceptance; the plan must not convert provisional measurements into product claims.

## Reader architecture

The planned desktop areas are responsibilities, not required filenames. ADR-0008 accepts the visual renderer/coordinator/navigation/locator boundaries, and ADR-0009 accepts the implemented file-ingress probe; publication integration, images, and persistence remain later work or gates:

- **File-open boundary:** obtains one local `File` or approved native result, reads bounded bytes, starts/cancels opening, and never exposes a path to the EPUB package.
- **Publication session owner:** owns `idle -> opening -> ready | failed -> closing` state, one `AbortController`, one `OpenedPublication`, replacement ordering, cleanup, and privacy-safe errors.
- **Reader coordinator:** owns active document, active locator, pending navigation/restoration intent, preference-reflow capture/restore, and persistence scheduling outside leaf UI components.
- **Semantic document renderer:** exhaustively maps immutable blocks/inlines to application-owned React elements. It owns no ingestion, storage, routing, TTS, or audio behavior.
- **Navigation adapter:** converts approved table-of-contents/internal targets into package-resolved locators and changes the reader coordinator state.
- **DOM/locator mapper:** maintains content-free associations between rendered block elements, located blocks, semantic code-point offsets, and restore ranges.
- **Visible-location tracker:** observes scroll/layout changes, samples the approved reading line, normalizes candidates, and emits bounded locator changes without persisting directly.
- **Position repository:** reads/writes versioned, decoder-validated, content-free records by exact book identity. It has no access to the semantic document.
- **Reader controls:** own presentation and accessible interaction only; they call coordinator operations rather than mutating storage or the publication directly.

Use React error boundaries only to contain presentation failures and show a fixed safe state. Domain state and long-lived observers/controllers should be repository-owned TypeScript modules or hooks with explicit cleanup, not hidden in unrelated UI components. Raw image bytes and object URLs must not enter global application state.

No application router exists. Milestone 4 navigation remains internal coordinator state and must not call `history.pushState` or encode book identity/locator values in URLs. Route integration can be designed if a real router is later introduced.

## Content-rendering and security boundaries

Under ADR-0008, the renderer maps semantic values as follows:

| Semantic input | Application-owned visual representation |
| --- | --- |
| Spine semantic document | One reader `article`/region with an application-owned content-free document key. A chapter is represented by its spine document and heading structure. |
| Heading levels 1-6 | Matching `h1`-`h6`, preserving source level and language/direction context. |
| Paragraph | `p`. |
| Block quote | `blockquote` containing recursively rendered supported blocks. |
| Ordered/unordered list | `ol`/`ul`; each semantic item becomes `li` containing its blocks. |
| Text | React text node only. |
| Emphasis/strong/code | `em`, `strong`, and `code`. |
| Line break | `br`, counted consistently with the locator index's newline position. |
| Internal link | Application-owned link control activated only after target-to-locator resolution; no publisher URL becomes `href`. |
| Raster image | `img` only after M4-D4 approval and bounded read/decode; use semantic alternative text and a fixed placeholder on failure. |
| Navigation group | Non-activatable labelled group containing its child nodes. |
| Navigation link | Activatable only when the EPUB package resolves it to a supported spine locator. |

The current semantic model has no generic section, table, figure, caption, ruby, footnote role, SVG, MathML, audio, video, form, or publisher-style node. The renderer must not infer unsupported structure. Chapters/sections are conveyed by spine documents, headings, paragraphs, and navigation hierarchy. Unsupported/unsafe source elements have already been omitted, reduced to safe descendants, or caused ingestion failure according to ADR-0007.

Fallback rules:

- External links remain inert rendered descendants because no URL crosses ingestion.
- A non-spine or unresolvable internal target remains readable text and is announced as unavailable rather than receiving a fabricated locator.
- Missing image alternative text uses the approved accessible fallback from M4-D4; never expose a resource ID/path as a label.
- A failed/oversized/unsupported image becomes a fixed-size application placeholder with safe text and must not fail the complete chapter.
- A document with no addressable readable blocks produces a recoverable empty-content state rather than an empty focus trap.
- An unknown semantic union member is a compile-time exhaustive failure and a runtime rendering error boundary, not raw HTML fallback.

Security invariants:

- Do not use `dangerouslySetInnerHTML`, iframe `srcdoc`, `DOMParser`, publisher-controlled `style`, dynamic script, or source fragments as DOM IDs.
- Apply only application-owned CSS classes/custom properties with bounded preference values.
- Map semantic language and direction through validated React properties; never spread untrusted objects as element attributes.
- Image source values may only be renderer-created, short-lived object URLs or another explicitly approved local representation.
- If CSP changes for images, allow only the minimum local scheme and keep network origins absent.
- Abort and discard stale image reads/decodes on document change, book close, or component cleanup; revoke every object URL exactly once.
- Never cache resource bytes or decoded images beyond the active bounded view unless a separately reviewed memory policy allows it.

## Reading-position model

### Authority

Use `ReadingLocatorV1` exactly as implemented:

- exact-byte `bookIdentity` associates the position with the correct publication version;
- `spineItemId` and `spineItemIndex` select the supported reading-order document;
- `anchor.value` and `anchor.anchorIndex` select a deterministic semantic block;
- `textOffsetCodePoints` selects a Unicode-code-point position within a heading/paragraph or zero for structural blocks; and
- optional progression is recovery/display metadata only.

EPUB CFI, rendered pages, pixel offsets, `scrollTop`, element geometry, and chapter-relative percentages are not persistence authority. No Milestone 4 code should introduce a second locator format.

### DOM mapping and visible-position selection

The renderer should create a content-free mapping from each rendered addressable block element to its `PublicationLocatedBlock`. For headings/paragraphs, the mapper must translate between semantic code-point positions and DOM Ranges using the same rules as Milestone 3: text contributes Unicode code points, line breaks contribute one newline position, and raster images contribute one object-replacement position rather than alternative-text length. Structural block quotes and lists use offset zero; their addressable descendants own text offsets.

The ADR-0008 active-position algorithm is:

1. Observe only the active document's addressable block elements.
2. At a scroll/layout sample, select the first visible addressable leaf block crossing the approved reading line; if none crosses, select the nearest visible addressable block in reading order.
3. Ask the browser for a caret/range at that line and map it to a semantic code-point offset when supported and contained by the selected block.
4. Fall back to the selected block's start locator when caret geometry is unavailable or ambiguous.
5. Pass the candidate through `OpenedPublication.resolveLocator` and publish only the canonical exact/recovered locator.
6. Coalesce unchanged locator values; passive sampling never moves focus.

The application-owned reading line is fixed at the start edge of the content viewport after persistent reader chrome. Its exact layout inset, browser geometry adapter, and browser APIs remain implementation/evidence details under M4-D11. Pure mapping logic must be independent of browser geometry so it can be tested deterministically.

### Reflow behavior

Before a viewport, font-size, line-spacing, content-width, theme, or zoom-induced layout change that the application controls:

1. capture and normalize the active visual locator;
2. apply the bounded preference/layout change;
3. wait for the committed layout and required image/heading target availability without an arbitrary sleep;
4. reconstruct a DOM range for the same anchor/code-point offset;
5. align that range to the approved reading line without smooth animation; and
6. resume observation only after programmatic restoration settles.

Viewport changes outside application control use the same capture/restore coordinator through a debounced `ResizeObserver`/approved equivalent. Theme-only changes may not alter geometry, but using the same path prevents hidden assumptions. Restoration never rewrites the persisted locator with a transient scroll position before settling.

## Position-persistence and restoration strategy

### Records and association

- Use ADR-0011's exactly two fixed keys: `voxleaf.reader.positions` and `voxleaf.reader.preferences`.
- Store at most 128 unique exact-identity `PersistedReadingStateV1` entries inside the positions envelope in most-recently-saved order, bounded to 262,144 UTF-16 code units. The ordering replaces timestamps and supplies deterministic oldest-entry eviction.
- Validate the outer envelope and every nested state through `decodePersistedReadingStateV1`, then require equality among the record identity, locator identity, lookup identity, and currently opened publication identity.
- Store global display preferences separately in the closed app-local `ReaderPreferencesV1` envelope, bounded to 1,024 code units. Its only fields are schema version, text scale, line spacing, content width, and theme.
- Do not persist EPUB bytes, resource bytes, Blob URLs, extracted text, navigation labels, metadata, DOM snapshots, pixel offsets, or scroll percentages.

### Save behavior

- Only a locator already normalized by the open publication may enter the repository.
- Passive scroll changes use a trailing 500 ms debounce; explicit navigation and settled preference reflow request an immediate coalesced save.
- A later locator supersedes an earlier pending write for the same book.
- Book close/replacement, hidden-document transition, and `pagehide` attempt to flush the most recent validated locator; no asynchronous `beforeunload` contract is assumed. The publication closes regardless of write success.
- Storage failures are nonfatal and visible through a content-free status; they never block reading or corrupt the last in-memory locator.
- Position writes move the exact identity to the front and evict oldest entries until both count and serialized-size limits hold. Unsupported outer versions are never overwritten or evicted by an older application.

### Restore behavior

1. Open and validate the EPUB completely.
2. Determine exact book identity from `publication.book.identity`.
3. Read and decode only that identity's state.
4. If no state exists, start at `publication.locators[0]`; if no locator exists, show a recoverable no-readable-content state.
5. If the state is malformed, unsupported, or belongs to another identity, ignore it safely and start at book start. Do not coerce unknown versions.
6. Resolve the stored locator through `publication.resolveLocator`.
7. For exact or recovered results, activate the resolved spine document, render enough content to materialize the target, and align the DOM range before presenting the reader as restored.
8. If resolution fails, start at book start and show a fixed, non-content recovery notice.
9. Persist the recovered canonical locator only after the restored layout settles; do not destroy an unknown-version record merely because this application cannot read it.

Restoration is required across component remounts/book reopenings in the current process and across application restarts after the user reselects the same exact bytes. Automatic reopening from a retained path is deferred. A byte-modified EPUB is a new book identity and starts at its beginning unless a future explicit migration maps versions.

### Migration

Version 1 has no predecessor migration. The repository must distinguish missing, valid v1, malformed v1, over-limit, unavailable, and unsupported future versions. A malformed current-version value may be replaced only by a later validated user-generated save; an unsupported version is ignored, preserved byte-for-byte, and write-disabled for the older application. Future changes add explicit source decoders and pure migrators, validate the complete target, enforce target bounds, and atomically replace one key only after success. Position and preference envelopes migrate independently, and a nested shared-state version change also requires a new outer positions-envelope version.

## Navigation and interaction model

- Show title and authors outside publication prose rendering using the validated `BookV1` metadata.
- Render detailed table-of-contents hierarchy in source order. Group nodes are labels; resolvable spine links are controls; non-spine/unavailable links remain visibly disabled/inert with an accessible explanation.
- Previous/next controls move among supported spine documents. They are disabled at boundaries and target the first addressable locator in the destination document.
- Table-of-contents, internal-link, previous/next, and direct-locator navigation all use the same coordinator operation: resolve target, capture/replace active document, render, align, focus as appropriate, and schedule persistence.
- Internal links never navigate the browser to publisher fragments and never create network/browser-history entries.
- Native scrolling keys, Page Up/Down, Home/End, Space, zoom, and screen-reader reading behavior should remain browser-native unless a tested accessibility requirement justifies interception.
- Do not add unapproved global shortcuts. The file-open button and all reader controls must work through normal Tab/Shift+Tab and Enter/Space semantics.
- After explicit chapter/TOC/internal navigation, focus the destination heading when one exists; otherwise focus the reader region using an application-owned `tabIndex=-1`. Passive scroll and restoration on startup must not steal focus from assistive technology unexpectedly; announce completed restoration through a polite status region.
- Provide a skip link from application chrome/table of contents to reader content and a clear way back to navigation/controls.
- With no router in the application, route changes and browser back/forward history are out of scope. If later routing unmounts the reader, the publication session owner must preserve or flush the in-memory locator before cleanup.

## Reader preferences and layout

ADR-0011 accepts these global Milestone 4 preference tokens:

- small/standard/large/extra-large text scale;
- compact/comfortable/spacious line spacing;
- narrow/standard/wide content width; and
- light/dark/system theme.

All values are closed enums mapped to application-owned CSS custom properties. They must not accept CSS strings. Preferences apply to the visual reader only and must preserve the active locator through the reflow sequence.

Deferred customization includes custom fonts/files, arbitrary font family, arbitrary colors, margins, paragraph spacing, text alignment, hyphenation, publisher CSS, multi-column/page mode, animation, and per-book style profiles.

The initial layout must:

- remain usable at the configured Tauri minimum width of 320 CSS pixels and common desktop sizes;
- avoid horizontal scrolling for normal prose at browser zoom up to the accepted accessibility target;
- wrap long text and code safely without obscuring controls;
- preserve visible focus in light, dark, forced-colors/high-contrast, and narrow layouts;
- respect `prefers-reduced-motion`; programmatic restoration is not smoothly animated; and
- keep controls reachable when content is zoomed and the table of contents collapses into the approved narrow-window presentation.

## Accessibility requirements

- Use semantic landmarks for application header/controls, table-of-contents navigation, main reader content, and status messages.
- Preserve semantic heading levels, paragraphs, block quotes, lists, emphasis, strong text, code, language, and text direction from the semantic model.
- Give every control a visible label or accessible name and expose selected/expanded/disabled/current states with native semantics or justified ARIA.
- Provide one logical heading hierarchy for application chrome and publication content; do not rewrite publisher heading levels solely for visual style.
- Keep a high-contrast visible focus indicator; never remove outlines without an equivalent.
- Keep focus order consistent with visual order and avoid focus traps.
- Announce loading, invalid/unsupported input, restoration recovery, persistence failure, and completed chapter navigation without announcing book prose.
- Provide meaningful image alternative text when supplied. Missing-alt policy must be decided with M4-D4; resource IDs/paths are never spoken.
- Verify keyboard-only operation, screen-reader landmark/name/state output, 200% and the approved higher zoom case, 320-pixel width, forced colors/high contrast, dark theme, and reduced motion.
- Do not auto-focus or auto-scroll during passive reading in a way that moves a screen-reader user's virtual cursor.

## Performance strategy

The reader must remain responsive and bounded even though Milestone 3 accepts up to 200,000 semantic blocks in a publication and 8 MiB per XHTML document.

Required strategy:

- Open only one active publication and render one active spine document at a time.
- Keep EPUB parsing/resource limits from ADR-0007; do not copy the full semantic tree into mutable UI state.
- Render stable semantic objects directly and memoize only content-free indexes justified by profiling.
- Defer image reads until their document/view needs them, bound concurrent reads/decodes according to M4-D4, and release bytes/object URLs promptly.
- Separate pure locator mapping from geometry sampling so scroll work does not rebuild semantic content.
- Coalesce scroll/resize/observer callbacks through animation-frame or another approved scheduler; do not write storage on every event.
- Use incremental chapter rendering and a measured live-DOM ceiling if M4-D10 is approved. Never render an ingestion-maximum chapter in one unmeasured synchronous React commit.
- Show a loading/progress state for work that cannot complete within one responsive interaction interval, without fabricating progress percentages.

Record, without content, at least:

- file selection to open success/failure;
- open success to first readable content;
- chapter navigation to first content and settled target;
- restore start to settled target;
- preference/viewport change to restored target;
- long-chapter batch time, live DOM node/block count, and peak process memory; and
- image read/decode duration and peak concurrent decoded pixels.

Exact pass/fail thresholds are intentionally unresolved under M4-D12. Task 1.6 must establish them from documented hardware before the final performance task can pass.

## Error and fallback behavior

| State/failure | Required behavior |
| --- | --- |
| No book selected | Show an open-book action and no reader controls that imply content exists. |
| Selection cancelled | Return to the prior ready/idle state without an error. |
| Opening | Show a labelled busy state; a replacement open cancels/cleans the stale attempt. |
| Invalid/unsupported/resource-exhausted EPUB | Map fixed result codes to static actionable text; expose no filename, path, parser detail, or prose. |
| Empty/no addressable content | Keep metadata/navigation when safe, show a recoverable no-readable-content state, and do not persist a fabricated locator. |
| Missing/unresolvable navigation target | Keep its label readable; disable/inert the action and do not guess from text. |
| Raster read/decode failure | Show a safe image placeholder, release temporary bytes/URL, and keep chapter reading available. |
| Malformed/missing persisted state | Ignore safely and begin at book start. |
| Recovered persisted locator | Open the recovered passage and show one dismissible content-free notice. |
| Unsupported future persisted version | Ignore without coercion or destructive deletion; begin at book start. |
| Persistence read/write unavailable | Continue in memory, show a nonblocking content-free status, and retry only through a bounded policy. |
| Rendering exception | Catch at the reader boundary, close/release the publication if the session cannot continue, and offer reopen; never print raw values. |
| Chapter exceeds approved render bound | Show the accepted recoverable limitation and preserve the last valid locator. |
| Book replaced/closed | Stop observers/reads, revoke URLs, flush when safe, close exactly once, and return to idle/opening. |

Expected EPUB failures should reuse `OperationalErrorV1`/EPUB detail codes where applicable. Desktop-only states use a closed application enum with static messages; no raw `Error.message`, stack, cause, file name/path, metadata, markup, prose, URL, bytes, or rejected storage value crosses into UI or logs.

## Testing and benchmark strategy

### Deterministic unit tests

- Semantic-node-to-element mapping and exhaustive unsupported-node behavior.
- DOM-independent semantic code-point indexing/range conversion, including astral Unicode, nested emphasis/strong/code, line breaks, images, and structural blocks.
- Coordinator state transitions, replacement cancellation, idempotent close, stale-operation rejection, navigation, and error mapping.
- Visible-position selection using an injected geometry/caret adapter rather than real pixels.
- Save coalescing/debounce/lifecycle behavior with a fake/manual clock and fake repository.
- Storage decode, identity checks, malformed/unsupported versions, write failures, and migration dispatch.
- Preference bounds and capture/reflow/restore sequencing.
- Target-resolution exact/recovery/unavailable behavior in `@voxleaf/epub`.

### Component tests in jsdom

- Semantic HTML, headings, lists, links, image placeholders, metadata, table-of-contents hierarchy, controls, loading/error/empty/recovery states, focus requests, accessible names/states, and preference controls.
- Tests query roles, labels, headings, and structural locators rather than class names or snapshots containing prose.
- jsdom tests must not claim viewport, scroll, image-decode, WebView persistence, or real focus-ring evidence.

### Package-to-desktop integration tests

- Build repository-authored in-memory EPUB bytes, open through the real `@voxleaf/epub` public entry point, pass the publication through the application coordinator, render it, navigate, persist, close, reopen exact bytes, and restore.
- Prove no application code depends on private EPUB paths, source markup, or package internals.
- Prove wrong-byte identity never receives another book's state and nearest-valid recovery uses the package resolver.

### Real-browser layout and end-to-end tests

Using the `pnpm.cmd test:browser` command established by M4-D11, later reader tasks must cover:

- restore the same structural anchor/code-point passage at multiple viewport widths/heights;
- restore after each approved text-size, line-spacing, content-width, and theme combination;
- resize/zoom reflow while preserving the active locator;
- table-of-contents, internal-link, previous/next, direct-locator, and application-remount restoration;
- app-restart-equivalent storage restoration after reselecting exact bytes;
- keyboard focus, skip link, narrow-window controls, visible focus, reduced motion, and accessibility-tree semantics;
- long-chapter incremental/bound behavior; and
- object-URL/image cleanup and no remote request.

Do not assert pixel-perfect coordinates, screenshots, page counts, line breaks, font rasterization, or exact `scrollTop`. Assert the canonical locator, target block/range visibility relative to the reading line with tolerances, focused semantic element, accessible state, bounded node counts, and absence of network requests.

### Native Windows validation

- Prove file selection/cancellation/reopen in the release WebView2 shell.
- Prove selected persistence survives a real application restart after the same file is reselected.
- Exercise minimum/narrow/common desktop window sizes, browser zoom, keyboard focus, system light/dark/high-contrast settings, and WebView update compatibility.
- Confirm CSP blocks remote content and permits only the approved local image mechanism.
- Confirm closing/replacing books releases handles and leaves no persisted book bytes/images/prose.

### Fixtures

Extend the existing test-only EPUB fixture builder with independent, deterministic options for:

- multiple spine chapters and nested table-of-contents groups;
- headings, paragraphs, block quotes, ordered/unordered lists, emphasis, strong, code, line breaks, direction, and language;
- same-document and cross-document internal links, missing fragments, non-spine targets, and malformed references;
- PNG/JPEG/WebP/GIF signatures plus safe dimensions, oversized dimensions/pixels, animation/frame cases, missing alt text, and decode failures as required by M4-D4;
- empty/near-empty content and missing addressable targets;
- long chapters at below/exact/above reader-side render limits;
- duplicate/replaced source anchors and exact/nearest locator restoration; and
- same semantic passage under different preference/viewport matrices.

Keep fixtures repository-authored, synthetic, in-memory, deterministic, and test-only. Do not commit copyrighted books or opaque EPUB binaries. Expected positions must be authored independently of the code under test.

### Existing validation commands

These commands exist at plan creation:

```powershell
git diff --check
pnpm.cmd install --frozen-lockfile
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd test:browser:install
pnpm.cmd test:browser
pnpm.cmd --filter @voxleaf/desktop build
pnpm.cmd --filter @voxleaf/desktop tauri build
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd check
```

Task 1.5 added `pnpm.cmd test:browser` for deterministic Chromium evidence after one explicit `pnpm.cmd test:browser:install`. The fixed foundation smoke proves the harness, viewport/storage control, real focus, role/name semantics, responsive geometry, cleanup, and absence of non-loopback requests; it is not evidence for unimplemented reader behavior or a complete accessibility audit. Later tasks may extend this command only with repository-authored synthetic inputs and must retain native Windows WebView validation where the target runtime matters.

## Expected files or areas affected

Likely application areas:

- `apps/desktop/package.json`, lockfile, TypeScript/Vite/test configuration, and dependency documentation;
- `apps/desktop/src` reader/session/navigation/rendering/position/persistence/preferences modules, components, styles, and tests;
- `apps/desktop/src-tauri/tauri.conf.json` and possibly narrowly scoped capability/Rust files only if approved gates require them;
- browser/end-to-end test configuration and synthetic fixture consumers selected by M4-D11.

Likely package areas:

- `packages/epub/src/document/document-model.ts`, public exports, locator/target internals, tests, and integration matrix for the approved target resolver;
- `packages/epub/test-support/epub-fixture.ts` and its tests for reader-specific synthetic scenarios;
- `packages/shared` only as an existing decoder/contract consumer. No shared schema change is expected under the recommended design.

Likely documentation areas:

- a new visual-reader ADR, persistence ADR, and image-decode/security ADR or a clearly scoped accepted equivalent;
- `docs/architecture/system-diagram.md` and `overview.md` when planned reader/persistence components become implemented;
- `docs/development/dependencies.md`, `testing.md`, and `setup.md` for accepted dependencies/commands/native behavior;
- product/MVP documentation only if an approved product choice changes reading mode, preference scope, restoration semantics, or accepted limitations;
- this ExecPlan, roadmap status, and active/completed plan indexes.

Do not change `services/tts`, audio contracts/implementation, narration contracts/implementation, or later-milestone plans except for an essential cross-reference.

## Implementation milestones and independently verifiable tasks

## Milestone 1: Close reader decision and evidence gates

### Task 1.1: Accept the visual-reader architecture decision

**Outcome:** An accepted ADR resolves M4-D1, M4-D3, M4-D5, M4-D6, browser-history behavior, non-spine targets, focus behavior, and the separation from later narration/audio work.

**Dependencies:** Completed Milestone 3, ADR-0003, ADR-0007, and this plan.

**Areas:** architecture decisions/index, architecture overview/system diagram if approved plans change, product docs only for approved product choices, and this plan's decision log.

**Acceptance:** The ADR chooses/rejects/defer options with rationale; direct rendering cannot imply trusted publisher HTML; the target-to-locator public contract shape and unavailable behavior are explicit; one reading mode and active-location algorithm are approved; no application code/dependency is added.

**Validation:** `git diff --check`; manually resolve changed Markdown links because no Markdown-link checker exists; `pnpm.cmd format:check` for repository-configured formats.

**Status:** Complete on 2026-07-22. ADR-0008 accepts direct semantic DOM rendering, continuous vertical scrolling, package-owned semantic-target resolution, structural locator/code-point visible-position sampling, application-owned focus/history behavior, and separation from narration/audio. Architecture, product, roadmap, diagram, and plan references were reconciled; no application code or dependency was added. `git diff --check`, manual changed-link and Mermaid review, and `pnpm.cmd format:check` passed.

### Task 1.2: Prove and select the local file-ingress boundary

**Outcome:** A minimal native Windows prototype proves option 1 or records why a narrowly scoped native alternative is required, and the accepted boundary is documented.

**Dependencies:** Task 1.1.

**Areas:** smallest desktop prototype/tests; Tauri configuration only if required; dependency/capability docs; ADR amendment; remove rejected prototype code.

**Acceptance:** Select/cancel/reselect/exact maximum/maximum-plus-one paths are exercised without persisting path/bytes; stale opens cancel; release WebView behavior is verified; any native command/plugin/capability is least-privilege and explicitly approved.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; `pnpm.cmd --filter @voxleaf/desktop build`; `pnpm.cmd --filter @voxleaf/desktop tauri build`; documented native manual probe.

**Status:** Complete on 2026-07-22. ADR-0009 accepts the capability-free WebView file input and abortable bounded `FileReader` transfer. Twelve desktop tests and a native release WebView2 probe cover select/cancel/reselect, exact 100 MiB/max-plus-one, active abort/stale completion, cleanup, fixed failures, cleared input, and filename privacy. Focused typecheck, test, build, lint, and Tauri release build passed. No dependency, manifest, lockfile, Rust source, Tauri command/plugin/capability, or CSP change was added.

### Task 1.3: Prove and accept raster decode safety limits

**Outcome:** An accepted ADR and focused prototype establish exact predecode/decode/lifetime/CSP limits or explicitly choose alternative-text placeholders only.

**Dependencies:** Task 1.1 and ADR-0007 raster boundaries.

**Areas:** smallest desktop/package probe and tests; Tauri CSP if proven; dependency inventory/lock only for an accepted parser; ADR and plan.

**Acceptance:** Exact/max+1 dimensions/pixels/frames/concurrency/lifetime behavior is deterministic; malicious/failed decode cannot trigger network, persistence, unbounded retention, or raw errors; object URLs are revoked; rejected candidates are removed.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; `pnpm.cmd --filter @voxleaf/desktop build`; `pnpm.cmd --filter @voxleaf/desktop tauri build`; `git diff --check`.

**Status:** Complete on 2026-07-22. ADR-0010 accepts the narrow static-image policy and lifecycle boundary. The desktop now preflights all four admitted raster media types, rejects malformed metadata structures/oversize declarations/animation before URL creation, maps later payload decode failures to a fixed local result, confirms dimensions after browser decode, bounds concurrent/live work, aborts and awaits close, and revokes every rejected/released source. Thirty-one desktop tests pass; the release WebView2 shell decoded and released the fixed synthetic PNG twice under the narrowed CSP. No package/lock dependency, EPUB public contract, native command/plugin/capability, persistence, publication integration, or semantic image rendering was added.

### Task 1.4: Accept persistence, preference, and migration ownership

**Outcome:** An accepted ADR resolves M4-D7, M4-D8, and M4-D9 with one bounded storage keyspace, versioned envelopes, save lifecycle, failure policy, and migration rule.

**Dependencies:** Task 1.1 and the existing shared persisted-state decoder.

**Areas:** architecture decision/index, architecture overview/system diagram, product docs if needed, and this plan.

**Acceptance:** Backend choice is evidence-based; content-free key/value fields are exhaustive; display preferences do not silently change shared v1; exact identity/restoration/recovery/app-restart behavior is explicit; unsupported versions are not coerced/deleted; no application code/dependency is added by the decision task.

**Validation:** `git diff --check`; manual changed-link review; `pnpm.cmd format:check`.

**Status:** Complete on 2026-07-22. ADR-0011 accepts packaged WebView `localStorage` behind an asynchronous replaceable desktop repository; exactly two fixed bounded versioned envelopes; a separate global app-local display-preference contract; deterministic most-recent position eviction; a trailing 500 ms passive-save debounce plus coalesced explicit/lifecycle saves; exact-byte restore and package-owned nearest-valid recovery; fixed nonfatal failures; and explicit validate-transform-validate migration that preserves unsupported versions. The current release shell seeded one fixed marker, restored it after a full process restart, and cleared it. The temporary probe was removed. No application/test source, dependency, manifest, lockfile, shared contract, native command/plugin/capability, or production storage implementation was added.

### Task 1.5: Select and establish real-browser reader test tooling

**Outcome:** One reviewed browser layout/end-to-end tool and exact repository command exist, or the plan records a proven alternative that supplies equivalent deterministic geometry evidence.

**Dependencies:** Task 1.1; dependency policy.

**Areas:** desktop dev dependencies/lock, browser test configuration/smoke test, CI if approved, dependency/testing/setup docs, and this plan.

**Acceptance:** A fixed smoke test runs offline after documented installation, controls viewport and storage, observes layout/focus/accessibility semantics, has deterministic cleanup, and does not download browsers during ordinary test execution unexpectedly; exact command is recorded only after it works.

**Validation:** Existing `pnpm.cmd --filter @voxleaf/desktop typecheck`, `test`, and `build`, plus the exact browser command introduced by this task and root `pnpm.cmd format:check`/`lint`. Update this plan with the actual command before completion.

**Status:** Complete on 2026-07-22. Exact `@playwright/test` `1.61.1` and its matching Chromium revision are pinned; explicit acquisition and offline execution have separate root commands; the Vite production-build smoke controls browser preferences, viewport, storage, network, focus, accessibility roles, responsive geometry, and cleanup; Vitest excludes browser specs; Windows CI owns installation and execution. The fixed smoke passed once after installation and again after final configuration. No application behavior, production dependency/bundle, Tauri command/plugin/capability, EPUB contract, book fixture, private data, or native-WebView claim was added.

### Task 1.6: Establish reader performance and large-chapter limits

**Outcome:** Synthetic measurements produce approved reader latency, live-DOM, batch, image, and memory thresholds and select the M4-D10 policy.

**Dependencies:** Tasks 1.3 and 1.5; existing fixture builder.

**Areas:** test-only benchmark fixtures/harness, performance-budget documentation, visual-reader ADR amendment, and this plan.

**Acceptance:** Small/representative/long/excess cases run on documented Windows hardware; no content is logged; exact limits and fallback are accepted; thresholds distinguish measured evidence from product claims; no production renderer is implemented in this task.

**Validation:** The browser command established by Task 1.5; `pnpm.cmd --filter @voxleaf/desktop test`; `git diff --check`. Record hardware and actual command/result in the progress log.

**Status:** Not started.

## Milestone 2: Establish publication session and navigation boundaries

### Task 2.1: Add public semantic-target resolution

**Outcome:** `@voxleaf/epub` implements the Task 1.1-approved target-to-locator operation without exposing source IDs, paths, URLs, or prose.

**Dependencies:** Task 1.1.

**Areas:** EPUB public model/export, target/source-ID index, resolver, unit/integration tests, ADR/overview as needed.

**Acceptance:** Fragmentless and matching-fragment spine targets resolve deterministically; missing fragments follow the approved recovery; non-spine/wrong/unknown/closed/cancelled cases return fixed safe outcomes; existing locator behavior and shared schemas remain unchanged.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`; `pnpm.cmd --filter @voxleaf/shared test`.

**Status:** Not started.

### Task 2.2: Add desktop package boundaries and publication-session ownership

**Outcome:** The desktop depends explicitly on `@voxleaf/epub`/`@voxleaf/shared` and owns one cancellable, replaceable, idempotently closed publication session outside presentation components.

**Dependencies:** Task 1.1 and accepted package-boundary design.

**Areas:** desktop manifest/lock, session/domain modules/tests, dependency docs.

**Acceptance:** One active open attempt/publication; replacement aborts stale work and closes prior state; stale completion cannot become visible; no persistence/rendering/native permission is introduced; errors remain fixed/content-free.

**Validation:** `pnpm.cmd install --frozen-lockfile`; `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; `pnpm.cmd --filter @voxleaf/desktop build`; `pnpm.cmd --filter @voxleaf/epub test`.

**Status:** Not started.

### Task 2.3: Implement the approved file selection and open flow

**Outcome:** A user can select/cancel/replace a local EPUB and reach ready metadata or a safe recoverable open state through the approved ingress boundary.

**Dependencies:** Tasks 1.2 and 2.2.

**Areas:** desktop file-open adapter, application shell/open UI, session integration, focused tests; native capability only if approved.

**Acceptance:** Accept hint is present but security relies on EPUB validation; bytes remain in memory; cancel is non-error; invalid/unsupported/resource-exhausted/cancelled results map safely; title/authors appear only after success; no path or raw error is displayed/persisted/logged.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; `pnpm.cmd --filter @voxleaf/desktop build`; `pnpm.cmd --filter @voxleaf/desktop tauri build`; native selection smoke.

**Status:** Not started.

### Task 2.4: Implement reader loading, empty, failure, and close states

**Outcome:** One accessible state surface handles idle/opening/ready/empty/failure/closing and guarantees cleanup.

**Dependencies:** Tasks 2.2-2.3.

**Areas:** desktop state/view/error-boundary modules and tests.

**Acceptance:** Busy/status semantics are correct; no partial publication renders; empty content is recoverable; renderer failures are contained; close/reopen works; static messages contain no sensitive values; one state transition cannot leak a prior book.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; `pnpm.cmd --filter @voxleaf/desktop build`.

**Status:** Not started.

## Milestone 3: Render and navigate safe reflowable content

### Task 3.1: Render semantic text structure exhaustively

**Outcome:** Supported documents, headings, paragraphs, block quotes, lists, text, emphasis, strong text, code, and line breaks render as semantic application-owned elements.

**Dependencies:** Tasks 1.1 and 2.4.

**Areas:** desktop semantic renderer/components/styles and focused tests.

**Acceptance:** Closed-union switches are exhaustive; language/direction/source order preserved; no raw HTML/publisher attributes/styles/IDs; chapter/document keys are content-free; supported component and privacy tests pass.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; `pnpm.cmd --filter @voxleaf/desktop build`; `pnpm.cmd lint:typescript`.

**Status:** Not started.

### Task 3.2: Add table-of-contents and internal target navigation

**Outcome:** Hierarchical TOC, internal links, and previous/next chapter controls navigate only through package-resolved spine locators.

**Dependencies:** Tasks 2.1 and 3.1.

**Areas:** desktop navigation adapter/components/coordinator/tests.

**Acceptance:** Groups/links preserve order; fragment targets work; unavailable/non-spine/external targets are inert and explained; boundaries disable controls; no source fragment becomes DOM/browser URL; navigation has one coordinator path.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; browser command from Task 1.5 for real focus/target behavior.

**Status:** Not started.

### Task 3.3: Render bounded local raster images

**Outcome:** Images follow the Task 1.3-approved safety/lifecycle policy and degrade to accessible placeholders independently of chapter rendering.

**Dependencies:** Tasks 1.3 and 3.1.

**Areas:** desktop image loader/component/style/tests; CSP/dependency files only as approved.

**Acceptance:** Lazy bounded reads/decodes; exact safety limits; bounded concurrency; cancellation/stale result rejection; alt/fallback policy; URL/byte release on unmount/document/book change; zero remote request/persistence; chapter survives image failure.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; browser command from Task 1.5; `pnpm.cmd --filter @voxleaf/desktop tauri build` and native CSP/image smoke.

**Status:** Not started.

### Task 3.4: Implement the approved reader layout and preferences

**Outcome:** One continuous/paginated mode and the approved bounded preferences provide responsive reflow without publisher styling.

**Dependencies:** Tasks 1.1, 1.4, and 3.1.

**Areas:** reader layout/preferences modules/components/styles/tests.

**Acceptance:** Closed preference bounds; normal prose at 320 px/common widths/approved zoom without unintended horizontal scroll; light/dark/system behavior; reduced motion; no arbitrary CSS input; preference changes emit a reflow intent but do not yet persist directly.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; browser command from Task 1.5 across the approved viewport/preference matrix.

**Status:** Not started.

### Task 3.5: Complete reader keyboard and focus behavior

**Outcome:** Core reading/navigation/preferences are operable without a mouse and expose stable focus/landmark/status semantics.

**Dependencies:** Tasks 3.2 and 3.4.

**Areas:** desktop shell/reader/TOC/control components, styles, tests.

**Acceptance:** Skip link; logical tab order; visible focus; accessible names/states; destination focus after explicit navigation; no focus theft on passive scroll/reflow; native scrolling keys preserved; narrow/zoom/high-contrast/reduced-motion cases pass.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop test`; browser command from Task 1.5; documented native Windows keyboard/high-contrast smoke.

**Status:** Not started.

### Task 3.6: Enforce the approved large-chapter rendering policy

**Outcome:** One chapter renders incrementally within accepted node/time/memory bounds and produces a recoverable state above its approved ceiling.

**Dependencies:** Tasks 1.6 and 3.1.

**Areas:** desktop renderer scheduler/bounds/tests and performance documentation.

**Acceptance:** Below/exact/above boundaries; first useful/target content appears within threshold; no unbounded DOM; target/focus/reading order remain correct; excess does not corrupt last locator; no general virtualization unless Task 1.6 approved it.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop test`; browser/performance command from Task 1.5; record approved metrics without content.

**Status:** Not started.

## Milestone 4: Own, persist, and restore the logical reading position

### Task 4.1: Implement semantic code-point to DOM range mapping

**Outcome:** Pure mapper functions round-trip located blocks and legal offsets to/from rendered DOM positions.

**Dependencies:** Tasks 2.1 and 3.1.

**Areas:** desktop locator/DOM mapping module and tests.

**Acceptance:** Unicode astral characters, nested inlines, code, line breaks, images, zero-length/structural blocks, exact end offsets, malformed/stale nodes, and exhaustive cleanup are covered; no geometry/storage/persistence is mixed in.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`.

**Status:** Not started.

### Task 4.2: Track and normalize the active visual locator

**Outcome:** The approved reading-line algorithm emits one canonical locator as the user scrolls without changing focus or writing storage directly.

**Dependencies:** Tasks 1.1, 1.5, 3.6, and 4.1.

**Areas:** desktop observer/geometry adapter/coordinator/tests.

**Acceptance:** Deterministic injected-geometry tests; real-browser top/partial/between/end cases; caret offset and block-start fallback; coalesced callbacks; observer suspension during programmatic navigation; no pixel value enters the locator.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop test`; browser command from Task 1.5.

**Status:** Not started.

### Task 4.3: Preserve position across viewport and preference reflow

**Outcome:** Resize/zoom and every approved preference change return the same canonical passage to the reading line.

**Dependencies:** Tasks 3.4 and 4.2.

**Areas:** desktop reader coordinator/reflow hook/tests.

**Acceptance:** Capture-before-change, settle-without-sleep, exact range restore, observer suppression/resume, rapid change coalescing, missing-target fallback, no focus theft; locator equality/recovery asserted across viewport/typography matrix without pixel snapshots.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop test`; browser command from Task 1.5 across approved matrices.

**Status:** Not started.

### Task 4.4: Implement the versioned local position repository

**Outcome:** The Task 1.4-approved backend stores/reads bounded `PersistedReadingStateV1` records and separate display preferences through decoder-validated adapters.

**Dependencies:** Task 1.4.

**Areas:** desktop persistence/domain modules and tests; native/plugin files only if approved.

**Acceptance:** Exact identity keying; valid/missing/malformed/unsupported/write-failure cases; no coercion; no sensitive fields; bounded keyspace/record size; future migration dispatch point; repository can be replaced without reader component changes.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; native backend smoke if applicable.

**Status:** Not started.

### Task 4.5: Persist validated locator updates on the approved lifecycle

**Outcome:** Scroll and explicit navigation save the latest canonical locator through one debounced/coalesced coordinator.

**Dependencies:** Tasks 4.2 and 4.4.

**Areas:** desktop save coordinator/manual-clock tests.

**Acceptance:** Exact debounce boundary; supersession; explicit-navigation/reflow save; close/replacement/lifecycle flush; stale-book rejection; nonblocking failures; no per-scroll-event write; no publication content enters fake/real records.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`.

**Status:** Not started.

### Task 4.6: Restore exact or nearest valid position on open

**Outcome:** Reopening exact bytes activates and displays the decoded exact/recovered passage before the ready reader settles.

**Dependencies:** Tasks 3.6, 4.1, 4.4, and 4.5.

**Areas:** desktop open/restore coordinator, status UI, integration/browser tests.

**Acceptance:** New book starts at first locator; exact/recovered/missing/malformed/future/wrong-identity/no-content cases; target chapter materializes before alignment; recovered notice is content-free; canonical recovered locator saves only after settle; app-remount and restart/reselection behavior pass.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop test`; browser command from Task 1.5; native Windows restart/reselection smoke.

**Status:** Not started.

## Milestone 5: Complete fixtures and reader validation

### Task 5.1: Extend deterministic EPUB fixtures for reader scenarios

**Outcome:** Test-only builders create all approved navigation/reflow/image/long-chapter/restoration cases without opaque binaries.

**Dependencies:** Tasks 1.3, 1.6, and 2.1 decisions.

**Areas:** `packages/epub/test-support`, fixture tests, desktop test helpers only.

**Acceptance:** Repeated bytes are identical; expected locators authored independently; options are orthogonal; exact/max+1 reader cases; malformed references and image cases; no production export, filesystem, network, copyrighted text, or generated binary.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`; `pnpm.cmd --filter @voxleaf/desktop test`.

**Status:** Not started.

### Task 5.2: Prove the package-to-reader integration matrix

**Outcome:** Deterministic integration tests cover open, render, navigate, save, close, reopen, exact restore, recovery, failures, and privacy through public package APIs.

**Dependencies:** Tasks 3.1-3.6, 4.4-4.6, and 5.1.

**Areas:** desktop integration tests and test helpers.

**Acceptance:** Representative success/failure at each boundary; same/different byte identity; malformed/unsupported state; image and target fallback; stale operation cleanup; no private package import; no sensitive snapshot/log/storage fields.

**Validation:** `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test`; `pnpm.cmd --filter @voxleaf/epub test`.

**Status:** Not started.

### Task 5.3: Prove viewport, typography, keyboard, and restart restoration

**Outcome:** Real-browser and native evidence proves the same logical passage across the approved viewport/preference/interaction matrix.

**Dependencies:** Tasks 3.5, 4.3, 4.6, and 5.2.

**Areas:** browser/end-to-end tests, native smoke procedure/results, testing docs.

**Acceptance:** Locator-based assertions across configurations; no pixel-perfect assumptions; exact/recovered status; focus/keyboard/zoom/narrow/high-contrast/reduced-motion behavior; persistence survives native restart after exact-file reselection; no remote requests.

**Validation:** Browser command established by Task 1.5; `pnpm.cmd --filter @voxleaf/desktop tauri build`; documented native Windows matrix.

**Status:** Not started.

### Task 5.4: Prove reader performance and resource bounds

**Outcome:** The implemented reader satisfies the approved M4-D12 thresholds and releases publications, observers, image resources, and storage work under stress.

**Dependencies:** Tasks 3.3, 3.6, 4.5, 5.3, and approved thresholds from Task 1.6.

**Areas:** browser/native performance tests, performance-budget/testing docs, plan evidence.

**Acceptance:** Open/chapter/restore/reflow/long-chapter/image metrics pass on documented hardware; below/exact/above bounds; repeated open/close shows no unbounded growth; metrics/logs contain no content; failures remain recoverable.

**Validation:** Browser/performance command from Task 1.5; native Windows measurements; `pnpm.cmd --filter @voxleaf/desktop test`.

**Status:** Not started.

## Milestone 6: Document and close Milestone 4

### Task 6.1: Document the implemented reader boundary and dependencies

**Outcome:** Architecture/product/development documentation accurately describes implemented reader, persistence, limits, commands, dependencies, and deferred narration/audio behavior.

**Dependencies:** Tasks 1.1-5.4 complete with evidence.

**Areas:** architecture overview/system diagram/ADRs, product docs if behavior changed, setup/testing/dependencies, roadmap, plan indexes, and this plan.

**Acceptance:** Implemented/planned status cannot be confused; commands/paths exist; accepted decisions are not duplicated inconsistently; system diagram review rule is satisfied; no completed historical plan is rewritten as current behavior.

**Validation:** `git diff --check`; manual internal-link/path review; `pnpm.cmd format:check`.

**Status:** Not started.

### Task 6.2: Complete focused, root, native, privacy, and scope validation

**Outcome:** All Milestone 4 behavior and boundaries pass, evidence is recorded, and this plan moves to completed only when nothing remains.

**Dependencies:** Task 6.1 and all prior tasks.

**Areas:** tests/config/docs/plan status only for discovered validation fixes; no unrelated cleanup.

**Acceptance:** Focused desktop/EPUB/shared checks; browser and native matrices; root `check`; CI; privacy/CSP/storage audit; dependency/permission review; no TTS/audio/narration work; final diff reviewed; plan/roadmap status accurate.

**Validation:** Every existing command listed above, the exact browser command added by Task 1.5, native Windows release checks, and current CI. Record exact counts/results/URLs in Final validation results.

**Status:** Not started.

## Acceptance criteria for roadmap Milestone 4

Milestone 4 is complete only when:

- A supported local EPUB can be selected, opened through the public bounded EPUB API, displayed, replaced, and closed in the native desktop shell.
- Title/authors and hierarchical navigation are visible; chapter, TOC, internal-link, previous/next, and direct-locator navigation follow the approved policy.
- Every displayed publication element is built from the closed semantic model; no publisher HTML/CSS/script/URL/DOM ID becomes executable application UI.
- Supported text/list/emphasis/code/language/direction structures render semantically; unsupported/unsafe structures follow documented omission/fallback behavior.
- Raster images either meet an accepted predecode/decode safety policy or use the explicitly accepted placeholder-only fallback.
- One approved reflowable reading mode and the approved bounded preferences work at common desktop, narrow, zoomed, dark/high-contrast, and reduced-motion configurations.
- `ReadingLocatorV1` is the sole position authority; visible selection, direct navigation, reflow, persistence, and restoration all use normalized package locators.
- Reflow preserves the same anchor/code-point passage without relying on page number, pixel offset, or pixel-perfect tests.
- Position records are keyed to exact-byte book identity, decoder validated, content-free, bounded, versioned, and migrated/fallback safely.
- Reselecting an exact-byte-identical known book after book close or application restart restores the exact or nearest valid passage. A modified-byte book does not inherit state.
- New/missing/malformed/stale/future saved state, missing targets/content, image failure, persistence failure, rendering failure, and over-limit chapters have understandable recoverable behavior.
- Keyboard, focus, landmarks, labels/states, screen-reader status, visible focus, zoom, narrow window, high contrast, and reduced motion pass the approved matrix.
- Small, representative, and unusually large chapters satisfy accepted first-content, navigation, restore, reflow, DOM, image, and memory thresholds without logging content.
- Unit/component/integration/real-browser/native tests use deterministic synthetic fixtures and avoid unstable pixel/page/screenshot assertions.
- EPUB bytes/content/images remain local and unpersisted; no network request, raw exception, private path, prose, markup, or bytes enter logs/errors/metrics/storage.
- The implementation remains independent from TTS generation, narration segmentation, audio playback/buffering, speech highlighting, and audio synchronization.
- Documentation, architecture diagram, ADRs, dependency inventory, commands, roadmap, and this plan match the implementation; all focused/root/CI validation passes.

## Risks and mitigations

### Semantic rendering accidentally becomes an HTML trust boundary

**Risk:** Convenience code may reconstruct markup, spread untrusted attributes, or use publisher fragments/URLs in DOM navigation.

**Mitigation:** Approve direct closed-union rendering; prohibit raw HTML APIs; exhaustive switches; security regression tests; CSP/no-network assertions; code review against ADR-0007.

### Browser image decode exhausts memory

**Risk:** A signature-valid compressed image may have enormous dimensions or animation frames before post-decode checks.

**Mitigation:** ADR-0010 requires predecode dimension/pixel/animation checks, one concurrent decode, bounded live sources/pixels, postdecode dimension agreement, exact URL release, static-only support, and placeholder fallback. Task 3.3 must consume that manager rather than create another image path or cache.

### Public navigation targets cannot map to locators

**Risk:** Desktop code may guess from fragments or DOM structure and break package ownership/security.

**Mitigation:** Add one reviewed package target resolver; keep source matching internal; treat non-spine/unavailable targets as inert rather than changing shared locators silently.

### Visible locator oscillates or loses passage during reflow

**Risk:** Intersection/geometry events can race programmatic scroll, images, resize, and preference changes.

**Mitigation:** One coordinator; capture/normalize before change; observer suspension; layout-settle signal rather than sleep; locator equality coalescing; real-browser matrices; block-start fallback.

### Persistence corrupts or leaks reading data

**Risk:** Malformed local JSON, identity mismatch, uncontrolled writes, future versions, metadata/path inclusion, or shutdown loss.

**Mitigation:** Versioned decoder-validated records; exact identity checks; content-free field audit; bounded debounce/keyspace; explicit migration/failure behavior; native restart tests.

### Large chapters freeze or exhaust the webview

**Risk:** The ingestion maximum is not a safe DOM maximum.

**Mitigation:** Measure before selecting limits; one document at a time; incremental work; hard reader-side ceiling/fallback; bounded image work; below/exact/above tests and memory measurements.

### Browser-only tests miss WebView behavior

**Risk:** File input, local storage, CSP, focus, zoom, and lifecycle may differ in packaged WebView2.

**Mitigation:** Real-browser deterministic tests plus mandatory native Windows release smoke/restart matrix; do not treat Ubuntu/WSL as native acceptance.

### Accessibility conflicts with virtualization or programmatic focus

**Risk:** Windowing or automatic scroll can remove screen-reader content, reorder focus, or steal the virtual cursor.

**Mitigation:** Prefer incremental bounded rendering with explicit fallback over unproven virtualization; focus only after explicit navigation; preserve native scrolling; test accessibility tree/keyboard/narrow/zoom/high contrast.

### Plan expands into narration/audio work

**Risk:** “One reading position” may be misread as authorization to add synchronization or playback.

**Mitigation:** Milestone 4 owns only visual location and persistence. Narration/audio contracts may be referenced, not implemented or wired. Review final diff for `services/tts`, audio, narration, and later-plan changes.

### Rollback

Keep tasks independently reviewable. Reader UI/session/persistence modules should be removable without changing secure ingestion or shared v1 semantics. If a dependency/prototype fails, remove it and retain the documented evidence. After persisted v1 records ship, do not destructively reinterpret them; add explicit migration/version handling. Rollback must close publications, revoke object URLs, and preserve the last previously valid local state where practical.

## Progress log

- 2026-07-22: Inspected the complete repository structure, clean `main` at `c386644`, repository instructions, roadmap, product/architecture/development documentation, accepted ADRs, active plans, completed Milestone 2/3 plans, package manifests/configuration, desktop entry points, shared contracts, EPUB public model/locators/resources, test infrastructure, and fixture builder.
- 2026-07-22: Confirmed Milestone 4 is ready to begin decision/prototype work but production rendering is gated by isolation, ingress, raster, target-resolution, persistence, browser-test, large-chapter, and performance decisions.
- 2026-07-22: Identified that detailed navigation/internal links expose `SemanticDocumentTarget` but no public operation resolves that target to `ReadingLocatorV1`; recorded an explicit public API gate rather than assigning fragment matching to the desktop.
- 2026-07-22: Identified that `PersistedReadingStateV1` intentionally omits display preferences and storage selection; recommended a separate app-local versioned preference envelope and prohibited silent shared-v1 expansion.
- 2026-07-22: Created this plan only. No application, test, package, manifest, lockfile, native capability, or production dependency was changed.
- 2026-07-22: Completed Task 1.1. Accepted ADR-0008 for direct rendering of closed semantic values in the application DOM, one continuous-scrolling mode, package-owned target resolution, locator/code-point visible-position sampling, focus and browser-history behavior, and the Milestone 4 boundary from narration/audio. Reconciled architecture, product, roadmap, diagram, and this plan without changing application code or dependencies.
- 2026-07-22: Completed Task 1.2. Implemented a capability-free local-file probe with a browser file input, exact 100-MiB preflight, abortable `FileReader`, post-read length validation, stale-result rejection, same-file reselection, fixed statuses, and no filename/path exposure. Twelve desktop tests passed. A native release WebView2 probe passed small selection, same-file reselection, cancellation, exact maximum, maximum plus one, cleared input, and filename omission. Accepted ADR-0009; retained an empty Tauri capability list and unchanged manifests, locks, Rust shell, and CSP.
- 2026-07-22: Completed Task 1.3. Added dependency-free static GIF/JPEG/PNG/WebP metadata preflight, immutable dimension/pixel/frame/concurrency/live-lifetime limits, postdecode dimension agreement, fixed cancellation/failure/capacity outcomes, and an idempotent object-URL manager. Added the minimum Blob image CSP allowance and a fixed synthetic release-shell probe. Thirty-one desktop tests and repeated native WebView2 decoding passed; accepted ADR-0010. Publication image rendering remains Task 3.3.
- 2026-07-22: Completed Task 1.4. Accepted ADR-0011 for the packaged WebView `localStorage` backend, two fixed bounded envelopes, global app-local display preferences, 500 ms passive-save debounce, lifecycle flushes, exact-byte restoration, fixed nonfatal failures, unsupported-version preservation, and desktop-owned migration. A temporary release-shell marker survived a full process restart and was removed on restore; all temporary source/automation was removed. Persistence implementation remains Tasks 4.4-4.6.
- 2026-07-22: Completed Task 1.5. Selected exact `@playwright/test` `1.61.1` with Chrome for Testing `149.0.7827.55` / revision `1228`, explicit browser acquisition, offline ordinary execution, one-worker fixed-environment configuration, loopback-only production preview, and Windows CI ownership. The first validation found that Vitest also discovered the Playwright spec and that reduced-motion emulation belongs under Playwright context options; separating the test globs and correcting that typed option restored all existing checks. The final Chromium smoke, 31 desktop tests, desktop typecheck/build, root format/lint, and diff checks passed.

## Decision log

| Date | Decision | State |
| --- | --- | --- |
| 2026-07-22 | Roadmap Milestone 4 is the only implementation scope; the older synchronized-reader plan is context for later milestones. | Plan authority established. |
| 2026-07-22 | Reuse exact-byte `BookIdentityV1`, `ReadingLocatorV1`, `PersistedReadingStateV1`, semantic documents, lazy resources, and package locator resolution. | Already approved/implemented. |
| 2026-07-22 | Do not use publisher HTML/CSS/scripts/URLs or activate external links. | Already approved by ADR-0007. |
| 2026-07-22 | Render closed semantic values as exhaustive application-owned React elements in the application DOM; do not reconstruct publisher markup or use an iframe. | Accepted by ADR-0008; implementation remains Task 2.2. |
| 2026-07-22 | Use continuous vertical scrolling as the sole initial reading mode; defer pagination and mode migration. | Accepted by ADR-0008; implementation remains Task 3.4. |
| 2026-07-22 | Use the application-owned WebView file input plus abortable bounded `FileReader`; add no Tauri filesystem/dialog command, plugin, capability, or host-path contract. | Accepted by ADR-0009; opener/session integration remains Tasks 2.2-2.3. |
| 2026-07-22 | Add a closed package-owned semantic-target resolver rather than matching fragments in the desktop; unresolved fragments recover only within the target spine document, while invalid/non-spine/empty targets are unavailable. | Accepted by ADR-0008; implementation remains Task 2.1. |
| 2026-07-22 | Use structural locator plus code-point offset at an application-owned reading line with deterministic block-start fallback. | Accepted by ADR-0008; implementation remains Tasks 3.1-3.3. |
| 2026-07-22 | Keep reader navigation out of browser routes/history; explicit navigation moves focus predictably while passive scrolling, reflow, and initial restoration do not. | Accepted by ADR-0008; implementation remains Tasks 3.3-3.5. |
| 2026-07-22 | Milestone 4 owns the visual active locator only and does not implement narration, TTS, audio, highlighting, or synchronization. | Accepted by ADR-0008; later roadmap milestones retain ownership. |
| 2026-07-22 | Use packaged WebView `localStorage` behind a replaceable asynchronous desktop repository; keep at most 128 exact-book states and one global display-preference record in two fixed size-bounded v1 envelopes. | Accepted by ADR-0011; implementation remains Task 4.4. |
| 2026-07-22 | Preserve unsupported envelopes, migrate only through explicit validated atomic replacement, and never map state across exact-byte identities. | Accepted by ADR-0011; implementation remains Tasks 4.4 and 4.6. |
| 2026-07-22 | Use a trailing 500 ms passive-save debounce plus immediate coalesced explicit/reflow/lifecycle saves that never block navigation or publication closure. | Accepted by ADR-0011; implementation remains Task 4.5. |
| 2026-07-22 | Preflight GIF/JPEG/PNG/WebP dimensions and animation; permit only bounded static Blob URL decode with one concurrent operation and lifecycle-owned release; use placeholders for every rejected image. | Accepted by ADR-0010; semantic image integration remains Task 3.3. |
| 2026-07-22 | Use exact Playwright Test `1.61.1` with its version-coupled Chromium for deterministic layout/browser evidence; acquire browsers only through the explicit setup command, run it in Windows CI, retain jsdom for component tests, and retain native WebView smoke for target-runtime behavior. | Accepted and established by Task 1.5. |
| 2026-07-22 | Select large-chapter and reader latency bounds from synthetic measurements, not arbitrary plan values. | Required evidence; unresolved. |

## Final validation requirements

Before moving this plan to `docs/plans/completed/`:

1. Close every M4-D1 through M4-D12 gate with accepted evidence or explicit deferral/fallback.
2. Confirm every new direct dependency/version/purpose/alternative/license/capability/bundle impact in the dependency inventory and lock diff.
3. Verify file selection and publication replacement/close natively on Windows.
4. Verify no publisher HTML/CSS/script/URL/DOM ID becomes executable UI and CSP makes no remote allowance.
5. Verify semantic element mapping, internal target resolution, TOC hierarchy, chapter controls, and fallback behavior.
6. Verify image predecode/decode/concurrency/lifetime exact/max+1 bounds or the accepted placeholder-only policy.
7. Verify locator DOM/code-point mapping and active reading-line behavior with Unicode, line breaks, images, nested/structural blocks, and stale targets.
8. Verify exact/nearest/new/missing/malformed/future/wrong-identity restoration and canonical post-recovery save.
9. Verify restoration across viewport, typography, theme, narrow/zoom layouts, component remount, book reopen, and native app restart after exact-file reselection.
10. Verify persistence key/value schemas, decoder use, migration dispatch, debounce/lifecycle writes, failure behavior, keyspace bounds, and content-free privacy.
11. Verify keyboard, focus, landmarks, names/states, status announcements, high contrast/forced colors, reduced motion, and screen-reader behavior.
12. Verify small/representative/long/excess chapter behavior against approved latency/DOM/memory/image limits without pixel-perfect assertions.
13. Verify no network request, EPUB/image/audio persistence, raw exception, private path, metadata, prose, markup, URL, bytes, or rejected value enters logs/errors/metrics/storage.
14. Verify one active publication, cancellation/stale-result rejection, observer cleanup, URL revocation, and idempotent close under repeated open/replace/close.
15. Verify no narration preparation, TTS, audio, speech highlighting, synchronization, hardware, model, installer, or unrelated refactor entered the diff.
16. Run focused desktop/EPUB/shared checks, the accepted browser command, native Windows matrix, root `pnpm.cmd check`, and current CI; record exact commands/counts/results/URLs.
17. Review `docs/architecture/system-diagram.md` and update it only for architecture that actually became implemented/approved.
18. Review every changed path/link/command, final diff, Git status, ignored/generated artifacts, permissions, manifests, and locks.
19. Update roadmap status and move this plan to completed only after all acceptance criteria pass and no task remains.

## Final validation results

Production-reader validation has not started. Tasks 1.1 through 1.5 are complete; performance gates, publication-session, renderer, persistence, restoration, and later application implementation tasks remain `Not started`.

Task 1.1 documentation validation completed on 2026-07-22:

- `git diff --check` passed.
- A manual relative-link check confirmed that every relative Markdown target in the changed documentation exists; the roadmap heading link was also reviewed against its target heading.
- Both Mermaid blocks in `docs/architecture/system-diagram.md` were reviewed manually. The repository has no Mermaid validation command, and Task 1.1 did not add a dependency solely for diagram validation.
- `pnpm.cmd format:check` passed in native Windows PowerShell: Prettier, Rustfmt, and Ruff reported no formatting changes required. Markdown is not covered by the configured formatter.
- Final scope review found documentation changes only: one ADR plus focused architecture, product, roadmap, and active-plan reconciliation. No application/test code, manifest, lockfile, generated file, native capability, or dependency changed.

Task 1.2 validation completed on 2026-07-22:

- `pnpm.cmd --filter @voxleaf/desktop typecheck` passed.
- `pnpm.cmd --filter @voxleaf/desktop test` passed: 2 files and 12 tests.
- `pnpm.cmd --filter @voxleaf/desktop build` passed with 17 transformed modules.
- `pnpm.cmd run lint:typescript` passed.
- `pnpm.cmd --filter @voxleaf/desktop tauri build` passed and produced the Windows release executable.
- The authoritative native Windows `pnpm.cmd check` passed formatting, TypeScript/Rust/Python linting and type checks, 547 TypeScript tests, Rust and Python tests, package builds, the Tauri release build, and Python distribution builds.
- The bounded native release WebView2 probe passed small selection, same-file reselection, exactly 104,857,600 bytes, rejection at 104,857,601 bytes, cancellation, cleared input, and absence of all disposable filenames from rendered UI. The disposable files and one-off probe harness were deleted after the run.
- Manifest, lockfile, Rust source, Tauri configuration/capabilities, and CSP diffs are empty. The desktop still does not import `@voxleaf/epub` or claim publication opening.

Task 1.3 validation completed on 2026-07-22:

- `pnpm.cmd --filter @voxleaf/desktop typecheck` passed.
- `pnpm.cmd --filter @voxleaf/desktop test` passed: 4 files and 31 tests.
- `pnpm.cmd --filter @voxleaf/desktop build` passed with 20 transformed modules.
- `pnpm.cmd run lint:typescript` passed.
- `pnpm.cmd --filter @voxleaf/desktop tauri build` passed and produced the Windows release executable.
- The authoritative native Windows `pnpm.cmd check` passed formatting, TypeScript/Rust/Python linting and type checks, 566 TypeScript tests, Rust and Python tests, package builds, the Tauri release build, and Python distribution builds.
- The native release WebView2 probe decoded and released the repository-authored 68-byte static PNG twice and showed only the fixed “Bounded local raster decoding is available” status. The application retained zero Tauri commands/plugins/capabilities; the temporary screenshot and automation harness were removed.
- The only Tauri configuration change is `img-src 'self' blob:`. No package manifest, lockfile, Rust source, shared/EPUB contract, native permission, persistence, network origin, publication integration, or semantic image renderer changed.

Task 1.4 validation completed on 2026-07-22:

- `pnpm.cmd --filter @voxleaf/desktop tauri build` passed for the temporary content-free release-shell probe with 20 transformed frontend modules and a successful optimized Rust build.
- The first clean launch displayed “Persistence probe seeded.”; after complete process closure, the second launch displayed “Persistence probe restored and cleared.” The probe used one fixed marker and retained no book, path, user, or publication data.
- The temporary probe source and one-off Windows UI-automation harness were removed before the documentation diff. `apps/desktop`, package manifests, lockfiles, generated files, Tauri configuration, Rust source, commands, plugins, and capabilities have no Task 1.4 diff.
- `git diff --check`, manual changed-link review, and `pnpm.cmd format:check` passed for the final documentation-only change.
- The final scope review found ADR-0011 plus focused architecture, roadmap, and active-plan reconciliation only. No persistence behavior is claimed implemented; Tasks 4.4-4.6 retain repository, save, and restoration ownership.

Task 1.5 validation completed on 2026-07-22:

- `pnpm.cmd test:browser:install` explicitly installed Chrome for Testing `149.0.7827.55` / revision `1228`, matching headless shell, FFmpeg `1011`, and Winldd `1007` into Playwright's default Windows user cache.
- `pnpm.cmd test:browser` passed after final configuration: 1 fixed Chromium smoke in 3.0 seconds against the production Vite build.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` passed.
- `pnpm.cmd --filter @voxleaf/desktop test` passed: 4 files and 31 tests; Vitest does not discover the Playwright spec.
- `pnpm.cmd --filter @voxleaf/desktop build` passed with 20 transformed modules.
- `pnpm.cmd format:check` and `pnpm.cmd lint` passed, including Prettier, Rustfmt, Ruff format/check, ESLint, and Clippy.
- `git diff --check` passed. The dependency is development-only; no application behavior, production dependency/bundle, EPUB/shared contract, Tauri command/plugin/capability, CSP, private input, book fixture, or native-WebView behavior changed.

Plan-creation validation completed on 2026-07-22:

- `git diff --check` passed for tracked changes, and a separate untracked-file whitespace check passed for this new plan.
- Manual verification confirmed that changed Markdown links and mentioned current paths resolve or are explicitly identified as future areas.
- `pnpm.cmd format:check` passed in native Windows PowerShell: Prettier, Rustfmt, and Ruff reported no formatting changes required. Markdown is not covered by the configured formatter, so this plan was reviewed manually.
- The final scope review found only this plan plus the active-plan index, documentation plan index, roadmap plan relationship, and overlap note in the older active plan. No application, test, package, manifest, lockfile, workflow, native capability, or production dependency changed.
