# Testing strategy

## Principles

- Test observable behavior.
- Keep tests deterministic.
- Use synthetic or public-domain text.
- Never require proprietary EPUBs or committed model weights.
- Separate correctness tests from hardware-dependent performance benchmarks.
- Run every acceptance command from normal local PowerShell outside the
  managed automation sandbox. Sandbox results are exploratory only and must be
  repeated unchanged outside before reporting pass or failure. This applies to
  unit, integration, format, lint, type, schema, build, Python, Rust, browser,
  WebView2, model, firewall, performance, and exact-host validation.

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
- `packages/shared/src/contracts/host-profile-compatibility-report.test.ts`,
  `apps/desktop/src/tts/hardware-profile-authority.test.ts`, and the test-only
  Rust `hardware_profile_authority` module freeze M010's separate privacy-safe
  host report, exact MiB/count maxima, provider and precision set, unknown and
  unsupported-version behavior, synthetic fixture conformance,
  result-blind profile margins/matching/preference policy, closed failure and
  recovery tables, zero automatic attempts, bounded diagnostics, selected
  native API families, and the existing zero-plugin/zero-renderer-capability
  boundary. They collect no host facts and make no support or fallback claim.
- `apps/desktop/src-tauri/src/host_profile_detection.rs` and
  `apps/desktop/src/tts/host-profile-client.test.ts` implement and test M010's
  narrow host-report boundary. Injected native snapshots cover complete,
  partial, permission-denied, malformed, multi-adapter, integrated-only,
  low-memory, no-provider, unknown, ambiguous, unsupported-platform, and
  single-concurrency cases. The exact-host regression additionally proves an
  unusable discarded adapter cannot downgrade a complete selected provider,
  while unknown selected-provider memory remains partial. A Windows production
  smoke exercises the direct
  bounded probe without recording its values. Desktop tests independently
  decode complete and partial reports and replace malformed/native failures
  with fixed content-free errors. Source audits prohibit process, network,
  model, and persistence surfaces. These tests select no profile and make no
  support or fallback claim.
- `apps/desktop/src/tts/hardware-profile-registry.test.ts`,
  `hardware-profile-matcher.test.ts`,
  `hardware-profile-compatibility.test.ts`, the bounded profile-preference
  suite, and `HardwareCompatibilityControls.test.tsx` cover M010's measured
  matching boundary. They verify immutable evidence hashes and strict
  authority/result ancestry; every resource/provider boundary and max-plus-one;
  incomplete/unknown facts, rejected entries, ties, stale/future preferences,
  and the development gate; one concurrent probe and pre-start recheck; and
  keyboard, focus, status, forced-color, reduced-motion, and content-safety
  behavior. M010 Milestone 6 adds the immutable supported Piper entry, explicit
  Piper/Qwen selection, stop-before-switch behavior, profile-aware native
  start, and one-tree supervisor coverage. The production Chromium foundation
  smoke covers the compact panel without reducing the fixed reader viewport.
  Deterministic tests load no model and cannot make a host support claim.
- M010.1 Milestone 6 extends those same boundaries with exact Piper/joe
  English, Chatterbox Spanish/English, Qwen/Serena Spanish, and Qwen/Aiden
  English bindings. Registry, matcher, coordinator, process-client, UI, Python
  adapter/service, and Rust supervisor tests prove language/profile closure,
  supported versus development-only selection, exact configuration gates,
  one-child replacement, and content-safe failures without loading models.
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
- `services/tts/tests/test_benchmark_v7_authority.py` freezes M010.1's
  result-blind bilingual product/evaluation inputs before audio generation. It
  verifies exact profile, candidate manifest, Spanish/English normalization
  corpus, balanced synthetic evaluation corpus, raw/summary schemas, and
  admitted candidate lock hashes; exact bounded candidate order and intake
  decisions; closed schema conformance; content privacy; and strict
  authority-tree plus Git-ancestry ordering for later result files. M010.1
  Milestone 2 replaces the historical English-rejection regression with
  closed `narration-bilingual-v2` acceptance while retaining rejection of
  English on historical and Piper profiles. These tests load no candidate
  library, model, audio, or hardware and make no English-engine or
  candidate-pass claim.
- M010.1 Milestone 2 covers all 16 frozen normalization cases, deterministic
  source mapping and Spanish regression, bounded language persistence,
  accessible explicit selection, exact profile/language admission before
  child start, and identity-first stale-audio containment. The Chromium smoke
  verifies the closed radio group and storage envelope; the packaged native
  smoke performs the same preference path alongside its supervised fake TTS
  lifecycle. The additive v2 normalizers are separate from the byte-frozen v1
  normalizer and Spanish table; focused v6/v8 authority tests protect those
  historical hashes from implementation drift.
- `services/tts/tests/test_benchmark_v8_authority.py` preserves that complete
  v7 base and validates the result-blind v8 amendment before audio generation.
  It verifies exact Qwen 1.7B CustomVoice / Serena / Spanish and Qwen 1.7B
  CustomVoice / Aiden / English identities, the reused lock/model revision,
  cloud/cloning/design exclusions, unchanged v7/corpus bytes, closed v8
  schemas, candidate-language-stage-lock binding, private-content rejection,
  and complete v7-plus-v8 authority-tree ancestry. The combined focused suite
  passes 14 tests without loading a model, audio, or hardware.
- `services/tts/tests/test_benchmark_bilingual_screen.py` proves the v8
  control/screen protocol without loading a candidate. It freezes one cold
  load, one warm first attempt for each of five cases per language, four
  cancellation trials per evaluated language, the independent Serena/Spanish
  and Aiden/English identities, 24 kHz mono output, and content-safe
  machine-rejection derivation with quality correctly marked
  `not-admitted`.

M010.1 result-bearing Qwen controls must run sequentially from a clean
committed checkpoint under the exact candidate interpreter. Set
`HF_HUB_OFFLINE=1` and `TRANSFORMERS_OFFLINE=1`, use the ignored local model
root `models/qwen3_1_7b_customvoice_cuda`, and pass a closed JSON request to
`python -m benchmarks.bilingual_screen_cli preflight` before replacing
`preflight` with `machine`. The exact interpreter must have one enabled
outbound-block Windows Firewall rule named
`VoxLeaf TTS Benchmark Offline`; failure to prove that rule stops before
inference. Raw sessions remain ignored under `benchmarks/tts/raw/v8` and must
be validated and deleted through
`python -m benchmarks.bilingual_screen_result_cli`, never copied into tracked
documentation.

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
- `services/tts/tests/test_piper_adapter.py` and
  `test_piper_service.py` remain model-free while byte-comparing the exact
  candidate lock and frozen v6 identity. Injected Piper and ONNX Runtime
  modules cover interpreter ownership, exact versions, artifact hashes,
  CPU-only provider admission, offline controls, native waveform validation,
  bounded linear 22,050-to-24,000-Hz mono conversion, content-free failures,
  cleanup, and protocol service routing. Importing the adapter does not import
  Piper or ONNX Runtime.
- `packages/epub/src/index.test.ts` proves that the isolated EPUB package consumes synthetic book and locator contracts through the public `@voxleaf/shared` workspace boundary and exports only the validated `openEpubPublication` runtime entry point. `packages/epub/src/document/document-model.test.ts` exercises the public closed block/inline/navigation/resource/locator shapes, readonly recursive collections, opaque identifier separation, spine/non-spine documents, and explicit resource-read/locator-resolution/close lifecycle. Package-internal path, archive, processing-budget, XML-event, package, identity, navigation, XHTML projection, resource, and locator suites exercise untrusted ingestion with synthetic in-memory inputs, strict byte/count/depth/ratio/text/semantic-block limits, injected cancellation/deadlines, namespace-aware XML, fixed content-free failures, and no filesystem, network, worker, or DOM use. The XML/package regressions accept and omit valid legacy `meta name/content` compatibility values plus the inert HTML doctype in content documents while continuing to reject mixed/malformed metadata, package/container or non-HTML doctypes, public/system identifiers, internal subsets, custom entities, XInclude, and external-resource processing instructions. `packages/epub/test-support/epub-fixture.ts` supplies test-only deterministic arbitrary-ZIP, minimal-EPUB, comprehensive-EPUB, and documented byte-mutation builders with fixed order, timestamps, attributes, compression, and writer capabilities; `packages/epub/src/testing/epub-fixture.test.ts` proves repeated byte identity, fixed metadata, rich public opening, malformed construction, stale-checked mutations, caller-owned inputs, and no network or worker behavior. `packages/epub/src/public/open-epub-publication.test.ts` reuses the minimal builder to drive repository-authored in-memory EPUB bytes through the public opener and proves immutable semantic/navigation/resource/locator assembly, compatibility opening, exact resolution, close, every closed detail-to-`OperationalErrorV1` mapping, unknown-exception redaction, value-based invalid/cancelled results, and no network or worker capability. `packages/epub/src/integration/ingestion-matrix.test.ts` drives minimal, comprehensive, and adversarial deterministic EPUB bytes through the public boundary and proves representative failure at every ingestion stage, every untrusted-input detail family, rich deterministic success, shared-contract acceptance, lazy resource behavior, locator exact/recovery behavior, lifecycle closure, failure cleanup, privacy redaction, and absence of external capabilities. `packages/epub/src/document/xhtml-projector.test.ts` additionally proves allowlisted block/inline order, inherited language and direction, ordinary/code whitespace policy, opaque local links and images, inert external-link labels, omission of active/style/hidden/foreign/remote content, transactional failures, exact/max+1 content-document-byte and semantic-block accounting, and internal globally unique source-ID capture without changing semantic output. `packages/epub/src/resource/opened-publication.test.ts` proves lazy local GIF/JPEG/PNG/WebP reads, declared-size and signature gates, opaque immutable descriptors, independent caller-owned allocations, read-scoped and close-triggered cancellation, single-read concurrency, idempotent release, and closed-handle behavior without caching or external capabilities. `packages/epub/src/locator/locator-index.test.ts` proves final preorder assignment, exact/max+1 source-ID acceptance, deterministic duplicate/invalid/collision replacement, exact-byte and spine binding, shared-decoder round trips, Unicode code-point offsets, cancellation, immutability, and content-free failures. `packages/epub/src/locator/locator-resolver.test.ts` proves exact full-tuple resolution, wrong-book and malformed rejection, nearest offset/anchor/spine/book-start recovery, deterministic earlier-spine tie breaking, canonical immutable output, cancellation, and content-free failures without prose, page, or layout search. CFI parsing remains unsupported and deferred; public narration preparation is implemented and covered by the focused suites below, while application rendering, position restoration, and persistence remain desktop-owned.
- The current matrix deliberately expects OPF `version="2.0"` to return
  `unsupported-version`; no NCX parser or EPUB 2 support claim exists yet.
  Accepted
  [ADR-0048](../architecture/decisions/ADR-0048-admit-bounded-epub2-and-ncx-compatibility.md)
  and the
  [active M003.1 ExecPlan](../plans/active/M003-001-bounded-epub2-and-ncx-compatibility.md)
  now provide the completed Milestone 1 fixture authority:
  `buildMinimalEpub2Fixture` emits deterministic in-memory direct or deprecated
  wrapper metadata, explicit OPF/NCX overrides, optional `guide`, and raw
  test-only NCX/XHTML doctype inputs while leaving the EPUB 3 builder unchanged.
  Focused and public tests prove byte repeatability, fixed reviewable entries,
  caller-input non-mutation, no network/Worker capability, content-free
  rejection, and the current `unsupported-version` result. Later milestones
  replace that green expectation atomically. Full acceptance still requires
  the package/NCX parser, hostile target/budget/cancellation/privacy cases, and
  equivalent reader/restoration/narration journeys with distinct exact-byte
  identities. Milestone 1 changes no production parser or support claim.
- `packages/epub/test-support/epub-fixture.ts` is also the sole test-only source for reader navigation, reflow/restoration, valid/malformed raster, and exact/max-plus-one long-chapter EPUB bytes. Browser, benchmark, and native smoke helpers import those named builders directly; their expected structural locator fields are repository-authored constants rather than parser-derived fixture output.
- `packages/epub/test-support/narration-normalization-corpus.ts` is the accepted Task 1.2 test-only neutral/Spanish policy table. Its 62 frozen synthetic-sensitive cases record source semantics, per-unit effective language, exact expected narration text, ambiguous/unsupported preservation, and protected boundaries across whitespace, line breaks, hyphenation, punctuation, abbreviations, numbers, dates, times, currency, percentages, symbols, code, Unicode, mixed language, malformed input, and foreign names. `packages/epub/src/testing/narration-normalization-corpus.test.ts` proves category/edge coverage, unique identity/source signatures, deep immutability, and content-free closed validation failures. Tasks 3.1-3.4's `packages/epub/src/narration/narration-normalizer.test.ts` drives the complete accepted table through production source projection/token mapping and normalization, proving exact neutral/Spanish output, composed invariants, second-pass idempotence, legal retained origin spans, source immutability, deep freezing, exact limits, and content-free failures. Task 4.1's `packages/epub/src/narration/narration-boundary-scanner.test.ts` drives the same corpus through deterministic source-offset sentence/dialogue/clause/protected-token scanning and adds focused terminal-cluster, quotation, malformed fallback, structural metadata, two-pass work, exact/max-plus-one protected-token, and privacy evidence. Tasks 4.2-4.3's `packages/epub/src/narration/narration-segment-packer.test.ts` drives those scans through cancellable block-local target/hard packing and adds heading/scene-break, boundary-priority, exact source/code-point/UTF-8-byte, combining/protected-token, oversized unprotected-token splitting, indivisible-sequence limit failure, retained unit/text/byte ceilings, deterministic work/yield cancellation and retry, range-order, batch-slicing independence, immutability, and privacy evidence. Task 4.4's `packages/epub/src/narration/narration-prepared-segment.test.ts` validates complete packed output before publication, resolves every canonical half-open endpoint and continuation exactly, proves monotonic block-local repeat stability and deep freezing, wraps prepared values through `decodeNarrationSegmentV1` with test-only identities, and rejects inconsistent source identity without exposing sensitive text.
- `apps/desktop/src/integration/package-reader-matrix.test.tsx` loads those sanctioned test-support builders through Vitest while exercising runtime behavior only through the public `@voxleaf/epub` root and desktop application boundaries. Its deterministic matrix proves real-byte open, semantic render, exact/recovered/unavailable target navigation, canonical save, close, same-byte reopen/exact restore, nearest-offset recovery, different-byte isolation, malformed/future-state fallback and preservation, over-limit chapter rejection, valid/signature-mismatched/missing-reference raster outcomes, stale successful-open cleanup, and content-free storage/results with no console logging.
- `apps/desktop/src/vite-config.test.ts` freezes the renderer/native watcher
  boundary: Vite ignores `apps/desktop/src-tauri/**`, leaving Rust source and
  generated-target observation to Tauri/Cargo and preventing Windows `EBUSY`
  failures on the locked development executable.
- `apps/desktop/src/file-ingress/local-epub-file.test.ts` verifies exact/max-plus-one size preflight without allocating a 100-MiB fixture, invalid sizes, caller-owned bytes, post-read length mismatch, active `FileReader` abort, and fixed content-free read failures. `apps/desktop/src/publication/publication-session.test.ts` proves one cancellable/replaced publication lifecycle, stale-success cleanup, shared close, reopen, and package-error redaction. `apps/desktop/src/publication/local-publication-open.test.ts` composes both boundaries and proves the real invalid-input path, replacement-at-selection cleanup, abort/stale-read rejection, bounded-byte handoff, closed read/package/close outcome mapping, unmount cleanup, and unexpected-failure containment. `apps/desktop/src/persistence/reader-position-repository.test.ts` proves the asynchronous replaceable Web Storage adapter, exact-identity lookup, strict nested/shared and app-local decoding, fixed-key isolation, most-recent replacement, 128-state eviction, serialized-size rejection, malformed-current repair, unsupported-version preservation/write disablement, no coercion or sensitive fields, independent preference/position migrations, and content-free read/write failures. `apps/desktop/src/persistence/reader-position-save-coordinator.test.ts` uses a manual clock and lifecycle port to prove the exact 499/500 ms passive boundary, latest-only supersession, immediate position/preference coalescing, passive-to-settled promotion, hidden/`pagehide`/close flushes, serialized bounded writes, stale-book rejection, failure containment, and content-free records. `apps/desktop/src/persistence/reader-position-restore-coordinator.test.ts` proves exact and nearest-valid resolution, every fixed repository fallback, identity mismatch, resolution failure, stale-read cancellation, one preference read per application owner, and close containment without exposing content. `apps/desktop/src/reader/reader-lifecycle.test.ts` proves immutable idle/opening/ready/empty/failure/closing states, zero-locator empty classification, prior-publication clearing, stale completion rejection, shared close, reopen, cleanup invalidation, renderer-failure cleanup, and content-free failures. `apps/desktop/src/reader/large-chapter-rendering.test.ts` proves recursive below/exact/above semantic-block and projected-node boundaries plus exact 250-block scheduling, one pending yield, cancellation, and stale-callback rejection. `apps/desktop/src/reader/SemanticDocument.test.tsx` proves exhaustive semantic headings, paragraphs, block quotes, ordered/unordered lists, text, emphasis, strong text, code, line breaks, inherited language/direction, source order, React text escaping, available/inert internal-target presentation, accessible unloaded raster fallback, omission of publisher attributes/styles/identities/URLs from rendered markup, first/next incremental batches, and no partial content above the ceiling. `apps/desktop/src/reader/active-visual-locator.test.ts` injects deterministic viewport, block, caret, scheduler, and observer ports to prove top/partial/between/end selection, source-order ties, exact code-point mapping, ambiguous-caret and structural block-start fallback, package normalization, geometry omission, duplicate suppression, visibility-bounded measurement, callback coalescing, nested suspension, and exhaustive cleanup. `apps/desktop/src/reader/ReaderPublication.test.tsx` proves canonical coordinator state, same-spine passive active-locator updates, exact and recovered target resolution, non-spine unavailability, chapter boundaries, hierarchical TOC order, fixed unavailable explanations, TOC/internal/chapter convergence, application-owned skip/return focus without URL mutation, passive focus/storage isolation, explicit-navigation tracker suspension and destination focus, initial target materialization/range settlement without focus movement or premature save, settled explicit/preference-reflow save intents, last-valid-locator preservation/recovery around an oversized destination, and omission of publisher anchors, hrefs, source fragments, DOM IDs, and browser-history mutation. `apps/desktop/src/reader/raster-image-policy.test.ts` verifies narrow GIF/JPEG/PNG/APNG/WebP metadata parsing, exact/max-plus-one dimensions/pixels/frames, static-only policy, malformed/type-mismatched rejection, and equal-or-stricter policy construction. `apps/desktop/src/reader/raster-image-source.test.ts` verifies one-decode concurrency, live source/pixel capacity, postdecode agreement, cancellation, fixed errors, no network calls, and exact object-URL release/close behavior. `apps/desktop/src/reader/publication-raster-image-loader.test.ts` verifies one serialized resource-read/decode path, the eight-outstanding-operation ceiling, queued cancellation, fixed unknown/read-failure fallback, caller-owned byte clearing, shared idempotent close, and content-free results. `apps/desktop/src/reader/SemanticRasterImage.test.tsx` verifies visibility-gated loading, semantic/missing alternative-text presentation, local ready rendering, late-result rejection, abort/release on unmount, final `<img>` failure fallback, and omission of resource identity. `apps/desktop/src/App.test.tsx` verifies the accessible six-state surface, busy/status semantics, accept hint, browser-picker cancellation, same-input clearing, validated metadata plus starting-spine semantic rendering without resource/target resolution when navigation is empty, zero-content recovery, exact/recovered restoration before reader settlement, delayed recovered-position rewrite, StrictMode mount-probe survival without closing live narration/restoration/persistence/application resources, final position flush ordering before replacement/close, preference writes, explicit close/reopen, fixed open/close/render failure messages, private-filename/metadata/error omission, stale-result rejection, render-boundary cleanup, real-unmount cleanup, and the independent synthetic raster-probe presentation.
- ADR-0041 supersedes the older App-surface clauses above: the current suite
  proves one stable custom Open a book action, no empty-state Settings or
  compatibility chrome, replacement/unmount cleanup, and no manual raster
  probe. Raster owners and the packaged production-path fixture retain the
  security evidence.
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

The M010 closeout run exposed a nondeterministic synchronization-probe race on
clean hosted Windows. The proof captured publication-DOM and range geometry
before a legitimate lazy raster/layout update triggered by its own reader
scroll had settled, so the same unchanged application could report the target
outside the reader and the DOM changed. The corrected test waits for a bounded
maximum of 24 animation frames and requires three consecutive content-free
stable geometry/DOM observations before registering the highlight and taking
the preservation baseline. It does not weaken viewport, focus, selection,
contrast, underline, DOM, URL, or two-post-registration-frame assertions.

### Native raster decode safety

ADR-0010 requires native Windows WebView2 evidence because jsdom cannot execute
`HTMLImageElement.decode()` or prove the packaged CSP. `pnpm.cmd
test:native-startup` opens the comprehensive repository-authored synthetic
EPUB, scrolls its image host into the lazy-load margin, requires a visible 1×1
`<img>` with semantic alt text and an application-created `blob:` source, then
replaces the publication and verifies that the image is removed with no
page/console error or external request. ADR-0041 removed the weaker manual
raster-probe button and its isolated application adapter; it is no longer a
setup or acceptance step.

The automated fixture proves publication integration without using private
input. Fixed unavailable state remains failure evidence and must not be
rewritten into success. Deterministic tests own exact/max-plus-one dimensions,
pixels, frames, concurrency, live capacity, cancellation, postdecode mismatch,
queued/stale work, byte clearing, and exact revocation behavior. Repeat native
startup after material Tauri/WebView2, CSP, Blob/object-URL, image-decoder,
raster-loader, or raster-boundary changes.

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
settled placement, passive retargeting from an audible paragraph to an
actionable visible preview without an automatic restart, exact registered-block
pointer-hover preview, stable pointer transfer through the reader gutter from
publication text to the leaf, pointer-leave restoration, rapid-action
rejection, stale-completion suppression, restored checkpoints,
StrictMode-safe cleanup, and a single retained control.
Keyboard, pointer, and touch activation share the same action. Browser
foundation coverage checks a 44-pixel target, visible focus, forced-colors,
non-colour state text, touch behavior, and absence when narration is
unavailable. The packaged smoke covers the same bounded reader and
synchronization regression path without claiming a dedicated native leaf
assertion; no model is loaded by default.

The Milestone 4 packaged smoke and the final Milestone 6 local closeout smoke
pass on the current Windows host after their release builds. A
`webdriver-session-not-created` failure remains a known host-automation
boundary on affected runs and is not evidence about an application assertion;
required clean-host pull-request validation remains the authoritative packaged
gate. Pull request #142 passed both required foundation jobs and closes M009.1.
On Windows, all six Playwright tests can report passing before
the preview child remains attached and the bounded wrapper times out; this is
the documented M004 post-test teardown issue.

The final closeout also keeps synchronization perception independent from
deferred raster presentation. The comprehensive synthetic EPUB's last
paragraph owns a lazy local image, so the packaged proof selects a text-only
narration target before asserting stable publication DOM and follow geometry.
This prevents a legitimate raster mount from being misclassified as a
highlight mutation while preserving separate local-raster decode coverage.

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
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-authority.test.ts src/tts/playback-transition-policy.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/adaptive-preparation.test.ts src/tts/AdaptivePreparationControls.test.tsx src/tts/product-narration-coordinator.test.ts
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

M008.1 adds `playback-transition-policy.test.ts` plus scheduler/player/
coordinator cases for every frozen semantic delay, terminal ellipsis, numeric
metadata retention, one pending timer, exact audible-start order,
pause/remainder/resume, invalidation, real-buffer substitution, final-unit
completion, content-free metrics, and truthful transition status. These tests
allocate no silent PCM and leave the older adaptive low-buffer wait at zero.

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
runtime is not exposed, preparation starts at the active narration locator with
an abort signal, only one request is active, sole audio ownership transfers to
the player, passive visible-locator changes preserve active and paused work,
explicit targets make old work stale before cancellation, preparation failures
are fixed/content-free, and snapshots contain no text, paths, or work
identities. Process-client and Rust supervisor tests cover the narrow
content-free exact-configuration availability result.

The hardware-specific packaged path is:

```powershell
pnpm.cmd test:tts:adaptive-exact-host
```

It requires the exact native Qwen/Serena environment, prepared artifacts,
outbound-blocking firewall rule, Tauri driver, and matching EdgeDriver. The
runner first executes a model-free UI-contract preflight. That preflight
verifies stable narration/chapter action identities and fixed content-safe
invariant codes before the release build or model inference, so presentation
copy and button order are not test authority. It then creates and deletes a
synthetic Spanish EPUB, exercises either quick depletion/buffering or a
60-second stable-playback observation plus cancellation, then reloads for
one-minute prepared playback. M009 Milestone 6 additionally verifies exact audible transitions,
valid half-open ranges, readable focus-safe following, keyboard pause/resume,
passage seek, chapter restart, stale suppression, reduced motion, forced
colors, retained/discarded-unit bounds, and generated-audio cleanup. Late
programmatic visual samples are suppressed during active narration; bounded
wheel-driven viewport inspection is now required to preserve the active
identity, highlight, leaf, and play intent. Explicit leaf, passage, and
chapter actions still prove identity-first replacement. It checks all four
prepared choices, content-free timing
and resource metrics, cleanup, and zero external requests. Cleanup samples RAM
and VRAM until they return within the frozen bound or a 15-second deadline;
it does not assume a fixed one-second release time. Generated audio is never
written. This run is excluded from default checks and CI.

M010 Milestone 6 adds the combined exact-host command:

```powershell
pnpm.cmd test:tts:resilience-exact-host
```

It requires both exact interpreters, local artifact roots, their
interpreter-bound outbound firewall blocks, Tauri driver, and matching
EdgeDriver. The runner proves Qwen and Piper separately: first through the
service lifecycle and then through the packaged adaptive reader path. It
checks one active request, busy rejection, cancellation, reload, quick and
prepared playback, synchronized navigation/replacement, bounded ownership,
cleanup, zero generated-audio persistence, and zero external requests without
averaging incompatible profiles. The exact Piper arm passes with zero
dedicated GPU use. Its product fixture includes a synthetic 400-plus-code-point
paragraph and an expansion-heavy sentence containing numbers, uppercase
acronyms, Roman numerals, currency, and percentage forms. The corrected
`narration-piper-v2` path must split both into locator-contiguous,
text-complete, sub-20-second units. After fast Piper generation fills the buffer, the fixture explicitly
selects the next passage to create a deterministic active-cancellation window
instead of depending on timing. The Qwen service arm passes. Its packaged arm
uses the generic `7,196`-MiB total-VRAM requirement and corrective
development-only `6,508`-MiB available-VRAM threshold. Below that threshold
the runner requires the exact closed rejection, verifies zero external
requests and no model start, and continues to the supported Piper arm. At or
above it, Qwen is offered and the complete matrix runs. The latest exact-host
run reached actual Qwen playback and later stopped at the depletion
synchronization assertion; that limitation is retained rather than converted
into a passing resilience claim.

The product-coordinator regression also proves that a punctuation-only Piper
range creates no TTS request, consumes no narration sequence number, advances
through the bounded continuation, plays the next speakable locator-linked
range, and leaves paragraph-leaf replacement available. This is a Piper
dispatch rule; generic/Qwen preparation and M005 normalization output remain
unchanged.

The final content-safe packaged private-book regression exposed a separate
second-batch scheduler mismatch. Valid non-empty narration fragments can report
zero recognized sentence boundaries; M005 models that measurement as a
non-negative `Index`. Scheduler coverage now proves that
`sentenceCount: 0` retains a prepared segment with zero retained sentence
resources and dispatches it normally, while the product-coordinator regression
proves Piper synthesizes the fragment without entering preparation failure.
The rebuilt packaged confirmation crossed the former 16-unit boundary with 27
accepted units, 60.837 playable seconds, active playback, no failure, and a
ready service.

Corrective Milestone 6 coverage also separates hardware matching from native
runtime configuration. Rust rejects unknown profile identities at the
content-free boolean boundary; the typed process client sends only the bounded
profile ID and fails closed on false or invocation failure; coordinator tests
prove that a hardware-compatible but unconfigured profile enables no Play and
starts no child, and that configuration is checked again immediately before
start. The release-packaged Piper matrix passes through the real configured
native gate.

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

The hardened M009.1 exact-host rerun passed after its 3.1-second model-free
preflight. It measured eight audible transitions, 296.1 ms p95 follow latency,
one natural underrun followed by refill, no stale playback, 172 ms
cancellation, 5,069 MiB peak dedicated GPU memory, resource release within
588 ms, zero retained units or audio files after cleanup, and zero external
requests. Its observed 291.3 buffering seconds per playback minute is
observation-only, confirms substantial run-to-run throughput variation, and
does not select or reject a new engine profile.

## M010 support and resilience closeout

The final
[`tts-support-matrix-v1`](../architecture/tts-support-matrix-v1.md) binds every
product support claim to immutable registry evidence and the frozen selection
records. Piper/davefx is `supported` only because v6 passed every machine,
quality, cancellation, memory, offline, cleanup, license, and packaging gate.
Qwen/Serena remains `development-only`; Qwen/Aiden and Supertonic/F1 remain
`unsupported`. Deterministic registry tests prove those exact states, evidence
hashes, margins, selection rules, one-tree replacement, and zero automatic
failover without loading a model.

Closeout validation runs:

```powershell
pnpm.cmd check
pnpm.cmd check:portable
git diff --check
```

The hardware-specific evidence remains the frozen v6 result and the separately
invoked `pnpm.cmd test:tts:resilience-exact-host` matrix described above.
Default checks do not rerun private/model-backed evaluation. Pull request #150
passed the required Ubuntu portable and Windows native checks, so M010 and the
related M008.1 closeout are archived.

## M010.1 bilingual profile integration

Milestone 6 preserves protocol v1 and adds exact language-bound implementations
for Piper davefx/Spanish, Piper joe/English, Chatterbox/Spanish,
Chatterbox/English, Qwen Serena/Spanish, and Qwen Aiden/English. Model-free
repository tests cover adapters, profile selection, native configuration,
hardware matching, language/profile switches, identity-first cancellation,
recovery, cleanup, and historical unsupported records.

The hardware-specific service matrix is manual, sequential, excluded from
default checks and CI, and requires all exact local assets plus
interpreter-bound outbound firewall rules:

```powershell
pnpm.cmd test:tts:bilingual-profiles-exact-host
```

Each of the six arms proves load/warmup, one bounded synthesis, busy handling,
cancellation and stale suppression, clean reload, a second bounded synthesis,
shutdown, and process cleanup. It emits only a fixed content-safe pass/fail
line, starts one model process at a time, and writes no generated audio. The
accepted exact-host run passed all six arms. This is service integration
evidence only; the separate M010.1 Milestone 7 packaged EPUB matrix now also
passes locally with portfolio-level performance/underrun evidence and final
privacy closeout.

M010.1 Milestone 7 adds a separate packaged portfolio validation command:

```powershell
pnpm.cmd test:tts:bilingual-portfolio-exact-host
```

It first runs the model-free UI/driver preflight, verifies the offline
environment and an enabled interpreter-bound outbound block for every exact
Python runtime, builds the release application once, and runs the existing
native lifecycle matrix. It then executes the six exact profile/language arms
sequentially through disposable Spanish or English EPUBs and the production
reader, coordinator, native supervisor, service adapter, in-memory player, and
synchronization path. Each arm exercises explicit language and profile
selection, quick and prepared playback, highlighting, leaf and chapter
navigation, pause/resume, stop/cancellation, bounded retention, resource
cleanup, application exit, and zero generated-audio persistence. The command
emits only content-free timing, underrun, intentional-transition, RAM/VRAM,
cancellation, synchronization, and cleanup observations. It is manual,
Windows/exact-host only, excluded from CI, and must not be run with private
EPUBs.

Pull request #159 passed the required Ubuntu portable and Windows native checks
and merged the M010.1 closeout.

## M010.2 reader/settings/playback validation

M010.2 Milestones 1-5 are complete and Milestone 6 local automated validation
passes. The bounded preferences, reader-first Settings shell, and six-rate
boundary-deferred playback are implemented.
`reader-settings-playback-authority.test.ts` exhaustively freezes the exact
shell and responsive values, Settings ordering and lifecycle neutrality,
language/profile presentation, preference envelopes, every rate and invalid
input, source/effective-duration threshold arithmetic, backend candidates and
gates, and unchanged M005/protocol/support/resource boundaries. The checkpoint
passes 45 desktop test files with 454 Vitest tests plus 11 native helper tests
and desktop type checking.

Milestone 3 adds repository and lifecycle coverage for language preference v2
and narration-start preference v1. Tests prove valid v1/v2 Spanish and English
retention, English fallback for every safe failure/reset state, exact UTF-8
limits and future-version preservation, every closed Quick/Prepared target,
no write during default hydration, controls disabled before hydration, profile
filtering, explicit Development labels, and stop-before-reset ordering. The
outside-sandbox acceptance run passes 49 desktop files/499 Vitest tests plus
11 native helpers, desktop type checking, all six browser cases, the release-
packaged WebView2 startup smoke, and the complete portable gate.

The Milestone 2 synthetic comparison selected no backend. WSOLA passed signal
and lifecycle checks but exceeded the frozen CPU limit in Chromium and
packaged WebView2. `HTMLMediaElement.preservesPitch` passed Chromium but the
unchanged packaged Tauri CSP rejected its in-memory `blob:` WAV. The negative
control shifted pitch. No candidate reached listening; all experimental
adapters were removed and that historical v1 result retained `1.00x`.

ADR-0035 authorizes a distinct reduced-range v2 comparison without changing
those results. `reader-settings-playback-authority-v2.test.ts` now freezes
exactly `1.00x`, `0.95x`, `0.90x`, `0.85x`, `0.80x`, and `0.75x`; rejects all
other values; pins the media-element, Signalsmith 1.3.2, and new optimized
repository WSOLA identities; checks the fee-free licence manifest and
pre-install audit stop; proves the current CSP is unchanged and the only
prospective delta is `media-src 'self' blob:`; and retains the v1 arithmetic,
resource, lifecycle, privacy, host, and result-lineage gates.

`reader-settings-playback-authority-v3.test.ts` separately freezes the six
rates, selected/pending/active state, latest-pending behavior, next-complete-unit
activation, exact media and repository-WSOLA candidates, 1,000 ms p95 first
activation, 250 ms p95 recurring handoff, 200 MiB process-RAM ceiling,
lifecycle-neutral speed selection, zero settled `1.00x` stretcher ownership,
fee-free licence/CSP policy, and strict authority/result lineage. It rejects
mid-unit activation, recurring use of the first-activation allowance, queue
invalidation on speed selection, retained `1.00x` resources, and post-freeze
gate mutation. Merged authority commit `4132229` precedes all candidate work
and results; runtime remains `1.00x`.

Milestone 2B passed the media and incremental-WSOLA candidates in Chromium and
packaged WebView2, while Signalsmith failed before its first Chromium trial.
Under exactly one active local Piper process, media exceeded the frozen
additional-RAM limit at 180.973 MiB and WSOLA exceeded frozen start latency at
821.6 ms p95. No candidate reached listening. ADR-0037 selects none; all
experimental adapters, runners, dependency/CSP changes, and temporary speech
were removed. The observed managed-sandbox WebDriver session-creation failure
is infrastructure-only because the same packaged command and candidates
completed from normal local PowerShell.

All final acceptance evidence must now come from normal local PowerShell,
outside the managed automation sandbox. Sandbox-only output is exploratory and
must be repeated unchanged outside before it can pass or fail a task or reject
a candidate.

The historical Signalsmith-only Chromium runner was repeated outside the
sandbox from implementation commit `f2e5fed`. It again failed before its first
trial after the 15-second initialization boundary, produced no pitch/duration/
frame/start metrics, and measured 85.160 MiB additional process RAM. A
temporary diagnostic run surfaced only the runner's content-safe
`PitchPreservingBackendProbeErrorV2`; the exact adapter initialization stage
remains unresolved. This is not the WebView2 sandbox failure and should be
diagnosed before any future Signalsmith evaluation.

Milestone 2D ran the separate v3 comparison entirely in normal local
PowerShell. Both media and repository WSOLA passed Chromium, packaged WebView2,
one-Piper contention, lifecycle, cleanup, privacy, and Spanish/English
listening. The selected WSOLA path measured `605.4 ms` p95 first activation,
`10.1 ms` p95 recurring handoff, `24.715 MiB` additional process RAM, and
`3.077` CPU percentage points under contention. Listening minima were `5/4/5`
with no omitted or repeated word. ADR-0040 selects it; the final tree removes
the media path, test CSP, probes, runners, evaluator, and temporary WAVs while
retaining only the selected controller/worklet and content-safe result. The
new result regression test verifies one selected complete passer, zero
external/audio persistence, and no dependency/CSP expansion.

Milestones 3-5 extend the existing desktop, browser, and native-startup
coverage rather than create an unrelated harness. Their model-free tests
cover:

- fixed app bar and sole reader scroll ownership;
- accessible Settings drawer/sheet focus, Escape, focus return, narrow/wide
  layout, forced colors, and reduced motion;
- lifecycle neutrality when Settings merely opens or closes;
- English fallback and valid Spanish/English preference preservation;
- language-, support-, development-, hardware-, and runtime-gated profiles;
- bounded startup and playback preferences;
- the six-value WSOLA connection, boundary-deferred activation,
  effective-listening lead, and source-frame progress;
- unchanged source-frame/byte/unit ceilings and transition-pause timers; and
- pause, resume, seek, profile/language replacement, recovery, book
  replacement, exit, and exact release ownership at every admitted rate.

Milestone 6 adds the existing `test:tts:bilingual-portfolio-exact-host`
closeout path. It runs Piper Spanish/English, Chatterbox Spanish/English, and
development-only Qwen Serena/Aiden sequentially with one model child at a
time. Piper exercises all six rates, latest-pending selection, next-unit
activation, return to direct `1.00x`, and content-free activation/handoff
metrics. The 2026-07-31 host run measured first activation at 750/300 ms and
recurring backend overhead at 0 ms p95; both Piper arms sustained one minute
without underruns. Chatterbox sustained the same observation at RTF 0.83/0.85.
Qwen truthfully depleted once and refilled at RTF 2.12/2.04. All arms passed
highlight/follow, navigation, cancellation, cleanup, zero external requests,
and zero generated-audio persistence. `test:browser`, `test:native-startup`,
`check:portable`, and `check` also pass outside the sandbox. Required PR checks
and maintainer confirmation of every admitted rate subsequently passed, so
M010.2 is complete.

Exact-host listening uses repository-authored synthetic text and content-free
measurements only. Default CI remains model-free. No private EPUB, waveform,
model artifact, path, or raw host identity may enter a result or fixture.

## M011 packaging and release validation

M011 Milestones 1 through 5 are implemented at their documented boundaries.
The dependency/audit, standalone Piper-core, optional runtime-package,
acquisition-controller, public runtime identity, and local Windows package
evidence below is current. Clean-host validation and signed public publication
remain requirements rather than pass evidence. Its
active
[`ExecPlan`](../plans/active/M011-package-validate-and-release-mvp.md)
requires a clean normal-user Windows package matrix in addition to the
existing deterministic, Chromium, packaged WebView2, and exact-host suites.

Milestone 3 adds these repository-owned commands:

```powershell
pnpm.cmd package:piper-core
pnpm.cmd package:piper-core:check
```

The build uses only fixed HTTPS build inputs plus the two exact ignored local
voice roots, constructs an atomic deterministic payload under ignored
`services/tts/release/core/dist`, verifies every manifest path/size/SHA-256,
creates the fixed ZIP, and runs Spanish/English smoke with Python socket APIs
denied. It persists no audio or narration text. `package:piper-core:check`
revalidates the complete installed file set, archive, authority hashes, and
tracked content-safe evidence. Maintainers use
`pnpm.cmd package:piper-core:write-manifest` only when intentionally updating
the frozen payload authority; ordinary validation must not rewrite it.

Focused deterministic coverage is in `test_release_core.py` and the native
`tts_release_core` tests. They prove traversal rejection, exact-manifest
acceptance, substituted/truncated/stale rejection, atomic failure cleanup,
prior-package preservation, fixed profile mapping, and content-free errors.
The native verifier embeds the trusted manifest and accepts only the fixed
install-relative `resources/tts/voxleaf-piper-core-v1` root.

Milestones 4A-4B add these safe authority/build commands:

```powershell
pnpm.cmd package:chatterbox-optional:check-source
pnpm.cmd package:chatterbox-optional:check-acquisition
pnpm.cmd package:chatterbox-optional
```

The two checks validate the versioned source and v2 acquisition manifests
without networking, reading model bytes, creating a runtime, or enabling an
end-user download. The build command is maintainer-only and writes ignored
runtime/ZIP/part outputs; `--no-sync` is used only after the exact environment
has already been synchronized. `test_release_chatterbox.py` and
`tts_optional_chatterbox` native tests cover withheld authority, mutable source
rejection, safe model-load sites, deterministic splitting, closed redirects,
wrong/truncated/oversized artifacts, cancellation, bounded reassembly/
extraction, staging cleanup, runtime tampering/staleness, atomic promotion, and
absence of profile mutation before explicit activation. Two outside-sandbox
builds produced identical v2 hashes/sizes. An authorized maintainer published
the exact resulting parts under `chatterbox-runtime-v2`; the manifest remains
withheld until the clean-host gates pass.

Milestone 5 adds these Windows-only commands:

```powershell
pnpm.cmd package:windows:check
pnpm.cmd package:windows
pnpm.cmd package:windows:lifecycle
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test-windows-package-lifecycle.ps1 -Product chatterbox-validation
pnpm.cmd package:windows:signed
```

The check validates the frozen version, NSIS/current-user target, exact resource
allowlist, exclusion boundary, uninstall hooks, and verified Piper payload.
The current unsigned build produced
`VoxLeaf_0.1.0_x64-setup.exe` at `181,704,648` bytes with SHA-256
`56b3d0c0d991c8ded3989d6283fdca39e1071765eaf09530c4a59b9152fedc2d`.
Milestone 6A extends the outside-sandbox lifecycle harness across the ordinary
and isolated validation identities. It backs up and restores pre-existing
application data, hash-checks exact optional/preference fixtures through repair,
and executes six silent outcomes: default preserve, Chatterbox only,
preferences/recovery only, both explicit options, legacy combined removal, and
invalid values preserve. Every arm verifies unrelated siblings plus an external
synthetic EPUB sentinel and leaves the interactive NSIS journey for the clean-
host manual arm. The exact validation artifact is `181,685,311` bytes with
SHA-256
`262391035327925b3bf5a9ea422ba381e89c59a20fc1cec1966ee37ae34f775f` and
passed Windows Defender; Defender was not run against the current ordinary
hash, and SmartScreen was not observed.
The signed command is fail-closed and remains unexecuted without an authorized
external certificate. None of these local results substitutes for Milestone
6's clean-user matrix.

Milestone 6 adds an installed-artifact form of the native harness. It accepts
exactly one absolute executable and does not build or select a repository
binary implicitly:

```powershell
$app = (Resolve-Path "$env:LOCALAPPDATA\VoxLeaf\voxleaf-desktop.exe").Path
node apps/desktop/scripts/native-startup-smoke.mjs "--executable=$app"
```

The current-host release rehearsal used that boundary for complete installed
Spanish and English Piper matrices, including all six playback rates, and
recorded zero external requests and zero generated-audio files. Two consecutive
installer/first-start/repair/uninstall cycles and an exact-installer Defender
scan also passed. The rehearsal exposed package-only stack-allocation,
bytecode-mutation, canonical-Windows-path, and stale-local-package defects;
focused regressions now protect each fix. This remains development-host
evidence: independent clean normal-user Windows and clean compatible-GPU
Chatterbox arms are still required.

The first independent Windows-host attempt exposed a blank console when the
private packaged Python/Piper child started. Standard-stream redirection alone
does not suppress a console-subsystem child window under a GUI parent. The
supervisor now applies Windows `CREATE_NO_WINDOW` to its child command before
spawn; the focused Windows regression freezes that flag, and the rebuilt
installed Piper matrix proves that protocol, narration, cancellation, and
cleanup remain intact. Visual clean-host confirmation must use the current hash
above rather than an earlier installer.

The remaining release matrix must distinguish:

- exact shipped Node, Rust, base Python, and core/optional-profile dependency
  audits, including packages the advisory source cannot identify;
- integrity and licence/provenance validation for every bundled or explicitly
  acquired runtime, engine, phonemizer, model, and voice;
- install, first start, repair/reinstall, manual version replacement,
  application restart, and uninstall without developer tools or a manual
  firewall rule;
- a synthetic/public-domain Spanish and English journey across restoration,
  narration, all six playback rates, synchronization, cancellation, recovery,
  cleanup, privacy, accessibility, resource, and hostile-EPUB regression;
- normal reading/narration with external connectivity unavailable and zero
  generated-audio persistence; and
- deterministic optional-Chatterbox acquisition tests for consent, closed
  manifest identity, size/disk limits, wrong digest/version, traversal,
  interruption, cancellation, atomic install, restart recovery, explicit
  activation, removal, and unchanged Piper availability;
- a compatible clean-GPU-host Chatterbox arm covering absent/declined,
  verified download, Spanish/English offline narration, cold load, RTF,
  RAM/VRAM, application restart, removal, and Piper use afterward; and
- Piper-core portfolio, optional-Chatterbox, and signed public-installer
  evidence as separate decisions.

M011 audit, Piper-core assembly, optional runtime assembly, v2 acquisition-
authority, and local installer commands now exist. The current optional
manifest records the published runtime but remains withheld, so no end-user
acquisition is reachable. Development-host bounded application-data removal now
passes, but clean-host installation/offline use, cross-version replacement,
interactive uninstall, and complete product behavior remain Milestone 6 work;
do not describe those release gates as passing.

ADR-0045 adds a separate local validation build because no second compatible
GPU computer is available. Its static check proves that the ordinary manifest
remains `withheld`, the validation overlay is exact and not public-authorized,
the product/identifier/data root are distinct, Chatterbox bytes are not bundled,
and the Cargo feature is explicit. Native tests must pass both without and with
`chatterbox-acquisition-validation`; the feature-enabled arm must expose
consent without creating staging or contacting the network. Building and using
this installer on the development computer is useful functional evidence but
is never called clean-host acceptance.

```powershell
pnpm.cmd package:windows:chatterbox-validation:check
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features chatterbox-acquisition-validation tts_optional_chatterbox
pnpm.cmd package:windows:chatterbox-validation
```

All final M011 commands run outside the automation sandbox under the existing
repository testing rule.

## Deferred coverage

The secure EPUB, reader, narration-preparation, M007 service/protocol, M008
exact-development quick/prepared flows, M009 segment synchronization, and
M010 Windows host matching/recovery now have their scoped deterministic,
packaged, and exact-host evidence. Default tests and CI still load no candidate
or model; model-backed timing, profile, navigation, persistence, and cleanup
matrices remain separate exact-host commands. Non-Windows hardware support,
automatic updates, enterprise sandboxing, and cross-platform packaging remain
deferred. The minimum bilingual Piper payload and local Windows installer path
are implemented. Clean-host product validation and separately gated optional
Chatterbox acquisition/removal remain approved M011 work. The examples below
are requirements, not claims about those later gates.

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
- Every prepared semantic boundary maps to its frozen playback-transition
  delay, including the terminal-ellipsis override.
- One transition timer blocks only an already-buffered successor; pause/resume
  preserves its remainder, invalidation suppresses late callbacks, and real
  buffering or final completion adds no timer.

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
- Verify that adjacent generated units retain the frozen semantic separation
  without adding silence before first audio, after a real underrun, or after
  the final unit.
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
- Intentional adaptive low-buffer-wait count and duration, reported separately.
- Intentional semantic transition count and duration, reported separately from
  audible playback and involuntary buffering.
- Cancellation latency.
- CPU, GPU, VRAM, and RAM use.

Performance tests may be hardware-specific, but their input text and procedure must be reproducible.

## Fixtures

Fixtures must be:

- Synthetic and committed directly.
- Public-domain with provenance documented.
- Small enough for fast deterministic tests.

Do not use copyrighted commercial books.
