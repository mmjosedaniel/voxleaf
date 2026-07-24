# Narration normalization v1 corpus

## Status

Accepted by Milestone 5 Task 1.2 as a test-only policy and fixture gate.
Production narration source projection, normalization, segmentation, and
`OpenedPublication.prepareNarration` remain unimplemented. Task 1.3 must still
accept exact resource and chunk limits before production rules begin.

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
| --- | --- | --- |
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

## Deferred work

This corpus does not implement an algorithm, define locator/source-span
projection, select numeric hard limits, select a TTS engine, or establish
model-specific preprocessing. Later Milestone 5 tasks must implement the table
without changing displayed publication semantics. Any proposed corpus change
must update the authoritative fixture, its integrity tests, this summary, and
the active plan before production expectations change.
