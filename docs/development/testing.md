# Testing strategy

## Principles

- Test observable behavior.
- Keep tests deterministic.
- Use synthetic or public-domain text.
- Never require proprietary EPUBs or committed model weights.
- Separate correctness tests from hardware-dependent performance benchmarks.

## Deterministic foundation checks

Run `pnpm.cmd check` from native Windows after the locked JavaScript and Python environments are installed. It is the authoritative local foundation check and covers formatting, linting, type checking, smoke tests, framework-independent package builds, the React production build, the native Tauri release executable, and the Python source and wheel distributions.

GitHub Actions runs the same authoritative check in the `Windows native foundation` job on `windows-2025`. That job also explicitly installs the Playwright-managed Chromium revision and runs `pnpm.cmd test:browser` before the aggregate check. The root browser command builds the shared and EPUB workspace packages before Playwright starts Vite, so a clean runner does not depend on ignored package `dist` outputs from an earlier command. The separate `Ubuntu portable foundation` job runs `pnpm check:portable` on `ubuntu-24.04`, covering TypeScript and Python validation plus the browser-only desktop build without installing Rust, Playwright browsers, or Linux desktop dependencies. A portable success does not replace native Windows validation.

Both jobs install from committed lockfiles. They do not use repository secrets, model weights, GPU hardware, books, generated audio, network services, or performance benchmarks. Network access is limited to tool and dependency installation before the deterministic checks execute.

### Implemented deterministic tests

The current tests are deterministic and layered by ownership:

- `packages/shared/src/index.test.ts` proves that the shared production and test-support subpaths resolve independently and that fixed test identifiers are not exposed from the production root.
- `packages/shared/src/primitives/*.test.ts` verify opaque identifier separation, numeric-unit separation, JSON-compatible bounds, and supported schema-version handling without private input in errors.
- `packages/shared/src/contracts/book.test.ts` verifies versioned book identity, ordered spine metadata, local resources, navigation relationships, malformed structures, unsupported versions, and content-free errors using only synthetic values.
- `packages/shared/src/contracts/locator.test.ts` verifies content-free locator round trips, optional progression, closed versioned anchors, deterministic range ordering, cross-book rejection, and content-free errors without resolving an EPUB.
- `packages/shared/src/contracts/persisted-reading-state.test.ts` verifies deterministic content-free state round trips, matching book and locator identities, closed minimal preferences, unsupported-version handling, no coercion, private-path rejection, and content-free errors without reading or writing storage.
- `packages/shared/src/contracts/reading-session.test.ts` verifies versioned active-session decoding, distinct session/generation identities, deterministic active versus stale eligibility, separate cancellation intent, malformed-identity rejection, and content-free errors without invoking a queue, process, or model.
- `packages/shared/src/contracts/narration-segment.test.ts` verifies synthetic locator-linked narration segments, stable segment/session/generation identities, ordered source ranges, strict nonempty text and sequence validation, nested-version handling, and errors that do not expose sensitive narration text. It does not select normalization, segmentation, language, or prosody behavior.
- `packages/shared/src/contracts/operational-error.test.ts` verifies the closed operational-error taxonomy, fixed category and recoverable/fatal semantics, version handling, and rejection of free-form messages, content, audio, stacks, and private paths.
- `packages/shared/src/contracts/capability-report.test.ts` verifies explicit supported, unsupported, and unknown states for every model-independent v1 feature, closed-field compatibility, version handling, and rejection of model, device, vendor, path, or content details without probing real hardware.
- `packages/shared/src/contracts/audio-frame.test.ts` verifies payload-free frame metadata, branded ownership identities, exact sample-derived whole-millisecond calculations, aggregate-before-truncation behavior, numeric and duration-overflow boundaries, contiguous sequencing, unique frame IDs, stable format, segment termination, and content-free errors without audio devices or payloads.
- `packages/shared/src/contracts/buffer-status.test.ts` verifies payload-free, session-bound buffer snapshots; explicit playable-duration units; low/target/maximum ordering; below/exactly-at/above-target states; bounded duration; underrun counts; and rejection of invalid state combinations, payload fields, fixed waits, and private text without implementing a buffer or player.
- `packages/shared/src/testing/manual-clock.test.ts` verifies an explicit-start, manually advanced test clock; deterministic first-scheduled ordering for equal-time callbacks; pending-work inspection and cleanup; invalid-input rejection; and safe millisecond overflow handling without reading real time or scheduling real timers.
- `packages/shared/src/testing/synthetic-document.test.ts` verifies a labeled synthetic multi-spine document fixture with navigation, headings, paragraphs, dialogue, a scene boundary, and local image metadata; named malformed inputs; and a deterministic scripted fake source without archives, filesystems, network access, a DOM, sanitization, or rendering.
- `packages/shared/src/testing/fake-tts-source.test.ts` verifies a manually-clocked, metadata-only fake TTS source with scripted delays, frame durations, recoverable and fatal errors, immediate cancellation acknowledgment, and deliberately late completions whose session, generation, and segment identities let consumers reject stale work. It never loads a model, emits audio payloads, starts a process, contacts a service, or uses hardware.
- `packages/shared/src/testing/fake-audio-pipeline.test.ts` verifies a manually-clocked metadata-only audio source and sink. It records accepted, stale-session, stale-generation, duplicate, out-of-order, sequence-gap, and end-of-stream outcomes, with only accepted active frames contributing to its diagnostic playable-duration total. It never creates audible output, stores audio, opens an audio device, or implements a production buffer or player.
- `packages/shared/src/contracts/serialized-conformance.test.ts` and `services/tts/tests/test_contract_conformance.py` consume the same checked-in manifest of synthetic serialized fixtures and validate it against the same offline canonical Draft 2020-12 schemas. The TypeScript suite also requires every generated standalone predicate to return the same result as a freshly compiled canonical-schema validator for every fixture. The corpus covers every current root contract family, supported and unsupported versions, omitted optional fields, closed unknown fields, strict numeric types and bounds, and explicitly labels its only narration-text fixture as sensitive. Neither test starts a model, server, process, network connection, audio device, or runtime service.
- `pnpm.cmd --filter @voxleaf/shared generate:check` deterministically verifies that committed TypeScript wire DTOs and self-contained standalone validators match the canonical JSON Schema files. Generation fails on an unregistered runtime helper, runtime `require`, `eval`, or dynamic `Function` construction.
- `packages/epub/src/index.test.ts` proves that the isolated EPUB package consumes synthetic book and locator contracts through the public `@voxleaf/shared` workspace boundary and exports only the validated `openEpubPublication` runtime entry point. `packages/epub/src/document/document-model.test.ts` exercises the public closed block/inline/navigation/resource/locator shapes, readonly recursive collections, opaque identifier separation, spine/non-spine documents, and explicit resource-read/locator-resolution/close lifecycle. Package-internal path, archive, processing-budget, XML-event, package, identity, navigation, XHTML projection, resource, and locator suites exercise untrusted ingestion with synthetic in-memory inputs, strict byte/count/depth/ratio/text/semantic-block limits, injected cancellation/deadlines, namespace-aware XML, fixed content-free failures, and no filesystem, network, worker, or DOM use. The XML/package regressions accept and omit valid legacy `meta name/content` compatibility values plus the inert HTML doctype in content documents while continuing to reject mixed/malformed metadata, package/container or non-HTML doctypes, public/system identifiers, internal subsets, custom entities, XInclude, and external-resource processing instructions. `packages/epub/test-support/epub-fixture.ts` supplies test-only deterministic arbitrary-ZIP, minimal-EPUB, comprehensive-EPUB, and documented byte-mutation builders with fixed order, timestamps, attributes, compression, and writer capabilities; `packages/epub/src/testing/epub-fixture.test.ts` proves repeated byte identity, fixed metadata, rich public opening, malformed construction, stale-checked mutations, caller-owned inputs, and no network or worker behavior. `packages/epub/src/public/open-epub-publication.test.ts` reuses the minimal builder to drive repository-authored in-memory EPUB bytes through the public opener and proves immutable semantic/navigation/resource/locator assembly, compatibility opening, exact resolution, close, every closed detail-to-`OperationalErrorV1` mapping, unknown-exception redaction, value-based invalid/cancelled results, and no network or worker capability. `packages/epub/src/integration/ingestion-matrix.test.ts` drives minimal, comprehensive, and adversarial deterministic EPUB bytes through the public boundary and proves representative failure at every ingestion stage, every untrusted-input detail family, rich deterministic success, shared-contract acceptance, lazy resource behavior, locator exact/recovery behavior, lifecycle closure, failure cleanup, privacy redaction, and absence of external capabilities. `packages/epub/src/document/xhtml-projector.test.ts` additionally proves allowlisted block/inline order, inherited language and direction, ordinary/code whitespace policy, opaque local links and images, inert external-link labels, omission of active/style/hidden/foreign/remote content, transactional failures, exact/max+1 content-document-byte and semantic-block accounting, and internal globally unique source-ID capture without changing semantic output. `packages/epub/src/resource/opened-publication.test.ts` proves lazy local GIF/JPEG/PNG/WebP reads, declared-size and signature gates, opaque immutable descriptors, independent caller-owned allocations, read-scoped and close-triggered cancellation, single-read concurrency, idempotent release, and closed-handle behavior without caching or external capabilities. `packages/epub/src/locator/locator-index.test.ts` proves final preorder assignment, exact/max+1 source-ID acceptance, deterministic duplicate/invalid/collision replacement, exact-byte and spine binding, shared-decoder round trips, Unicode code-point offsets, cancellation, immutability, and content-free failures. `packages/epub/src/locator/locator-resolver.test.ts` proves exact full-tuple resolution, wrong-book and malformed rejection, nearest offset/anchor/spine/book-start recovery, deterministic earlier-spine tie breaking, canonical immutable output, cancellation, and content-free failures without prose, page, or layout search. Rendering, CFI parsing, saved-position application restoration, narration normalization, and persistence remain later work.
- `apps/desktop/src/file-ingress/local-epub-file.test.ts` verifies exact/max-plus-one size preflight without allocating a 100-MiB fixture, invalid sizes, caller-owned bytes, post-read length mismatch, active `FileReader` abort, and fixed content-free read failures. `apps/desktop/src/publication/publication-session.test.ts` proves one cancellable/replaced publication lifecycle, stale-success cleanup, shared close, reopen, and package-error redaction. `apps/desktop/src/publication/local-publication-open.test.ts` composes both boundaries and proves the real invalid-input path, replacement-at-selection cleanup, abort/stale-read rejection, bounded-byte handoff, closed read/package/close outcome mapping, unmount cleanup, and unexpected-failure containment. `apps/desktop/src/reader/reader-lifecycle.test.ts` proves immutable idle/opening/ready/empty/failure/closing states, zero-locator empty classification, prior-publication clearing, stale completion rejection, shared close, reopen, cleanup invalidation, renderer-failure cleanup, and content-free failures. `apps/desktop/src/reader/large-chapter-rendering.test.ts` proves recursive below/exact/above semantic-block and projected-node boundaries plus exact 250-block scheduling, one pending yield, cancellation, and stale-callback rejection. `apps/desktop/src/reader/SemanticDocument.test.tsx` proves exhaustive semantic headings, paragraphs, block quotes, ordered/unordered lists, text, emphasis, strong text, code, line breaks, inherited language/direction, source order, React text escaping, available/inert internal-target presentation, accessible unloaded raster fallback, omission of publisher attributes/styles/identities/URLs from rendered markup, first/next incremental batches, and no partial content above the ceiling. `apps/desktop/src/reader/ReaderPublication.test.tsx` proves canonical coordinator state, exact and recovered target resolution, non-spine unavailability, chapter boundaries, hierarchical TOC order, fixed unavailable explanations, TOC/internal/chapter convergence, explicit destination focus, last-valid-locator preservation/recovery around an oversized destination, and absence of anchors, hrefs, source fragments, DOM IDs, or browser-history mutation. `apps/desktop/src/reader/raster-image-policy.test.ts` verifies narrow GIF/JPEG/PNG/APNG/WebP metadata parsing, exact/max-plus-one dimensions/pixels/frames, static-only policy, malformed/type-mismatched rejection, and equal-or-stricter policy construction. `apps/desktop/src/reader/raster-image-source.test.ts` verifies one-decode concurrency, live source/pixel capacity, postdecode agreement, cancellation, fixed errors, no network calls, and exact object-URL release/close behavior. `apps/desktop/src/reader/publication-raster-image-loader.test.ts` verifies one serialized resource-read/decode path, the eight-outstanding-operation ceiling, queued cancellation, fixed unknown/read-failure fallback, caller-owned byte clearing, shared idempotent close, and content-free results. `apps/desktop/src/reader/SemanticRasterImage.test.tsx` verifies visibility-gated loading, semantic/missing alternative-text presentation, local ready rendering, late-result rejection, abort/release on unmount, final `<img>` failure fallback, and omission of resource identity. `apps/desktop/src/App.test.tsx` verifies the accessible six-state surface, busy/status semantics, accept hint, browser-picker cancellation, same-input clearing, validated metadata plus starting-spine semantic rendering without resource/target resolution when navigation is empty, zero-content recovery, explicit close/reopen, fixed open/close/render failure messages, private-filename/metadata/error omission, stale-result rejection, render-boundary cleanup, unmount cleanup, and the independent synthetic raster-probe presentation.
- `apps/desktop/tests/browser/foundation.smoke.spec.ts` runs the production Vite build in Playwright's pinned Chromium with a fixed locale, timezone, color scheme, reduced-motion preference, and initial viewport. It proves role/name/heading/status semantics, real file-control focus, the production invalid-file read/open mapping with cleared private filename, repository-authored comprehensive EPUB opening, visibility-triggered local Blob image decode, semantic alt text, chapter-change object-URL revocation and reload, hierarchical TOC/internal-link/previous-next navigation, explicit destination focus, disabled final boundary, unchanged browser URL, no generated anchors/hrefs or resource path, wide and narrow no-horizontal-overflow geometry, isolated controllable Web Storage, deterministic marker/server/context cleanup, and zero non-loopback requests. `apps/desktop/tests/browser/large-chapter.smoke.spec.ts` opens a repository-authored 10,001-block EPUB through the production path and proves the fixed recoverable fallback appears before any publisher block, exposes no filename/URL, remains closable, and makes no external request. These tests do not claim passive visible-position tracking, restoration, WebView2 navigation behavior, or full automated accessibility coverage.
- `apps/desktop/tests/browser/reader-performance.benchmark.spec.ts` is a separate native-Windows Playwright benchmark. It retains Task 1.6's complete/incremental synthetic DOM profiles at 250, 2,000, 10,000, 20,000, and 50,000 blocks; generated one/eight-image and combined envelopes; and accepted prototype gates. Task 3.6 adds the production Vite/React exact-limit EPUB case, holds after the first 250-block commit, observes all 39 remaining callback-to-DOM commits, navigates to a deep target, reflows preferences, and measures incremental plus full-application DOM/heap/Chromium working-set growth. The command builds required workspace packages, records only content-free metrics, remains excluded from ordinary browser tests and CI, and does not replace Task 5.3's native WebView2/restoration matrix.
- `services/tts/tests/test_health.py` imports the Python package and verifies its version function without loading a model, opening a server, using audio, or requiring hardware.
- `cargo test` validates the native crate's test harness and compilation. The minimal Rust shell currently contains zero Rust unit tests because it has no domain behavior.

The formatting, linting, type-checking, and production builds in `pnpm.cmd check` are deterministic validation stages, but they are not substitutes for behavior tests once product logic exists.

### Native local-file open flow

ADR-0009 also requires native Windows WebView2 evidence because jsdom and Chromium cannot prove packaged file-input behavior. Build and launch the release executable, then use disposable repository-authored synthetic files outside the repository to verify:

1. a valid synthetic EPUB reaches success and shows only its repository-authored title/authors, never its filename;
2. selecting that same EPUB again reopens it successfully and closes the prior publication;
3. cancelling the picker preserves the prior ready or idle state without an error;
4. replacing an opening/ready book with a malformed EPUB reaches the fixed invalid state and cannot restore stale metadata;
5. exactly 104,857,600 bytes passes the early size gate and then reaches the package's fixed invalid/unsupported/resource outcome, while 104,857,601 bytes reaches the fixed too-large state without a read; and
6. the input clears after every selection and no path, filename, bytes, MIME claim, package detail, or raw browser error appears in the UI or console.

Do not use or commit a private or copyrighted EPUB for this probe. Task 1.2 passed the selection/read subset with disposable zero-filled/synthetic files in the release WebView2 executable; those files and the one-off automation harness were removed afterward. Task 2.3 requires repeating the integrated valid-open/replacement/error behavior before its native evidence is complete.

### Native startup and CSP regression

The white-window defect demonstrated that the Chromium production-preview smoke does not apply the packaged Tauri CSP: the former Ajv runtime compilation was blocked before React mounted even though browser and unit tests passed. Run `pnpm.cmd test:native-startup` on native Windows to build the release executable, launch it with a disposable isolated WebView2 profile and loopback-only debugging endpoint, and verify root mount, the visible main landmark, the repository-authored comprehensive EPUB open, local Blob decode/presentation of its static PNG, publication close/image removal, zero page/console errors, and zero external requests. The harness exposes only fixed stage failures, never logs the fixture, filename, URL, page error, console value, publication content, or image bytes, and removes its temporary profile and EPUB.

Task 2.5 replaced runtime compilation with committed generated predicates, made Ajv generation/test-only, removed `unsafe-eval`, and added a Vite production-build guard that rejects every Ajv module plus runtime `eval`/`Function` construction. Re-run `pnpm.cmd test:native-startup` after every Tauri/WebView2, CSP, shared-validator generation, publication-open bundling, or native-startup change. The valid open/close proves that the generated book validator executes in WebView2; the broader reselection/cancellation/replacement/limit matrix above remains separate native evidence for Task 2.3.

This native command runs only on Windows and is separate from `pnpm.cmd check:portable`. The authoritative Windows CI job runs it after the aggregate checks; no Playwright browser download is needed for CDP attachment to the installed WebView2 runtime.

### Native raster decode safety probe

ADR-0010 requires native Windows WebView2 evidence because jsdom cannot execute `HTMLImageElement.decode()` or prove the packaged CSP. `pnpm.cmd test:native-startup` now opens the comprehensive synthetic EPUB, scrolls its image host into the lazy-load margin, requires a visible 1×1 `<img>` with semantic alt text and an application-created `blob:` source, closes the publication, and verifies the image is removed with no page/console error or external request. For the isolated manager boundary, build and launch the release executable and activate **Run synthetic raster safety probe**. The fixed status must change from “Raster safety probe has not run” to “Bounded local raster decoding is available.” Repeat the probe to verify that the prior synthetic source was released and a new Blob URL can be decoded under `img-src 'self' blob:`.

Both native paths use caller-owned copies of one checked-in 68-byte repository-authored static PNG value. The isolated button probe never uses a selected file or publication resource and creates no visible image, filename, path, URL, bytes, or raw error. The automated comprehensive fixture proves publication integration without using private input. Fixed unavailable state remains failure evidence and must not be rewritten into success. Deterministic tests, rather than this one-pixel native smoke, own exact/max-plus-one dimensions, pixels, frames, concurrency, live capacity, cancellation, postdecode mismatch, queued/stale work, byte clearing, and exact revocation behavior. Repeat native startup after material Tauri/WebView2, CSP, Blob/object-URL, image-decoder, raster-loader, or raster-boundary changes.

### EPUB ingestion matrix traceability

The public integration matrix uses the production defaults and public API. It proves one rich repeated success plus representative archive, package, navigation, semantic-document, resource, cancellation, locator, and closed-lifecycle failures. Every expected open failure returns a fixed shared-decoder-valid error without a partial publication, closes retained archive state, emits no sensitive canary or console output, and invokes no network or worker capability.

Exhaustive adversarial mutations and exact/max+1 limits remain in the package-internal owner suites, where strict policy and deterministic clock injection are available. The integration matrix contains a compile-time-exhaustive map from every `EpubIngestionPolicy` field to those owner tests. This split avoids generating impractically large default-limit archives and avoids exposing policy or clock overrides through the public API solely for tests.

### Focused test commands

Run these from the repository root in native Windows PowerShell:

```powershell
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd benchmark:reader
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
uv run --project services/tts --locked pytest services/tts
```

The browser command requires one prior networked `pnpm.cmd test:browser:install`. Ordinary execution does not download browsers and can run offline after that setup. It uses a fresh isolated context, blocks and counts non-loopback requests, removes its fixed test storage key, and lets Playwright stop the loopback preview server. Failure-only traces and screenshots are ignored artifacts and may contain only repository-authored synthetic test content. The native-startup command uses Playwright only as a CDP client for the installed WebView2 runtime and creates no browser artifact. Chromium and WebView2 evidence remain complementary.

### Hardware-specific visual-reader benchmark

Run `pnpm.cmd benchmark:reader` only from native Windows after `pnpm.cmd test:browser:install`. The benchmark launches fresh pinned Chromium processes and queries their numeric process IDs through CDP so a fixed PowerShell query can record aggregate working set. It emits only fixed fixture labels, block/image/node counts, durations, heap values, pixel counts, and byte totals. It disables trace, screenshot, and video capture; uses only repository-authored synthetic content and an in-memory generated EPUB for the production case; makes no external network request; and writes only ignored Playwright result artifacts.

The benchmark is deliberately absent from `pnpm.cmd check`, `pnpm check:portable`, and GitHub Actions because its pass/fail latency and memory gates belong to the documented Windows reference host. Task 1.6 results and exact accepted limits are in [`../architecture/performance-budget.md`](../architecture/performance-budget.md#visual-reader-reference-limits). Re-run it after material changes to the semantic renderer, batching, reader styles, locator restoration/reflow, image lifecycle, Chromium/WebView version, or reference hardware. Task 3.6 supplies production React measurements; Task 5.3 retains native WebView2 and restoration evidence.

## Deferred coverage

The secure EPUB ingestion scenario and boundary matrix is implemented with repository-authored synthetic inputs, the real-browser smokes open EPUB publications through the production React reader, and the separate benchmark covers accepted prototype and production React limits. No current test restores a saved locator through application/persistence boundaries, measures native WebView2 reader performance, starts a TTS model, communicates across a process boundary, generates or plays audio, persists reading state, detects supported hardware, builds an installer, or exercises those later end-to-end flows. The examples below are requirements for later roadmap milestones, not claims about current coverage.

## Test levels

### Unit

Examples:

- EPUB path validation.
- Text normalization.
- Sentence and paragraph chunking.
- Queue bounds and ordering.
- Reading-session invalidation.
- Buffer calculations.
- Position persistence.
- Reading-locator serialization, resolution, and nearest-valid fallback.
- Reflow calculations preserve the logical reading location.
- Startup gating uses playable audio duration rather than elapsed wall-clock time.

### Integration

Examples:

- EPUB navigation and spine extraction from a small safe fixture.
- Mapping between sanitized rendered content, semantic chunks, and stable reading locators.
- Desktop-to-TTS protocol.
- TTS service lifecycle.
- Cancellation across the process boundary.
- Audio frame ordering.

### End to end

Critical journeys:

- Open a valid EPUB.
- Display it as a readable reflowable ebook rather than a plain narration transcript.
- Navigate to a passage, close the book, reopen it, and verify that the same passage is visible.
- Start playback.
- Verify that narration starts from the visible passage and keeps the active paragraph on screen.
- Verify that playback starts as soon as approximately 15 seconds of playable audio is buffered, without a fixed 15-second delay.
- Pause and resume.
- Seek to another paragraph.
- Change chapters.
- Recover from model-loading failure.
- Close the book and release resources.

### Performance

Report separately:

- Cold model load.
- Warm time to first audio.
- Playable audio depth when playback starts.
- Delay between satisfying the initial audio threshold and audible playback.
- Real-time factor.
- Buffer underrun frequency and duration.
- Cancellation latency.
- CPU, GPU, VRAM, and RAM use.

Performance tests may be hardware-specific, but their input text and procedure must be reproducible.

## Fixtures

Fixtures must be:

- Synthetic and committed directly.
- Public-domain with provenance documented.
- Small enough for fast deterministic tests.

Do not use copyrighted commercial books.
