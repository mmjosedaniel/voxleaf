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
- The visual reader owns displayed text and the active logical locator. Narration preparation, TTS, audio, highlighting, and reader/audio synchronization are not implemented.

Important current limitations are:

- no production module traverses semantic EPUB content for narration;
- no normalization policy, Spanish corpus, sentence scanner, scene-break policy, or chunk-sizing profile is accepted;
- no source-span mapping survives text transformations;
- no public bounded preparation operation exists on an opened publication;
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

Exact names may be adjusted by Task 1.1, but the intended ownership is:

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
- a new narration-preparation ADR, expected to be `ADR-0012`

No `apps/desktop`, `services/tts`, Rust, Tauri capability, browser-storage, or audio implementation change is expected.

## Architecture and constraints

### Ownership boundary

Narration preparation remains inside `@voxleaf/epub` as a framework-independent stage over the package's immutable semantic documents and locator index. This keeps source traversal, code-point accounting, locator construction, and publication lifecycle under the owner that already defines them.

The preferred public shape is a bounded operation on `OpenedPublication`, provisionally named `prepareNarration`. Task 1.1 must finalize the name and closed input/result unions in an accepted ADR before implementation. The operation should:

- accept an untrusted start locator, a closed package-local narration profile, a caller-requested batch size no greater than the package maximum, and an optional `AbortSignal`;
- normalize the start through package-owned locator resolution;
- process only a finite source window and never materialize a whole publication by default;
- return frozen prepared segments, canonical start/continuation locators, and content-free measurements;
- return no partial batch after cancellation, close, internal failure, or a hard-limit failure;
- avoid image-resource reads, archive reads, DOM access, storage, network, workers, process APIs, and logging; and
- participate in `OpenedPublication.close()` so closing a book aborts and awaits active preparation before releasing publication resources.

At most one narration-preparation operation should be active per publication unless Task 1.1 records evidence for a different bounded policy. This milestone has no need for concurrent preparation of the same immutable publication.

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

Task 1.1 should accept the following default:

- prepared ranges are half-open `[start, end)`;
- a segment remains inside one heading or paragraph, so its start and end share book, spine, and anchor identity;
- `end.textOffsetCodePoints` may equal the located block's legal text length;
- ranges are nonempty in narration text, ordered by source position, and non-overlapping;
- skipped source positions may create gaps between ranges but may not reverse them;
- a normalization expansion may map multiple output code points to one source span;
- a deletion, such as a soft hyphen or scene marker, remains part of internal source consumption even though it emits no narration text;
- an inline raster position between spoken text may lie inside the segment's enclosing range but is never narrated; and
- normalization and segmentation batching must not change source ranges for the same publication and profile.

The accepted ADR must state how a request beginning inside an already segmented sentence relates to that stable segment. Milestone 5 should expose the relation without deciding whether Milestone 9 starts at the containing segment, the next segment, or another interaction-specific target.

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

No language detector is added. Task 1.1 should approve a closed package-local default language input with at least:

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

Task 1.3 must accept a versioned target and hard-maximum profile using synthetic evidence. JavaScript UTF-16 `.length` is never the sole size authority. Model-specific limits remain deferred; later profiles may be versioned without changing source-range semantics.

### Bounded work, cancellation, and lifecycle

The pipeline must have explicit maxima for:

- source code points inspected per public request;
- output segments per batch;
- narration code points and UTF-8 bytes per segment;
- total narration code points and UTF-8 bytes returned per batch;
- protected-token length;
- abbreviation/number/date parser lookahead;
- nesting or recursion introduced by narration traversal; and
- work between cancellation checkpoints.

Exact maxima pass and max-plus-one cases produce a fixed content-free outcome. The implementation must avoid recursive descent proportional to attacker-controlled text length, catastrophic-backtracking regular expressions, whole-publication copies, and unbounded token arrays.

If a preparation call can occupy the event loop long enough to be user-visible, it must use an injected, testable framework-independent yield scheduler at deterministic work intervals. Caller abort and publication close are checked before work, at bounded intervals, before and after yields, and before publication of the frozen result. Cancellation returns no partial segment text.

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

The default implementation adds no production dependency. The semantic model, shared contracts, Unicode-aware JavaScript primitives, and repository-owned deterministic scanners are sufficient for the first bounded profile.

Before adding a dependency, Task 1.1 must document:

- the exact behavior that repository code cannot safely provide;
- deterministic Node/WebView behavior and release pinning;
- package size, license, transitive graph, install scripts, runtime capabilities, and maintenance;
- Spanish coverage and source-map support;
- alternatives considered; and
- updates to `docs/development/dependencies.md`, manifests, and lockfiles.

`Intl.Segmenter` must not be used as the segmentation authority because output can vary by runtime data and it does not preserve the required source-transform map. It may be evaluated only as non-authoritative evidence if Task 1.1 records why.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

### Task 2.3: Add bounded start, continuation, cancellation, and close behavior

**Specific outcome:** Source projection can begin from a canonical requested locator, stop at approved request bounds, and publish a continuation while caller abort or publication close releases all active work.

**Work:**

- Normalize the untrusted start locator through package ownership.
- Find the stable segment relation without text search.
- Apply finite per-request source and output bounds.
- Add deterministic cancellation checkpoints and an injected yield scheduler if Task 1.3 requires it.
- Integrate one active preparation operation with idempotent publication close.
- Publish no partial sensitive result after failure or cancellation.

**Validation:**

- Test exact, recovered, malformed, wrong-book, block-start, mid-block, block-end, spine-end, and publication-end starts.
- Test pre-abort, mid-work abort, close during work, repeated close, stale completion, and successful retry.
- Prove no archive or raster resource read occurs.
- `pnpm.cmd --filter @voxleaf/epub test`.

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

**Status:** Not started.

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

## Discoveries and decisions

- The existing semantic projector already collapses ordinary XML whitespace while preserving exact code text and explicit semantic line breaks. Narration normalization must start from that representation rather than claim access to publisher layout.
- ADR-0007 defines line breaks and raster placeholders as one source code point each. Narration source mapping must consume those positions even though raster images are not spoken.
- Structural block quotes and lists own only offset zero; their descendant headings/paragraphs own narratable offsets. Prepared segments should therefore remain within leaf blocks.
- `NarrationSegmentV1` is already sufficient to carry sensitive text and a locator range once a later coordinator attaches work identity. Its schema intentionally excludes normalization and chunk-profile policy.
- The system diagram already models narration normalization/chunking as a framework-independent planned stage downstream of EPUB semantics. The architecture overview places the deferred work under the EPUB package boundary.
- The current opened-publication handle already links caller cancellation with publication close for resource reads and awaits active work before archive release. Narration preparation should follow the lifecycle pattern without using the raster read slot.
- The current package has no narration dependency or module. This plan proposes repository-owned deterministic scanners and no new production dependency.
- The broad synchronized-reader plan remains useful for Milestones 8-9 but does not define Milestone 5 normalization or segmentation acceptance.
- Half-open block-local ranges are the proposed mapping convention because they compose without duplicate boundary code points and remain compatible with the existing ordered `LocatorRangeV1`.
- Stable segmentation must be independent of request batching. The unresolved user-interaction choice for a visual locator inside a stable segment remains explicitly deferred to Milestone 9.

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
