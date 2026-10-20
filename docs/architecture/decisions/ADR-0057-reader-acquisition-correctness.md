# ADR-0057: Resolve bounded reader and acquisition deadlocks

## Status

Accepted and implemented, 2026-10-20. Host validation and independent acceptance
are recorded in [the completed plan](../../plans/completed/reader-narration-acquisition-bugfixes.md).
This decision adds behavior without rewriting frozen historical evidence.

## Decisions

### Capacity escape

When a positive contiguous FIFO is below the startup/refill target and no
producer can progress because reservation capacity is exhausted, expose
**Play available audio**. The scheduler validates this action. It starts the
same generation, preserves FIFO order and the requested target, and does not
discard audio or raise limits. It is unavailable for voluntary Pause, zero
audio, active work, invalidation, failure, or ordinary threshold arrival.

### Narration traversal v2

Cold interior starts reconstruct stable segmentation from the containing
block's beginning; jumping directly into arbitrary prose would change ranges.
Warm continuation at a previously published boundary uses one
publication-owned checkpoint keyed by publication identity, preparation
profile, language, and canonical continuation. No text or segment cache is
retained between requests.

The implementation must walk source windows forward using resumable structural
and inline positions (container child/item indices, and UTF-16 positions
alongside Unicode offsets).
It may replay only the last bounded window to reconstruct a checkpoint at a
returned stable boundary. A cold seek never restarts each window at block
offset zero or rewalk the publication's preceding blocks. Each cursor has an
active state and a rewind checkpoint, each with at most 129 depth-bounded
frames. Structural frames replace the former stack of all pending siblings;
one indexed frame represents each ancestor container regardless of sibling
count. The structural checkpoint is captured before the requested block and
the inline checkpoint at the first projected leaf, so neither advances past
the stable boundary returned to the caller. Frames reference admitted immutable
semantics; they do not copy text. Existing 4,096 source-token/event, 17 prepared
entry, 8,832 narration-code-point and 26,624 narration-byte retention limits
remain unchanged. Close, failed/cancelled work and incompatible context clear
the checkpoint.

This additive `narration-traversal-v2` authority supersedes the old 16,384
**whole-public-request source inspection** ceiling for public preparation.
It preserves the 16,384 per-window inspection ceiling, all normalization and
segmentation profiles, return limits, and shared wire schemas. For an admitted
publication with S source positions and B semantic blocks, the complete
request's source-inspection ceiling is `4*S + 16,384`. S includes text,
line-break and raster-placeholder positions and is derived from admitted
located-block lengths, not an untrusted declared string length. It is bounded
by the existing ingestion text/node limits. Work to derive this allowance is
counted. Every skipped/replayed source position is charged; no hidden reset
starts another public allowance.

Complete work accounting includes traversal transitions, source inspections,
checkpoint reconstruction, normalization/packing and output copying. The
whole-operation charged-work ceiling is `1,048,576 * (4*S + 16,384 + B)`. This is a
conservative safety ceiling, not a performance target: forward reconstruction
must be linear in traversed input plus bounded window replay and existing
bounded packing work. Each source window still yields/checks cancellation at
the existing 4,096/512 targets and 8,192/1,024 maxima. Measurements must expose
actual source inspections and conservative charged work separately rather than
presenting the ceiling as measured work. Cooperative traversal/packing
observations are counted individually. Existing bounded synchronous
normalization/scanning/finalization is charged 4,096 units per processed source
token, including each replay; this is an upper envelope, not a claimed count
of CPU instructions. The larger whole-operation factor accounts for repeated
bounded packing of one window, which the initial 4,096 factor omitted.
No implementation is accepted
until both the cold path and sequential continuation demonstrate these bounds,
stable containing segments and batch-size independence.

This changes the package-local work policy, not narration wording or a shared
serialized contract. Existing callers keep their request shape and receive
the same stable ranges; previously rejected admitted deep starts can succeed.
Historical v1 resource tests remain historical authority; new v2 tests must
state the additive work allowance explicitly.

### Unavailable chapter

Reader settlement distinguishes successful placement from an unavailable
chapter. The fallback retains the presented chapter for navigation while
preserving the last valid locator and persisted reading position. Failure
ends obsolete play intent and prevents narration start on that unavailable
presentation. A later valid placement restores controls but does not restart
audio automatically.

### Acquisition and playback

Lazy EPUB resources use a fresh complete read budget, not an archive-lifetime
traffic quota. Initial inventory still admits the sum of exact declarations
and ratios. Every reread checks observed bytes against its exact entry
declaration, output/entry/aggregate-per-operation limits, CRC, compression ratio,
signature, deadline and cancellation. One read is active and no byte cache or
unique-entry ledger is added. This supersedes only ADR-0056's lifetime
resource-traffic accounting, preserving the independent ingestion budget.

Cancellation must reach final verification and bounded hash loops. A native
operation lock serializes accepting cancellation with committing the verified
candidate; cancellation before that point wins and preserves the installed
tree. Once commit wins, late cancellation reports the completed outcome.
The installed-runtime mutation lock remains separate so polling/cancellation
do not wait for multi-gigabyte verification.

Every completed acquisition worker releases active ownership, including when
cleanup fails. Failed cleanup is a fixed terminal failure with no active
cancellation handle; retry/removal may recover only within managed roots.

Pending asynchronous rate preparation is owned playback state. Pause records
intent before preparation resolves; successful completion cannot start sound
until Resume. Invalidation rejects late work and releases its resources.

## Preserved boundaries

EPUB contents and inference remain local; generated audio stays ephemeral.
No dependency, model, network source, wire schema, queue limit, PCM limit,
archive validation rule or atomic package replacement guarantee is relaxed.
