# ADR-0012: Keep narration preparation bounded and publication-owned

## Status

Accepted.

## Implementation status

Accepted by Milestone 5 Tasks 1.1-1.3. Task 1.2 accepts the deterministic
test-only neutral/Spanish corpus summarized in
[`narration-normalization-v1.md`](../narration-normalization-v1.md), and Task
1.3 accepts the test-only target/hard resource profile summarized in
[`narration-preparation-limits-v1.md`](../narration-preparation-limits-v1.md).
Task 2.1 implements the pure package-internal exhaustive source projector over
the current closed semantic block and inline unions. It emits immutable leaf
units and quote/list boundary events in locator order, preserves inherited
semantic context, verifies Unicode-code-point totals against
`PublicationLocatedBlock`, and excludes raster alternative text and image
reads. Task 2.2 maps those units to immutable Unicode-code-point tokens with
compact monotonic half-open block-local spans and validates reconstructed
locator endpoints through existing package/shared rules. Task 2.3 adds the
package-internal bounded source-window coordinator: it structurally resolves
untrusted starts, emits frozen partial-leaf token windows and canonical
continuations under the accepted source/work/retention limits, checks linked
cancellation at deterministic intervals around injected yields, permits one
active narration operation independently of one raster read, and makes close
abort and await both before archive release. Normalization, segmentation,
prepared locator ranges, and the public `prepareNarration` result boundary
were still unimplemented at that point. Tasks 3.1-3.4 now add the first pure
package-internal normalizer slices: explicit Unicode whitespace collapse,
source-mapped semantic line breaks, accepted zero-width/soft-hyphen removal,
one closed Spanish line-end join, punctuation/quotation/ellipsis/dialogue
protection, malformed-opening preservation, and the closed context-safe
Spanish ampersand/Celsius expansions. Task 3.3 adds the accepted Spanish
abbreviation/numeric/date/time/currency/percentage forms, period and numeric
token protections, source-distributed lexical expansions, and the production
128-code-point parser-lookahead guard. Code, genuine compounds, neutral
ambiguity, malformed or unsupported numeric forms, and every block-local
origin span remain preserved through nonempty text or typed omission units.
Task 3.4 adds the composed-stream postcondition, deterministic/idempotent
cross-category tests, deep immutability checks, and content-free privacy
canaries. Task 4.1 adds a package-internal two-pass source-offset sentence,
dialogue-turn, clause, and protected-token scanner and enforces the accepted
256-code-point protected-token ceiling. Task 4.2 adds the package-internal
block-local semantic-unit packer, production-enforces every accepted
per-segment source/code-point/UTF-8-byte/sentence target and hard maximum,
retains at most 17 stable segments, and records immutable source offsets,
closed boundary reasons, completion, and content-free measurements. Task 4.3
makes packing cooperatively asynchronous through the same deterministic work
controller as source-window preparation, bounds normalized scan and temporary
index retention, enforces the accepted 8,832-code-point/26,624-byte retained
narration ceilings, splits an oversized unprotected token only at a legal
Unicode-safe hard boundary, and fails content-free when one indivisible unit
cannot fit. Task 4.4 adds the package-internal finalization stage that validates
the complete packed block before publishing immutable sensitive narration text,
canonical half-open `LocatorRangeV1` values, the closed boundary reason,
content-free size measurements, completion, and an exact source continuation.
Every endpoint is constructed through the existing package locator owner and
shared decoder; test-only work identities prove `NarrationSegmentV1`
compatibility without production identity generation or a schema change. Task
5.1 adds the public package-local request, prepared-segment, batch, and closed
result types; exports them without adding another root-level runtime opener;
and exposes `OpenedPublication.prepareNarration`. The coordinator validates the
closed `narration-v1` request, reconstructs stable segmentation when a start is
inside a bounded source window, returns the complete containing segment,
publishes continuation at the final returned segment end, and enforces the
independent 16-segment, 8,192-code-point, 24,576-byte, and 64-sentence batch
ceilings while retaining at most one lookahead segment. Invalid input,
cancellation, concurrent use, resource exhaustion, close, and unexpected
failure return frozen content-free outcomes under the existing publication
lifecycle. No runtime dependency, shared schema, desktop integration, TTS
behavior, audio behavior, persistence, network access, or capability was added.
Task 5.2 adds a dedicated provenance-labeled, repository-authored three-spine
neutral/Spanish EPUB and proves the public root opener-to-segment matrix across
representative semantics, exact/recovered starts, continuation, structural
gaps, spine transitions, source immutability, shared-contract wrapping, image
omission/read isolation, and zero external capability use. Task 5.3 proves the
accepted exact deterministic work cadence, independent batch totals,
one-lookahead aggregate retention, repeated bounded continuation, and
no-result cancellation/close behavior through numeric-only package evidence.
Task 6.1 reconciles the implemented ownership, public flow, ranges, language
policy, limits, lifecycle, dependencies, tests, and deferred TTS/audio boundary
across current product, architecture, development, roadmap, and plan
documentation. Task 6.2 completes focused, root, CI, privacy, artifact, and
scope validation.

## Context

VoxLeaf needs a separate speech-oriented representation of already-sanitized
EPUB content without changing the text displayed by the reader. Every prepared
segment must retain a stable logical source range so later seeking,
highlighting, cancellation, generation, and progress can use the same position
authority established by ADR-0003.

The implemented `@voxleaf/epub` package already owns immutable semantic
documents, deterministic Unicode-code-point locator indexes, structural locator
resolution, and the opened-publication lifecycle. The implemented
`@voxleaf/shared` package already owns `ReadingLocatorV1`, `LocatorRangeV1`,
`SensitiveNarrationTextV1`, `NarrationSegmentV1`, and
`OperationalErrorV1`. `NarrationSegmentV1` is deliberately session- and
generation-bound; Milestone 5 has neither of those identities and must not
invent them.

The narration boundary must also settle:

1. which package owns source traversal, normalization, segmentation, and range
   construction;
2. the public operation, request, prepared-segment, and closed result shapes;
3. how a request relates to a stable segment when its locator falls inside that
   segment;
4. continuation, cancellation, close, concurrency, and no-partial-result
   behavior;
5. the initial language input and semantic-language override policy;
6. whether a shared schema or production dependency is needed; and
7. which model-, process-, audio-, reader-, and synchronization-specific
   decisions remain deferred.

## Decision

### Keep preparation inside `@voxleaf/epub`

`@voxleaf/epub` owns narration preparation as a framework-independent
transformation over its immutable semantic documents and locator index. This
owner already has the information required to:

- traverse headings and paragraphs in deterministic source order;
- account for line breaks, raster placeholders, nested structures, and Unicode
  code points exactly as the locator index does;
- validate and recover untrusted start locators without text search;
- construct legal block-local `LocatorRangeV1` values; and
- bind cancellation and cleanup to `OpenedPublication.close()`.

Preparation reads only the immutable in-memory semantic model and locator
index. It must not read the EPUB archive or raster resources and must not access
the DOM, renderer state, browser storage, filesystem, clipboard, network,
workers, processes, Tauri APIs, TTS, or audio APIs.

Displayed `SensitivePublicationText` remains unchanged. Narration text is a
separate sensitive, ephemeral value and must not flow back into the visual
reader.

### Add one bounded operation to `OpenedPublication`

The public method name is `prepareNarration`:

```ts
prepareNarration(
  request: NarrationPreparationRequest,
): Promise<NarrationPreparationResult>;
```

The accepted request shape is:

```ts
type NarrationPreparationProfileId = "narration-v1";
type NarrationPreparationLanguage = "und" | "es";

interface NarrationPreparationRequest {
  readonly startLocator: unknown;
  readonly profile: NarrationPreparationProfileId;
  readonly defaultLanguage: NarrationPreparationLanguage;
  readonly maximumSegments: number;
  readonly signal?: AbortSignal;
}
```

`startLocator` is deliberately untrusted. The package validates and resolves it
through the same package-owned structural locator boundary used by the reader.
`maximumSegments` must be a positive safe integer no greater than the
`narration-v1` per-batch hard maximum of 16. It controls only how many
already-stable segments are returned; it does not change segmentation.

`narration-v1` identifies one closed package-local normalization, segmentation,
and resource policy. Its accepted model-independent target and hard numeric
limits are recorded in
[`narration-preparation-limits-v1.md`](../narration-preparation-limits-v1.md).
Callers cannot supply custom rules, regular expressions, model token limits, or
more-permissive resource overrides.

Targets guide natural-boundary packing and work cadence; exceeding a target is
allowed up to the corresponding hard maximum. Every exact hard maximum is
allowed. A max-plus-one observation returns `resource-limit-exceeded` with no
partial result. Admission independently counts source/narration Unicode code
points, UTF-8 bytes, segments, sentences, protected-token length, parser
lookahead, traversal depth, normalization expansion, work, and retained
intermediate collections. JavaScript UTF-16 `String.length`, wall-clock time,
model tokens, and estimated audio duration are not admission authorities.

The principal hard ceilings are 16,384 source code points inspected per
request, 16 returned segments, 768 source code points and 640 narration code
points or 2,048 UTF-8 bytes per segment, 8,192 narration code points or 24,576
UTF-8 bytes per batch, 256 protected-token code points, 128 parser-lookahead
code points, 128 traversal levels, 1,024 work units between cancellation
checkpoints, and 8,192 work units between deterministic yields. Retained
sensitive/intermediate state is bounded separately and includes capacity for
only one additional lookahead segment.

Unknown profile or language values, non-safe or non-positive batch values, and
batch values above the profile maximum produce the fixed `invalid-request`
outcome. They are not coerced or clamped.

### Return package-local prepared segments

The public package-local prepared segment has this conceptual shape; Task 5.1
must expose these names and semantics without creating a serialized schema:

```ts
type NarrationBoundaryReason =
  | "heading"
  | "paragraph"
  | "dialogue-turn"
  | "scene-break"
  | "sentence"
  | "clause"
  | "token"
  | "hard-limit";

interface PreparedNarrationMeasurements {
  readonly sourceCodePoints: Index;
  readonly narrationCodePoints: Index;
  readonly narrationUtf8Bytes: Index;
  readonly sentenceCount: Index;
}

interface PreparedNarrationSegment {
  readonly text: SensitiveNarrationTextV1;
  readonly sourceRange: LocatorRangeV1;
  readonly boundaryReason: NarrationBoundaryReason;
  readonly measurements: PreparedNarrationMeasurements;
}
```

Every segment and nested value is immutable and frozen. Segment text is
nonempty. The array position supplies batch order; a prepared segment has no
`segmentId`, session ID, generation ID, generation-global sequence, model
profile, voice, timing, or audio identity.

Later coordination code may attach those later-owned identities and validate a
complete `NarrationSegmentV1`. Milestone 5 must prove compatibility with the
existing shared contract but must not change or duplicate its schema.

### Use one closed result union

`prepareNarration` resolves to one deeply frozen result and maps expected and
unexpected implementation failures to a fixed content-free branch:

```ts
type NarrationPreparationStartRelation =
  | "at-segment-start"
  | "inside-segment"
  | "before-next-segment"
  | "publication-end";

interface NarrationPreparationStart {
  readonly canonicalLocator: ReadingLocatorV1;
  readonly resolutionStatus: "exact" | "recovered";
  readonly resolutionReason:
    | "exact"
    | "book-start"
    | "nearest-anchor"
    | "nearest-offset"
    | "nearest-spine";
  readonly segmentRelation: NarrationPreparationStartRelation;
}

interface NarrationPreparationBatchMeasurements {
  readonly sourceCodePointsInspected: Index;
  readonly narrationCodePoints: Index;
  readonly narrationUtf8Bytes: Index;
  readonly segmentCount: Index;
  readonly sentenceCount: Index;
  readonly checkpointCount: Index;
}

interface NarrationPreparationBatch {
  readonly status: "batch";
  readonly start: NarrationPreparationStart;
  readonly segments: readonly PreparedNarrationSegment[];
  readonly continuation: ReadingLocatorV1;
  readonly measurements: NarrationPreparationBatchMeasurements;
}

interface NarrationPreparationComplete {
  readonly status: "complete";
  readonly start: NarrationPreparationStart;
  readonly segments: readonly PreparedNarrationSegment[];
  readonly measurements: NarrationPreparationBatchMeasurements;
}

type NarrationPreparationFailureDetail =
  | "cancelled"
  | "invalid-request"
  | "invalid-start"
  | "operation-active"
  | "resource-limit-exceeded"
  | "internal-failure";

interface NarrationPreparationFailure {
  readonly status: NarrationPreparationFailureDetail;
  readonly error: OperationalErrorV1;
}

type NarrationPreparationResult =
  | NarrationPreparationBatch
  | NarrationPreparationComplete
  | NarrationPreparationFailure;
```

A `batch` is a successful nonterminal result. It contains at least one segment
and a canonical continuation locator. A `complete` result is successful and
terminal; it may contain the final nonempty segment batch or an empty array when
no narratable segment exists at or after the canonical start. It has no
continuation.

The continuation is the end locator of the final returned segment. A subsequent
request at that locator cannot return that segment again. Reaching the
caller-requested segment count is normal batching, not a limit failure. A
successful result either advances beyond the canonical request position or is
`complete`.

Failure results contain no segment, narration text, partial measurements,
canonical locator, rejected value, exception, stack, or dependency message.
Their operational-error mappings are:

| Detail                                        | `OperationalErrorV1` code |
| --------------------------------------------- | ------------------------- |
| `cancelled`                                   | `operation-cancelled`     |
| `invalid-request`, `invalid-start`            | `invalid-input`           |
| `operation-active`, `resource-limit-exceeded` | `resource-exhausted`      |
| `internal-failure`                            | `internal-failure`        |

A malformed locator, wrong-book locator, or publication without an addressable
source position is `invalid-start`. Structurally recoverable spine, anchor, or
offset input succeeds and exposes its canonical locator and fixed recovery
reason. A call made after the publication is closed is `internal-failure`,
matching the existing opened-handle lifecycle boundary.

### Keep stable segmentation independent of requests

Prepared ranges are ordered half-open `[start, end)` ranges:

- `start` is the first consumed source position and `end` is the first source
  position after the segment;
- each segment remains within one addressable heading or paragraph, so both
  endpoints share book, spine, and anchor identity;
- `end.textOffsetCodePoints` may equal the block's legal code-point length;
- ranges are source-ordered, non-overlapping, and independent of viewport,
  DOM, preferences, platform locale, wall-clock time, and request batching;
- skipped source positions may create gaps but cannot reverse ranges;
- expansion may map several narration code points to one source span;
- deletion remains part of internal source consumption without producing text;
  and
- raster placeholders may lie inside an enclosing range but are never spoken.

The first profile recognizes a scene break without adding a semantic-model
variant only for a top-level paragraph outside a list or block quote whose
normalized non-whitespace content is exactly `***` or U+2042 (`⁂`) and which
contains no raster placeholder. That source block is consumed without a spoken
segment. Other ornamental, nested, raster-bearing, or ambiguous paragraphs are
packed as ordinary content.

The profile segments a bounded source window deterministically before the
public batch is sliced to `maximumSegments`. Changing request batch size cannot
split, merge, or otherwise change a stable segment.

### Expose a containing segment without choosing playback policy

The package first resolves the requested locator structurally, then relates the
canonical locator to stable prepared segments without searching text:

- `at-segment-start`: the first returned segment starts at the canonical
  locator;
- `inside-segment`: the first returned segment is the complete stable segment
  that contains the canonical locator, even though its range starts earlier;
- `before-next-segment`: the canonical locator is in an unspoken source region
  and the first returned segment is the earliest later stable segment; and
- `publication-end`: no stable segment exists at or after the canonical
  locator, so the result is `complete`.

Returning the full containing segment preserves stable segmentation and gives a
later coordinator both relevant choices. Milestone 9 decides whether a
particular play or seek interaction uses that containing segment, skips to the
next segment, or selects another valid target. This ADR does not choose that
interaction policy.

### Bind cancellation and concurrency to publication lifetime

At most one narration-preparation operation may be active for an opened
publication.

- A second concurrent call resolves immediately as `operation-active`; it does
  not cancel or join the active call.
- Narration preparation has its own active-operation slot. One bounded raster
  resource read and one narration preparation may overlap because preparation
  performs no archive or image read.
- Caller abort and publication close are linked. Cancellation is checked before
  work, at the 512-work-unit checkpoint target and never later than 1,024 work
  units, around deterministic yields targeted at 4,096 and required by 8,192
  work units, and immediately before result publication.
- Pre-abort or abort during work returns `cancelled`.
- Cancellation, close, hard-limit failure, and internal failure publish no
  partial batch or sensitive text.
- After a cancelled or failed operation settles, another request may retry if
  the publication remains open.
- `OpenedPublication.close()` remains idempotent. It marks the handle closed,
  aborts the active narration operation and active resource read, awaits both,
  then releases the archive exactly once.

The implementation clears retained operation-local source tokens, normalized
text, and segments when the operation settles. A completed result is
caller-owned immutable data; later session owners remain responsible for
dropping it when superseded.

### Use explicit neutral and Spanish language input

The caller supplies `defaultLanguage: "und" | "es"`:

- `und` selects deterministic language-neutral behavior;
- `es` selects the first deterministic Spanish policy;
- an absent semantic language context uses the caller default;
- an inherited semantic language whose ASCII case-insensitive primary subtag
  is `es` selects Spanish for that span; and
- another, malformed, or unsupported explicit semantic language selects
  neutral behavior for that span.

There is no statistical or model-based language detection. Inline language
changes preserve source order and form boundaries where incompatible policies
must not be merged. Language is preparation context, not a new prepared-segment
or `NarrationSegmentV1` field. A later TTS requirement for per-segment language
must be decided and versioned by the owning later milestone.

### Add no production dependency or capability

The first profile uses repository-owned deterministic scanners, existing
Unicode-aware JavaScript primitives, the immutable semantic model, and shared
locator contracts. Task 1.1 approves no new production dependency.

`Intl.Segmenter` is not a production segmentation authority because its runtime
data can vary and it does not preserve the required source-transform mapping.
It may be used only in a non-authoritative test-only investigation that cannot
change production output.

Adding a segmentation, language-detection, tokenizer, pronunciation, Unicode,
or model-preprocessing dependency requires an amendment or superseding ADR
that documents the unmet requirement, deterministic Node/WebView behavior,
source-range support, Spanish evidence, exact version and release pinning,
license, package size, transitive graph, install scripts, runtime capabilities,
maintenance, alternatives, manifest/lock changes, and dependency-inventory
update.

### Keep later milestones outside this boundary

This decision does not select or implement:

- a TTS engine, voice, tokenizer, phoneme set, SSML dialect, pronunciation
  dictionary, or model-specific preprocessor;
- session, generation, segment, or request identity;
- desktop-to-TTS transport, framing, streaming, or backpressure;
- model loading, inference, cancellation acknowledgment, or hardware support;
- generated audio, audio format, buffering, scheduling, playback, or speed
  control;
- spoken timing, highlighting, automatic following, or manual-navigation
  conflict behavior; or
- narration persistence, telemetry, export, or network transmission.

Those decisions remain with roadmap Milestones 6 through 9.

## Consequences

- Milestone 5 implementation has one explicit public owner and one bounded
  package-local contract.
- The visual reader cannot accidentally become the normalization or
  source-range authority.
- Stable containing-segment disclosure supports later play/seek choices without
  making segmentation depend on UI policy.
- One active operation simplifies cancellation, retained-memory bounds, close,
  and deterministic tests, at the cost of requiring callers to serialize
  preparation requests.
- A separate raster-read slot lets visual images continue loading while
  in-memory narration preparation runs without granting preparation archive
  access.
- Closed content-free outcomes make cancellation, misuse, limits, and internal
  failure observable without leaking publication or narration text.
- Keeping the profile package-local avoids a premature cross-process schema,
  but future model-specific requirements may require a new explicit protocol or
  shared-contract decision.
- Task 1.3's accepted limits close the pre-production policy gate. Tasks
  2.1-2.3 subsequently implement pure source traversal, source-span token
  mapping, and bounded source-window lifecycle enforcement. Tasks 3.1-3.4 add
  deterministic source-mapped whitespace/hyphenation and punctuation/symbol
  plus lexical/numeric normalization slices, including production enforcement
  of the accepted per-source expansion and parser-lookahead ceilings. Task 4.1
  adds deterministic source-offset sentence/dialogue/clause/protected-token
  scanning and the protected-token ceiling. Task 4.2 adds stable block-local
  semantic packing, per-segment output enforcement, and the 17-entry retained
  lookahead ceiling. Task 4.3 adds fixed oversized-token behavior, retained
  scan/text ceilings, deterministic work measurements, cooperative yields, and
  cancellation before result publication. Task 4.4 adds canonical block-local
  prepared ranges, exact source continuation, deep immutability, and
  compatibility evidence for the unchanged shared narration-segment contract;
  Task 5.1 adds the accepted public operation, containing-segment relation,
  final batch continuation, independent batch ceilings, closed result mapping,
  and publication-owned cancellation/concurrency/close integration. The
  Task 5.2 adds the broader public integration matrix. Task 5.3 caps internal
  prepared output by remaining aggregate retention capacity and adds
  numeric-only exact-bound, repeated-batch, cancellation, close, and privacy
  evidence without a wall-clock or hardware gate. Task 6.1 reconciles this
  implemented boundary across current documentation while preserving later
  TTS, audio, highlighting, and synchronization ownership.

## Alternatives considered

### Put narration preparation in the desktop application

Rejected. The desktop owns rendering and interaction, not semantic source
accounting. It would need to duplicate EPUB traversal, locator indexing, and
range construction or derive positions from the DOM, weakening ADR-0003,
ADR-0007, and ADR-0008.

### Put normalization and segmentation in the future Python TTS service

Rejected for the general boundary. Model adapters may later perform
model-specific preprocessing, but the source semantic model and locator index
do not cross that process boundary. Moving general preparation there would
either lose stable source mapping or require sending a larger document model
and policy surface across an unselected protocol.

### Add prepared segments to the shared serialized schema now

Rejected. Prepared segments are package-local in-memory values. The existing
`NarrationSegmentV1` already represents the later process-facing text/range
pair with required session and generation identity. Adding optional preparation
fields or another schema without a consumer would violate ADR-0006.

### Prepare a whole chapter or publication

Rejected. Whole-document preparation increases startup work, retained sensitive
text, cancellation latency, and memory use. A bounded batch plus canonical
continuation satisfies progressive local narration.

### Allow concurrent preparation calls

Rejected for the first profile. Immutable source data makes concurrency
possible in principle, but it adds duplicate retained text, scheduling,
cancellation, and close complexity without an established throughput or
latency benefit.

### Clip the first segment to an interior requested locator

Rejected. Clipping would create a request-specific segment and make
segmentation, text, and source ranges depend on seek position. Returning the
complete containing stable segment plus an explicit relation preserves both
stable preparation and later interaction choice.

### Skip the containing segment automatically

Rejected. Automatic skipping would make the package decide Milestone 9's
play/seek policy and would prevent a later coordinator from choosing the
containing segment without an earlier request.

### Throw exceptions from the public preparation operation

Rejected. A frozen closed result union makes expected cancellation, invalid
input, concurrency, and limits explicit and maps unexpected errors to a
content-free branch. Raw exceptions must not cross with sensitive parser or
source context.

### Use `Intl.Segmenter` or add a segmentation library

Rejected as the initial production authority. Neither option currently proves
the required deterministic runtime behavior, conservative Spanish policy,
bounded lookahead, or source-transform mapping. Repository-owned scanners can
meet the accepted first-profile requirements without a new dependency.
