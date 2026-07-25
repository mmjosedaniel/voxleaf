# Narration normalization v1 corpus

## Status

Accepted by Milestone 5 Task 1.2 as a test-only policy and fixture gate.
Tasks 2.1-2.3 implement exhaustive package-internal semantic source traversal,
Unicode-code-point source-span tokens, and bounded canonical source windows
with cancellation/continuation. Tasks 3.1-3.4 now implement the table's
whitespace, semantic-line-break, soft-hyphen, conservative line-end
hyphenation, punctuation, quotation, ellipsis, allowlisted Spanish symbol,
abbreviation, number, date, time, currency, percentage, and language-context
slices as a pure source-mapped production normalizer. Task 3.4 additionally
enforces the composed-stream invariant and privacy gate. Task 4.1 consumes
those normalized units through a deterministic source-offset sentence,
dialogue-turn, clause, and protected-token scanner. Tasks 4.2-4.3 pack each
scanned block into immutable cancellable bounded source-offset segments,
consume the accepted top-level scene-break forms without speech, and harden
oversized-token/indivisible-sequence behavior. Task 4.4 validates the complete
packed block and emits immutable canonical locator-linked prepared segments.
Task 5.1 now exposes the bounded pipeline through
`OpenedPublication.prepareNarration`.
Task 1.3 has accepted the separate
[`narration-v1` resource profile](narration-preparation-limits-v1.md), so
Milestone 1's policy, corpus, and bounds gates are closed before production
rules begin.

The exact authoritative table is
[`packages/epub/test-support/narration-normalization-corpus.ts`](../../packages/epub/test-support/narration-normalization-corpus.ts).
It contains 62 short repository-authored cases. Every source and expected text
value is synthetic and marked sensitive. This document summarizes the policy;
it does not duplicate or override exact fixture strings.

## Decision-table shape

Every case records:

- a stable content-free case identifier and normalization category;
- heading or paragraph source semantics, including text, code, and explicit
  semantic-line-break units;
- caller default language plus the expected effective `und` or `es` policy for
  every unit;
- exact expected narration text;
- whether the action preserves, removes, or transforms source text;
- whether an ambiguous or unsupported form must remain unchanged; and
- protected boundaries that later sentence and segment scanners may not split
  incorrectly.

The table is test-only. It is not exported from `@voxleaf/epub`, does not add a
runtime schema, and must not be consulted through filesystem or network IO.

## Accepted conservative policy

| Category | Accepted behavior | Preserve rather than guess |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Whitespace | Collapse ordinary and nonbreaking spacing; remove approved zero-width formatting marks. | Code-span spacing remains exact. |
| Semantic line breaks | Convert an in-block line break to one speech boundary while retaining its source position for later mapping. | Paragraph and addressable-block boundaries remain structural, not whitespace. |
| Hyphenation | Remove explicit soft hyphens and join the accepted Spanish line-end split. | Genuine compounds and ambiguous neutral splits retain the hyphen. |
| Quotations and punctuation | Preserve straight/typographic quotations, Spanish opening marks, dialogue dashes, repeated marks, and ellipses while protecting their boundary roles. | Malformed or unbalanced punctuation remains unchanged. |
| Abbreviations and initials | Expand the accepted Spanish honorific, common, and multi-period allowlist. | Initials and ambiguous abbreviations remain unchanged and period-protected. |
| Numbers and ordinals | Expand accepted Spanish cardinal, signed, ordinal, decimal, thousands, and explicit year-context forms without floating-point conversion. | Neutral separator forms and unsupported mixed-separator forms remain unchanged. |
| Dates and times | Expand accepted valid Spanish slash/ISO dates and 24-hour times. | Invalid values and neutral ambiguous forms remain unchanged. |
| Currency and percentages | Expand accepted euro, explicit US-dollar, and Spanish percentage forms. | An unqualified dollar symbol remains ambiguous and unchanged. |
| Symbols | Expand only the accepted Spanish ampersand and Celsius forms. | Ambiguous slash and unsupported at-sign forms remain unchanged. |
| Code | Preserve exact code text and spacing; do not apply prose numeric or punctuation rewriting. | The whole code span remains boundary-protected. |
| Unicode | Preserve astral code points and decomposed combining sequences exactly. | No transliteration or normalization-form guess is made. |
| Language | Use caller default when semantic language is absent; an ASCII-case-insensitive primary `es` subtag selects Spanish; another or malformed explicit tag selects neutral. | Adjacent incompatible language policies retain a boundary and source order. |
| Foreign names | Preserve spelling and case. | No transliteration, case rewriting, or invented pronunciation. |

`und` performs only accepted language-neutral transformations. Spanish lexical
expansion occurs only under effective `es`. The corpus does not perform
language detection.

## Integrity and privacy

[`narration-normalization-corpus.test.ts`](../../packages/epub/src/testing/narration-normalization-corpus.test.ts)
proves that:

- case identifiers and complete source/context signatures are unique;
- every required category and language/preservation edge is represented;
- the corpus, entries, source units, expectations, and protection arrays are
  frozen;
- validation does not mutate source or expected values; and
- malformed corpus entries produce only closed content-free codes.

Tests may compare the short exact strings because transformation is the
behavior under review. They must not use broad snapshots, place prose in test
names, or deliberately print source/expected values on failure.

[`narration-normalizer.test.ts`](../../packages/epub/src/narration/narration-normalizer.test.ts)
now drives every Task 3.1-3.3 case through production source projection,
source tokens, and normalization. It proves exact neutral/Spanish output,
second-pass text idempotence, one retained origin unit per source token, legal
locator endpoints after collapse/removal/joining/expansion, code and Unicode
preservation, source/output immutability, semantic-line-break and punctuation
boundary metadata, the closed Spanish symbol and lexical/numeric allowlists,
exact retained-token/parser-lookahead/expansion ceilings, bounded maximum
repeated punctuation/unbalanced quotation handling, and fixed content-free
invariant failures.

## Implementation and deferred work

The corpus remains test-only and does not act as a production lookup table.
[`narration-normalizer.ts`](../../packages/epub/src/narration/narration-normalizer.ts)
implements Tasks 3.1-3.4's accepted categories and composed-stream postcondition
with repository-owned bounded
scanners, and
[`spanish-normalization.ts`](../../packages/epub/src/narration/spanish-normalization.ts)
contains the closed Spanish line-end, context-safe symbol, abbreviation, and
numeric-form allowlists.
Punctuation remains text while frozen roles and content-free boundary
protections distinguish quotations, dialogue dashes, ellipses, terminal marks,
malformed openings, code spans, and symbol tokens for
[`narration-boundary-scanner.ts`](../../packages/epub/src/narration/narration-boundary-scanner.ts).
Only a whitespace-delimited Spanish ampersand and the exact accepted Spanish
Celsius form expand; neutral, code, compact ampersand, slash, at-sign, and
unsupported temperature forms remain unchanged. Every source token remains
represented by a nonempty normalized text unit or typed omission carrying its
original block-local span. Task 3.3 additionally expands only the accepted
effective-Spanish abbreviations, cardinals, signed values, ordinals,
decimal/thousands forms, dates, time, currencies, and percentages; it protects
accepted and preserved token boundaries, leaves neutral, malformed,
ambiguous, unsupported, code, and foreign-name text unchanged, and never uses
floating-point conversion. The scanner rejects numeric lookahead above 128
code points, and no emitted unit exceeds the accepted hard maximum of 16 output
code points per source code point. Task 4.1 records immutable source-offset
boundaries, collapses repeated terminal marks, carries sentence endings through
closing punctuation, applies deterministic block-final fallback, and protects
accepted lexical/code/ellipsis spans without reparsing an untracked string.
Tasks 4.2-4.3 then pack those mapped units by semantic priority under
independent source/code-point/UTF-8-byte/sentence/retention/work ceilings
without consulting this test-only table at runtime. Task 4.4 maps packed
source offsets through the existing package/shared locator authority and
revalidates text and aggregate measurements before publishing frozen prepared
output. The corpus does not select a TTS engine or model-specific
preprocessing. Task 5.1 exposes bounded public batches without changing
displayed publication semantics. Any proposed corpus change must update the
authoritative fixture, its integrity tests, this summary, and the completed
Milestone 5 authority or a new active plan before production expectations
change.
