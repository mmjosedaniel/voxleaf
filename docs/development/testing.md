# Testing strategy

## Principles

- Test observable behavior.
- Keep tests deterministic.
- Use synthetic or public-domain text.
- Never require proprietary EPUBs or committed model weights.
- Separate correctness tests from hardware-dependent performance benchmarks.

## Deterministic foundation checks

Run `pnpm.cmd check` from native Windows after the locked JavaScript and Python environments are installed. It is the authoritative local foundation check and covers formatting, linting, type checking, smoke tests, framework-independent package builds, the React production build, the native Tauri release executable, and the Python source and wheel distributions.

GitHub Actions runs the same authoritative check in the `Windows native foundation` job on the explicit supported `windows-2022` image. That image is pinned as the known-good hosted image/runtime pair: Tauri's supported EdgeDriver launch created its automation marker with WebView2 `131.0.2903.86`, while repeated `windows-2025` runs with WebView2 `150.0.4078.65` kept the host process alive without creating `DevToolsActivePort`. Because the runner image and WebView2 major version changed together, this evidence does not isolate an operating-system defect from a WebView2 150 or image/runtime interaction. The job also explicitly installs the Playwright-managed Chromium revision and runs `pnpm.cmd test:browser` before the native smoke and aggregate check. The root browser command builds the shared and EPUB workspace packages before Playwright starts Vite, so a clean runner does not depend on ignored package `dist` outputs from an earlier command. The separate `Ubuntu portable foundation` job runs `pnpm check:portable` on `ubuntu-24.04`, covering TypeScript and Python validation plus the browser-only desktop build without installing Rust, Playwright browsers, or Linux desktop dependencies. A portable success does not replace native Windows validation.

Both foundation jobs check out complete Git history. Frozen TTS result validators
use strict Git ancestry to prove that an execution commit follows its authority
checkpoint, so a depth-one checkout cannot supply the required evidence.

Both jobs install from committed lockfiles. They do not use repository secrets, model weights, GPU hardware, books, generated audio, network services, or performance benchmarks. Network access is limited to explicit tool/dependency acquisition and the signed WebView2/EdgeDriver setup; test execution itself uses no external service.

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
- `services/tts/tests/test_benchmark_corpus_authority.py` freezes the Milestone 6 synthetic Spanish corpus bytes, code-point/UTF-8 counts, order, category/Unicode coverage, Milestone 5 size boundaries, privacy canaries, ignored raw layout, and tracked-artifact exclusions. `services/tts/tests/test_benchmark_summary_authority.py` validates the private allowlist-only summary schema plus sample-derived duration/RTF, fixed observation counts/order, nearest-rank distributions, sustained totals, cancellation cleanup, and explicit RAM/VRAM role semantics. Mutation tests reject sensitive text, unknown fields, negative values, unsupported versions, arithmetic drift, and invalid percentiles. These default tests load no candidate dependency, model, audio, or hardware.
- `services/tts/tests/test_benchmark_harness.py`, `test_benchmark_candidate_adapters.py`, and `test_benchmark_isolation.py` prove the candidate-neutral protocol, exact arithmetic and bounds, bounded diagnostic redaction, allowlisted promotion, frozen-manifest dispatch, local hash/offline/provider/profile checks, complete-waveform metadata mapping, spawned-worker timeout/termination, stale-frame rejection, and cleanup. Candidate libraries are mocked and process tests use only a repository fake; default checks do not load weights or require candidate environments or hardware.
- `services/tts/tests/test_benchmark_preflight.py` and `test_benchmark_cli.py` prove the closed private-stdin command, clean-revision binding, exact artifact measurement, offline controls, exact Windows firewall rule, approved host projection, AC/sleep/operator conditions, role-specific RAM/VRAM/disk headroom, non-promotable pilots, and fixed content-free failures. Production host probing is manual and hardware-specific; deterministic tests inject repository, host, and network probes.
- `services/tts/tests/test_benchmark_quality.py` proves the explicit-opt-in
  disposable listening boundary with mocked candidates: fixed corpus parity,
  whole-session cleanup on failure, opaque filenames, candidate/text/canary
  exclusion from evaluator pages, independently shuffled scorecards, exact
  sample matching, closed 1-5/`not-applicable` inputs, aggregate arithmetic,
  single-evaluator non-promotion, and path-confined cleanup. It writes only
  temporary fake bytes and loads no candidate library, model, NumPy runtime, or
  audio device.
- `services/tts/tests/test_benchmark_memory.py` and
  `test_benchmark_raw.py` prove transitive PID-only process-tree accounting,
  exact 50-millisecond RAM and one-second WDDM baseline semantics, PID-tagged
  dedicated-memory aggregation, the paired PyTorch allocator high-water mark,
  mandatory positive balanced-role signals, CPU-role GPU exclusion, bounded
  content-free v2 raw observation storage, private-value rejection, and
  duplicate-session rejection without loading a model.

The hardware/manual boundary is separate from these tests. The completed `v2`
cycle ran five cold loads, 24 warm generations, 12 sustained generations, and
five cancellation trials for each exact candidate on the documented Windows
host. One disposable blinded 24-sample session was evaluated by one fluent
Spanish listener and then fully deleted. The content-free
[`selection-v2`](../../benchmarks/tts/selection-v2.md) matrix records why both
roles fail; default tests and CI still load no model or generated audio.

- `pnpm.cmd --filter @voxleaf/shared generate:check` deterministically verifies that committed TypeScript wire DTOs, self-contained standalone validators, and the Python offline schema registry match the canonical JSON Schema files. Generation fails on an unregistered runtime helper, runtime `require`, `eval`, or dynamic `Function` construction.
- `packages/shared/src/contracts/tts-protocol-control.test.ts`, `services/tts/tests/test_protocol.py`, and the test-only Rust protocol fixture module consume the same closed protocol-v1 fixture set. They prove all 15 control kinds, unsupported versus malformed classification, nested identity and narration relationships, exact/max-plus-one text and identifier bounds, format arithmetic, unknown-field rejection, and immutable accepted values.
- `services/tts/tests/test_service.py` drives the model-free Python lifecycle and real module subprocess over fragmented/coalesced binary standard-stream records. It proves handshake/load/warm/generate ordering, metadata-before-one-audio-record publication, one-active/no-queue backpressure, cancellation and late suppression, content-free failure/timeout/crash handling, zero retry, cleanup, protocol-only stdout, and empty stderr without importing Qwen, Torch, CUDA, a model, or an audio device.
- `services/tts/tests/test_qwen_adapter.py` remains model-free while
  byte-comparing the exact adapter constants and candidate-lock hash to frozen
  `profile-v3`. Injected Qwen, Torch, and NumPy modules cover exact versions,
  candidate-environment ownership, offline controls, artifact hashes/sizes,
  revision receipts, model configuration, CUDA/bfloat16 admission, frozen load
  and benchmark-generation arguments, the product-only 250-codec-token clamp
  matching protocol v1's 480,000-sample ceiling, complete-waveform
  format/finiteness/size failures, content-free engine failures, and cleanup.
  Importing the adapter does not import Qwen or Torch.
- `packages/epub/src/index.test.ts` proves that the isolated EPUB package consumes synthetic book and locator contracts through the public `@voxleaf/shared` workspace boundary and exports only the validated `openEpubPublication` runtime entry point. `packages/epub/src/document/document-model.test.ts` exercises the public closed block/inline/navigation/resource/locator shapes, readonly recursive collections, opaque identifier separation, spine/non-spine documents, and explicit resource-read/locator-resolution/close lifecycle. Package-internal path, archive, processing-budget, XML-event, package, identity, navigation, XHTML projection, resource, and locator suites exercise untrusted ingestion with synthetic in-memory inputs, strict byte/count/depth/ratio/text/semantic-block limits, injected cancellation/deadlines, namespace-aware XML, fixed content-free failures, and no filesystem, network, worker, or DOM use. The XML/package regressions accept and omit valid legacy `meta name/content` compatibility values plus the inert HTML doctype in content documents while continuing to reject mixed/malformed metadata, package/container or non-HTML doctypes, public/system identifiers, internal subsets, custom entities, XInclude, and external-resource processing instructions. `packages/epub/test-support/epub-fixture.ts` supplies test-only deterministic arbitrary-ZIP, minimal-EPUB, comprehensive-EPUB, and documented byte-mutation builders with fixed order, timestamps, attributes, compression, and writer capabilities; `packages/epub/src/testing/epub-fixture.test.ts` proves repeated byte identity, fixed metadata, rich public opening, malformed construction, stale-checked mutations, caller-owned inputs, and no network or worker behavior. `packages/epub/src/public/open-epub-publication.test.ts` reuses the minimal builder to drive repository-authored in-memory EPUB bytes through the public opener and proves immutable semantic/navigation/resource/locator assembly, compatibility opening, exact resolution, close, every closed detail-to-`OperationalErrorV1` mapping, unknown-exception redaction, value-based invalid/cancelled results, and no network or worker capability. `packages/epub/src/integration/ingestion-matrix.test.ts` drives minimal, comprehensive, and adversarial deterministic EPUB bytes through the public boundary and proves representative failure at every ingestion stage, every untrusted-input detail family, rich deterministic success, shared-contract acceptance, lazy resource behavior, locator exact/recovery behavior, lifecycle closure, failure cleanup, privacy redaction, and absence of external capabilities. `packages/epub/src/document/xhtml-projector.test.ts` additionally proves allowlisted block/inline order, inherited language and direction, ordinary/code whitespace policy, opaque local links and images, inert external-link labels, omission of active/style/hidden/foreign/remote content, transactional failures, exact/max+1 content-document-byte and semantic-block accounting, and internal globally unique source-ID capture without changing semantic output. `packages/epub/src/resource/opened-publication.test.ts` proves lazy local GIF/JPEG/PNG/WebP reads, declared-size and signature gates, opaque immutable descriptors, independent caller-owned allocations, read-scoped and close-triggered cancellation, single-read concurrency, idempotent release, and closed-handle behavior without caching or external capabilities. `packages/epub/src/locator/locator-index.test.ts` proves final preorder assignment, exact/max+1 source-ID acceptance, deterministic duplicate/invalid/collision replacement, exact-byte and spine binding, shared-decoder round trips, Unicode code-point offsets, cancellation, immutability, and content-free failures. `packages/epub/src/locator/locator-resolver.test.ts` proves exact full-tuple resolution, wrong-book and malformed rejection, nearest offset/anchor/spine/book-start recovery, deterministic earlier-spine tie breaking, canonical immutable output, cancellation, and content-free failures without prose, page, or layout search. CFI parsing remains unsupported and deferred; public narration preparation is implemented and covered by the focused suites below, while application rendering, position restoration, and persistence remain desktop-owned.
- `packages/epub/test-support/epub-fixture.ts` is also the sole test-only source for reader navigation, reflow/restoration, valid/malformed raster, and exact/max-plus-one long-chapter EPUB bytes. Browser, benchmark, and native smoke helpers import those named builders directly; their expected structural locator fields are repository-authored constants rather than parser-derived fixture output.
- `packages/epub/test-support/narration-normalization-corpus.ts` is the accepted Task 1.2 test-only neutral/Spanish policy table. Its 62 frozen synthetic-sensitive cases record source semantics, per-unit effective language, exact expected narration text, ambiguous/unsupported preservation, and protected boundaries across whitespace, line breaks, hyphenation, punctuation, abbreviations, numbers, dates, times, currency, percentages, symbols, code, Unicode, mixed language, malformed input, and foreign names. `packages/epub/src/testing/narration-normalization-corpus.test.ts` proves category/edge coverage, unique identity/source signatures, deep immutability, and content-free closed validation failures. Tasks 3.1-3.4's `packages/epub/src/narration/narration-normalizer.test.ts` drives the complete accepted table through production source projection/token mapping and normalization, proving exact neutral/Spanish output, composed invariants, second-pass idempotence, legal retained origin spans, source immutability, deep freezing, exact limits, and content-free failures. Task 4.1's `packages/epub/src/narration/narration-boundary-scanner.test.ts` drives the same corpus through deterministic source-offset sentence/dialogue/clause/protected-token scanning and adds focused terminal-cluster, quotation, malformed fallback, structural metadata, two-pass work, exact/max-plus-one protected-token, and privacy evidence. Tasks 4.2-4.3's `packages/epub/src/narration/narration-segment-packer.test.ts` drives those scans through cancellable block-local target/hard packing and adds heading/scene-break, boundary-priority, exact source/code-point/UTF-8-byte, combining/protected-token, oversized unprotected-token splitting, indivisible-sequence limit failure, retained unit/text/byte ceilings, deterministic work/yield cancellation and retry, range-order, batch-slicing independence, immutability, and privacy evidence. Task 4.4's `packages/epub/src/narration/narration-prepared-segment.test.ts` validates complete packed output before publication, resolves every canonical half-open endpoint and continuation exactly, proves monotonic block-local repeat stability and deep freezing, wraps prepared values through `decodeNarrationSegmentV1` with test-only identities, and rejects inconsistent source identity without exposing sensitive text.
- `apps/desktop/src/integration/package-reader-matrix.test.tsx` loads those sanctioned test-support builders through Vitest while exercising runtime behavior only through the public `@voxleaf/epub` root and desktop application boundaries. Its deterministic matrix proves real-byte open, semantic render, exact/recovered/unavailable target navigation, canonical save, close, same-byte reopen/exact restore, nearest-offset recovery, different-byte isolation, malformed/future-state fallback and preservation, over-limit chapter rejection, valid/signature-mismatched/missing-reference raster outcomes, stale successful-open cleanup, and content-free storage/results with no console logging.
- `apps/desktop/src/vite-config.test.ts` freezes the renderer/native watcher
  boundary: Vite ignores `apps/desktop/src-tauri/**`, leaving Rust source and
  generated-target observation to Tauri/Cargo and preventing Windows `EBUSY`
  failures on the locked development executable.
- `apps/desktop/src/file-ingress/local-epub-file.test.ts` verifies exact/max-plus-one size preflight without allocating a 100-MiB fixture, invalid sizes, caller-owned bytes, post-read length mismatch, active `FileReader` abort, and fixed content-free read failures. `apps/desktop/src/publication/publication-session.test.ts` proves one cancellable/replaced publication lifecycle, stale-success cleanup, shared close, reopen, and package-error redaction. `apps/desktop/src/publication/local-publication-open.test.ts` composes both boundaries and proves the real invalid-input path, replacement-at-selection cleanup, abort/stale-read rejection, bounded-byte handoff, closed read/package/close outcome mapping, unmount cleanup, and unexpected-failure containment. `apps/desktop/src/persistence/reader-position-repository.test.ts` proves the asynchronous replaceable Web Storage adapter, exact-identity lookup, strict nested/shared and app-local decoding, fixed-key isolation, most-recent replacement, 128-state eviction, serialized-size rejection, malformed-current repair, unsupported-version preservation/write disablement, no coercion or sensitive fields, independent preference/position migrations, and content-free read/write failures. `apps/desktop/src/persistence/reader-position-save-coordinator.test.ts` uses a manual clock and lifecycle port to prove the exact 499/500 ms passive boundary, latest-only supersession, immediate position/preference coalescing, passive-to-settled promotion, hidden/`pagehide`/close flushes, serialized bounded writes, stale-book rejection, failure containment, and content-free records. `apps/desktop/src/persistence/reader-position-restore-coordinator.test.ts` proves exact and nearest-valid resolution, every fixed repository fallback, identity mismatch, resolution failure, stale-read cancellation, one preference read per application owner, and close containment without exposing content. `apps/desktop/src/reader/reader-lifecycle.test.ts` proves immutable idle/opening/ready/empty/failure/closing states, zero-locator empty classification, prior-publication clearing, stale completion rejection, shared close, reopen, cleanup invalidation, renderer-failure cleanup, and content-free failures. `apps/desktop/src/reader/large-chapter-rendering.test.ts` proves recursive below/exact/above semantic-block and projected-node boundaries plus exact 250-block scheduling, one pending yield, cancellation, and stale-callback rejection. `apps/desktop/src/reader/SemanticDocument.test.tsx` proves exhaustive semantic headings, paragraphs, block quotes, ordered/unordered lists, text, emphasis, strong text, code, line breaks, inherited language/direction, source order, React text escaping, available/inert internal-target presentation, accessible unloaded raster fallback, omission of publisher attributes/styles/identities/URLs from rendered markup, first/next incremental batches, and no partial content above the ceiling. `apps/desktop/src/reader/active-visual-locator.test.ts` injects deterministic viewport, block, caret, scheduler, and observer ports to prove top/partial/between/end selection, source-order ties, exact code-point mapping, ambiguous-caret and structural block-start fallback, package normalization, geometry omission, duplicate suppression, visibility-bounded measurement, callback coalescing, nested suspension, and exhaustive cleanup. `apps/desktop/src/reader/ReaderPublication.test.tsx` proves canonical coordinator state, same-spine passive active-locator updates, exact and recovered target resolution, non-spine unavailability, chapter boundaries, hierarchical TOC order, fixed unavailable explanations, TOC/internal/chapter convergence, application-owned skip/return focus without URL mutation, passive focus/storage isolation, explicit-navigation tracker suspension and destination focus, initial target materialization/range settlement without focus movement or premature save, settled explicit/preference-reflow save intents, last-valid-locator preservation/recovery around an oversized destination, and omission of publisher anchors, hrefs, source fragments, DOM IDs, and browser-history mutation. `apps/desktop/src/reader/raster-image-policy.test.ts` verifies narrow GIF/JPEG/PNG/APNG/WebP metadata parsing, exact/max-plus-one dimensions/pixels/frames, static-only policy, malformed/type-mismatched rejection, and equal-or-stricter policy construction. `apps/desktop/src/reader/raster-image-source.test.ts` verifies one-decode concurrency, live source/pixel capacity, postdecode agreement, cancellation, fixed errors, no network calls, and exact object-URL release/close behavior. `apps/desktop/src/reader/publication-raster-image-loader.test.ts` verifies one serialized resource-read/decode path, the eight-outstanding-operation ceiling, queued cancellation, fixed unknown/read-failure fallback, caller-owned byte clearing, shared idempotent close, and content-free results. `apps/desktop/src/reader/SemanticRasterImage.test.tsx` verifies visibility-gated loading, semantic/missing alternative-text presentation, local ready rendering, late-result rejection, abort/release on unmount, final `<img>` failure fallback, and omission of resource identity. `apps/desktop/src/App.test.tsx` verifies the accessible six-state surface, busy/status semantics, accept hint, browser-picker cancellation, same-input clearing, validated metadata plus starting-spine semantic rendering without resource/target resolution when navigation is empty, zero-content recovery, exact/recovered restoration before reader settlement, delayed recovered-position rewrite, StrictMode mount-probe survival without closing live narration/restoration/persistence/application resources, final position flush ordering before replacement/close, preference writes, explicit close/reopen, fixed open/close/render failure messages, private-filename/metadata/error omission, stale-result rejection, render-boundary cleanup, real-unmount cleanup, and the independent synthetic raster-probe presentation.
- `apps/desktop/scripts/native-webdriver-client.node-test.mjs` uses a loopback fake server to prove Tauri capability construction, W3C element/script/window-rect/CDP command routing, session cleanup, and containment of transport/protocol details behind fixed codes without launching a browser or native process.
- `apps/desktop/tests/browser/foundation.smoke.spec.ts` runs the production Vite build in Playwright's pinned Chromium and proves the local open/render/image/navigation/layout/focus path, application-owned skip/return links, validated global preference persistence, and zero non-loopback requests. `active-visual-locator.smoke.spec.ts` drives the production tracker through top, partial-crossing, between-block, and terminal-block geometry with native caret invocation, then proves the debounced content-free position envelope without focus, URL, page-error, or network side effects. `reader-reflow-restoration.smoke.spec.ts` opens a repository-authored long reflow fixture, captures one nonzero semantic code-point through test-side Range instrumentation, and proves the same canonical range returns to the reading line across every closed text-scale, line-spacing, content-width, and theme token, superseding changes, 1,280/768/360/320-pixel viewports, and Chromium CSS zoom while focus and URL remain unchanged. Its keyboard scenario uses native Tab, End, Enter, Space, and PageDown behavior to prove skip/return focus, preference operation, TOC/chapter navigation, status semantics, focus preservation, narrow layout, forced colors, dark system media, reduced motion, and zero remote requests. The restoration scenario reloads and reselects the exact bytes to prove preference plus exact code-point restoration without focus movement, mutates only the synthetic saved offset, reloads/reselects again, and proves nearest-valid recovery plus post-settlement canonical rewrite and a content-free notice. The tests validate both bounded envelopes and absence of passage/filename data. `large-chapter.smoke.spec.ts` proves the 10,001-block fallback appears before publisher content and remains closable. Chromium evidence remains complementary to the packaged WebView2 matrix and is not a screen-reader-product certification.
- `apps/desktop/tests/browser/reader-performance.benchmark.spec.ts` is a separate native-Windows Playwright benchmark. It retains Task 1.6's complete/incremental synthetic DOM profiles at 250, 2,000, 10,000, 20,000, and 50,000 blocks; generated one/eight-image and combined envelopes; and accepted prototype gates. Task 3.6 adds the production Vite/React exact-limit EPUB case, holds after the first 250-block commit, observes all 39 remaining callback-to-DOM commits, navigates to a deep target, reflows preferences, and measures incremental plus full-application DOM/heap/Chromium working-set growth. The command builds required workspace packages, records only content-free metrics, remains excluded from ordinary browser tests and CI, and does not replace Task 5.4's native WebView2 performance/resource evidence.
- `services/tts/tests/test_health.py` imports the Python package and verifies its version function without loading a model, opening a network server, using an audio device, or requiring hardware.
- `apps/desktop/src-tauri/src/tts_protocol_probe.rs` has model-free Rust tests for exact and max-plus-one frame/control/audio/identity/narration bounds, malformed/truncated/version failures before payload acceptance, deterministic parent/child validation, and the one-active/no-queue guard. `tts_service_protocol.rs`, `tts_service_fake_child.rs`, and `tts_service_supervisor.rs` add strict control/audio parsing, pre-allocation rejection, canonical child ordering, native identity creation, fixed failures, persistent lifecycle, one-active backpressure, cancellation termination, explicit restart, shutdown, and Windows descendant containment. The release supervisor host exercises the real child-process matrix.
- `apps/desktop/src/tts/transport-probe.test.ts` proves the low-level binary response. `process-client.test.ts` proves canonical control decoding, exact order, active/stale identity classification, one-unit ownership, finite/size gates, concurrent rejection, cancellation, late-byte zeroing, close/release, and fixed failures. The packaged lifecycle probe then exercises the same production client through real Tauri commands. None of these suites loads a model, persists audio, or logs narration text.

The formatting, linting, type-checking, and production builds in `pnpm.cmd check` are deterministic validation stages, but they are not substitutes for behavior tests once product logic exists.

### Native local-file open flow

ADR-0009 also requires native Windows WebView2 evidence because jsdom and Chromium cannot prove packaged file-input behavior. `pnpm.cmd test:native-startup` builds and launches the release executable, first proves the M007 low-level protocol probe plus the supervised model-free typed-client lifecycle with bounded binary delivery and cancellation, then creates disposable repository-authored synthetic files outside the repository to verify:

1. a valid synthetic EPUB reaches success and shows only its repository-authored title/authors, never its filename;
2. selecting that same EPUB again reopens it successfully and closes the prior publication;
3. cancelling the picker preserves the prior ready or idle state without an error;
4. replacing an opening/ready book with a malformed EPUB reaches the fixed invalid state and cannot restore stale metadata;
5. exactly 104,857,600 bytes passes the early size gate and then reaches the package's fixed invalid/unsupported/resource outcome, while 104,857,601 bytes reaches the fixed too-large state without a read; and
6. the input clears after every selection and no path, filename, bytes, MIME claim, package detail, or raw browser error appears in the UI or console.

Do not use or commit a private or copyrighted EPUB for this matrix. The checked-in harness creates and removes the valid fixtures, sparse boundary files, and isolated WebView2 profile itself. Same-file reselection, picker cancellation, ready replacement, exact/max-plus-one boundaries, recovery, and privacy assertions operate on packaged file inputs and disposable files. To deterministically hold one active read long enough to prove replacement cancellation, the harness substitutes exactly one pending test-controlled `FileReader` inside the packaged WebView, verifies one abort and detached handlers, and then lets the replacement plus both boundary cases use the native WebView implementation. This timing control is test-only and adds no production hook, dependency, Tauri command/plugin/capability, path contract, or permission.

### Native startup and CSP regression

The white-window defect demonstrated that the Chromium production-preview smoke does not apply the packaged Tauri CSP: the former Ajv runtime compilation was blocked before React mounted even though browser and unit tests passed. Run `pnpm.cmd test:native-startup` on native Windows to build the release executable and launch it through Tauri's loopback-only WebDriver bridge with a disposable isolated WebView2 profile. The packaged matrix verifies the hidden supervisor host's normal/cancel/crash/restart/shutdown/descendant-cleanup matrix; root/main mount; the M007 low-level protocol exchange; typed model-free service start/prepare/generate/health/shutdown; exact binary WebView response and release; active cancellation with zero stale publication; repository-authored comprehensive EPUB open; same-file reselection and old-image URL release; picker cancellation; ready-publication replacement; deterministic active-read cancellation; exact/max-plus-one file-size boundaries and valid recovery; local Blob decode; the narrow window without horizontal overflow; logical Tab/End order plus keyboard skip/return, PageDown, TOC, and chapter operation; application-owned destination focus; 125% page scale; dark system theme, forced colors, reduced motion, and visible focus; closed preference persistence; canonical continuation persistence; complete process closure; restart with the same disposable profile; exact-file reselection; exact continuation/preference restoration without moving the focused file input; publication close/image removal; zero page/console errors; and zero external requests. The harness allows 90 seconds for each cold WebView startup on hosted Windows runners and exposes only fixed stage/failure-code pairs; it never logs the fixture, filename, URL, page error, console value, driver response, publication content, locator, preference values, image bytes, local executable paths, or synthetic PCM, and removes its temporary profile and files.

Task 2.5 replaced runtime compilation with committed generated predicates, made Ajv generation/test-only, removed `unsafe-eval`, and added a Vite production-build guard that rejects every Ajv module plus runtime `eval`/`Function` construction. Re-run `pnpm.cmd test:native-startup` after every Tauri/WebView2, CSP, shared-validator generation, publication-open bundling, file-ingress, native-startup, or TTS binary-response change. The valid open/close proves that the generated book validator executes in WebView2, while the integrated ingress cases above retain Task 2.3's packaged interaction evidence.

This native command runs only on Windows and is separate from `pnpm.cmd check:portable`. The harness resolves PATH-installed `tauri-driver.exe` and `msedgedriver.exe` to absolute child-process paths while retaining `VOXLEAF_TAURI_DRIVER_PATH` and `VOXLEAF_EDGE_DRIVER_PATH` overrides. The authoritative Windows CI job checks Microsoft's documented machine/user registry locations for an installed Evergreen WebView2 Runtime, downloads and silently runs Microsoft's architecture-selecting bootstrapper only when the runtime is absent, and verifies a nonzero installed version. It installs exact `tauri-driver` `2.0.6`, builds pinned `msedgedriver-tool` revision `8c4b34f51b45f5cf08013366d703de464ab871d1`, downloads the EdgeDriver matching that runtime, verifies Microsoft's signature, and passes both explicit tool paths to the smoke. The driver processes use two ephemeral loopback ports and are test-only. The M007 child protocol itself opens no socket or network listener; it uses redirected standard streams owned by the release executable.

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
pnpm.cmd --filter @voxleaf/desktop test:native-driver-client
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd benchmark:reader
pnpm.cmd benchmark:reader:native
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
uv run --project services/tts --locked pytest services/tts
```

Hardware-specific TTS execution is intentionally separate from root checks.
After the documented candidate-specific firewall and preflight setup, pipe the
same private standard-input payload to `pnpm.cmd benchmark:tts:measure`. Use
`purpose = "pilot"` first; an official run requires `purpose = "official"`,
a clean committed revision, and every preflight gate. Neither mode starts a
service, opens an audio device, or persists waveform samples.

The balanced `v2` preflight also requires the native
`GPU Process Memory(*)\Dedicated Usage` counter. Official execution samples
that PID-tagged WDDM value no faster than once per second while retaining
50-millisecond process-tree RAM samples and the isolated PyTorch allocator
peak. A missing/zero component is a measurement failure, not permission to
substitute total-device VRAM.

The `benchmark:tts:quality:*` commands are a separate explicit manual path.
Generation repeats official preflight and is the only benchmark command that
retains waveform data. It requires `qualityOptIn: true`, uses one known ignored
session, applies identical mono PCM16 conversion and hard file/session bounds,
and removes the complete session on generation failure. Finalization replaces
identity-bearing staging names with opaque random IDs before an evaluator sees
the files. Aggregation is promotable only with at least three complete
independently randomized scorecards; one evaluator is retained solely as
limited evidence. Cleanup must delete every generated WAV after the aggregate
is recorded.

That rule remains the historical `v2`/`v3` benchmark implementation. ADR-0014
accepts one fluent maintainer for future constrained-demo quality feedback,
but such feedback is not a retroactive promotable `v3` aggregate and cannot be
duplicated into multiple evaluator identities.

The browser command requires one prior networked `pnpm.cmd test:browser:install`. Ordinary execution does not download browsers and can run offline after that setup. It uses a fresh isolated context, blocks and counts non-loopback requests, removes its fixed synthetic and reader-state storage keys, and lets Playwright stop the loopback preview server. Failure-only traces and screenshots are ignored artifacts and may contain only repository-authored synthetic test content. The native-startup command requires `tauri-driver` and a Microsoft EdgeDriver matching the installed WebView2 runtime; it uses the standard WebDriver launch path plus proxied CDP logging and creates no browser artifact. Chromium and WebView2 evidence remain complementary.

## M009 synchronization and heard-persistence validation

Completed M009 adds deterministic, browser, packaged, exact-host, and
repository/CI proof surfaces:

- `synchronization-authority.test.ts` verifies the closed event table,
  segment-level timing, invalidation-first navigation, bounded progress
  cadence, non-skipping persistence checkpoints, and the 24-pixel follow
  comfort region;
- `semantic-dom-range-mapper.test.tsx` verifies noncollapsed ranges across
  nested markup and Unicode code-point offsets without changing publication
  nodes;
- `synchronization-feasibility.smoke.spec.ts` proves production Chromium
  accepts the CSS Custom Highlight registry and CSSOM style rule, follows the
  target range, preserves focus and an independent user selection, leaves
  publication content and URL unchanged, and performs no external request;
  and
- the ordinary packaged native-startup smoke repeats the critical proof in
  WebView2 under the real content-security policy and keeps its zero runtime
  error and zero external-request assertions.

`narration-position-save-bridge.test.ts` proves that only exact starts and
matching completions reach persistence, periodic frame observations do not,
pause and buffering flush once per transition, and failure/cleanup finish the
temporary narration authority. `reader-position-save-coordinator.test.ts`
adds active-visual suppression, unmatched-completion rejection, start/end
advancement, hidden/`pagehide` interruption, reflow protection, and
mid-segment exact-file restoration. `App.test.tsx` proves the application
wiring: active visual movement cannot overtake the heard checkpoint,
completion advances it, and a later reflow cannot regress it after stop.
Existing repository and restore suites continue to prove exact/nearest-valid
recovery plus preservation of unsupported future envelopes.

The default proof uses only repository-authored synthetic EPUB content and
returns content-free booleans. It does not run Qwen or publish narration text
or audio. The separately invoked exact-host matrix described below supplies
M009 Milestone 6 evidence. Milestone 7 records complete-diff privacy/repository
review and passing required Ubuntu/Windows CI. The frozen and implemented behavior is documented in
[`../architecture/synchronization-authority-v1.md`](../architecture/synchronization-authority-v1.md).

## M009.1 reader-experience validation

Milestone 3 extends the same deterministic, Chromium, and packaged proof
surfaces for the fixed ready-publication shell. Component tests require one
reader-owned scroll root, compact narration detail closed by default,
persistent content-free playback/status/recovery actions, exact
loaded/target/estimate text, and no `progressbar`. Browser tests drive locator
tracking, reflow/restoration, and focus-safe following through that root at
narrow and high-scale layouts, then verify stable chrome under keyboard,
wheel, and touch input plus reduced-motion, forced-colors, replacement, and
close behavior. The packaged smoke repeats the sole-scroll-owner and compact
presentation assertions before its existing interaction and synchronization
matrix. These tests use only repository-authored synthetic publications.

Milestone 4 extends those surfaces with one retargeted application-owned
paragraph leaf. Reader and coordinator tests prove canonical block-start
resolution, ordinary-text click inertness, identity-first replacement,
settled placement, rapid-action rejection, stale-completion suppression,
restored checkpoints, StrictMode-safe cleanup, and a single retained control.
Keyboard, pointer, and touch activation share the same action. Browser
foundation coverage checks a 44-pixel target, visible focus, forced-colors,
non-colour state text, touch behavior, and absence when narration is
unavailable. The packaged smoke covers the same bounded reader and
synchronization regression path without claiming a dedicated native leaf
assertion; no model is loaded by default.

The Milestone 4 packaged smoke passed on the current Windows host after its
release build. A `webdriver-session-not-created` failure remains a known
host-automation boundary on affected runs and is not evidence about an
application assertion; required clean-host pull-request validation remains the
authoritative final packaged gate. On Windows, all six Playwright tests can
report passing before the preview child remains attached and the bounded
wrapper times out; this is the documented M004 post-test teardown issue.

### Hardware-specific visual-reader benchmark

Run `pnpm.cmd benchmark:reader` only from native Windows after `pnpm.cmd test:browser:install`. The benchmark launches fresh pinned Chromium processes and queries their numeric process IDs through CDP so a fixed PowerShell query can record aggregate working set. It emits only fixed fixture labels, block/image/node counts, durations, heap values, pixel counts, and byte totals. It disables trace, screenshot, and video capture; uses only repository-authored synthetic content and an in-memory generated EPUB for the production case; makes no external network request; and writes only ignored Playwright result artifacts.

The Chromium benchmark also runs six production open/navigation/image/close cycles. It instruments only application-created Blob URL ownership, `ResizeObserver`/`IntersectionObserver` lifetime, the number of bounded reader-storage writes, DOM/heap/working-set counts, and fixed durations. Each settled close must leave no active reader observer or Blob URL; storage writes must stop; DOM count must return to the same bounded idle envelope; first-to-last closed heap and working-set growth must remain below the documented stress ceilings. The same scenario proves an above-limit chapter has no partial content and that a later valid publication remains usable.

Run `pnpm.cmd benchmark:reader:native` from the same native Windows terminal after installing the packaged-startup prerequisites documented above. It builds the release executable and runs the exact-limit and six-cycle stress matrix in packaged WebView2. Page-scoped CDP supplies DOM, heap, and garbage-collection measurements. A fixed PowerShell query sums working set only for the known `tauri-driver` PID and descendants discovered from numeric PID/parent-PID relationships; it reads and emits no command lines, executable paths, window titles, or unrelated process details. The native report also records representative exact restoration and chapter navigation, preference reflow, exact-limit append/target timing, over-limit recovery, bounded storage, zero page/runtime errors, and zero external requests.

Both benchmarks are deliberately absent from `pnpm.cmd check`, `pnpm check:portable`, and GitHub Actions because their pass/fail latency and memory gates belong to the documented Windows reference host. Task 1.6 results and exact accepted limits are in [`../architecture/performance-budget.md`](../architecture/performance-budget.md#visual-reader-reference-limits). Re-run them after material changes to the semantic renderer, batching, reader styles, locator restoration/reflow, image lifecycle, Chromium/WebView version, native driver boundary, or reference hardware. Task 3.6 supplies production React measurements; Task 5.3 supplies native WebView2 interaction/restoration evidence; Task 5.4 supplies browser and native performance/resource-stress evidence.

## Milestone 5 narration-preparation validation

The completed [Milestone 5 plan](../plans/completed/M005-narration-text-preparation.md) defines the detailed test sequence. Task 1.2's corpus-integrity tests, Task 1.3's test-only profile/evidence tests, Tasks 2.1-2.3's production source-projector/token-mapper/bounded-window/publication-lifecycle tests, Tasks 3.1-3.4's production normalizer tests, Tasks 4.1-4.4's production boundary-scanner/semantic-packer/canonical-prepared-segment tests, Task 5.1's public-operation tests, Task 5.2's public EPUB-to-segment integration matrix, and Task 5.3's deterministic resource-bound tests pass. The source suites cover every current semantic block/inline member, nested quote/list order, inherited semantic context, empty and unspoken leaves, raster omission, Unicode-code-point parity with the locator index, BMP/astral/combining token spans, one-position line-break/raster placeholders, block-end locator endpoints, source reconstruction, exact/recovered/malformed/wrong-book/interior/end starts, continuation without token repetition, deterministic checkpoint/yield cancellation, one-active-operation behavior, raster-read overlap, retry, stale completion, idempotent close, deep immutability, compile-time union closure, and fixed content-free failures. The normalizer suite adds table-driven exact neutral/Spanish output, deterministic second-pass text, one mapped unit per source token, legal deletion/join/expansion spans, effective-language behavior, boundary protections, source immutability, composed invariants/privacy canaries, and exact parser-lookahead/per-source-expansion ceilings. The boundary and packing suites drive the complete accepted corpus through source projection, normalization, scanning, and stable block-local packing; assert exact sentence/dialogue/clause source offsets and priority, terminal/quotation fallback, protected and combining non-splitting, recognized scene-break exclusions, deep immutability, monotonic non-overlapping ranges, retained-output bounds, deterministic cancellation/retry, batch-slicing independence, exact 768-source-code-point, 640-narration-code-point, 2,048-byte, 256-protected-token, 8,832-retained-code-point, 26,624-retained-byte, and 4,096-retained-unit behavior, unprotected token hard splitting, and indivisible combining-sequence limit failure. Canonical prepared-range tests add exact endpoint and continuation resolution, stable block-local `LocatorRangeV1` values, unchanged `NarrationSegmentV1` wrapping with test-only identities, deep immutability, closed boundary-reason coverage, and content-free no-partial-result failure. Task 5.1 tests add public type/export coverage, public-opener smoke coverage, frozen batch/complete results, continuation without repetition, full containing-segment disclosure for interior starts (including reconstruction across bounded source windows), invalid request/start, pre-abort/retry, one-active-operation behavior, raster overlap, close cancellation, post-close failure, and fixed content-free errors. Task 5.2 adds one short provenance-labeled three-spine EPUB that covers headings, nested quotations/lists, dialogue, scene breaks, inline emphasis/strong/link/code, semantic line breaks, raster placeholders, a long sentence, accepted Spanish punctuation/abbreviation/date/time/currency/percentage forms, and an explicit foreign-language name. It uses only the package root opener and public handle, compares complete text/ranges across one- and four-segment batching, proves exact/recovered/gap/spine/end starts, revalidates every locator endpoint and shared narration wrapper, retains deeply equal displayed semantics, observes no public image read, and leaves network, worker, WebSocket, file-picker, DOM, storage, TTS, and audio spies untouched.

Tasks 3.4-5.3 now cover composed normalization, deterministic lexical
boundaries, cancellable profile-bounded semantic packing, canonical
locator-linked prepared output, the closed public batch operation, and the
broader repository-authored public-opener integration matrix. Task 5.3 adds
deterministic package-level tests for:

- exact alignment between production hard ceilings and the accepted profile,
  exact 512-unit checkpoint/4,096-unit yield cadence through 8,192 work units,
  and exact batch plus one-lookahead code-point/UTF-8-byte retention;
- 96 synthetic 400-code-point paragraphs consumed in 12 bounded
  eight-segment requests without retaining whole-publication output; and
- numeric-only high-water snapshots plus caller-cancellation and close evidence
  that no stale result is retained or published.

Use table-driven tests and fixed synthetic fixtures where exact text transformation is the observable behavior. Add fixed-seed randomized or property-style cases only if they materially improve invariant coverage without adding an unapproved dependency. Performance acceptance is based on deterministic counts, bytes, bounded collection sizes, and checkpoint distance; optional wall-clock observations are informational and must make no model, language-quality, latency, or hardware claim.

The focused commands are:

```powershell
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
```

The final Milestone 5 tree passed all three commands, including 34 EPUB test files / 555 tests. Task 6.2 also passed `pnpm.cmd check:portable`, the authoritative native `pnpm.cmd check`, and both required pull-request jobs; the retained exact results are in the completed plan. No Markdown or Mermaid-specific validator is currently configured in the repository.

## Milestone 6 TTS feasibility validation

The [completed Milestone 6 plan](../plans/completed/M006-local-tts-feasibility-and-engine-profiles.md) retains the frozen `v2` authority, exact candidate-run evidence, limited one-evaluator Spanish quality result, license/offline/packaging audit, privacy cleanup, and repository closeout. The model-free Python suite contains 50 deterministic benchmark tests, and each isolated candidate environment has a locked dependency/import smoke.

Both exact profiles completed the required manual matrices on the measured host, but each failed at least one frozen role gate; ADR-0013 therefore selects neither profile. Disposable generated audio and private raw results were removed after content-safe summaries were derived. Pull request #97's final head (`0e05c58820e3647d0656d41e17b8749851f873b2`) passed the Ubuntu and Windows foundation jobs in GitHub Actions run `30182306655`.

These results validate development evidence only. They do not exercise or imply a production TTS process, selected engine profile, playback path, general hardware support claim, or installer.

The completed
[Milestone 6.1 plan](../plans/completed/M006-001-local-tts-profile-blocker-resolution.md)
has a frozen Qwen3-TTS 1.7B CustomVoice candidate manifest, isolated lock,
blinded Spanish built-in-speaker authority, schema-valid content-safe Serena
selection, frozen `v3`, a passing content-safe exact-host prototype result,
the completed failed official matrix, and model-free
authority/generation/scoring/cleanup/profile/prototype tests. Those default
tests do not load a model or require CUDA. The manual prototype proves bounded
complete-segment delivery, identity-first stale rejection, worker termination,
and cleanup; it does not prove native streaming or production transport. One
fluent maintainer accepted audible quality for a near-term demo and ADR-0015
now governs that constrained one-GPU development path. The accepted candidate-neutral
[`selection-v3`](../../benchmarks/tts/selection-v3.md) retains the failed
standard result and records the separate demo exception. Milestone 6.1 local
deterministic, candidate-import, repository/privacy, portable, and
authoritative Windows validation passed; pull request #104 also passed both
required foundation jobs on the exact evidence commit. Base voice cloning is
outside the current MVP. Whisper and VAD/energy analysis are excluded from
`v3`.

The completed
[Milestone 6.2 plan](../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md)
has a frozen pre-result `v4` profile, normalized eight-unit/four-pair synthetic
corpus, closed raw and summary schemas, exact full-GPU and conditional
speech-tokenizer CPU identities, and deterministic authority enforcement.
`test_benchmark_v4_authority.py` verifies byte stability, corpus arithmetic,
pair and result order, no retries, strict authority ancestry fields,
conjunctive pass claims, conditional CPU admission, schema closure, and
private-content rejection without importing Qwen or requiring CUDA. Milestone
4 adds exact content-free placement evidence and model-free checks that only
the speech-tokenizer model/wrapper move to CPU while every other parameter
remains on `cuda:0`.
Milestone 2 adds the development-only one/two-unit request/result boundary,
exact 39-call frozen matrix construction, whole-batch identity invalidation,
content-free playback simulator, isolated Qwen list-call adapter, and reviewed
`benchmark:tts:batch` disposable-pilot command. Deterministic scenarios cover
ordered completion, swapped output, one-item failure, timeout, stale identity,
cancellation, OOM, cleanup failure, bounded retention, underrun arithmetic,
content-safe receipt output, and replay stability. Milestone 3 adds model-free
coverage for the five cold-load observations, exact official call/unit
counts, ignored raw result, five cancellation records, memory/cleanup shape,
closed safe-summary derivation, and opaque-session command input. The
candidate-environment run and base-environment derive/delete steps are
separate so the candidate lock remains unchanged. Milestone 3 executed the
disposable pilot and official full-GPU path. The committed safe result validates
the exact counts and cleanup but stops on `shared-gpu-memory` before any
reviewable audio, playback, or throughput evidence; the ignored raw session was
deleted. Milestone 4 executed the separately admitted targeted-CPU arm. Its
schema-valid safe result reproduces the same shared-memory stop and VRAM
boundary before media, and its private raw session was also deleted. Default
tests and CI remain model-free.

Milestone 6 adds the separately frozen `v5` authority and
`test_benchmark_v5_authority.py`. Its model-free coverage verifies byte-stable
profile/corpus/schemas, complete GPU and CPU identities, exact schedules,
first attempts, CPU zero-CUDA/dedicated/shared-GPU use, missing/duplicate/
reordered occurrence rejection, authority ancestry, schema closure, private
content exclusion, CPU-solo and concurrent conjunctive conclusions, aggregate
RTF below one, and simultaneous 300-second, 40-unit, 28,800,000-byte PCM, and
two-active-unit retention limits.

Milestone 7 adds the model-free dual-worker contracts, deterministic
controller and fake workers, exact CPU/GPU Qwen adapter placement checks,
isolated worker-process boundary, bounded playback replay, and reviewed
`benchmark:tts:dual-worker` command. Deterministic tests cover GPU-first
dispatch and tie breaking, one-active-unit-per-worker enforcement, contiguous
publication, out-of-order completion, stale identity, timeout, crash,
cancellation, cleanup failure, head-of-line accounting, active-capacity
reservation, and every simultaneous retention bound. The command surface
accepts only frozen CPU-pilot or official-arm inputs and returns a
non-promotable mechanics receipt. It does not load a model, synthesize audio,
or create a hardware result. Milestone 8 completed the private hardware work:
CPU solo measured aggregate RTF 2.999, GPU solo measured RTF 1.467, and the
official concurrent arm stopped at `resource-limit`. A low-load diagnostic
later completed at aggregate RTF 1.429 but substantially slowed the GPU worker.
Accepted `selection-v5` rejects CPU-only and dual-worker scheduling. Default
tests and CI remain model-free.

## Exact M007 development-host diagnostic

`pnpm.cmd test:tts:exact-host` is the reviewed Windows/CUDA-only M007
Milestone 4 gate. It is excluded from root checks and CI and requires the
frozen native-only keys, verified ignored local artifacts, exact candidate
environment, and interpreter-bound outbound firewall block documented in
[`setup.md`](setup.md). The release host proves exact load/warm, one resident
model per service session, one active request and zero queue, bounded valid
binary delivery, busy rejection, identity-first process-tree termination,
zero returned stale audio, explicit clean reload, a second valid unit, and
shutdown. It emits only a fixed pass/fail line and retains no narration text or
audio. This is constrained exact-host service evidence, not playback,
sustainable throughput, distribution, or general hardware support.

## Exact M007 service-handoff matrix

`pnpm.cmd test:tts:handoff-host` is the frozen Windows/CUDA-only M007
Milestone 5 matrix. It uses the same exact environment and firewall
requirements as the focused diagnostic, builds the release host, and executes
the nine authority-ordered cases once with no retries. The matrix covers cold
neutral and warm Spanish delivery, blocked-consumer backpressure, invalidation
before dispatch and after completion, accepted and mid-generation
cancellation, child crash, and application exit. Its runner samples descendant
RAM and dedicated/shared GPU memory, confirms one GPU allocator, checks
intermediate and final cleanup, and rejects listeners, external connections,
audio persistence, and content-bearing output.

The first authoritative run passed. Delivered units were 11.28 and 14.88
playable seconds at RTF 1.425 and 1.437; first-audio and completion p95 were
both about 21.38 seconds because this adapter publishes complete units only.
Native handoff p95 was about 0.234 ms, termination p95 about 5.70 ms, and
restart plus prepare p95 about 16.61 seconds. Peak descendants used about 4.71
GB RAM, 5.14 GB dedicated GPU memory, and 81.8 MB shared GPU memory; cleanup
returned all three measures to zero. The committed content-safe result is
[`service-handoff-result-v1-exact-host.json`](../../benchmarks/tts/service-handoff-result-v1-exact-host.json).
This matrix does not evaluate sustainable playback or select a production
profile.

## Milestone 8 deterministic buffer, playback, and control validation

The M008 deterministic desktop tests remain model-free and device-free:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-authority.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/adaptive-preparation.test.ts src/tts/AdaptivePreparationControls.test.tsx src/tts/product-narration-coordinator.test.ts
```

The authority and scheduler tests retain exact/max-plus-one resource,
quick/prepared startup, refill, ordering, depletion, stale-output, and recovery
coverage. `pcm-playback.test.ts` adds one-unit-sink transfer, real payload
format validation, ordered Web Audio requests, manual-clock consumption,
pause/resume, zero-volume progress, `1.0x`-only admission, underrun counting,
end-of-range completion, and stop/seek/close cleanup. Its fake Web Audio
context verifies little-endian float32 decoding into one active mono 24-kHz
device buffer and opens no real audio device. These tests persist no payload,
read no private book content, and load no candidate or model.

`adaptive-preparation.test.ts` proves the bounded eight-observation
elapsed-time/sample-frame estimator, stopped-service estimate input, identity
reset, and the disabled-by-default interruptible 0/1/2/3-second
semantic-boundary wait decision. The scheduler matrix separately proves
target-bounded paused generation.
`AdaptivePreparationControls.test.tsx` verifies native labeled quick/prepared
selection, all admitted targets, progress and estimate announcements, planned
wait versus buffering messages, low-buffer warning, pause/resume/stop
availability, 5% volume steps, and the disabled `1.0x`-only speed selector.
The component receives no narration text, identity, or audio payload.

`product-narration-coordinator.test.ts` validates the application seam with
synthetic prepared segments and fake client/player boundaries: the model-free
runtime is not exposed, preparation starts at the active visual locator with an
abort signal, only one request is active, sole audio ownership transfers to the
player, locator changes make work stale before cancellation, preparation
failures are fixed/content-free, and snapshots contain no text, paths, or work
identities. Process-client and Rust supervisor tests cover the narrow
content-free exact-configuration availability result.

The hardware-specific packaged path is:

```powershell
pnpm.cmd test:tts:adaptive-exact-host
```

It requires the exact native Qwen/Serena environment, prepared artifacts,
outbound-blocking firewall rule, Tauri driver, and matching EdgeDriver. The
runner creates and deletes a synthetic Spanish EPUB, exercises quick
depletion/buffering and cancellation, then reloads for one-minute prepared
playback. M009 Milestone 6 additionally verifies exact audible transitions,
valid half-open ranges, readable focus-safe following, keyboard pause/resume,
passage seek, chapter restart, stale suppression, reduced motion, forced
colors, retained/discarded-unit bounds, and generated-audio cleanup. Late
programmatic visual samples are suppressed during active narration; bounded
wheel, touch, pointer, or reading-navigation-key intent still authorizes the
frozen passive seek. It checks all four prepared choices, content-free timing
and resource metrics, cleanup, and zero external requests. Generated audio is
never written. This run is excluded from default checks and CI.

M008 Milestone 6 retains quick mode as the default, one minute as the initial
prepared and refill target, 10 seconds as low water, and `0` ms as the boundary
wait. The final accepted rerun measured 41.312 seconds command-to-audible,
16.480 seconds of start lead, one underrun, 19.49 buffering seconds per playback
minute, 24 ms cancellation, and zero external requests. The buffering result
fails the MVP target of at most 5 seconds per minute, so tests and documentation
must keep the exact path development-only and must not assert uninterrupted
playback or a standard profile.

The accepted M009 exact-host run measured six audible transitions, 0.7 ms p95
follow latency, a 40.815-second passage restart, a 40.913-second chapter
restart, no stale playback, one natural underrun/refill, 190 ms cancellation,
5,178 MiB peak dedicated GPU memory, zero retained units and audio files after
cleanup, and zero external requests. Its 378.46 buffering seconds per playback
minute is observation-only and remains above the MVP allowance.

## Deferred coverage

The secure EPUB, reader, narration-preparation, M007 service/protocol, M008
exact-development quick/prepared flows, and M009 segment synchronization now
have their scoped deterministic, packaged, and exact-host evidence. Default
tests and CI still load no candidate or model; the model-backed M009 timing,
highlight/follow, navigation, persistence, and cleanup matrix remains a
separate exact-host command. General supported-hardware detection, standard
profile selection, installer behavior, and complete production-profile MVP
end-to-end coverage remain deferred. The examples below are requirements for
those later roadmap milestones, not claims about current coverage.

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
- Quick-start and explicit prepared-playback targets remain distinct.
- Duration, complete-unit, payload-byte, prepared-text, and active-work bounds
  apply simultaneously at the approximately 30-minute ceiling.
- Playback-only pause continues only same-identity bounded generation; explicit
  stop and invalidating actions clean up.
- Low-buffer warnings, involuntary rebuffering, and intentional adaptive
  boundary waits are independently observable.

### Integration

Examples:

- EPUB navigation and spine extraction from a small safe fixture.
- Mapping between sanitized rendered content, prepared narration segments, and stable reading locators.
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
- Verify that explicit 1-, 2-, 5-, and 10-minute prepared-playback targets show
  content-free progress and do not change quick-start behavior.
- Verify that playback-only pause can build valid lead only to the frozen
  maximum, while explicit stop and invalidation release work and audio.
- Verify that nearing the generation frontier warns and then enters a truthful
  buffering state, with intentional boundary waits measured separately.
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
- Intentional adaptive boundary-wait count and duration, reported separately.
- Cancellation latency.
- CPU, GPU, VRAM, and RAM use.

Performance tests may be hardware-specific, but their input text and procedure must be reproducible.

## Fixtures

Fixtures must be:

- Synthetic and committed directly.
- Public-domain with provenance documented.
- Small enough for fast deterministic tests.

Do not use copyrighted commercial books.
