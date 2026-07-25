# Narration preparation limits v1

## Status

Accepted by Milestone 5 Task 1.3 as a test-only policy and deterministic
evidence gate. Tasks 2.1-2.2 implement exhaustive package-internal semantic
source traversal and source-span tokens. Task 2.3 production-enforces the
source-window, traversal-depth, retained-token/event, cancellation-checkpoint,
and deterministic-yield subset. Tasks 3.1-3.4 retain exactly one normalized
text or omission unit per admitted source token. Tasks 3.2-3.3 enforce in
production the ceiling of 16 output code points per source code point for
closed Spanish symbol and lexical/numeric rules, and Task 3.3 enforces the
128-code-point parser-lookahead ceiling, and Task 3.4 validates the composed
normalized stream and content-free failures. Task 4.1 production-enforces the
256-narration-code-point protected-token ceiling through a two-pass,
4,096-unit-bounded scanner. Tasks 4.2-4.3 production-enforce the per-segment
source-code-point, narration-code-point, UTF-8-byte, and sentence dimensions
plus the 17-entry retained-segment, 8,832-code-point retained narration,
26,624-byte retained narration, 4,096-unit temporary-index, work-checkpoint,
yield, and cancellation ceilings through a package-internal block-local
packer. Batch totals, prepared locator ranges, and
`OpenedPublication.prepareNarration` remain unimplemented.

The exact test authority is
[`packages/epub/test-support/narration-preparation-limits.ts`](../../packages/epub/test-support/narration-preparation-limits.ts).
It adds no production export, dependency, shared schema, desktop capability,
TTS behavior, audio behavior, persistence, or telemetry.

## Interpretation

`narration-v1` has a target and hard maximum for every admitted size, work, and
retention dimension:

- a target guides natural boundary selection, packing, checkpoint cadence, and
  deterministic yield cadence;
- exceeding a target is allowed when a stronger semantic boundary or unusual
  but admitted input requires it;
- an exact hard maximum is allowed;
- the first max-plus-one observation produces the fixed content-free
  `resource-limit-exceeded` result and no partial sensitive result; and
- caller-requested `maximumSegments` is valid only from 1 through 16 and never
  changes stable segmentation.

All counts are nonnegative safe integers. Code-point counts iterate Unicode
scalar values; UTF-8 byte counts use encoded bytes. JavaScript UTF-16
`String.length`, wall-clock timing, model tokens, and estimated audio duration
are not admission authorities.

## Accepted `narration-v1` profile

| Dimension                             | Target | Hard maximum | Unit                                     |
| ------------------------------------- | -----: | -----------: | ---------------------------------------- |
| Source inspected per request          |  8,192 |       16,384 | Unicode code points                      |
| Segments returned per batch           |      8 |           16 | segments                                 |
| Source span per segment               |    384 |          768 | Unicode code points                      |
| Narration text per segment            |    320 |          640 | Unicode code points                      |
| Narration text per segment            |  1,024 |        2,048 | UTF-8 bytes                              |
| Sentences per segment                 |      3 |            8 | sentences                                |
| Narration text per batch              |  2,560 |        8,192 | Unicode code points                      |
| Narration text per batch              |  8,192 |       24,576 | UTF-8 bytes                              |
| Sentences per batch                   |     24 |           64 | sentences                                |
| Protected token                       |     64 |          256 | Unicode code points                      |
| Parser lookahead                      |     32 |          128 | Unicode code points                      |
| Narration traversal depth             |     32 |          128 | levels                                   |
| Normalization expansion               |      8 |           16 | output code points per source code point |
| Work between cancellation checkpoints |    512 |        1,024 | work units                               |
| Work between deterministic yields     |  4,096 |        8,192 | work units                               |
| Retained segment entries              |      9 |           17 | segments                                 |
| Retained source window                |  8,192 |       16,384 | Unicode code points                      |
| Retained narration text               |  2,880 |        8,832 | Unicode code points                      |
| Retained narration text               |  9,216 |       26,624 | UTF-8 bytes                              |
| Retained token entries                |  1,024 |        4,096 | tokens                                   |

The batch code-point, byte, and sentence ceilings are independently lower than
the product of every per-segment ceiling. A batch therefore cannot retain 16
simultaneously worst-case segments. Retained output permits one additional
hard-sized lookahead segment so stable segmentation can remain independent of
the caller's requested batch size.

The 128-level traversal ceiling matches the already accepted maximum XML
element depth admitted by ADR-0007. Narration traversal must still be iterative
or otherwise avoid call-stack growth proportional to attacker-controlled text
length.

## Structural rationale

The 320-code-point target can hold several ordinary sentences without forcing
short headings or dialogue turns to merge. The 640-code-point hard maximum
admits the synthetic 500-code-point long sentence while still forcing an
eventual clause, token, or Unicode-safe hard split. The 768-code-point source
span leaves room for narration text to shrink or expand without making source
and output limits identical.

The independent 2,048-byte segment and 24,576-byte batch ceilings prevent
multibyte Unicode from inheriting an ASCII-sized memory assumption. The target
of eight and maximum of 16 segments provide a finite caller-controlled batch
without making stable segmentation depend on batch size. The separate batch
totals prevent every retained segment from simultaneously reaching every
per-segment maximum.

A 256-code-point protected token and 128-code-point scanner lookahead cover the
accepted abbreviation, number, date, time, currency, percentage, and symbol
forms while containing adversarial uninterrupted tokens and malformed
punctuation. A 16× expansion ceiling permits accepted lexical expansions but
cannot bypass per-segment or per-batch output limits.

Task 4.1 enforces the protected-token ceiling over contiguous normalized output
carrying the same non-splittable protection set. Exact 256-code-point code
content passes; 257 produces the fixed content-free resource-limit failure.
Boundary scanning visits each normalized unit exactly twice and retains no
unbounded lookup or locale-derived state.

Task 4.2 uses independent prefix counts for source code points, narration code
points, UTF-8 bytes, and sentence endings. It chooses boundaries in documented
semantic order, retains at most 17 segments, admits each exact per-segment hard
maximum, and never uses UTF-16 string length as a size authority. A top-level
`***` or U+2042 paragraph is the only recognized scene-break form and emits no
spoken output.

Task 4.3 bounds normalized-unit, boundary, protected-token, prefix, safe-boundary,
segment, retained-code-point, and retained-byte collections before or while
building them. An unprotected token that exceeds a segment maximum is split at
the latest legal source-mapped Unicode boundary admitted by every independent
hard dimension. A protected token already fails at 257 code points; a
combining sequence or one source-mapped expansion that cannot fit without an
illegal interior split produces the same fixed content-free resource-limit
outcome. No empty or reversed range is published.

The 16,384-code-point source ceiling is deliberately much smaller than the
64-MiB publication text budget. One request therefore cannot copy or prepare a
whole large publication, while continuation can process it through repeated
bounded batches.

## Work and cancellation accounting

A work unit is charged for each source code point inspected, narration code
point emitted or copied, structural event consumed, scanner state transition,
or retained token/segment append. Implementations may count more finely but may
not combine multiple such observations into one unit to weaken the ceiling.

Production implementation must:

- check linked caller/publication cancellation before work;
- check it whenever accumulated work reaches the 512-unit target and never
  later than 1,024 units;
- use an injected framework-independent scheduler at the 4,096-unit yield
  target and never perform more than 8,192 units without yielding;
- check cancellation immediately before and after each yield and before result
  publication; and
- discard the complete partial batch on cancellation or any hard-limit
  failure.

These are deterministic structural gates, not claims about milliseconds or a
particular processor.

Tasks 2.3 and 4.3 implement these gates through the shared package-internal
`narration-work-controller.ts`. Task 2.3 uses it in
[`narration-source-window.ts`](../../packages/epub/src/narration/narration-source-window.ts).
The operation retains at most 4,096 source tokens and 4,096 source events,
publishes the final token end as its canonical continuation, charges source
inspection, scanner/structural transitions, and retained appends separately,
and discards all partial events on cancellation or failure. Task 4.3 uses the
same controller while validating scans, building bounded prefix/safety indexes,
selecting fallbacks, and copying retained narration text; cancellation before
or after an injected yield publishes no packed block. The production policy
constants are package-internal; Task 5.1 still owns the final public
request/result surface and remaining profile enforcement.

## Synthetic evidence

The test-only collector rebuilds representative headings, short and long
paragraphs, dialogue, punctuation-heavy Spanish, one unusually long sentence,
one oversized token, exact/max-plus-one batches, and multibyte Unicode
pressure. It releases source/narration strings after deriving only numeric
measurements. A separate helper compares independently rebuilt narration bytes
and source-range counts internally and returns only a boolean.

| Evidence shape             | Source code points | Segments | Largest segment code points / bytes | Sentences | Expected result                                        |
| -------------------------- | -----------------: | -------: | ----------------------------------: | --------: | ------------------------------------------------------ |
| Representative heading     |                 10 |        1 |                             14 / 15 |         1 | within target                                          |
| Short paragraph            |                 10 |        1 |                             10 / 10 |         1 | within target                                          |
| Long paragraph             |                113 |        1 |                           113 / 113 |         6 | within hard limits                                     |
| Dialogue                   |                 28 |        2 |                             16 / 19 |         2 | within target                                          |
| Punctuation-heavy Spanish  |                 76 |        2 |                             38 / 52 |        12 | within hard limits                                     |
| Unusually long sentence    |                500 |        1 |                           500 / 500 |         1 | within hard limits                                     |
| Oversized protected token  |                258 |        1 |                           258 / 258 |         1 | `resource-limit-exceeded` at 257 protected code points |
| Exact 16-segment batch     |              6,400 |       16 |                           400 / 400 |        16 | within hard limits                                     |
| 17-segment batch           |                 68 |       17 |                               4 / 4 |        17 | `resource-limit-exceeded`                              |
| Multibyte Unicode pressure |                300 |        1 |                         300 / 1,200 |         1 | within hard limits                                     |

Focused tests prove every exact target and hard maximum passes, every
max-plus-one value returns the same frozen content-free result, repeated
evidence runs produce identical narration bytes and source ranges, malformed
measurements are not coerced, and a 300-code-point astral sample has 600 UTF-16
code units and 1,200 UTF-8 bytes without changing its code-point admission.

## Deferred decisions

Milestone 6 may add a model-specific profile only from explicit local TTS
evidence and through a new versioned decision. It must not silently change
`narration-v1`, locator-range semantics, privacy rules, or the distinction
between narration text size and playable-audio duration.
