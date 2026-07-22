# Testing strategy

## Principles

- Test observable behavior.
- Keep tests deterministic.
- Use synthetic or public-domain text.
- Never require proprietary EPUBs or committed model weights.
- Separate correctness tests from hardware-dependent performance benchmarks.

## Deterministic foundation checks

Run `pnpm.cmd check` from native Windows after the locked JavaScript and Python environments are installed. It is the authoritative local foundation check and covers formatting, linting, type checking, smoke tests, framework-independent package builds, the React production build, the native Tauri release executable, and the Python source and wheel distributions.

GitHub Actions runs the same authoritative check in the `Windows native foundation` job on `windows-2025`. The separate `Ubuntu portable foundation` job runs `pnpm check:portable` on `ubuntu-24.04`, covering TypeScript and Python validation plus the browser-only desktop build without installing Rust or Linux desktop dependencies. A portable success does not replace native Windows validation.

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
- `packages/shared/src/contracts/serialized-conformance.test.ts` and `services/tts/tests/test_contract_conformance.py` consume the same checked-in manifest of synthetic serialized fixtures and validate it against the same offline canonical Draft 2020-12 schemas. The corpus covers every current root contract family, supported and unsupported versions, omitted optional fields, closed unknown fields, strict numeric types and bounds, and explicitly labels its only narration-text fixture as sensitive. Neither test starts a model, server, process, network connection, audio device, or runtime service.
- `pnpm.cmd --filter @voxleaf/shared generate:check` deterministically verifies that committed TypeScript wire DTOs match the canonical JSON Schema files.
- `packages/epub/src/index.test.ts` proves that the isolated EPUB package consumes synthetic book and locator contracts through the public `@voxleaf/shared` workspace boundary and exports only the validated `openEpubPublication` runtime entry point. `packages/epub/src/document/document-model.test.ts` exercises the public closed block/inline/navigation/resource/locator shapes, readonly recursive collections, opaque identifier separation, spine/non-spine documents, and explicit resource-read/locator-resolution/close lifecycle. Package-internal path, archive, processing-budget, XML-event, package, identity, navigation, XHTML projection, resource, and locator suites exercise untrusted ingestion with synthetic in-memory inputs, strict byte/count/depth/ratio/text/semantic-block limits, injected cancellation/deadlines, namespace-aware XML, fixed content-free failures, and no filesystem, network, worker, or DOM use. `packages/epub/test-support/epub-fixture.ts` supplies test-only deterministic arbitrary-ZIP, minimal-EPUB, comprehensive-EPUB, and documented byte-mutation builders with fixed order, timestamps, attributes, compression, and writer capabilities; `packages/epub/src/testing/epub-fixture.test.ts` proves repeated byte identity, fixed metadata, rich public opening, malformed construction, stale-checked mutations, caller-owned inputs, and no network or worker behavior. `packages/epub/src/public/open-epub-publication.test.ts` reuses the minimal builder to drive repository-authored in-memory EPUB bytes through the public opener and proves immutable semantic/navigation/resource/locator assembly, exact resolution, close, every closed detail-to-`OperationalErrorV1` mapping, unknown-exception redaction, value-based invalid/cancelled results, and no network or worker capability. `packages/epub/src/integration/ingestion-matrix.test.ts` drives minimal, comprehensive, and adversarial deterministic EPUB bytes through the public boundary and proves representative failure at every ingestion stage, every untrusted-input detail family, rich deterministic success, shared-contract acceptance, lazy resource behavior, locator exact/recovery behavior, lifecycle closure, failure cleanup, privacy redaction, and absence of external capabilities. `packages/epub/src/document/xhtml-projector.test.ts` additionally proves allowlisted block/inline order, inherited language and direction, ordinary/code whitespace policy, opaque local links and images, inert external-link labels, omission of active/style/hidden/foreign/remote content, transactional failures, exact/max+1 content-document-byte and semantic-block accounting, and internal globally unique source-ID capture without changing semantic output. `packages/epub/src/resource/opened-publication.test.ts` proves lazy local GIF/JPEG/PNG/WebP reads, declared-size and signature gates, opaque immutable descriptors, independent caller-owned allocations, read-scoped and close-triggered cancellation, single-read concurrency, idempotent release, and closed-handle behavior without caching or external capabilities. `packages/epub/src/locator/locator-index.test.ts` proves final preorder assignment, exact/max+1 source-ID acceptance, deterministic duplicate/invalid/collision replacement, exact-byte and spine binding, shared-decoder round trips, Unicode code-point offsets, cancellation, immutability, and content-free failures. `packages/epub/src/locator/locator-resolver.test.ts` proves exact full-tuple resolution, wrong-book and malformed rejection, nearest offset/anchor/spine/book-start recovery, deterministic earlier-spine tie breaking, canonical immutable output, cancellation, and content-free failures without prose, page, or layout search. Rendering, CFI parsing, saved-position application restoration, narration normalization, and persistence remain later work.
- `apps/desktop/src/file-ingress/local-epub-file.test.ts` verifies exact/max-plus-one size preflight without allocating a 100-MiB fixture, invalid sizes, caller-owned bytes, post-read length mismatch, active `FileReader` abort, and fixed content-free read failures. `apps/desktop/src/App.test.tsx` verifies the accessible file control and status, accept hint, browser-picker cancellation, same-input clearing, private-filename omission, replacement cancellation/stale-result rejection, and unmount cleanup.
- `services/tts/tests/test_health.py` imports the Python package and verifies its version function without loading a model, opening a server, using audio, or requiring hardware.
- `cargo test` validates the native crate's test harness and compilation. The minimal Rust shell currently contains zero Rust unit tests because it has no domain behavior.

The formatting, linting, type-checking, and production builds in `pnpm.cmd check` are deterministic validation stages, but they are not substitutes for behavior tests once product logic exists.

### Native local-file ingress probe

ADR-0009 also requires native Windows WebView2 evidence because jsdom cannot prove packaged file-input behavior. Build and launch the release executable, then use disposable synthetic `.epub`-named files outside the repository to verify:

1. a small file reaches the fixed ready status without displaying its filename;
2. selecting that same file again reaches ready again;
3. cancelling the picker reaches the fixed non-error cancelled status;
4. exactly 104,857,600 bytes reaches ready;
5. 104,857,601 bytes reaches the fixed too-large status without a read; and
6. the input clears after each selection and no path, filename, bytes, or raw browser error appears in the UI or console.

Do not use or commit a private or copyrighted EPUB for this probe. Task 1.2 passed this matrix with disposable zero-filled/synthetic files in the release WebView2 executable; the files and one-off automation harness were removed afterward. This probe validates only file selection and bounded byte transfer. Until Tasks 2.2-2.3 integrate the EPUB opener, it does not prove book opening.

### EPUB ingestion matrix traceability

The public integration matrix uses the production defaults and public API. It proves one rich repeated success plus representative archive, package, navigation, semantic-document, resource, cancellation, locator, and closed-lifecycle failures. Every expected open failure returns a fixed shared-decoder-valid error without a partial publication, closes retained archive state, emits no sensitive canary or console output, and invokes no network or worker capability.

Exhaustive adversarial mutations and exact/max+1 limits remain in the package-internal owner suites, where strict policy and deterministic clock injection are available. The integration matrix contains a compile-time-exhaustive map from every `EpubIngestionPolicy` field to those owner tests. This split avoids generating impractically large default-limit archives and avoids exposing policy or clock overrides through the public API solely for tests.

### Focused test commands

Run these from the repository root in native Windows PowerShell:

```powershell
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/desktop test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
uv run --project services/tts --locked pytest services/tts
```

## Deferred coverage

The secure EPUB ingestion scenario and boundary matrix is implemented with repository-authored synthetic inputs. No current test renders those publications, restores a saved reading locator through an application or persistence boundary, starts a TTS model, communicates across a process boundary, generates or plays audio, persists reading state, detects hardware, measures performance, builds an installer, or exercises an end-to-end reader flow. The examples below are requirements for later roadmap milestones, not claims about current coverage.

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
