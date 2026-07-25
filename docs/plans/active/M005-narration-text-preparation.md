# Prepare text for natural narration

## Goal

Complete roadmap Milestone 5 by adding a deterministic, bounded, framework-independent narration-preparation pipeline that derives speech-oriented text and semantic segments from the already-sanitized EPUB model without changing the text shown by the visual reader.

Each prepared segment must retain an ordered `LocatorRangeV1` over the exact source publication so later seeking, highlighting, cancellation, generation, and progress can share the existing logical reading position. This milestone prepares sensitive text for later local TTS work; it does not synthesize, play, persist, transmit, or display narration.

## User-visible outcome

Milestone 5 adds no playback control or audible behavior by itself. Its user-visible value appears in later milestones:

- narration can use a speech-oriented representation while the reader continues to display faithful source text;
- headings, paragraphs, dialogue, scene boundaries, punctuation, abbreviations, numbers, dates, times, currency, symbols, and long sentences produce predictable segment boundaries;
- Spanish text receives explicit deterministic coverage, including inverted punctuation, dialogue marks, decimal and thousands separators, abbreviations, dates, years, times, currency, and embedded foreign names;
- every nonempty prepared segment maps back to the semantic passage that produced it; and
- large or adversarial chapters cannot cause unbounded text preparation, output, memory growth, or uncancellable work.

No claim of natural voice quality, pronunciation quality, startup latency, or supported hardware is made until the later model and integration milestones validate those outcomes.

## Current state

At plan creation on 2026-07-24, `main` is clean at `f915ef0`, roadmap Milestones 1 through 4 are complete, and Milestone 5 is the next implementation priority.

Implemented prerequisites are:

- `@voxleaf/epub` opens bounded local EPUB bytes into immutable semantic documents, navigation, raster descriptors, and located semantic blocks.
- The closed semantic model represents headings, paragraphs, block quotes, lists, text, emphasis, strong text, code, line breaks, internal-link labels, and raster placeholders. Publisher HTML, CSS, scripts, active URLs, and DOM objects do not cross this boundary.
- Every addressable block has a deterministic `ReadingLocatorV1`. Heading and paragraph offsets count Unicode code points; line breaks and raster placeholders each occupy one source position. Structural block quotes and lists have offset zero while their descendant blocks own text offsets.
- `OpenedPublication.resolveLocator` validates exact offsets and performs structural recovery without searching prose or layout.
- `@voxleaf/shared` already defines `LocatorRangeV1` and `NarrationSegmentV1`. The narration contract carries sensitive text, a source range, sequence, book identity, and session/generation identity, but deliberately leaves normalization, language, prosody, and chunk production rules undefined.
- The shared test-support fixture includes synthetic headings, paragraphs, dialogue, and a scene boundary. The EPUB fixture builder can supply repository-authored XHTML needed for package integration tests.
- The visual reader owns displayed text and the active logical locator. Tasks 2.1-5.3 now implement exhaustive narration source projection, Unicode-code-point source-span tokens, bounded canonical source windows/lifecycle, deterministic source-mapped neutral/Spanish normalization and invariants, deterministic boundary scanning, cancellable bounded semantic packing, oversized-token hardening, canonical locator-linked prepared segments, frozen closed public preparation batches through `OpenedPublication`, the repository-authored public EPUB-to-segment integration matrix, and deterministic resource-bound evidence; TTS, audio, highlighting, and reader/audio synchronization are not implemented.

Important current limitations are:

- the bounded source-window coordinator, normalizer, scanner, packer, and prepared-segment finalizer remain package-internal behind the public `OpenedPublication.prepareNarration` coordinator;
- the deterministic neutral/Spanish normalization corpus and model-independent `narration-v1` limits profile are accepted test-only; Tasks 3.1-3.4 implement whitespace, line-break, hyphenation, punctuation, quotation, ellipsis, malformed-preservation, the closed Spanish ampersand/Celsius rules, accepted Spanish abbreviation, numeric, date/time, currency, percentage, and language-context rules, plus composed-stream invariants and privacy canaries;
- transformed, collapsed, removed, joined, expanded, raster, punctuation, and semantic-line-break positions retain block-local origin spans through normalization and segmentation; Task 4.4 now constructs canonical prepared locator ranges only after the complete packed block validates;
- the public bounded preparation operation, broader synthetic integration matrix, and deterministic exact-bound/resource proof exist, while Milestone 6 still owns documentation and final close validation;
- no TTS engine has established model-specific input limits or preprocessing requirements; and
- the broad `synchronized-reader-and-startup-buffer.md` plan is historical context, not the implementation authority for Milestone 5.

This plan becomes the implementation authority for roadmap Milestone 5. It must not absorb model selection, process protocol, audio scheduling, playback, highlighting, or visual/audio conflict policy from later milestones.

## Scope and non-goals

### Scope

- Accept and document the framework-independent narration-preparation boundary before production code.
- Traverse the closed semantic block and inline unions exhaustively in source order.
- Build a source-mapped intermediate representation whose positions follow ADR-0007 Unicode-code-point accounting exactly.
- Keep displayed `SensitivePublicationText` immutable and produce a separate sensitive narration representation.
- Apply deterministic, conservative normalization for ordinary whitespace, semantic line breaks, soft and line-end hyphenation, Unicode punctuation, quotations, ellipses, abbreviations, numbers, dates, times, currency, and an allowlisted set of common symbols.
- Give Spanish (`es` primary language subtag) explicit rule and regression coverage while retaining language-neutral fallback behavior.
- Recognize semantic and lexical boundaries for headings, paragraphs, dialogue, scene breaks, sentences, clauses, abbreviations, decimals, initials, and unusually long sentences.
- Keep one prepared segment within one addressable heading or paragraph so paragraph-level highlighting remains unambiguous.
- Emit immutable nonempty prepared segments with ordered half-open source locator ranges and content-free measurements.
- Expose a bounded, cancellable, publication-owned preparation operation that can return a finite batch plus a content-free continuation locator.
- Preserve deterministic output independently of viewport, DOM, reader preferences, request batching, platform locale, wall-clock time, or TTS engine.
- Add synthetic unit, invariant, public-package integration, cancellation, privacy, exact-boundary, and deterministic resource tests.
- Update architecture, dependency, testing, product-status, roadmap, and plan documentation after implementation evidence exists.

### Non-goals

- Changing rendered EPUB text, semantic rendering, reader preferences, active visual-location tracking, persistence, or restoration.
- Choosing a TTS engine, voice, model, phoneme set, tokenizer, SSML dialect, pronunciation dictionary, or model-specific prompt/preprocessor.
- Detecting a book's language automatically. A caller may supply an approved default; explicit semantic language context may refine it.
- Guaranteeing correct pronunciation of every proper name, foreign name, acronym, mathematical expression, code sample, or ambiguous numeric form.
- Adding word-level timing, phoneme-level alignment, speech marks, highlighting, or automatic page following.
- Starting a TTS process, defining transport, creating session/generation IDs, scheduling inference, or handling stale audio.
- Generating, buffering, playing, exporting, caching, or persisting audio.
- Persisting normalized text, narration segments, a narration cache, source quotations, or language-analysis results.
- Sending text to a network service or adding telemetry.
- Narrating raster-image alternative text in the MVP. Images remain visual-only.
- Supporting fixed-layout, SVG, MathML, media-overlay, scripted, or otherwise unsupported publications beyond ADR-0007.
- Changing a shared serialized schema unless implementation proves the current `NarrationSegmentV1` or `LocatorRangeV1` boundary insufficient and the plan plus ADR are explicitly amended first.
- Claiming naturalness or performance for a real model. Milestone 6 owns model and hardware evidence.

## Definitions and terminology

- **Displayed text:** The immutable semantic publication text rendered by the visual reader. Narration preparation never mutates or replaces it.
- **Narration text:** A separate sensitive string normalized for speech. It must not enter logs, metrics, persistence, error details, snapshots, or URLs.
- **Narratable leaf block:** An addressable heading or paragraph. Block quotes and lists are structural containers; their heading/paragraph descendants are narrated in source order.
- **Source position:** A `ReadingLocatorV1` at a legal Unicode-code-point offset in one addressable block.
- **Source span:** An internal half-open `[start, end)` pair of source offsets retained while normalization changes text length.
- **Prepared segment:** One immutable piece of sensitive narration text plus a half-open `LocatorRangeV1`, structural boundary reason, and content-free size measurements. It is not yet a session-bound `NarrationSegmentV1`.
- **Half-open locator range:** `start` identifies the first consumed source position and `end` identifies the first source position after the segment. Adjacent ranges may meet at one locator without duplicating a source code point.
- **Narration profile:** A versioned package-local policy for normalization, segmentation, and hard limits. It is not a TTS model profile and is not a shared wire contract.
- **Neutral rules:** Deterministic language-independent whitespace and punctuation behavior used when no supported language policy applies.
- **Spanish rules:** Deterministic additions selected only for effective Spanish text; no statistical language detection is performed.
- **Semantic boundary:** A heading, paragraph, dialogue turn, scene break, or explicit line-break relationship inherited from the semantic model or recognized by an accepted deterministic rule.
- **Continuation locator:** A content-free canonical locator from which the next bounded preparation request can continue without retaining the previous sensitive result.

## Relevant files and documentation

### Governing documentation

- `AGENTS.md`
- `.agents/PLANS.md`
- `docs/README.md`
- `docs/product/vision.md`
- `docs/product/project-brief.md`
- `docs/product/mvp.md`
- `docs/product/glossary.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/overview.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/decisions/ADR-0003-stable-reading-locators.md`
- `docs/architecture/decisions/ADR-0006-json-schema-contract-authority.md`
- `docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md`
- `docs/architecture/decisions/ADR-0008-visual-reader-architecture.md`
- `docs/plans/roadmap.md`
- `docs/plans/completed/M002-shared-contracts-and-test-harness.md`
- `docs/plans/completed/M003-secure-epub-ingestion-and-document-model.md`
- `docs/plans/completed/M004-reflowable-visual-reader-and-position-restoration.md`
- `docs/plans/active/synchronized-reader-and-startup-buffer.md`
- `docs/development/dependencies.md`
- `docs/development/testing.md`
- `docs/development/setup.md`

### Existing implementation and tests

- `packages/epub/src/document/document-model.ts`
- `packages/epub/src/document/xhtml-projector.ts`
- `packages/epub/src/locator/locator-index.ts`
- `packages/epub/src/locator/locator-resolver.ts`
- `packages/epub/src/resource/opened-publication.ts`
- `packages/epub/src/public/open-epub-publication.ts`
- `packages/epub/src/index.ts`
- `packages/epub/src/integration/ingestion-matrix.test.ts`
- `packages/epub/src/public/open-epub-publication.test.ts`
- `packages/epub/src/resource/opened-publication.test.ts`
- `packages/epub/test-support/epub-fixture.ts`
- `packages/shared/schemas/locator-range/v1.schema.json`
- `packages/shared/schemas/narration-segment/v1.schema.json`
- `packages/shared/src/contracts/locator.ts`
- `packages/shared/src/contracts/narration-segment.ts`
- `packages/shared/src/contracts/narration-segment.test.ts`
- `packages/shared/src/testing/synthetic-document.ts`
- root and package `package.json` files, TypeScript configuration, `pnpm-lock.yaml`, and `.github/workflows/foundation-checks.yml`

### Expected implementation areas

ADR-0012 accepts the public `OpenedPublication.prepareNarration` operation,
`narration-v1` profile identifier, closed package-local result/types, and the
following intended implementation ownership:

- `packages/epub/src/narration/narration-policy.ts`
- `packages/epub/src/narration/narration-source.ts`
- `packages/epub/src/narration/narration-normalizer.ts`
- `packages/epub/src/narration/spanish-normalization.ts`
- `packages/epub/src/narration/semantic-segmenter.ts`
- `packages/epub/src/narration/narration-preparation.ts`
- focused tests beside those modules
- public narration types in `document-model.ts` or a dedicated exported type module
- opened-publication lifecycle integration in `resource/opened-publication.ts`
- synthetic narration cases in EPUB test support
- `packages/epub/test-support/narration-normalization-corpus.ts`
- `packages/epub/test-support/narration-preparation-limits.ts`
- focused test-only corpus and limit evidence under `packages/epub/src/testing/`
- `docs/architecture/decisions/ADR-0012-bounded-narration-preparation.md`
- `docs/architecture/narration-normalization-v1.md`
- `docs/architecture/narration-preparation-limits-v1.md`

No `apps/desktop`, `services/tts`, Rust, Tauri capability, browser-storage, or audio implementation change is expected.

## Architecture and constraints

### Ownership boundary

Narration preparation remains inside `@voxleaf/epub` as a framework-independent stage over the package's immutable semantic documents and locator index. [ADR-0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md) accepts this ownership because it keeps source traversal, code-point accounting, locator construction, and publication lifecycle under the owner that already defines them.

The accepted public shape is `OpenedPublication.prepareNarration(request): Promise<NarrationPreparationResult>`. Its closed request uses an untrusted start locator, package-local `narration-v1` profile, `und` or `es` caller default language, positive caller-requested segment count no greater than the accepted package maximum of 16, and optional `AbortSignal`. The operation:

- normalizes the start through package-owned locator resolution;
- processes only a finite source window and never materializes a whole publication by default;
- returns frozen prepared segments, canonical start/continuation locators, an exact/recovered start status, a stable-segment relation, and content-free measurements;
- returns only the accepted `batch`, `complete`, `cancelled`, `invalid-request`, `invalid-start`, `operation-active`, `resource-limit-exceeded`, or `internal-failure` outcomes;
- returns no partial batch after cancellation, close, internal failure, or a hard-limit failure;
- avoids image-resource reads, archive reads, DOM access, storage, network, workers, process APIs, and logging; and
- participates in `OpenedPublication.close()` so closing a book aborts and awaits active preparation before releasing publication resources.

At most one narration-preparation operation may be active per publication. A second call returns `operation-active` without cancelling or joining the first. Narration has a separate slot from the existing serialized raster-resource read, so one of each may overlap; close aborts and awaits both.

### Shared contract boundary

`NarrationSegmentV1` remains the process-facing contract. Milestone 5 should not manufacture session, generation, or segment identities because those belong to the later reading-session and scheduler owners.

The package-local prepared segment should reuse:

- `SensitiveNarrationTextV1` for the sensitive normalized string;
- `LocatorRangeV1` for its source range; and
- content-free counts such as source code points, narration code points, UTF-8 bytes, and sentence count.

Later coordination code will attach `segmentId`, `sessionId`, `generationId`, and generation-global sequence and validate the complete `NarrationSegmentV1`. Milestone 5 tests must prove that prepared text and ranges can be wrapped into the existing contract without changing its schema.

If a real incompatibility is discovered, stop that task, record it in this plan, and propose a versioned shared-contract amendment. Do not silently add optional fields to v1 or duplicate the schema in `@voxleaf/epub`.

### Source traversal and code-point accounting

Traversal must be exhaustive over the closed semantic unions:

- headings and paragraphs produce narratable leaf blocks;
- block quotes and ordered/unordered lists contribute structural boundaries and recurse through descendants in the locator index's existing preorder;
- text contributes its Unicode code points;
- emphasis, strong text, internal links, and code recurse through children while retaining context;
- a semantic line break consumes the one newline source position defined by ADR-0007;
- a raster placeholder consumes its one source position but emits no narration text; alternative text remains visual-only; and
- adding a future semantic union member must fail TypeScript exhaustiveness checks and require narration/security review.

The source mapper must never derive positions from publisher fragments, DOM nodes, rendered geometry, quotations, or text search. It must build legal offsets from the located block and validate public endpoints through the package locator boundary.

### Range semantics

ADR-0012 accepts the following range policy:

- prepared ranges are half-open `[start, end)`;
- a segment remains inside one heading or paragraph, so its start and end share book, spine, and anchor identity;
- `end.textOffsetCodePoints` may equal the located block's legal text length;
- ranges are nonempty in narration text, ordered by source position, and non-overlapping;
- skipped source positions may create gaps between ranges but may not reverse them;
- a normalization expansion may map multiple output code points to one source span;
- a deletion, such as a soft hyphen or scene marker, remains part of internal source consumption even though it emits no narration text;
- an inline raster position between spoken text may lie inside the segment's enclosing range but is never narrated; and
- normalization and segmentation batching must not change source ranges for the same publication and profile.

ADR-0012 requires a request beginning inside an already segmented sentence to return the complete containing stable segment first and report `inside-segment`. Starts at a stable boundary report `at-segment-start`, unspoken gaps report `before-next-segment`, and exhaustion reports `publication-end`. Milestone 9 still decides whether a particular play or seek interaction uses the containing segment, the next segment, or another valid target.

### Separation of displayed and narration text

Production normalization must be pure with respect to the semantic model:

- never mutate semantic objects, strings, arrays, locators, or documents;
- never feed normalized text back to `SemanticDocument`, the React reader, persistence, navigation, or locator resolution;
- never use normalized text as a locator anchor or book identity;
- never place narration text in an error, metric label, status, debug value, snapshot, or exception message; and
- clear request-owned intermediate arrays and release references after completion, cancellation, replacement, or close where practical.

Tests must retain both source and narration values and prove the source model remains deeply unchanged.

### Normalization policy

Task 1.2 must turn the product requirements into a reviewable decision table before algorithms are written. The policy must distinguish:

1. transformations that are always safe and deterministic;
2. language-specific transformations with exact accepted forms;
3. ambiguous forms that remain unchanged; and
4. unsupported forms that are preserved rather than guessed.

The first profile must cover:

- ordinary Unicode whitespace, nonbreaking spaces, zero-width/soft formatting marks, and semantic line breaks;
- explicit soft hyphens and conservatively recognized words split at a line end, while preserving genuine compounds;
- straight and typographic quotation marks, Spanish opening marks, em/en dashes, dialogue dashes, repeated punctuation, and ellipses;
- common abbreviations, honorifics, multi-period abbreviations, and initials without false sentence boundaries;
- integers, signed values, ordinals supported by the accepted corpus, decimal and thousands separators, years, dates, clock times, percentages, and currency forms;
- a small documented symbol allowlist where context and language make expansion unambiguous;
- code spans with a conservative policy that does not apply prose-specific numeric or punctuation rewriting blindly;
- malformed/unbalanced punctuation and out-of-range numeric forms that fail safe by preservation; and
- embedded foreign names without transliteration, case rewriting, or invented pronunciation.

Normalization must be idempotent for accepted narration input: applying the same profile twice produces the same text. It must not depend on `Intl.Segmenter`, host locale, locale-sensitive default casing, nondeterministic regular-expression state, wall-clock time, or platform-specific Unicode behavior that is not pinned by tests.

### Language policy

No language detector is added. ADR-0012 approves a closed package-local caller default language input with:

- `und` for neutral behavior; and
- `es` for the first Spanish profile.

An explicit semantic language context whose primary subtag is `es` selects Spanish handling for that source span. Other or malformed tags receive neutral handling unless a later accepted profile supports them. Inline language changes must not cause adjacent source text to be reordered or combined across incompatible policies.

Language metadata is preparation context, not a new `NarrationSegmentV1` field in this milestone. If Milestone 6 proves that the TTS protocol requires per-segment language, that later milestone must make the shared-contract decision explicitly.

### Semantic segmentation and packing

Segmentation proceeds from strongest to weakest boundaries:

1. publication/spine and narratable-block boundaries;
2. headings and recognized scene breaks;
3. paragraph and dialogue-turn boundaries;
4. sentence-ending punctuation after protecting abbreviations, initials, decimals, dates, times, currency, and ellipses;
5. clause punctuation and safe whitespace;
6. token boundaries; and
7. a Unicode-code-point hard split that does not separate a surrogate pair, combining sequence, protected token, or normalization expansion unless the single token itself exceeds the hard maximum.

Prepared segments do not merge across addressable blocks. A short heading remains distinct; a scene-break-only block emits no spoken segment but advances continuation. Dialogue punctuation remains part of narration text unless the accepted normalization table changes it.

Packing must use multiple recorded dimensions rather than one arbitrary JavaScript string length:

- narration Unicode-code-point count;
- UTF-8 byte count;
- source Unicode-code-point span;
- sentence count; and
- semantic boundary strength.

Task 1.3 accepts the versioned target and hard-maximum profile in [`narration-preparation-limits-v1.md`](../../architecture/narration-preparation-limits-v1.md), backed by test-only synthetic evidence. Its primary segment targets are 320 narration code points and 1,024 UTF-8 bytes; hard maxima are 640 code points and 2,048 bytes. A batch targets eight and permits at most 16 segments, with independent 8,192-code-point and 24,576-byte hard totals. JavaScript UTF-16 `.length` is never the sole size authority. Model-specific limits remain deferred; later profiles may be versioned without changing source-range semantics.

### Bounded work, cancellation, and lifecycle

The pipeline must have explicit maxima for:

- source code points inspected per public request;
- output segments per batch;
- source/narration code points, UTF-8 bytes, and sentences per segment;
- total narration code points, UTF-8 bytes, and sentences returned per batch;
- protected-token length;
- abbreviation/number/date parser lookahead;
- nesting or recursion introduced by narration traversal;
- normalization expansion;
- work between cancellation checkpoints and deterministic yields; and
- retained source, narration, segment, and token collections, including only one lookahead segment.

Exact maxima pass and max-plus-one cases produce a fixed content-free outcome. The implementation must avoid recursive descent proportional to attacker-controlled text length, catastrophic-backtracking regular expressions, whole-publication copies, and unbounded token arrays.

Production preparation must use an injected, testable framework-independent yield scheduler at the accepted 4,096-work-unit target and before the 8,192-unit hard interval. Caller abort and publication close are checked before work, at the 512-unit cancellation target and before 1,024 units, before and after yields, and before publication of the frozen result. Cancellation returns no partial segment text. These structural intervals make no wall-clock or hardware claim.

The narration operation must not reuse the raster read slot or read archive entries. It may read only immutable in-memory semantics and locator indexes already owned by the opened publication.

### Privacy and security

- Book text and narration text stay in memory on the local device.
- No network, filesystem, clipboard, browser-storage, process, Tauri, DOM, or audio capability is added.
- No source or narration text appears in logs, errors, metrics, test names, snapshots, fixture filenames, or persisted values.
- Repository fixtures are short, synthetic, and explicitly labeled. No copyrighted book is committed.
- Counts and timings are content-free but still must not be combined with titles, paths, quotations, or book identity in telemetry. This milestone adds no telemetry.
- Normalization runs only over already-sanitized semantics; it does not reopen publisher markup or URLs.
- Error unions are closed and fixed. Raw exceptions, regular-expression input, parser values, and dependency messages do not cross the public boundary.

### Dependency policy

ADR-0012 approves no production dependency. The semantic model, shared contracts, Unicode-aware JavaScript primitives, and repository-owned deterministic scanners are sufficient for the first bounded profile.

Before adding a dependency, an amendment or superseding ADR must document:

- the exact behavior that repository code cannot safely provide;
- deterministic Node/WebView behavior and release pinning;
- package size, license, transitive graph, install scripts, runtime capabilities, and maintenance;
- Spanish coverage and source-map support;
- alternatives considered; and
- updates to `docs/development/dependencies.md`, manifests, and lockfiles.

`Intl.Segmenter` must not be used as the production segmentation authority because output can vary by runtime data and it does not preserve the required source-transform map. ADR-0012 permits it only in a non-authoritative test-only investigation that cannot change production output.

### Documentation status

Creating this ExecPlan changes no implemented architecture status. The system diagram's narration node remains planned until production code, tests, documentation, and final validation pass. The roadmap must not mark Milestone 5 complete before Task 6.2 records successful evidence and this plan moves to `docs/plans/completed/`.

## Milestones

Implementation tasks are ordered. A task may refine a later task, but production normalization must not start before the relevant Task 1 decision and fixture gates are complete.

## Milestone 1: Close narration policy, corpus, and bound decisions

### Task 1.1: Accept the narration-preparation architecture

**Specific outcome:** An accepted ADR fixes package ownership, the public operation/result boundary, prepared-segment type, half-open range semantics, publication lifecycle, language input, dependency policy, and the separation from session-bound `NarrationSegmentV1`.

**Work:**

- Add the next numbered ADR and index it.
- Confirm that `@voxleaf/epub` owns preparation over immutable semantics and locator indexes.
- Define the public request, success, completion, cancellation, invalid-start, limit, and internal-failure outcomes.
- Define one-active-operation, close cancellation, no-partial-result, and continuation behavior.
- Record the containing-segment behavior for a request that starts inside an existing segment without deciding Milestone 9 playback policy.
- Confirm no shared schema change, desktop integration, dependency, or new capability.

**Validation:**

- Review the ADR against ADR-0003, ADR-0006, ADR-0007, ADR-0008, this plan, and the roadmap.
- Run `pnpm.cmd format:check`.
- Run `git diff --check`.

**Status:** Complete. ADR-0012 accepts the package ownership, public request/result and prepared-segment types, half-open ranges, containing-segment relation, `und`/`es` language input, one-active-operation and close behavior, dependency policy, and separation from `NarrationSegmentV1`. The architecture, diagram, roadmap, dependency, testing, and plan documentation is reconciled. `pnpm.cmd format:check` and `git diff --check` passed.

### Task 1.2: Establish the deterministic normalization and Spanish corpus

**Specific outcome:** A repository-authored table of source semantics, effective language, expected narration text, expected preserved ambiguity, and expected boundary protections exists before production rules.

**Work:**

- Add focused synthetic cases for all normalization categories listed in this plan.
- Cover neutral and Spanish behavior, explicit semantic language overrides, mixed-language spans, astral code points, combining marks, malformed punctuation, and code spans.
- Include positive and negative line-end-hyphenation cases.
- Include accepted and ambiguous Spanish abbreviations, decimals, thousands separators, dates, years, times, currency, percentages, and symbols.
- Mark all text fixtures synthetic and sensitive.
- Prohibit snapshots that could copy fixture prose into failure output.

**Validation:**

- Focused fixture tests prove case uniqueness, source immutability, and absence of sensitive failure messages.
- `pnpm.cmd --filter @voxleaf/epub test`.
- `pnpm.cmd --filter @voxleaf/epub typecheck`.

**Status:** Complete. The frozen test-only corpus contains 62 synthetic-sensitive cases across every required category. Each case records source block/units, caller default and effective span language, exact narration text, transform/preserve/remove action, ambiguity policy, and protected boundaries. Content-free integrity tests prove category and edge coverage, unique identities/source signatures, deep source immutability, and redacted closed validation failures. No production normalizer, dependency, schema, capability, or TTS behavior was added.

### Task 1.3: Accept chunk sizing and preparation resource limits

**Specific outcome:** The first versioned narration profile has documented target and hard bounds supported by structural reasoning and deterministic synthetic measurements.

**Work:**

- Define target and hard limits for every dimension in the bounded-work section.
- Compare representative headings, short/long paragraphs, dialogue, punctuation-heavy Spanish, one unusually long sentence, one oversized token, and exact/max-plus-one batches.
- Record segment counts, source/narration code points, UTF-8 bytes, sentence counts, work checkpoints, and retained batch size without recording text.
- Keep hardware wall-clock observations informational; do not turn noisy timing into a deterministic unit-test gate.
- Document that Milestone 6 may add model-specific profiles only through explicit evidence and versioning.

**Validation:**

- Exact limits pass; max-plus-one values produce fixed content-free results.
- Repeated runs produce byte-identical narration text and locator ranges.
- Tests prove no single JavaScript UTF-16 length controls admission.
- `pnpm.cmd --filter @voxleaf/epub test`.

**Status:** Complete. The frozen test-only `narration-v1` profile accepts 20 independent target/hard dimensions for source inspection, segment and batch code points/UTF-8 bytes/sentences, protected tokens, parser lookahead, traversal depth, normalization expansion, cancellation checkpoints, deterministic yields, and retained intermediate collections. Content-free evidence covers every required representative shape plus Unicode byte pressure. Focused tests prove profile consistency and deep immutability, exact-target/exact-hard acceptance, fixed max-plus-one rejection for every dimension, internally verified deterministic narration bytes/source ranges, malformed-measurement non-coercion, and separation from UTF-16 length. No production preparation module, public operation, dependency, schema, capability, TTS, audio, UI, persistence, or telemetry was added.

## Milestone 2: Build locator-aware narration source projection

### Task 2.1: Traverse narratable semantic structure exhaustively

**Specific outcome:** A pure package-internal source projector walks every current semantic block and inline variant in locator order and emits immutable narratable leaf units plus structural boundary events.

**Work:**

- Reuse `PublicationLocatedBlock` identity and text-length authority.
- Recurse through structural block quotes/lists without narrating their offset-zero containers.
- Preserve heading/paragraph, list, quote, code, internal-link, language, direction, line-break, image-placeholder, and source-order context needed by later rules.
- Skip raster alternative text and image reads.
- Add exhaustive `never` checks for both semantic unions.

**Validation:**

- Unit tests cover every block/inline member, nesting, empty/unspoken content, source order, and future-union compile failure.
- The source semantic tree remains deeply unchanged.
- Projected source code-point totals equal locator-index lengths for every narratable block.
- `pnpm.cmd --filter @voxleaf/epub test`.
- `pnpm.cmd --filter @voxleaf/epub typecheck`.

**Status:** Complete. Added a pure package-internal iterative projector over `PublicationLocatedBlock` values. It exhaustively handles all four block and seven inline variants, emits frozen heading/paragraph leaves plus quote/list/list-item boundaries in locator preorder, preserves inherited text/inline/structural context, counts Unicode code points without UTF-16 length authority, treats line breaks and raster placeholders as one source position, omits empty text units, excludes raster alternative text/resource identity from projected units, verifies every leaf total against the locator index, and fails through fixed content-free package errors on invariant drift. Five focused tests cover every union member, nesting/order, empty and unspoken leaves, Unicode/combining/astral accounting, deep immutability, compile-time union closure, raster omission, and malformed order/length. No public operation, source spans, normalization, segmentation, profile enforcement, dependency, schema, desktop behavior, TTS, audio, persistence, or capability was added.

### Task 2.2: Preserve source spans through narration tokens

**Specific outcome:** Every emitted source token carries legal start/end offsets so later normalization can expand, replace, or remove text without losing its source envelope.

**Work:**

- Implement Unicode-code-point iteration without using UTF-16 indices as locator offsets.
- Represent line breaks and raster placeholders with the one-position ADR-0007 convention.
- Keep source spans monotonic and bounded by the located block length.
- Validate endpoint construction through package/shared locator rules.
- Treat source text as sensitive and keep diagnostics content-free.

**Validation:**

- Tests cover BMP, astral, combining, line-break, raster, nested-inline, and block-end offsets.
- Source spans are ordered, nonnegative, and never exceed `textLengthCodePoints`.
- Recombining untouched source tokens reproduces the semantic source representation used by locator accounting.
- `pnpm.cmd --filter @voxleaf/epub test`.

**Status:** Complete. Added a pure package-internal source-token mapper over Task 2.1 events. It emits one frozen token for each Unicode code point and one token for each semantic line-break/raster position; retains inherited text context plus compact monotonic half-open block-local spans; validates every span endpoint through `createBlockLocatorAtOffset` and the shared `LocatorRangeV1` decoder; reconstructs public locator ranges on demand without retaining a full locator pair per token; preserves structural event order; and fails through the fixed content-free internal boundary on invariant drift. Five focused tests cover BMP, astral, combining, nested-inline, line-break, raster, empty-leaf, block-end, structural-order, source-reconstruction, immutability, compile-time union closure, invalid spans, and raster-alternative/privacy behavior. The focused EPUB suite passes 27 files/406 tests, and package typecheck/build, TypeScript lint, repository formatting, `git diff --check`, and the full portable check pass. No public operation, normalization, segmentation, dependency, schema, desktop behavior, TTS, audio, persistence, or capability was added.

### Task 2.3: Add bounded start, continuation, cancellation, and close behavior

**Specific outcome:** Source projection can begin from a canonical requested locator, stop at approved request bounds, and publish a continuation while caller abort or publication close releases all active work.

**Work:**

- Normalize the untrusted start locator through package ownership.
- Record the canonical source relation needed to find the later stable segment
  relation without text search.
- Apply finite per-request source and output bounds.
- Add deterministic cancellation checkpoints and the injected yield scheduler required by Task 1.3.
- Integrate one active preparation operation with idempotent publication close.
- Publish no partial sensitive result after failure or cancellation.

**Validation:**

- Test exact, recovered, malformed, wrong-book, block-start, mid-block, block-end, spine-end, and publication-end starts.
- Test pre-abort, mid-work abort, close during work, repeated close, stale completion, and successful retry.
- Prove no archive or raster resource read occurs.
- `pnpm.cmd --filter @voxleaf/epub test`.

**Status:** Complete. Added a package-internal asynchronous source-window coordinator and the relevant production `narration-v1` policy subset. It structurally resolves untrusted exact/recovered starts, lazily emits frozen partial-leaf token windows from canonical Unicode-code-point offsets, retains at most 4,096 source tokens/events, publishes the final token end as a canonical continuation, and returns only frozen content-free failures after cancellation, invalid start, concurrency, limit, or internal failure. Work accounting separately charges source/scanner/structural observations and retained appends, checks linked cancellation at the 512-unit target, yields through an injected scheduler at the 4,096-unit target, and enforces exact/max-plus-one source and traversal-depth limits. `OpenedPublication` owns one internal narration operation independently of one raster read; close aborts and awaits both before releasing the archive, rejects stale completion, remains idempotent, and allows retry after caller cancellation. Focused tests cover exact/recovered/malformed/wrong-book, block/mid/end/spine/publication starts, inherited context, astral offsets, continuation without repetition, pre/mid-work abort, exact/max-plus-one source/depth/retention, operation-active, raster overlap, retry, close/stale completion, immutability, and privacy. `pnpm.cmd --filter @voxleaf/epub test` passes 28 files/416 tests; package typecheck/build, TypeScript lint, repository formatting, `git diff --check`, and `pnpm.cmd check:portable` pass. No public `prepareNarration`, normalization, segmentation, prepared segment/range, dependency, schema, desktop, TTS, audio, persistence, or capability was added.

## Milestone 3: Normalize narration text deterministically

### Task 3.1: Normalize whitespace, line breaks, and hyphenation

**Specific outcome:** Narration whitespace is stable and speech-oriented while genuine word boundaries, code spans, paragraphs, and compounds retain their accepted meaning.

**Work:**

- Normalize ordinary and nonbreaking whitespace according to the Task 1.2 table.
- Handle semantic line breaks separately from paragraph boundaries.
- Remove explicit soft hyphens where approved.
- Join only accepted line-end hyphenation patterns and preserve negative corpus cases.
- Retain origin spans for collapsed, removed, and joined source tokens.

**Validation:**

- Table-driven exact-output tests pass for neutral and Spanish cases.
- Normalization is idempotent.
- Source ranges remain legal after expansions/deletions.
- No source semantic value changes.

**Status:** Complete. Added a pure package-internal normalizer over block-local source tokens plus the closed Task 3.1 Spanish line-end allowlist. It deterministically collapses explicit Unicode whitespace, trims prose edges, removes only the accepted zero-width marks and soft hyphen, treats semantic line breaks as source-mapped speech boundaries, joins only the accepted Spanish split, preserves genuine compounds and neutral ambiguity, and leaves code spacing exact. Every source token becomes either a frozen nonempty normalized text unit or a frozen typed omission with its original legal span and effective `und`/`es` context; an entirely unspoken block has an empty package-local sensitive stream with omission units rather than misusing the nonempty shared narration-segment text type. Table-driven tests cover all Task 3.1 corpus cases, repeated and second-pass output, exact source-span legality, semantic line-break/block separation, effective-language selection, code, astral/combining preservation, empty unspoken output, exact/max-plus-one retained-token admission, source immutability, deep output immutability, union closure, and content-free invariant failures. `pnpm.cmd --filter @voxleaf/epub test` passes 29 files/436 tests; package typecheck/build, TypeScript lint, repository formatting, `git diff --check`, and `pnpm.cmd check:portable` pass.

### Task 3.2: Normalize punctuation, quotations, ellipses, and symbols

**Specific outcome:** Punctuation variants receive deterministic treatment without losing Spanish opening marks, dialogue meaning, abbreviation protection, or unrecognized symbols.

**Work:**

- Implement only the accepted canonicalization/expansion table.
- Preserve source ordering and mapped spans through replacements.
- Protect ellipses, repeated punctuation, dialogue dashes, and paired/unpaired quotation cases for the segmenter.
- Expand only allowlisted context-safe symbols; preserve unknown or ambiguous forms.

**Validation:**

- Exact-output, preservation, idempotence, and source-map tests pass.
- Adversarial repeated punctuation cannot cause superlinear work.
- Errors and measurements contain no fixture text.

**Status:** Complete. The production normalizer now preserves accepted punctuation and quotation text while assigning frozen roles and content-free protections for ellipses, terminal punctuation, dialogue dashes, paired/unpaired quotation handling, malformed openings, code spans, and symbol tokens. A single bounded scanner visits source tokens in order, groups only fixed punctuation forms, and retains one output or omission unit per original source span. The closed Spanish allowlist expands only a whitespace-delimited ampersand and the exact accepted Celsius form under effective `es`; neutral, explicit non-Spanish, compact ampersand, slash, at-sign, unsupported temperature, and code forms remain unchanged. The accepted hard maximum of 16 output code points per source code point is enforced in production. Focused exact-output, idempotence, source-map, immutability, protection, negative-form, exact retained-token, maximum repeated-punctuation/unbalanced-quote, expansion-ceiling, and content-free failure tests pass. `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (29 files/455 tests), `pnpm.cmd lint:typescript`, `pnpm.cmd check:portable`, and `git diff --check` pass.

### Task 3.3: Normalize supported Spanish abbreviations and numeric forms

**Specific outcome:** Accepted Spanish abbreviations, numbers, dates, years, times, percentages, currencies, and decimal/thousands forms produce deterministic narration text and boundary metadata; ambiguous input remains unchanged.

**Work:**

- Implement bounded recognizers instead of one backtracking expression.
- Apply the accepted Spanish decimal/thousands and date/time conventions.
- Keep abbreviation periods and initials protected from false sentence termination.
- Bound numeric magnitude, token length, parser lookahead, and expansion size.
- Preserve embedded foreign names and unsupported numeric forms.

**Validation:**

- Positive, negative, edge, exact-limit, and max-plus-one corpus cases pass.
- Neutral handling does not accidentally apply Spanish lexical expansion.
- Repeated runs and supported Node platforms produce identical results.
- No floating-point conversion changes decimal spelling or loses leading zeros.

**Status:** Complete. The production normalizer now uses closed, longest-first Spanish lexical tables and bounded source-order recognizers for the accepted honorific, common and multi-period abbreviations, initials, cardinals, signed values, ordinals, decimals, thousands, year, slash/ISO date, 24-hour time, euro, explicit US-dollar, and percentage forms. Expansions are distributed across the original one-code-point source units, with typed omissions for unused origins, so every source span remains legal and every emitted unit stays under the 16-code-point expansion ceiling. Frozen roles and protections prevent later sentence segmentation from splitting abbreviation periods, initials, decimals, thousands, dates, times, currencies, percentages, or explicit language spans. Neutral, malformed, ambiguous, unsupported, out-of-allowlist, code, and foreign-name forms remain unchanged. A numeric scanner visits contiguous candidate runs with constant retained state, admits exactly 128 code points, and returns the fixed content-free resource-limit failure at 129; no floating-point conversion, locale API, regex backtracking, dependency, public contract, persistence, or external capability is used. Corpus-driven positive/negative/preservation, deterministic/text-idempotent, role/protection, source-map, deep-freeze, exact/max-plus-one lookahead, unsupported-magnitude, code, leading-zero, and expansion-ceiling tests pass. `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (29 files/497 tests), `pnpm.cmd lint:typescript`, `pnpm.cmd check:portable`, and `git diff --check` pass.

### Task 3.4: Complete normalization invariants and privacy tests

**Specific outcome:** The complete normalizer is deterministic, idempotent, source-mapped, bounded, immutable, and content-private.

**Work:**

- Compose neutral, language-specific, code-span, and mixed-language stages.
- Assert nonempty output-token invariants and bounded expansion ratios.
- Add canary-sensitive errors and inspect all public failure values.
- Add randomized synthetic combinations using a fixed seed only if they improve coverage without adding a dependency.

**Validation:**

- Normalized output and span maps are identical over repeated runs.
- `normalize(normalize(input))` is stable for accepted narration input.
- No exception, result metadata, or test diagnostic deliberately serializes source/narration text.
- `pnpm.cmd --filter @voxleaf/epub test`.
- `pnpm.cmd --filter @voxleaf/epub typecheck`.

**Status:** Complete. Added the composed normalization postcondition and a focused invariant/privacy gate. Mixed neutral, Spanish, code, symbol, line-break, punctuation, and numeric cases now prove repeated-run equality, second-pass text stability, exact source-unit coverage, legal source spans, nonempty bounded text units, deep immutability, displayed-source preservation, and fixed content-free internal/resource-limit failures under a canary-sensitive input. `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (29 files/502 tests), and `git diff --check` pass; portable validation remains the milestone check. No public operation, segmentation, shared schema, dependency, desktop, TTS, audio, persistence, network, or capability behavior was added.

## Milestone 4: Segment, pack, and map narration

### Task 4.1: Implement deterministic sentence and dialogue boundaries

**Specific outcome:** A scanner identifies sentence, dialogue-turn, clause, and protected-token boundaries across the accepted corpus without runtime-locale dependence.

**Work:**

- Consume normalized source-mapped tokens rather than reparsing an untracked string.
- Protect abbreviations, initials, decimals, dates, times, currencies, ellipses, and Spanish opening punctuation.
- Preserve heading, paragraph, dialogue, and scene-break metadata from source projection.
- Handle malformed/unbalanced punctuation through deterministic fallback.

**Validation:**

- Corpus boundary expectations pass.
- Each token is visited a bounded number of times.
- Boundary output remains deterministic across batching and repeated runs.
- `pnpm.cmd --filter @voxleaf/epub test`.

**Status:** Complete. Added the package-internal two-pass
`narration-boundary-scanner.ts` over normalized source-mapped units. It emits
immutable source-offset sentence, dialogue-turn, and clause split points plus
non-splittable protected-token spans; collapses repeated terminal marks;
carries sentence endings through closing punctuation; closes unterminated
spoken text at the block boundary; preserves heading/paragraph, quote/list,
language, and dialogue metadata; and never calls `Intl.Segmenter` or reparses
an untracked string. Each admitted unit is visited exactly twice, and the
accepted 256-narration-code-point protected-token hard maximum is now enforced
in production. The complete 62-case normalization corpus plus focused Spanish
punctuation, closing quotation, dialogue, clause, malformed-input,
language/line-break, structural metadata, exact/max-plus-one, immutability, and
privacy tests pass. The current semantic source projection exposes no
scene-break union to preserve, so this task does not invent an ingestion or
public semantic contract; Task 4.2 retains the planned recognized-scene-break
packing behavior. `pnpm.cmd --filter @voxleaf/epub typecheck`,
`pnpm.cmd --filter @voxleaf/epub test` (30 files/516 tests), and the complete
`pnpm.cmd check:portable` repository gate pass. No public operation, prepared
segment/range, dependency, shared schema, desktop, TTS, audio, persistence,
network, or capability behavior was added.

### Task 4.2: Pack semantic units using the accepted profile

**Specific outcome:** The packer prefers natural semantic boundaries while satisfying every target/hard size dimension and never joining separate addressable blocks.

**Work:**

- Keep headings separate and consume scene-break-only blocks without speech.
- Prefer full sentences and dialogue turns within target limits.
- Use clause, whitespace, token, then hard boundaries only as needed.
- Record content-free measurements and the boundary reason.
- Make segment output independent of requested batch size.

**Validation:**

- Short, target, long, and mixed semantic cases pass.
- Every segment satisfies narration-code-point, UTF-8-byte, source-span, and sentence-count hard bounds.
- Changing batch size changes only grouping into returned batches, not segment text/ranges.
- `pnpm.cmd --filter @voxleaf/epub test`.

**Status:** Complete. Added the package-internal
`narration-segment-packer.ts`, which consumes one Task 4.1 block scan and
produces immutable nonempty source-offset segments without accepting a batch
size or joining addressable blocks. It keeps short headings/paragraphs whole,
prefers dialogue and complete-sentence boundaries, falls back through clause,
whitespace/token, and Unicode-safe hard boundaries, never splits protected
tokens or the accepted combining-mark ranges, and independently enforces the
384/768 source-code-point, 320/640 narration-code-point, 1,024/2,048 UTF-8-byte,
and 3/8-sentence target/hard dimensions. Output retention stops at the accepted
17-entry ceiling (16 returnable plus one lookahead) and records a content-free
completion state. A closed top-level paragraph rule recognizes only `***`
(with optional normalized spacing) and `⁂` as scene breaks; list/quote and
raster-bearing blocks remain ordinary content. Fourteen focused tests cover
short/target/long/mixed input, headings, scene breaks, sentence/clause/token/
hard priority, exact hard dimensions, multibyte Unicode, combining sequences,
protected tokens, retention, batch-slicing independence, the complete
normalization corpus, empty/unspoken blocks, immutability, union closure, and
content-free failures. Locator-range construction, unusually oversized
single-token policy hardening, public batching, and `prepareNarration` remain
Tasks 4.3-5.1. `pnpm.cmd --filter @voxleaf/epub typecheck`,
`pnpm.cmd --filter @voxleaf/epub test` (31 files/530 tests), and the complete
`pnpm.cmd check:portable` repository gate pass.

### Task 4.3: Handle unusually long sentences and tokens safely

**Specific outcome:** Punctuation-free or oversized input always makes bounded forward progress and returns legal mapped segments or a fixed limit outcome.

**Work:**

- Implement clause/whitespace/token fallbacks in documented order.
- Avoid splitting protected expansions and combining sequences when a legal earlier boundary exists.
- Define the fixed behavior for one token larger than the segment maximum.
- Bound temporary arrays and avoid quadratic substring/copy behavior.

**Validation:**

- Exact/max-plus-one sentence, token, expansion, and batch fixtures pass.
- No empty segment, infinite loop, duplicate range, reversed range, or unbounded retained array occurs.
- Cancellation remains observable during worst-case synthetic work.

**Status:** Complete. The package-internal packer is now cooperatively
asynchronous and shares Task 2.3's deterministic work controller, cancellation
checkpoints, injected-yield cadence, and final pre-publication cancellation
gate. It validates the accepted 4,096 normalized-unit/boundary/protected-token
temporary ceilings before indexing, enforces the 8,832-code-point and
26,624-byte retained narration ceilings while scanning, and retains only
bounded prefix, safety, text-part, and segment arrays. One unprotected token at
the exact 640-code-point maximum remains intact; max-plus-one splits at the
latest legal source-mapped Unicode-safe hard boundary. A protected token still
fails at 257 code points in Task 4.1, while one combining sequence or
source-mapped expansion that cannot fit without an illegal interior split
returns the fixed content-free resource-limit outcome with no partial block.
Five focused tests add exact/max-plus-one unprotected tokens, indivisible
combining sequences, retained code-point/UTF-8-byte/unit limits, monotonic
non-overlapping ranges, cancellation during worst-case 4,096-unit packing, and
successful retry. The complete EPUB suite passes 31 files/535 tests, and
package typecheck and the complete `pnpm.cmd check:portable` repository gate
pass. Canonical locator ranges, public batch totals, and `prepareNarration`
remain Tasks 4.4-5.1.

### Task 4.4: Emit canonical locator-linked prepared segments

**Specific outcome:** Each prepared segment has sensitive text, a legal half-open source range, deterministic order, boundary metadata, and size measurements compatible with later `NarrationSegmentV1` wrapping.

**Work:**

- Construct/freeze output only after the complete batch succeeds.
- Validate range order and endpoints through the canonical shared/package boundary.
- Return a canonical continuation locator and completion state.
- Add test-only wrapping with synthetic session/generation/segment identities and `decodeNarrationSegmentV1`.

**Validation:**

- Every prepared range resolves exactly at both endpoints.
- Ranges are monotonic, non-overlapping, block-local, and stable over repeated requests.
- Wrapped synthetic `NarrationSegmentV1` values pass the existing decoder without schema changes.
- No work identity is generated by production `@voxleaf/epub`.

**Status:** Complete. Added the package-internal
`narration-prepared-segment.ts` finalization stage over the existing
source-token, normalization, boundary-scan, and packing pipeline. It validates
the complete packed block before publishing deeply frozen nonempty
`SensitiveNarrationTextV1`, canonical half-open `LocatorRangeV1` values, the
closed boundary reason, content-free measurements, completion, and one exact
source continuation. Every range is constructed through package locator
ownership and the shared decoder; monotonic/non-overlapping/block-local spans,
aggregate measurements, disposition, consumed-source totals, and continuation
are revalidated without widening the accepted 17-entry retention bound. Six
focused tests prove exact endpoint/continuation resolution, repeat stability,
partial and scene-break completion, deep immutability, the closed reason union,
content-free no-partial-result failure, and successful
`decodeNarrationSegmentV1` wrapping with test-only identities. Production
output contains no segment/session/generation identity, and no shared schema,
public export, dependency, desktop, TTS, audio, persistence, network, or
capability behavior changes. `pnpm.cmd --filter @voxleaf/epub typecheck`,
`pnpm.cmd --filter @voxleaf/epub test` (32 files/541 tests), and
`pnpm.cmd check:portable` pass. Public batching and `prepareNarration` remain
Task 5.1.

## Milestone 5: Integrate the public package boundary and prove bounds

### Task 5.1: Expose narration preparation through `OpenedPublication`

**Specific outcome:** Consumers can request one bounded batch from an open publication through the accepted public API and receive only frozen closed outcomes.

**Work:**

- Add public types and the accepted operation to the package interface/export surface.
- Integrate immutable documents, locator index, policy, cancellation, and close ownership.
- Map expected and unexpected failures to fixed content-free outcomes.
- Keep `openEpubPublication` as the only root-level runtime opener; narration remains an operation on its returned handle unless the ADR approves otherwise.

**Validation:**

- Public type/build tests pass.
- Open, prepare, continue, complete, abort, retry, close, and post-close behavior pass.
- Existing ingestion, locator, resource-read, and close behavior remains unchanged.
- `pnpm.cmd --filter @voxleaf/epub typecheck`.
- `pnpm.cmd --filter @voxleaf/epub test`.
- `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. Task 5.1 adds package-local public request, prepared-segment, batch, and closed-result types; exports them while keeping `openEpubPublication` as the only root-level runtime opener; and adds `OpenedPublication.prepareNarration`. The coordinator validates the closed profile, structurally resolves starts, reconstructs stable segmentation across bounded source windows, returns the full containing segment for an interior start, publishes continuation at the final returned segment end, enforces the independent public batch ceilings with at most one lookahead segment, and maps expected or unexpected failures to frozen content-free outcomes. The opened-publication owner preserves one active narration operation independently of one raster read and makes caller abort, close, stale completion, retry, and post-close behavior deterministic. Public type/export, package-opener smoke, batch/continue/complete/interior-start, invalid input, cancellation, concurrency, raster-overlap, close, privacy, and deep-freeze tests pass. No dependency, shared schema, desktop, TTS, audio, persistence, network, or capability behavior changed.

### Task 5.2: Prove the synthetic EPUB-to-segment integration matrix

**Specific outcome:** Repository-authored EPUB bytes flow through the public opener into deterministic locator-linked narration segments for representative neutral and Spanish structures.

**Work:**

- Extend EPUB test support with short, provenance-labeled narration fixtures.
- Cover headings, nested quotes/lists, dialogue, scene breaks, inline emphasis/links/code, line breaks, images, Spanish punctuation/numbers/dates/currency, embedded foreign names, and long sentences.
- Cover exact and recovered starts, continuation across blocks, end-of-spine behavior, and no image narration.
- Keep fixture prose short and synthetic.

**Validation:**

- Tests use only `openEpubPublication` and the accepted public handle API.
- Display semantics before and after preparation are deeply equal.
- Segment text/ranges are deterministic and contract-compatible.
- Network, filesystem, DOM, storage, image-read, process, TTS, and audio spies remain untouched where applicable.
- `pnpm.cmd --filter @voxleaf/epub test`.

**Status:** Complete. Added a dedicated provenance-labeled three-spine EPUB fixture containing only short repository-authored synthetic neutral/Spanish text plus one bounded long sentence. The fixture covers headings, nested quotation/list structure, dialogue, scene-break-only content, emphasis/strong/internal-link/code inlines, semantic line breaks, raster placeholders, Spanish punctuation, honorific, date, time, euro, percentage and ampersand forms, an explicit foreign-language name, an image-only block, and final-spine completion. A public-root integration matrix uses only `openEpubPublication` and `OpenedPublication` operations; compares complete text, ranges, reasons, and measurements across one- and four-segment batching; resolves every range endpoint exactly; wraps every prepared segment through the unchanged `NarrationSegmentV1` decoder with test-only identities; proves exact and recovered starts, scene/image gaps, continuation, spine transition, publication end, deep source equality, and long-sentence splitting; and observes no image read or network, worker, WebSocket, file-picker, DOM, storage, TTS, or audio capability call. Assertions compare sensitive aggregate values through content-free booleans rather than broad snapshots. `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (33 files/550 tests), `pnpm.cmd --filter @voxleaf/epub build`, and `pnpm.cmd check:portable` pass. No production code, dependency, shared schema, desktop behavior, TTS, audio, persistence, network, or capability changed.

### Task 5.3: Prove deterministic performance and resource bounds

**Specific outcome:** Worst-case synthetic preparation has explicit count/byte/work limits, bounded intermediate state, prompt cancellation checkpoints, and no hardware claim.

**Work:**

- Exercise exact profile maxima and max-plus-one rejection.
- Record deterministic operation/checkpoint and output measurements.
- Inspect retained structures so only one bounded request and result remain live.
- Exercise repeated batches through a large admitted semantic document without whole-publication output retention.
- Separate optional wall-clock observations from correctness gates.

**Validation:**

- Deterministic resource assertions pass without model weights, GPU, audio, or real books.
- Cancellation and close stop before a stale batch is published.
- Measurements include counts/bytes only, never text.
- `pnpm.cmd --filter @voxleaf/epub test`.
- `pnpm.cmd check:portable`.

**Status:** Complete. The public coordinator now stops at the first stable segment that would exceed the caller count or any independent batch code-point, UTF-8-byte, or sentence total, retains that segment as its sole lookahead, and passes the packer only the remaining 17-entry/8,832-code-point/26,624-byte aggregate capacity. A package-internal numeric-only observer exposes high-water counts for one active request/result, source events/tokens, prepared segments, code points, and bytes without exposing text. Five deterministic tests align every production hard ceiling with the accepted profile; prove exact 512-unit checkpoint and 4,096-unit yield cadence through 8,192 work observations; admit exact 8,192-code-point and 24,576-byte batches plus one hard-sized lookahead; consume 96 synthetic 400-code-point paragraphs in 12 eight-segment requests without retaining whole-publication output; and prove caller cancellation/retry plus publication close publish no stale result. Existing focused suites retain exact/max-plus-one coverage for source, normalization, scanning, segment, and retained limits. Package typecheck and all 34 EPUB test files/555 tests pass; portable validation is recorded in the progress log.

## Milestone 6: Document and close Milestone 5

### Task 6.1: Document the implemented narration boundary

**Specific outcome:** Product, architecture, dependency, testing, roadmap, and plan documentation describe exactly what normalization/segmentation now does and what remains deferred.

**Work:**

- Mark narration preparation implemented in `system-diagram.md` only after production validation.
- Update `overview.md` with ownership, flow, ranges, language policy, bounds, lifecycle, and separation from TTS.
- Update `dependencies.md`; explicitly record no new dependency if that remains true.
- Update `testing.md` with the deterministic corpus and commands.
- Update product status without claiming audible narration.
- Record accepted limits, known ambiguities, and unsupported forms.
- Review whether `performance-budget.md` needs algorithmic preparation limits while keeping model/hardware targets deferred.

**Validation:**

- Documentation links resolve.
- Status language distinguishes prepared text from synthesized or played narration.
- `pnpm.cmd format:check`.
- `git diff --check`.

**Status:** Not started.

### Task 6.2: Complete focused, root, CI, privacy, and scope validation

**Specific outcome:** All Milestone 5 acceptance criteria pass on the final tree, CI is green, the diff remains in scope, and the completed plan contains exact evidence.

**Work:**

- Run focused EPUB tests, type checking, and build.
- Run shared tests/generation checks if shared code or schemas changed; otherwise record that they did not.
- Run portable and authoritative root checks.
- Review PR CI on the exact head.
- Audit the complete diff for sensitive content, binary/book/audio/model artifacts, logs, new capabilities, dependencies, schema drift, and later-milestone implementation.
- Record exact commands, counts, durations where useful, commit/CI evidence, and limitations.
- Update the roadmap to complete and move this plan to `docs/plans/completed/` only after all gates pass.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared generate:check
pnpm.cmd check:portable
pnpm.cmd check
git diff --check
git status --short
```

The shared commands are mandatory if shared implementation/schema/generated files change and are retained as regression checks for final closeout even when no shared change is expected. Browser/native reader interaction tests are not a Milestone 5-specific gate when the desktop remains untouched; the established pull-request workflow still runs its complete Windows browser/native foundation matrix.

**Status:** Not started.

## Testing and benchmark strategy

### Deterministic unit tests

Use table-driven tests for:

- semantic traversal and code-point source spans;
- neutral and Spanish normalization;
- protected abbreviations, initials, decimals, dates, times, currency, ellipses, dialogue, and scene breaks;
- ambiguous-preservation behavior;
- idempotence and source immutability;
- sentence/clause/token boundary priority;
- half-open locator range construction;
- exact/max-plus-one policy limits;
- bounded lookahead and forward progress;
- cancellation and no-partial-result behavior; and
- sensitive-text exclusion from errors and metadata.

Tests should assert small explicit expected strings where the text itself is the behavior under test. Do not use broad snapshots, print whole fixtures on failure deliberately, or reuse copyrighted prose.

### Invariant tests

For every successful batch:

- segment narration text is nonempty;
- output values and nested collections are frozen;
- source and narration code-point/UTF-8 measurements are exact;
- each range decodes and its endpoints resolve exactly;
- ranges are source-ordered, non-overlapping, and block-local;
- each segment satisfies all hard bounds;
- batch continuation advances or completion is true;
- repeated preparation yields identical text/ranges;
- source semantics remain unchanged; and
- batch size changes do not alter stable segment content.

### Public-package integration tests

Open synthetic EPUB bytes through `openEpubPublication`, call only the public opened handle, and verify:

- full semantic-to-narration behavior;
- exact/recovered start handling;
- continuation and spine completion;
- close/cancellation ownership;
- existing lazy raster behavior remains untouched;
- prepared ranges wrap successfully into synthetic `NarrationSegmentV1`; and
- no external capability is used.

### Performance and resource evidence

Milestone 5 uses deterministic structural measurements as acceptance gates:

- input/output code points and UTF-8 bytes;
- segment and sentence counts;
- protected-token/parser lookahead;
- work/checkpoint counts;
- bounded batch/intermediate collection sizes; and
- cancellation checkpoint distance.

Optional wall-clock observations may catch obvious regressions on a documented host but are not portable correctness gates. Milestone 6 owns real TTS latency, real-time factor, memory, and hardware benchmarks. Milestone 5 must not infer speech quality or model throughput from text-processing measurements.

### Privacy validation

Inspect result/error types and tests so:

- only the explicit sensitive `text` field contains narration;
- metrics and errors contain counts/codes, not source or narration strings;
- no persistence or log call receives a sensitive value;
- no fixture adds a book, audio, model, private path, or secret; and
- no network, filesystem, process, DOM, storage, Tauri, or audio API appears in production narration modules.

### Final validation levels

1. Focused narration module tests during each task.
2. Complete `@voxleaf/epub` test, typecheck, and build after public integration.
3. Shared contract regression/generation validation.
4. Portable root check.
5. Native Windows authoritative root check.
6. Existing PR CI on the exact final head.
7. Manual diff, privacy, dependency, artifact, and scope review.

## Risks and rollback

### Over-normalization changes meaning

**Risk:** Expanding ambiguous punctuation, numbers, dates, abbreviations, or symbols can change the author's meaning or pronunciation.

**Mitigation:** Accept a table before code, use conservative recognizers, preserve ambiguous forms, bound expansions, and test negative examples beside every positive family.

### Locator mapping drifts after transformation

**Risk:** Collapsing, deleting, joining, or expanding text can produce incorrect highlighting/seeking ranges.

**Mitigation:** Carry source spans through tokens, use half-open code-point ranges, keep segments block-local, validate endpoints through package ownership, and assert mapping invariants for every fixture.

### Segmentation depends on request batching

**Risk:** Different queue sizes could produce different chunks and unstable seeking.

**Mitigation:** Segment complete bounded leaf units deterministically before slicing stable segments into returned batches. Batch size may affect only how many stable segments are returned.

### Long or adversarial text blocks the application

**Risk:** Large punctuation-free text, huge numeric tokens, or catastrophic regular expressions can consume unbounded CPU/memory.

**Mitigation:** Use bounded scanners, finite lookahead, explicit source/output maxima, deterministic checkpoints/yields, max-plus-one tests, and no whole-publication preparation.

### Unicode handling corrupts offsets

**Risk:** UTF-16 indices, combining marks, or replacement expansions can split text differently from locator code-point accounting.

**Mitigation:** Iterate by Unicode code point, test astral/combining cases, retain origin spans, and never use JavaScript `.length` as locator or sole admission authority.

### Spanish rules become an implicit language detector

**Risk:** Heuristics may apply Spanish expansions to another language or rewrite foreign names.

**Mitigation:** Use only caller/default and explicit semantic language context, define neutral fallback, perform no statistical detection, and preserve unsupported/mixed forms.

### Shared contract scope expands prematurely

**Risk:** Preparation concerns could leak profile, language, or model details into `NarrationSegmentV1`.

**Mitigation:** Keep prepared-segment policy package-local and attach work identity later. Amend/version shared contracts only after a documented proven need.

### Sensitive text leaks through diagnostics

**Risk:** A parser or test failure could include source/narration text.

**Mitigation:** Closed errors, canary privacy tests, no logging, no snapshots of production values, content-free measurements, and final diff/privacy audit.

### Publication close leaves stale work

**Risk:** Preparation may complete after replacement and retain sensitive text.

**Mitigation:** Link caller and publication abort, await the active operation during close, check cancellation before publication, clear retained references, and test stale completion.

### Scope expands into TTS or UI integration

**Risk:** Model, playback, highlighting, or reader changes could enter Milestone 5 before their architecture is ready.

**Mitigation:** Limit production changes to `@voxleaf/epub` and documentation unless an explicit plan amendment is approved. Treat session IDs, TTS, audio, and synchronization as later milestones.

### Rollback

The implementation should remain removable as one package-local narration module plus one public opened-handle operation. If the accepted policy proves unsuitable before later milestones consume it:

- remove the preparation operation and package-local types/modules;
- restore the previous opened-publication lifecycle;
- remove narration fixtures and implementation-status documentation;
- retain the unchanged semantic model, locators, reader, persistence, and shared v1 schemas; and
- record why the profile was rejected before selecting a replacement.

No migration or user-data rollback should be required because Milestone 5 persists no narration state.

## Progress log

- 2026-07-24: Created the Milestone 5 ExecPlan from roadmap, product, architecture, completed Milestones 2-4, current EPUB/shared contracts, locator accounting, opened-publication lifecycle, tests, and repository commands. No implementation, dependency, schema, capability, TTS, audio, UI, or persistence behavior was added.
- 2026-07-24: Reconciled project status, product terminology, architecture overview, canonical component/data-flow diagrams, dependency guidance, and testing guidance for the start of Milestone 5. The documentation labels narration preparation approved planned and all later TTS/audio/synchronization work deferred; no production or test implementation began.
- 2026-07-24: Completed Task 1.1. Accepted ADR-0012 for package-owned `OpenedPublication.prepareNarration`, the package-local `narration-v1` request/prepared-segment/closed-result boundary, half-open stable ranges, full containing-segment disclosure, structural continuation, `und`/`es` language input, one active preparation independent of one raster read, close/cancellation/no-partial-result behavior, and no new dependency, capability, or shared schema. Reconciled architecture, system diagram, roadmap, dependency, testing, and this plan. `pnpm.cmd format:check` and `git diff --check` passed; no production or test implementation began.
- 2026-07-24: Completed Task 1.2. Added the authoritative frozen test-only `narration-v1` table with 62 repository-authored synthetic-sensitive neutral/Spanish cases, exact source/effective-language/output/ambiguity/boundary decisions, and content-free fixture validation. Added focused integrity/privacy tests and reconciled architecture, system diagram, roadmap, testing guidance, ADR implementation status, and this plan. `pnpm.cmd --filter @voxleaf/epub test` passed 24 files/386 tests, `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd format:check`, and `git diff --check` passed; no production normalizer, dependency, schema, capability, TTS, audio, UI, or persistence behavior was added.
- 2026-07-24: Completed Task 1.3. Accepted the test-only `narration-v1` target/hard profile across 20 independent size, work, checkpoint, yield, and retention dimensions. Added content-free deterministic evidence for headings, paragraphs, dialogue, punctuation-heavy Spanish, long-sentence/token pressure, exact/max-plus-one batches, and multibyte Unicode; every exact hard maximum passes and every max-plus-one observation returns the same frozen failure. Reconciled ADR-0012, architecture, system diagram, performance budget, roadmap, testing guidance, and this plan. `pnpm.cmd --filter @voxleaf/epub test` passed 25 files/396 tests, `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd format:check`, and `git diff --check` passed. No production preparation behavior or external capability was added.
- 2026-07-24: Completed Task 2.1. Added the pure package-internal iterative narration source projector with exhaustive `never` checks for all current semantic block/inline variants, immutable locator-ordered leaf and structural-boundary events, inherited semantic context, exact Unicode-code-point parity with `PublicationLocatedBlock`, and raster alternative-text/image-read exclusion. Five focused tests cover every variant, nested source order/context, empty and unspoken leaves, astral/combining/line-break/raster accounting, deep source/output immutability, compile-time union closure, and fixed content-free invariant failures. A one-line behavior-neutral repair also clears the pre-existing Task 1.3 unused-loop-variable lint finding. `pnpm.cmd --filter @voxleaf/epub test` passed 26 files/401 tests; package typecheck/build, `pnpm.cmd lint:typescript`, `pnpm.cmd format:check`, and `git diff --check` passed. No public operation, source spans, normalization, segmentation, bound enforcement, dependency, schema, desktop behavior, TTS, audio, persistence, or capability was added.
- 2026-07-24: Completed Task 2.2. Added the package-internal source-token mapper and on-demand locator-range constructor. Every Unicode code point, semantic line break, and raster placeholder now receives one immutable monotonic block-local half-open span; full endpoints pass existing package/shared locator validation without duplicating locator objects in retained tokens. Five focused tests cover BMP/astral/combining text, nested context, one-position placeholders, empty and block-end offsets, structural order, exact source reconstruction, deep immutability, invalid spans/input, union closure, raster omission, and fixed content-free errors. `pnpm.cmd --filter @voxleaf/epub test` passed 27 files/406 tests; package typecheck/build, `pnpm.cmd lint:typescript`, `pnpm.cmd format:check`, `git diff --check`, and `pnpm.cmd check:portable` passed. No public operation, normalization, segmentation, bound enforcement, dependency, schema, desktop behavior, TTS, audio, persistence, or capability was added.
- 2026-07-24: Completed Task 2.3. Added the package-internal bounded source-window coordinator, the production source/work/depth/retention subset of `narration-v1`, lazy canonical code-point starts, frozen partial-leaf token windows, monotonic continuation, content-free closed failures, deterministic cancellation checkpoints and injected yields, one narration-operation slot independent of raster reads, retry, and close-linked stale-result suppression/cleanup. Exact/max-plus-one source, traversal-depth, event-retention, continuation, cancellation, concurrency, raster-overlap, and close tests pass. `pnpm.cmd --filter @voxleaf/epub test` passed 28 files/416 tests; package typecheck/build, `pnpm.cmd lint:typescript`, `pnpm.cmd format:check`, `git diff --check`, and `pnpm.cmd check:portable` passed. No public `prepareNarration`, normalization, segmentation, prepared segment/range, dependency, schema, desktop behavior, TTS, audio, persistence, or capability was added.
- 2026-07-24: Completed Task 3.1. Added the pure package-internal `narration-normalizer.ts` and closed `spanish-normalization.ts` line-end allowlist. Explicit Unicode whitespace, semantic line breaks, approved zero-width marks, soft hyphens, and accepted/preserved line-end hyphenation now produce frozen block-local normalized text/omission units while preserving exact code, effective neutral/Spanish context, every legal origin span, and the immutable source model. Twenty focused tests cover every accepted Task 3.1 corpus case, deterministic repeat and second-pass text, collapsed/removed/joined origins, semantic line-break versus block boundaries, explicit/malformed language context, code, astral/combining Unicode, empty unspoken output, exact/max-plus-one retained-token admission, deep immutability, union closure, and content-free failures. `pnpm.cmd --filter @voxleaf/epub test` passed 29 files/436 tests; package typecheck/build, `pnpm.cmd lint:typescript`, `pnpm.cmd format:check`, `git diff --check`, and `pnpm.cmd check:portable` passed. No public operation, remaining punctuation/lexical normalization, segmentation, dependency, schema, desktop behavior, TTS, audio, persistence, or capability was added.
- 2026-07-24: Completed Task 3.2. Extended the block-local normalizer with bounded punctuation and symbol scanners, frozen punctuation/quotation/ellipsis/dialogue/symbol roles, content-free boundary protections, paired and malformed-opening quotation handling, exact code preservation, and a closed Spanish symbol table. Only a whitespace-delimited ampersand and the exact accepted Celsius form expand under effective Spanish; every neutral, explicit non-Spanish, compact, ambiguous, unsupported, or code form remains unchanged. Every replacement or omission retains its original one-code-point source span, and each emitted unit is checked against the accepted 16-output-code-point expansion ceiling. Nineteen focused tests added corpus-driven exact output and protections, repeat/second-pass idempotence, straight/typographic quotation cases, Unicode and three-period ellipses, dialogue/repeated punctuation, negative symbol contexts, maximum 4,096-token repeated punctuation and unbalanced quotes, exact expansion bounds, source immutability, and content-free failures. `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (29 files/455 tests), `pnpm.cmd lint:typescript`, `pnpm.cmd check:portable`, and `git diff --check` passed. No public operation, dependency, shared schema, desktop behavior, TTS, audio, persistence, network, storage, or capability was added.
- 2026-07-24: Completed Task 3.3. Added closed longest-first Spanish lexical normalization and preservation tables plus bounded source-order recognition for accepted abbreviations, initials, cardinals, signs, ordinals, decimal/thousands forms, years, dates, times, euro/explicit US-dollar currency, percentages, and explicit language context. Every expansion is split across original one-code-point source units under the 16-code-point per-source ceiling; unused origins become typed lexical omissions, and frozen roles/protections retain segmentation evidence without widening spans. Neutral, malformed, ambiguous, unsupported, out-of-allowlist, code, and foreign-name forms remain unchanged. The production numeric lookahead guard admits exactly 128 candidate code points and rejects 129 with the fixed content-free resource-limit outcome; no floating-point conversion, locale API, regex backtracking, dependency, schema, desktop behavior, persistence, network, TTS, audio, or capability was added. `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (29 files/497 tests), `pnpm.cmd lint:typescript`, `pnpm.cmd check:portable`, and `git diff --check` passed.

- 2026-07-24: Completed Task 3.4. Added a production postcondition that validates normalized-unit cardinality, source-span parity, deep-freeze state, effective-language values, nonempty per-source output, expansion ceilings, and reconstructed narration text before returning the stream. Added composed mixed-language/code/symbol/line-break/punctuation/numeric cases, full-corpus repeated-run and second-pass stability, source immutability, output-unit and expansion-bound assertions, and canary checks over fixed internal/resource-limit failures. `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (29 files/502 tests), and `git diff --check` passed; portable validation remains the milestone check. No public operation, segmentation, shared schema, dependency, desktop, TTS, audio, persistence, network, or capability behavior was added.
- 2026-07-24: Completed Task 4.1. Added a package-internal deterministic boundary scanner over normalized source-mapped units with immutable source-offset sentence/dialogue-turn/clause points, explicit non-splittable protected-token spans, repeated-terminal clustering, closing-punctuation carry, block-final malformed/unterminated fallback, semantic line-break and language-transition clauses, and preserved heading/paragraph/quote/list/dialogue metadata. The scanner visits each admitted unit exactly twice, uses no locale authority or untracked-string parse, and production-enforces the accepted 256-code-point protected-token ceiling with fixed content-free max-plus-one failure. Fourteen focused tests drive the complete normalization corpus and explicit boundary/privacy/bound cases; `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (30 files/516 tests), `pnpm.cmd check:portable`, and `git diff --check` pass. The current source projection has no scene-break union, so no ingestion/public semantic contract was invented; recognized scene-break packing remains Task 4.2 work. No public operation, prepared segment/range, dependency, shared schema, desktop, TTS, audio, persistence, network, or capability behavior was added.
- 2026-07-24: Completed Task 4.2. Added the package-internal block-local semantic-unit packer and production segment target/hard constants. It emits immutable source-offset segments with closed boundary reasons and content-free measurements; preserves headings, complete sentences, dialogue turns, protected tokens, and accepted combining sequences; uses clause, whitespace/token, then hard fallback; recognizes only top-level `***`/`⁂` scene-break paragraphs; and retains at most 17 stable entries independently of later batch slicing. Fourteen focused tests cover the complete corpus plus short/target/long/mixed packing, exact 768-source/640-narration/2,048-byte maxima, multibyte pressure, fallback priority, scene-break exclusions, retention, immutability, and privacy. Package typecheck, the complete EPUB suite (31 files/530 tests), and `pnpm.cmd check:portable` pass. No locator range, public operation/export, shared schema, dependency, desktop, TTS, audio, persistence, network, or external capability was added.

- 2026-07-25: Completed Task 4.3. Extracted the deterministic narration work controller for the existing source window and the now-asynchronous block packer, preserving the 512/1,024 checkpoint and 4,096/8,192 yield intervals plus final cancellation checks. Packing now rejects over-retained source-unit/boundary/protected-token scans before temporary indexing, enforces exact 8,832-code-point and 26,624-byte retained narration limits, records content-free work/checkpoint/yield measurements, hard-splits an unprotected 641-code-point token at the legal 640-code-point boundary, and returns the fixed content-free limit outcome when an indivisible combining/protected/expansion unit cannot fit. Five focused adversarial tests add exact/max-plus-one token/retention behavior, monotonic ranges, worst-case cancellation, and retry. `pnpm.cmd --filter @voxleaf/epub typecheck`, the complete EPUB suite (31 files/535 tests), and `pnpm.cmd check:portable` pass. No locator range, public operation/export, shared schema, dependency, desktop, TTS, audio, persistence, network, or external capability was added.

- 2026-07-25: Completed Task 4.4. Added a package-internal prepared-segment finalizer that composes source-token normalization, boundary scanning, and packing, validates all source identity/range/text-measurement/aggregate/disposition invariants before publication, and emits deeply frozen sensitive text with canonical half-open locator ranges, closed boundary metadata, exact continuation, and completion. Six focused tests resolve every endpoint and continuation exactly, prove repeat-stable monotonic block-local ranges, partial/scene-break completion, deep immutability, closed reason coverage, content-free failure, and unchanged `NarrationSegmentV1` compatibility using identities supplied only by tests. `pnpm.cmd --filter @voxleaf/epub typecheck`, the complete EPUB suite (32 files/541 tests), and `pnpm.cmd check:portable` pass. No public operation/export, shared schema, dependency, desktop, TTS, audio, persistence, network, or external capability was added.

- 2026-07-25: Completed Task 5.1. Added package-local public narration request/result types and exports, `OpenedPublication.prepareNarration`, and a bounded coordinator that composes source windows through canonical prepared segments into frozen closed batches. It validates the exact `narration-v1` request, structurally reconstructs the complete stable containing segment for interior starts even across source-window boundaries, returns continuation at the final emitted segment end, enforces independent batch totals with one lookahead, and converts cancellation, invalid input/start, concurrency, limits, close, and unexpected failure into fixed content-free outcomes. Focused tests cover public typing/runtime exports, a real public-opener smoke, batch/continue/complete behavior, interior starts, large-window reconstruction, abort/retry, raster overlap, close/stale suppression, post-close behavior, deep immutability, and privacy. Desktop test fixtures were updated only to satisfy the expanded public interface; production desktop behavior remains unchanged. `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (32 files/547 tests), `pnpm.cmd --filter @voxleaf/epub build`, `pnpm.cmd --filter @voxleaf/desktop typecheck`, and `pnpm.cmd check:portable` pass. No dependency, shared schema, desktop production behavior, TTS, audio, persistence, network, or external capability was added.
- 2026-07-25: Completed Task 5.2. Added a dedicated provenance-labeled, repository-authored synthetic three-spine EPUB and a root-public-API integration matrix across representative neutral/Spanish semantics, normalization forms, long-sentence segmentation, stable locator ranges, exact/recovered starts, one-segment continuation, structural scene/image gaps, spine transition, and publication completion. The matrix proves deep displayed-source equality, deterministic complete segment shapes across one- and four-segment batching, exact range resolution, unchanged `NarrationSegmentV1` wrapping with test-only work identities, no raster read, and zero network/worker/WebSocket/file-picker/DOM/storage/TTS/audio capability use. `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (33 files/550 tests), `pnpm.cmd --filter @voxleaf/epub build`, and `pnpm.cmd check:portable` pass. No production code, dependency, shared schema, desktop behavior, TTS, audio, persistence, network, or external capability changed.
- 2026-07-25: Completed Task 5.3. Hardened the public coordinator so caller count and independent batch code-point/UTF-8-byte/sentence totals stop at one stable lookahead, while each internal pack is capped by the remaining accepted aggregate retention capacity. Added package-internal numeric-only resource snapshots and five deterministic tests for production/profile hard-limit alignment, exact checkpoint/yield cadence, exact batch-plus-lookahead code-point/byte ceilings, 96-paragraph repeated bounded continuation, caller cancellation/retry, publication close, and no retained stale result. `pnpm.cmd --filter @voxleaf/epub typecheck` and the complete EPUB suite (34 files/555 tests) pass; `pnpm.cmd check:portable` passed on the final Task 5.3 tree. No dependency, public root export, shared schema, desktop behavior, TTS, audio, persistence, network, wall-clock gate, or external capability was added.

## Discoveries and decisions

- The existing semantic projector already collapses ordinary XML whitespace while preserving exact code text and explicit semantic line breaks. Narration normalization must start from that representation rather than claim access to publisher layout.
- ADR-0007 defines line breaks and raster placeholders as one source code point each. Narration source mapping must consume those positions even though raster images are not spoken.
- Block-local offset spans are sufficient retained token state. Full start/end locators are reconstructed through `createBlockLocatorAtOffset` and `decodeLocatorRangeV1` when needed, avoiding a repeated locator identity and anchor object on every source code point.
- JavaScript `for...of` yields the required Unicode-code-point units without exposing UTF-16 indices as locator offsets; combining marks remain distinct code points while later segmentation remains responsible for not splitting protected combining sequences.
- Structural block quotes and lists own only offset zero; their descendant headings/paragraphs own narratable offsets. Prepared segments should therefore remain within leaf blocks.
- `NarrationSegmentV1` is already sufficient to carry sensitive text and a locator range once a later coordinator attaches work identity. Its schema intentionally excludes normalization and chunk-profile policy.
- The system diagram already models narration normalization/chunking as a framework-independent planned stage downstream of EPUB semantics. The architecture overview places the deferred work under the EPUB package boundary.
- The current opened-publication handle already links caller cancellation with publication close for resource reads and awaits active work before archive release. Narration preparation should follow the lifecycle pattern without using the raster read slot.
- The current package has no narration dependency or module. This plan proposes repository-owned deterministic scanners and no new production dependency.
- The broad synchronized-reader plan remains useful for Milestones 8-9 but does not define Milestone 5 normalization or segmentation acceptance.
- Half-open block-local ranges are the accepted mapping convention because they compose without duplicate boundary code points and remain compatible with the existing ordered `LocatorRangeV1`.
- Stable segmentation must be independent of request batching. The unresolved user-interaction choice for a visual locator inside a stable segment remains explicitly deferred to Milestone 9.
- The current safe semantic model and narration source projection expose headings, paragraphs, block quotes, and list boundaries but no scene-break leaf/event. Task 4.2 therefore recognizes a scene break only when a top-level paragraph outside lists/quotes contains exactly three asterisks (normalized spacing permitted) or one U+2042 asterism and no raster placeholder. It consumes that block without speech and does not widen the ingestion/public semantic contract; every other ornamental or ambiguous form remains ordinary content.
- Task 4.3 treats an oversized unprotected lexical token differently from an indivisible protected, combining, or one-source expansion unit. The former may split only at the latest source-mapped boundary satisfying every hard dimension; the latter returns `resource-limit-exceeded` rather than violating the source map or emitting an over-limit segment.
- Task 4.4 composes the full block-local pipeline behind one package-internal entry point so a packed result cannot be paired accidentally with another block of equal length. The finalizer stages at most the accepted 17 entries, revalidates every sensitive-text and aggregate measurement, constructs ranges only through package/shared locator authority, and freezes output only after all invariants succeed.
- The internal continuation records the exact consumed source offset for both spoken and unspoken blocks. A partial retained block continues at its final prepared range end; a completed scene-break or omission-only block continues at its legal block end. Task 5.1 now applies the distinct public rule that a nonterminal returned batch continues at the final returned segment end.
- `NarrationSegmentV1` requires work identities that Milestone 5 does not own. Task 4.4 therefore proves compatibility by adding synthetic segment/session/generation identities only in tests; the production prepared shape contains exactly text, source range, boundary reason, and measurements.
- Source-window projection and semantic packing now use one package-internal deterministic work controller. This keeps cancellation/checkpoint/yield semantics identical without coupling the packer to the source-window module, and both paths check cancellation immediately before publishing immutable sensitive output.
- ADR-0012 accepts `prepareNarration` as a closed result-returning operation rather than an exception boundary. A request inside a stable segment receives that complete segment plus `inside-segment`, preserving both stable batch-independent segmentation and Milestone 9's later choice to use or skip it.
- Narration preparation owns a separate active-operation slot from raster reads. This preserves the no-archive-read boundary while allowing one in-memory preparation and one bounded image read to overlap; publication close cancels and awaits both.
- The Task 1.2 corpus is test-only authority rather than a production lookup table. Neutral behavior is conservative; Spanish lexical expansion is allowlisted; ambiguous/unsupported forms, code spacing, combining sequences, astral code points, malformed punctuation, and foreign names are preserved; validation failures expose only closed content-free codes.
- The Task 1.3 profile independently limits code points and UTF-8 bytes because neither bounds the other tightly for Unicode input. Batch totals are lower than the product of every per-segment maximum, retained state permits only one additional lookahead segment, and deterministic cancellation/yield intervals are expressed in work units rather than hardware time. The 300-code-point astral fixture has 600 UTF-16 code units and 1,200 UTF-8 bytes, proving JavaScript `.length` cannot control admission.
- Task 2.3 records only the canonical relation to source (`at-source-start`, `inside-source`, `before-next-source`, or `publication-end`). Task 5.1 derives the final stable-segment relation structurally from Task 4 ranges without searching prose and reconstructs from the block start when a bounded source window would otherwise expose only a suffix of the containing segment.
- Task 5.2 keeps fixture expectations beside the synthetic EPUB builder rather than deriving them from opened output. The public matrix imports `@voxleaf/epub` only through its root, uses content-free equality assertions for complete sensitive shapes, and demonstrates that changing only `maximumSegments` changes request count rather than stable prepared text or ranges.
- Independent public batch totals can be reached before the requested segment count. Task 5.3 therefore classifies the first non-returnable stable segment as the sole lookahead and stops, while passing the block packer only the remaining aggregate segment/code-point/byte capacity. This makes both temporary and retained prepared output obey the accepted one-lookahead envelope.
- Deterministic resource observation is package-internal and numeric-only. It records high-water counts and bytes at source-window, prepared-block, and final-result publication points; it is not a root export, telemetry surface, timer, heap estimate, or content logger.
- Normalized output units remain nonempty by representing collapsed, removed, raster, and joined positions as separate typed omissions. This retains one legal origin span per source token, preserves semantic-line-break evidence even when no space is emitted, avoids reparsing narration text for ranges, and gives later segmentation a source-ordered stream without empty text tokens.
- A source line break alone cannot distinguish discretionary hyphenation from a genuine compound. Task 3.1 therefore uses the exact Spanish split accepted by the corpus as a closed production allowlist; all other recognized word-hyphen-line-break-word forms preserve the hyphen and suppress only the layout line break.
- Task 3.2 preserves punctuation code points instead of canonicalizing typography away. Frozen roles and boundary protections carry only content-free structural facts for the later segmenter, while paired marks remain source text and unmatched opening marks receive a malformed-punctuation protection without invented repair.
- The accepted Celsius example expands a five-code-point source form into one protected source-ordered group. The second digit becomes a typed symbol-expansion omission while the other source positions carry the spoken pieces, preserving one origin unit per token and preventing an expansion from inventing or widening a source span. Context-safe ampersand expansion requires effective Spanish plus surrounding whitespace and word context; compact, neutral, or code forms remain unchanged.
- Task 3.3 treats the accepted corpus as policy authority but keeps its production allowlists separate from test support. Longest-first matching prevents component cardinals from rewriting accepted currencies, percentages, dates, times, or preserved unsupported forms. Spoken output is divided over the original source positions by Unicode code point, so no lexical expansion needs a synthetic or widened source span.
- Numeric admission and numeric meaning are separate decisions: a contiguous numeric candidate may use at most 128 source code points of parser lookahead, while only the closed accepted magnitudes and spellings transform. In-range but unsupported magnitudes remain source text; max-plus-one parser work fails content-free before any result is published.

## Final validation results

Not yet available. This file currently records the implementation plan only.

Before completion, replace this section with:

- accepted ADR and profile versions;
- exact focused and root commands with outcomes;
- test counts and deterministic bound evidence;
- CI run and exact tested commit;
- dependency/schema/capability status;
- privacy and artifact audit results;
- known normalization/segmentation limitations;
- final changed-file scope; and
- confirmation that the plan moved to `docs/plans/completed/` and roadmap Milestone 5 is marked complete.
